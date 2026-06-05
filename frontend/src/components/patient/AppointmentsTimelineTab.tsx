/* ========================================
   APPOINTMENTS TIMELINE TAB COMPONENT
   Ethiopian Federal Healthcare Platform
   Clinical Appointment History & Timeline
   ======================================== */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, User, FileText, CheckCircle, XCircle, AlertCircle, Filter } from 'lucide-react';
import { Card, Badge, Button, Select, Spinner, EmptyState } from '@/components/ui';
import api from '../../services/api';

interface AppointmentsTimelineTabProps {
  patientId: string;
}

interface Appointment {
  id: string;
  scheduledAt: string;
  status: string;
  reason: string;
  diagnosis?: string;
  prescription?: string;
  notes?: string;
  provider?: string;
  center?: string;
  type: string;
}

export const AppointmentsTimelineTab: React.FC<AppointmentsTimelineTabProps> = ({ patientId }) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['patient-appointments', patientId, statusFilter, timeRange],
    queryFn: async () => {
      const params = new URLSearchParams({ patientId });
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (timeRange !== 'all') params.append('range', timeRange);
      const response = await api.get(`/api/v1/appointments?${params.toString()}`);
      return response.data.data as Appointment[];
    },
    enabled: !!patientId,
  });

  const appointments = data || [];

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED': return <CheckCircle className="w-5 h-5 text-success-600" />;
      case 'CANCELLED': return <XCircle className="w-5 h-5 text-error-600" />;
      case 'NO_SHOW': return <AlertCircle className="w-5 h-5 text-warning-600" />;
      default: return <Clock className="w-5 h-5 text-info-600" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED': return 'success';
      case 'CANCELLED': return 'error';
      case 'NO_SHOW': return 'warning';
      case 'CONFIRMED': return 'info';
      default: return 'default';
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><Spinner size="lg" /></div>;
  }

  if (appointments.length === 0) {
    return (
      <EmptyState
        icon={<Calendar className="w-12 h-12" />}
        title="No appointments found"
        description="No appointments match your current filters."
      />
    );
  }

  return (
    <div className="appointments-timeline-tab space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-3">
        <Filter className="w-5 h-5 text-gray-500" />
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="COMPLETED">Completed</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="NO_SHOW">No Show</option>
        </Select>
        <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
          <option value="all">All Time</option>
          <option value="month">Last Month</option>
          <option value="3months">Last 3 Months</option>
          <option value="year">Last Year</option>
        </Select>
        <Badge variant="info">{appointments.length} appointments</Badge>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        <div className="space-y-6">
          {appointments.map((apt, idx) => (
            <div key={apt.id} className="relative flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center z-10">
                {getStatusIcon(apt.status)}
              </div>
              <Card className="flex-1">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{apt.reason}</h4>
                        <Badge variant={getStatusVariant(apt.status)} size="sm">{apt.status}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(apt.scheduledAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(apt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {apt.provider && (
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {apt.provider}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {apt.diagnosis && (
                    <div className="mb-2">
                      <p className="text-sm font-medium text-gray-700">Diagnosis:</p>
                      <p className="text-sm text-gray-600">{apt.diagnosis}</p>
                    </div>
                  )}
                  {apt.prescription && (
                    <div className="mb-2">
                      <p className="text-sm font-medium text-gray-700">Prescription:</p>
                      <p className="text-sm text-gray-600">{apt.prescription}</p>
                    </div>
                  )}
                  {apt.notes && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Notes:</p>
                      <p className="text-sm text-gray-600 italic">{apt.notes}</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
