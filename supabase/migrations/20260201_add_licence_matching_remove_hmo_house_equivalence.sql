-- Remove HMO/House equivalence and add property licence matching instead
-- This migration updates both matching functions to use the new property_licences field

-- Update investor->property matching function
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
) AS $$
DECLARE
    pref RECORD;
    budget_min NUMERIC;
    budget_max NUMERIC;
    bedrooms_min INTEGER;
    bedrooms_max INTEGER;
    property_types TEXT[];
    property_licences TEXT[];
    locations TEXT[];
    availability_req TEXT;
    additional_reqs TEXT[];
BEGIN
    -- Get investor preferences
    SELECT
        preference_data
    INTO pref
    FROM investor_preferences
    WHERE investor_id = investor_uuid
        AND is_active = true
    LIMIT 1;

    -- If no preferences found, return empty result
    IF pref IS NULL THEN
        RETURN;
    END IF;

    -- Extract preference data
    budget_min := COALESCE((pref.preference_data->>'budget_min')::NUMERIC, (pref.preference_data->'budget'->>'min')::NUMERIC, 0);
    budget_max := COALESCE((pref.preference_data->>'budget_max')::NUMERIC, (pref.preference_data->'budget'->>'max')::NUMERIC, 999999);
    bedrooms_min := COALESCE((pref.preference_data->>'bedrooms_min')::INTEGER, (pref.preference_data->'bedrooms'->>'min')::INTEGER, 0);
    bedrooms_max := COALESCE((pref.preference_data->>'bedrooms_max')::INTEGER, (pref.preference_data->'bedrooms'->>'max')::INTEGER, 999);

    -- Extract property types from JSONB array
    SELECT ARRAY(
        SELECT jsonb_array_elements_text(COALESCE(pref.preference_data->'property_types', '[]'::jsonb))
    ) INTO property_types;

    -- Extract property licences from JSONB array
    SELECT ARRAY(
        SELECT jsonb_array_elements_text(COALESCE(pref.preference_data->'property_licenses', '[]'::jsonb))
    ) INTO property_licences;

    -- Extract locations (cities) from JSONB array
    SELECT ARRAY(
        SELECT LOWER(TRIM(jsonb_array_elements(COALESCE(pref.preference_data->'locations', '[]'::jsonb))->>'city'))
    ) INTO locations;

    -- Get availability requirement
    availability_req := pref.preference_data->>'availability';

    -- Get additional requirements
    SELECT ARRAY(
        SELECT jsonb_array_elements_text(COALESCE(pref.preference_data->'additional_requirements', '[]'::jsonb))
    ) INTO additional_reqs;

    -- Return matched properties with scoring using a subquery to avoid HAVING/GROUP BY issues
    RETURN QUERY
    SELECT prop_data as property_data, score as match_score, reasons as match_reasons FROM (
        SELECT
            to_jsonb(p.*) as prop_data,
            (
                -- Base score for being active
                CASE WHEN p.status::text = 'active' THEN 20 ELSE 0 END +

                -- Budget match (30 points)
                CASE
                    WHEN p.monthly_rent >= budget_min AND p.monthly_rent <= budget_max THEN 30
                    WHEN p.monthly_rent < budget_min THEN GREATEST(0, 30 - ((budget_min - p.monthly_rent) / NULLIF(budget_min, 0) * 30)::INTEGER)
                    WHEN p.monthly_rent > budget_max THEN GREATEST(0, 30 - ((p.monthly_rent - budget_max) / NULLIF(budget_max, 1) * 30)::INTEGER)
                    ELSE 0
                END +

                -- Bedrooms match (25 points) - handle text bedrooms
                CASE
                    WHEN p.bedrooms::INTEGER >= bedrooms_min AND p.bedrooms::INTEGER <= bedrooms_max THEN 25
                    WHEN p.bedrooms::INTEGER < bedrooms_min THEN GREATEST(0, 25 - ((bedrooms_min - p.bedrooms::INTEGER) * 8))
                    WHEN p.bedrooms::INTEGER > bedrooms_max THEN GREATEST(0, 25 - ((p.bedrooms::INTEGER - bedrooms_max) * 5))
                    ELSE 0
                END +

                -- Property type match (10 points)
                CASE
                    WHEN array_length(property_types, 1) IS NULL OR array_length(property_types, 1) = 0 THEN 10
                    WHEN LOWER(p.property_type) = ANY(SELECT LOWER(unnest(property_types))) THEN 10
                    ELSE 0
                END +

                -- Property licence match (15 points)
                CASE
                    WHEN array_length(property_licences, 1) IS NULL OR array_length(property_licences, 1) = 0 THEN 15
                    WHEN EXISTS (
                        SELECT 1 FROM unnest(property_licences) AS pl
                        WHERE LOWER(pl) LIKE '%' || LOWER(COALESCE(p.property_licence, 'none')) || '%'
                           OR LOWER(COALESCE(p.property_licence, 'none')) LIKE '%' || LOWER(pl) || '%'
                    )
                    THEN 15
                    ELSE 0
                END +

                -- Location match (10 points)
                CASE
                    WHEN array_length(locations, 1) IS NULL OR array_length(locations, 1) = 0 THEN 10
                    WHEN LOWER(TRIM(p.city)) = ANY(locations) THEN 10
                    ELSE 0
                END +

                -- Availability match (if required - bonus points)
                CASE
                    WHEN availability_req IS NULL THEN 0
                    WHEN availability_req = 'immediate' AND (p.availability = 'vacant' OR p.available_date <= CURRENT_DATE) THEN 10
                    ELSE 0
                END +

                -- Additional requirements match (parking, etc.)
                CASE
                    WHEN 'parking' = ANY(additional_reqs) AND p.amenities @> ARRAY['Parking'] THEN 5
                    ELSE 0
                END
            ) as score,

            -- Build match reasons array
            ARRAY(
                SELECT reason FROM (
                    SELECT 'Within budget range' as reason
                    WHERE p.monthly_rent >= budget_min AND p.monthly_rent <= budget_max

                    UNION ALL
                    SELECT bedrooms_min || '-' || bedrooms_max || ' bedrooms' as reason
                    WHERE p.bedrooms::INTEGER >= bedrooms_min AND p.bedrooms::INTEGER <= bedrooms_max

                    UNION ALL
                    SELECT 'Preferred property type' as reason
                    WHERE LOWER(p.property_type) = ANY(SELECT LOWER(unnest(property_types)))

                    UNION ALL
                    SELECT 'Preferred property licence' as reason
                    WHERE EXISTS (
                        SELECT 1 FROM unnest(property_licences) AS pl
                        WHERE LOWER(pl) LIKE '%' || LOWER(COALESCE(p.property_licence, 'none')) || '%'
                           OR LOWER(COALESCE(p.property_licence, 'none')) LIKE '%' || LOWER(pl) || '%'
                    )

                    UNION ALL
                    SELECT 'Preferred location' as reason
                    WHERE LOWER(TRIM(p.city)) = ANY(locations)

                    UNION ALL
                    SELECT 'Immediately available' as reason
                    WHERE availability_req = 'immediate' AND (p.availability = 'vacant' OR p.available_date <= CURRENT_DATE)

                    UNION ALL
                    SELECT 'Has parking' as reason
                    WHERE 'parking' = ANY(additional_reqs) AND p.amenities @> ARRAY['Parking']
                ) reasons
            ) as reasons

        FROM properties p
        WHERE p.status::text = 'active'
            -- Only include properties that meet minimum criteria
            AND (
                -- Budget within reasonable range (±50%)
                (p.monthly_rent >= budget_min * 0.5 AND p.monthly_rent <= budget_max * 1.5)
                OR
                -- Or perfect bedroom match
                (p.bedrooms::INTEGER >= bedrooms_min AND p.bedrooms::INTEGER <= bedrooms_max)
                OR
                -- Or property type match
                (array_length(property_types, 1) IS NULL OR LOWER(p.property_type) = ANY(SELECT LOWER(unnest(property_types))))
                OR
                -- Or property licence match
                (array_length(property_licences, 1) IS NULL OR EXISTS (
                    SELECT 1 FROM unnest(property_licences) AS pl
                    WHERE LOWER(pl) LIKE '%' || LOWER(COALESCE(p.property_licence, 'none')) || '%'
                       OR LOWER(COALESCE(p.property_licence, 'none')) LIKE '%' || LOWER(pl) || '%'
                ))
                OR
                -- Or location match
                (array_length(locations, 1) IS NULL OR LOWER(TRIM(p.city)) = ANY(locations))
            )
    ) matched
    WHERE matched.score >= min_match_score
    ORDER BY score DESC, prop_data->>'created_at' DESC
    LIMIT page_limit
    OFFSET page_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update property->investor matching function
