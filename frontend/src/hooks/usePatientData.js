/**
 * Custom hooks for Patient Dashboard data fetching
 * Uses TanStack Query for optimized caching and state management
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { queryKeys } from '../config/queryClient';

/**
 * Fetch patient's appointments
 */
export const usePatientAppointments = () => {
  return useQuery({
    queryKey: queryKeys.appointments({ type: 'patient' }),
    queryFn: async () => {
      const response = await api.get('/api/v1/appointments/my-appointments');
      return response?.data?.data || response?.data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Fetch patient's vitals/health records
 */
export const usePatientVitals = () => {
  return useQuery({
    queryKey: queryKeys.vitals({ type: 'patient' }),
    queryFn: async () => {
      const response = await api.get('/api/v1/vitals/my-vitals');
      return response?.data?.data || response?.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Fetch patient's wellness plan
 */
export const useWellnessPlan = () => {
  return useQuery({
    queryKey: ['wellness-plan'],
    queryFn: async () => {
      const response = await api.get('/api/v1/wellness/my-plan');
      return response?.data?.data || response?.data || null;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Fetch patient's health journey/timeline
 */
export const useHealthJourney = () => {
  return useQuery({
    queryKey: ['health-journey'],
    queryFn: async () => {
      const response = await api.get('/api/v1/health/journey');
      return response?.data?.data || response?.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Fetch patient's risk scoring
 */
export const useRiskScore = () => {
  return useQuery({
    queryKey: ['risk-score'],
    queryFn: async () => {
      const response = await api.get('/api/v1/health/risk-score');
      return response?.data?.data || response?.data || null;
    },
    staleTime: 10 * 60 * 1000,
  });
};

/**
 * Create new appointment mutation
 */
export const useCreateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentData) => {
      const response = await api.post('/api/v1/appointments', appointmentData);
      return response?.data?.data || response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments({ type: 'patient' }) });
    },
  });
};

/**
 * Cancel appointment mutation
 */
export const useCancelAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentId) => {
      const response = await api.patch(`/api/v1/appointments/${appointmentId}/cancel`);
      return response?.data?.data || response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments({ type: 'patient' }) });
    },
  });
};

/**
 * Submit feedback mutation
 */
export const useSubmitFeedback = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (feedbackData) => {
      const response = await api.post('/api/v1/feedback', feedbackData);
      return response?.data?.data || response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
    },
  });
};

/**
 * Fetch all patient dashboard data at once (composite hook)
 */
export const usePatientDashboard = () => {
  const appointments = usePatientAppointments();
  const vitals = usePatientVitals();
  const wellnessPlan = useWellnessPlan();
  const healthJourney = useHealthJourney();
  const riskScore = useRiskScore();

  return {
    appointments: appointments.data || [],
    vitals: vitals.data || [],
    wellnessPlan: wellnessPlan.data || null,
    healthJourney: healthJourney.data || [],
    riskScore: riskScore.data || null,
    isLoading: appointments.isLoading || vitals.isLoading || wellnessPlan.isLoading,
    error: appointments.error || vitals.error || wellnessPlan.error,
    refetch: () => {
      appointments.refetch();
      vitals.refetch();
      wellnessPlan.refetch();
      healthJourney.refetch();
      riskScore.refetch();
    },
  };
};
