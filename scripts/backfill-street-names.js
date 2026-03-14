/**
 * Backfill Street Names Script
 *
 * Finds properties where the address is just "City, Postcode" (missing street name)
 * and uses Nominatim (OpenStreetMap) to resolve the street name from the full postcode.
 *
 * Usage:
 *   node scripts/backfill-street-names.js
 *   node scripts/backfill-street-names.js --dry-run
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const dryRun = process.argv.includes('--dry-run')
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const headers = { 'User-Agent': 'ACE Investment Properties (property rental platform)' }

/**
 * Format postcode with proper spacing (e.g., "E78NH" → "E7 8NH")
 */
function formatPostcode(postcode) {
  let formatted = postcode.trim().toUpperCase()
  if (formatted.length > 3 && !formatted.includes(' ')) {
    formatted = formatted.slice(0, -3) + ' ' + formatted.slice(-3)
  }
  return formatted
}

/**
 * Look up street name from postcode using Nominatim (forward + reverse geocode)
 */
async function getStreetFromPostcode(postcode) {
  const formatted = formatPostcode(postcode)
  try {
    // Step 1: Forward geocode postcode to get coordinates
    const fwdRes = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(formatted + ', UK')}&format=json&limit=1&countrycodes=gb`,
      { headers }
    )
    if (!fwdRes.ok) return null
    const fwdData = await fwdRes.json()
    if (!fwdData[0]?.lat || !fwdData[0]?.lon) return null

    // Nominatim rate limit: 1 request per second
    await new Promise(r => setTimeout(r, 1100))

    // Step 2: Reverse geocode coordinates to get street name
    const revRes = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${fwdData[0].lat}&lon=${fwdData[0].lon}&format=json&addressdetails=1`,
      { headers }
    )
    if (!revRes.ok) return null
    const revData = await revRes.json()
    return revData.address?.road || null
  } catch (err) {
    console.error(`  Nominatim error for ${formatted}:`, err.message)
    return null
  }
}

/**
 * Convert string to sentence case
 */
function toSentenceCase(text) {
  if (!text) return ''
  return text
    .toLowerCase()
    .split(' ')
    .map((word, i) => {
      if (i === 0 || !['and', 'of', 'the', 'in', 'on', 'at', 'to', 'a', 'an'].includes(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1)
      }
      return word
    })
    .join(' ')
}

async function main() {
  console.log(`\nBackfill Street Names ${dryRun ? '(DRY RUN)' : ''}\n`)

  // Fetch all properties
  const { data: properties, error } = await supabase
    .from('properties')
    .select('id, address, city, postcode')
    .not('postcode', 'is', null)
    .not('city', 'is', null)

  if (error) {
    console.error('Failed to fetch properties:', error)
    process.exit(1)
  }

  // Find properties where address looks like "City, Postcode" (missing street)
  const needsFix = properties.filter(p => {
    if (!p.address || !p.city || !p.postcode) return false
    const normAddr = p.address.toLowerCase().replace(/[,\s]+/g, ' ').trim()
    const normCity = p.city.toLowerCase().trim()
    const outward = p.postcode.trim().split(' ')[0].toLowerCase()
    return normAddr === `${normCity} ${outward}`
      || normAddr === normCity
      || normAddr === outward
  })

  console.log(`Found ${needsFix.length} properties with missing street names\n`)

  let updated = 0
  let failed = 0

  for (const prop of needsFix) {
    const formatted = formatPostcode(prop.postcode)
    console.log(`[${prop.id}] "${prop.address}" (postcode: ${formatted})`)

    // Skip postcodes that are too short (outward only, no inward part)
    // A valid UK full postcode has a space and is at least 6 chars (e.g., "E7 8NH")
    if (formatted.length < 6 || !formatted.includes(' ')) {
      console.log(`  Skipped - incomplete postcode\n`)
      failed++
      continue
    }

    const street = await getStreetFromPostcode(prop.postcode)

    if (!street || street.length < 3) {
      console.log(`  No street found\n`)
      failed++
      continue
    }

    // Build new address: "Street Name, City, Outward Postcode"
    const outward = formatted.split(' ')[0]
    const newAddress = `${toSentenceCase(street)}, ${toSentenceCase(prop.city)}, ${outward}`

    console.log(`  Street: "${street}" -> New address: "${newAddress}"`)

    if (!dryRun) {
      const { error: updateError } = await supabase
        .from('properties')
        .update({ address: newAddress })
        .eq('id', prop.id)

      if (updateError) {
        console.log(`  Update failed:`, updateError.message)
        failed++
      } else {
        console.log(`  Updated`)
        updated++
      }
    } else {
      console.log(`  (dry run - not updating)`)
      updated++
    }

    // Nominatim rate limit: 1 request per second (already waited inside getStreetFromPostcode)
    await new Promise(r => setTimeout(r, 1100))
    console.log()
  }

  console.log(`\nDone. Updated: ${updated}, Failed: ${failed}, Total: ${needsFix.length}`)
}

main().catch(console.error)
