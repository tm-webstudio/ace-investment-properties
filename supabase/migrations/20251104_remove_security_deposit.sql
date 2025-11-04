-- Migration: Remove security_deposit column from properties table
-- Date: 2025-11-04
-- Description: Removes the security_deposit column as it's no longer needed in the application

-- Drop the security_deposit column from properties table
ALTER TABLE properties
DROP COLUMN IF EXISTS security_deposit;

-- Note: This migration removes the security_deposit column permanently.
-- Make sure to backup your data before running this migration if you need to preserve the security deposit information.
