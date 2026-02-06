-- Migration: Rename county column to local_authority
-- This migration renames the 'county' column to 'local_authority' in the properties table
-- Reason: "Local Authority" is more relevant for UK property platforms (councils handle planning, tax, etc.)

-- Step 1: Rename the column
ALTER TABLE properties
RENAME COLUMN county TO local_authority;

-- Step 2: Add comment for documentation
COMMENT ON COLUMN properties.local_authority IS 'UK Local Authority (council) area where the property is located';
