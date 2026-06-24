-- Check what data exists for today before deleting
-- Run this first to see what will be affected

SELECT '=== WELLNESS PLANS CREATED TODAY ===' as info;
SELECT id, user_id, created_at, LEFT(plan_text, 50) as plan_preview
FROM wellness_plans
WHERE DATE(created_at) = CURRENT_DATE
ORDER BY created_at DESC;

SELECT '=== VITAL RECORDS CREATED TODAY ===' as info;
SELECT id, user_id, recorded_by, weight_kg, systolic, diastolic, recorded_at
FROM vital_records
WHERE DATE(recorded_at) = CURRENT_DATE
ORDER BY recorded_at DESC;

SELECT '=== PATIENT CONDITIONS TODAY ===' as info;
SELECT user_id, condition, nurse_approved, created_at
FROM patient_conditions
WHERE DATE(created_at) = CURRENT_DATE OR DATE(updated_at) = CURRENT_DATE
ORDER BY created_at DESC;

SELECT '=== APPOINTMENTS TODAY ===' as info;
SELECT id, user_id, scheduled_at, status, reason
FROM appointments
WHERE DATE(scheduled_at) = CURRENT_DATE OR DATE(created_at) = CURRENT_DATE
ORDER BY scheduled_at DESC;

SELECT '=== SUMMARY ===' as info;
SELECT 
  (SELECT COUNT(*) FROM wellness_plans WHERE DATE(created_at) = CURRENT_DATE) as wellness_plans_count,
  (SELECT COUNT(*) FROM vital_records WHERE DATE(recorded_at) = CURRENT_DATE) as vital_records_count,
  (SELECT COUNT(*) FROM patient_conditions WHERE DATE(created_at) = CURRENT_DATE OR DATE(updated_at) = CURRENT_DATE) as patient_conditions_count,
  (SELECT COUNT(*) FROM appointments WHERE DATE(scheduled_at) = CURRENT_DATE OR DATE(created_at) = CURRENT_DATE) as appointments_count;
