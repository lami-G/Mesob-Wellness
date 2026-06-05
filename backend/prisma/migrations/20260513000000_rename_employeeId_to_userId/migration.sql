-- Rename employeeId column to userId in users table (if it exists)
-- Add NOT NULL constraint and unique constraint

-- This migration is now a no-op since userId is created directly in the previous migration
-- Keeping it for migration history consistency

-- Ensure userId has NOT NULL constraint
ALTER TABLE "users" ALTER COLUMN "userId" SET NOT NULL;

-- Ensure unique constraint exists on userId
CREATE UNIQUE INDEX IF NOT EXISTS "users_userId_key" ON "users"("userId");

-- Ensure index exists on userId
CREATE INDEX IF NOT EXISTS "users_userId_idx" ON "users"("userId");

