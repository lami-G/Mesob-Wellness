/* ========================================
   USER VALIDATION SCHEMAS
   Ethiopian Federal Healthcare Platform
   ======================================== */

import { z } from 'zod';

// ========================================
// CREATE USER SCHEMA
// ========================================

export const createUserSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase, and number'
    ),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  role: z.enum([
    'EXTERNAL_PATIENT',
    'STAFF',
    'NURSE_OFFICER',
    'MANAGER',
    'REGIONAL_OFFICE',
    'FEDERAL_OFFICE',
    'SYSTEM_ADMIN',
  ]),
  centerId: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  phone: z
    .string()
    .regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;

// ========================================
// UPDATE USER SCHEMA
// ========================================

export const updateUserSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
  email: z.string().email('Please enter a valid email address').optional(),
  role: z.enum([
    'EXTERNAL_PATIENT',
    'STAFF',
    'NURSE_OFFICER',
    'MANAGER',
    'REGIONAL_OFFICE',
    'FEDERAL_OFFICE',
    'SYSTEM_ADMIN',
  ]).optional(),
  centerId: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  phone: z
    .string()
    .regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
  isActive: z.boolean().optional(),
});

export type UpdateUserFormData = z.infer<typeof updateUserSchema>;

// ========================================
// UPDATE PROFILE SCHEMA
// ========================================

export const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z
    .string()
    .regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z
    .string()
    .regex(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
