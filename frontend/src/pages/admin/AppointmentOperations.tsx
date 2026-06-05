/* ========================================
   APPOINTMENT OPERATIONS DASHBOARD
   Ethiopian Federal Healthcare Platform
   Real-time Appointment Queue & Operations
   ======================================== */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  Clock,
  Users,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { Card, Badge, Button, Select, Spinner } from '@/components/ui';
import { DataTable } from '@/shared/components/data/DataTable';
import type { Column } from '@/shared/components/data/DataTable';
import api from '../../services/api';

/* ========================================
   TYPES
   ======================================== */

interface Appointment {
  id: string;
  displayId: string;
  patientName: string;
  patientId: string;
  scheduledAt: string;
  status: string;
  reason: string;
  provider?: string;
  center?: string;
  waitTime?: number;
  priority?: 'normal' | 'high' | 'urgent';
}

interface OperationsStats {
  totalToday: number;
  waiting: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  noShow: number;
  avgWaitTime: number;
}

/* ========================================
   COMPONENT
   ======================================== */

const AppointmentOperations: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [centerFilter, setCenterFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('today');

  // Fetch appointments
  const { data: appointmentsData, isLoading, refetch } = useQuery({
    queryKey: ['appointments-operations', statusFilter, centerFilter, dateFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        if (statusFilter === 'active') {
          params.append('status', 'WAITING,PENDING,CONFIRMED,IN_PROGRESS,IN_SERVICE');
        } else {
          params.append('status', statusFilter);
        }
      }
      if (centerFilter !== 'all') params.append('centerId', centerFilter);
      if (dateFilter === 'today') {
        const today = new Date().toISOString().split('T')[0];
        params.append('date', today);
      }
      const response = await api.get(`/api/v1/appointments?${params.toString()}`);
      return response.data.data as Appointment[];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['appointments-stats', dateFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateFilter === 'today') {
        const today = new Date().toISOString().split('T')[0];
        params.append('date', today);
      }
      const response = await api.get(`/api/v1/appointments/stats?${params.toString()}`);
      return response.data.data as OperationsStats;
    },
    refetchInterval: 30000,
  });

  // Fetch centers for filter
  const { data: centersData } = useQuery({
    queryKey: ['centers'],
    queryFn: async () => {
      const response = await api.get('/api/v1/centers');
      return response.data.data;
    },
  });

  const appointments = appointmentsData || [];
  const centers = centersData || [];

  const getStatusVariant = (status: string) => {
    switch (status.toUpperCase()) {
      case 'WAITING':
      case 'PENDING':
        return 'warning';
      case 'CONFIRMED':
        return 'info';
      case 'IN_PROGRESS':
      case 'IN_SERVICE':
        return 'primary';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
      case 'NO_SHOW':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPriorityVariant = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'error';
      case 'high':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatWaitTime = (minutes?: number) => {
    if (!minutes) return '-';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Table columns
  const columns: Column<Appointment>[] = [
    {
      key: 'displayId',
      header: 'ID',
      sortable: true,
      width: '100px',
      render: (value) => (
        <span className="font-mono font-semibold text-gray-900">{value}</span>
      ),
    },
    {
      key: 'patientName',
      header: 'Patient',
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="font-medium text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{row.patientId}</p>
        </div>
      ),
    },
    {
      key: 'scheduledAt',
      header: 'Time',
      sortable: true,
      width: '120px',
      render: (value) => (
        <div className="text-sm">
          <p className="font-medium text-gray-900">
            {new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(value).toLocaleDateString()}
          </p>
        </div>
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      width: '140px',
      render: (value) => (
        <Badge variant={getStatusVariant(value)}>
          {value.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      width: '100px',
      render: (value) => value ? (
        <Badge variant={getPriorityVariant(value)} size="sm">
          {value}
        </Badge>
      ) : (
        <span className="text-gray-400">-</span>
      ),
    },
    {
      key: 'waitTime',
      header: 'Wait Time',
      sortable: true,
      width: '100px',
      render: (value) => (
        <span className={value && value > 30 ? 'text-warning-600 font-semibold' : 'text-gray-600'}>
          {formatWaitTime(value)}
        </span>
      ),
    },
    {
      key: 'provider',
      header: 'Provider',
      render: (value) => value || <span className="text-gray-400">Unassigned</span>,
    },
  ];

  return (
    <div className="appointment-operations-page">
      {/* Header */}
      <div className="page-header mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointment Operations</h1>
          <p className="text-sm text-gray-600 mt-1">
            Real-time appointment queue and operational management
          </p>
        </div>
        <Button variant="secondary" size="md" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Total Today</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats?.totalToday || 0}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-primary-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Waiting</p>
              <p className="text-2xl font-bold text-warning-600 mt-1">
                {stats?.waiting || 0}
              </p>
            </div>
            <Clock className="w-8 h-8 text-warning-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-primary-600 mt-1">
                {stats?.inProgress || 0}
              </p>
            </div>
            <Activity className="w-8 h-8 text-primary-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-success-600 mt-1">
                {stats?.completed || 0}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-success-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Cancelled</p>
              <p className="text-2xl font-bold text-error-600 mt-1">
                {stats?.cancelled || 0}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-error-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">No Show</p>
              <p className="text-2xl font-bold text-error-600 mt-1">
                {stats?.noShow || 0}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-error-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Avg Wait</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats?.avgWaitTime ? `${stats.avgWaitTime}m` : '-'}
              </p>
            </div>
            <Clock className="w-8 h-8 text-gray-600 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="p-4">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <Select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </Select>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="active">Active (Queue)</option>
              <option value="WAITING">Waiting</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="NO_SHOW">No Show</option>
            </Select>
            <Select value={centerFilter} onChange={(e) => setCenterFilter(e.target.value)}>
              <option value="all">All Centers</option>
              {centers.map((center: any) => (
                <option key={center.id} value={center.id}>
                  {center.name}
                </option>
              ))}
            </Select>
            <div className="flex-1"></div>
            <Badge variant="info">{appointments.length} appointments</Badge>
          </div>
        </div>
      </Card>

      {/* Appointments Table */}
      <Card>
        <DataTable
          data={appointments}
          columns={columns}
          loading={isLoading}
          emptyMessage="No appointments found"
          emptyIcon={<Calendar className="w-12 h-12" />}
          searchable
          searchPlaceholder="Search by patient name, ID, or reason..."
          stickyHeader
          densityControl
          defaultDensity="compact"
          onRowClick={(row) => {
            // Navigate to appointment detail or patient profile
            window.location.href = `/admin/patients/${row.patientId}`;
          }}
        />
      </Card>
    </div>
  );
};

export default AppointmentOperations;
