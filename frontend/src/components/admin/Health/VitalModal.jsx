import React from "react";
import styles from "./VitalModal.module.css";
import clsx from "clsx";

function VitalModal({ vital, onClose }) {
  if (!vital) return null;

  const getBmiCategoryClass = (category) => {
    const categoryMap = {
      NORMAL: styles.badgeNormal,
      UNDERWEIGHT: styles.badgeUnderweight,
      OVERWEIGHT: styles.badgeOverweight,
      OBESITY: styles.badgeObesity,
    };
    return categoryMap[category] || '';
  };

  const getBpCategoryClass = (category) => {
    const categoryMap = {
      NORMAL: styles.badgeNormal,
      ELEVATED: styles.badgeElevated,
      HYPERTENSION_STAGE_1: styles.badgeHypertensionStage1,
      HYPERTENSION_STAGE_2: styles.badgeHypertensionStage2,
      HYPERTENSIVE_CRISIS: styles.badgeHypertensiveCrisis,
    };
    return categoryMap[category] || '';
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Vital Record Details</h2>
          <button className={styles.modalClose} onClick={onClose}>✕</button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.detailSection}>
            <h3>Patient Information</h3>
            <div className={styles.detailRow}>
              <span className={styles.label}>Name:</span>
              <span className={styles.value}>{vital.user?.fullName || "N/A"}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Email:</span>
              <span className={styles.value}>{vital.user?.email || "N/A"}</span>
            </div>
          </div>

          <div className={styles.detailSection}>
            <h3>Body Measurements</h3>
            <div className={styles.detailRow}>
              <span className={styles.label}>Weight:</span>
              <span className={styles.value}>{vital.weightKg?.toFixed(1) || "-"} kg</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Height:</span>
              <span className={styles.value}>{vital.heightCm?.toFixed(1) || "-"} cm</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>BMI:</span>
              <span className={styles.value}>
                {vital.bmi?.toFixed(1) || "-"}
                {vital.bmiCategory && (
                  <span className={clsx(styles.badge, getBmiCategoryClass(vital.bmiCategory))}>
                    {vital.bmiCategory}
                  </span>
                )}
              </span>
            </div>
          </div>

          <div className={styles.detailSection}>
            <h3>Vital Signs</h3>
            <div className={styles.detailRow}>
              <span className={styles.label}>Blood Pressure:</span>
              <span className={styles.value}>
                {vital.systolic && vital.diastolic ? `${vital.systolic}/${vital.diastolic}` : "-"} mmHg
                {vital.bpCategory && (
                  <span className={clsx(styles.badge, getBpCategoryClass(vital.bpCategory))}>
                    {vital.bpCategory}
                  </span>
                )}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Heart Rate:</span>
              <span className={styles.value}>{vital.heartRate || "-"} bpm</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Temperature:</span>
              <span className={styles.value}>{vital.temperature?.toFixed(1) || "-"}°C</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Oxygen Saturation:</span>
              <span className={styles.value}>{vital.oxygenSaturation || "-"}%</span>
            </div>
          </div>

          <div className={styles.detailSection}>
            <h3>Additional Information</h3>
            <div className={styles.detailRow}>
              <span className={styles.label}>Recorded At:</span>
              <span className={styles.value}>{new Date(vital.recordedAt).toLocaleString()}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Notes:</span>
              <span className={styles.value}>{vital.notes || "No notes"}</span>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.btnClose} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default VitalModal;
