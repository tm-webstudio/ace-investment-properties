# Investor Location Selection - Hierarchical Update

## Overview
Updated the investor location selection to use a hierarchical structure: **UK Region → City → Local Authority**

## What Changed

### Before
Investors could only select:
- City/Town
- Specific areas within that city

### After
Investors now select locations hierarchically:
1. **UK Region** (e.g., London, North West, Yorkshire and The Humber)
2. **City/Town** (filtered by selected region)
3. **Local Authority/Area** (optional - filtered by selected city)

## Benefits

1. **Better Organization**: Cities are now grouped by UK regions, making it easier to find locations
2. **Geographic Context**: Users can see which region a city belongs to
3. **Scalability**: Easy to add more cities and regions without cluttering the interface
4. **Flexibility**: Users can still specify exact local authorities or leave blank to include all areas

## Technical Changes

### New Files Created
- **`lib/uk-locations.ts`** - Centralized UK location data with regions, cities, and local authorities
- **`lib/migrate-locations.ts`** - Migration utility for converting old location data

### Files Updated
- **`components/onboarding/step-3.tsx`** - Updated to use cascading location selects
- **`app/investor/signup/page.tsx`** - Updated Location interface
- **`app/investor/preferences/page.tsx`** - Updated Location interface
- **`components/preferences-modal.tsx`** - Updated Location interface
- **`components/investor-dashboard-profile.tsx`** - Updated with backward compatibility

### Location Data Structure

**Old Format:**
```typescript
interface Location {
  id: string
  city: string
  areas: string[]
  radius: number
}
```

**New Format:**
```typescript
interface Location {
  id: string
  region: string              // NEW: UK Region
  city: string
  localAuthorities: string[]  // Renamed from 'areas'
}
```

## UK Regions Included

- London
- South East
- South West
- West Midlands
- East Midlands
- East of England
- North West
- North East
- Yorkshire and The Humber
- Wales
- Scotland
- Northern Ireland

## Data Migration

### Automatic Migration
The system automatically migrates old location data when loading preferences:

```typescript
import { ensureNewLocationFormat } from '@/lib/migrate-locations'

// In your API or component:
const locations = ensureNewLocationFormat(rawLocations)
```

### Manual Migration
If you need to migrate database records:

```typescript
import { migrateLocations } from '@/lib/migrate-locations'

const oldLocations = [
  { id: "1", city: "London", areas: ["Camden", "Islington"], radius: 10 }
]

const newLocations = migrateLocations(oldLocations)
// Result: [
//   {
//     id: "1",
//     region: "London",
//     city: "London",
//     localAuthorities: ["Camden", "Islington"]
//   }
// ]
```

## User Experience

### Signup Flow
1. User clicks "Add Location"
2. Selects a UK region from dropdown
3. City dropdown populates with cities in that region
4. (Optional) Local authority dropdown appears for the selected city
5. User can add multiple regions/areas to their search

### Display
Locations are displayed as badges showing:
- City name (prominent)
- Region (smaller text)
- Number of local authorities (if specified)

Example:
```
Manchester
North West
2 areas
```

## Adding New Locations

To add new cities or regions, edit `lib/uk-locations.ts`:

```typescript
export const ukRegions: Record<string, string[]> = {
  "North West": ["Manchester", "Liverpool", "Preston", "Chester", "NewCity"], // Add here
  // ...
}

export const localAuthorities: Record<string, string[]> = {
  "NewCity": [
    "Area 1",
    "Area 2",
    "Area 3"
  ],
  // ...
}
```

## Backward Compatibility

The system maintains backward compatibility with old location data:
- Old `areas` field is mapped to `localAuthorities`
- Missing `region` is automatically inferred from city name
- All components handle both formats gracefully

## Testing

After deployment:
1. Create a new investor account and verify cascading dropdowns work
2. Edit an existing investor's preferences and verify locations display correctly
3. Ensure old investor accounts can still view their saved locations
4. Test location filtering in property matching

## Database Considerations

The location data is stored in JSONB format in the `investor_preferences` table under `preference_data.locations`. The automatic migration happens at read-time, so no database migration is required.

However, if you want to persist the new format to the database:
1. Load existing preferences
2. Apply `ensureNewLocationFormat()` migration
3. Save back to database

This can be done via a one-time script or gradually as users update their preferences.
