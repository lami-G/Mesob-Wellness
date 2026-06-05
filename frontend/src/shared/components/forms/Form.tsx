/* ========================================
   FORM COMPONENT (React Hook Form)
   Ethiopian Federal Healthcare Platform
   ======================================== */

import React from 'react';
import { useForm, FormProvider, UseFormReturn, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodSchema } from 'zod';
import { cn } from '@/utils';

// ========================================
// TYPES
// ========================================

export interface FormProps<T extends FieldValues> extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  schema?: ZodSchema<T>;
  defaultValues?: Partial<T>;
  onSubmit: (data: T) => void | Promise<void>;
  children: React.ReactNode;
  methods?: UseFormReturn<T>;
}

// ========================================
// COMPONENT
// ========================================

export function Form<T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  children,
  methods: externalMethods,
  className,
  ...props
}: FormProps<T>) {
  const internalMethods = useForm<T>({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues,
  });

  const methods = externalMethods || internalMethods;

  const handleSubmit = methods.handleSubmit(async (data) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit} className={cn('space-y-4', className)} {...props}>
        {children}
      </form>
    </FormProvider>
  );
}
