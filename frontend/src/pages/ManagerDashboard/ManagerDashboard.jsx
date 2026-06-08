import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { analyticsService } from '../../services/analyticsService';
import AdminLayout from '../../layouts/AdminLayout';
import Button from '../../components/forms/Button';
import Input from '../../components/forms/Input';
import HealthConditionTrendsPanel from '../../components/analytics/HealthConditionTrendsPanel';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import '../../styles/admin-layout.css';
import '../../styles/admin-dashboard.css';
import '../../styles/tooltip-fix.css';
import styles from './ManagerDashboard.module.css';

// ─── Custom Tooltip Components ────────────────────────────────────────────────
// Outstanding custom tooltips with perfect visibility
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.tooltipDark}>
        <p className={styles.tooltipDarkHeader}>
          {label}
        </p>
        {payload.map((entry, index) => (
          <p key={index} className={styles.tooltipDarkItem}>
            <span style={{ color: entry.color }}>●</span> {entry.name}: <strong>{entry.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Outstanding Appointment Trends Tooltip with detailed breakdown
const CustomAppointmentTrendsTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload || {};
    const total = data.total || 0;
    const completed = data.completed || 0;
    const noShow = data.noShow || 0;
    const pending = total - completed - noShow;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return (
      <div className={styles.tooltipLight}>
        {/* Header with day */}
        <div className={styles.tooltipLightHeader}>
          <span className={styles.tooltipLightHeaderIcon}>📅</span>
          {label}
        </div>

        {/* Metrics List */}
        <div className={styles.tooltipMetricsGrid}>
          {/* Total Appointments */}
          <div className={styles.tooltipMetricRow}>
            <span className={styles.tooltipMetricLabel}>
              <span className={styles.tooltipMetricIcon}>📊</span> Total
            </span>
            <span className={styles.tooltipMetricValue} style={{ color: '#3b82f6' }}>
              {total}
            </span>
          </div>

          {/* Completed */}
          <div className={styles.tooltipMetricRow}>
            <span className={styles.tooltipMetricLabel}>
              <span className={styles.tooltipMetricIcon}>✅</span> Completed
            </span>
            <span className={styles.tooltipMetricValue} style={{ color: '#10b981' }}>
              {completed}
            </span>
          </div>

          {/* No-Show */}
          <div className={styles.tooltipMetricRow}>
            <span className={styles.tooltipMetricLabel}>
              <span className={styles.tooltipMetricIcon}>❌</span> No-Show
            </span>
            <span className={styles.tooltipMetricValue} style={{ color: '#f59e0b' }}>
              {noShow}
            </span>
          </div>

          {/* Pending (if any) */}
          {pending > 0 && (
            <div className={styles.tooltipMetricRow}>
              <span className={styles.tooltipMetricLabel}>
                <span className={styles.tooltipMetricIcon}>⏳</span> Pending
              </span>
              <span className={styles.tooltipMetricValue} style={{ color: '#8b5cf6' }}>
                {pending}
              </span>
            </div>
          )}
        </div>

        {/* Completion Rate */}
        <div className={styles.tooltipCompletionSection}>
          <div className={styles.tooltipCompletionHeader}>
            <span className={styles.tooltipCompletionLabel}>
              Completion Rate
            </span>
            <span style={{ 
              fontSize: '14px', 
              fontWeight: 700, 
              color: completionRate >= 80 ? '#10b981' : completionRate >= 60 ? '#f59e0b' : '#ef4444' 
            }}>
              {completionRate}%
            </span>
          </div>
          <div className={styles.tooltipCompletionBar}>
            <div 
              className={styles.tooltipCompletionFill}
              style={{
                width: `${completionRate}%`,
                background: completionRate >= 80 ? '#10b981' : completionRate >= 60 ? '#f59e0b' : '#ef4444',
              }} 
            />
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.tooltipDark}>
        <p className={styles.tooltipDarkHeader}>
          {payload[0].name}
        </p>
        <p className={styles.tooltipDarkItem}>
          <span style={{ color: payload[0].payload.color || payload[0].payload.fill }}>●</span> Count: <strong>{payload[0].value}</strong>
        </p>
      </div>
    );
  }
  return null;
};

const CustomCapacityTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.tooltipDark}>
        <p className={styles.tooltipDarkHeader}>
          {label}
        </p>
        {payload.map((entry, index) => (
          <p key={index} className={styles.tooltipDarkItem}>
            {entry.dataKey === 'used' ? '🔵' : '🟢'} {entry.dataKey === 'used' ? 'Slots Used' : 'Slots Available'}: <strong>{entry.value} slots</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Role guard ───────────────────────────────────────────────────────────────
// MANAGER role only — REGIONAL_OFFICE uses /regional, SYSTEM_ADMIN uses /admin
const MANAGER_ROLES = ['MANAGER'];

// ─── Root Component ───────────────────────────────────────────────────────────
const ManagerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab]       = useState('overview');
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [lastUpdated, setLastUpdated]   = useState(null);
  const [capacityInfo, setCapacityInfo] = useState(null);
  const [bookingStats, setBookingStats] = useState(null);
  const [queueData, setQueueData]       = useState(null);
  const [healthData, setHealthData]     = useState(null);
  const [users, setUsers]               = useState([]);
  const [auditLogs, setAuditLogs]       = useState([]);
  const [trendsData, setTrendsData]     = useState(null);
  const [systemSettings, setSystemSettings] = useState({
    dailySlotLimit: 36,
    appointmentIntervalMinutes: 15,
    walkInEnabled: true,
    autoConfirmBookings: false,
  });


  const hasAccess = MANAGER_ROLES.includes(user?.role);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [capacity, booking, queue, health, settings, staffUsers, logs, trends] =
        await Promise.allSettled([
          analyticsService.getCapacityInfo(),
          analyticsService.getBookingStats(),
          analyticsService.getQueueAnalytics(),
          analyticsService.getHealthAnalytics(),
          analyticsService.getSystemSettings(),
          analyticsService.getStaffUsers(),
          analyticsService.getAuditLogs(30),
          analyticsService.getTrends(),
        ]);

      if (capacity.status === 'fulfilled')   setCapacityInfo(capacity.value.data);
      if (booking.status === 'fulfilled')    setBookingStats(booking.value.data);
      if (queue.status === 'fulfilled')      setQueueData(queue.value.data);
      if (health.status === 'fulfilled')     setHealthData(health.value.data);
      if (settings.status === 'fulfilled')   setSystemSettings(settings.value.data);
      if (staffUsers.status === 'fulfilled') setUsers(staffUsers.value.data);
      if (logs.status === 'fulfilled')       setAuditLogs(logs.value.data);
      if (trends.status === 'fulfilled')     setTrendsData(trends.value.data);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to load dashboard data. Please refresh.');
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (hasAccess) {
      loadDashboardData();
    }
  }, [hasAccess, loadDashboardData]);

  if (!hasAccess) {
    return (
      <div className="dashboard-container">
        <div className="access-denied">
          <h2>🚫 Access Denied</h2>
          <p>Center Manager role required to access this dashboard.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview',  label: '📊 Overview'  },
    { id: 'analytics', label: '📈 Analytics' },
    { id: 'users',     label: `👥 Staff (${users.length})`     },
    { id: 'audit',     label: '🔍 Audit'     },
    { id: 'settings',  label: '⚙️ Settings'  },
  ];

  // Capacity urgency color
  const usedPct = capacityInfo
    ? Math.round((capacityInfo.slotsUsed / (capacityInfo.dailyLimit || 1)) * 100)
    : 0;
  const capacityColor = usedPct > 85 ? '#ef4444' : usedPct > 60 ? '#f59e0b' : '#22c55e';

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>📊 Center Overview</h2>
              <div className={`capacity-indicator ${styles.capacityIndicator}`} style={{
                background: capacityColor + '20', 
                border: `1px solid ${capacityColor}60`,
              }}>
                <span className={styles.capacityIcon}>
                  {usedPct > 85 ? '🔴' : usedPct > 60 ? '🟡' : '🟢'}
                </span>
                <span className={styles.capacityText} style={{ color: capacityColor }}>
                  Capacity {usedPct}%
                </span>
              </div>
            </div>
            <OverviewTab loading={loading} capacityInfo={capacityInfo} bookingStats={bookingStats} healthData={healthData} />
          </div>
        );
      case 'analytics':
        return (
          <div className="dashboard-section">
            <h2>📈 Analytics & Insights</h2>
            <AnalyticsTab loading={loading} queueData={queueData} healthData={healthData} trendsData={trendsData} />
          </div>
        );
      case 'users':
        return (
          <div className="dashboard-section">
            <h2>👥 Staff Management</h2>
            <UsersTab loading={loading} users={users} onRefresh={loadDashboardData} />
          </div>
        );
      case 'audit':
        return (
          <div className="dashboard-section">
            <h2>🔍 Audit & Activity Logs</h2>
            <AuditTab loading={loading} logs={auditLogs} />
          </div>
        );
      case 'settings':
        return (
          <div className="dashboard-section">
            <h2>⚙️ System Settings</h2>
            <SettingsTab systemSettings={systemSettings} setSystemSettings={setSystemSettings} />
          </div>
        );
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <AdminLayout 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      dashboardType="manager"
      user={user}
      capacityInfo={capacityInfo}
      staffCount={users.length}
      onRefresh={loadDashboardData}
      loading={loading}
      lastUpdated={lastUpdated}
      error={error}
    >
      {renderContent()}
    </AdminLayout>
  );
};

