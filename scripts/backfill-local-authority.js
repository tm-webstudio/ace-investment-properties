/**
 * Backfill Local Authority Script
 *
 * Fixes properties with bad location data:
 * - city/local_authority = "Other" → lookup via postcodes.io
 * - Incorrect local_authority values (e.g. "Brighton", "Essex") → correct via postcodes.io
 * - Trailing whitespace in city → TRIM
 * - local_authority = null/empty/London/Greater London → lookup via postcodes.io
 *
 * Usage:
 *   node scripts/backfill-local-authority.js
 *   node scripts/backfill-local-authority.js --dry-run
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

// Map admin_district → city name for "Other" city derivation
// Based on uk-locations.ts hierarchy
const districtToCityMap = {
  // London boroughs
  'barking and dagenham': 'London', 'barnet': 'London', 'bexley': 'London',
  'brent': 'London', 'bromley': 'London', 'camden': 'London', 'croydon': 'London',
  'ealing': 'London', 'enfield': 'London', 'greenwich': 'London', 'hackney': 'London',
  'hammersmith and fulham': 'London', 'haringey': 'London', 'harrow': 'London',
  'havering': 'London', 'hillingdon': 'London', 'hounslow': 'London',
  'islington': 'London', 'kensington and chelsea': 'London',
  'kingston upon thames': 'London', 'lambeth': 'London', 'lewisham': 'London',
  'merton': 'London', 'newham': 'London', 'redbridge': 'London',
  'richmond upon thames': 'London', 'southwark': 'London', 'sutton': 'London',
  'tower hamlets': 'London', 'waltham forest': 'London', 'wandsworth': 'London',
  'westminster': 'London', 'city of london': 'London',
  // Greater Manchester
  'manchester': 'Manchester', 'salford': 'Manchester', 'bolton': 'Manchester',
  'bury': 'Manchester', 'oldham': 'Manchester', 'rochdale': 'Manchester',
  'stockport': 'Manchester', 'tameside': 'Manchester', 'trafford': 'Manchester',
  'wigan': 'Manchester',
  // West Midlands
  'birmingham': 'Birmingham', 'coventry': 'Coventry', 'dudley': 'Birmingham',
  'sandwell': 'Birmingham', 'solihull': 'Birmingham', 'walsall': 'Birmingham',
  'wolverhampton': 'Birmingham',
  // Merseyside
  'liverpool': 'Liverpool', 'sefton': 'Liverpool', 'knowsley': 'Liverpool',
  'st helens': 'Liverpool', 'wirral': 'Liverpool',
  // West Yorkshire
  'leeds': 'Leeds', 'bradford': 'Leeds', 'calderdale': 'Leeds',
  'kirklees': 'Leeds', 'wakefield': 'Leeds',
  // Tyne & Wear
  'newcastle upon tyne': 'Newcastle', 'gateshead': 'Newcastle',
  'north tyneside': 'Newcastle', 'south tyneside': 'Newcastle',
  'sunderland': 'Newcastle',
  // Brighton
  'brighton and hove': 'Brighton',
  // Bristol
  'bristol, city of': 'Bristol', 'bristol': 'Bristol',
  // Nottingham
  'nottingham': 'Nottingham',
  // Leicester
  'leicester': 'Leicester',
  // Kent
  'medway': 'Other', 'dover': 'Other', 'canterbury': 'Other',
  'thanet': 'Other', 'folkestone and hythe': 'Other', 'ashford': 'Other',
  'maidstone': 'Other', 'swale': 'Other', 'tonbridge and malling': 'Other',
  'tunbridge wells': 'Other', 'sevenoaks': 'Other', 'dartford': 'Other',
  'gravesham': 'Other',
  // Essex
  'brentwood': 'Other', 'colchester': 'Other', 'southend-on-sea': 'Other',
  'basildon': 'Other', 'castle point': 'Other', 'chelmsford': 'Other',
  'thurrock': 'Other', 'tendring': 'Other',
  // Others
  'luton': 'Other', 'stoke-on-trent': 'Other', 'spelthorne': 'Other',
  'redcar and cleveland': 'Other', 'middlesbrough': 'Other',
  'stockton-on-tees': 'Other', 'aberdeenshire': 'Other', 'aberdeen city': 'Other',
  'buckinghamshire': 'Other', 'wycombe': 'Other',
  'county durham': 'Other', 'northumberland': 'Other',
}

async function lookupPostcode(postcode) {
  // Clean up the postcode: trim, uppercase, ensure space in right place
  let cleaned = postcode.trim().toUpperCase().replace(/\s+/g, '')
  // Insert space before last 3 chars if missing (UK postcode format)
  if (cleaned.length >= 5 && !cleaned.includes(' ')) {
    cleaned = cleaned.slice(0, -3) + ' ' + cleaned.slice(-3)
  }

  const encoded = encodeURIComponent(cleaned)
  try {
    const res = await fetch(`https://api.postcodes.io/postcodes/${encoded}`)
    if (!res.ok) {
      // Try without the space formatting
      const res2 = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode.trim())}`)
      if (!res2.ok) return null
      const data2 = await res2.json()
      if (data2.status !== 200 || !data2.result) return null
      return data2.result
    }
    const data = await res.json()
    if (data.status !== 200 || !data.result) return null
    return data.result
  } catch (err) {
    console.error(`  Error looking up postcode "${postcode}":`, err.message)
    return null
  }
}

function deriveCityFromDistrict(adminDistrict) {
  if (!adminDistrict) return null
  const key = adminDistrict.toLowerCase()
  return districtToCityMap[key] || null
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function main() {
  console.log(`Backfill Local Authority${isDryRun ? ' (DRY RUN)' : ''}`)
  console.log('='.repeat(60))

  // Fetch ALL properties that need fixing
  const { data: properties, error } = await supabase
    .from('properties')
    .select('id, postcode, city, local_authority, address')
    .or([
      'local_authority.is.null',
      'local_authority.eq.',
      'local_authority.eq.London',
      'local_authority.eq.Greater London',
      'local_authority.eq.Other',
      'local_authority.eq.Brighton',
      'local_authority.eq.Essex',
      'local_authority.eq.Hornchurch',
      'local_authority.eq.Kent',
      'local_authority.eq.Newcastle',
      'local_authority.eq.West Midlands',
      'local_authority.eq.Manchester',
      'city.eq.Other',
    ].join(','))

  if (error) {
    console.error('Error fetching properties:', error.message)
    process.exit(1)
  }

  // Also fetch properties with trailing whitespace in city
  const { data: wsProperties, error: wsError } = await supabase
    .from('properties')
    .select('id, postcode, city, local_authority, address')
    .like('city', '% ')

  if (wsError) {
    console.error('Error fetching whitespace properties:', wsError.message)
  }

  // Merge and deduplicate
  const allProperties = [...(properties || [])]
  const existingIds = new Set(allProperties.map(p => p.id))
  for (const p of (wsProperties || [])) {
    if (!existingIds.has(p.id)) {
      allProperties.push(p)
      existingIds.add(p.id)
    }
  }

  console.log(`Found ${allProperties.length} properties to process\n`)

  let updated = 0
  let skipped = 0
  let failed = 0

  for (const prop of allProperties) {
    const label = `${prop.address || 'Unknown'}, ${prop.city || ''} (${prop.postcode || 'no postcode'})`
    console.log(`\nProcessing: ${label}`)
    console.log(`  Current: city="${prop.city}", LA="${prop.local_authority}"`)

    if (!prop.postcode) {
      console.log(`  SKIP: no postcode`)
      skipped++
      continue
    }

    const result = await lookupPostcode(prop.postcode)

    if (!result || !result.admin_district) {
      console.log(`  FAIL: postcode lookup failed for "${prop.postcode}"`)
      failed++
      await sleep(250)
      continue
    }

    const newLA = result.admin_district
    const updateFields = {}

    // Always update local_authority if it's wrong
    const currentLA = (prop.local_authority || '').trim()
    const wrongLAs = ['Other', 'Brighton', 'Essex', 'Hornchurch', 'Kent', 'Newcastle', 'West Midlands', 'Manchester', 'London', 'Greater London', '']
    if (wrongLAs.includes(currentLA) || !currentLA) {
      updateFields.local_authority = newLA
    }

    // Fix city if it's "Other" — derive from admin_district
    if (prop.city === 'Other') {
      const derivedCity = deriveCityFromDistrict(newLA)
      if (derivedCity) {
        updateFields.city = derivedCity
      } else {
        // Use the admin_district as city if we can't derive
        updateFields.city = newLA
      }
    }

    // Fix trailing whitespace in city
    if (prop.city && prop.city !== prop.city.trim()) {
      updateFields.city = (updateFields.city || prop.city).trim()
    }

    if (Object.keys(updateFields).length === 0) {
      console.log(`  SKIP: no changes needed`)
      skipped++
      await sleep(250)
      continue
    }

    console.log(`  ${isDryRun ? 'WOULD UPDATE' : 'UPDATE'}:`)
    for (const [key, value] of Object.entries(updateFields)) {
      const oldVal = prop[key] || 'NULL'
      console.log(`    ${key}: "${oldVal}" → "${value}"`)
    }

    if (!isDryRun) {
      const { error: updateError } = await supabase
        .from('properties')
        .update(updateFields)
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

    // Rate limit: ~4 requests per second
    await sleep(250)
  }

  console.log('\n' + '='.repeat(60))
  console.log(`Done! Updated: ${updated}, Skipped: ${skipped}, Failed: ${failed}`)

  // Summary verification query
  if (!isDryRun) {
    console.log('\nVerification:')
    const { data: remaining } = await supabase
      .from('properties')
      .select('id')
      .or('city.eq.Other,local_authority.eq.Other')
    console.log(`  Properties with city/LA = "Other": ${remaining?.length || 0}`)

    const { data: wsRemaining } = await supabase
      .from('properties')
      .select('id')
      .like('city', '% ')
    console.log(`  Properties with trailing whitespace in city: ${wsRemaining?.length || 0}`)
  }
}

main().catch(err => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
