/* ========================================
   NOTIFICATIONS QUERY HOOKS (TYPESCRIPT)
   Ethiopian Federal Healthcare Platform
   TanStack Query Hooks for Notifications
   ======================================== */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import type { Notification, NotificationFilters } from '@/types/api';

/* ========================================
   QUERY KEYS
   ======================================== */

export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (filters: NotificationFilters) => [...notificationKeys.lists(), filters] as const,
  details: () => [...notificationKeys.all, 'detail'] as const,
  detail: (id: string) => [...notificationKeys.details(), id] as const,
  stats: () => [...notificationKeys.all, 'stats'] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
};

/* ========================================
   QUERY HOOKS
   ======================================== */

/**
 * Fetch notifications with filters
 */
export const useNotifications = (filters?: NotificationFilters) => {
  return useQuery({
    queryKey: notificationKeys.list(filters || {}),
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters?.type && filters.type !== 'all') {
        params.append('type', filters.type);
      }
      if (filters?.severity && filters.severity !== 'all') {
        params.append('severity', filters.severity);
      }
      if (filters?.status && filters.status !== 'all') {
        params.append('status', filters.status);
      }
      if (filters?.dateRange && filters.dateRange !== 'all') {
        params.append('dateRange', filters.dateRange);
      }

      const response = await api.get(`/api/v1/notifications?${params.toString()}`);
      return response.data.data;
    },
  });
};

/**
 * Fetch single notification by ID
 */
export const useNotification = (id: string) => {
  return useQuery({
    queryKey: notificationKeys.detail(id),
    queryFn: async () => {
      const response = await api.get(`/api/v1/notifications/${id}`);
      return response.data.data as Notification;
    },
    enabled: !!id,
  });
};

/**
 * Fetch unread notification count
 */
export const useUnreadNotificationCount = () => {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: async () => {
      const response = await api.get('/api/v1/notifications/unread-count');
      return response.data.data.count as number;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

/**
 * Fetch notification statistics
 */
export const useNotificationStats = () => {
  return useQuery({
    queryKey: notificationKeys.stats(),
    queryFn: async () => {
      const response = await api.get('/api/v1/notifications/stats');
      return response.data.data;
    },
  });
};

/* ========================================
   MUTATION HOOKS
   ======================================== */

/**
 * Mark notifications as read
 */
export const useMarkNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationIds: string[]) => {
      const response = await api.patch('/api/v1/notifications/mark-read', {
        notificationIds,
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all notification queries
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

/**
 * Mark all notifications as read
 */
export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.patch('/api/v1/notifications/mark-all-read');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

/**
 * Delete notifications
 */
export const useDeleteNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationIds: string[]) => {
      const response = await api.delete('/api/v1/notifications', {
        data: { notificationIds },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

/**
 * Delete all read notifications
 */
export const useDeleteAllReadNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await api.delete('/api/v1/notifications/read');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

/**
 * Create notification (admin only)
 */
export const useCreateNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Notification>) => {
      const response = await api.post('/api/v1/notifications', data);
      return response.data.data as Notification;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
};

/**
 * Update notification preferences
 */
export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preferences: {
      emailNotifications: boolean;
      smsNotifications: boolean;
      pushNotifications: boolean;
      notificationTypes: string[];
    }) => {
      const response = await api.patch('/api/v1/notifications/preferences', preferences);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-preferences'] });
    },
  });
};

