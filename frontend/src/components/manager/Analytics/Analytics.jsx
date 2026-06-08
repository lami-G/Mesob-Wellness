import React, { useState } from 'react';
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import HealthConditionTrendsPanel from '../../analytics/HealthConditionTrendsPanel';
import { CustomAppointmentTrendsTooltip } from '../shared/CustomTooltips';
import styles from './Analytics.module.css';

const Analytics = ({ loading, queueData, healthData, trendsData }) => {
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
        <div className={styles.tableView}>
          <div className={styles.tableViewDecoration} />
          
          <div className={styles.tableViewHeader}>
            <span className={styles.tableViewBadge}>
              📊 DATA TABLE
            </span>
            <h3 className={styles.tableViewTitle}>
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
          <div className={styles.tableSummary}>
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

export default Analytics;
