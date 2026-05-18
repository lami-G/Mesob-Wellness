-- Add new appointment statuses: WAITING and IN_SERVICE
-- This migration adds the new statuses to support the updated workflow

-- Add WAITING and IN_SERVICE to the AppointmentStatus enum
ALTER TYPE "AppointmentStatus" ADD VALUE IF NOT EXISTS 'WAITING';
ALTER TYPE "AppointmentStatus" ADD VALUE IF NOT EXISTS 'IN_SERVICE';

-- NOTE: Update existing PENDING appointments to WAITING in a separate step
-- after this migration is committed.
