/**
 * Condition Calculator Utility
 * 
 * Analyzes vital signs and automatically detects health conditions
 * based on clinical thresholds.
 */

export interface VitalsInput {
  systolic?: number | null;
  diastolic?: number | null;
  bmi?: number | null;
  glucose?: number | null;
  glucoseType?: string | null;
  heartRate?: number | null;
  oxygenSaturation?: number | null;
}

/**
 * Calculate health conditions from vital signs
 * 
 * @param vitals - Vital sign measurements
 * @returns Array of detected condition strings
 */
export function calculateConditionsFromVitals(vitals: VitalsInput): string[] {
  const conditions: string[] = [];

  // Hypertension: BP >= 140/90 mmHg
  if (vitals.systolic && vitals.diastolic) {
    if (vitals.systolic >= 140 || vitals.diastolic >= 90) {
      conditions.push('hypertension');
    }
  }

  // Obesity and Overweight: BMI thresholds
  if (vitals.bmi) {
    if (vitals.bmi >= 30) {
      conditions.push('obesity');
    } else if (vitals.bmi >= 25) {
      conditions.push('overweight');
    }
  }

  // Diabetes/Prediabetes: Glucose thresholds based on type
  if (vitals.glucose) {
    const glucoseType = vitals.glucoseType?.toUpperCase() || 'FBS';
    
    if (glucoseType === 'FBS') {
      // Fasting Blood Sugar thresholds
      if (vitals.glucose >= 126) {
        conditions.push('diabetes');
      } else if (vitals.glucose >= 100) {
        conditions.push('prediabetes');
      }
    } else if (glucoseType === 'RBS') {
      // Random Blood Sugar (after meal) thresholds
      if (vitals.glucose > 200) {
        conditions.push('hyperglycemia');
      }
    }
  }

  // Heart Issues: Heart rate < 60 or > 100 bpm
  if (vitals.heartRate) {
    if (vitals.heartRate < 60 || vitals.heartRate > 100) {
      conditions.push('heart_issues');
    }
  }

  // Respiratory Issues: Oxygen saturation < 90%
  if (vitals.oxygenSaturation && vitals.oxygenSaturation < 90) {
    conditions.push('respiratory_issues');
  }

  return conditions;
}
