-- Add glucose field and glucoseType to vital_records if they don't exist
ALTER TABLE "vital_records" ADD COLUMN IF NOT EXISTS "glucose" INTEGER;
ALTER TABLE "vital_records" ADD COLUMN IF NOT EXISTS "glucoseType" TEXT;


