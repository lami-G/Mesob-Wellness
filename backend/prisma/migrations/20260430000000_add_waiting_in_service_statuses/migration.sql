-- Add WAITING and IN_SERVICE statuses to AppointmentStatus enum
-- This migration adds new appointment statuses for better workflow tracking

-- Note: This migration was previously failed and has been resolved
-- The enum values may already exist in the database

DO $$
BEGIN
    -- Add WAITING status if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'WAITING' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'AppointmentStatus')
    ) THEN
        ALTER TYPE "AppointmentStatus" ADD VALUE 'WAITING';
    END IF;

    -- Add IN_SERVICE status if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'IN_SERVICE' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'AppointmentStatus')
    ) THEN
        ALTER TYPE "AppointmentStatus" ADD VALUE 'IN_SERVICE';
    END IF;
END $$;
