/* ========================================
   APPOINTMENT VALIDATION SCHEMAS
   Ethiopian Federal Healthcare Platform
   ======================================== */

import { z } from 'zod';

// ========================================
// CREATE APPOINTMENT SCHEMA
// ========================================

export const createAppointmentSchema = z.object({
  userId: z.string().min(1, 'User is required'),
  scheduledAt: z.string().min(1, 'Date and time are required'),
  reason: z.string().min(5, 'Reason must be at least 5 characters').max(500, 'Reason is too long'),
  notes: z.string().max(1000, 'Notes are too long').optional(),
});

export type CreateAppointmentFormData = z.infer<typeof createAppointmentSchema>;

// ========================================
// UPDATE APPOINTMENT SCHEMA
// ========================================

export const updateAppointmentSchema = z.object({
  status: z.enum([
    'WAITING',
    'IN_PROGRESS',
    'IN_SERVICE',
    'COMPLETED',
    'CANCELLED',
    'NO_SHOW',
    'PENDING',
    'CONFIRMED',
  ]).optional(),
  notes: z.string().max(1000, 'Notes are too long').optional(),
  diagnosis: z.string().max(2000, 'Diagnosis is too long').optional(),
  prescription: z.string().max(2000, 'Prescription is too long').optional(),
  cancellationReason: z.string().max(500, 'Cancellation reason is too long').optional(),
});

export type UpdateAppointmentFormData = z.infer<typeof updateAppointmentSchema>;
