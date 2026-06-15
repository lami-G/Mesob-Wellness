import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import styles from './Overview.module.css';

const Overview = ({
  loading,
  analytics,
  centers,
  selectedCenter,
  centerStats,
}) => {
  if (loading)
    return (
      <div className="mgr-loading">
        <div className="mgr-spinner" />
        Loading center data…
      </div>
    );

  const summary = analytics?.summary || analytics || {};
  const isAllCenters = selectedCenter === "all";

  // Calculate center-specific metrics
  const centerMetrics = centers.reduce(
    (acc, center) => {
      acc.totalStaff += center._count?.staff || 0;
      acc.totalCapacity += center.capacity || 0;
      return acc;
    },
    { totalStaff: 0, totalCapacity: 0 },
  );

  const statCards = [
    {
      icon: "🏥",
      label: "Centers",
      value: centers.length,
      sub: `${centerStats.active} active`,
      color: "#284394",
    },
    {
      icon: "📅",
      label: "Daily Capacity",
      value: "36 slots",
      sub: "appointment slots/day",
      color: "#284394",
    },
    {
      icon: "👥",
      label: "Total Staff",
      value: centerMetrics.totalStaff,
      sub: "across all centers",
      color: "#2563eb",
    },
    {
      icon: "📋",
      label: "Appointments",
      value: summary?.totalAppointments || 0,
      sub: "total bookings",
      color: "#16a34a",
    },
    {
      icon: "✅",
      label: "Completed",
      value: summary?.completedAppointments || 0,
      sub: "appointments",
      color: "#22c55e",
    },
    {
      icon: "⏳",
      label: "Pending",
      value: summary?.pendingAppointments || 0,
      sub: "appointments",
      color: "#f59e0b",
    },
    {
      icon: "🩺",
      label: "Vitals Recorded",
      value: summary?.totalVitals || 0,
      sub: "health records",
      color: "#7c3aed",
    },
  ];

  // Center breakdown data
  const centerBreakdownData = centers
    .map((center) => ({
      name: center.name,
      staff: center._count?.staff || 0,
      capacity: center.capacity || 0,
      region: center.region,
      city: center.city,
      status: center.status,
    }))
    .slice(0, 10); // Top 10 centers

  return (
    <div className="mgr-overview">
      {/* Selection Info Banner */}
      {!isAllCenters && (
        <div
          style={{
            background: "linear-gradient(135deg, #4c6fbe 0%, #5b7fd6 100%)",
            padding: "1rem 1.5rem",
            borderRadius: "12px",
            marginBottom: "1.5rem",
            color: "white",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            boxShadow: "0 4px 12px rgba(76, 111, 190, 0.3)",
          }}
        >
          <span style={{ fontSize: "2rem" }}>🏥</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>
              {centers[0]?.name}
            </div>
            <div style={{ fontSize: "0.9rem", opacity: 0.9 }}>
              📍 {centers[0]?.city}, {centers[0]?.region} • 👥{" "}
              {centers[0]?._count?.staff || 0} Staff • 📊{" "}
              {centers[0]?.capacity || 0} Capacity
            </div>
          </div>
          <span
            className={`status ${centers[0]?.status === "ACTIVE" ? "active" : "inactive"}`}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              fontWeight: 600,
              background:
                centers[0]?.status === "ACTIVE"
                  ? "rgba(34, 197, 94, 0.2)"
                  : "rgba(239, 68, 68, 0.2)",
              border:
                centers[0]?.status === "ACTIVE"
                  ? "2px solid #22c55e"
                  : "2px solid #ef4444",
              color: "white",
            }}
          >
            {centers[0]?.status}
          </span>
        </div>
      )}

      {/* KPI Cards */}
      <div className={styles.topKpiGrid}>
        {statCards.map((c) => (
          <div key={c.label} className={styles.topKpiCard}>
            <div
              className={`${styles.topKpiIcon} ${styles.kpiIconWithColor}`}
              style={{ 
                '--kpi-bg': `${c.color}18`,
                '--kpi-color': c.color 
              }}
            >
              {c.icon}
            </div>
            <div className="dash-kpi-body">
              <div 
                className={`${styles.topKpiValue} ${styles.kpiValueWithColor}`}
                style={{ '--kpi-color': c.color }}
              >
                {c.value}
              </div>
              <div className={styles.topKpiLabel}>{c.label}</div>
              <div className={styles.topKpiSub}>{c.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Outstanding Health Analytics Card Section */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)",
          borderRadius: "16px",
          padding: "1.75rem 2rem",
          marginTop: "1.5rem",
          marginBottom: "1.5rem",
          border: "2px solid rgba(40, 67, 148, 0.1)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative gradient overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background:
              "linear-gradient(90deg, #284394 0%, #22c55e 50%, #f59e0b 100%)",
          }}
        />

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.5rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                boxShadow: "0 4px 16px rgba(34, 197, 94, 0.3)",
              }}
            >
              🏥
            </div>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: "1.35rem",
                  fontWeight: 900,
                  color: "#1f2937",
                  letterSpacing: "-0.02em",
                }}
              >
                Health Analytics Overview
              </h3>
              <p
                style={{
                  margin: "0.25rem 0 0 0",
                  fontSize: "0.85rem",
                  color: "#64748b",
                  fontWeight: 500,
                }}
              >
                Real-time employee health metrics and condition tracking
              </p>
            </div>
          </div>

          {/* Live Indicator */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "rgba(34, 197, 94, 0.1)",
              padding: "0.5rem 1rem",
              borderRadius: "20px",
              border: "1px solid rgba(34, 197, 94, 0.2)",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#22c55e",
                boxShadow: "0 0 8px rgba(34, 197, 94, 0.6)",
                animation: "mgrPulse 2s ease-in-out infinite",
              }}
            />
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 800,
                color: "#16a34a",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              LIVE DATA
            </span>
          </div>
        </div>

        {/* Health KPI Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          {[
            {
              icon: "👥",
              label: "Total Employees",
              value: summary.totalEmployees || 0,
              color: "#284394",
              bgGradient: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
              trend: null,
            },
            {
              icon: "💚",
              label: "Healthy",
              value: summary.healthyCount || 0,
              percentage: summary.healthyPercentage || 0,
              color: "#22c55e",
              bgGradient: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)",
              trend: "+5%",
            },
            {
              icon: "⚠️",
              label: "At Risk",
              value: summary.atRiskCount || 0,
              percentage: summary.atRiskPercentage || 0,
              color: "#f59e0b",
              bgGradient: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
              trend: "-2%",
            },
            {
              icon: "🚨",
              label: "Critical",
              value: summary.criticalCount || 0,
              percentage: summary.criticalPercentage || 0,
              color: "#ef4444",
              bgGradient: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
              trend: "-3%",
            },
          ].map((metric, idx) => (
            <div
              key={idx}
              style={{
                background: metric.bgGradient,
                borderRadius: "14px",
                padding: "1.25rem 1.5rem",
                border: `2px solid ${metric.color}30`,
                boxShadow: `0 4px 16px ${metric.color}20`,
                transition: "all 0.3s ease",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = `0 12px 32px ${metric.color}30`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = `0 4px 16px ${metric.color}20`;
              }}
            >
              {/* Icon */}
              <div
                style={{
                  fontSize: "2rem",
                  marginBottom: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>{metric.icon}</span>
                {metric.trend && (
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      color: metric.trend.startsWith("+")
                        ? "#22c55e"
                        : "#ef4444",
                      background: metric.trend.startsWith("+")
                        ? "#dcfce7"
                        : "#fee2e2",
                      padding: "0.2rem 0.5rem",
                      borderRadius: "12px",
                      border: `1px solid ${metric.trend.startsWith("+") ? "#22c55e" : "#ef4444"}40`,
                    }}
                  >
                    {metric.trend}
                  </span>
                )}
              </div>

              {/* Value */}
              <div
                style={{
                  fontSize: "2.25rem",
                  fontWeight: 900,
                  color: metric.color,
                  lineHeight: 1,
                  marginBottom: "0.5rem",
                  display: "flex",
                  alignItems: "baseline",
                  gap: "0.5rem",
                }}
              >
                {metric.value}
                {metric.percentage !== undefined && (
                  <span
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      color: "#64748b",
                    }}
                  >
                    ({metric.percentage}%)
                  </span>
                )}
              </div>

              {/* Label */}
              <div
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "#475569",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {metric.label}
              </div>

              {/* Decorative element */}
              <div
                style={{
                  position: "absolute",
                  bottom: "-10px",
                  right: "-10px",
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  background: `${metric.color}15`,
                  filter: "blur(20px)",
                }}
              />
            </div>
          ))}
        </div>

        {/* Quick Stats Footer */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            padding: "1rem 1.5rem",
            background: "rgba(248, 250, 252, 0.8)",
            borderRadius: "12px",
            border: "1px solid rgba(0,0,0,0.05)",
            flexWrap: "wrap",
            justifyContent: "space-around",
          }}
        >
          {[
            {
              icon: "📊",
              label: "Conditions Tracked",
              value: summary.totalConditions || 0,
              color: "#6366f1",
            },
            {
              icon: "🩺",
              label: "Recent Vitals",
              value: summary.recentVitals || 0,
              color: "#8b5cf6",
            },
            {
              icon: "📈",
              label: "Health Trend",
              value: "Improving",
              color: "#22c55e",
            },
            {
              icon: "⏱️",
              label: "Last Updated",
              value: "Just now",
              color: "#64748b",
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <span style={{ fontSize: "1.25rem" }}>{stat.icon}</span>
              <div>
                <div
                  style={{
                    fontSize: "1rem",
                    fontWeight: 800,
                    color: stat.color,
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "#64748b",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.03em",
                  }}
                >
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Center Performance Breakdown (Multi-center view only) */}
      {isAllCenters && centerBreakdownData.length > 0 && (
        <div
          style={{
            marginTop: "1.25rem",
            background:
              "linear-gradient(135deg, #ffffff 0%, #f8fafc 40%, #f1f5f9 70%, #e2e8f0 100%)",
            borderRadius: "16px",
            padding: "1.5rem",
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            border: "1px solid rgba(0,0,0,0.12)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative glow orbs */}
          <div
            style={{
              position: "absolute",
              top: "-60px",
              right: "-60px",
              width: "200px",
              height: "200px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-40px",
              left: "-40px",
              width: "160px",
              height: "160px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              marginBottom: "0.5rem",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                background: "rgba(34,197,94,0.15)",
                border: "1px solid rgba(34,197,94,0.3)",
                borderRadius: "20px",
                padding: "0.25rem 0.75rem",
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#16a34a",
                letterSpacing: "0.05em",
              }}
            >
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "#22c55e",
                  boxShadow: "0 0 6px #22c55e",
                  display: "inline-block",
                }}
              />
              LIVE
            </span>
            <h3
              style={{
                margin: 0,
                fontSize: "1.25rem",
                fontWeight: 800,
                color: "#1f2937",
                letterSpacing: "-0.01em",
              }}
            >
              Center Performance Overview
            </h3>
          </div>
          <p
            style={{
              margin: "0 0 1.5rem 0",
              fontSize: "0.875rem",
              color: "#6b7280",
              fontWeight: 400,
            }}
          >
            Staff and capacity distribution across all{" "}
            {centerBreakdownData.length} centers
          </p>

          {/* Summary pills */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              marginBottom: "1.5rem",
              flexWrap: "wrap",
            }}
          >
            {[
              {
                label: "Total Centers",
                value: centerBreakdownData.length,
                color: "#3b82f6",
                bg: "rgba(59,130,246,0.1)",
              },
              {
                label: "Total Staff",
                value: centerBreakdownData.reduce((s, c) => s + c.staff, 0),
                color: "#8b5cf6",
                bg: "rgba(139,92,246,0.1)",
              },
              {
                label: "Total Capacity",
                value: centerBreakdownData.reduce((s, c) => s + c.capacity, 0),
                color: "#22c55e",
                bg: "rgba(34,197,94,0.1)",
              },
            ].map((p) => (
              <div
                key={p.label}
                style={{
                  background: p.bg,
                  border: `1px solid ${p.color}40`,
                  borderRadius: "10px",
                  padding: "0.5rem 1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 800,
                    color: p.color,
                  }}
                >
                  {p.value}
                </span>
                <span
                  style={{
                    fontSize: "0.78rem",
                    color: "#4b5563",
                    fontWeight: 500,
                  }}
                >
                  {p.label}
                </span>
              </div>
            ))}
          </div>

          {/* Chart */}
          <ResponsiveContainer
            width="100%"
            height={Math.max(280, centerBreakdownData.length * 42)}
          >
            <BarChart
              data={centerBreakdownData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
              barCategoryGap="20%"
            >
              <defs>
                <linearGradient id="gradStaffBlue" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#60a5fa" stopOpacity={1} />
                  <stop offset="100%" stopColor="#a78bfa" stopOpacity={1} />
                </linearGradient>
                <linearGradient
                  id="gradCapacityGreen"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  <stop offset="0%" stopColor="#34d399" stopOpacity={1} />
                  <stop offset="100%" stopColor="#4ade80" stopOpacity={1} />
                </linearGradient>
                <filter id="barGlow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(0,0,0,0.1)"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "#374151", fontWeight: 500 }}
                axisLine={{ stroke: "rgba(0,0,0,0.2)" }}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={160}
                tick={{ fontSize: 12, fill: "#1f2937", fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(name) =>
                  name.length > 20 ? name.slice(0, 18) + "…" : name
                }
              />
              <Tooltip
                cursor={{ fill: "rgba(0,0,0,0.03)" }}
                contentStyle={{
                  background:
                    "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                  border: "1px solid rgba(0,0,0,0.15)",
                  borderRadius: "12px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                  color: "#1f2937",
                  padding: "0.75rem 1rem",
                }}
                labelStyle={{
                  color: "#1f2937",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  marginBottom: "0.25rem",
                }}
                itemStyle={{ color: "#374151", fontSize: "0.85rem" }}
                formatter={(value, name) => {
                  if (name === "👥 Staff") return [`${value} members`, name];
                  if (name === "📊 Capacity")
                    return [`${value} slots/day`, name];
                  return [value, name];
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: "1rem" }}
                formatter={(value) => (
                  <span
                    style={{
                      color: "#374151",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                    }}
                  >
                    {value}
                  </span>
                )}
              />
              <Bar
                dataKey="staff"
                name="👥 Staff"
                fill="url(#gradStaffBlue)"
                radius={[0, 8, 8, 0]}
                maxBarSize={18}
                filter="url(#barGlow)"
              />
              <Bar
                dataKey="capacity"
                name="📊 Capacity"
                fill="url(#gradCapacityGreen)"
                radius={[0, 8, 8, 0]}
                maxBarSize={18}
                filter="url(#barGlow)"
              />
            </BarChart>
          </ResponsiveContainer>

          {/* Center name list below chart — ensures all are visible */}
          <div
            style={{
              marginTop: "1.25rem",
              paddingTop: "1.25rem",
              borderTop: "1px solid rgba(0,0,0,0.1)",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "0.6rem",
            }}
          >
            {centerBreakdownData.map((c, i) => (
              <div
                key={`${c.name}-${c.city}-${i}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: "rgba(0,0,0,0.03)",
                  borderRadius: "8px",
                  padding: "0.4rem 0.75rem",
                  border: "1px solid rgba(0,0,0,0.08)",
                }}
              >
                <span
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.7rem",
                    fontWeight: 800,
                    color: "#fff",
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </span>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      color: "#1f2937",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {c.name}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "#6b7280" }}>
                    👥 {c.staff} · 📊 {c.capacity}
                  </div>
                </div>
                <span
                  style={{
                    marginLeft: "auto",
                    flexShrink: 0,
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    padding: "0.15rem 0.4rem",
                    borderRadius: "4px",
                    background:
                      c.status === "ACTIVE"
                        ? "rgba(34,197,94,0.15)"
                        : "rgba(239,68,68,0.15)",
                    color: c.status === "ACTIVE" ? "#16a34a" : "#dc2626",
                    border: `1px solid ${c.status === "ACTIVE" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                  }}
                >
                  {c.status === "ACTIVE" ? "● ON" : "○ OFF"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Overview;
