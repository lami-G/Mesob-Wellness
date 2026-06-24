-- ⚠️⚠️⚠️ IMMEDIATE DELETION - NO UNDO ⚠️⚠️⚠️
-- This deletes ALL data from today WITHOUT confirmation

DELETE FROM wellness_plans WHERE DATE(created_at) = CURRENT_DATE;
DELETE FROM vital_records WHERE DATE(recorded_at) = CURRENT_DATE;
DELETE FROM patient_conditions WHERE DATE(created_at) = CURRENT_DATE OR DATE(updated_at) = CURRENT_DATE;
DELETE FROM appointments WHERE DATE(scheduled_at) = CURRENT_DATE OR DATE(created_at) = CURRENT_DATE;
DELETE FROM audit_logs WHERE DATE(timestamp) = CURRENT_DATE;

-- Show what was deleted
SELECT 
  'Deletion complete' as status,
  CURRENT_TIMESTAMP as deleted_at;
