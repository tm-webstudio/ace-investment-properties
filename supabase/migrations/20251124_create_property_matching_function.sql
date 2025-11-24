-- Create function to match properties with investor preferences
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

    -- Return matched properties with scoring
    RETURN QUERY
    SELECT
        to_jsonb(p.*) as property_data,
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

            -- Property type match (15 points)
            CASE
                WHEN array_length(property_types, 1) IS NULL OR array_length(property_types, 1) = 0 THEN 15
                WHEN LOWER(p.property_type) = ANY(SELECT LOWER(unnest(property_types))) THEN 15
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
        ) as match_score,

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
                SELECT 'Preferred location' as reason
                WHERE LOWER(TRIM(p.city)) = ANY(locations)

                UNION ALL
                SELECT 'Immediately available' as reason
                WHERE availability_req = 'immediate' AND (p.availability = 'vacant' OR p.available_date <= CURRENT_DATE)

                UNION ALL
                SELECT 'Has parking' as reason
                WHERE 'parking' = ANY(additional_reqs) AND p.amenities @> ARRAY['Parking']
            ) reasons
        ) as match_reasons

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
            -- Or location match
            (array_length(locations, 1) IS NULL OR LOWER(TRIM(p.city)) = ANY(locations))
        )
    HAVING (
        -- Base score for being active
        CASE WHEN p.status::text = 'active' THEN 20 ELSE 0 END +
        CASE
            WHEN p.monthly_rent >= budget_min AND p.monthly_rent <= budget_max THEN 30
            WHEN p.monthly_rent < budget_min THEN GREATEST(0, 30 - ((budget_min - p.monthly_rent) / NULLIF(budget_min, 0) * 30)::INTEGER)
            WHEN p.monthly_rent > budget_max THEN GREATEST(0, 30 - ((p.monthly_rent - budget_max) / NULLIF(budget_max, 1) * 30)::INTEGER)
            ELSE 0
        END +
        CASE
            WHEN p.bedrooms::INTEGER >= bedrooms_min AND p.bedrooms::INTEGER <= bedrooms_max THEN 25
            WHEN p.bedrooms::INTEGER < bedrooms_min THEN GREATEST(0, 25 - ((bedrooms_min - p.bedrooms::INTEGER) * 8))
            WHEN p.bedrooms::INTEGER > bedrooms_max THEN GREATEST(0, 25 - ((p.bedrooms::INTEGER - bedrooms_max) * 5))
            ELSE 0
        END +
        CASE
            WHEN array_length(property_types, 1) IS NULL OR array_length(property_types, 1) = 0 THEN 15
            WHEN LOWER(p.property_type) = ANY(SELECT LOWER(unnest(property_types))) THEN 15
            ELSE 0
        END +
        CASE
            WHEN array_length(locations, 1) IS NULL OR array_length(locations, 1) = 0 THEN 10
            WHEN LOWER(TRIM(p.city)) = ANY(locations) THEN 10
            ELSE 0
        END +
        CASE
            WHEN availability_req IS NULL THEN 0
            WHEN availability_req = 'immediate' AND (p.availability = 'vacant' OR p.available_date <= CURRENT_DATE) THEN 10
            ELSE 0
        END +
        CASE
            WHEN 'parking' = ANY(additional_reqs) AND p.amenities @> ARRAY['Parking'] THEN 5
            ELSE 0
        END
    ) >= min_match_score
    ORDER BY match_score DESC, p.created_at DESC
    LIMIT page_limit
    OFFSET page_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_matched_properties_for_investor TO authenticated;
