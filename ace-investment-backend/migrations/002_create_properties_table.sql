-- Create enum for property types
CREATE TYPE property_type_enum AS ENUM ('Studio', '1BR', '2BR', '3BR+', 'House');

-- Create enum for property status
CREATE TYPE property_status_enum AS ENUM ('draft', 'pending_approval', 'available', 'rented', 'maintenance', 'archived');

-- Create properties table
CREATE TABLE properties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    landlord_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT,
    country TEXT DEFAULT 'United Kingdom',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    price DECIMAL(10, 2) NOT NULL,
    deposit DECIMAL(10, 2),
    property_type property_type_enum NOT NULL,
    bedrooms INTEGER DEFAULT 0,
    bathrooms DECIMAL(3, 1) DEFAULT 0,
    square_feet INTEGER,
    furnished BOOLEAN DEFAULT FALSE,
    pets_allowed BOOLEAN DEFAULT FALSE,
    smoking_allowed BOOLEAN DEFAULT FALSE,
    available_date DATE,
    lease_duration_months INTEGER DEFAULT 12,
    amenities TEXT[], -- Array of amenities
    images TEXT[], -- Array of image URLs
    virtual_tour_url TEXT,
    status property_status_enum DEFAULT 'draft',
    featured BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create trigger for properties table
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for properties table
-- Anyone can view available properties
CREATE POLICY "Anyone can view available properties" ON properties
    FOR SELECT USING (status = 'available');

-- Landlords can view their own properties (all statuses)
CREATE POLICY "Landlords can view own properties" ON properties
    FOR SELECT USING (
        auth.uid() = landlord_id AND 
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'landlord')
    );

-- Landlords can insert their own properties
CREATE POLICY "Landlords can insert own properties" ON properties
    FOR INSERT WITH CHECK (
        auth.uid() = landlord_id AND 
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'landlord')
    );

-- Landlords can update their own properties
CREATE POLICY "Landlords can update own properties" ON properties
    FOR UPDATE USING (
        auth.uid() = landlord_id AND 
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'landlord')
    );

-- Landlords can delete their own properties
CREATE POLICY "Landlords can delete own properties" ON properties
    FOR DELETE USING (
        auth.uid() = landlord_id AND 
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'landlord')
    );

-- Admins can view all properties (for approval system)
-- CREATE POLICY "Admins can view all properties" ON properties
--     FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Create indexes for better performance
CREATE INDEX properties_landlord_id_idx ON properties(landlord_id);
CREATE INDEX properties_city_idx ON properties(city);
CREATE INDEX properties_property_type_idx ON properties(property_type);
CREATE INDEX properties_status_idx ON properties(status);
CREATE INDEX properties_price_idx ON properties(price);
CREATE INDEX properties_available_date_idx ON properties(available_date);
CREATE INDEX properties_created_at_idx ON properties(created_at);

-- Create GIN index for amenities array searches
CREATE INDEX properties_amenities_gin_idx ON properties USING GIN(amenities);