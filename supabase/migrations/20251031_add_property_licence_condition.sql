-- Add property_licence and property_condition columns to properties table

ALTER TABLE properties
ADD COLUMN IF NOT EXISTS property_licence TEXT,
ADD COLUMN IF NOT EXISTS property_condition TEXT;

-- Add comments for documentation
COMMENT ON COLUMN properties.property_licence IS 'Type of property licence (hmo, c2, selective, additional, other, none)';
COMMENT ON COLUMN properties.property_condition IS 'Condition of the property (excellent, newly-renovated, good, fair, needs-work)';
