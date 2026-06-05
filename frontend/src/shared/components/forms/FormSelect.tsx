/* ========================================
   FORM SELECT COMPONENT
   Ethiopian Federal Healthcare Platform
   ======================================== */

import React from 'react';
import { FieldValues, Path } from 'react-hook-form';
import { FormField } from './FormField';
import { Select, SelectProps } from '../ui';

// ========================================
// TYPES
// ========================================

export interface FormSelectProps<T extends FieldValues> extends Omit<SelectProps, 'name'> {
  name: Path<T>;
  label?: string;
  description?: string;
  required?: boolean;
}

// ========================================
// COMPONENT
// ========================================

export function FormSelect<T extends FieldValues>({
  name,
  label,
  description,
  required,
  ...selectProps
}: FormSelectProps<T>) {
  return (
    <FormField<T> name={name} label={label} description={description} required={required}>
      {(field) => (
        <Select
          {...field}
          {...selectProps}
          id={name}
          aria-required={required}
          aria-invalid={!!selectProps.error}
        />
      )}
    </FormField>
  );
}
