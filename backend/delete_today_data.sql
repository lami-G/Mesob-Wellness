-- ⚠️ WARNING: This will DELETE all data created today (June 24, 2026)
-- Make sure you want to do this before running!

-- Set today's date range (adjust timezone if needed)
-- This assumes your database timezone matches your local timezone (GMT+3)

BEGIN;

-- 1. Delete wellness plans created today
DELETE FROM wellness_plans
WHERE DATE(created_at) = CURRENT_DATE;

-- 2. Delete vital records created today
DELETE FROM vital_records
WHERE DATE(recorded_at) = CURRENT_DATE;

-- 3. Delete patient conditions updated today
DELETE FROM patient_conditions
WHERE DATE(created_at) = CURRENT_DATE OR DATE(updated_at) = CURRENT_DATE;

-- 4. Delete appointments scheduled for today or created today
DELETE FROM appointments
WHERE DATE(scheduled_at) = CURRENT_DATE OR DATE(created_at) = CURRENT_DATE;

-- 5. Delete audit logs from today (optional - for cleanup)
DELETE FROM audit_logs
WHERE DATE(timestamp) = CURRENT_DATE;

-- Check what will be deleted (run this first before committing)
SELECT 
  (SELECT COUNT(*) FROM wellness_plans WHERE DATE(created_at) = CURRENT_DATE) as wellness_plans_deleted,
  (SELECT COUNT(*) FROM vital_records WHERE DATE(recorded_at) = CURRENT_DATE) as vital_records_deleted,
  (SELECT COUNT(*) FROM patient_conditions WHERE DATE(created_at) = CURRENT_DATE OR DATE(updated_at) = CURRENT_DATE) as patient_conditions_deleted,
  (SELECT COUNT(*) FROM appointments WHERE DATE(scheduled_at) = CURRENT_DATE OR DATE(created_at) = CURRENT_DATE) as appointments_deleted,
  (SELECT COUNT(*) FROM audit_logs WHERE DATE(timestamp) = CURRENT_DATE) as audit_logs_deleted;

-- Uncomment the line below to commit the deletion
-- COMMIT;

-- If you want to cancel, run:
ROLLBACK;
