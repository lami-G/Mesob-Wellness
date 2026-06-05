/* ========================================
   APPOINTMENTS QUERY HOOKS
   Ethiopian Federal Healthcare Platform
   ======================================== */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  Appointment,
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
  AppointmentsListResponse,
  QueueResponse,
} from '@/types/api';

// Mock service - replace with actual service import
const appointmentsService = {
  getAll: async (): Promise<AppointmentsListResponse> => {
    const response = await fetch('/api/v1/appointments');
    return response.json();
  },
  getById: async (id: string): Promise<Appointment> => {
    const response = await fetch(`/api/v1/appointments/${id}`);
    return response.json();
  },
  getQueue: async (): Promise<QueueResponse> => {
    const response = await fetch('/api/v1/appointments/queue');
    return response.json();
  },
  create: async (data: CreateAppointmentRequest): Promise<Appointment> => {
    const response = await fetch('/api/v1/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  update: async (id: string, data: UpdateAppointmentRequest): Promise<Appointment> => {
    const response = await fetch(`/api/v1/appointments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  delete: async (id: string): Promise<void> => {
    await fetch(`/api/v1/appointments/${id}`, { method: 'DELETE' });
  },
};

// Query Keys
export const appointmentKeys = {
  all: ['appointments'] as const,
  lists: () => [...appointmentKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...appointmentKeys.lists(), filters] as const,
  details: () => [...appointmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...appointmentKeys.details(), id] as const,
  queue: () => [...appointmentKeys.all, 'queue'] as const,
};

// ========================================
// QUERIES
// ========================================

/**
 * Get all appointments
 */
export const useAppointments = (filters?: Record<string, any>) => {
  return useQuery({
    queryKey: appointmentKeys.list(filters || {}),
    queryFn: () => appointmentsService.getAll(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

/**
 * Get appointment by ID
 */
export const useAppointment = (id: string) => {
  return useQuery({
    queryKey: appointmentKeys.detail(id),
    queryFn: () => appointmentsService.getById(id),
    enabled: !!id,
  });
};

/**
 * Get appointment queue
 */
export const useAppointmentQueue = () => {
  return useQuery({
    queryKey: appointmentKeys.queue(),
    queryFn: () => appointmentsService.getQueue(),
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
  });
};

// ========================================
// MUTATIONS
// ========================================

/**
 * Create appointment
 */
export const useCreateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAppointmentRequest) => appointmentsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.queue() });
    },
  });
};

/**
 * Update appointment
 */
export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAppointmentRequest }) =>
      appointmentsService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.queue() });
    },
  });
};

/**
 * Delete appointment
 */
export const useDeleteAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => appointmentsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.queue() });
    },
  });
};
