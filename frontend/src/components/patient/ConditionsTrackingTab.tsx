/* ========================================
   CONDITIONS TRACKING TAB COMPONENT
   Ethiopian Federal Healthcare Platform
   Patient Medical Conditions Management
   ======================================== */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, AlertTriangle, Calendar, Activity, Filter, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, Badge, Select, Spinner, EmptyState } from '@/components/ui';
import api from '../../services/api';

interface ConditionsTrackingTabProps {
  patientId: string;
}

interface PatientCondition {
  id: string;
  conditionName: string;
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  status: 'active' | 'managed' | 'resolved' | 'monitoring';
  diagnosedDate: string;
  resolvedDate?: string;
  notes?: string;
  symptoms?: string[];
  medications?: string[];
  lastReviewDate?: string;
  nextReviewDate?: string;
  diagnosedBy?: string;
}

export const ConditionsTrackingTab: React.FC<ConditionsTrackingTabProps> = ({ patientId }) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['patient-conditions', patientId, statusFilter, severityFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ patientId });
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (severityFilter !== 'all') params.append('severity', severityFilter);
      const response = await api.get(`/api/v1/patients/${patientId}/conditions?${params.toString()}`);
      return response.data.data as PatientCondition[];
    },
    enabled: !!patientId,
  });

  const conditions = data || [];
  const activeConditions = conditions.filter(c => c.status === 'active');
  const criticalConditions = conditions.filter(c => c.severity === 'critical' || c.severity === 'severe');

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'severe': return 'error';
      case 'moderate': return 'warning';
      case 'mild': return 'info';
      default: return 'default';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'error';
      case 'managed': return 'warning';
      case 'monitoring': return 'info';
      case 'resolved': return 'success';
      default: return 'default';
    }
  };

  const getSeverityIcon = (severity: string) => {
    if (severity === 'critical' || severity === 'severe') {
      return <AlertTriangle className="w-5 h-5 text-error-600" />;
    }
    return <Activity className="w-5 h-5 text-warning-600" />;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><Spinner size="lg" /></div>;
  }

  if (conditions.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="w-12 h-12" />}
        title="No medical conditions recorded"
        description="No medical conditions have been recorded for this patient."
      />
    );
  }

  return (
    <div className="conditions-tracking-tab space-y-6">
      {/* Filters & Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-500" />
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="managed">Managed</option>
            <option value="monitoring">Monitoring</option>
            <option value="resolved">Resolved</option>
          </Select>
          <Select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
            <option value="all">All Severity</option>
            <option value="critical">Critical</option>
            <option value="severe">Severe</option>
            <option value="moderate">Moderate</option>
            <option value="mild">Mild</option>
          </Select>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="error">{activeConditions.length} active</Badge>
          <Badge variant="warning">{criticalConditions.length} critical/severe</Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Total Conditions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{conditions.length}</p>
            </div>
            <FileText className="w-8 h-8 text-primary-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Active</p>
              <p className="text-2xl font-bold text-error-600 mt-1">{activeConditions.length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-error-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Critical/Severe</p>
              <p className="text-2xl font-bold text-warning-600 mt-1">{criticalConditions.length}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-warning-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-success-600 mt-1">
                {conditions.filter(c => c.status === 'resolved').length}
              </p>
            </div>
            <TrendingDown className="w-8 h-8 text-success-600 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Conditions List */}
      <div className="space-y-4">
        {conditions.map((condition) => (
          <Card key={condition.id}>
            <div className="p-6">
              {/* Condition Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  {getSeverityIcon(condition.severity)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{condition.conditionName}</h3>
                    <Badge variant={getSeverityVariant(condition.severity)}>{condition.severity}</Badge>
                    <Badge variant={getStatusVariant(condition.status)}>{condition.status}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Diagnosed: {new Date(condition.diagnosedDate).toLocaleDateString()}
                    </span>
                    {condition.resolvedDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Resolved: {new Date(condition.resolvedDate).toLocaleDateString()}
                      </span>
                    )}
                    {condition.diagnosedBy && (
                      <span className="text-gray-500">by {condition.diagnosedBy}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Condition Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Symptoms */}
                {condition.symptoms && condition.symptoms.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Symptoms:</p>
                    <div className="flex flex-wrap gap-2">
                      {condition.symptoms.map((symptom, idx) => (
                        <Badge key={idx} variant="default" size="sm">
                          {symptom}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Medications */}
                {condition.medications && condition.medications.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Medications:</p>
                    <div className="flex flex-wrap gap-2">
                      {condition.medications.map((medication, idx) => (
                        <Badge key={idx} variant="info" size="sm">
                          {medication}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Review Dates */}
              {(condition.lastReviewDate || condition.nextReviewDate) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-6 text-sm">
                    {condition.lastReviewDate && (
                      <div>
                        <span className="text-gray-600">Last Review: </span>
                        <span className="font-medium text-gray-900">
                          {new Date(condition.lastReviewDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {condition.nextReviewDate && (
                      <div>
                        <span className="text-gray-600">Next Review: </span>
                        <span className="font-medium text-gray-900">
                          {new Date(condition.nextReviewDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {condition.notes && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-1">Clinical Notes:</p>
                  <p className="text-sm text-gray-600 italic">{condition.notes}</p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
