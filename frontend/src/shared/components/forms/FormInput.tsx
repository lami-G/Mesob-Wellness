/* ========================================
   FORM INPUT COMPONENT
   Ethiopian Federal Healthcare Platform
   ======================================== */

import React from 'react';
import { FieldValues, Path } from 'react-hook-form';
import { FormField } from './FormField';
import { Input, InputProps } from '../ui';

// ========================================
// TYPES
// ========================================

export interface FormInputProps<T extends FieldValues> extends Omit<InputProps, 'name'> {
  name: Path<T>;
  label?: string;
  description?: string;
  required?: boolean;
}

// ========================================
// COMPONENT
// ========================================

export function FormInput<T extends FieldValues>({
  name,
  label,
  description,
  required,
  ...inputProps
}: FormInputProps<T>) {
  return (
    <FormField<T> name={name} label={label} description={description} required={required}>
      {(field) => (
        <Input
          {...field}
          {...inputProps}
          id={name}
          aria-required={required}
          aria-invalid={!!inputProps.error}
        />
      )}
    </FormField>
  );
}
