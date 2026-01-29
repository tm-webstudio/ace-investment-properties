-- Function to find matching investors for a property
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
    property_city_val TEXT;
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
                WHEN property_rent >= COALESCE((ip.preference_data->>'budget_min')::NUMERIC, (ip.preference_data->'budget'->>'min')::NUMERIC, 0)
                    AND property_rent <= COALESCE((ip.preference_data->>'budget_max')::NUMERIC, (ip.preference_data->'budget'->>'max')::NUMERIC, 999999)
                THEN 30
                ELSE 0
            END +

            -- Bedrooms match (25 points)
            CASE
                WHEN property_bedrooms >= COALESCE((ip.preference_data->>'bedrooms_min')::INTEGER, (ip.preference_data->'bedrooms'->>'min')::INTEGER, 0)
                    AND property_bedrooms <= COALESCE((ip.preference_data->>'bedrooms_max')::INTEGER, (ip.preference_data->'bedrooms'->>'max')::INTEGER, 999)
                THEN 25
                ELSE 0
            END +

            -- Property type match (20 points)
            CASE
                WHEN EXISTS (
                    SELECT 1
                    FROM jsonb_array_elements_text(COALESCE(ip.preference_data->'property_types', '[]'::jsonb)) AS pt
                    WHERE LOWER(pt) = property_type_val
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
            -- Budget match
            (property_rent >= COALESCE((ip.preference_data->>'budget_min')::NUMERIC, (ip.preference_data->'budget'->>'min')::NUMERIC, 0) * 0.5
                AND property_rent <= COALESCE((ip.preference_data->>'budget_max')::NUMERIC, (ip.preference_data->'budget'->>'max')::NUMERIC, 999999) * 1.5)
            OR
            -- Bedrooms match
            (property_bedrooms >= COALESCE((ip.preference_data->>'bedrooms_min')::INTEGER, (ip.preference_data->'bedrooms'->>'min')::INTEGER, 0)
                AND property_bedrooms <= COALESCE((ip.preference_data->>'bedrooms_max')::INTEGER, (ip.preference_data->'bedrooms'->>'max')::INTEGER, 999))
            OR
            -- Property type match
            EXISTS (
                SELECT 1
                FROM jsonb_array_elements_text(COALESCE(ip.preference_data->'property_types', '[]'::jsonb)) AS pt
                WHERE LOWER(pt) = property_type_val
            )
            OR
            -- Location match
            EXISTS (
                SELECT 1
                FROM jsonb_array_elements(COALESCE(ip.preference_data->'locations', '[]'::jsonb)) AS loc
                WHERE LOWER(TRIM(loc->>'city')) = property_city_val
            )
        )
        -- Filter by minimum match score
        AND (
            (
                -- Budget match (30 points)
                CASE
                    WHEN property_rent >= COALESCE((ip.preference_data->>'budget_min')::NUMERIC, (ip.preference_data->'budget'->>'min')::NUMERIC, 0)
                        AND property_rent <= COALESCE((ip.preference_data->>'budget_max')::NUMERIC, (ip.preference_data->'budget'->>'max')::NUMERIC, 999999)
                    THEN 30
                    ELSE 0
                END +

                -- Bedrooms match (25 points)
                CASE
                    WHEN property_bedrooms >= COALESCE((ip.preference_data->>'bedrooms_min')::INTEGER, (ip.preference_data->'bedrooms'->>'min')::INTEGER, 0)
                        AND property_bedrooms <= COALESCE((ip.preference_data->>'bedrooms_max')::INTEGER, (ip.preference_data->'bedrooms'->>'max')::INTEGER, 999)
                    THEN 25
                    ELSE 0
                END +

                -- Property type match (20 points)
                CASE
                    WHEN EXISTS (
                        SELECT 1
                        FROM jsonb_array_elements_text(COALESCE(ip.preference_data->'property_types', '[]'::jsonb)) AS pt
                        WHERE LOWER(pt) = property_type_val
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
