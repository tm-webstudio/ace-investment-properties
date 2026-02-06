-- Rollback Migration: Rename local_authority back to county
-- This rollback script reverts the column rename in case of issues

ALTER TABLE properties
RENAME COLUMN local_authority TO county;

-- Remove the comment
COMMENT ON COLUMN properties.state IS NULL;
