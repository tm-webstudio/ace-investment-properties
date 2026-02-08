-- Migration: Fix location extraction in matching functions (v2)
-- Date: 2026-02-08
-- Purpose: Handle areas/localAuthorities field variations and correct property column names

-- ============================================================================
-- 1. Update get_matched_properties_for_investor function
-- ============================================================================

DROP FUNCTION IF EXISTS get_matched_properties_for_investor(UUID, INTEGER, INTEGER, INTEGER);

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
    bedrooms_val INTEGER[];
    property_types_val TEXT[];
    licenses_val TEXT[];
    availability_val TEXT;
    parking_val BOOLEAN;
BEGIN
    -- Extract local authorities (handle areas, localAuthority, and localAuthorities)
    SELECT ARRAY(
        SELECT DISTINCT LOWER(TRIM(auth))
        FROM jsonb_array_elements(COALESCE(pref.preference_data->'locations', '[]'::jsonb)) AS loc,
             LATERAL (
                 -- Handle singular localAuthority
                 SELECT loc->>'localAuthority' AS auth
                 WHERE loc->>'localAuthority' IS NOT NULL AND loc->>'localAuthority' != ''

                 UNION

                 -- Handle plural localAuthorities array
                 SELECT jsonb_array_elements_text(loc->'localAuthorities') AS auth
                 WHERE loc->'localAuthorities' IS NOT NULL
                   AND jsonb_typeof(loc->'localAuthorities') = 'array'
                   AND jsonb_array_length(loc->'localAuthorities') > 0

                 UNION

                 -- Handle areas array (legacy field name)
                 SELECT jsonb_array_elements_text(loc->'areas') AS auth
                 WHERE loc->'areas' IS NOT NULL
                   AND jsonb_typeof(loc->'areas') = 'array'
                   AND jsonb_array_length(loc->'areas') > 0
             ) AS authorities
        WHERE auth IS NOT NULL AND auth != ''
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
        COALESCE(
            ARRAY(
                SELECT jsonb_array_elements_text(pref.preference_data->'bedrooms')::INTEGER
            ),
            ARRAY[]::INTEGER[]
        ),
        COALESCE(
            ARRAY(
                SELECT LOWER(TRIM(jsonb_array_elements_text(pref.preference_data->'propertyTypes')))
            ),
            ARRAY[]::TEXT[]
        ),
        COALESCE(
            ARRAY(
                SELECT LOWER(TRIM(jsonb_array_elements_text(pref.preference_data->'licenses')))
            ),
            ARRAY[]::TEXT[]
        ),
        LOWER(TRIM(COALESCE(pref.preference_data->>'availability', ''))),
        COALESCE((pref.preference_data->>'parking')::BOOLEAN, FALSE)
    INTO
        min_budget_val,
        max_budget_val,
        bedrooms_val,
        property_types_val,
        licenses_val,
        availability_val,
        parking_val
    FROM investor_preferences pref
    WHERE pref.investor_id = investor_uuid;

    -- Return matching properties
    RETURN QUERY
    SELECT
        to_jsonb(p.*) AS property_data,
        (
            -- Location match (50 points) - MANDATORY
            CASE
                WHEN (
                    -- Match by local authority
                    (p.local_authority IS NOT NULL
                     AND LOWER(TRIM(p.local_authority)) = ANY(local_authorities))
                    OR
                    -- Match by city
                    (p.city IS NOT NULL
                     AND LOWER(TRIM(p.city)) = ANY(locations))
                ) THEN 50
                ELSE 0
            END
            +
            -- Budget match (25 points) - use monthly_rent column
            CASE
                WHEN p.monthly_rent BETWEEN min_budget_val AND max_budget_val THEN 25
                ELSE 0
            END
            +
            -- Bedrooms match (20 points)
            CASE
                WHEN cardinality(bedrooms_val) = 0 OR p.bedrooms::INTEGER = ANY(bedrooms_val) THEN 20
                ELSE 0
            END
            +
            -- License match (15 points) - use property_licence column
            CASE
                WHEN cardinality(licenses_val) = 0 OR LOWER(TRIM(p.property_licence)) = ANY(licenses_val) THEN 15
                ELSE 0
            END
            +
            -- Property type match (10 points)
            CASE
                WHEN cardinality(property_types_val) = 0 OR LOWER(TRIM(p.property_type)) = ANY(property_types_val) THEN 10
                ELSE 0
            END
            +
            -- Availability match (10 points)
            CASE
                WHEN availability_val = '' OR LOWER(TRIM(p.availability)) = availability_val THEN 10
                ELSE 0
            END
            +
            -- Parking match (5 points) - check amenities array
            CASE
                WHEN NOT parking_val OR 'parking' = ANY(p.amenities) THEN 5
                ELSE 0
            END
        )::INTEGER AS match_score,
        -- Build match reasons array
        ARRAY(
            SELECT reason FROM (
                SELECT 'Location match' AS reason, 1 AS priority
                WHERE (p.local_authority IS NOT NULL AND LOWER(TRIM(p.local_authority)) = ANY(local_authorities))
                   OR (p.city IS NOT NULL AND LOWER(TRIM(p.city)) = ANY(locations))
                UNION ALL
                SELECT 'Budget match', 2
                WHERE p.monthly_rent BETWEEN min_budget_val AND max_budget_val
                UNION ALL
                SELECT 'Bedrooms match', 3
                WHERE cardinality(bedrooms_val) = 0 OR p.bedrooms::INTEGER = ANY(bedrooms_val)
                UNION ALL
                SELECT 'License match', 4
                WHERE cardinality(licenses_val) = 0 OR LOWER(TRIM(p.property_licence)) = ANY(licenses_val)
                UNION ALL
                SELECT 'Property type match', 5
                WHERE cardinality(property_types_val) = 0 OR LOWER(TRIM(p.property_type)) = ANY(property_types_val)
                UNION ALL
                SELECT 'Availability match', 6
                WHERE availability_val = '' OR LOWER(TRIM(p.availability)) = availability_val
                UNION ALL
                SELECT 'Parking match', 7
                WHERE NOT parking_val OR 'parking' = ANY(p.amenities)
            ) reasons
            ORDER BY priority
        ) AS match_reasons
    FROM properties p
    WHERE p.status = 'active'
      -- Strict location filter - must match location for any results
      AND (
          (p.local_authority IS NOT NULL AND LOWER(TRIM(p.local_authority)) = ANY(local_authorities))
          OR
          (p.city IS NOT NULL AND LOWER(TRIM(p.city)) = ANY(locations))
      )
    HAVING (
        CASE
            WHEN (
                (p.local_authority IS NOT NULL AND LOWER(TRIM(p.local_authority)) = ANY(local_authorities))
                OR
                (p.city IS NOT NULL AND LOWER(TRIM(p.city)) = ANY(locations))
            ) THEN 50
            ELSE 0
        END
        +
        CASE WHEN p.monthly_rent BETWEEN min_budget_val AND max_budget_val THEN 25 ELSE 0 END
        +
        CASE WHEN cardinality(bedrooms_val) = 0 OR p.bedrooms::INTEGER = ANY(bedrooms_val) THEN 20 ELSE 0 END
        +
        CASE WHEN cardinality(licenses_val) = 0 OR LOWER(TRIM(p.property_licence)) = ANY(licenses_val) THEN 15 ELSE 0 END
        +
        CASE WHEN cardinality(property_types_val) = 0 OR LOWER(TRIM(p.property_type)) = ANY(property_types_val) THEN 10 ELSE 0 END
        +
        CASE WHEN availability_val = '' OR LOWER(TRIM(p.availability)) = availability_val THEN 10 ELSE 0 END
        +
        CASE WHEN NOT parking_val OR 'parking' = ANY(p.amenities) THEN 5 ELSE 0 END
    ) >= min_match_score
    ORDER BY match_score DESC
    LIMIT page_limit
    OFFSET page_offset;
END;
$$;

-- ============================================================================
-- 2. Update find_matching_investors_for_property function
-- ============================================================================

DROP FUNCTION IF EXISTS find_matching_investors_for_property(UUID);

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
    property_parking_val BOOLEAN;
BEGIN
    -- Get property details (use correct column names)
    SELECT
        LOWER(TRIM(prop.local_authority)),
        LOWER(TRIM(prop.city)),
        prop.monthly_rent,
        prop.bedrooms::INTEGER,
        LOWER(TRIM(prop.property_type)),
        LOWER(TRIM(prop.property_licence)),
        LOWER(TRIM(prop.availability)),
        CASE WHEN 'parking' = ANY(prop.amenities) THEN TRUE ELSE FALSE END
    INTO
        property_local_authority_val,
        property_city_val,
        property_price_val,
        property_bedrooms_val,
        property_type_val,
        property_license_val,
        property_availability_val,
        property_parking_val
    FROM properties prop
    WHERE prop.id = p_property_id;

    -- If property not found, return empty
    IF NOT FOUND THEN
        RETURN;
    END IF;

    -- Return matching investors with improved location extraction
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
            -- Location match (50 points) - improved logic
            CASE
                WHEN EXISTS (
                    SELECT 1
                    FROM jsonb_array_elements(COALESCE(ip.preference_data->'locations', '[]'::jsonb)) AS loc,
                         LATERAL (
                             -- Handle singular localAuthority
                             SELECT loc->>'localAuthority' AS auth
                             WHERE loc->>'localAuthority' IS NOT NULL AND loc->>'localAuthority' != ''

                             UNION

                             -- Handle plural localAuthorities array
                             SELECT jsonb_array_elements_text(loc->'localAuthorities') AS auth
                             WHERE loc->'localAuthorities' IS NOT NULL
                               AND jsonb_typeof(loc->'localAuthorities') = 'array'
                               AND jsonb_array_length(loc->'localAuthorities') > 0

                             UNION

                             -- Handle areas array (legacy field name)
                             SELECT jsonb_array_elements_text(loc->'areas') AS auth
                             WHERE loc->'areas' IS NOT NULL
                               AND jsonb_typeof(loc->'areas') = 'array'
                               AND jsonb_array_length(loc->'areas') > 0
                         ) AS authorities
                    WHERE LOWER(TRIM(auth)) = property_local_authority_val
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
                WHEN NOT jsonb_path_exists(ip.preference_data, '$.bedrooms[*]')
                  OR EXISTS (
                      SELECT 1
                      FROM jsonb_array_elements_text(ip.preference_data->'bedrooms') AS bedroom
                      WHERE bedroom::INTEGER = property_bedrooms_val
                  )
                THEN 20
                ELSE 0
            END
            +
            -- License match (15 points)
            CASE
                WHEN NOT jsonb_path_exists(ip.preference_data, '$.licenses[*]')
                  OR EXISTS (
                      SELECT 1
                      FROM jsonb_array_elements_text(ip.preference_data->'licenses') AS license
                      WHERE LOWER(TRIM(license)) = property_license_val
                  )
                THEN 15
                ELSE 0
            END
            +
            -- Property type match (10 points)
            CASE
                WHEN NOT jsonb_path_exists(ip.preference_data, '$.propertyTypes[*]')
                  OR EXISTS (
                      SELECT 1
                      FROM jsonb_array_elements_text(ip.preference_data->'propertyTypes') AS ptype
                      WHERE LOWER(TRIM(ptype)) = property_type_val
                  )
                THEN 10
                ELSE 0
            END
            +
            -- Availability match (10 points)
            CASE
                WHEN ip.preference_data->>'availability' IS NULL
                  OR ip.preference_data->>'availability' = ''
                  OR LOWER(TRIM(ip.preference_data->>'availability')) = property_availability_val
                THEN 10
                ELSE 0
            END
            +
            -- Parking match (5 points)
            CASE
                WHEN NOT COALESCE((ip.preference_data->>'parking')::BOOLEAN, FALSE)
                  OR property_parking_val = TRUE
                THEN 5
                ELSE 0
            END
        )::INTEGER AS match_score
    FROM investor_preferences ip
    JOIN user_profiles up ON up.id = ip.investor_id
    WHERE ip.is_active = true
      AND ip.preference_data IS NOT NULL
      -- Strict location filter - must match location
      AND EXISTS (
          SELECT 1
          FROM jsonb_array_elements(COALESCE(ip.preference_data->'locations', '[]'::jsonb)) AS loc,
               LATERAL (
                   SELECT loc->>'localAuthority' AS auth
                   WHERE loc->>'localAuthority' IS NOT NULL AND loc->>'localAuthority' != ''

                   UNION

                   SELECT jsonb_array_elements_text(loc->'localAuthorities') AS auth
                   WHERE loc->'localAuthorities' IS NOT NULL
                     AND jsonb_typeof(loc->'localAuthorities') = 'array'
                     AND jsonb_array_length(loc->'localAuthorities') > 0

                   UNION

                   SELECT jsonb_array_elements_text(loc->'areas') AS auth
                   WHERE loc->'areas' IS NOT NULL
                     AND jsonb_typeof(loc->'areas') = 'array'
                     AND jsonb_array_length(loc->'areas') > 0
               ) AS authorities
          WHERE LOWER(TRIM(auth)) = property_local_authority_val
             OR LOWER(TRIM(loc->>'city')) = property_city_val
      )
    HAVING match_score >= 50
    ORDER BY match_score DESC;
END;
$$;

-- Add helpful comments
COMMENT ON FUNCTION get_matched_properties_for_investor IS
'Matches properties to investor preferences. Handles areas/localAuthority/localAuthorities field variations. Uses correct property column names (monthly_rent, property_licence). Minimum match score is 50 (location match required).';

COMMENT ON FUNCTION find_matching_investors_for_property IS
'Finds matching investors for a property. Handles areas/localAuthority/localAuthorities field variations. Uses correct property column names. Minimum match score is 50 (location match required).';
