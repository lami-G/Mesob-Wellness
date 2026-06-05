/* ========================================
   WELLNESS PLANS TAB COMPONENT
   Ethiopian Federal Healthcare Platform
   Patient Wellness Plan Tracking & Progress
   ======================================== */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Heart, Target, TrendingUp, Calendar, CheckCircle, Clock, AlertCircle, Filter } from 'lucide-react';
import { Card, Badge, Button, Select, Spinner, EmptyState, Progress } from '@/components/ui';
import api from '../../services/api';

interface WellnessPlansTabProps {
  patientId: string;
}

interface WellnessPlan {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'cancelled';
  startDate: string;
  endDate?: string;
  goals: WellnessGoal[];
  progress: number;
  createdBy: string;
  notes?: string;
}

interface WellnessGoal {
  id: string;
  title: string;
  description: string;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  dueDate?: string;
}

export const WellnessPlansTab: React.FC<WellnessPlansTabProps> = ({ patientId }) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['patient-wellness', patientId, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ patientId });
      if (statusFilter !== 'all') params.append('status', statusFilter);
      const response = await api.get(`/api/v1/wellness?${params.toString()}`);
      return response.data.data as WellnessPlan[];
    },
    enabled: !!patientId,
  });

  const plans = data || [];
  const activePlans = plans.filter(p => p.status === 'active');
  const completedPlans = plans.filter(p => p.status === 'completed');

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getGoalStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-success-600" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-info-600" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-error-600" />;
      default: return <Target className="w-4 h-4 text-gray-400" />;
    }
  };

  const getGoalStatusVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'info';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><Spinner size="lg" /></div>;
  }

  if (plans.length === 0) {
    return (
      <EmptyState
        icon={<Heart className="w-12 h-12" />}
        title="No wellness plans found"
        description="No wellness plans have been created for this patient yet."
      />
    );
  }

  return (
    <div className="wellness-plans-tab space-y-6">
      {/* Filters & Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-500" />
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Plans</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="success">{activePlans.length} active</Badge>
          <Badge variant="info">{completedPlans.length} completed</Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Total Plans</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{plans.length}</p>
            </div>
            <Heart className="w-8 h-8 text-primary-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Active Plans</p>
              <p className="text-2xl font-bold text-success-600 mt-1">{activePlans.length}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-success-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Completed Plans</p>
              <p className="text-2xl font-bold text-info-600 mt-1">{completedPlans.length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-info-600 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Plans List */}
      <div className="space-y-4">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <div className="p-6">
              {/* Plan Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{plan.title}</h3>
                    <Badge variant={getStatusVariant(plan.status)}>{plan.status}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{plan.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Started: {new Date(plan.startDate).toLocaleDateString()}
                    </span>
                    {plan.endDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Ends: {new Date(plan.endDate).toLocaleDateString()}
                      </span>
                    )}
                    <span className="text-gray-500">Created by {plan.createdBy}</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                  <span className="text-sm font-semibold text-gray-900">{plan.progress}%</span>
                </div>
                <Progress value={plan.progress} variant={plan.progress === 100 ? 'success' : 'primary'} />
              </div>

              {/* Goals */}
              {plan.goals && plan.goals.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Goals ({plan.goals.length})</h4>
                  <div className="space-y-2">
                    {plan.goals.map((goal) => (
                      <div
                        key={goal.id}
                        className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {getGoalStatusIcon(goal.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-gray-900">{goal.title}</p>
                            <Badge variant={getGoalStatusVariant(goal.status)} size="sm">
                              {goal.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{goal.description}</p>
                          {goal.targetValue && (
                            <div className="flex items-center gap-4 text-xs text-gray-600">
                              <span>
                                Target: <span className="font-semibold">{goal.targetValue} {goal.unit}</span>
                              </span>
                              {goal.currentValue !== undefined && (
                                <span>
                                  Current: <span className="font-semibold">{goal.currentValue} {goal.unit}</span>
                                </span>
                              )}
                              {goal.currentValue !== undefined && goal.targetValue && (
                                <span>
                                  Progress:{' '}
                                  <span className="font-semibold">
                                    {Math.round((goal.currentValue / goal.targetValue) * 100)}%
                                  </span>
                                </span>
                              )}
                            </div>
                          )}
                          {goal.dueDate && (
                            <p className="text-xs text-gray-500 mt-1">
                              Due: {new Date(goal.dueDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {plan.notes && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
                  <p className="text-sm text-gray-600 italic">{plan.notes}</p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
