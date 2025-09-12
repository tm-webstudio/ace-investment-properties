-- Create enum for investment status
CREATE TYPE investment_status_enum AS ENUM ('pending', 'active', 'completed', 'cancelled');

-- Create investments table
CREATE TABLE investments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    investor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    percentage_share DECIMAL(5, 2), -- Percentage of property owned
    expected_return DECIMAL(5, 2), -- Expected annual return percentage
    investment_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    maturity_date DATE,
    status investment_status_enum DEFAULT 'pending',
    contract_url TEXT, -- URL to investment contract document
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Ensure investor is actually an investor
    CONSTRAINT check_investor_type CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = investor_id AND user_type = 'investor')
    ),
    
    -- Ensure positive investment amount
    CONSTRAINT check_positive_amount CHECK (amount > 0),
    
    -- Ensure reasonable percentage share
    CONSTRAINT check_percentage_share CHECK (percentage_share > 0 AND percentage_share <= 100)
);

-- Create trigger for investments table
CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON investments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for investments table
-- Investors can view their own investments
CREATE POLICY "Investors can view own investments" ON investments
    FOR SELECT USING (
        auth.uid() = investor_id AND 
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'investor')
    );

-- Property owners can view investments in their properties
CREATE POLICY "Landlords can view investments in their properties" ON investments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM properties p 
            WHERE p.id = property_id 
            AND p.landlord_id = auth.uid()
        )
    );

-- Investors can create investments
CREATE POLICY "Investors can create investments" ON investments
    FOR INSERT WITH CHECK (
        auth.uid() = investor_id AND 
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'investor')
    );

-- Investors can update their own investments (before they're active)
CREATE POLICY "Investors can update own pending investments" ON investments
    FOR UPDATE USING (
        auth.uid() = investor_id AND 
        status = 'pending' AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'investor')
    );

-- Create indexes for better performance
CREATE INDEX investments_investor_id_idx ON investments(investor_id);
CREATE INDEX investments_property_id_idx ON investments(property_id);
CREATE INDEX investments_status_idx ON investments(status);
CREATE INDEX investments_investment_date_idx ON investments(investment_date);
CREATE INDEX investments_created_at_idx ON investments(created_at);

-- Create unique constraint to prevent duplicate investments
CREATE UNIQUE INDEX investments_unique_active_investment 
ON investments(investor_id, property_id) 
WHERE status = 'active';