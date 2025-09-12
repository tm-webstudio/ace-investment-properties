-- Create favorites table (for saved properties)
CREATE TABLE favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
    notes TEXT, -- User's personal notes about the property
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Ensure unique favorite per user per property
    UNIQUE(user_id, property_id)
);

-- Create trigger for favorites table
CREATE TRIGGER update_favorites_updated_at BEFORE UPDATE ON favorites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for favorites table
-- Users can view their own favorites
CREATE POLICY "Users can view own favorites" ON favorites
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own favorites
CREATE POLICY "Users can create own favorites" ON favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own favorites
CREATE POLICY "Users can update own favorites" ON favorites
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own favorites
CREATE POLICY "Users can delete own favorites" ON favorites
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX favorites_user_id_idx ON favorites(user_id);
CREATE INDEX favorites_property_id_idx ON favorites(property_id);
CREATE INDEX favorites_created_at_idx ON favorites(created_at);