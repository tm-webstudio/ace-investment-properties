-- Add admin policies for properties table
-- Admins can view all properties
CREATE POLICY "Admins can view all properties" ON properties
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND user_type = 'admin')
    );

-- Admins can update all properties (for approval system)
CREATE POLICY "Admins can update all properties" ON properties
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND user_type = 'admin')
    );

-- Admins can delete any property
CREATE POLICY "Admins can delete all properties" ON properties
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND user_type = 'admin')
    );
