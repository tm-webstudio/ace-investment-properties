/**
 * Property Matching System
 *
 * Pure scoring functions (no DB calls) + wrapper functions (fetch + score).
 * Weights: Location 50%, Price 30%, Bedrooms 15%, Type 5%
 */

import { localAuthorities, ukRegions } from './uk-locations'
import { createClient } from '@supabase/supabase-js'
import { formatPropertyForCard } from './property-utils'

// ============================================================
// Location data helpers (JS-side equivalent of expand_area_to_authorities)
// ============================================================

/**
 * Expand an area name to its local authorities (JS equivalent of DB function).
 * - If input is a local authority → return [input]
 * - If input is a sub-region (city) → return its authorities
 * - If input is a region → return all authorities under all sub-regions
 * - Otherwise → return [input]
 */
export function expandAreaToAuthorities(area: string): string[] {
  if (!area) return []
  const areaLower = area.trim().toLowerCase()

  // Check if it's a region (e.g. "London", "North West")
  for (const [region, subRegions] of Object.entries(ukRegions)) {
    if (region.toLowerCase() === areaLower) {
      const result = []
      for (const subRegion of subRegions) {
        const auths = localAuthorities[subRegion] || []
        result.push(...auths.map(a => a.toLowerCase()))
      }
      return result
    }
  }

  // Check if it's a sub-region / city (e.g. "East London", "Greater Manchester")
  for (const [subRegion, auths] of Object.entries(localAuthorities)) {
    if (subRegion.toLowerCase() === areaLower) {
      return auths.map(a => a.toLowerCase())
    }
  }

  // It's already a local authority or unknown → return as-is
  return [areaLower]
}

// ============================================================
// Extract flat preferences from nested JSONB
// ============================================================

export function extractPreferences(preferenceData: any) {
  if (!preferenceData) return null

  const locations = preferenceData.locations || []

  // Collect all local authorities from all locations, expanded
  const allLocalAuthorities = new Set<string>()
  const allCities = new Set<string>()

  for (const loc of locations) {
    // localAuthorities is an array of strings for each location entry
    const locAuths = loc.localAuthorities || []
    if (locAuths.length > 0) {
      for (const auth of locAuths) {
        const expanded = expandAreaToAuthorities(auth)
        expanded.forEach(a => allLocalAuthorities.add(a))
      }
    } else if (loc.city) {
      // Empty localAuthorities = investor wants ALL areas in this sub-region/city
      // e.g. city:"South East London", localAuthorities:[] → expand to [bexley, bromley, greenwich, lewisham]
      // e.g. city:"Birmingham", localAuthorities:[] → expand to [birmingham]
      const expanded = expandAreaToAuthorities(loc.city)
      expanded.forEach(a => allLocalAuthorities.add(a))
    }

    if (loc.city) {
      const cityLower = loc.city.trim().toLowerCase()
      allCities.add(cityLower)
    }
  }

  const extracted = {
    localAuthorities: [...allLocalAuthorities],
    cities: [...allCities],
    budgetMin: preferenceData.budget?.min ?? null,
    budgetMax: preferenceData.budget?.max ?? null,
    bedroomsMin: preferenceData.bedrooms?.min ?? null,
    bedroomsMax: preferenceData.bedrooms?.max ?? null,
    propertyTypes: (preferenceData.property_types || []).map((t: string) => t.toLowerCase()),
  }

  console.log('Extracted preferences:', {
    localAuthorities: extracted.localAuthorities.slice(0, 5),
    cities: extracted.cities
  })

  return extracted
}

// ============================================================
// Scoring functions
// ============================================================

/**
 * Location score (weight: 50%)
 * - Local authority match: 100
 * - City match: 80
 * - No match: 0
 */
