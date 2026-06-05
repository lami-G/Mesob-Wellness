/* ========================================
   VITALS HISTORY TAB COMPONENT
   Ethiopian Federal Healthcare Platform
   Clinical Vitals Tracking & Analytics
   ======================================== */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  Heart,
  Droplet,
  Weight,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Calendar,
  Filter,
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, Badge, Button, Select, Spinner, EmptyState } from '@/components/ui';
import api from '../../services/api';

/* ========================================
   TYPES
   ======================================== */

interface VitalsHistoryTabProps {
  patientId: string;
}

interface VitalRecord {
  id: string;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  heartRate: number;
  temperature: number;
  weight: number;
  height: number;
  bmi: number;
  glucoseLevel?: number;
  glucoseType?: string;
  oxygenSaturation?: number;
  respiratoryRate?: number;
  recordedAt: string;
  recordedBy: string;
  notes?: string;
}

/* ========================================
   COMPONENT
   ======================================== */

export const VitalsHistoryTab: React.FC<VitalsHistoryTabProps> = ({ patientId }) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | '3months' | 'year' | 'all'>('month');
  const [selectedMetric, setSelectedMetric] = useState<'bp' | 'hr' | 'weight' | 'glucose' | 'all'>('all');

  // Fetch vitals history
  const { data, isLoading } = useQuery({
    queryKey: ['patient-vitals', patientId, timeRange],
    queryFn: async () => {
      const response = await api.get(`/api/v1/vitals?patientId=${patientId}&range=${timeRange}`);
      return response.data.data as VitalRecord[];
    },
    enabled: !!patientId,
  });

  const vitals = data || [];
  const latestVital = vitals[0];

  // Calculate trends
  const calculateTrend = (metric: keyof VitalRecord) => {
    if (vitals.length < 2) return 'stable';
    const latest = vitals[0]?.[metric] as number;
    const previous = vitals[1]?.[metric] as number;
    if (!latest || !previous) return 'stable';
    const change = ((latest - previous) / previous) * 100;
    if (Math.abs(change) < 2) return 'stable';
    return change > 0 ? 'up' : 'down';
  };

  // Get BP category
  const getBPCategory = (systolic: number, diastolic: number) => {
    if (systolic >= 180 || diastolic >= 120) return { label: 'Hypertensive Crisis', variant: 'error' as const };
    if (systolic >= 140 || diastolic >= 90) return { label: 'Hypertension', variant: 'error' as const };
    if (systolic >= 130 || diastolic >= 80) return { label: 'Elevated', variant: 'warning' as const };
    if (systolic >= 120 && diastolic < 80) return { label: 'Elevated', variant: 'warning' as const };
    return { label: 'Normal', variant: 'success' as const };
  };

  // Get BMI category
  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', variant: 'warning' as const };
    if (bmi < 25) return { label: 'Normal', variant: 'success' as const };
    if (bmi < 30) return { label: 'Overweight', variant: 'warning' as const };
    return { label: 'Obese', variant: 'error' as const };
  };

  // Prepare chart data
  const chartData = vitals.slice().reverse().map(v => ({
    date: new Date(v.recordedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    systolic: v.bloodPressureSystolic,
    diastolic: v.bloodPressureDiastolic,
    heartRate: v.heartRate,
    weight: v.weight,
    bmi: v.bmi,
    glucose: v.glucoseLevel,
    temperature: v.temperature,
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (vitals.length === 0) {
    return (
      <EmptyState
        icon={<Activity className="w-12 h-12" />}
        title="No vital signs recorded"
        description="No vital signs have been recorded for this patient yet."
      />
    );
  }

  return (
    <div className="vitals-history-tab space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-500" />
          <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value as any)}>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="year">Last Year</option>
            <option value="all">All Time</option>
          </Select>
          <Select value={selectedMetric} onChange={(e) => setSelectedMetric(e.target.value as any)}>
            <option value="all">All Metrics</option>
            <option value="bp">Blood Pressure</option>
            <option value="hr">Heart Rate</option>
            <option value="weight">Weight & BMI</option>
            <option value="glucose">Glucose</option>
          </Select>
        </div>
        <Badge variant="info">{vitals.length} records</Badge>
      </div>

      {/* Latest Vitals Summary */}
      {latestVital && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Blood Pressure */}
          <Card className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-error-100 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-error-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Blood Pressure</p>
                  <p className="text-lg font-bold text-gray-900">
                    {latestVital.bloodPressureSystolic}/{latestVital.bloodPressureDiastolic}
                  </p>
                </div>
              </div>
              {calculateTrend('bloodPressureSystolic') === 'up' ? (
                <TrendingUp className="w-4 h-4 text-error-600" />
              ) : calculateTrend('bloodPressureSystolic') === 'down' ? (
                <TrendingDown className="w-4 h-4 text-success-600" />
              ) : null}
            </div>
            <Badge variant={getBPCategory(latestVital.bloodPressureSystolic, latestVital.bloodPressureDiastolic).variant} size="sm">
              {getBPCategory(latestVital.bloodPressureSystolic, latestVital.bloodPressureDiastolic).label}
            </Badge>
          </Card>

          {/* Heart Rate */}
          <Card className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Heart Rate</p>
                  <p className="text-lg font-bold text-gray-900">{latestVital.heartRate} bpm</p>
                </div>
              </div>
              {calculateTrend('heartRate') === 'up' ? (
                <TrendingUp className="w-4 h-4 text-warning-600" />
              ) : calculateTrend('heartRate') === 'down' ? (
                <TrendingDown className="w-4 h-4 text-success-600" />
              ) : null}
            </div>
            <Badge 
              variant={latestVital.heartRate < 60 || latestVital.heartRate > 100 ? 'warning' : 'success'} 
              size="sm"
            >
              {latestVital.heartRate < 60 ? 'Low' : latestVital.heartRate > 100 ? 'High' : 'Normal'}
            </Badge>
          </Card>

          {/* Weight & BMI */}
          <Card className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-success-100 flex items-center justify-center">
                  <Weight className="w-5 h-5 text-success-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Weight / BMI</p>
                  <p className="text-lg font-bold text-gray-900">
                    {latestVital.weight}kg / {latestVital.bmi.toFixed(1)}
                  </p>
                </div>
              </div>
              {calculateTrend('weight') === 'up' ? (
                <TrendingUp className="w-4 h-4 text-warning-600" />
              ) : calculateTrend('weight') === 'down' ? (
                <TrendingDown className="w-4 h-4 text-success-600" />
              ) : null}
            </div>
            <Badge variant={getBMICategory(latestVital.bmi).variant} size="sm">
              {getBMICategory(latestVital.bmi).label}
            </Badge>
          </Card>

          {/* Glucose */}
          {latestVital.glucoseLevel && (
            <Card className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-warning-100 flex items-center justify-center">
                    <Droplet className="w-5 h-5 text-warning-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Glucose</p>
                    <p className="text-lg font-bold text-gray-900">{latestVital.glucoseLevel} mg/dL</p>
                  </div>
                </div>
                {calculateTrend('glucoseLevel') === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-error-600" />
                ) : calculateTrend('glucoseLevel') === 'down' ? (
                  <TrendingDown className="w-4 h-4 text-success-600" />
                ) : null}
              </div>
              <Badge 
                variant={latestVital.glucoseLevel > 140 ? 'error' : latestVital.glucoseLevel < 70 ? 'warning' : 'success'} 
                size="sm"
              >
                {latestVital.glucoseType || 'Random'}
              </Badge>
            </Card>
          )}
        </div>
      )}

      {/* Charts */}
      {(selectedMetric === 'all' || selectedMetric === 'bp') && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Blood Pressure Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#6B7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="systolic" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  name="Systolic"
                  dot={{ fill: '#EF4444', r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="diastolic" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  name="Diastolic"
                  dot={{ fill: '#F59E0B', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {(selectedMetric === 'all' || selectedMetric === 'hr') && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Heart Rate Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorHR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#6B7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="heartRate" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorHR)"
                  name="Heart Rate (bpm)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {(selectedMetric === 'all' || selectedMetric === 'weight') && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weight & BMI Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#6B7280" style={{ fontSize: '12px' }} />
                <YAxis yAxisId="left" stroke="#6B7280" style={{ fontSize: '12px' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#6B7280" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Weight (kg)"
                  dot={{ fill: '#10B981', r: 4 }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="bmi" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  name="BMI"
                  dot={{ fill: '#8B5CF6', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Vitals Timeline */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Vitals Timeline</h3>
          <div className="space-y-4">
            {vitals.slice(0, 10).map((vital) => {
              const bpCategory = getBPCategory(vital.bloodPressureSystolic, vital.bloodPressureDiastolic);
              const hasAbnormal = 
                bpCategory.variant === 'error' ||
                vital.heartRate < 60 || vital.heartRate > 100 ||
                (vital.glucoseLevel && (vital.glucoseLevel > 140 || vital.glucoseLevel < 70));

              return (
                <div key={vital.id} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${hasAbnormal ? 'bg-warning-100' : 'bg-gray-100'}`}>
                      {hasAbnormal ? (
                        <AlertTriangle className="w-5 h-5 text-warning-600" />
                      ) : (
                        <Activity className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(vital.recordedAt).toLocaleString()}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">by {vital.recordedBy}</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">BP:</span>
                        <span className="ml-1 font-medium text-gray-900">
                          {vital.bloodPressureSystolic}/{vital.bloodPressureDiastolic}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">HR:</span>
                        <span className="ml-1 font-medium text-gray-900">{vital.heartRate} bpm</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Weight:</span>
                        <span className="ml-1 font-medium text-gray-900">{vital.weight} kg</span>
                      </div>
                      <div>
                        <span className="text-gray-600">BMI:</span>
                        <span className="ml-1 font-medium text-gray-900">{vital.bmi.toFixed(1)}</span>
                      </div>
                    </div>
                    {vital.notes && (
                      <p className="mt-2 text-sm text-gray-600 italic">{vital.notes}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
};

