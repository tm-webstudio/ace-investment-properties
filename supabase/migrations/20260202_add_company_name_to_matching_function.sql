-- Update find_matching_investors_for_property function to return company_name
CREATE OR REPLACE FUNCTION find_matching_investors_for_property(p_property_id UUID)
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  company_name TEXT,
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
        up.company_name,
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
    LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