export function calculateLocationScore(prefs: any, property: any): number {
  if (!prefs || (prefs.localAuthorities.length === 0 && prefs.cities.length === 0)) {
    return 100 // No location preference = everything matches
  }

  const propLA = (property.local_authority || '').trim().toLowerCase()
  const propCity = (property.city || '').trim().toLowerCase()

  // Check local authority match
  // Note: Generic "London" and "Greater London" should not match - only specific boroughs
  if (propLA && propLA !== 'london' && propLA !== 'greater london' && prefs.localAuthorities.includes(propLA)) {
    console.log(`✓ LA match: ${propLA}`)
    return 100
  }

  // Also check if property city is in the expanded authorities list
  // (e.g., property city "Manchester" might be a valid authority name)
  if (propCity && propCity !== 'london' && prefs.localAuthorities.includes(propCity)) {
    console.log(`✓ City in authorities match: ${propCity}`)
    return 100
  }

  // Check city match (investor's city matches property city)
  // IMPORTANT: Generic "London" properties should only match if investor wants ALL of London
  if (propCity && prefs.cities.includes(propCity)) {
    // Special handling for generic "London" city matches
    if (propCity === 'london') {
      // Check if investor has specific London boroughs (from sub-regions like "South East London")
      const londonBoroughs = ['bexley', 'bromley', 'greenwich', 'lewisham', 'barking and dagenham',
        'hackney', 'havering', 'newham', 'redbridge', 'tower hamlets', 'waltham forest', 'camden',
        'city of london', 'islington', 'westminster', 'barnet', 'enfield', 'haringey', 'brent', 'harrow',
        'croydon', 'kingston upon thames', 'lambeth', 'merton', 'richmond upon thames', 'southwark',
        'sutton', 'wandsworth', 'ealing', 'hammersmith and fulham', 'hillingdon', 'hounslow',
        'kensington and chelsea']

      const hasLondonBoroughs = prefs.localAuthorities.some((auth: string) =>
        londonBoroughs.includes(auth)
      )

      // If investor has specific London boroughs, they must match via local_authority, not via city
      // This prevents "West London" investors from matching "East London" properties
      if (hasLondonBoroughs) {
        console.log(`✗ Skipping generic "London" city match - investor has specific boroughs: ${prefs.localAuthorities.filter(a => londonBoroughs.includes(a)).slice(0, 3).join(', ')}...`)
        // Property must match via specific local_authority, not via city
      } else {
        // No London boroughs at all - unlikely but allow city match
        console.log(`✓ City match: ${propCity}`)
        return 80
      }
    } else {
      // Normal city match (not London)
      console.log(`✓ City match: ${propCity}`)
      return 80
    }
  }

  console.log(`✗ No location match for property: LA=${propLA}, City=${propCity}`)
  return 0
}

/**
 * Price score (weight: 30%)
 * Monthly rent is stored in pence, investor budget in pounds.
 */
export function calculatePriceScore(prefs: any, property: any): number {
  if (prefs.budgetMin === null && prefs.budgetMax === null) {
    return 100 // No budget preference
  }

  const rentPounds = (property.monthly_rent || 0) / 100

  const min = prefs.budgetMin ?? 0
  const max = prefs.budgetMax ?? Infinity

  // Within budget
  if (rentPounds >= min && rentPounds <= max) {
    return 100
  }

  // Below budget
  if (rentPounds < min) {
    const diff = (min - rentPounds) / min
    if (diff <= 0.2) return 90
    if (diff <= 0.4) return 70
    return 50
  }

  // Over budget
  if (rentPounds > max) {
    const diff = (rentPounds - max) / max
    if (diff <= 0.1) return 75
    if (diff <= 0.2) return 50
    return 0
  }

  return 0
}

/**
 * Bedroom score (weight: 15%)
 */
export function calculateBedroomScore(prefs: any, property: any): number {
  if (prefs.bedroomsMin === null && prefs.bedroomsMax === null) {
    return 100
  }

  const beds = parseInt(property.bedrooms) || 0
  const min = prefs.bedroomsMin ?? 0
  const max = prefs.bedroomsMax ?? Infinity

  if (beds >= min && beds <= max) return 100

  // ±1 from range
  if (beds === min - 1 || beds === max + 1) return 70

  return 0
}

/**
 * Type score (weight: 5%, relaxed)
 */
const SIMILAR_TYPES: Record<string, string[]> = {
  flat: ['apartment', 'studio'],
  apartment: ['flat', 'studio'],
  studio: ['flat', 'apartment'],
  house: ['terraced', 'semi-detached', 'detached'],
  terraced: ['house', 'semi-detached'],
  'semi-detached': ['house', 'terraced', 'detached'],
  detached: ['house', 'semi-detached'],
}

export function calculateTypeScore(prefs: any, property: any): number {
  if (!prefs.propertyTypes || prefs.propertyTypes.length === 0) {
    return 100
  }

  const propType = (property.property_type || '').toLowerCase()

  if (prefs.propertyTypes.includes(propType)) return 100

  // Check similar types
  const similar = SIMILAR_TYPES[propType] || []
  for (const sim of similar) {
    if (prefs.propertyTypes.includes(sim)) return 80
  }

  return 60 // Relaxed — most types acceptable
}

/**
 * Calculate overall match score (0-100).
 */
