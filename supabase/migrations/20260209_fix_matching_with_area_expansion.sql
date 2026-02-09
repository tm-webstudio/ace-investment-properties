-- Migration: Fix matching functions with area expansion + region matching + budget unit fix
-- Date: 2026-02-09
-- Purpose: Update matching to use localAuthorities field, expand area names,
--          match region against city for generic local_authority values,
--          fix budget unit mismatch (prefs in pounds, monthly_rent in pence),
--          and rescale scoring to 100-point system with tiered location matching.
--
-- Scoring weights (max 100):
--   Location (exact borough/city expansion): 40pts
--   Location (region fallback): 25pts
--   Budget: 25pts
--   Bedrooms: 15pts
--   Property type: 10pts
--   License: 5pts
--   Availability: 5pts
-- Minimum threshold: 25 (at least a region-level location match)

-- Drop existing functions
DROP FUNCTION IF EXISTS get_matched_properties_for_investor(UUID, INTEGER, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS find_matching_investors_for_property(UUID);

-- ============================================================================
-- 1. get_matched_properties_for_investor
-- ============================================================================

CREATE OR REPLACE FUNCTION get_matched_properties_for_investor(
    investor_uuid UUID,
    page_limit INTEGER DEFAULT 20,
    page_offset INTEGER DEFAULT 0,
    min_match_score INTEGER DEFAULT 0
)
RETURNS TABLE (
    property_data JSONB,
    match_score INTEGER,
    match_reasons TEXT[]
)
LANGUAGE plpgsql
AS $$
DECLARE
    local_authorities TEXT[];
    locations TEXT[];
    min_budget_val NUMERIC;
    max_budget_val NUMERIC;
    min_bedrooms_val INTEGER;
    max_bedrooms_val INTEGER;
    property_types_val TEXT[];
    immediate_availability BOOLEAN;
BEGIN
    -- Extract and expand local authorities from BOTH localAuthorities/areas AND city fields.
    -- This ensures city-level expansion (e.g. city="London" -> ["London"]) is always included
    -- alongside specific borough expansions, matching the behavior of find_matching_investors_for_property.
    SELECT ARRAY(
        SELECT DISTINCT LOWER(TRIM(expanded_auth))
        FROM jsonb_array_elements(COALESCE(pref.preference_data->'locations', '[]'::jsonb)) AS loc,
             LATERAL (
                 -- Expand from localAuthorities/areas field
                 SELECT jsonb_array_elements_text(
                     COALESCE(loc->'localAuthorities', loc->'areas', '[]'::jsonb)
                 ) AS auth_name
                 UNION ALL
                 -- Also expand from city field
                 SELECT loc->>'city' AS auth_name
                 WHERE loc->>'city' IS NOT NULL AND loc->>'city' != ''
             ) AS auth_source,
             LATERAL unnest(expand_area_to_authorities(auth_source.auth_name)) AS expanded_auth
        WHERE auth_source.auth_name IS NOT NULL AND auth_source.auth_name != ''
    )
    INTO local_authorities
    FROM investor_preferences pref
    WHERE pref.investor_id = investor_uuid;

    -- Extract cities AND regions for broader matching (region fallback)
    SELECT ARRAY(
        SELECT DISTINCT LOWER(TRIM(val))
        FROM jsonb_array_elements(COALESCE(pref.preference_data->'locations', '[]'::jsonb)) AS loc,
             LATERAL (
                 SELECT loc->>'city' AS val
                 UNION
                 SELECT loc->>'region' AS val
             ) AS city_region
        WHERE val IS NOT NULL AND val != ''
    )
    INTO locations
    FROM investor_preferences pref
    WHERE pref.investor_id = investor_uuid;

    -- Extract other preferences
    -- Budget prefs are in pounds, monthly_rent is stored in pence -> multiply by 100
    SELECT
        COALESCE((pref.preference_data->'budget'->>'min')::NUMERIC, 0) * 100,
        COALESCE((pref.preference_data->'budget'->>'max')::NUMERIC, 999999999) * 100,
        COALESCE((pref.preference_data->'bedrooms'->>'min')::INTEGER, 0),
        COALESCE((pref.preference_data->'bedrooms'->>'max')::INTEGER, 999),
        COALESCE(
            ARRAY(
                SELECT LOWER(TRIM(jsonb_array_elements_text(pref.preference_data->'property_types')))
            ),
            ARRAY[]::TEXT[]
        ),
        COALESCE((pref.preference_data->'availability'->>'immediate')::BOOLEAN, FALSE)
    INTO
        min_budget_val,
        max_budget_val,
        min_bedrooms_val,
        max_bedrooms_val,
        property_types_val,
        immediate_availability
    FROM investor_preferences pref
    WHERE pref.investor_id = investor_uuid;

    -- Return matching properties
    RETURN QUERY
    WITH scored_properties AS (
        SELECT
            p.*,
            (
                -- Location match: 40pts exact borough/city expansion, 25pts region fallback
                CASE
                    WHEN (p.local_authority IS NOT NULL AND LOWER(TRIM(p.local_authority)) = ANY(local_authorities))
                    THEN 40
                    WHEN (p.city IS NOT NULL AND LOWER(TRIM(p.city)) = ANY(locations))
                      OR (p.local_authority IS NOT NULL AND LOWER(TRIM(p.local_authority)) = ANY(locations))
                    THEN 25
                    ELSE 0
                END
                +
                -- Budget match (25 points)
                CASE
                    WHEN p.monthly_rent BETWEEN min_budget_val AND max_budget_val THEN 25
                    ELSE 0
                END
                +
                -- Bedrooms match (15 points)
                CASE
                    WHEN p.bedrooms::INTEGER BETWEEN min_bedrooms_val AND max_bedrooms_val THEN 15
                    ELSE 0
                END
                +
                -- Property type match (10 points)
                CASE
                    WHEN cardinality(property_types_val) = 0
                      OR LOWER(TRIM(p.property_type)) = ANY(property_types_val)
                      OR ('houses' = ANY(property_types_val) AND LOWER(TRIM(p.property_type)) = 'house')
                      OR ('flats' = ANY(property_types_val) AND LOWER(TRIM(p.property_type)) = 'flat')
                    THEN 10
                    ELSE 0
                END
                +
                -- License match (5 points)
                CASE
                    WHEN 'hmo' = ANY(property_types_val) AND LOWER(TRIM(p.property_licence)) = 'hmo' THEN 5
                    WHEN p.property_licence IS NOT NULL
                         AND TRIM(p.property_licence) != ''
                         AND LOWER(TRIM(p.property_licence)) != 'none'
                    THEN 3
                    ELSE 0
                END
                +
                -- Availability match (5 points)
                CASE
                    WHEN immediate_availability AND LOWER(TRIM(p.availability)) = 'vacant' THEN 5
                    WHEN NOT immediate_availability THEN 3
                    ELSE 0
                END
            ) AS score
        FROM properties p
        WHERE p.status = 'active'
          AND (
              (p.local_authority IS NOT NULL AND LOWER(TRIM(p.local_authority)) = ANY(local_authorities))
              OR (p.city IS NOT NULL AND LOWER(TRIM(p.city)) = ANY(locations))
              OR (p.local_authority IS NOT NULL AND LOWER(TRIM(p.local_authority)) = ANY(locations))
          )
    )
    SELECT
        to_jsonb(sp.*) AS property_data,
        sp.score::INTEGER AS match_score,
        ARRAY(
            SELECT reason FROM (
                SELECT 'Exact location match' AS reason, 1 AS priority
                WHERE sp.local_authority IS NOT NULL AND LOWER(TRIM(sp.local_authority)) = ANY(local_authorities)
                UNION ALL
                SELECT 'Location match (region)', 1
                WHERE NOT (sp.local_authority IS NOT NULL AND LOWER(TRIM(sp.local_authority)) = ANY(local_authorities))
                  AND (
                      (sp.city IS NOT NULL AND LOWER(TRIM(sp.city)) = ANY(locations))
                      OR (sp.local_authority IS NOT NULL AND LOWER(TRIM(sp.local_authority)) = ANY(locations))
                  )
                UNION ALL
                SELECT 'Budget match', 2
                WHERE sp.monthly_rent BETWEEN min_budget_val AND max_budget_val
                UNION ALL
                SELECT 'Bedrooms match', 3
                WHERE sp.bedrooms::INTEGER BETWEEN min_bedrooms_val AND max_bedrooms_val
                UNION ALL
                SELECT 'Property type match', 4
                WHERE cardinality(property_types_val) = 0
                  OR LOWER(TRIM(sp.property_type)) = ANY(property_types_val)
                  OR ('houses' = ANY(property_types_val) AND LOWER(TRIM(sp.property_type)) = 'house')
                  OR ('flats' = ANY(property_types_val) AND LOWER(TRIM(sp.property_type)) = 'flat')
                UNION ALL
                SELECT 'Availability match', 5
                WHERE (immediate_availability AND LOWER(TRIM(sp.availability)) = 'vacant')
                   OR NOT immediate_availability
            ) reasons
            ORDER BY priority
        ) AS match_reasons
    FROM scored_properties sp
    WHERE sp.score >= GREATEST(min_match_score, 25)
    ORDER BY sp.score DESC
    LIMIT page_limit
    OFFSET page_offset;
END;
$$;

-- ============================================================================
-- 2. find_matching_investors_for_property
-- ============================================================================

CREATE OR REPLACE FUNCTION find_matching_investors_for_property(
    p_property_id UUID
)
RETURNS TABLE (
    id UUID,
    email TEXT,
    full_name TEXT,
    phone_number TEXT,
    investor_type TEXT,
    created_at TIMESTAMPTZ,
    preference_data JSONB,
    match_score INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
    property_local_authority_val TEXT;
    property_city_val TEXT;
    property_price_val NUMERIC;
    property_bedrooms_val INTEGER;
    property_type_val TEXT;
    property_license_val TEXT;
    property_availability_val TEXT;
BEGIN
    -- Get property details
    SELECT
        LOWER(TRIM(prop.local_authority)),
        LOWER(TRIM(prop.city)),
        prop.monthly_rent,
        prop.bedrooms::INTEGER,
        LOWER(TRIM(prop.property_type)),
        LOWER(TRIM(prop.property_licence)),
        LOWER(TRIM(prop.availability))
    INTO
        property_local_authority_val,
        property_city_val,
        property_price_val,
        property_bedrooms_val,
        property_type_val,
        property_license_val,
        property_availability_val
    FROM properties prop
    WHERE prop.id = p_property_id;

    IF NOT FOUND THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT
        up.id,
        up.email,
        up.full_name,
        up.phone as phone_number,
        ip.operator_type as investor_type,
        up.created_at,
        ip.preference_data,
        (
            -- Location match: 40pts exact borough/city expansion, 25pts region fallback
            CASE
                WHEN EXISTS (
                    SELECT 1
                    FROM jsonb_array_elements(COALESCE(ip.preference_data->'locations', '[]'::jsonb)) AS loc,
                         jsonb_array_elements_text(
                             COALESCE(loc->'localAuthorities', loc->'areas', '[]'::jsonb)
                         ) AS auth,
                         LATERAL unnest(expand_area_to_authorities(auth)) AS expanded_auth
                    WHERE LOWER(TRIM(expanded_auth)) = property_local_authority_val
                ) THEN 40
                WHEN EXISTS (
                    SELECT 1
                    FROM jsonb_array_elements(COALESCE(ip.preference_data->'locations', '[]'::jsonb)) AS loc,
                         LATERAL unnest(expand_area_to_authorities(loc->>'city')) AS expanded_auth
                    WHERE LOWER(TRIM(expanded_auth)) = property_local_authority_val
                ) THEN 40
                WHEN EXISTS (
                    SELECT 1
                    FROM jsonb_array_elements(COALESCE(ip.preference_data->'locations', '[]'::jsonb)) AS loc
                    WHERE LOWER(TRIM(loc->>'city')) = property_city_val
                       OR LOWER(TRIM(loc->>'city')) = property_local_authority_val
                       OR LOWER(TRIM(loc->>'region')) = property_city_val
                       OR LOWER(TRIM(loc->>'region')) = property_local_authority_val
                ) THEN 25
                ELSE 0
            END
            +
            -- Budget match (25 points) - budget prefs in pounds, monthly_rent in pence
            CASE
                WHEN property_price_val BETWEEN
                    COALESCE((ip.preference_data->'budget'->>'min')::NUMERIC, 0) * 100 AND
                    COALESCE((ip.preference_data->'budget'->>'max')::NUMERIC, 999999999) * 100
                THEN 25
                ELSE 0
            END
            +
            -- Bedrooms match (15 points)
            CASE
                WHEN property_bedrooms_val BETWEEN
                    COALESCE((ip.preference_data->'bedrooms'->>'min')::INTEGER, 0) AND
                    COALESCE((ip.preference_data->'bedrooms'->>'max')::INTEGER, 999)
                THEN 15
                ELSE 0
            END
            +
            -- Property type match (10 points)
            CASE
                WHEN NOT jsonb_path_exists(ip.preference_data, '$.property_types[*]')
                  OR EXISTS (
                      SELECT 1
                      FROM jsonb_array_elements_text(ip.preference_data->'property_types') AS ptype
                      WHERE LOWER(TRIM(ptype)) = property_type_val
                         OR (ptype = 'houses' AND property_type_val = 'house')
                         OR (ptype = 'flats' AND property_type_val = 'flat')
                  )
                THEN 10
                ELSE 0
            END
            +
            -- License match (5 points)
            CASE
                WHEN EXISTS (
                    SELECT 1
                    FROM jsonb_array_elements_text(ip.preference_data->'property_types') AS ptype
                    WHERE ptype = 'hmo' AND property_license_val = 'hmo'
                ) THEN 5
                WHEN property_license_val IS NOT NULL
                     AND property_license_val != ''
                     AND property_license_val != 'none'
                THEN 3
                ELSE 0
            END
            +
            -- Availability match (5 points)
            CASE
                WHEN COALESCE((ip.preference_data->'availability'->>'immediate')::BOOLEAN, FALSE)
                     AND property_availability_val = 'vacant' THEN 5
                WHEN NOT COALESCE((ip.preference_data->'availability'->>'immediate')::BOOLEAN, FALSE) THEN 3
                ELSE 0
            END
        )::INTEGER AS match_score
    FROM investor_preferences ip
    JOIN user_profiles up ON up.id = ip.investor_id
    WHERE ip.is_active = true
      AND ip.preference_data IS NOT NULL
      AND (
          EXISTS (
              SELECT 1
              FROM jsonb_array_elements(COALESCE(ip.preference_data->'locations', '[]'::jsonb)) AS loc,
                   jsonb_array_elements_text(
                       COALESCE(loc->'localAuthorities', loc->'areas', '[]'::jsonb)
                   ) AS auth,
                   LATERAL unnest(expand_area_to_authorities(auth)) AS expanded_auth
              WHERE LOWER(TRIM(expanded_auth)) = property_local_authority_val
          )
          OR
          EXISTS (
              SELECT 1
              FROM jsonb_array_elements(COALESCE(ip.preference_data->'locations', '[]'::jsonb)) AS loc,
                   LATERAL unnest(expand_area_to_authorities(loc->>'city')) AS expanded_auth
              WHERE LOWER(TRIM(expanded_auth)) = property_local_authority_val
          )
          OR
          EXISTS (
              SELECT 1
              FROM jsonb_array_elements(COALESCE(ip.preference_data->'locations', '[]'::jsonb)) AS loc
              WHERE LOWER(TRIM(loc->>'city')) = property_city_val
                 OR LOWER(TRIM(loc->>'city')) = property_local_authority_val
                 OR LOWER(TRIM(loc->>'region')) = property_city_val
                 OR LOWER(TRIM(loc->>'region')) = property_local_authority_val
          )
      )
      AND (
          -- Compute total score inline and filter by threshold >= 25
          CASE
              WHEN EXISTS (
                  SELECT 1
                  FROM jsonb_array_elements(COALESCE(ip.preference_data->'locations', '[]'::jsonb)) AS loc,
                       jsonb_array_elements_text(
                           COALESCE(loc->'localAuthorities', loc->'areas', '[]'::jsonb)
                       ) AS auth,
                       LATERAL unnest(expand_area_to_authorities(auth)) AS expanded_auth
                  WHERE LOWER(TRIM(expanded_auth)) = property_local_authority_val
              ) THEN 40
              WHEN EXISTS (
                  SELECT 1
                  FROM jsonb_array_elements(COALESCE(ip.preference_data->'locations', '[]'::jsonb)) AS loc,
                       LATERAL unnest(expand_area_to_authorities(loc->>'city')) AS expanded_auth
                  WHERE LOWER(TRIM(expanded_auth)) = property_local_authority_val
              ) THEN 40
              WHEN EXISTS (
                  SELECT 1
                  FROM jsonb_array_elements(COALESCE(ip.preference_data->'locations', '[]'::jsonb)) AS loc
                  WHERE LOWER(TRIM(loc->>'city')) = property_city_val
                     OR LOWER(TRIM(loc->>'city')) = property_local_authority_val
                     OR LOWER(TRIM(loc->>'region')) = property_city_val
                     OR LOWER(TRIM(loc->>'region')) = property_local_authority_val
              ) THEN 25
              ELSE 0
          END
          +
          CASE
              WHEN property_price_val BETWEEN
                  COALESCE((ip.preference_data->'budget'->>'min')::NUMERIC, 0) * 100 AND
                  COALESCE((ip.preference_data->'budget'->>'max')::NUMERIC, 999999999) * 100
              THEN 25
              ELSE 0
          END
          +
          CASE
              WHEN property_bedrooms_val BETWEEN
                  COALESCE((ip.preference_data->'bedrooms'->>'min')::INTEGER, 0) AND
                  COALESCE((ip.preference_data->'bedrooms'->>'max')::INTEGER, 999)
              THEN 15
              ELSE 0
          END
          +
          CASE
              WHEN NOT jsonb_path_exists(ip.preference_data, '$.property_types[*]')
                OR EXISTS (
                    SELECT 1
                    FROM jsonb_array_elements_text(ip.preference_data->'property_types') AS ptype
                    WHERE LOWER(TRIM(ptype)) = property_type_val
                       OR (ptype = 'houses' AND property_type_val = 'house')
                       OR (ptype = 'flats' AND property_type_val = 'flat')
                )
              THEN 10
              ELSE 0
          END
          +
          CASE
              WHEN EXISTS (
                  SELECT 1
                  FROM jsonb_array_elements_text(ip.preference_data->'property_types') AS ptype
                  WHERE ptype = 'hmo' AND property_license_val = 'hmo'
              ) THEN 5
              WHEN property_license_val IS NOT NULL
                   AND property_license_val != ''
                   AND property_license_val != 'none'
              THEN 3
              ELSE 0
          END
          +
          CASE
              WHEN COALESCE((ip.preference_data->'availability'->>'immediate')::BOOLEAN, FALSE)
                   AND property_availability_val = 'vacant' THEN 5
              WHEN NOT COALESCE((ip.preference_data->'availability'->>'immediate')::BOOLEAN, FALSE) THEN 3
              ELSE 0
          END
      ) >= 25
    ORDER BY match_score DESC;
END;
$$;

-- Add helpful comments
COMMENT ON FUNCTION get_matched_properties_for_investor IS
'Matches properties to investor preferences with area expansion (both localAuthorities and city), region-level matching, correct budget unit conversion (prefs in pounds, rent in pence), and 100-point scoring scale with tiered location matching (40pts exact borough/city expansion, 25pts region fallback).';

COMMENT ON FUNCTION find_matching_investors_for_property IS
'Finds matching investors for a property with area expansion (both localAuthorities and city), region-level matching, correct budget unit conversion, and 100-point scoring scale with tiered location matching (40pts exact borough/city expansion, 25pts region fallback).';
