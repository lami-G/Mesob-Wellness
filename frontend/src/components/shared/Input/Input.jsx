import React from 'react';
import clsx from 'clsx';
import styles from './Input.module.css';

/**
 * Input Component
 * 
 * @param {string} label - Label text
 * @param {string} error - Error message
 * @param {string} helperText - Helper text below input
 * @param {boolean} required - Mark as required
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {boolean} fullWidth - Make input full width
 */
function Input({ 
  label,
  error,
  helperText,
  required = false,
  size = 'md',
  fullWidth = true,
  className = '',
  id,
  ...props 
}) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={clsx(styles.wrapper, { [styles.fullWidth]: fullWidth })}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      
      <input
        id={inputId}
        className={clsx(
          styles.input,
          styles[size],
          {
            [styles.error]: error,
          },
          className
        )}
        {...props}
      />
      
      {error && <span className={styles.errorText}>{error}</span>}
      {!error && helperText && <span className={styles.helperText}>{helperText}</span>}
    </div>
  );
}

export default Input;
