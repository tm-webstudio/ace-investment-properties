/**
 * Backfill Local Authority Script
 *
 * One-time script to fill in missing or generic local_authority values
 * using the postcodes.io API.
 *
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/backfill-local-authority.js
 *
 * Options:
 *   --dry-run   Preview changes without writing to DB
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env.local from project root
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const isDryRun = process.argv.includes('--dry-run')

async function lookupPostcode(postcode) {
  const encoded = encodeURIComponent(postcode.trim())
  const res = await fetch(`https://api.postcodes.io/postcodes/${encoded}`)
  if (!res.ok) return null
  const data = await res.json()
  if (data.status !== 200 || !data.result) return null
  return data.result.admin_district || null
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function main() {
  console.log(`Backfill Local Authority${isDryRun ? ' (DRY RUN)' : ''}`)
  console.log('='.repeat(50))

  // Fetch properties needing backfill
  const { data: properties, error } = await supabase
    .from('properties')
    .select('id, postcode, city, local_authority, address')
    .or('local_authority.is.null,local_authority.eq.London,local_authority.eq.,local_authority.eq.Greater London')

  if (error) {
    console.error('Error fetching properties:', error.message)
    process.exit(1)
  }

  console.log(`Found ${properties.length} properties to process\n`)

  let updated = 0
  let skipped = 0
  let failed = 0

  for (const prop of properties) {
    const label = `${prop.address || 'Unknown'}, ${prop.city || ''} (${prop.postcode || 'no postcode'})`

    if (!prop.postcode) {
      console.log(`SKIP: ${label} — no postcode`)
      skipped++
      continue
    }

    const district = await lookupPostcode(prop.postcode)

    if (!district) {
      console.log(`FAIL: ${label} — postcode lookup failed`)
      failed++
      await sleep(200)
      continue
    }

    console.log(`${isDryRun ? 'WOULD UPDATE' : 'UPDATE'}: ${label}`)
    console.log(`  local_authority: "${prop.local_authority || 'NULL'}" → "${district}"`)

    if (!isDryRun) {
      const { error: updateError } = await supabase
        .from('properties')
        .update({ local_authority: district })
        .eq('id', prop.id)

      if (updateError) {
        console.log(`  ERROR: ${updateError.message}`)
        failed++
      } else {
        updated++
      }
    } else {
      updated++
    }

    // Rate limit: ~5 requests per second
    await sleep(200)
  }

  console.log('\n' + '='.repeat(50))
  console.log(`Done! Updated: ${updated}, Skipped: ${skipped}, Failed: ${failed}`)
}

main().catch(err => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
