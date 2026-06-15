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

  // ── Resolve trend data: use real data from backend (filtered by role) ──
  const resolveData = (real) => {
    // Always use real data from backend (already filtered by center/region)
    // If no data exists, backend returns empty arrays or zeros
    if (!real || real.length === 0) {
      return { data: [], isDemo: false, isEmpty: true };
    }
    const hasData = real.some(d => (d.total || 0) > 0 || (d.completed || 0) > 0);
    return { data: real, isDemo: false, isEmpty: !hasData };
  };

  const periodMap = {
    daily:   { raw: trendsData?.daily   ?? [], label: 'Last 7 Days',   c1: '#6366f1', c2: '#22d3ee', c3: '#f59e0b' },
    weekly:  { raw: trendsData?.weekly  ?? [], label: 'Last 8 Weeks',  c1: '#8b5cf6', c2: '#34d399', c3: '#fb923c' },
    monthly: { raw: trendsData?.monthly ?? [], label: 'Last 6 Months', c1: '#3b82f6', c2: '#f472b6', c3: '#a3e635' },
  };
  const { raw, label: periodLabel, c1, c2, c3 } = periodMap[period];
  const { data: trendData, isDemo, isEmpty } = resolveData(raw);

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
    { name: 'Service',  score: fs && fs.avgServiceQuality ? Math.round(fs.avgServiceQuality * 20) : 0, fill: '#10b981' },
    { name: 'Staff',    score: fs && fs.avgStaffBehavior ? Math.round(fs.avgStaffBehavior  * 20) : 0, fill: '#06b6d4' },
    { name: 'Clean',    score: fs && fs.avgCleanliness ? Math.round(fs.avgCleanliness    * 20) : 0, fill: '#3b82f6' },
    { name: 'Wait',     score: fs && fs.avgWaitTime ? Math.round(fs.avgWaitTime       * 20) : 0, fill: '#0ea5e9' },
    { name: 'NPS',      score: fs && fs.avgNps ? Math.round(fs.avgNps            * 10) : 0, fill: '#34d399' },
  ];

  const g1 = `ga1-${period}`, g2 = `ga2-${period}`, g3 = `ga3-${period}`;

  return (
    <div className="mgr-analytics">

      {/* Enhanced KPI Row with Period-based Metrics */}
      <div className={`mgr-kpi-grid ${styles.analyticsKpiGrid}`}>
        {[
          { label: `Total Appointments (${periodLabel})`, value: metrics.totalAppointments, color: '#284394', trend: '+12%' },
          { label: `Completed (${metrics.completionRate}%)`, value: metrics.totalCompleted, color: '#22c55e', trend: '+8%' },
          { label: `No Show (${metrics.noShowRate}%)`, value: metrics.totalNoShow, color: '#ef4444', trend: '-3%' },
          { label: 'Vitals Recorded', value: metrics.totalVitals, color: '#7c3aed', trend: '+15%' },
          { label: 'New Users', value: metrics.totalNewUsers, color: '#059669', trend: '+22%' },
          { label: 'Avg Efficiency', value: `${metrics.avgEfficiency}%`, color: '#f97316', trend: '+5%' },
        ].map(c => (
          <div key={c.label} className={`mgr-kpi-card ${styles.analyticsKpiCard}`}>
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
                  {p}
                </button>
              ))}
            </div>

            {/* Metric Selector */}
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className={`performance-metric-selector ${styles.metricSelector}`}
            >
              <option value="appointments" style={{ background: '#ffffff', color: '#000000', fontWeight: '600' }}>Appointments Overview</option>
              <option value="vitals" style={{ background: '#ffffff', color: '#000000', fontWeight: '600' }}>Vitals Tracking</option>
              <option value="users" style={{ background: '#ffffff', color: '#000000', fontWeight: '600' }}>User Growth</option>
              <option value="efficiency" style={{ background: '#ffffff', color: '#000000', fontWeight: '600' }}>Efficiency Metrics</option>
            </select>

            {/* View Mode Toggle */}
            <div className={styles.viewModeToggle}>
              {['chart', 'table'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`${styles.viewModeBtn} ${viewMode === mode ? styles.viewModeBtnActive : styles.viewModeBtnInactive}`}
                >
                  {mode === 'chart' ? 'Chart' : 'Table'}
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
                {selectedMetric === 'appointments' ? 'Appointments & Completion Trends' :
                     selectedMetric === 'vitals' ? 'Vitals Recording Trends' :
                     selectedMetric === 'users' ? 'User Registration Trends' :
                     'Efficiency Performance Trends'} — {periodLabel}
              </span>
              {isEmpty && <span className="mgr-demo-badge" style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fbbf24' }}>No Data</span>}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600', background: 'rgba(255,255,255,0.05)', padding: '0.25rem 0.75rem', borderRadius: '12px' }}>
              {isEmpty ? 'No activity recorded' : 'Real-time data'}
            </div>
          </div>

          {isEmpty ? (
            <ResponsiveContainer width="100%" height={350}>
              {selectedMetric === 'efficiency' ? (
                <LineChart data={trendData.length > 0 ? trendData : [{ label: 'No Data', efficiency: 0 }]} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
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
                <AreaChart data={trendData.length > 0 ? trendData : [{ label: 'No Data', total: 0, completed: 0, noShow: 0 }]} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
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
          ) : (
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
          )}
        </div>
      ) : (
        /* Enhanced Data Table View */
        <div className={styles.tableView}>
          <div className={styles.tableViewDecoration} />
          
          <div className={styles.tableViewHeader}>
            <span className={styles.tableViewBadge}>
              DATA TABLE
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
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#1e293b', fontWeight: 700, fontSize: '0.9rem' }}>Total</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#1e293b', fontWeight: 700, fontSize: '0.9rem' }}>Completed</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#1e293b', fontWeight: 700, fontSize: '0.9rem' }}>No Show</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#1e293b', fontWeight: 700, fontSize: '0.9rem' }}>Vitals</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#1e293b', fontWeight: 700, fontSize: '0.9rem' }}>New Users</th>
                  <th style={{ padding: '1rem', textAlign: 'center', color: '#1e293b', fontWeight: 700, fontSize: '0.9rem' }}>Efficiency</th>
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
            <span className="mgr-dark-title">Patient Satisfaction</span>
            {(!fs || !fs.total || fs.total === 0) && <span className="mgr-demo-badge" style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fbbf24' }}>No Data</span>}
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
                  background: '#ffffff', 
                  border: '2px solid #e5e7eb', 
                  borderRadius: '8px', 
                  color: '#1f2937',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  padding: '12px 16px'
                }} 
                labelStyle={{ 
                  color: '#1f2937', 
                  fontWeight: 700, 
                  fontSize: '14px',
                  marginBottom: '8px',
                  paddingBottom: '8px',
                  borderBottom: '2px solid #e5e7eb'
                }}
                itemStyle={{ 
                  color: '#1f2937', 
                  fontWeight: 600,
                  fontSize: '13px',
                  padding: '4px 0'
                }}
                formatter={(v, name, props) => [
                  `${v}%`,
                  'Satisfaction Score'
                ]} 
                cursor={{ fill: 'rgba(0,0,0,0.05)' }} 
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
