/* ========================================
   FORM FIELD COMPONENT
   Ethiopian Federal Healthcare Platform
   ======================================== */

import React from 'react';
import { useFormContext, Controller, FieldValues, Path } from 'react-hook-form';
import { cn } from '@/utils';

// ========================================
// TYPES
// ========================================

export interface FormFieldProps<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  description?: string;
  required?: boolean;
  children: (field: any) => React.ReactNode;
  className?: string;
}

// ========================================
// COMPONENT
// ========================================

export function FormField<T extends FieldValues>({
  name,
  label,
  description,
  required,
  children,
  className,
}: FormFieldProps<T>) {
  const {
    control,
    formState: { errors },
  } = useFormContext<T>();

  const error = errors[name];
  const errorMessage = error?.message as string | undefined;

  return (
    <div className={cn('form-field', className)}>
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}

      {description && <p className="form-description">{description}</p>}

      <Controller
        name={name}
        control={control}
        render={({ field }) => children(field)}
      />

      {errorMessage && <p className="form-error">{errorMessage}</p>}
    </div>
  );
}
