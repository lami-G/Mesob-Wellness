/* ========================================
   NOTIFICATION CENTER PAGE (TYPESCRIPT)
   Ethiopian Federal Healthcare Platform
   Enterprise Notification Management
   ======================================== */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  BellOff,
  Filter,
  CheckCheck,
  Trash2,
  AlertCircle,
  AlertTriangle,
  Info,
  Calendar,
  User,
  Activity,
  FileText,
  Settings,
  RefreshCw,
} from 'lucide-react';
import { Button, Card, Badge, EmptyState, Spinner, Select } from '@/components/ui';
import { useToast } from '@/components/feedback';
import api from '../../services/api';
import type { Notification, NotificationFilters as INotificationFilters } from '@/types/api';

/* ========================================
   TYPES
   ======================================== */

interface NotificationFilters {
  type: 'all' | 'appointment' | 'vital' | 'wellness' | 'system' | 'alert';
  severity: 'all' | 'low' | 'medium' | 'high' | 'critical';
  status: 'all' | 'unread' | 'read';
  dateRange: 'all' | 'today' | 'week' | 'month';
}

/* ========================================
   COMPONENT
   ======================================== */

const NotificationCenter: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success, error: showError } = useToast();

  // State
  const [filters, setFilters] = useState<NotificationFilters>({
    type: 'all',
    severity: 'all',
    status: 'all',
    dateRange: 'all',
  });

  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());

  // Fetch notifications
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['notifications', filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        ...(filters.type !== 'all' && { type: filters.type }),
        ...(filters.severity !== 'all' && { severity: filters.severity }),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.dateRange !== 'all' && { dateRange: filters.dateRange }),
      });

      const response = await api.get(`/api/v1/notifications?${params.toString()}`);
      return response.data.data;
    },
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationIds: string[]) => {
      await api.patch('/api/v1/notifications/mark-read', { notificationIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      success('Notifications marked as read');
      setSelectedNotifications(new Set());
    },
    onError: () => {
      showError('Failed to mark notifications as read');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (notificationIds: string[]) => {
      await api.delete('/api/v1/notifications', { data: { notificationIds } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      success('Notifications deleted');
      setSelectedNotifications(new Set());
    },
    onError: () => {
      showError('Failed to delete notifications');
    },
  });

  // Handlers
  const handleFilterChange = (key: keyof NotificationFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSelectAll = () => {
    if (selectedNotifications.size === notifications.length) {
      setSelectedNotifications(new Set());
    } else {
      setSelectedNotifications(new Set(notifications.map((n: Notification) => n.id)));
    }
  };

  const handleSelectNotification = (id: string) => {
    const newSelected = new Set(selectedNotifications);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedNotifications(newSelected);
  };

  const handleMarkAsRead = () => {
    if (selectedNotifications.size === 0) return;
    markAsReadMutation.mutate(Array.from(selectedNotifications));
  };

  const handleDelete = () => {
    if (selectedNotifications.size === 0) return;
    if (!window.confirm(`Delete ${selectedNotifications.size} notification(s)?`)) return;
    deleteMutation.mutate(Array.from(selectedNotifications));
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      markAsReadMutation.mutate([notification.id]);
    }

    // Navigate to related entity
    if (notification.relatedEntityType && notification.relatedEntityId) {
      switch (notification.relatedEntityType) {
        case 'appointment':
          navigate(`/admin/appointments/${notification.relatedEntityId}`);
          break;
        case 'patient':
          navigate(`/admin/patients/${notification.relatedEntityId}`);
          break;
        case 'vital':
          navigate(`/admin/vitals/${notification.relatedEntityId}`);
          break;
        case 'wellness':
          navigate(`/admin/wellness/${notification.relatedEntityId}`);
          break;
        default:
          break;
      }
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-error-600" />;
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-warning-600" />;
      case 'medium':
        return <Info className="w-5 h-5 text-info-600" />;
      case 'low':
        return <Bell className="w-5 h-5 text-gray-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'appointment':
        return <Calendar className="w-4 h-4" />;
      case 'vital':
        return <Activity className="w-4 h-4" />;
      case 'wellness':
        return <FileText className="w-4 h-4" />;
      case 'patient':
        return <User className="w-4 h-4" />;
      case 'system':
        return <Settings className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffMs = now.getTime() - notificationDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notificationDate.toLocaleDateString();
  };

  // Loading state
  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <EmptyState
          icon={<Bell className="w-12 h-12" />}
          title="Failed to load notifications"
          description="There was an error loading notifications. Please try again."
          action={
            <Button onClick={() => refetch()} variant="primary">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          }
        />
      </Card>
    );
  }

  const notifications = data?.notifications || [];
  const stats = data?.stats || {};

  return (
    <div className="notification-center-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notification Center</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage system notifications and alerts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.total || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
              <Bell className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-info-600 mt-1">
                {stats.unread || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-info-100 flex items-center justify-center">
              <Bell className="w-6 h-6 text-info-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">High Priority</p>
              <p className="text-2xl font-bold text-warning-600 mt-1">
                {stats.highPriority || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-warning-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-warning-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Critical</p>
              <p className="text-2xl font-bold text-error-600 mt-1">
                {stats.critical || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-error-100 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-error-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-700">Filters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Type Filter */}
            <Select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="appointment">Appointments</option>
              <option value="vital">Vitals</option>
              <option value="wellness">Wellness</option>
              <option value="patient">Patients</option>
              <option value="system">System</option>
              <option value="alert">Alerts</option>
            </Select>

            {/* Severity Filter */}
            <Select
              value={filters.severity}
              onChange={(e) => handleFilterChange('severity', e.target.value)}
            >
              <option value="all">All Severities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </Select>

            {/* Status Filter */}
            <Select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </Select>

            {/* Date Range Filter */}
            <Select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </Select>
          </div>

          {/* Active Filters Summary */}
          {(filters.type !== 'all' || filters.severity !== 'all' || filters.status !== 'all' || filters.dateRange !== 'all') && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs text-gray-500">Active filters:</span>
              {filters.type !== 'all' && (
                <Badge variant="info" size="sm">Type: {filters.type}</Badge>
              )}
              {filters.severity !== 'all' && (
                <Badge variant="info" size="sm">Severity: {filters.severity}</Badge>
              )}
              {filters.status !== 'all' && (
                <Badge variant="info" size="sm">Status: {filters.status}</Badge>
              )}
              {filters.dateRange !== 'all' && (
                <Badge variant="info" size="sm">Date: {filters.dateRange}</Badge>
              )}
              <button
                onClick={() => setFilters({
                  type: 'all',
                  severity: 'all',
                  status: 'all',
                  dateRange: 'all',
                })}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedNotifications.size > 0 && (
        <Card className="mb-6">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">
                {selectedNotifications.size} selected
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleMarkAsRead}
                disabled={markAsReadMutation.isPending}
              >
                <CheckCheck className="w-4 h-4 mr-2" />
                Mark as Read
              </Button>
              <Button
                variant="error"
                size="sm"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedNotifications(new Set())}
            >
              Clear Selection
            </Button>
          </div>
        </Card>
      )}

      {/* Notifications List */}
      <Card>
        {notifications.length === 0 ? (
          <EmptyState
            icon={<BellOff className="w-12 h-12" />}
            title="No notifications"
            description="You're all caught up! No notifications match your current filters."
            action={
              filters.type !== 'all' || filters.severity !== 'all' || filters.status !== 'all' ? (
                <Button
                  onClick={() => setFilters({
                    type: 'all',
                    severity: 'all',
                    status: 'all',
                    dateRange: 'all',
                  })}
                  variant="secondary"
                >
                  Clear Filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="divide-y divide-gray-200">
            {/* Select All Header */}
            <div className="p-4 bg-gray-50 flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedNotifications.size === notifications.length}
                onChange={handleSelectAll}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Select All
              </span>
            </div>

            {/* Notification Items */}
            {notifications.map((notification: Notification) => (
              <div
                key={notification.id}
                className={`
                  p-4 flex items-start gap-4 hover:bg-gray-50 transition-colors cursor-pointer
                  ${!notification.read ? 'bg-primary-50' : ''}
                `}
                onClick={() => handleNotificationClick(notification)}
              >
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedNotifications.has(notification.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleSelectNotification(notification.id);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-1"
                />

                {/* Severity Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getSeverityIcon(notification.severity)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-primary-600" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getSeverityBadgeVariant(notification.severity)} size="sm">
                        {notification.severity}
                      </Badge>
                      <div className="flex items-center gap-1 text-gray-500">
                        {getTypeIcon(notification.type)}
                        <span className="text-xs">{notification.type}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">
                    {notification.message}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{formatRelativeTime(notification.createdAt)}</span>
                    {notification.relatedEntityType && (
                      <span className="flex items-center gap-1">
                        <span className="text-gray-400">•</span>
                        Related: {notification.relatedEntityType}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default NotificationCenter;

