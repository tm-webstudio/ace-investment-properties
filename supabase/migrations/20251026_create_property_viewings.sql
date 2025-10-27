-- Create property_viewings table
CREATE TABLE IF NOT EXISTS property_viewings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    landlord_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    viewing_date DATE NOT NULL,
    viewing_time TIME NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'completed')),
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    user_phone TEXT NOT NULL,
    message TEXT,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    viewed_by_user BOOLEAN DEFAULT FALSE,
    viewed_by_landlord BOOLEAN DEFAULT FALSE,
    
    -- Ensure no duplicate bookings for same user, property, date, time
    CONSTRAINT unique_user_property_datetime UNIQUE (user_id, property_id, viewing_date, viewing_time),
    
    -- Ensure viewing is in future
    CONSTRAINT viewing_date_future CHECK (viewing_date >= CURRENT_DATE)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_viewings_property ON property_viewings(property_id);
CREATE INDEX IF NOT EXISTS idx_viewings_user ON property_viewings(user_id);
CREATE INDEX IF NOT EXISTS idx_viewings_landlord ON property_viewings(landlord_id);
CREATE INDEX IF NOT EXISTS idx_viewings_status ON property_viewings(status);
CREATE INDEX IF NOT EXISTS idx_viewings_date ON property_viewings(viewing_date);
CREATE INDEX IF NOT EXISTS idx_viewings_datetime ON property_viewings(viewing_date, viewing_time);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_property_viewings_updated_at
    BEFORE UPDATE ON property_viewings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE property_viewings ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view their own viewing requests
CREATE POLICY "Users can view their own viewings"
    ON property_viewings FOR SELECT
    USING (user_id = auth.uid());

-- Landlords can view viewings for their properties
CREATE POLICY "Landlords can view viewings for their properties"
    ON property_viewings FOR SELECT
    USING (
        landlord_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM properties p
            WHERE p.id = property_viewings.property_id
            AND p.landlord_id = auth.uid()
        )
    );

-- Admins can view all viewings
CREATE POLICY "Admins can view all viewings"
    ON property_viewings FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND user_type = 'admin'
        )
    );

-- Service role can insert viewings (for API)
CREATE POLICY "Service role can insert viewings"
    ON property_viewings FOR INSERT
    WITH CHECK (TRUE);

-- Users can update their own viewings (cancel)
CREATE POLICY "Users can update their own viewings"
    ON property_viewings FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Landlords can update viewings for their properties
CREATE POLICY "Landlords can update viewings for their properties"
    ON property_viewings FOR UPDATE
    USING (
        landlord_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM properties p
            WHERE p.id = property_viewings.property_id
            AND p.landlord_id = auth.uid()
        )
    )
    WITH CHECK (
        landlord_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM properties p
            WHERE p.id = property_viewings.property_id
            AND p.landlord_id = auth.uid()
        )
    );

-- Service role can update viewings (for API)
CREATE POLICY "Service role can update viewings"
    ON property_viewings FOR UPDATE
    WITH CHECK (TRUE);

-- Admins can update all viewings
CREATE POLICY "Admins can update all viewings"
    ON property_viewings FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND user_type = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND user_type = 'admin'
        )
    );

-- Add helpful comment
COMMENT ON TABLE property_viewings IS 'Stores property viewing booking requests and their status';