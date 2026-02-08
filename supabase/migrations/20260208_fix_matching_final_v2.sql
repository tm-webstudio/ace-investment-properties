-- Migration: Fix matching functions with correct data structure (v2)
-- Date: 2026-02-08
-- Purpose: Handle actual preference_data structure from frontend - fixed GROUP BY issue

-- Drop existing functions
DROP FUNCTION IF EXISTS get_matched_properties_for_investor(UUID, INTEGER, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS find_matching_investors_for_property(UUID);

-- ============================================================================
-- 1. Create get_matched_properties_for_investor function
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
    -- Extract local authorities from areas array
    SELECT ARRAY(
        SELECT DISTINCT LOWER(TRIM(area))
        FROM jsonb_array_elements(COALESCE(pref.preference_data->'locations', '[]'::jsonb)) AS loc,
             jsonb_array_elements_text(COALESCE(loc->'areas', '[]'::jsonb)) AS area
        WHERE area IS NOT NULL AND area != ''
    )
    INTO local_authorities
    FROM investor_preferences pref
    WHERE pref.investor_id = investor_uuid;

    -- Extract cities
    SELECT ARRAY(
        SELECT DISTINCT LOWER(TRIM(loc->>'city'))
        FROM jsonb_array_elements(COALESCE(pref.preference_data->'locations', '[]'::jsonb)) AS loc
        WHERE loc->>'city' IS NOT NULL AND loc->>'city' != ''
    )
    INTO locations
    FROM investor_preferences pref
    WHERE pref.investor_id = investor_uuid;

    -- Extract other preferences
    SELECT
        COALESCE((pref.preference_data->'budget'->>'min')::NUMERIC, 0),
        COALESCE((pref.preference_data->'budget'->>'max')::NUMERIC, 999999999),
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
                -- Location match (50 points) - MANDATORY
                CASE
                    WHEN (
                        (p.local_authority IS NOT NULL AND LOWER(TRIM(p.local_authority)) = ANY(local_authorities))
                        OR
                        (p.city IS NOT NULL AND LOWER(TRIM(p.city)) = ANY(locations))
                    ) THEN 50
                    ELSE 0
                END
                +
                -- Budget match (25 points)
                CASE
                    WHEN p.monthly_rent BETWEEN min_budget_val AND max_budget_val THEN 25
                    ELSE 0
                END
                +
                -- Bedrooms match (20 points)
                CASE
                    WHEN p.bedrooms::INTEGER BETWEEN min_bedrooms_val AND max_bedrooms_val THEN 20
                    ELSE 0
                END
                +
                -- Property type match (15 points)
                CASE
                    WHEN cardinality(property_types_val) = 0
                      OR LOWER(TRIM(p.property_type)) = ANY(property_types_val)
                      OR ('houses' = ANY(property_types_val) AND LOWER(TRIM(p.property_type)) = 'house')
                      OR ('flats' = ANY(property_types_val) AND LOWER(TRIM(p.property_type)) = 'flat')
                    THEN 15
                    ELSE 0
                END
                +
                -- License match (10 points)
                CASE
                    WHEN 'hmo' = ANY(property_types_val) AND LOWER(TRIM(p.property_licence)) = 'hmo' THEN 10
                    WHEN p.property_licence IS NOT NULL THEN 5
                    ELSE 0
                END
                +
                -- Availability match (10 points)
                CASE
                    WHEN immediate_availability AND LOWER(TRIM(p.availability)) = 'vacant' THEN 10
                    WHEN NOT immediate_availability THEN 5
                    ELSE 0
                END
            ) AS score
        FROM properties p
        WHERE p.status = 'active'
          AND (
              (p.local_authority IS NOT NULL AND LOWER(TRIM(p.local_authority)) = ANY(local_authorities))
              OR
              (p.city IS NOT NULL AND LOWER(TRIM(p.city)) = ANY(locations))
          )
    )
    SELECT
        to_jsonb(sp.*) AS property_data,
        sp.score::INTEGER AS match_score,
        ARRAY(
            SELECT reason FROM (
                SELECT 'Location match' AS reason, 1 AS priority
                WHERE (sp.local_authority IS NOT NULL AND LOWER(TRIM(sp.local_authority)) = ANY(local_authorities))
                   OR (sp.city IS NOT NULL AND LOWER(TRIM(sp.city)) = ANY(locations))
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
    WHERE sp.score >= min_match_score
    ORDER BY sp.score DESC
    LIMIT page_limit
    OFFSET page_offset;
END;
$$;

-- ============================================================================
-- 2. Create find_matching_investors_for_property function
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

    -- If property not found, return empty
    IF NOT FOUND THEN
        RETURN;
    END IF;

    -- Return matching investors
    RETURN QUERY
    SELECT
        up.id,
        up.email,
        up.full_name,
        up.phone as phone_number,
        ip.operator_type as investor_type,
        up.created_at,
        ip.preference_data,
        -- Calculate match score
        (
            -- Location match (50 points)
            CASE
                WHEN EXISTS (
                    SELECT 1
                    FROM jsonb_array_elements(COALESCE(ip.preference_data->'locations', '[]'::jsonb)) AS loc,
                         jsonb_array_elements_text(COALESCE(loc->'areas', '[]'::jsonb)) AS area
                    WHERE LOWER(TRIM(area)) = property_local_authority_val
                       OR LOWER(TRIM(loc->>'city')) = property_city_val
                ) THEN 50
                ELSE 0
            END
            +
            -- Budget match (25 points)
            CASE
                WHEN property_price_val BETWEEN
                    COALESCE((ip.preference_data->'budget'->>'min')::NUMERIC, 0) AND
                    COALESCE((ip.preference_data->'budget'->>'max')::NUMERIC, 999999999)
                THEN 25
                ELSE 0
            END
            +
            -- Bedrooms match (20 points)
            CASE
                WHEN property_bedrooms_val BETWEEN
                    COALESCE((ip.preference_data->'bedrooms'->>'min')::INTEGER, 0) AND
                    COALESCE((ip.preference_data->'bedrooms'->>'max')::INTEGER, 999)
                THEN 20
                ELSE 0
            END
            +
            -- Property type match (15 points)
            CASE
                WHEN NOT jsonb_path_exists(ip.preference_data, '$.property_types[*]')
                  OR EXISTS (
                      SELECT 1
                      FROM jsonb_array_elements_text(ip.preference_data->'property_types') AS ptype
                      WHERE LOWER(TRIM(ptype)) = property_type_val
                         OR (ptype = 'houses' AND property_type_val = 'house')
                         OR (ptype = 'flats' AND property_type_val = 'flat')
                  )
                THEN 15
                ELSE 0
            END
            +
            -- License match (10 points)
            CASE
                WHEN EXISTS (
                    SELECT 1
                    FROM jsonb_array_elements_text(ip.preference_data->'property_types') AS ptype
                    WHERE ptype = 'hmo' AND property_license_val = 'hmo'
                ) THEN 10
                WHEN property_license_val IS NOT NULL THEN 5
                ELSE 0
            END
            +
            -- Availability match (10 points)
            CASE
                WHEN COALESCE((ip.preference_data->'availability'->>'immediate')::BOOLEAN, FALSE)
                     AND property_availability_val = 'vacant' THEN 10
                WHEN NOT COALESCE((ip.preference_data->'availability'->>'immediate')::BOOLEAN, FALSE) THEN 5
                ELSE 0
            END
        )::INTEGER AS match_score
    FROM investor_preferences ip
    JOIN user_profiles up ON up.id = ip.investor_id
    WHERE ip.is_active = true
      AND ip.preference_data IS NOT NULL
      AND EXISTS (
          SELECT 1
          FROM jsonb_array_elements(COALESCE(ip.preference_data->'locations', '[]'::jsonb)) AS loc,
               jsonb_array_elements_text(COALESCE(loc->'areas', '[]'::jsonb)) AS area
          WHERE LOWER(TRIM(area)) = property_local_authority_val
             OR LOWER(TRIM(loc->>'city')) = property_city_val
      )
      AND (
          -- Location match (50 points)
          CASE
              WHEN EXISTS (
                  SELECT 1
                  FROM jsonb_array_elements(COALESCE(ip.preference_data->'locations', '[]'::jsonb)) AS loc,
                       jsonb_array_elements_text(COALESCE(loc->'areas', '[]'::jsonb)) AS area
                  WHERE LOWER(TRIM(area)) = property_local_authority_val
                     OR LOWER(TRIM(loc->>'city')) = property_city_val
              ) THEN 50
              ELSE 0
          END
          +
          CASE
              WHEN property_price_val BETWEEN
                  COALESCE((ip.preference_data->'budget'->>'min')::NUMERIC, 0) AND
                  COALESCE((ip.preference_data->'budget'->>'max')::NUMERIC, 999999999)
              THEN 25
              ELSE 0
          END
          +
          CASE
              WHEN property_bedrooms_val BETWEEN
                  COALESCE((ip.preference_data->'bedrooms'->>'min')::INTEGER, 0) AND
                  COALESCE((ip.preference_data->'bedrooms'->>'max')::INTEGER, 999)
              THEN 20
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
              THEN 15
              ELSE 0
          END
          +
          CASE
              WHEN EXISTS (
                  SELECT 1
                  FROM jsonb_array_elements_text(ip.preference_data->'property_types') AS ptype
                  WHERE ptype = 'hmo' AND property_license_val = 'hmo'
              ) THEN 10
              WHEN property_license_val IS NOT NULL THEN 5
              ELSE 0
          END
          +
          CASE
              WHEN COALESCE((ip.preference_data->'availability'->>'immediate')::BOOLEAN, FALSE)
                   AND property_availability_val = 'vacant' THEN 10
              WHEN NOT COALESCE((ip.preference_data->'availability'->>'immediate')::BOOLEAN, FALSE) THEN 5
              ELSE 0
          END
      ) >= 50
    ORDER BY match_score DESC;
END;
$$;

-- Add helpful comments
COMMENT ON FUNCTION get_matched_properties_for_investor IS
'Matches properties to investor preferences. Handles actual frontend data structure with areas array, bedrooms object {min,max}, and property_types array. Minimum match score is 50 (location match required).';

COMMENT ON FUNCTION find_matching_investors_for_property IS
'Finds matching investors for a property. Handles actual frontend data structure. Minimum match score is 50 (location match required).';