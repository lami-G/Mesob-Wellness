/**
 * Custom hooks for Regional Dashboard data fetching
 * Uses TanStack Query for optimized caching and state management
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { regionalService } from '../services/regionalService';
import { adminService } from '../services/adminService';
import { queryKeys } from '../config/queryClient';

/**
 * Fetch centers for a specific region
 */
export const useRegionalCenters = (region) => {
  return useQuery({
    queryKey: queryKeys.regionalCenters(region),
    queryFn: async () => {
      const response = await regionalService.getCenters(region);
      return response?.data || response || [];
    },
    enabled: !!region,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Fetch managers for a specific region
 */
export const useRegionalManagers = (region) => {
  return useQuery({
    queryKey: queryKeys.regionalManagers(region),
    queryFn: async () => {
      const response = await regionalService.getManagers(region);
      return response?.data || response || [];
    },
    enabled: !!region,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Fetch regional analytics
 */
export const useRegionalAnalytics = (region) => {
  return useQuery({
    queryKey: queryKeys.regionalAnalytics(region, {}),
    queryFn: async () => {
      const response = await regionalService.getAnalytics(region);
      return response?.data || response || null;
    },
    enabled: !!region,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
};

/**
 * Fetch center statistics for region
 */
export const useCenterStats = (region) => {
  return useQuery({
    queryKey: ['centerStats', region],
    queryFn: async () => {
      const centers = await regionalService.getCenters(region);
      const centersData = centers?.data || centers || [];
      
      const active = centersData.filter(c => c.status === 'ACTIVE').length;
      const total = centersData.length;
      
      return { active, total };
    },
    enabled: !!region,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Create new center mutation
 */
export const useCreateCenter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (centerData) => {
      const response = await regionalService.createCenter(centerData);
      return response?.data || response;
    },
    onSuccess: (_, variables) => {
      // Invalidate regional centers
      queryClient.invalidateQueries({ queryKey: queryKeys.regionalCenters(variables.region) });
      queryClient.invalidateQueries({ queryKey: ['centers'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};

/**
 * Update center mutation
 */
export const useUpdateCenter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ centerId, updates }) => {
      const response = await adminService.updateCenter(centerId, updates);
      return response?.data || response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['centers'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};

/**
 * Fetch all regional dashboard data at once (composite hook)
 */
export const useRegionalDashboard = (region) => {
  const centers = useRegionalCenters(region);
  const managers = useRegionalManagers(region);
  const analytics = useRegionalAnalytics(region);
  const centerStats = useCenterStats(region);

  const queryClient = useQueryClient();

  return {
    centers: centers.data || [],
    managers: managers.data || [],
    analytics: analytics.data || null,
    centerStats: centerStats.data || { active: 0, total: 0 },
    isLoading: centers.isLoading || managers.isLoading || analytics.isLoading,
    error: centers.error || managers.error || analytics.error,
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ['regional'] });
      queryClient.invalidateQueries({ queryKey: ['centerStats'] });
    },
  };
};
