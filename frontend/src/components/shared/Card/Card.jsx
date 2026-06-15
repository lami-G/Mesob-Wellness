import React from 'react';
import clsx from 'clsx';
import styles from './Card.module.css';

/**
 * Card Component
 * 
 * @param {string} variant - 'default' | 'elevated' | 'outlined'
 * @param {string} padding - 'none' | 'sm' | 'md' | 'lg'
 * @param {string} shadow - 'none' | 'sm' | 'md' | 'lg' | 'xl'
 * @param {boolean} hoverable - Enable hover lift effect (opt-in)
 * @param {boolean} clickable - Add cursor pointer
 */
function Card({ 
  children, 
  variant = 'default',
  padding = 'md',
  shadow = 'md',
  hoverable = false,
  clickable = false,
  className = '',
  onClick,
  ...props 
}) {
  return (
    <div 
      className={clsx(
        styles.card,
        styles[variant],
        styles[`padding-${padding}`],
        styles[`shadow-${shadow}`],
        {
          [styles.hoverable]: hoverable,
          [styles.clickable]: clickable || onClick,
        },
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
