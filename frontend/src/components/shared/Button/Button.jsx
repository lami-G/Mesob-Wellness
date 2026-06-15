import React from 'react';
import clsx from 'clsx';
import styles from './Button.module.css';

/**
 * Button Component
 * 
 * @param {string} variant - 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'ghost'
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {boolean} fullWidth - Make button full width
 * @param {boolean} disabled - Disable button
 * @param {boolean} loading - Show loading state
 * @param {string} type - 'button' | 'submit' | 'reset'
 */
function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  disabled = false,
  loading = false,
  type = 'button',
  className = '',
  onClick,
  ...props 
}) {
  return (
    <button 
      type={type}
      className={clsx(
        styles.button,
        styles[variant],
        styles[size],
        {
          [styles.fullWidth]: fullWidth,
          [styles.disabled]: disabled || loading,
          [styles.loading]: loading,
        },
        className
      )}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className={styles.spinner} />}
      {children}
    </button>
  );
}

export default Button;
