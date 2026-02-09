-- Migration: Migrate preference data from 'areas' to 'localAuthorities'
-- Date: 2026-02-09
-- Purpose: Update existing investor preferences to use the new localAuthorities field name

-- Update investor_preferences to rename 'areas' to 'localAuthorities' in location objects
UPDATE investor_preferences
SET preference_data = (
    SELECT jsonb_build_object(
        'locations', (
            SELECT jsonb_agg(
                CASE
                    -- If location has 'areas' field, rename it to 'localAuthorities'
                    WHEN loc ? 'areas' THEN
                        (loc - 'areas') || jsonb_build_object('localAuthorities', loc->'areas')
                    ELSE
                        loc
                END
            )
            FROM jsonb_array_elements(COALESCE(preference_data->'locations', '[]'::jsonb)) AS loc
        ),
        'budget', preference_data->'budget',
        'bedrooms', preference_data->'bedrooms',
        'property_types', preference_data->'property_types',
        'availability', preference_data->'availability'
    )
)
WHERE preference_data IS NOT NULL
  AND jsonb_typeof(preference_data->'locations') = 'array'
  AND EXISTS (
      SELECT 1
      FROM jsonb_array_elements(preference_data->'locations') AS loc
      WHERE loc ? 'areas'
  );

-- Add comment explaining the migration
COMMENT ON TABLE investor_preferences IS
'Stores investor preferences. Location data uses "localAuthorities" field (migrated from legacy "areas" field on 2026-02-09). The localAuthorities field contains an array of local authority names or area names that get expanded by the matching functions.';
