/**
 * Navigation Location Data - Simplified Structure
 * Shows only Regions and Sub-Regions (Areas) in navigation
 * Local authority filtering happens on the properties page
 */

import { ukRegions, localAuthorities } from './uk-locations'

export interface NavigationLocation {
  slug: string // URL: "central-london"
  displayName: string // Display: "Central London"
  region: string // "London"
  subRegion: string // "Central London"
  localAuthorities: string[] // List of local authorities in this sub-region
}

/**
 * Generate navigation locations from uk-locations.ts structure
 * This uses the existing sub-regions (areas) from ukRegions
 */
function generateNavigationLocations(): NavigationLocation[] {
  const locations: NavigationLocation[] = []

  // Iterate through each main region
  for (const [region, subRegions] of Object.entries(ukRegions)) {
    // For each sub-region (area), create a navigation location
    for (const subRegion of subRegions) {
      // Create URL-friendly slug
      const slug = subRegion
        .toLowerCase()
        .replace(/[(),\-]/g, '') // Remove parentheses, commas, and hyphens first
        .replace(/\s+/g, '-')     // Replace spaces with hyphens
        .replace(/&/g, 'and')     // Replace & with 'and'
        .replace(/--+/g, '-')     // Replace multiple hyphens with single hyphen
        .replace(/^-|-$/g, '')    // Remove leading/trailing hyphens

      // Get local authorities for this sub-region
      const authorities = localAuthorities[subRegion] || []

      locations.push({
        slug,
        displayName: subRegion,
        region,
        subRegion,
        localAuthorities: authorities
      })
    }
  }

  return locations
}

/**
 * All navigation locations organized by region
 */
const allLocations = generateNavigationLocations()

// Debug logging
console.log('Navigation Locations Generated:', {
  total: allLocations.length,
  regions: {
    london: allLocations.filter(loc => loc.region === "London").length,
    northWest: allLocations.filter(loc => loc.region === "North West").length,
    northEastYorkshire: allLocations.filter(loc => loc.region === "North East & Yorkshire").length,
    midlands: allLocations.filter(loc => loc.region === "Midlands").length,
    southEast: allLocations.filter(loc => loc.region === "South East").length,
    southWest: allLocations.filter(loc => loc.region === "South West & East of England").length,
  },
  sampleLocation: allLocations[0]
})

export const navigationLocations = {
  london: allLocations.filter(loc => loc.region === "London"),
  northWest: allLocations.filter(loc => loc.region === "North West"),
  northEastYorkshire: allLocations.filter(loc => loc.region === "North East & Yorkshire"),
  midlands: allLocations.filter(loc => loc.region === "Midlands"),
  southEast: allLocations.filter(loc => loc.region === "South East"),
  southWest: allLocations.filter(loc => loc.region === "South West & East of England"),
}

/**
 * Flatten all locations into a single array for easy lookup
 */
export const allNavigationLocations: NavigationLocation[] = allLocations

/**
 * Get location by slug
 */
export function getLocationBySlug(slug: string): NavigationLocation | undefined {
  return allNavigationLocations.find(loc => loc.slug === slug)
}

/**
 * Get all locations for a specific region
 */
export function getLocationsByRegion(region: string): NavigationLocation[] {
  return allNavigationLocations.filter(loc => loc.region === region)
}
