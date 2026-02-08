-- Migration: Backfill published_at for existing active properties
-- Date: 2026-02-08
-- Purpose: Set published_at timestamp for properties that were approved before this field was being set

-- Update active properties with NULL published_at
-- Use updated_at as the best approximation of when they were approved
UPDATE properties
SET published_at = updated_at
WHERE status = 'active'
  AND published_at IS NULL;

-- Log results
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE 'Updated % active properties with published_at timestamp', updated_count;
END $$;
