-- Create viewings table for property viewings/appointments
CREATE TABLE viewings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    viewing_date DATE NOT NULL,
    viewing_time TIME NOT NULL,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
    notes TEXT,
    landlord_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create notifications table for user notifications
CREATE TABLE notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'general' CHECK (type IN ('general', 'property_update', 'application_update', 'investment_update', 'viewing_reminder', 'system')),
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT, -- Optional URL for notification action
    metadata JSONB, -- Additional notification data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create property_analytics table for tracking property performance
CREATE TABLE property_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    views INTEGER DEFAULT 0,
    inquiries INTEGER DEFAULT 0,
    favorites INTEGER DEFAULT 0,
    applications INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Unique constraint to prevent duplicate entries per property per date
    UNIQUE(property_id, date)
);

-- Add triggers for the new tables
CREATE TRIGGER update_viewings_updated_at BEFORE UPDATE ON viewings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for new tables
ALTER TABLE viewings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies for viewings
CREATE POLICY "Users can view own viewings" ON viewings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Landlords can view viewings for their properties" ON viewings
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM properties p WHERE p.id = property_id AND p.landlord_id = auth.uid())
    );

CREATE POLICY "Users can create viewings" ON viewings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own viewings" ON viewings
    FOR UPDATE USING (auth.uid() = user_id OR 
        EXISTS (SELECT 1 FROM properties p WHERE p.id = property_id AND p.landlord_id = auth.uid())
    );

-- RLS policies for notifications
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT WITH CHECK (true); -- Allow system to create notifications

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for property_analytics
CREATE POLICY "Landlords can view analytics for their properties" ON property_analytics
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM properties p WHERE p.id = property_id AND p.landlord_id = auth.uid())
    );

CREATE POLICY "System can insert analytics" ON property_analytics
    FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update analytics" ON property_analytics
    FOR UPDATE USING (true);

-- Create indexes for the new tables
CREATE INDEX viewings_property_id_idx ON viewings(property_id);
CREATE INDEX viewings_user_id_idx ON viewings(user_id);
CREATE INDEX viewings_date_idx ON viewings(viewing_date);
CREATE INDEX viewings_status_idx ON viewings(status);

CREATE INDEX notifications_user_id_idx ON notifications(user_id);
CREATE INDEX notifications_is_read_idx ON notifications(is_read);
CREATE INDEX notifications_created_at_idx ON notifications(created_at);
CREATE INDEX notifications_type_idx ON notifications(type);

CREATE INDEX property_analytics_property_id_idx ON property_analytics(property_id);
CREATE INDEX property_analytics_date_idx ON property_analytics(date);

-- Function to automatically create/update daily analytics
CREATE OR REPLACE FUNCTION update_property_analytics()
RETURNS TRIGGER AS $$
BEGIN
    -- This function can be expanded to automatically track various metrics
    -- For now, it's a placeholder for future analytics automation
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;