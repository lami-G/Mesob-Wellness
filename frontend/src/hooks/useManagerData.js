/**
 * Custom hooks for Manager Dashboard data fetching
 * Uses TanStack Query for optimized caching and state management
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { analyticsService } from '../services/analyticsService';
import { queryKeys } from '../config/queryClient';

/**
 * Fetch capacity information for manager's center
 */
export const useCapacityInfo = () => {
  return useQuery({
    queryKey: queryKeys.capacity('current'),
    queryFn: async () => {
      const response = await analyticsService.getCapacityInfo();
      return response?.data || response || null;
    },
    staleTime: 1 * 60 * 1000, // 1 minute (capacity changes frequently)
    refetchInterval: 2 * 60 * 1000, // Auto-refetch every 2 minutes
  });
};

/**
 * Fetch booking statistics
 */
export const useBookingStats = () => {
  return useQuery({
    queryKey: queryKeys.bookingStats('current'),
    queryFn: async () => {
      const response = await analyticsService.getBookingStats();
      return response?.data || response || null;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Fetch queue analytics
 */
export const useQueueAnalytics = () => {
  return useQuery({
    queryKey: queryKeys.queue('current'),
    queryFn: async () => {
      const response = await analyticsService.getQueueAnalytics();
      return response?.data || response || null;
    },
    staleTime: 30 * 1000, // 30 seconds (queue is dynamic)
    refetchInterval: 60 * 1000, // Auto-refetch every minute
  });
};

/**
 * Fetch health analytics
 */
export const useHealthAnalytics = () => {
  return useQuery({
    queryKey: queryKeys.healthAnalytics({}),
    queryFn: async () => {
      const response = await analyticsService.getHealthAnalytics();
      return response?.data || response || null;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Fetch system settings
 */
export const useSystemSettings = () => {
  return useQuery({
    queryKey: queryKeys.systemSettings,
    queryFn: async () => {
      const response = await analyticsService.getSystemSettings();
      return response?.data || response || {
        dailySlotLimit: 36,
        appointmentIntervalMinutes: 15,
        walkInEnabled: true,
        autoConfirmBookings: false,
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Fetch staff users
 */
export const useStaffUsers = () => {
  return useQuery({
    queryKey: queryKeys.staffUsers('current'),
    queryFn: async () => {
      const response = await analyticsService.getStaffUsers();
      return response?.data || response || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Fetch audit logs
 */
export const useAuditLogs = (days = 30) => {
  return useQuery({
    queryKey: queryKeys.auditLogs({ days }),
    queryFn: async () => {
      const response = await analyticsService.getAuditLogs(days);
      return response?.data || response || [];
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
};

/**
 * Fetch trends data
 */
export const useManagerTrends = () => {
  return useQuery({
    queryKey: queryKeys.trends('manager'),
    queryFn: async () => {
      const response = await analyticsService.getTrends();
      return response?.data || response || null;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Fetch all manager dashboard data at once (composite hook)
 */
export const useManagerDashboard = () => {
  const capacity = useCapacityInfo();
  const booking = useBookingStats();
  const queue = useQueueAnalytics();
  const health = useHealthAnalytics();
  const settings = useSystemSettings();
  const staff = useStaffUsers();
  const audit = useAuditLogs(30);
  const trends = useManagerTrends();

  const queryClient = useQueryClient();

  return {
    capacityInfo: capacity.data || null,
    bookingStats: booking.data || null,
    queueData: queue.data || null,
    healthData: health.data || null,
    systemSettings: settings.data || {},
    users: staff.data || [],
    auditLogs: audit.data || [],
    trendsData: trends.data || null,
    isLoading: capacity.isLoading || booking.isLoading || queue.isLoading || health.isLoading,
    error: capacity.error || booking.error || queue.error || health.error,
    refetch: () => {
      // Invalidate all manager-related queries
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      queryClient.invalidateQueries({ queryKey: ['audit'] });
    },
  };
};
