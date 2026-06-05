/**
 * Custom hooks for Federal Dashboard data fetching
 * Uses TanStack Query for optimized caching and state management
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/adminService';
import { regionalService } from '../services/regionalService';
import { analyticsService } from '../services/analyticsService';
import { queryKeys } from '../config/queryClient';

/**
 * Fetch all regions
 */
export const useFederalRegions = () => {
  return useQuery({
    queryKey: queryKeys.allRegions,
    queryFn: async () => {
      const response = await adminService.getRegions();
      return response?.data || response || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Fetch all centers with optional filters
 */
export const useFederalCenters = (filters = {}) => {
  return useQuery({
    queryKey: queryKeys.centers(filters),
    queryFn: async () => {
      const response = await adminService.getCenters({ ...filters, limit: 1000 });
      return response?.data || response || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Fetch federal analytics overview
 */
export const useFederalAnalytics = () => {
  return useQuery({
    queryKey: queryKeys.federalOverview({}),
    queryFn: async () => {
      const response = await regionalService.getAllAnalytics();
      return response?.data || response || null;
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
};

/**
 * Fetch trends data
 */
export const useFederalTrends = () => {
  return useQuery({
    queryKey: queryKeys.trends('all'),
    queryFn: async () => {
      const response = await analyticsService.getTrends();
      return response?.data || response || null;
    },
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Fetch region admin for a specific region
 */
export const useRegionAdmin = (region) => {
  return useQuery({
    queryKey: ['regionAdmin', region],
    queryFn: async () => {
      try {
        const response = await adminService.getRegionAdmin(region);
        return response || null;
      } catch (err) {
        // Region admin might not exist
        return null;
      }
    },
    enabled: !!region,
    staleTime: 10 * 60 * 1000,
  });
};

/**
 * Create new region mutation
 */
export const useCreateRegion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, email, password }) => {
      // Create regional center
      await regionalService.createCenter({
        name: `${name} Regional Center`,
        region: name,
        city: name,
        address: 'To be updated',
        status: 'ACTIVE',
      });

      // Create region admin if credentials provided
      if (email && password) {
        await adminService.upsertRegionAdmin(name, { email, password });
      }

      return { success: true, region: name };
    },
    onSuccess: () => {
      // Invalidate and refetch regions
      queryClient.invalidateQueries({ queryKey: queryKeys.allRegions });
      queryClient.invalidateQueries({ queryKey: ['centers'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};

/**
 * Update region mutation
 */
export const useUpdateRegion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ region, updates }) => {
      // Implementation depends on your API
      const response = await adminService.updateRegion(region, updates);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.allRegions });
      queryClient.invalidateQueries({ queryKey: ['regionAdmin', variables.region] });
    },
  });
};

/**
 * Fetch all federal data at once (composite hook)
 */
export const useFederalDashboard = (selectedRegion = 'all') => {
  const regions = useFederalRegions();
  const centers = useFederalCenters({ 
    region: selectedRegion === 'all' ? undefined : selectedRegion 
  });
  const allCenters = useFederalCenters({ limit: 1000 });
  const analytics = useFederalAnalytics();
  const trends = useFederalTrends();

  return {
    regions: regions.data || [],
    centers: centers.data || [],
    allCenters: allCenters.data || [],
    analytics: analytics.data || null,
    trends: trends.data || null,
    isLoading: regions.isLoading || centers.isLoading || analytics.isLoading,
    error: regions.error || centers.error || analytics.error,
    refetch: () => {
      regions.refetch();
      centers.refetch();
      allCenters.refetch();
      analytics.refetch();
      trends.refetch();
    },
  };
};