export function calculateMatchScore(extractedPrefs: any, property: any) {
  const location = calculateLocationScore(extractedPrefs, property)
  const price = calculatePriceScore(extractedPrefs, property)
  const bedrooms = calculateBedroomScore(extractedPrefs, property)
  const type = calculateTypeScore(extractedPrefs, property)

  const matchScore = Math.round(
    location * 0.50 +
    price * 0.30 +
    bedrooms * 0.15 +
    type * 0.05
  )

  return {
    matchScore,
    matchBreakdown: { location, price, bedrooms, type },
  }
}

// ============================================================
// Wrapper functions (fetch data + score)
// ============================================================

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

/**
 * Get matched properties for an investor.
 * Returns { properties, total, hasPreferences }
 */
export async function getMatchedProperties(investorId: string, { minScore = 60, limit = 20, offset = 0 } = {}) {
  const supabase = getAdminClient()

  // Fetch investor preferences
  const { data: prefs, error: prefsError } = await supabase
    .from('investor_preferences')
    .select('id, preference_data, is_active')
    .eq('investor_id', investorId)
    .eq('is_active', true)
    .single()

  if (prefsError || !prefs) {
    return { properties: [], total: 0, hasPreferences: false, preferences: null }
  }

  const extracted = extractPreferences(prefs.preference_data)
  if (!extracted) {
    return { properties: [], total: 0, hasPreferences: false, preferences: null }
  }

  // Fetch all active properties
  const { data: properties, error: propError } = await supabase
    .from('properties')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (propError || !properties) {
    return { properties: [], total: 0, hasPreferences: true, preferences: prefs.preference_data }
  }

  // Score each property
  const scored = properties
    .map(property => {
      const { matchScore, matchBreakdown } = calculateMatchScore(extracted, property)
      return { property, matchScore, matchBreakdown }
    })
    .filter(item => item.matchScore >= minScore)
    .sort((a, b) => b.matchScore - a.matchScore)

  const total = scored.length
  const paged = scored.slice(offset, offset + limit)

  const formattedProperties = paged.map(item => {
    const formatted = formatPropertyForCard(item.property)
    return {
      ...formatted,
      matchScore: item.matchScore,
      matchBreakdown: item.matchBreakdown,
    }
  })

  return {
    properties: formattedProperties,
    total,
    hasPreferences: true,
    preferences: prefs.preference_data,
  }
}

/**
 * Get matching investors for a property.
 * Returns array of investors with match scores.
 */
export async function getInvestorMatches(propertyId: string, { minScore = 60 } = {}) {
  try {
    const supabase = getAdminClient()

    // Fetch property
    const { data: property, error: propError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single()

    if (propError) {
      console.error('Error fetching property:', propError)
      return []
    }

    if (!property) {
      console.warn('Property not found:', propertyId)
      return []
    }

    console.log('Property found:', property.id, property.city)

    // Fetch all active investor preferences with profile data
    const { data: investorPrefs, error: invError } = await supabase
      .from('investor_preferences')
      .select(`
        id,
        investor_id,
        preference_data,
        is_active,
        user_profiles!inner (
          id,
          full_name,
          email,
          phone,
          company_name,
          user_type
        )
      `)
      .eq('is_active', true)

    if (invError) {
      console.error('Error fetching investor preferences:', invError)
      return []
    }

    if (!investorPrefs || investorPrefs.length === 0) {
      console.log('No active investor preferences found')
      return []
    }

    console.log('Investor preferences found:', investorPrefs.length)
    console.log('Property location:', {
      local_authority: property.local_authority,
      city: property.city
    })

    // Score each investor
    const scored = investorPrefs
      .map((inv: any) => {
        try {
          const extracted = extractPreferences(inv.preference_data)
          if (!extracted) return null
          const { matchScore, matchBreakdown } = calculateMatchScore(extracted, property)
          const profile = inv.user_profiles
          return {
            id: inv.investor_id,
            full_name: profile?.full_name,
            email: profile?.email,
            phone: profile?.phone,
            company_name: profile?.company_name,
            investor_type: profile?.user_type, // user_type from user_profiles
            preference_data: inv.preference_data,
            match_score: matchScore,
            match_breakdown: matchBreakdown,
          }
        } catch (err) {
          console.error('Error scoring investor:', err)
          return null
        }
      })
      .filter(item => item !== null && item.match_score >= minScore)
      .sort((a, b) => b.match_score - a.match_score)

    console.log('Scored investors:', scored.length)
    if (scored.length > 0) {
      console.log('Top 3 matches:')
      scored.slice(0, 3).forEach((inv, i) => {
        console.log(`  ${i + 1}. ${inv.full_name || 'Unknown'} - Score: ${inv.match_score}%, Breakdown:`, inv.match_breakdown)
      })
    }
    return scored
  } catch (error) {
    console.error('Unexpected error in getInvestorMatches:', error)
    return []
  }
}
