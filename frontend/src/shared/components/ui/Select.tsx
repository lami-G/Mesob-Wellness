/* ========================================
   SELECT COMPONENT
   Ethiopian Federal Healthcare Platform
   ======================================== */

import React from 'react';
import { cn } from '@/utils';
import type { SelectOption } from '@/types';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  fullWidth?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      placeholder,
      fullWidth = false,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;

    return (
      <div className={cn('form-group', fullWidth && 'w-full')}>
        {label && (
          <label htmlFor={selectId} className="form-label">
            {label}
            {props.required && <span className="text-danger ml-1">*</span>}
          </label>
        )}
        
        <select
          ref={ref}
          id={selectId}
          className={cn(
            'form-select',
            hasError && 'form-input-error',
            className
          )}
          aria-invalid={hasError}
          aria-describedby={
            error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined
          }
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {error && (
          <p id={`${selectId}-error`} className="form-error">
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p id={`${selectId}-helper`} className="form-helper">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