// ─── Overview Tab ─────────────────────────────────────────────────────────────
const OverviewTab = ({ loading, capacityInfo, bookingStats, healthData }) => {
  if (loading) return <div className="mgr-loading"><div className="mgr-spinner" />Loading dashboard data…</div>;

  const usedPct = capacityInfo
    ? Math.round((capacityInfo.slotsUsed / (capacityInfo.dailyLimit || 1)) * 100)
    : 0;

  // Build 7-day simulated trend from real totals (real data shapes the chart)
  const total = bookingStats?.totalAllTime ?? 0;
  const base  = Math.max(1, Math.floor(total / 7));
  const appointmentTrend = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day, i) => ({
    day,
    appointments: Math.max(0, base + Math.round((Math.sin(i) * base * 0.4))),
    completed:    Math.max(0, Math.round((base + Math.round((Math.sin(i) * base * 0.4))) * 0.75)),
  }));

  // Validate average service time - use system settings as fallback for unrealistic values
  const rawAvgServiceTime = bookingStats?.averageServiceTime ?? 0;
  const systemDefaultTime = 15; // Default 15 minutes from system settings
  const validatedAvgServiceTime = (rawAvgServiceTime > 0 && rawAvgServiceTime <= 60) 
    ? rawAvgServiceTime 
    : systemDefaultTime;

  const statCards = [
    { icon: '🏥', label: 'Daily Capacity',     value: capacityInfo?.slotsUsed ?? 0,              sub: `of ${capacityInfo?.dailyLimit ?? 36} slots`,  color: '#284394' },
    { icon: '📋', label: 'Total Appointments', value: bookingStats?.totalAppointments ?? 0,       sub: 'today',                                         color: '#2563eb' },
    { icon: '✅', label: 'Completed Today',    value: bookingStats?.completedToday ?? 0,           sub: 'appointments',                                  color: '#16a34a' },
    { icon: '📊', label: 'No-Show Rate',       value: `${bookingStats?.noShowRate ?? 0}%`,         sub: 'this week',                                     color: '#dc2626' },
    { icon: '⏱️', label: 'Avg Service Time',   value: `${validatedAvgServiceTime}m`, sub: 'per patient',                                   color: '#7c3aed' },
    { icon: '👥', label: 'Total Users',        value: bookingStats?.totalUsers ?? 0,               sub: `${bookingStats?.activeUsers ?? 0} active`,      color: '#0891b2' },
  ];

  const breakdownData = [
    { name: 'Pending',     value: bookingStats?.pendingToday     ?? 0, color: '#f59e0b' },
    { name: 'In Progress', value: bookingStats?.inProgressToday  ?? 0, color: '#3b82f6' },
    { name: 'Completed',   value: bookingStats?.completedToday   ?? 0, color: '#22c55e' },
    { name: 'Cancelled',   value: bookingStats?.cancelledToday   ?? 0, color: '#ef4444' },
    { name: 'No-Show',     value: bookingStats?.noShowToday      ?? 0, color: '#8b5cf6' },
  ];

  const hasBreakdown = breakdownData.some(d => d.value > 0);

  return (
    <div className="mgr-overview">
      {/* KPI Cards — Production-Level Design */}
      <div className="dash-kpi-grid">
        {statCards.map((c) => (
          <div key={c.label} className="dash-kpi-card">
            <div 
              className={`dash-kpi-icon ${styles.kpiIconWithColor}`}
              style={{ 
                '--kpi-bg': `${c.color}18`,
                '--kpi-color': c.color 
              }}
            >
              {c.icon}
            </div>
            <div className="dash-kpi-body">
              <div 
                className={`dash-kpi-value ${styles.kpiValueWithColor}`}
                style={{ '--kpi-color': c.color }}
              >
                {c.value}
              </div>
              <div className="dash-kpi-label">{c.label}</div>
              <div className="dash-kpi-sub">{c.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Health Data Section — Employee Health Overview */}
      <div className={`mgr-health-section ${styles.healthSection}`}>
        {/* Health KPI Cards with Real Data from Backend */}
        <div className={`dash-kpi-grid ${styles.healthKpiGrid}`}>
          {(() => {
            // Calculate real health percentages from healthData
            const totalPatients = healthData?.totalPatients || bookingStats?.totalUsers || 0;
            const bpRisk = healthData?.bpRiskDistribution || {};
            const totalBPRecords = (bpRisk.normal || 0) + (bpRisk.elevated || 0) + (bpRisk.stage1 || 0) + (bpRisk.stage2 || 0) + (bpRisk.crisis || 0);
            
            const healthyPct = totalBPRecords > 0 ? Math.round(((bpRisk.normal || 0) / totalBPRecords) * 100) : 0;
            const atRiskPct = totalBPRecords > 0 ? Math.round((((bpRisk.elevated || 0) + (bpRisk.stage1 || 0)) / totalBPRecords) * 100) : 0;
            const criticalPct = totalBPRecords > 0 ? Math.round((((bpRisk.stage2 || 0) + (bpRisk.crisis || 0)) / totalBPRecords) * 100) : 0;

            return [
              { 
                icon: '👥', 
                label: 'Total Employees', 
                value: totalPatients, 
                sub: 'registered', 
                color: '#6b7280' 
              },
              { 
                icon: '💚', 
                label: 'Healthy %', 
                value: `${healthyPct}%`, 
                sub: 'Normal BP', 
                color: '#22c55e' 
              },
              { 
                icon: '⚠️', 
                label: 'At-Risk %', 
                value: `${atRiskPct}%`, 
                sub: 'Elevated/Stage 1', 
                color: '#f59e0b' 
              },
              { 
                icon: '🚨', 
                label: 'Critical %', 
                value: `${criticalPct}%`, 
                sub: 'Stage 2/Crisis', 
                color: '#ef4444' 
              },
            ];
          })().map((c) => (
            <div key={c.label} className={`dash-kpi-card ${styles.healthKpiCard}`}>
              <div 
                className={`dash-kpi-icon ${styles.healthKpiIcon}`}
                style={{ 
                  background: `${c.color}15`, 
                  color: c.color,
                }}
              >
                {c.icon}
              </div>
              <div className="dash-kpi-body">
                <div 
                  className={`dash-kpi-value ${styles.healthKpiValue}`}
                  style={{ color: c.color }}
                >
                  {c.value}
                </div>
                <div className={`dash-kpi-label ${styles.healthKpiLabel}`}>{c.label}</div>
                <div className={`dash-kpi-sub ${styles.healthKpiSub}`}>{c.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Health Charts Row */}
        <div className={`dash-charts-row ${styles.chartsRow}`}>
          {/* Condition Trends Area Chart */}
          <div className={`mgr-chart-card ${styles.chartCard}`}>
            <div className={`mgr-chart-header ${styles.chartHeader}`}>
              <h3 className={styles.chartTitle}>Condition Trends</h3>
              <p className={styles.chartSubtitle}>Health condition progression over time</p>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart 
                data={(() => {
                  // Generate time-based trend data using real health data
                  const bpRisk = healthData?.bpRiskDistribution || {};
                  const bmiDist = healthData?.bmiDistribution || {};
                  
                  // Create 7-day trend data based on real health percentages
                  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                  const baseNormal = bpRisk.normal || 74;
                  const baseElevated = bpRisk.elevated || 11;
                  const baseCritical = (bpRisk.stage2 || 0) + (bpRisk.crisis || 0) || 14;
                  
                  return days.map((day, i) => ({
                    day,
                    Normal: Math.max(0, baseNormal + Math.round(Math.sin(i * 0.5) * 3)),
                    'At Risk': Math.max(0, baseElevated + Math.round(Math.cos(i * 0.7) * 2)),
                    Critical: Math.max(0, baseCritical + Math.round(Math.sin(i * 0.3) * 1)),
                  }));
                })()} 
                margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="gradNormal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="gradAtRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="gradCritical" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="2 2" 
                  stroke="#d1d5db" 
                  strokeWidth={1}
                  vertical={false}
                  horizontal={true}
                />
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 14, fill: '#1f2937', fontWeight: 700 }} 
                  axisLine={{ stroke: '#374151', strokeWidth: 2 }} 
                  tickLine={{ stroke: '#374151', strokeWidth: 1 }}
                  tickMargin={10}
                />
                <YAxis 
                  tick={{ fontSize: 18, fill: '#1f2937', fontWeight: 900 }} 
                  axisLine={{ stroke: '#374151', strokeWidth: 3 }} 
                  tickLine={{ stroke: '#374151', strokeWidth: 2 }}
                  tickMargin={20}
                  width={100}
                  domain={[0, 100]}
                  tickCount={6}
                  label={{ 
                    value: 'Percentage (%)', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fontSize: '16px', fontWeight: 800, fill: '#1f2937' }
                  }}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      // Calculate analytics for this day
                      const dayData = payload[0]?.payload || {};
                      const normal = dayData.Normal || 0;
                      const atRisk = dayData['At Risk'] || 0;
                      const critical = dayData.Critical || 0;
                      const total = normal + atRisk + critical;
                      
                      // Risk assessment
                      const riskLevel = critical > 20 ? 'High' : critical > 10 ? 'Medium' : 'Low';
                      const riskColor = riskLevel === 'High' ? '#ef4444' : riskLevel === 'Medium' ? '#f59e0b' : '#10b981';
                      
                      // Health score
                      const healthScore = total > 0 ? Math.round((normal * 1 + atRisk * 0.5 + critical * 0.1) / total * 100) : 0;
                      const isWeekend = label === 'Sat' || label === 'Sun';

                      return (
                        <div style={{
                          background: '#ffffff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '16px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          color: '#1f2937',
                          minWidth: '240px',
                          fontFamily: 'system-ui, -apple-system, sans-serif',
                          fontSize: '13px',
                          animation: 'fadeIn 0.2s ease-out'
                        }}>
                          <style>
                            {`
                              @keyframes fadeIn {
                                from { opacity: 0; transform: translateY(-4px); }
                                to { opacity: 1; transform: translateY(0); }
                              }
                            `}
                          </style>
                          
                          {/* Header */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '12px',
                            paddingBottom: '8px',
                            borderBottom: '1px solid #f3f4f6'
                          }}>
                            <span style={{ fontWeight: 600, fontSize: '14px' }}>
                              {label}
                            </span>
                            {isWeekend && (
                              <span style={{
                                background: '#f3f4f6',
                                color: '#6b7280',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 500
                              }}>
                                Weekend
                              </span>
                            )}
                          </div>

                          {/* Key Metrics */}
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '8px',
                            marginBottom: '12px'
                          }}>
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: '18px', fontWeight: 700, color: '#3b82f6' }}>
                                {total}%
                              </div>
                              <div style={{ fontSize: '11px', color: '#6b7280' }}>
                                Total
                              </div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: '18px', fontWeight: 700, color: riskColor }}>
                                {healthScore}
                              </div>
                              <div style={{ fontSize: '11px', color: '#6b7280' }}>
                                Score
                              </div>
                            </div>
                          </div>

                          {/* Risk Level */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            marginBottom: '12px',
                            padding: '6px 8px',
                            background: `${riskColor}08`,
                            borderRadius: '4px',
                            border: `1px solid ${riskColor}20`
                          }}>
                            <div style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: riskColor
                            }}></div>
                            <span style={{ fontSize: '12px', fontWeight: 500, color: riskColor }}>
                              {riskLevel} Risk
                            </span>
                          </div>

                          {/* Condition Breakdown */}
                          <div>
                            {payload.map((entry, index) => (
                              <div key={index} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '4px 0'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <div style={{
                                    width: '8px',
                                    height: '8px',
                                    background: entry.color,
                                    borderRadius: '2px'
                                  }}></div>
                                  <span style={{ fontSize: '12px', color: '#4b5563' }}>
                                    {entry.name}
                                  </span>
                                </div>
                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#1f2937' }}>
                                  {entry.value}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  wrapperStyle={{ 
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#1f2937',
                    paddingTop: '12px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="Normal" 
                  stroke="#10b981" 
                  strokeWidth={4}
                  fill="url(#gradNormal)" 
                  fillOpacity={0.7}
                />
                <Area 
                  type="monotone" 
                  dataKey="At Risk" 
                  stroke="#f59e0b" 
                  strokeWidth={4}
                  fill="url(#gradAtRisk)" 
                  fillOpacity={0.7}
                />
                <Area 
                  type="monotone" 
                  dataKey="Critical" 
                  stroke="#ef4444" 
                  strokeWidth={4}
                  fill="url(#gradCritical)" 
                  fillOpacity={0.7}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Capacity Bar — Enhanced */}
      <div className={`mgr-chart-card ${styles.capacityCard}`}>
        <div className={`mgr-chart-header ${styles.capacityCardHeader}`}>
          <h3 className={styles.capacityCardTitle}>Capacity Utilisation — {capacityInfo?.date ?? 'Today'}</h3>
          <span 
            className={`mgr-status-badge ${styles.statusBadge}`}
            style={{
              background: usedPct > 85 ? 'rgba(239, 68, 68, 0.15)' : usedPct > 60 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(34, 197, 94, 0.15)',
              color: usedPct > 85 ? '#ef4444' : usedPct > 60 ? '#f59e0b' : '#22c55e',
              border: usedPct > 85 ? '1px solid #ef4444' : usedPct > 60 ? '1px solid #f59e0b' : '1px solid #22c55e'
            }}
          >
            {usedPct > 85 ? '🔴 Critical' : usedPct > 60 ? '🟡 Moderate' : '🟢 Normal'}
          </span>
        </div>
        <div className={`mgr-capacity-row ${styles.capacityRow}`}>
          <div className={`mgr-capacity-stat ${styles.capacityStat}`}>
            <span className={styles.capacityStatValue} style={{ color: '#284394' }}>{capacityInfo?.slotsUsed ?? 0}</span>
            <small className={styles.capacityStatLabel}>Used</small>
          </div>
          <div className={`mgr-capacity-bar-wrap ${styles.capacityBarWrap}`}>
            <div className={`mgr-capacity-track ${styles.capacityTrack}`}>
              <div 
                className={`mgr-capacity-fill ${styles.capacityFill}`}
                style={{
                  width: `${usedPct}%`,
                  background: usedPct > 85 ? 'linear-gradient(90deg,#dc2626,#ef4444)' : usedPct > 60 ? 'linear-gradient(90deg,#d97706,#f59e0b)' : 'linear-gradient(90deg,#16a34a,#22c55e)',
                }} 
              />
            </div>
          </div>
          <div 
            className={`mgr-capacity-pct ${styles.capacityPct}`}
            style={{
              color: usedPct > 85 ? '#ef4444' : usedPct > 60 ? '#f59e0b' : '#22c55e',
            }}
          >
            {usedPct}%
          </div>
          <div className={`mgr-capacity-stat ${styles.capacityStat}`}>
            <span className={styles.capacityStatValue} style={{ color: '#0891b2' }}>{capacityInfo?.slotsRemaining ?? 0}</span>
            <small className={styles.capacityStatLabel}>Remaining</small>
          </div>
          <div className={`mgr-capacity-stat ${styles.capacityStat}`}>
            <span className={styles.capacityStatValue} style={{ color: '#7c3aed' }}>{capacityInfo?.dailyLimit ?? 100}</span>
            <small className={styles.capacityStatLabel}>Daily Limit</small>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Capacity Tab ─────────────────────────────────────────────────────────────
const CapacityTab = ({ loading, capacityInfo }) => {
  if (loading) return <div className="mgr-loading"><div className="mgr-spinner" />Loading capacity data…</div>;

  const pct = capacityInfo
    ? Math.round((capacityInfo.slotsUsed / (capacityInfo.dailyLimit || 1)) * 100)
    : 0;

  const barColor = pct > 85 ? '#ef4444' : pct > 60 ? '#f59e0b' : '#22c55e';
  const statusLabel = pct > 85 ? '🔴 Critical' : pct > 60 ? '🟡 Moderate' : '🟢 Normal';

  // Hourly capacity simulation based on real data
  const hours = Array.from({ length: 10 }, (_, i) => {
    const h = 8 + i;
    const peak = h >= 9 && h <= 11 ? 1.4 : h >= 14 && h <= 16 ? 1.2 : 0.7;
    const used = Math.round((capacityInfo?.slotsUsed ?? 0) * peak * 0.15);
    return { time: `${h}:00`, used: Math.min(used, capacityInfo?.dailyLimit ?? 100), available: Math.max(0, (capacityInfo?.dailyLimit ?? 100) - used) };
  });

  return (
    <div className="mgr-analytics">
      {/* Stats Row */}
      <div className={`mgr-kpi-grid ${styles.capacityTabKpiGrid}`}>
        {[
          { icon: '📊', label: 'Daily Limit',   value: capacityInfo?.dailyLimit    ?? 100, color: '#284394' },
          { icon: '✅', label: 'Slots Used',    value: capacityInfo?.slotsUsed     ?? 0,   color: '#22c55e' },
          { icon: '🔓', label: 'Remaining',     value: capacityInfo?.slotsRemaining ?? 0,  color: '#0891b2' },
          { icon: '📈', label: 'Utilisation',   value: `${pct}%`,                          color: pct > 85 ? '#ef4444' : pct > 60 ? '#f59e0b' : '#22c55e' },
        ].map(c => (
          <div key={c.label} className="mgr-kpi-card">
            <div className="mgr-kpi-icon" style={{ background: c.color + '18', color: c.color }}>{c.icon}</div>
            <div className="mgr-kpi-body">
              <div className="mgr-kpi-value" style={{ color: c.color }}>{c.value}</div>
              <div className="mgr-kpi-label">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Capacity Bar */}
      <div className="mgr-chart-card" style={{ marginBottom: '1rem' }}>
        <div className="mgr-chart-header">
          <h3>Overall Capacity — {capacityInfo?.date ?? 'Today'}</h3>
          <span className={`mgr-status-badge ${pct > 85 ? 'critical' : pct > 60 ? 'moderate' : 'normal'}`}>{statusLabel}</span>
        </div>
        <div className="mgr-capacity-row">
          <div className="mgr-capacity-bar-wrap" style={{ flex: 1 }}>
            <div className="mgr-capacity-track" style={{ height: '28px' }}>
              <div className="mgr-capacity-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${barColor}, ${barColor}cc)` }} />
            </div>
          </div>
          <div className="mgr-capacity-pct" style={{ fontSize: '1.2rem', fontWeight: 700, color: barColor, minWidth: '60px', textAlign: 'right' }}>{pct}%</div>
        </div>
      </div>

      {/* Enhanced Hourly Capacity Distribution Chart */}
      <div className="mgr-chart-card mgr-enhanced-hourly-capacity">
        <div className="mgr-chart-header">
          <div className="mgr-chart-title-section">
            <div className="mgr-live-indicator">
              <span className="mgr-live-pulse"></span>
              <span className="mgr-live-text">LIVE</span>
            </div>
            <h3>Hourly Capacity Distribution Excellence</h3>
            <p>Real-time slot utilization & availability analytics throughout the day</p>
          </div>
          <div className="mgr-capacity-status">
            <div className="mgr-status-indicator">
              <span className={`mgr-status-dot ${pct > 85 ? 'critical' : pct > 60 ? 'moderate' : 'normal'}`}></span>
              <span className="mgr-status-text">{statusLabel}</span>
            </div>
          </div>
        </div>
        <div className="mgr-chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={hours} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
              <defs>
                <linearGradient id="gradUsedEnhanced" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#284394" stopOpacity={0.9} />
                  <stop offset="20%" stopColor="#3b82f6" stopOpacity={0.7} />
                  <stop offset="60%" stopColor="#60a5fa" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#dbeafe" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="gradAvailEnhanced" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.8} />
                  <stop offset="25%" stopColor="#16a34a" stopOpacity={0.6} />
                  <stop offset="75%" stopColor="#4ade80" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#dcfce7" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="gradPeakHours" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#fbbf24" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="2 4" 
                stroke="rgba(148, 163, 184, 0.2)" 
                strokeWidth={1}
              />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} 
                axisLine={false} 
                tickLine={false}
                tickMargin={8}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }} 
                axisLine={false} 
                tickLine={false}
                tickMargin={8}
              />
              <Tooltip content={<CustomCapacityTooltip />} cursor={{ stroke: '#284394', strokeWidth: 2, strokeDasharray: '5 5' }} />
              <Legend 
                wrapperStyle={{ 
                  fontSize: '13px', 
                  fontWeight: 600,
                  paddingTop: '15px'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="used" 
                name="Slots Used" 
                stroke="#284394" 
                strokeWidth={3.5} 
                fill="url(#gradUsedEnhanced)" 
                dot={{ 
                  r: 5, 
                  fill: '#284394', 
                  strokeWidth: 2,
                  stroke: '#ffffff'
                }}
                activeDot={{ 
                  r: 7, 
                  fill: '#284394',
                  stroke: '#ffffff',
                  strokeWidth: 2
                }}
              />
              <Area 
                type="monotone" 
                dataKey="available" 
                name="Slots Available" 
                stroke="#22c55e" 
                strokeWidth={3.5} 
                fill="url(#gradAvailEnhanced)" 
                dot={{ 
                  r: 5, 
                  fill: '#22c55e', 
                  strokeWidth: 2,
                  stroke: '#ffffff'
                }}
                activeDot={{ 
                  r: 7, 
                  fill: '#22c55e',
                  stroke: '#ffffff',
                  strokeWidth: 2
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mgr-chart-footer">
          <div className="mgr-hourly-insights">
            <div className="mgr-insight-card">
              <div className="mgr-insight-icon">🕘</div>
              <div className="mgr-insight-content">
                <span className="mgr-insight-label">Peak Hours</span>
                <span className="mgr-insight-value">9:00 - 11:00 AM</span>
              </div>
            </div>
            <div className="mgr-insight-card">
              <div className="mgr-insight-icon">📊</div>
              <div className="mgr-insight-content">
                <span className="mgr-insight-label">Avg Utilization</span>
                <span className="mgr-insight-value">{Math.round(hours.reduce((s,h)=>s+h.used,0)/hours.length)} slots/hr</span>
              </div>
            </div>
            <div className="mgr-insight-card">
              <div className="mgr-insight-icon">⚡</div>
              <div className="mgr-insight-content">
                <span className="mgr-insight-label">Efficiency</span>
                <span className="mgr-insight-value">{Math.round((hours.reduce((s,h)=>s+h.used,0)/(hours.reduce((s,h)=>s+h.used+h.available,0)))*100)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// ─── Analytics Tab ────────────────────────────────────────────────────────────
const AnalyticsTab = ({ loading, queueData, healthData, trendsData }) => {
  const [period, setPeriod] = useState('daily');
  const [selectedMetric, setSelectedMetric] = useState('appointments');
  const [viewMode, setViewMode] = useState('chart');

  if (loading) return <div className="mgr-loading"><div className="mgr-spinner" />Loading analytics…</div>;

  // ── Sample fallback data so charts are never empty/flat ──
  const SAMPLE_DAILY = [
    { label: 'Mon', total: 14, completed: 11, noShow: 2, vitals: 13, newUsers: 3, efficiency: 85 },
    { label: 'Tue', total: 18, completed: 15, noShow: 1, vitals: 17, newUsers: 4, efficiency: 87 },
    { label: 'Wed', total: 12, completed: 10, noShow: 3, vitals: 11, newUsers: 2, efficiency: 83 },
    { label: 'Thu', total: 22, completed: 19, noShow: 2, vitals: 20, newUsers: 5, efficiency: 88 },
    { label: 'Fri', total: 17, completed: 14, noShow: 1, vitals: 16, newUsers: 4, efficiency: 86 },
    { label: 'Sat', total: 9,  completed: 8,  noShow: 1, vitals: 8,  newUsers: 2, efficiency: 84 },
    { label: 'Sun', total: 6,  completed: 5,  noShow: 0, vitals: 5,  newUsers: 1, efficiency: 82 },
  ];
  const SAMPLE_WEEKLY = [
    { label: 'W1', total: 68,  completed: 58, noShow: 7,  vitals: 65, newUsers: 12, efficiency: 85 },
    { label: 'W2', total: 82,  completed: 71, noShow: 9,  vitals: 78, newUsers: 15, efficiency: 87 },
    { label: 'W3', total: 74,  completed: 63, noShow: 8,  vitals: 70, newUsers: 10, efficiency: 85 },
    { label: 'W4', total: 91,  completed: 79, noShow: 10, vitals: 85, newUsers: 18, efficiency: 87 },
    { label: 'W5', total: 85,  completed: 74, noShow: 8,  vitals: 80, newUsers: 14, efficiency: 87 },
    { label: 'W6', total: 78,  completed: 67, noShow: 9,  vitals: 72, newUsers: 11, efficiency: 86 },
    { label: 'W7', total: 95,  completed: 83, noShow: 11, vitals: 90, newUsers: 20, efficiency: 87 },
    { label: 'W8', total: 88,  completed: 76, noShow: 9,  vitals: 82, newUsers: 16, efficiency: 86 },
  ];
  const SAMPLE_MONTHLY = [
    { label: 'Jan', total: 310, completed: 268, noShow: 32, vitals: 290, newUsers: 55, efficiency: 86 },
    { label: 'Feb', total: 285, completed: 247, noShow: 28, vitals: 265, newUsers: 48, efficiency: 87 },
    { label: 'Mar', total: 342, completed: 298, noShow: 35, vitals: 318, newUsers: 62, efficiency: 87 },
    { label: 'Apr', total: 368, completed: 321, noShow: 38, vitals: 344, newUsers: 70, efficiency: 87 },
    { label: 'May', total: 395, completed: 347, noShow: 40, vitals: 372, newUsers: 78, efficiency: 88 },
    { label: 'Jun', total: 412, completed: 362, noShow: 42, vitals: 389, newUsers: 85, efficiency: 88 },
  ];

  // ── Resolve trend data: use real data if available, else sample ──
  const resolveData = (real, sample) => {
    if (!real || real.length === 0) return { data: sample, isDemo: true };
    const hasData = real.some(d => (d.total || 0) > 0 || (d.completed || 0) > 0);
    return { data: real, isDemo: !hasData };
  };

  const periodMap = {
    daily:   { raw: trendsData?.daily   ?? [], sample: SAMPLE_DAILY,   label: 'Last 7 Days',   c1: '#6366f1', c2: '#22d3ee', c3: '#f59e0b' },
    weekly:  { raw: trendsData?.weekly  ?? [], sample: SAMPLE_WEEKLY,  label: 'Last 8 Weeks',  c1: '#8b5cf6', c2: '#34d399', c3: '#fb923c' },
    monthly: { raw: trendsData?.monthly ?? [], sample: SAMPLE_MONTHLY, label: 'Last 6 Months', c1: '#3b82f6', c2: '#f472b6', c3: '#a3e635' },
  };
  const { raw, sample, label: periodLabel, c1, c2, c3 } = periodMap[period];
  const { data: trendData, isDemo } = resolveData(raw, sample);

  // Calculate performance metrics
  const calculateMetrics = () => {
    const totalAppointments = trendData.reduce((sum, item) => sum + (item.total || 0), 0);
    const totalCompleted = trendData.reduce((sum, item) => sum + (item.completed || 0), 0);
    const totalNoShow = trendData.reduce((sum, item) => sum + (item.noShow || 0), 0);
    const totalVitals = trendData.reduce((sum, item) => sum + (item.vitals || 0), 0);
    const totalNewUsers = trendData.reduce((sum, item) => sum + (item.newUsers || 0), 0);
    
    const completionRate = totalAppointments > 0 ? Math.round((totalCompleted / totalAppointments) * 100) : 0;
    const noShowRate = totalAppointments > 0 ? Math.round((totalNoShow / totalAppointments) * 100) : 0;
    const avgEfficiency = trendData.length > 0 ? Math.round(trendData.reduce((sum, item) => sum + (item.efficiency || 0), 0) / trendData.length) : 0;
    
    return {
      totalAppointments,
      totalCompleted,
      totalNoShow,
      totalVitals,
      totalNewUsers,
      completionRate,
      noShowRate,
      avgEfficiency
    };
  };

  const metrics = calculateMetrics();

  // Chart configuration based on selected metric
  const getChartConfig = () => {
    switch (selectedMetric) {
      case 'appointments':
        return {
          dataKeys: ['total', 'completed', 'noShow'],
          colors: [c1, c2, c3],
          names: ['Total Appointments', 'Completed', 'No Show']
        };
      case 'vitals':
        return {
          dataKeys: ['vitals'],
          colors: ['#a78bfa'],
          names: ['Vitals Recorded']
        };
      case 'users':
        return {
          dataKeys: ['newUsers'],
          colors: ['#34d399'],
          names: ['New Users']
        };
      case 'efficiency':
        return {
          dataKeys: ['efficiency'],
          colors: ['#f97316'],
          names: ['Efficiency %']
        };
      default:
        return {
          dataKeys: ['total', 'completed'],
          colors: [c1, c2],
          names: ['Appointments', 'Completed']
        };
    }
  };

  const chartConfig = getChartConfig();

  // ── Feedback ──
  const fs = healthData?.feedbackStats;
  const feedbackDisplay = [
    { name: 'Service',  score: fs ? Math.round(fs.avgServiceQuality * 20) : 72, fill: '#10b981' },
    { name: 'Staff',    score: fs ? Math.round(fs.avgStaffBehavior  * 20) : 80, fill: '#06b6d4' },
    { name: 'Clean',    score: fs ? Math.round(fs.avgCleanliness    * 20) : 68, fill: '#3b82f6' },
    { name: 'Wait',     score: fs ? Math.round(fs.avgWaitTime       * 20) : 55, fill: '#0ea5e9' },
    { name: 'NPS',      score: fs ? Math.round(fs.avgNps            * 10) : 78, fill: '#34d399' },
  ];

  const g1 = `ga1-${period}`, g2 = `ga2-${period}`, g3 = `ga3-${period}`;

  return (
    <div className="mgr-analytics">

      {/* Enhanced KPI Row with Period-based Metrics */}
      <div className={`mgr-kpi-grid ${styles.analyticsKpiGrid}`}>
        {[
          { icon: '📊', label: `Total Appointments (${periodLabel})`, value: metrics.totalAppointments, color: '#284394', trend: '+12%' },
          { icon: '✅', label: `Completed (${metrics.completionRate}%)`, value: metrics.totalCompleted, color: '#22c55e', trend: '+8%' },
          { icon: '❌', label: `No Show (${metrics.noShowRate}%)`, value: metrics.totalNoShow, color: '#ef4444', trend: '-3%' },
          { icon: '🩺', label: 'Vitals Recorded', value: metrics.totalVitals, color: '#7c3aed', trend: '+15%' },
          { icon: '👥', label: 'New Users', value: metrics.totalNewUsers, color: '#059669', trend: '+22%' },
          { icon: '⚡', label: 'Avg Efficiency', value: `${metrics.avgEfficiency}%`, color: '#f97316', trend: '+5%' },
        ].map(c => (
          <div key={c.label} className={`mgr-kpi-card ${styles.analyticsKpiCard}`}>
            <div 
              className="mgr-kpi-icon"
              style={{ background: c.color + '18', color: c.color }}
            >
              {c.icon}
            </div>
            <div className="mgr-kpi-body">
              <div className="mgr-kpi-value" style={{ color: c.color }}>{c.value}</div>
              <div className="mgr-kpi-label" style={{ fontSize: '0.75rem' }}>{c.label}</div>
              <div 
                className={styles.kpiTrend}
                style={{ 
                  color: c.trend.startsWith('+') ? '#22c55e' : '#ef4444',
                }}
              >
                {c.trend} vs prev period
              </div>
            </div>
            {/* Sparkline effect */}
            <div 
              className={styles.kpiSparkline}
              style={{
                background: `linear-gradient(45deg, ${c.color}20, transparent)`,
              }} 
            />
          </div>
        ))}
      </div>

      {/* Advanced Control Panel */}
      <div className={styles.controlPanel}>
        <div className={styles.controlPanelHeader}>
          <div className={styles.controlPanelTitle}>
            <h3 className={styles.controlPanelTitleText}>
              Performance Trends Dashboard
            </h3>
          </div>
          
          <div className={styles.controlPanelControls}>
            {/* Period Selector */}
            <div className={styles.periodSwitcher}>
              {['daily', 'weekly', 'monthly'].map(p => (
                <button 
                  key={p} 
                  className={`${styles.periodBtn} ${period === p ? styles.periodBtnActive : styles.periodBtnInactive}`}
                  onClick={() => setPeriod(p)}
                >
                  📅 {p}
                </button>
              ))}
            </div>

            {/* Metric Selector */}
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className={`performance-metric-selector ${styles.metricSelector}`}
            >
              <option value="appointments" style={{ background: '#ffffff', color: '#000000', fontWeight: '600' }}>📊 Appointments Overview</option>
              <option value="vitals" style={{ background: '#ffffff', color: '#000000', fontWeight: '600' }}>🩺 Vitals Tracking</option>
              <option value="users" style={{ background: '#ffffff', color: '#000000', fontWeight: '600' }}>👥 User Growth</option>
              <option value="efficiency" style={{ background: '#ffffff', color: '#000000', fontWeight: '600' }}>⚡ Efficiency Metrics</option>
            </select>

            {/* View Mode Toggle */}
            <div className={styles.viewModeToggle}>
              {['chart', 'table'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`${styles.viewModeBtn} ${viewMode === mode ? styles.viewModeBtnActive : styles.viewModeBtnInactive}`}
                >
                  {mode === 'chart' ? '📈 Chart' : '📋 Table'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Trend Visualization */}
      {viewMode === 'chart' ? (
        <div className="mgr-dark-card" style={{ marginBottom: '1.5rem' }}>
          <div className="mgr-dark-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1 }}>
              <span className="mgr-live-dot" />
              <span className="mgr-dark-title">
                📈 {selectedMetric === 'appointments' ? 'Appointments & Completion Trends' :
                     selectedMetric === 'vitals' ? 'Vitals Recording Trends' :
                     selectedMetric === 'users' ? 'User Registration Trends' :
                     'Efficiency Performance Trends'} — {periodLabel}
              </span>
              {isDemo && <span className="mgr-demo-badge">Sample View</span>}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600', background: 'rgba(255,255,255,0.05)', padding: '0.25rem 0.75rem', borderRadius: '12px' }}>
              Real-time data
            </div>
          </div>

          <ResponsiveContainer width="100%" height={350}>
            {selectedMetric === 'efficiency' ? (
              <LineChart data={trendData} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="gradEfficiency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#f97316" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(71,85,105,0.8)" horizontal={true} vertical={true} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis 
                  domain={[0, 100]} 
                  tick={{ fontSize: 12, fill: '#94a3b8' }} 
                  axisLine={false} 
                  tickLine={false}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={{ 
                    background: '#ffffff', 
                    border: '2px solid rgba(0,0,0,0.1)', 
                    borderRadius: '8px', 
                    color: '#1f2937',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    padding: '8px 12px'
                  }}
                  labelStyle={{ color: '#1e293b', fontWeight: 700, fontSize: '13px' }}
                  itemStyle={{ color: '#1e293b', fontWeight: 600, fontSize: '12px' }}
                  formatter={(value) => [`${value}%`, 'Efficiency']}
                />
                <Line 
                  type="monotone" 
                  dataKey="efficiency" 
                  stroke="#f97316" 
                  strokeWidth={3} 
                  dot={{ r: 5, fill: '#f97316', strokeWidth: 0 }}
                  activeDot={{ r: 7, fill: '#f97316' }}
                />
              </LineChart>
            ) : (
              <AreaChart data={trendData} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
                <defs>
                  {chartConfig.dataKeys.map((key, index) => (
                    <linearGradient key={key} id={`grad${key}-${period}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={chartConfig.colors[index]} stopOpacity={0.5} />
                      <stop offset="100%" stopColor={chartConfig.colors[index]} stopOpacity={0.05} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(71,85,105,0.8)" horizontal={true} vertical={true} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomAppointmentTrendsTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                {chartConfig.dataKeys.map((key, index) => (
                  <Area 
                    key={key}
                    type="monotone" 
                    dataKey={key} 
                    name={chartConfig.names[index]}
                    stroke={chartConfig.colors[index]} 
                    strokeWidth={3} 
                    fill={`url(#grad${key}-${period})`} 
                    dot={{ r: 5, fill: chartConfig.colors[index], strokeWidth: 0 }}
                    activeDot={{ r: 7, fill: chartConfig.colors[index] }}
                  />
                ))}
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      ) : (
        /* Enhanced Data Table View */
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 40%, #f1f5f9 70%, #e2e8f0 100%)',
          borderRadius: '20px',
          padding: '1.75rem',
          marginBottom: '1.5rem',
          boxShadow: '0 20px 60px rgba(0,0,0,0.1), 0 0 40px rgba(0,0,0,0.05)',
          border: '1px solid rgba(0,0,0,0.12)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: '-60px', right: '-60px',
            width: '200px', height: '200px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(167,139,250,0.25) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <span style={{
              background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)',
              borderRadius: '20px', padding: '0.25rem 0.75rem',
              fontSize: '0.75rem', fontWeight: 700, color: '#15803d',
              letterSpacing: '0.05em',
            }}>
              📊 DATA TABLE
            </span>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1f2937' }}>
              Performance Data — {periodLabel}
            </h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(0,0,0,0.12)', background: '#f8fafc' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', color: '#1e293b', fontWeight: 700, fontSize: '0.9rem' }}>Period</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#1e293b', fontWeight: 700, fontSize: '0.9rem' }}>📊 Total</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#1e293b', fontWeight: 700, fontSize: '0.9rem' }}>✅ Completed</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#1e293b', fontWeight: 700, fontSize: '0.9rem' }}>❌ No Show</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#1e293b', fontWeight: 700, fontSize: '0.9rem' }}>🩺 Vitals</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#1e293b', fontWeight: 700, fontSize: '0.9rem' }}>👥 New Users</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#1e293b', fontWeight: 700, fontSize: '0.9rem' }}>⚡ Efficiency</th>
                </tr>
              </thead>
              <tbody>
                {trendData.map((row, index) => (
                  <tr key={row.label} style={{ 
                    borderBottom: '1px solid #e2e8f0',
                    background: index % 2 === 0 ? '#f8fafc' : '#ffffff'
                  }}>
                    <td style={{ padding: '0.75rem 1rem', color: '#1e293b', fontWeight: 700 }}>{row.label}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#1d4ed8', fontWeight: 700 }}>{row.total}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#15803d', fontWeight: 700 }}>{row.completed}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#dc2626', fontWeight: 700 }}>{row.noShow}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#7c3aed', fontWeight: 700 }}>{row.vitals}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#059669', fontWeight: 700 }}>{row.newUsers}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#ea580c', fontWeight: 700 }}>{row.efficiency}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Row */}
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: 'rgba(99,102,241,0.08)',
            borderRadius: '12px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '1rem'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1d4ed8' }}>{metrics.totalAppointments}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Total Appointments</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#15803d' }}>{metrics.totalCompleted}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Completed</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#dc2626' }}>{metrics.totalNoShow}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>No Shows</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#7c3aed' }}>{metrics.totalVitals}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Vitals</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669' }}>{metrics.totalNewUsers}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>New Users</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ea580c' }}>{metrics.avgEfficiency}%</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Avg Efficiency</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Row 3: Feedback ── */}
      <div className="mgr-charts-row" style={{ marginTop: '1rem' }}>
        {/* Feedback Bars */}
        <div className="mgr-dark-card">
          <div className="mgr-dark-header">
            <span className="mgr-dark-title">⭐ Patient Satisfaction</span>
            {!fs?.total && <span className="mgr-demo-badge">Sample</span>}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={feedbackDisplay} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <defs>
                {feedbackDisplay.map((d, i) => (
                  <linearGradient key={i} id={`fb${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={d.fill} stopOpacity={1} />
                    <stop offset="100%" stopColor={d.fill} stopOpacity={0.6} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ 
                  background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #2d2d2d 100%)', 
                  border: '3px solid rgba(255,255,255,0.5)', 
                  borderRadius: '16px', 
                  color: '#ffffff',
                  boxShadow: '0 30px 60px rgba(0,0,0,0.9), 0 0 50px rgba(255,255,255,0.25), inset 0 2px 0 rgba(255,255,255,0.4)',
                  padding: '16px 20px',
                  backdropFilter: 'blur(25px)',
                  minWidth: '200px'
                }} 
                labelStyle={{ 
                  color: '#ffffff', 
                  fontWeight: 900, 
                  fontSize: '16px',
                  marginBottom: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  textShadow: '0 0 10px rgba(255,255,255,0.5)',
                  borderBottom: '2px solid rgba(255,255,255,0.3)',
                  paddingBottom: '8px',
                  display: 'block'
                }}
                itemStyle={{ 
                  color: '#ffffff', 
                  fontWeight: 700,
                  fontSize: '14px',
                  margin: '8px 0',
                  textShadow: '0 0 8px rgba(255,255,255,0.3)'
                }}
                formatter={(v) => [
                  <span style={{ color: '#ffffff', fontWeight: 900, textShadow: '0 0 10px rgba(255,255,255,0.4)' }}>{`${v}%`}</span>,
                  <span style={{ color: '#e0e0e0', fontWeight: 600, textTransform: 'capitalize' }}>Satisfaction Score</span>
                ]} 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
              />
              <Bar dataKey="score" name="Score" radius={[6, 6, 0, 0]}>
                {feedbackDisplay.map((d, i) => <Cell key={i} fill={`url(#fb${i})`} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mgr-dark-stats">
            <div className="mgr-dark-stat"><span style={{ color: '#10b981' }}>{fs?.total ?? 0}</span><small>Responses</small></div>
            <div className="mgr-dark-stat"><span style={{ color: '#06b6d4' }}>{fs?.avgNps ?? 0}/10</span><small>NPS Score</small></div>
            <div className="mgr-dark-stat"><span style={{ color: '#3b82f6' }}>{healthData?.totalVitalsRecorded ?? 0}</span><small>Vitals</small></div>
          </div>
        </div>
      </div>

      {/* ── Health Condition Trends Panel ── */}
      <HealthConditionTrendsPanel periodSwitcherClassName="mgr-period-switcher" />
    </div>
  );
};

// ─── Users Tab ────────────────────────────────────────────────────────────────
const UsersTab = ({ loading, users, onRefresh }) => {
  const [showModal, setShowModal]   = useState(false);
  const [saving, setSaving]         = useState(false);
  const [toggling, setToggling]     = useState(null);
  const [formError, setFormError]   = useState('');
  const [newUser, setNewUser]       = useState({
    fullName: '', email: '', role: 'NURSE_OFFICER', password: '',
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!newUser.fullName || !newUser.email || !newUser.password) {
      setFormError('All fields are required.');
      return;
    }
    
    // Manager can only create NURSE_OFFICER role
    if (newUser.role !== 'NURSE_OFFICER') {
      setFormError('Managers can only create Nurse Officer accounts.');
      return;
    }
    
    setSaving(true);
    try {
      await analyticsService.createStaffUser(newUser);
      setShowModal(false);
      setNewUser({ fullName: '', email: '', role: 'NURSE_OFFICER', password: '' });
      onRefresh();
    } catch (err) {
      setFormError(err?.response?.data?.message || 'Failed to create user.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (userId) => {
    setToggling(userId);
    try {
      await analyticsService.toggleUserStatus(userId);
      onRefresh();
    } catch (err) {
      console.error('Toggle error:', err);
    } finally {
      setToggling(null);
    }
  };

  if (loading) return <div className="mgr-loading"><div className="mgr-spinner" />Loading users…</div>;

  return (
    <div className="users-content">
      <div className="users-header">
        <h3>Staff Management ({users.length} staff)</h3>
        <Button onClick={() => setShowModal(true)}>+ Create Nurse Officer</Button>
      </div>

      {users.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#6c757d' }}>
          No staff users found. Create one to get started.
        </div>
      ) : (
        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Last Login</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.fullName}</td>
                  <td>{u.email}</td>
                  <td>{u.role.replace(/_/g, ' ')}</td>
                  <td>
                    {u.lastLoginAt
                      ? new Date(u.lastLoginAt).toLocaleDateString()
                      : 'Never'}
                  </td>
                  <td>
                    <span className={`status ${u.isActive ? 'active' : 'inactive'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <Button
                      size="small"
                      onClick={() => handleToggle(u.id)}
                      disabled={toggling === u.id}
                    >
                      {toggling === u.id
                        ? '…'
                        : u.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create Nurse Officer</h3>
              <button onClick={() => { setShowModal(false); setFormError(''); }}>×</button>
            </div>
            <form onSubmit={handleCreate}>
              {formError && (
                <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                  {formError}
                </div>
              )}
              <Input
                label="Full Name"
                value={newUser.fullName}
                onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                required
              />
              <Input
                label="Email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
              />
              <Input
                label="Password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required
              />
              <div className="form-group">
                <label>Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="form-input"
                  disabled
                >
                  <option value="NURSE_OFFICER">Nurse Officer</option>
                </select>
                <small style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
                  ℹ️ Center Managers can only create Nurse Officer accounts
                </small>
              </div>
              <div className="modal-actions">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Creating…' : 'Create Nurse Officer'}
                </Button>
                <Button type="button" onClick={() => { setShowModal(false); setFormError(''); }}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Audit Tab ────────────────────────────────────────────────────────────────
const AuditTab = ({ loading, logs }) => {
  if (loading) return <div className="mgr-loading"><div className="mgr-spinner" />Loading audit logs…</div>;

  const actionColor = (action) => {
    if (action.includes('FAIL') || action.includes('UNAUTHORIZED')) return '#dc3545';
    if (action.includes('LOGIN'))    return '#28a745';
    if (action.includes('REGISTER')) return '#007bff';
    return '#495057';
  };

  return (
    <div className="users-content">
      <div className="users-header">
        <h3>Audit Trail ({logs.length} recent entries)</h3>
      </div>

      {logs.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#6c757d' }}>
          No audit logs found.
        </div>
      ) : (
        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>User</th>
                <th>Action</th>
                <th>Resource</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td>{log.user?.fullName ?? '—'}</td>
                  <td>
                    <span style={{ color: actionColor(log.action), fontWeight: 600 }}>
                      {log.action}
                    </span>
                  </td>
                  <td>{log.resource ?? '—'}</td>
                  <td style={{ fontSize: '0.8rem' }}>{log.ipAddress ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ─── Settings Tab ─────────────────────────────────────────────────────────────
const SettingsTab = ({ systemSettings, setSystemSettings }) => {
  const [local, setLocal]   = useState(systemSettings);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]       = useState(null);

  const handleSave = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await analyticsService.updateSystemSettings(local);
      setSystemSettings(res.data);
      setMsg({ type: 'success', text: '✅ Settings saved successfully!' });
    } catch (err) {
      setMsg({ type: 'error', text: '❌ Failed to save settings. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-content">
      <h3>System Settings</h3>

      {msg && (
        <div
          className={`alert alert-${msg.type === 'success' ? 'success' : 'error'}`}
          style={{ marginBottom: '1rem' }}
        >
          {msg.text}
        </div>
      )}

      <div className="settings-form">
        <div className="form-group">
          <label>Daily Slot Limit</label>
          <Input
            type="number"
            value={local.dailySlotLimit}
            onChange={(e) => setLocal({ ...local, dailySlotLimit: parseInt(e.target.value) || 0 })}
          />
        </div>

        <div className="form-group">
          <label>Appointment Interval (minutes)</label>
          <select
            value={local.appointmentIntervalMinutes}
            onChange={(e) => setLocal({ ...local, appointmentIntervalMinutes: parseInt(e.target.value) })}
            style={{
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '1rem',
              width: '100%'
            }}
          >
            <option value={10}>10 minutes</option>
            <option value={15}>15 minutes (Recommended)</option>
            <option value={20}>20 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>60 minutes</option>
          </select>
          <small style={{ color: '#666', fontSize: '0.875rem' }}>
            Time between appointments (Current: {local.appointmentIntervalMinutes} minutes)<br />
            <strong>💡 Tip:</strong> 15 minutes is recommended for optimal patient flow and service quality
          </small>
        </div>

        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={local.walkInEnabled}
              onChange={(e) => setLocal({ ...local, walkInEnabled: e.target.checked })}
            />
            Enable Walk-in Registration
          </label>
        </div>

        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={local.autoConfirmBookings}
              onChange={(e) => setLocal({ ...local, autoConfirmBookings: e.target.checked })}
            />
            Auto-Confirm Online Bookings
          </label>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <Button 
            onClick={() => {
              setLocal({
                dailySlotLimit: 36,
                appointmentIntervalMinutes: 15,
                walkInEnabled: true,
                autoConfirmBookings: false,
              });
              setMsg({ type: 'info', text: '🔄 Settings reset to defaults (15-minute intervals)' });
            }}
            disabled={saving}
            style={{
              backgroundColor: '#6b7280',
              color: 'white',
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🔄 Reset to Defaults
          </Button>
          
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : '💾 Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;