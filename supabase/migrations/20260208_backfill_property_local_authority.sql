-- Migration: Backfill missing local_authority in properties
-- Date: 2026-02-08
-- Purpose: Populate NULL local_authority fields with city values for active properties

-- Update properties with NULL local_authority
UPDATE properties
SET local_authority = city
WHERE local_authority IS NULL
  AND city IS NOT NULL
  AND status = 'active';

-- Log results
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE 'Updated % properties with missing local_authority', updated_count;
END $$;

-- Verify no active properties have NULL local_authority
DO $$
DECLARE
  null_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO null_count
  FROM properties
  WHERE status = 'active' AND local_authority IS NULL;

  IF null_count > 0 THEN
    RAISE WARNING '% active properties still have NULL local_authority', null_count;
  ELSE
    RAISE NOTICE 'All active properties now have valid local_authority';
  END IF;
END $$;
