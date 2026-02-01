-- Update function to make HMO and House property types interchangeable
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
    property_city_val TEXT;
    property_type_variants TEXT[];
BEGIN
    -- Get property details
    SELECT
        properties.monthly_rent,
        properties.bedrooms,
        properties.property_type,
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

    -- Handle singular to plural conversion for property types
    property_type_plural := CASE
        WHEN property_type_val = 'house' THEN 'houses'
        WHEN property_type_val = 'flat' THEN 'flats'
        WHEN property_type_val = 'block' THEN 'blocks'
        WHEN property_type_val = 'apartment' THEN 'apartments'
        WHEN property_type_val = 'hmo' THEN 'hmos'
        ELSE property_type_val || 's'
    END;

    -- Create array of type variants including HMO/House equivalence
    property_type_variants := ARRAY[property_type_val, property_type_plural];

    -- Add HMO/House equivalence
    IF property_type_val IN ('house', 'houses') THEN
        property_type_variants := property_type_variants || ARRAY['hmo', 'hmos'];
    ELSIF property_type_val IN ('hmo', 'hmos') THEN
        property_type_variants := property_type_variants || ARRAY['house', 'houses'];
    END IF;

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

            -- Property type match (20 points) - check all variants including HMO/House equivalence
            CASE
                WHEN EXISTS (
                    SELECT 1
                    FROM jsonb_array_elements_text(COALESCE(ip.preference_data->'property_types', '[]'::jsonb)) AS pt
                    WHERE LOWER(pt) = ANY(property_type_variants)
                )
                THEN 20
                ELSE 0
            END +

            -- Location match (25 points)
            CASE
                WHEN EXISTS (
                    SELECT 1
                    FROM jsonb_array_elements(COALESCE(ip.preference_data->'locations', '[]'::jsonb)) AS loc
                    WHERE LOWER(TRIM(loc->>'city')) = property_city_val
                )
                THEN 25
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
            -- Property type match - check all variants including HMO/House equivalence
            EXISTS (
                SELECT 1
                FROM jsonb_array_elements_text(COALESCE(ip.preference_data->'property_types', '[]'::jsonb)) AS pt
                WHERE LOWER(pt) = ANY(property_type_variants)
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

                -- Property type match (20 points)
                CASE
                    WHEN EXISTS (
                        SELECT 1
                        FROM jsonb_array_elements_text(COALESCE(ip.preference_data->'property_types', '[]'::jsonb)) AS pt
                        WHERE LOWER(pt) = ANY(property_type_variants)
                    )
                    THEN 20
                    ELSE 0
                END +

                -- Location match (25 points)
                CASE
                    WHEN EXISTS (
                        SELECT 1
                        FROM jsonb_array_elements(COALESCE(ip.preference_data->'locations', '[]'::jsonb)) AS loc
                        WHERE LOWER(TRIM(loc->>'city')) = property_city_val
                    )
                    THEN 25
                    ELSE 0
                END
            ) >= 20
        )
    ORDER BY match_score DESC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION find_matching_investors_for_property TO authenticated;
