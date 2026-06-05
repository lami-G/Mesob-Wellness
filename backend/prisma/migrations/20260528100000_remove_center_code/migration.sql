-- Drop the index on code
DROP INDEX IF EXISTS "centers_code_idx";

-- Drop the unique constraint on code
ALTER TABLE "centers" DROP CONSTRAINT IF EXISTS "centers_code_key";

-- Remove the code column
ALTER TABLE "centers" DROP COLUMN IF EXISTS "code";
