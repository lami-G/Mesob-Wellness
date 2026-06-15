import React from "react";
import clsx from "clsx";
import styles from "./FeedbackModal.module.css";

function FeedbackModal({ feedback, onClose }) {
  if (!feedback) return null;

  const getNPSColor = (score) => {
    if (score >= 9) return "promoter";
    if (score >= 7) return "passive";
    return "detractor";
  };

  const renderRating = (rating) => {
    if (!rating) return "N/A";
    return (
      <div className={styles.ratingDisplay}>
        {[...Array(5)].map((_, i) => (
          <span key={i} className={clsx(styles.star, i < rating && styles.starFilled)}>
            ★
          </span>
        ))}
        <span className={styles.ratingValue}>{rating}/5</span>
      </div>
    );
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Feedback Details</h2>
          <button className={styles.modalClose} onClick={onClose}>✕</button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.detailSection}>
            <h3>Patient Information</h3>
            <div className={styles.detailRow}>
              <span className={styles.label}>Name:</span>
              <span className={styles.value}>{feedback.user?.fullName || "N/A"}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Email:</span>
              <span className={styles.value}>{feedback.user?.email || "N/A"}</span>
            </div>
          </div>

          <div className={styles.detailSection}>
            <h3>NPS & Satisfaction</h3>
            <div className={styles.detailRow}>
              <span className={styles.label}>NPS Score:</span>
              <span className={styles.value}>
                <span className={clsx(styles.badge, styles.badgeNps, styles[`badge${getNPSColor(feedback.npsScore).charAt(0).toUpperCase() + getNPSColor(feedback.npsScore).slice(1)}`])}>
                  {feedback.npsScore || "-"}/10
                </span>
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Feedback Type:</span>
              <span className={styles.value}>{feedback.feedbackType || "-"}</span>
            </div>
          </div>

          <div className={styles.detailSection}>
            <h3>Service Ratings</h3>
            <div className={styles.detailRow}>
              <span className={styles.label}>Service Quality:</span>
              <span className={styles.value}>{renderRating(feedback.serviceQuality)}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Staff Behavior:</span>
              <span className={styles.value}>{renderRating(feedback.staffBehavior)}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Cleanliness:</span>
              <span className={styles.value}>{renderRating(feedback.cleanliness)}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Wait Time:</span>
              <span className={styles.value}>{renderRating(feedback.waitTime)}</span>
            </div>
          </div>

          <div className={styles.detailSection}>
            <h3>Comments</h3>
            <div className={styles.commentsBox}>
              {feedback.comments || "No comments provided"}
            </div>
          </div>

          <div className={styles.detailSection}>
            <h3>Submission Date</h3>
            <div className={styles.detailRow}>
              <span className={styles.label}>Date:</span>
              <span className={styles.value}>{new Date(feedback.createdAt).toLocaleString()}</span>
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

export default FeedbackModal;
