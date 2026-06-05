/* ========================================
   NOTIFICATION HISTORY TAB COMPONENT
   Ethiopian Federal Healthcare Platform
   Patient Notification History & Timeline
   ======================================== */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bell, AlertTriangle, Info, CheckCircle, Calendar, Filter } from 'lucide-react';
import { Card, Badge, Select, Spinner, EmptyState } from '@/components/ui';
import api from '../../services/api';

interface NotificationHistoryTabProps {
  patientId: string;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'unread' | 'read';
  createdAt: string;
  readAt?: string;
  entityType?: string;
  entityId?: string;
}

export const NotificationHistoryTab: React.FC<NotificationHistoryTabProps> = ({ patientId }) => {
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['patient-notifications', patientId, severityFilter, statusFilter, timeRange],
    queryFn: async () => {
      const params = new URLSearchParams({ 
        entityType: 'patient',
        entityId: patientId 
      });
      if (severityFilter !== 'all') params.append('severity', severityFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (timeRange !== 'all') params.append('range', timeRange);
      const response = await api.get(`/api/v1/notifications?${params.toString()}`);
      return response.data.data as Notification[];
    },
    enabled: !!patientId,
  });

  const notifications = data || [];
  const unreadCount = notifications.filter(n => n.status === 'unread').length;
  const criticalCount = notifications.filter(n => n.severity === 'critical' || n.severity === 'high').length;

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-error-600" />;
      case 'high': return <AlertTriangle className="w-5 h-5 text-warning-600" />;
      case 'medium': return <Info className="w-5 h-5 text-info-600" />;
      case 'low': return <CheckCircle className="w-5 h-5 text-success-600" />;
      default: return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getTypeLabel = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return then.toLocaleDateString();
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><Spinner size="lg" /></div>;
  }

  if (notifications.length === 0) {
    return (
      <EmptyState
        icon={<Bell className="w-12 h-12" />}
        title="No notifications found"
        description="No notifications have been sent to this patient."
      />
    );
  }

  return (
    <div className="notification-history-tab space-y-6">
      {/* Filters & Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-500" />
          <Select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
            <option value="all">All Severity</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </Select>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </Select>
          <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
            <option value="all">All Time</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="3months">Last 3 Months</option>
          </Select>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="warning">{unreadCount} unread</Badge>
          <Badge variant="error">{criticalCount} critical/high</Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Total Notifications</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{notifications.length}</p>
            </div>
            <Bell className="w-8 h-8 text-primary-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-warning-600 mt-1">{unreadCount}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-warning-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Critical/High</p>
              <p className="text-2xl font-bold text-error-600 mt-1">{criticalCount}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-error-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Read</p>
              <p className="text-2xl font-bold text-success-600 mt-1">
                {notifications.filter(n => n.status === 'read').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-success-600 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Notifications Timeline */}
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div key={notification.id} className="relative flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center z-10">
                {getSeverityIcon(notification.severity)}
              </div>
              <Card className={`flex-1 ${notification.status === 'unread' ? 'border-l-4 border-l-primary-600' : ''}`}>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                        <Badge variant={getSeverityVariant(notification.severity)} size="sm">
                          {notification.severity}
                        </Badge>
                        {notification.status === 'unread' && (
                          <Badge variant="warning" size="sm">Unread</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatRelativeTime(notification.createdAt)}
                        </span>
                        <span>{getTypeLabel(notification.type)}</span>
                        {notification.readAt && (
                          <span>Read {formatRelativeTime(notification.readAt)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
