-- Add company_name column to user_profiles table for investors
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS company_name TEXT;

-- Create index for better performance when querying by company name
CREATE INDEX IF NOT EXISTS user_profiles_company_name_idx ON user_profiles(company_name);

-- Add comment to column
COMMENT ON COLUMN user_profiles.company_name IS 'Company name for investor users';
