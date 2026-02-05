/**
 * Migration utility to convert old location format to new hierarchical format
 * Old format: { city, areas, radius }
 * New format: { region, city, localAuthorities }
 */

import { getRegionForCity } from './uk-locations'

export interface OldLocation {
  id?: string
  city: string
  areas?: string[]
  radius?: number
}

export interface NewLocation {
  id: string
  region: string
  city: string
  localAuthorities: string[]
}

/**
 * Migrate a single location from old format to new format
 */
export function migrateLocation(oldLocation: OldLocation): NewLocation {
  const region = getRegionForCity(oldLocation.city)

  return {
    id: oldLocation.id || Date.now().toString() + Math.random().toString(36).substring(7),
    region: region || "Unknown", // Fallback for cities not in our mapping
    city: oldLocation.city,
    localAuthorities: oldLocation.areas || []
  }
}

/**
 * Migrate an array of locations
 */
export function migrateLocations(oldLocations: OldLocation[]): NewLocation[] {
  return oldLocations.map(loc => migrateLocation(loc))
}

/**
 * Check if a location object is in the old format
 */
export function isOldLocationFormat(location: any): boolean {
  return (
    location &&
    typeof location.city === 'string' &&
    !location.region && // New format has region
    (location.areas !== undefined || location.radius !== undefined) // Old format markers
  )
}

/**
 * Auto-migrate location data if needed
 * This can be used when loading preferences from the database
 */
export function ensureNewLocationFormat(locations: any[]): NewLocation[] {
  if (!Array.isArray(locations) || locations.length === 0) {
    return []
  }

  // Check if any location is in old format
  const needsMigration = locations.some(loc => isOldLocationFormat(loc))

  if (needsMigration) {
    console.log('Migrating locations from old format to new format')
    return migrateLocations(locations as OldLocation[])
  }

  // Already in new format, but ensure consistency
  return locations.map(loc => ({
    id: loc.id || Date.now().toString() + Math.random().toString(36).substring(7),
    region: loc.region || getRegionForCity(loc.city) || "Unknown",
    city: loc.city,
    localAuthorities: loc.localAuthorities || loc.areas || []
  }))
}
