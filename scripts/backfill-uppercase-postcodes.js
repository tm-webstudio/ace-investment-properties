/**
 * Backfill Uppercase Postcodes Script
 *
 * Fixes Facebook properties where the outward postcode in the address column
 * is sentence-cased (e.g., "Se26") instead of uppercase ("SE26").
 *
 * Usage:
 *   node scripts/backfill-uppercase-postcodes.js
 *   node scripts/backfill-uppercase-postcodes.js --dry-run
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)
const dryRun = process.argv.includes('--dry-run')

async function main() {
  console.log(`\n${dryRun ? '[DRY RUN] ' : ''}Backfilling uppercase postcodes for Facebook properties...\n`)

  const { data: properties, error } = await supabase
    .from('properties')
    .select('id, address, postcode')
    .eq('source', 'facebook')
    .not('postcode', 'is', null)
    .neq('postcode', '')

  if (error) {
    console.error('Failed to fetch properties:', error)
    process.exit(1)
  }

  console.log(`Found ${properties.length} Facebook properties\n`)

  let updated = 0
  let skipped = 0

  for (const prop of properties) {
    const outwardPostcode = prop.postcode.split(' ')[0].toUpperCase()
    const address = prop.address || ''

    let newAddress
    const lastCommaIdx = address.lastIndexOf(', ')
    if (lastCommaIdx >= 0) {
      // Replace the last segment (after final ", ") with uppercase outward postcode
      newAddress = address.substring(0, lastCommaIdx + 2) + outwardPostcode
    } else {
      // Address is just a postcode (e.g., "Se12")
      newAddress = outwardPostcode
    }

    if (newAddress === address) {
      skipped++
      continue
    }

    console.log(`  ${prop.id}: "${address}" → "${newAddress}"`)

    if (!dryRun) {
      const { error: updateError } = await supabase
        .from('properties')
        .update({ address: newAddress })
        .eq('id', prop.id)

      if (updateError) {
        console.error(`    ERROR updating ${prop.id}:`, updateError)
      } else {
        updated++
      }
    } else {
      updated++
    }
  }

  console.log(`\n${dryRun ? '[DRY RUN] ' : ''}Done: ${updated} updated, ${skipped} already correct\n`)
}

main().catch(console.error)
