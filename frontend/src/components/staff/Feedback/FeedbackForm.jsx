import React, { useState } from 'react';
import clsx from 'clsx';
import api from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import styles from './FeedbackForm.module.css';

function FeedbackForm() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    npsScore: null,
    serviceQuality: null,
    staffBehavior: null,
    cleanliness: null,
    waitTime: null,
    comments: '',
  });

  const handleRatingChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCommentChange = (e) => {
    setFormData(prev => ({
      ...prev,
      comments: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.npsScore === null) {
      alert('Please provide your NPS rating');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        userId: user.id,
        npsScore: formData.npsScore,
        feedbackType: 'SERVICE',
      };

      // Only include optional fields if they have values
      if (formData.serviceQuality !== null) payload.serviceQuality = formData.serviceQuality;
      if (formData.staffBehavior !== null) payload.staffBehavior = formData.staffBehavior;
      if (formData.cleanliness !== null) payload.cleanliness = formData.cleanliness;
      if (formData.waitTime !== null) payload.waitTime = formData.waitTime;
      if (formData.comments) payload.comments = formData.comments;

      await api.post('/api/v1/feedback', payload);

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setFormData({
          npsScore: null,
          serviceQuality: null,
          staffBehavior: null,
          cleanliness: null,
          waitTime: null,
          comments: '',
        });
      }, 2500);
    } catch (err) {
      console.error('Feedback submission error:', err);
      const errorMsg = err.response?.data?.message || 'Failed to submit feedback';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const RatingScale = ({ label, field, value, onChange, description }) => {
    return (
      <div className={styles.ratingGroup}>
        <div className={styles.ratingHeader}>
          <label className={styles.ratingLabel}>{label}</label>
          {description && <p className={styles.ratingDescription}>{description}</p>}
        </div>
        <div className={styles.ratingButtons}>
          {[1, 2, 3, 4, 5].map(score => (
            <button
              key={score}
              type="button"
              className={clsx(styles.ratingButton, { [styles.active]: value === score })}
              onClick={() => onChange(field, score)}
              title={`Rate ${score} out of 5`}
            >
              <span className={styles.ratingNumber}>{score}</span>
              <span className={styles.ratingStars}>{'★'.repeat(score)}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const getNpsDescription = (score) => {
    if (score === null) return 'Select a score';
    if (score <= 6) return '😞 Detractor - We\'re sorry to hear that';
    if (score <= 8) return '😐 Passive - Thank you for your feedback';
    return '😊 Promoter - We\'re thrilled you\'re happy!';
  };

  const getNpsEmoji = (score) => {
    if (score === null) return '❓';
    if (score <= 6) return '😞';
    if (score <= 8) return '😐';
    return '😊';
  };

  return (
    <div className={clsx('card', styles.feedbackForm)}>
      <div className={styles.feedbackHeader}>
        <h2>Share Your Feedback</h2>
        <p className={styles.feedbackSubtitle}>Your feedback helps us improve our services</p>
      </div>

      {success && (
        <div className={styles.feedbackSuccess}>
          <span className={styles.successIcon}>✅</span>
          <div>
            <strong>Thank you!</strong>
            <p>Your feedback has been submitted successfully.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.feedbackFormContent}>
        
        {/* NPS Question */}
        <div className={styles.npsSection}>
          <div className={styles.npsHeader}>
            <h3>How likely are you to recommend us?</h3>
            <p className={styles.npsScaleLabel}>0 = Not at all likely &nbsp; • &nbsp; 10 = Extremely likely</p>
          </div>
          
          <div className={styles.npsScale}>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
              <button
                key={score}
                type="button"
                className={clsx(styles.npsButton, { [styles.active]: formData.npsScore === score })}
                onClick={() => handleRatingChange('npsScore', score)}
              >
                {score}
              </button>
            ))}
          </div>

          {formData.npsScore !== null && (
            <div className={clsx(
              styles.npsFeedback,
              formData.npsScore <= 6 ? styles.npsFeedbackDetractor :
              formData.npsScore <= 8 ? styles.npsFeedbackPassive :
              styles.npsFeedbackPromoter
            )}>
              <span className={styles.npsEmoji}>{getNpsEmoji(formData.npsScore)}</span>
              <span className={styles.npsText}>{getNpsDescription(formData.npsScore)}</span>
            </div>
          )}
        </div>

        {/* Additional Ratings */}
        <div className={styles.ratingsSection}>
          <h3 className={styles.sectionTitle}>Rate Your Experience</h3>
          
          <RatingScale
            label="Service Quality"
            field="serviceQuality"
            value={formData.serviceQuality}
            onChange={handleRatingChange}
            description="How would you rate the quality of service?"
          />

          <RatingScale
            label="Staff Behavior"
            field="staffBehavior"
            value={formData.staffBehavior}
            onChange={handleRatingChange}
            description="How professional and courteous was our staff?"
          />

          <RatingScale
            label="Cleanliness"
            field="cleanliness"
            value={formData.cleanliness}
            onChange={handleRatingChange}
            description="How clean and well-maintained was the facility?"
          />

          <RatingScale
            label="Wait Time"
            field="waitTime"
            value={formData.waitTime}
            onChange={handleRatingChange}
            description="How satisfied are you with the wait time?"
          />
        </div>

        {/* Comments */}
        <div className={styles.commentsSection}>
          <label className={styles.formLabel}>Additional Comments</label>
          <p className={styles.formHint}>Tell us what we did well or how we can improve</p>
          <textarea
            value={formData.comments}
            onChange={handleCommentChange}
            placeholder="Your feedback is valuable to us..."
            rows="4"
            className={clsx('form-input', styles.feedbackTextarea)}
            disabled={loading}
          />
        </div>

        {/* Submit Button */}
        <div className={styles.formActions}>
          <button 
            type="submit"
            className={clsx('btn', 'btn-primary', styles.btnLarge)}
            disabled={loading || formData.npsScore === null}
          >
            {loading ? (
              <>
                <span className={styles.spinner}></span>
                Submitting...
              </>
            ) : (
              'Submit Feedback'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default FeedbackForm;
