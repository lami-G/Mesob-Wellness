/**
 * TanStack Query Configuration
 * Centralized query client with optimized defaults
 */
import { QueryClient } from '@tanstack/react-query';

// Default query options
const defaultQueryOptions = {
  queries: {
    // Cache data for 5 minutes
    staleTime: 5 * 60 * 1000,
    // Keep unused data in cache for 10 minutes
    cacheTime: 10 * 60 * 1000,
    // Retry failed requests 1 time
    retry: 1,
    // Don't refetch on window focus by default (can override per query)
    refetchOnWindowFocus: false,
    // Refetch on mount if data is stale
    refetchOnMount: true,
    // Don't refetch on reconnect automatically
    refetchOnReconnect: false,
  },
  mutations: {
    // Retry mutations 0 times
    retry: 0,
  },
};

// Create query client instance
export const queryClient = new QueryClient({
  defaultOptions: defaultQueryOptions,
});

// Query keys for consistent cache management
export const queryKeys = {
  // Admin queries
  regions: ['regions'],
  regionById: (id) => ['regions', id],
  centers: (filters) => ['centers', filters],
  centerById: (id) => ['centers', id],
  users: (filters) => ['users', filters],
  userById: (id) => ['users', id],
  
  // Analytics queries
  analytics: (type, filters) => ['analytics', type, filters],
  systemAnalytics: (filters) => ['analytics', 'system', filters],
  regionalAnalytics: (region, filters) => ['analytics', 'regional', region, filters],
  centerAnalytics: (centerId, filters) => ['analytics', 'center', centerId, filters],
  trends: (period) => ['analytics', 'trends', period],
  
  // Dashboard queries
  dashboardMetrics: (type, filters) => ['dashboard', 'metrics', type, filters],
  capacity: (centerId) => ['dashboard', 'capacity', centerId],
  queue: (centerId) => ['dashboard', 'queue', centerId],
  
  // Appointments
  appointments: (filters) => ['appointments', filters],
  appointmentById: (id) => ['appointments', id],
  
  // Health data
  vitals: (filters) => ['vitals', filters],
  vitalById: (id) => ['vitals', id],
  healthAnalytics: (filters) => ['health', 'analytics', filters],
  conditionTrends: (filters) => ['health', 'conditions', filters],
  
  // Feedback
  feedback: (filters) => ['feedback', filters],
  feedbackAnalytics: (filters) => ['feedback', 'analytics', filters],
  
  // Audit
  auditLogs: (filters) => ['audit', filters],
  
  // Settings
  settings: ['settings'],
  systemSettings: ['settings', 'system'],
  
  // Manager specific
  staffUsers: (centerId) => ['staff', centerId],
  bookingStats: (centerId) => ['booking-stats', centerId],
  
  // Regional specific
  regionalCenters: (region) => ['regional', 'centers', region],
  regionalManagers: (region) => ['regional', 'managers', region],
  
  // Federal specific
  federalOverview: (filters) => ['federal', 'overview', filters],
  allRegions: ['federal', 'regions'],
};

// Helper function to invalidate related queries
export const invalidateQueries = {
  // Invalidate all analytics
  allAnalytics: () => queryClient.invalidateQueries({ queryKey: ['analytics'] }),
  
  // Invalidate all dashboard data
  allDashboards: () => queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
  
  // Invalidate specific dashboard
  dashboard: (type) => queryClient.invalidateQueries({ queryKey: ['dashboard', 'metrics', type] }),
  
  // Invalidate appointments
  appointments: () => queryClient.invalidateQueries({ queryKey: ['appointments'] }),
  
  // Invalidate health data
  health: () => queryClient.invalidateQueries({ queryKey: ['vitals'] }),
  
  // Invalidate everything (use sparingly)
  all: () => queryClient.invalidateQueries(),
};

export default queryClient;
