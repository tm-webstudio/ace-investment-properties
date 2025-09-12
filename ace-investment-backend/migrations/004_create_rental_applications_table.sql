-- Create enum for application status
CREATE TYPE application_status_enum AS ENUM ('pending', 'reviewing', 'approved', 'rejected', 'withdrawn');

-- Create rental_applications table
CREATE TABLE rental_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
    status application_status_enum DEFAULT 'pending',
    application_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Personal Information
    current_address TEXT,
    employment_status TEXT,
    employer_name TEXT,
    job_title TEXT,
    annual_income DECIMAL(10, 2),
    employment_duration_months INTEGER,
    
    -- References
    previous_landlord_name TEXT,
    previous_landlord_phone TEXT,
    previous_landlord_email TEXT,
    reference1_name TEXT,
    reference1_phone TEXT,
    reference1_email TEXT,
    reference1_relationship TEXT,
    reference2_name TEXT,
    reference2_phone TEXT,
    reference2_email TEXT,
    reference2_relationship TEXT,
    
    -- Additional Information
    move_in_date DATE,
    lease_duration_preference INTEGER, -- months
    number_of_occupants INTEGER DEFAULT 1,
    pets_description TEXT,
    special_requests TEXT,
    
    -- Documents
    documents TEXT[], -- Array of document URLs (ID, pay stubs, references, etc.)
    
    -- Landlord notes and review
    landlord_notes TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES profiles(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Ensure admin is actually an admin
    CONSTRAINT check_admin_type CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = admin_id AND user_type = 'admin')
    ),
    
    -- Ensure positive income if provided
    CONSTRAINT check_positive_income CHECK (annual_income IS NULL OR annual_income > 0),
    
    -- Ensure reasonable number of occupants
    CONSTRAINT check_occupants CHECK (number_of_occupants > 0 AND number_of_occupants <= 20)
);

-- Create trigger for rental_applications table
CREATE TRIGGER update_rental_applications_updated_at BEFORE UPDATE ON rental_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE rental_applications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for rental_applications table
-- Admins can view their own applications
CREATE POLICY "Admins can view own applications" ON rental_applications
    FOR SELECT USING (
        auth.uid() = admin_id AND 
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin')
    );

-- Property owners can view applications for their properties
CREATE POLICY "Landlords can view applications for their properties" ON rental_applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM properties p 
            WHERE p.id = property_id 
            AND p.landlord_id = auth.uid()
        )
    );

-- Admins can create applications
CREATE POLICY "Admins can create applications" ON rental_applications
    FOR INSERT WITH CHECK (
        auth.uid() = admin_id AND 
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin')
    );

-- Admins can update their own applications (if still pending)
CREATE POLICY "Admins can update own pending applications" ON rental_applications
    FOR UPDATE USING (
        auth.uid() = admin_id AND 
        status IN ('pending', 'reviewing') AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin')
    );

-- Landlords can update applications for their properties (for review/approval)
CREATE POLICY "Landlords can update applications for their properties" ON rental_applications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM properties p 
            WHERE p.id = property_id 
            AND p.landlord_id = auth.uid()
        )
    );

-- Create indexes for better performance
CREATE INDEX rental_applications_admin_id_idx ON rental_applications(admin_id);
CREATE INDEX rental_applications_property_id_idx ON rental_applications(property_id);
CREATE INDEX rental_applications_status_idx ON rental_applications(status);
CREATE INDEX rental_applications_application_date_idx ON rental_applications(application_date);
CREATE INDEX rental_applications_created_at_idx ON rental_applications(created_at);

-- Create unique constraint to prevent duplicate pending applications
CREATE UNIQUE INDEX rental_applications_unique_pending_application 
ON rental_applications(admin_id, property_id) 
WHERE status IN ('pending', 'reviewing');