CREATE OR REPLACE FUNCTION find_matching_investors_for_property(p_property_id UUID)
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  phone_number TEXT,
  investor_type TEXT,
  created_at TIMESTAMPTZ,
  preference_data JSONB,
  match_score INTEGER
) AS $$
DECLARE
    prop RECORD;
    property_rent NUMERIC;
    property_bedrooms INTEGER;
    property_type_val TEXT;
    property_type_plural TEXT;
    property_licence_val TEXT;
    property_city_val TEXT;
BEGIN
    -- Get property details
    SELECT
        properties.monthly_rent,
        properties.bedrooms,
        properties.property_type,
        properties.property_licence,
        properties.city
    INTO prop
    FROM properties
    WHERE properties.id = p_property_id
    LIMIT 1;

    -- If no property found, return empty result
    IF prop IS NULL THEN
        RETURN;
    END IF;

    property_rent := prop.monthly_rent;
    property_bedrooms := prop.bedrooms::INTEGER;
    property_type_val := LOWER(TRIM(prop.property_type));
    property_licence_val := LOWER(TRIM(COALESCE(prop.property_licence, 'none')));

    -- Handle singular to plural conversion for property types
    property_type_plural := CASE
        WHEN property_type_val = 'house' THEN 'houses'
        WHEN property_type_val = 'flat' THEN 'flats'
        WHEN property_type_val = 'block' THEN 'blocks'
        WHEN property_type_val = 'apartment' THEN 'apartments'
        ELSE property_type_val || 's'
    END;

    property_city_val := LOWER(TRIM(prop.city));

    -- Return matched investors with scoring
    RETURN QUERY
    SELECT
        up.id,
        up.email,
        up.full_name,
        up.phone AS phone_number,
        ip.operator_type AS investor_type,
        up.created_at,
        ip.preference_data,
        (
            -- Budget match (30 points)
            CASE
                WHEN property_rent >= COALESCE((ip.preference_data->'budget'->>'min')::NUMERIC, 0)
                    AND property_rent <= COALESCE((ip.preference_data->'budget'->>'max')::NUMERIC, 999999)
                THEN 30
                ELSE 0
            END +

            -- Bedrooms match (25 points)
            CASE
                WHEN property_bedrooms >= COALESCE((ip.preference_data->'bedrooms'->>'min')::INTEGER, 0)
                    AND property_bedrooms <= COALESCE((ip.preference_data->'bedrooms'->>'max')::INTEGER, 999)
                THEN 25
                ELSE 0
            END +

            -- Property type match (15 points) - check both singular and plural
            CASE
                WHEN EXISTS (
                    SELECT 1
                    FROM jsonb_array_elements_text(COALESCE(ip.preference_data->'property_types', '[]'::jsonb)) AS pt
                    WHERE LOWER(pt) IN (property_type_val, property_type_plural)
                )
                THEN 15
                ELSE 0
            END +

            -- Property licence match (15 points)
            CASE
                WHEN EXISTS (
                    SELECT 1
                    FROM jsonb_array_elements_text(COALESCE(ip.preference_data->'property_licenses', '[]'::jsonb)) AS pl
                    WHERE LOWER(pl) LIKE '%' || property_licence_val || '%'
                       OR property_licence_val LIKE '%' || LOWER(pl) || '%'
                )
                THEN 15
                ELSE 0
            END +

            -- Location match (15 points)
            CASE
                WHEN EXISTS (
                    SELECT 1
                    FROM jsonb_array_elements(COALESCE(ip.preference_data->'locations', '[]'::jsonb)) AS loc
                    WHERE LOWER(TRIM(loc->>'city')) = property_city_val
                )
                THEN 15
                ELSE 0
            END
        )::INTEGER as match_score
    FROM investor_preferences ip
    JOIN user_profiles up ON up.id = ip.investor_id
    WHERE
        ip.preference_data IS NOT NULL
        AND ip.is_active = true
        AND (
            -- Budget match (allow ±50% range for initial filtering)
            (property_rent >= COALESCE((ip.preference_data->'budget'->>'min')::NUMERIC, 0) * 0.5
                AND property_rent <= COALESCE((ip.preference_data->'budget'->>'max')::NUMERIC, 999999) * 1.5)
            OR
            -- Bedrooms match
            (property_bedrooms >= COALESCE((ip.preference_data->'bedrooms'->>'min')::INTEGER, 0)
                AND property_bedrooms <= COALESCE((ip.preference_data->'bedrooms'->>'max')::INTEGER, 999))
            OR
            -- Property type match - check both singular and plural
            EXISTS (
                SELECT 1
                FROM jsonb_array_elements_text(COALESCE(ip.preference_data->'property_types', '[]'::jsonb)) AS pt
                WHERE LOWER(pt) IN (property_type_val, property_type_plural)
            )
            OR
            -- Property licence match
            EXISTS (
                SELECT 1
                FROM jsonb_array_elements_text(COALESCE(ip.preference_data->'property_licenses', '[]'::jsonb)) AS pl
                WHERE LOWER(pl) LIKE '%' || property_licence_val || '%'
                   OR property_licence_val LIKE '%' || LOWER(pl) || '%'
            )
            OR
            -- Location match
            EXISTS (
                SELECT 1
                FROM jsonb_array_elements(COALESCE(ip.preference_data->'locations', '[]'::jsonb)) AS loc
                WHERE LOWER(TRIM(loc->>'city')) = property_city_val
            )
        )
        -- Filter by minimum match score (at least 20 points)
        AND (
            (
                -- Budget match (30 points)
                CASE
                    WHEN property_rent >= COALESCE((ip.preference_data->'budget'->>'min')::NUMERIC, 0)
                        AND property_rent <= COALESCE((ip.preference_data->'budget'->>'max')::NUMERIC, 999999)
                    THEN 30
                    ELSE 0
                END +

                -- Bedrooms match (25 points)
                CASE
                    WHEN property_bedrooms >= COALESCE((ip.preference_data->'bedrooms'->>'min')::INTEGER, 0)
                        AND property_bedrooms <= COALESCE((ip.preference_data->'bedrooms'->>'max')::INTEGER, 999)
                    THEN 25
                    ELSE 0
                END +

                -- Property type match (15 points)
                CASE
                    WHEN EXISTS (
                        SELECT 1
                        FROM jsonb_array_elements_text(COALESCE(ip.preference_data->'property_types', '[]'::jsonb)) AS pt
                        WHERE LOWER(pt) IN (property_type_val, property_type_plural)
                    )
                    THEN 15
                    ELSE 0
                END +

                -- Property licence match (15 points)
                CASE
                    WHEN EXISTS (
                        SELECT 1
                        FROM jsonb_array_elements_text(COALESCE(ip.preference_data->'property_licenses', '[]'::jsonb)) AS pl
                        WHERE LOWER(pl) LIKE '%' || property_licence_val || '%'
                           OR property_licence_val LIKE '%' || LOWER(pl) || '%'
                    )
                    THEN 15
                    ELSE 0
                END +

                -- Location match (15 points)
                CASE
                    WHEN EXISTS (
                        SELECT 1
                        FROM jsonb_array_elements(COALESCE(ip.preference_data->'locations', '[]'::jsonb)) AS loc
                        WHERE LOWER(TRIM(loc->>'city')) = property_city_val
                    )
                    THEN 15
                    ELSE 0
                END
            ) >= 20
        )
    ORDER BY match_score DESC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_matched_properties_for_investor TO authenticated;
GRANT EXECUTE ON FUNCTION find_matching_investors_for_property TO authenticated;
