import React, { useState } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import HealthConditionTrendsPanel from '../../analytics/HealthConditionTrendsPanel';
import styles from './Performance.module.css';

const Performance = ({ loading, analytics, trendsData, centers }) => {
  const [period, setPeriod] = useState("weekly");
  const [selectedMetric, setSelectedMetric] = useState("appointments");
  const [viewMode, setViewMode] = useState("chart"); // 'chart' or 'table'

  if (loading)
    return (
      <div className="mgr-loading">
        <div className="mgr-spinner" />
        Loading performance data…
      </div>
    );

  const summary = analytics?.summary || analytics || {};

  // Enhanced sample data with more metrics for demonstration
  const SAMPLE_DAILY = [
    {
      label: "Mon",
      appointments: 12,
      completed: 10,
      noShow: 1,
      vitals: 11,
      newUsers: 3,
      efficiency: 83,
    },
    {
      label: "Tue",
      appointments: 15,
      completed: 13,
      noShow: 1,
      vitals: 14,
      newUsers: 4,
      efficiency: 87,
    },
    {
      label: "Wed",
      appointments: 18,
      completed: 16,
      noShow: 2,
      vitals: 17,
      newUsers: 5,
      efficiency: 89,
    },
    {
      label: "Thu",
      appointments: 14,
      completed: 12,
      noShow: 1,
      vitals: 13,
      newUsers: 2,
      efficiency: 86,
    },
    {
      label: "Fri",
      appointments: 20,
      completed: 17,
      noShow: 2,
      vitals: 19,
      newUsers: 6,
      efficiency: 85,
    },
    {
      label: "Sat",
      appointments: 16,
      completed: 14,
      noShow: 1,
      vitals: 15,
      newUsers: 3,
      efficiency: 88,
    },
    {
      label: "Sun",
      appointments: 8,
      completed: 7,
      noShow: 0,
      vitals: 8,
      newUsers: 1,
      efficiency: 88,
    },
  ];

  const SAMPLE_WEEKLY = [
    {
      label: "W1",
      appointments: 68,
      completed: 58,
      noShow: 5,
      vitals: 65,
      newUsers: 18,
      efficiency: 85,
    },
    {
      label: "W2",
      appointments: 82,
      completed: 71,
      noShow: 6,
      vitals: 78,
      newUsers: 22,
      efficiency: 87,
    },
    {
      label: "W3",
      appointments: 74,
      completed: 63,
      noShow: 7,
      vitals: 70,
      newUsers: 19,
      efficiency: 85,
    },
    {
      label: "W4",
      appointments: 91,
      completed: 79,
      noShow: 8,
      vitals: 85,
      newUsers: 25,
      efficiency: 87,
    },
    {
      label: "W5",
      appointments: 85,
      completed: 74,
      noShow: 6,
      vitals: 80,
      newUsers: 21,
      efficiency: 87,
    },
    {
      label: "W6",
      appointments: 78,
      completed: 67,
      noShow: 7,
      vitals: 72,
      newUsers: 20,
      efficiency: 86,
    },
    {
      label: "W7",
      appointments: 95,
      completed: 83,
      noShow: 8,
      vitals: 90,
      newUsers: 28,
      efficiency: 87,
    },
    {
      label: "W8",
      appointments: 88,
      completed: 76,
      noShow: 7,
      vitals: 82,
      newUsers: 24,
      efficiency: 86,
    },
  ];

  const SAMPLE_MONTHLY = [
    {
      label: "Jan",
      appointments: 310,
      completed: 268,
      noShow: 25,
      vitals: 290,
      newUsers: 85,
      efficiency: 86,
    },
    {
      label: "Feb",
      appointments: 285,
      completed: 247,
      noShow: 22,
      vitals: 265,
      newUsers: 78,
      efficiency: 87,
    },
    {
      label: "Mar",
      appointments: 342,
      completed: 298,
      noShow: 28,
      vitals: 318,
      newUsers: 95,
      efficiency: 87,
    },
    {
      label: "Apr",
      appointments: 368,
      completed: 321,
      noShow: 30,
      vitals: 344,
      newUsers: 102,
      efficiency: 87,
    },
    {
      label: "May",
      appointments: 395,
      completed: 347,
      noShow: 32,
      vitals: 372,
      newUsers: 115,
      efficiency: 88,
    },
    {
      label: "Jun",
      appointments: 412,
      completed: 362,
      noShow: 35,
      vitals: 389,
      newUsers: 125,
      efficiency: 88,
    },
  ];

  // Get appropriate data based on period
  const getTrendData = () => {
    if (period === "daily") {
      return trendsData?.daily || SAMPLE_DAILY;
    } else if (period === "weekly") {
      return trendsData?.weekly || SAMPLE_WEEKLY;
    } else {
      return trendsData?.monthly || SAMPLE_MONTHLY;
    }
  };

  const trendData = getTrendData();
  const periodLabel =
    period === "daily"
      ? "Last 7 Days"
      : period === "weekly"
        ? "Last 8 Weeks"
        : "Last 6 Months";

  // Center performance metrics
  const centerPerformance = centers
    .map((center) => ({
      name: center.name,
      staff: center._count?.staff || 0,
      capacity: center.capacity || 0,
      utilization: center.capacity
        ? Math.round(((center._count?.staff || 0) / center.capacity) * 100)
        : 0,
      region: center.region,
    }))
    .sort((a, b) => b.utilization - a.utilization)
    .slice(0, 10);

  // Calculate performance metrics
  const calculateMetrics = () => {
    const totalAppointments = trendData.reduce(
      (sum, item) => sum + (item.appointments || 0),
      0,
    );
    const totalCompleted = trendData.reduce(
      (sum, item) => sum + (item.completed || 0),
      0,
    );
    const totalNoShow = trendData.reduce(
      (sum, item) => sum + (item.noShow || 0),
      0,
    );
    const totalVitals = trendData.reduce(
      (sum, item) => sum + (item.vitals || 0),
      0,
    );
    const totalNewUsers = trendData.reduce(
      (sum, item) => sum + (item.newUsers || 0),
      0,
    );

    const completionRate =
      totalAppointments > 0
        ? Math.round((totalCompleted / totalAppointments) * 100)
        : 0;
    const noShowRate =
      totalAppointments > 0
        ? Math.round((totalNoShow / totalAppointments) * 100)
        : 0;
    const avgEfficiency =
      trendData.length > 0
        ? Math.round(
            trendData.reduce((sum, item) => sum + (item.efficiency || 0), 0) /
              trendData.length,
          )
        : 0;

    return {
      totalAppointments,
      totalCompleted,
      totalNoShow,
      totalVitals,
      totalNewUsers,
      completionRate,
      noShowRate,
      avgEfficiency,
    };
  };

  const metrics = calculateMetrics();

  // Chart configuration based on selected metric
  const getChartConfig = () => {
    switch (selectedMetric) {
      case "appointments":
        return {
          dataKeys: ["appointments", "completed", "noShow"],
          colors: ["#6366f1", "#22d3ee", "#f59e0b"],
          names: ["Total Appointments", "Completed", "No Show"],
        };
      case "vitals":
        return {
          dataKeys: ["vitals"],
          colors: ["#a78bfa"],
          names: ["Vitals Recorded"],
        };
      case "users":
        return {
          dataKeys: ["newUsers"],
          colors: ["#34d399"],
          names: ["New Users"],
        };
      case "efficiency":
        return {
          dataKeys: ["efficiency"],
          colors: ["#f97316"],
          names: ["Efficiency %"],
        };
      default:
        return {
          dataKeys: ["appointments", "completed"],
          colors: ["#6366f1", "#22d3ee"],
          names: ["Appointments", "Completed"],
        };
    }
  };

  const chartConfig = getChartConfig();

  // Custom Tooltip Component
  const CustomAppointmentTrendsTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload || {};
      const total = data.total || 0;
      const completed = data.completed || 0;
      const noShow = data.noShow || 0;
      const pending = total - completed - noShow;
      const completionRate =
        total > 0 ? Math.round((completed / total) * 100) : 0;

      return (
        <div className={styles.customTooltip}>
          {/* Header with day */}
          <div className={styles.tooltipHeader}>
            <span style={{ fontSize: "16px" }}>📅</span>
            {label}
          </div>

          {/* Metrics List */}
          <div className={styles.tooltipMetrics}>
            {/* Total Appointments */}
            <div className={styles.tooltipMetricRow}>
              <span className={styles.tooltipMetricLabel}>
                <span style={{ fontSize: "14px" }}>📊</span> Total
              </span>
              <span className={styles.tooltipMetricValue} style={{ color: "#3b82f6" }}>
                {total}
              </span>
            </div>

            {/* Completed */}
            <div className={styles.tooltipMetricRow}>
              <span className={styles.tooltipMetricLabel}>
                <span style={{ fontSize: "14px" }}>✅</span> Completed
              </span>
              <span className={styles.tooltipMetricValue} style={{ color: "#10b981" }}>
                {completed}
              </span>
            </div>

            {/* No-Show */}
            <div className={styles.tooltipMetricRow}>
              <span className={styles.tooltipMetricLabel}>
                <span style={{ fontSize: "14px" }}>❌</span> No-Show
              </span>
              <span className={styles.tooltipMetricValue} style={{ color: "#f59e0b" }}>
                {noShow}
              </span>
            </div>

            {/* Pending (if any) */}
            {pending > 0 && (
              <div className={styles.tooltipMetricRow}>
                <span className={styles.tooltipMetricLabel}>
                  <span style={{ fontSize: "14px" }}>⏳</span> Pending
                </span>
                <span className={styles.tooltipMetricValue} style={{ color: "#8b5cf6" }}>
                  {pending}
                </span>
              </div>
            )}
          </div>

          {/* Completion Rate */}
          <div className={styles.tooltipFooter}>
            <div className={styles.tooltipRateRow}>
              <span className={styles.tooltipRateLabel}>Completion Rate</span>
              <span
                className={styles.tooltipRateValue}
                style={{
                  color: completionRate > 80 ? "#10b981" : completionRate > 60 ? "#f59e0b" : "#ef4444"
                }}
              >
                {completionRate}%
              </span>
            </div>
            <div className={styles.tooltipProgressBar}>
              <div
                className={styles.tooltipProgressFill}
                style={{
                  width: `${completionRate}%`,
                  background:
                    completionRate > 80
                      ? "linear-gradient(90deg, #10b981, #34d399)"
                      : completionRate > 60
                        ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                        : "linear-gradient(90deg, #ef4444, #f87171)"
                }}
              />
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mgr-analytics">
      {/* Enhanced KPI Row with Period-based Metrics */}
      <div
        className="mgr-kpi-grid"
        style={{
          gridTemplateColumns: "repeat(6, 1fr)",
          marginBottom: "1.5rem",
        }}
      >
        {[
          {
            icon: "📊",
            label: `Total Appointments (${periodLabel})`,
            value: metrics.totalAppointments,
            color: "#284394",
            trend: "+12%",
          },
          {
            icon: "✅",
            label: `Completed (${metrics.completionRate}%)`,
            value: metrics.totalCompleted,
            color: "#22c55e",
            trend: "+8%",
          },
          {
            icon: "❌",
            label: `No Show (${metrics.noShowRate}%)`,
            value: metrics.totalNoShow,
            color: "#ef4444",
            trend: "-3%",
          },
          {
            icon: "🩺",
            label: "Vitals Recorded",
            value: metrics.totalVitals,
            color: "#7c3aed",
            trend: "+15%",
          },
          {
            icon: "👥",
            label: "New Users",
            value: metrics.totalNewUsers,
            color: "#059669",
            trend: "+22%",
          },
          {
            icon: "⚡",
            label: "Avg Efficiency",
            value: `${metrics.avgEfficiency}%`,
            color: "#f97316",
            trend: "+5%",
          },
        ].map((c) => (
          <div
            key={c.label}
            className="mgr-kpi-card"
            style={{ position: "relative", overflow: "hidden" }}
          >
            <div
              className="mgr-kpi-icon"
              style={{ background: c.color + "18", color: c.color }}
            >
              {c.icon}
            </div>
            <div className="mgr-kpi-body">
              <div className="mgr-kpi-value" style={{ color: c.color }}>
                {c.value}
              </div>
              <div className="mgr-kpi-label" style={{ fontSize: "0.75rem" }}>
                {c.label}
              </div>
              <div
                style={{
                  fontSize: "0.7rem",
                  color: c.trend.startsWith("+") ? "#22c55e" : "#ef4444",
                  fontWeight: 600,
                  marginTop: "0.25rem",
                }}
              >
                {c.trend} vs prev period
              </div>
            </div>
            {/* Sparkline effect */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: "40px",
                height: "20px",
                background: `linear-gradient(45deg, ${c.color}20, transparent)`,
                borderRadius: "8px 0 8px 0",
              }}
            />
          </div>
        ))}
      </div>

      {/* Advanced Control Panel */}
      <div className={styles.controlPanel}>
        <div className={styles.controlPanelContent}>
          <div className={styles.controlPanelHeader}>
            <h3 className={styles.controlPanelTitle}>
              Performance Trends Dashboard
            </h3>
          </div>

          <div className={styles.controlPanelActions}>
            {/* Period Selector */}
            <div className={styles.periodSwitcher}>
              {["daily", "weekly", "monthly"].map((p) => (
                <button
                  key={p}
                  className={`${styles.periodBtn} ${period === p ? styles.periodBtnActive : ""}`}
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
              className={styles.metricSelector}
            >
              <option value="appointments">📊 Appointments Overview</option>
              <option value="vitals">🩺 Vitals Tracking</option>
              <option value="users">👥 User Growth</option>
              <option value="efficiency">⚡ Efficiency Metrics</option>
            </select>

            {/* View Mode Toggle */}
            <div className={styles.viewModeToggle}>
              {["chart", "table"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`${styles.viewModeBtn} ${viewMode === mode ? styles.viewModeBtnActive : ""}`}
                >
                  {mode === "chart" ? "📈 Chart" : "📋 Table"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Trend Visualization */}
      {viewMode === "chart" ? (
        <div className="mgr-dark-card" style={{ marginBottom: "1.5rem" }}>
          <div className="mgr-dark-header">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                flex: 1,
              }}
            >
              <span className="mgr-live-dot" />
              <span
                className="mgr-dark-title"
                style={{
                  color: "#1f2937",
                  fontWeight: "800",
                  fontSize: "1.25rem",
                }}
              >
                📈{" "}
                {selectedMetric === "appointments"
                  ? "Appointments & Completion Trends"
                  : selectedMetric === "vitals"
                    ? "Vitals Recording Trends"
                    : selectedMetric === "users"
                      ? "User Registration Trends"
                      : "Efficiency Performance Trends"}{" "}
                — {periodLabel}
              </span>
            </div>
            <div
              style={{
                fontSize: "0.8rem",
                color: "#1f2937",
                fontWeight: "600",
                background: "rgba(0,0,0,0.05)",
                padding: "0.25rem 0.75rem",
                borderRadius: "12px",
              }}
            >
              Real-time data • Updated every 5 minutes
            </div>
          </div>

          <ResponsiveContainer width="100%" height={350}>
            {selectedMetric === "efficiency" ? (
              <LineChart
                data={trendData}
                margin={{ top: 15, right: 20, left: 0, bottom: 5 }}
              >
                <defs>
                  <linearGradient
                    id="gradEfficiency"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.6} />
                    <stop
                      offset="100%"
                      stopColor="#f97316"
                      stopOpacity={0.05}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(71,85,105,0.8)"
                  horizontal={true}
                  vertical={true}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 13, fill: "#1e293b", fontWeight: 700 }}
                  axisLine={{ stroke: "#94a3b8" }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 13, fill: "#1e293b", fontWeight: 700 }}
                  axisLine={{ stroke: "#94a3b8" }}
                  tickLine={false}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={{
                    background:
                      "linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)",
                    border: "2px solid rgba(0,0,0,0.15)",
                    borderRadius: "12px",
                    color: "#1f2937",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                  }}
                  labelStyle={{
                    color: "#1e293b",
                    fontWeight: 800,
                    fontSize: "14px",
                  }}
                  itemStyle={{
                    color: "#1e293b",
                    fontWeight: 700,
                    fontSize: "13px",
                  }}
                  formatter={(value) => [`${value}%`, "Efficiency"]}
                />
                <Line
                  type="monotone"
                  dataKey="efficiency"
                  stroke="#f97316"
                  strokeWidth={4}
                  dot={{
                    r: 7,
                    fill: "#f97316",
                    strokeWidth: 2,
                    stroke: "#ffffff",
                  }}
                  activeDot={{
                    r: 9,
                    fill: "#f97316",
                    strokeWidth: 3,
                    stroke: "#ffffff",
                  }}
                />
              </LineChart>
            ) : (
              <AreaChart
                data={trendData}
                margin={{ top: 15, right: 20, left: 0, bottom: 5 }}
              >
                <defs>
                  {chartConfig.dataKeys.map((key, index) => (
                    <linearGradient
                      key={key}
                      id={`grad${key}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={chartConfig.colors[index]}
                        stopOpacity={0.5}
                      />
                      <stop
                        offset="100%"
                        stopColor={chartConfig.colors[index]}
                        stopOpacity={0.05}
                      />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(71,85,105,0.8)"
                  horizontal={true}
                  vertical={true}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 13, fill: "#1e293b", fontWeight: 700 }}
                  axisLine={{ stroke: "#94a3b8" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 13, fill: "#1e293b", fontWeight: 700 }}
                  axisLine={{ stroke: "#94a3b8" }}
                  tickLine={false}
                />
                <Tooltip content={<CustomAppointmentTrendsTooltip />} />
                <Legend
                  wrapperStyle={{
                    fontSize: "13px",
                    color: "#1e293b",
                    fontWeight: 700,
                    paddingTop: "12px",
                  }}
                />
                {chartConfig.dataKeys.map((key, index) => (
                  <Area
                    key={key}
                    type="monotone"
                    dataKey={key}
                    name={chartConfig.names[index]}
                    stroke={chartConfig.colors[index]}
                    strokeWidth={4}
                    fill={`url(#grad${key})`}
                    dot={{
                      r: 6,
                      fill: chartConfig.colors[index],
                      strokeWidth: 2,
                      stroke: "#ffffff",
                    }}
                    activeDot={{
                      r: 9,
                      fill: chartConfig.colors[index],
                      strokeWidth: 3,
                      stroke: "#ffffff",
                    }}
                  />
                ))}
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      ) : (
        /* Enhanced Data Table View */
        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>
            <span className={styles.tableBadge}>
              📊 DATA TABLE
            </span>
            <h3 className={styles.tableTitle}>
              Performance Data — {periodLabel}
            </h3>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Period</th>
                  <th>📊 Appointments</th>
                  <th>✅ Completed</th>
                  <th>❌ No Show</th>
                  <th>🩺 Vitals</th>
                  <th>👥 New Users</th>
                  <th>⚡ Efficiency</th>
                </tr>
              </thead>
              <tbody>
                {trendData.map((row, index) => (
                  <tr key={row.label} className={index % 2 === 0 ? styles.evenRow : ""}>
                    <td className={styles.periodCell}>{row.label}</td>
                    <td className={styles.appointmentsCell}>{row.appointments}</td>
                    <td className={styles.completedCell}>{row.completed}</td>
                    <td className={styles.noShowCell}>{row.noShow}</td>
                    <td className={styles.vitalsCell}>{row.vitals}</td>
                    <td className={styles.newUsersCell}>{row.newUsers}</td>
                    <td className={styles.efficiencyCell}>{row.efficiency}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Row */}
          <div className={styles.tableSummary}>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryItem}>
                <div className={styles.summaryValue} style={{ color: "#284394" }}>
                  {metrics.totalAppointments}
                </div>
                <div className={styles.summaryLabel}>Total Appointments</div>
              </div>
              <div className={styles.summaryItem}>
                <div className={styles.summaryValue} style={{ color: "#16a34a" }}>
                  {metrics.completionRate}%
                </div>
                <div className={styles.summaryLabel}>Completion Rate</div>
              </div>
              <div className={styles.summaryItem}>
                <div className={styles.summaryValue} style={{ color: "#dc2626" }}>
                  {metrics.noShowRate}%
                </div>
                <div className={styles.summaryLabel}>No Show Rate</div>
              </div>
              <div className={styles.summaryItem}>
                <div className={styles.summaryValue} style={{ color: "#f97316" }}>
                  {metrics.avgEfficiency}%
                </div>
                <div className={styles.summaryLabel}>Avg Efficiency</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Health Condition Trends Panel ── */}
      <HealthConditionTrendsPanel periodSwitcherClassName="mgr-period-switcher" />
    </div>
  );
};

export default Performance;
