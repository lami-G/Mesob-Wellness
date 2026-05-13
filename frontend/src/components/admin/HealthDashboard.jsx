import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

function HealthDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [healthData, setHealthData] = useState(null);
  const [vitalsTrends, setVitalsTrends] = useState(null);
  const [centerData, setCenterData] = useState(null);
  
  // Filters
  const [dateRange, setDateRange] = useState('30'); // days
  const [selectedCenter, setSelectedCenter] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('all');
  const [centers, setCenters] = useState([]);

  useEffect(() => {
    fetchHealthData();
    fetchCenters();
  }, [dateRange, selectedCenter, selectedCondition, selectedRiskLevel]);

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams();
      if (dateRange) params.append('dateRange', dateRange);
      if (selectedCenter !== 'all') params.append('center', selectedCenter);
      if (selectedCondition !== 'all') params.append('condition', selectedCondition);
      if (selectedRiskLevel !== 'all') params.append('riskLevel', selectedRiskLevel);

      const response = await api.get(`/api/v1/analytics/health/analytics`);
      setHealthData(response.data.data);
      
      // Fetch trends data
      const trendsResponse = await api.get(`/api/v1/analytics/vitals-trends?${params.toString()}`);
      setVitalsTrends(trendsResponse.data.data);
      
      // Fetch center data
      const centerResponse = await api.get(`/api/v1/analytics/health-by-center?${params.toString()}`);
      setCenterData(centerResponse.data.data);
    } catch (err) {
      setError('Failed to load health analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCenters = async () => {
    try {
      const response = await api.get('/api/v1/centers');
      setCenters(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch centers:', err);
    }
  };

  if (loading) {
    return <div className="loading-container">Loading health analytics...</div>;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  if (!healthData) {
    return <div className="alert alert-error">No data available</div>;
  }

  // Calculate health metrics
  const totalEmployees = healthData.totalPatients || 0;
  const totalVitals = healthData.totalVitalsRecorded || 0;
  const highRiskCount = healthData.highRiskCount || 0;
  
  // Calculate percentages
  const healthyPercent = totalVitals > 0 ? Math.round(((totalVitals - highRiskCount) / totalVitals) * 100) : 0;
  const atRiskPercent = totalVitals > 0 ? Math.round((highRiskCount / totalVitals) * 100) : 0;
  const criticalPercent = 0; // Can be calculated from data if available

  // Prepare condition distribution data
  const conditionData = (healthData.patientConditions || []).slice(0, 6).map(item => ({
    name: item.condition.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: item.count
  }));

  // Prepare BP distribution data
  const bpDistribution = [
    { name: 'Normal', value: healthData.bpRiskDistribution?.normal || 0, fill: '#10B981' },
    { name: 'Elevated', value: healthData.bpRiskDistribution?.elevated || 0, fill: '#F59E0B' },
    { name: 'Stage 1', value: healthData.bpRiskDistribution?.stage1 || 0, fill: '#EF5350' },
    { name: 'Stage 2', value: healthData.bpRiskDistribution?.stage2 || 0, fill: '#C62828' },
    { name: 'Crisis', value: healthData.bpRiskDistribution?.crisis || 0, fill: '#8B0000' }
  ];

  // Prepare BMI distribution data
  const bmiDistribution = [
    { name: 'Underweight', value: healthData.bmiDistribution?.underweight || 0, fill: '#3B82F6' },
    { name: 'Normal', value: healthData.bmiDistribution?.normal || 0, fill: '#10B981' },
    { name: 'Overweight', value: healthData.bmiDistribution?.overweight || 0, fill: '#F59E0B' },
    { name: 'Obesity', value: healthData.bmiDistribution?.obesity || 0, fill: '#EF5350' }
  ];

  // Prepare trends data
  const trendsData = (vitalsTrends || []).map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    systolic: item.avgSystolic,
    diastolic: item.avgDiastolic,
    glucose: item.avgGlucose,
    heartRate: item.avgHeartRate
  }));

  // Prepare center comparison data
  const centerComparisonData = (centerData || []).map(item => ({
    name: item.centerName,
    avgSystolic: item.avgSystolic,
    avgGlucose: item.avgGlucose,
    avgBMI: item.avgBMI,
    healthyPercent: item.healthyPercent
  }));

  // Calculate overall health score (0-100)
  const healthScore = Math.round((healthyPercent * 0.6) + (100 - atRiskPercent) * 0.4);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF5350', '#8B0000', '#6B7280'];

  return (
    <div className="health-dashboard">
      <h2>🏥 Workplace Health Analytics</h2>

      {/* Filters */}
      <div className="health-filters">
        <div className="filter-group">
          <label>Date Range</label>
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Center/Department</label>
          <select value={selectedCenter} onChange={(e) => setSelectedCenter(e.target.value)}>
            <option value="all">All Centers</option>
            {centers.map(center => (
              <option key={center.id} value={center.id}>{center.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Condition Type</label>
          <select value={selectedCondition} onChange={(e) => setSelectedCondition(e.target.value)}>
            <option value="all">All Conditions</option>
            <option value="hypertension">Hypertension</option>
            <option value="obesity">Obesity</option>
            <option value="diabetes">Diabetes</option>
            <option value="heart_issues">Heart Issues</option>
            <option value="respiratory_issues">Respiratory Issues</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Risk Level</label>
          <select value={selectedRiskLevel} onChange={(e) => setSelectedRiskLevel(e.target.value)}>
            <option value="all">All Risk Levels</option>
            <option value="low">Low Risk</option>
            <option value="normal">Normal</option>
            <option value="high">High Risk</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Top Section - Overall Health Score & Key Stats */}
      <div className="health-top-section">
        <div className="health-score-card">
          <h3>Overall Workplace Health Score</h3>
          <div className="health-gauge">
            <div className="gauge-value">{healthScore}</div>
            <div className="gauge-label">out of 100</div>
            <div className="gauge-status">
              {healthScore >= 80 ? '✓ Excellent' : healthScore >= 60 ? '⚠ Good' : '❌ Needs Attention'}
            </div>
          </div>
        </div>

        <div className="health-stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Employees</div>
            <div className="stat-value">{totalEmployees}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Healthy %</div>
            <div className="stat-value" style={{ color: '#10B981' }}>{healthyPercent}%</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">At-Risk %</div>
            <div className="stat-value" style={{ color: '#F59E0B' }}>{atRiskPercent}%</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Critical %</div>
            <div className="stat-value" style={{ color: '#EF5350' }}>{criticalPercent}%</div>
          </div>
        </div>
      </div>

      {/* Middle Section - Charts */}
      <div className="health-charts-section">
        {/* Condition Distribution */}
        <div className="chart-container">
          <h3>Condition Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={conditionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {conditionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default HealthDashboard;
