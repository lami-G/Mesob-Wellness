/* ========================================
   PATIENT PROFILE PAGE (TYPESCRIPT)
   Ethiopian Federal Healthcare Platform
   Comprehensive Patient Detail View
   ======================================== */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Activity,
  Heart,
  FileText,
  Bell,
  Edit,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { Button, Card, Badge, Avatar, Spinner, Alert, EmptyState } from '@/components/ui';
import { useToast } from '@/components/feedback';
import { VitalsHistoryTab } from '@/components/patient/VitalsHistoryTab';
import { AppointmentsTimelineTab } from '@/components/patient/AppointmentsTimelineTab';
import { WellnessPlansTab } from '@/components/patient/WellnessPlansTab';
import { ConditionsTrackingTab } from '@/components/patient/ConditionsTrackingTab';
import { NotificationHistoryTab } from '@/components/patient/NotificationHistoryTab';
import api from '../../services/api';
import type { Patient } from '@/types/api';

/* ========================================
   TYPES
   ======================================== */

type TabType = 'overview' | 'vitals' | 'appointments' | 'wellness' | 'conditions' | 'notifications';

interface PatientStats {
  totalAppointments: number;
  completedAppointments: number;
  upcomingAppointments: number;
  totalVitals: number;
  activeWellnessPlans: number;
  activeConditions: number;
}

/* ========================================
   COMPONENT
   ======================================== */

const PatientProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Fetch patient data
  const { data: patient, isLoading, error } = useQuery({
    queryKey: ['patient', id],
    queryFn: async () => {
      const response = await api.get(`/api/v1/patients/${id}`);
      return response.data.data as Patient;
    },
    enabled: !!id,
  });

  // Fetch patient stats
  const { data: stats } = useQuery({
    queryKey: ['patient-stats', id],
    queryFn: async () => {
      const response = await api.get(`/api/v1/patients/${id}/stats`);
      return response.data.data as PatientStats;
    },
    enabled: !!id,
  });

  // Fetch appointments
  const { data: appointments } = useQuery({
    queryKey: ['patient-appointments', id],
    queryFn: async () => {
      const response = await api.get(`/api/v1/appointments?patientId=${id}`);
      return response.data.data;
    },
    enabled: !!id && activeTab === 'appointments',
  });

  // Fetch vitals
  const { data: vitals } = useQuery({
    queryKey: ['patient-vitals', id],
    queryFn: async () => {
      const response = await api.get(`/api/v1/vitals?patientId=${id}`);
      return response.data.data;
    },
    enabled: !!id && activeTab === 'vitals',
  });

  // Fetch wellness plans
  const { data: wellnessPlans } = useQuery({
    queryKey: ['patient-wellness', id],
    queryFn: async () => {
      const response = await api.get(`/api/v1/wellness?patientId=${id}`);
      return response.data.data;
    },
    enabled: !!id && activeTab === 'wellness',
  });

  // Fetch conditions
  const { data: conditions } = useQuery({
    queryKey: ['patient-conditions', id],
    queryFn: async () => {
      const response = await api.get(`/api/v1/patients/${id}/conditions`);
      return response.data.data;
    },
    enabled: !!id && activeTab === 'conditions',
  });

  // Handlers
  const handleEdit = () => {
    navigate(`/admin/patients/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/api/v1/patients/${id}`);
      success('Patient deleted successfully');
      navigate('/admin/patients');
    } catch (err) {
      showError('Failed to delete patient');
    }
  };

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    return status === 'active' ? 'success' : 'default';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error || !patient) {
    return (
      <Card>
        <EmptyState
          icon={<User className="w-12 h-12" />}
          title="Patient not found"
          description="The patient you're looking for doesn't exist or you don't have permission to view it."
          action={
            <Button onClick={() => navigate('/admin/patients')} variant="primary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Patients
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <div className="patient-profile-page">
      {/* Header */}
      <div className="page-header mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/patients')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Patient Profile</h1>
            <p className="text-sm text-gray-600 mt-1">
              Complete medical and administrative information
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="md" onClick={handleEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="error" size="md" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Patient Header Card */}
      <Card className="mb-6">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Avatar
                src={patient.profilePicture}
                alt={patient.fullName}
                size="xl"
                fallback={patient.fullName?.charAt(0) || 'P'}
              />
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{patient.fullName}</h2>
                  <Badge variant={getStatusBadgeVariant(patient.status || 'active')}>
                    {patient.status || 'Active'}
                  </Badge>
                  <Badge variant={getRiskBadgeVariant(patient.riskLevel || 'low')}>
                    {patient.riskLevel || 'Low'} Risk
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="w-4 h-4" />
                    <span className="font-mono font-semibold">{patient.displayId || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{patient.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{patient.phoneNumber || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{patient.center?.name || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Alert */}
            {(patient.riskLevel === 'high' || patient.riskLevel === 'critical') && (
              <Alert variant="warning" className="max-w-xs">
                <AlertTriangle className="w-4 h-4" />
                <div>
                  <p className="font-semibold">High Risk Patient</p>
                  <p className="text-xs mt-1">Requires immediate attention and monitoring</p>
                </div>
              </Alert>
            )}
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Appointments</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {stats?.totalAppointments || 0}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-primary-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Completed</p>
              <p className="text-xl font-bold text-success-600 mt-1">
                {stats?.completedAppointments || 0}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-success-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Upcoming</p>
              <p className="text-xl font-bold text-info-600 mt-1">
                {stats?.upcomingAppointments || 0}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-info-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Vital Records</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {stats?.totalVitals || 0}
              </p>
            </div>
            <Activity className="w-8 h-8 text-primary-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Wellness Plans</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {stats?.activeWellnessPlans || 0}
              </p>
            </div>
            <Heart className="w-8 h-8 text-primary-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Conditions</p>
              <p className="text-xl font-bold text-warning-600 mt-1">
                {stats?.activeConditions || 0}
              </p>
            </div>
            <FileText className="w-8 h-8 text-warning-600 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-8">
          {[
            { id: 'overview', label: 'Overview', icon: User },
            { id: 'vitals', label: 'Vital Signs', icon: Activity },
            { id: 'appointments', label: 'Appointments', icon: Calendar },
            { id: 'wellness', label: 'Wellness Plans', icon: Heart },
            { id: 'conditions', label: 'Conditions', icon: FileText },
            { id: 'notifications', label: 'Notifications', icon: Bell },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`
                  flex items-center gap-2 px-1 py-4 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                    <dd className="text-sm text-gray-900 mt-1">{patient.fullName}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="text-sm text-gray-900 mt-1">{patient.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
                    <dd className="text-sm text-gray-900 mt-1">{patient.phoneNumber || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                    <dd className="text-sm text-gray-900 mt-1">
                      {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Gender</dt>
                    <dd className="text-sm text-gray-900 mt-1">{patient.gender || 'N/A'}</dd>
                  </div>
                </dl>
              </div>
            </Card>

            {/* Medical Information */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Risk Level</dt>
                    <dd className="mt-1">
                      <Badge variant={getRiskBadgeVariant(patient.riskLevel || 'low')}>
                        {patient.riskLevel || 'Low'}
                      </Badge>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Active Conditions</dt>
                    <dd className="text-sm text-gray-900 mt-1">
                      {stats?.activeConditions || 0} conditions
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Last Visit</dt>
                    <dd className="text-sm text-gray-900 mt-1">
                      {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : 'Never'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Assigned Center</dt>
                    <dd className="text-sm text-gray-900 mt-1">{patient.center?.name || 'N/A'}</dd>
                  </div>
                </dl>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'vitals' && (
          <VitalsHistoryTab patientId={id!} />
        )}

        {activeTab === 'appointments' && (
          <AppointmentsTimelineTab patientId={id!} />
        )}

        {activeTab === 'wellness' && (
          <WellnessPlansTab patientId={id!} />
        )}

        {activeTab === 'conditions' && (
          <ConditionsTrackingTab patientId={id!} />
        )}

        {activeTab === 'notifications' && (
          <NotificationHistoryTab patientId={id!} />
        )}
      </div>
    </div>
  );
};

export default PatientProfile;

