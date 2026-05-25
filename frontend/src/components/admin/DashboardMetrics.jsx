import { useEffect, useState } from "react";
import { adminService } from "../../services/adminService";
import api from "../../services/api";
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Custom Tooltip Component
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div
        style={{
          backgroundColor: "#FFFFFF",
          border: "2px solid #3B82F6",
          borderRadius: "8px",
          padding: "10px 15px",
          color: "#1F2937",
          fontWeight: "600",
          fontSize: "14px",
        }}
      >
        {`${data.name} = ${data.value}`}
      </div>
    );
  }
  return null;
};

function DashboardMetrics({
  onTabChange,
  timePeriod: externalTimePeriod,
  onTimePeriodChange,
  showControls = true,
}) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timePeriod, setTimePeriod] = useState(externalTimePeriod || "daily");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [healthData, setHealthData] = useState(null);
  const [, setVitalsTrends] = useState(null);
  const [, setCenterData] = useState(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState("all");
  const [selectedCondition, setSelectedCondition] = useState("all");
  const [centers, setCenters] = useState([]);

  const effectivePeriod = externalTimePeriod || timePeriod;

  useEffect(() => {
    if (externalTimePeriod) {
      setTimePeriod(externalTimePeriod);
    }
  }, [externalTimePeriod]);

  useEffect(() => {
    fetchMetrics();
    fetchCenters();
    fetchHealthData();
    const interval = setInterval(() => {
      fetchMetrics();
    }, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [effectivePeriod]);

  useEffect(() => {
    fetchHealthData();
  }, [effectivePeriod, selectedCenter, selectedCondition]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDashboardMetrics(effectivePeriod);
      setMetrics(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load metrics");
      console.error("Error fetching metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHealthData = async () => {
    try {
      setHealthLoading(true);

      // Calculate date range based on timePeriod using UTC dates (same as Nurse Analytics)
      const today = new Date();
      let startDate, endDate;

      if (effectivePeriod === "all") {
        // All time - no date filters
        startDate = null;
        endDate = null;
      } else if (effectivePeriod === "daily") {
        // Today only - use UTC dates to avoid timezone issues
        const year = today.getUTCFullYear();
        const month = today.getUTCMonth();
        const date = today.getUTCDate();
        startDate = new Date(Date.UTC(year, month, date, 0, 0, 0));
        endDate = new Date(Date.UTC(year, month, date, 23, 59, 59));
      } else if (effectivePeriod === "weekly") {
        // Last 7 days (including today) - use UTC dates
        const year = today.getUTCFullYear();
        const month = today.getUTCMonth();
        const date = today.getUTCDate();
        startDate = new Date(Date.UTC(year, month, date - 6, 0, 0, 0));
        endDate = new Date(Date.UTC(year, month, date, 23, 59, 59));
      } else if (effectivePeriod === "monthly") {
        // From 1st of current month to today - use UTC dates
        const year = today.getUTCFullYear();
        const month = today.getUTCMonth();
        const date = today.getUTCDate();
        startDate = new Date(Date.UTC(year, month, 1, 0, 0, 0));
        endDate = new Date(Date.UTC(year, month, date, 23, 59, 59));
      }

      console.log(
        "📊 Fetching health data for timePeriod:",
        effectivePeriod,
        "dates:",
        startDate,
        "to",
        endDate,
      );

      // Use the same endpoint as Nurse Analytics: /api/v1/conditions/period
      const params =
        effectivePeriod === "all"
          ? {}
          : {
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString(),
            };

      if (selectedCenter !== "all") params.center = selectedCenter;
      if (selectedCondition !== "all") params.condition = selectedCondition;

      console.log("📊 API params:", params);

      const response = await api.get("/api/v1/conditions/period", { params });

      console.log("📊 Health data response:", response.data);

      const conditions = response.data.data || [];
      const totalWellnessPlans = response.data.meta?.totalWellnessPlans || 0;

      // Get total unique patients in the period (from vitals records)
      const vitalsParams =
        effectivePeriod === "all"
          ? {}
          : {
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString(),
            };

      const vitalsRes = await api.get("/api/v1/vitals/all", {
        params: vitalsParams,
      });

      const vitalsData = vitalsRes.data?.data || vitalsRes.data || [];
      const uniquePatients = new Set(
        vitalsData.map((v) => v.userId).filter(Boolean),
      );
      const totalPatients = uniquePatients.size;

      console.log("📊 Total patients in period:", totalPatients);
      console.log("📊 Health conditions data:", conditions);

      // Define predefined conditions with their colors
      const predefinedConditions = [
        { key: "hypertension", label: "Hypertension", color: "#dc2626" },
        { key: "overweight", label: "Overweight", color: "#f59e0b" },
        { key: "obesity", label: "Obesity", color: "#7c3aed" },
        { key: "diabetes", label: "Diabetes", color: "#2563eb" },
        { key: "heart_respiratory", label: "Heart / Resp.", color: "#ec4899" },
        { key: "normal", label: "Normal", color: "#10b981" },
      ];

      // Create a map of condition counts
      const conditionMap = {};
      const customConditions = new Set();

      conditions.forEach((c) => {
        const key = c.condition.toLowerCase().replace(/ /g, "_");

        // Skip "other" condition completely
        if (key === "other") {
          return;
        }

        // Combine heart issues and respiratory issues
        if (key === "heart_issues" || key === "respiratory_issues") {
          conditionMap["heart_respiratory"] =
            (conditionMap["heart_respiratory"] || 0) + c.count;
        } else {
          conditionMap[key] = (conditionMap[key] || 0) + c.count;

          // Track custom conditions (not in predefined list)
          const isPredefined = predefinedConditions.some(
            (pc) => pc.key === key,
          );
          if (
            !isPredefined &&
            key !== "heart_issues" &&
            key !== "respiratory_issues"
          ) {
            customConditions.add(key);
          }
        }
      });

      // Generate colors for custom conditions
      const customColors = [
        "#8b5cf6",
        "#06b6d4",
        "#84cc16",
        "#f97316",
        "#ec4899",
        "#6366f1",
      ];
      const customConditionsList = Array.from(customConditions).map(
        (key, index) => ({
          key,
          label: key
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
          color: customColors[index % customColors.length],
        }),
      );

      // Combine predefined and custom conditions
      const allConditions = [...predefinedConditions, ...customConditionsList];

      console.log("📊 Condition map:", conditionMap);
      console.log("📊 Custom conditions found:", customConditionsList);

      // Map counts to conditions and calculate percentages
      const rankedConditions = allConditions
        .map((c) => ({
          ...c,
          count: conditionMap[c.key] || 0,
          percentage:
            totalWellnessPlans > 0
              ? Math.round(
                  ((conditionMap[c.key] || 0) / totalWellnessPlans) * 100,
                )
              : 0,
          totalPatients: totalPatients,
        }))
        .filter((c) => c.count > 0)
        .sort((a, b) => b.count - a.count);

      // Format data for charts
      const processedHealthData = {
        totalPatients: totalPatients,
        totalVitalsRecorded: vitalsData.length,
        highRiskCount: vitalsData.filter(
          (v) => v.riskLevel === "high" || v.riskLevel === "critical",
        ).length,
        criticalCount: vitalsData.filter((v) => v.riskLevel === "critical")
          .length,
        patientConditions: rankedConditions,
      };

      setHealthData(processedHealthData);

      console.log("✅ Health data processed:", processedHealthData);
    } catch (err) {
      console.error("❌ Failed to load health data:", err);
      setHealthData(null);
    } finally {
      setHealthLoading(false);
    }
  };

  const fetchCenters = async () => {
    try {
      const response = await api.get("/api/v1/centers");
      setCenters(response.data.data || []);
    } catch (err) {
      console.error("Failed to fetch centers:", err);
    }
  };

  // Format last updated time
  const formatLastUpdated = () => {
    if (!lastUpdated) return "Never";
    const now = new Date();
    const diff = Math.floor((now - lastUpdated) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  // Get time period label for health analytics
  const getHealthTimePeriodLabel = () => {
    switch (effectivePeriod) {
      case "daily":
        return "Today";
      case "weekly":
        return "This Week";
      case "monthly":
        return "This Month";
      case "all":
        return "All Time";
      default:
        return "Today";
    }
  };

  if (loading && !metrics) {
    return <div className="metrics-loading">Loading metrics...</div>;
  }

  if (error && !metrics) {
    return <div className="metrics-error">Error: {error}</div>;
  }

  if (!metrics) {
    return <div className="metrics-empty">No metrics available</div>;
  }

  // Static totals (not affected by time period)
  const totalUsers = metrics.users?.total || 0;
  const totalCenters = metrics.centers?.total || 0;
  const totalRegions = metrics.regions?.total || 0;
  const totalPatients = metrics.patients?.total || 0;

  // Filtered by time period (actual data from backend)
  const totalAppointments = metrics.appointments?.total || 0;
  const totalWalkIns = metrics.walkIns?.total || 0;
  const totalFeedback = metrics.feedback?.total || 0;
  const totalPatientsServed = metrics.patientsServed?.total || 0;

  return (
    <div className="dashboard-metrics">
      {/* Static Totals Row - 3 cards */}
      <div className="static-totals-row">
        <button
          className="static-total-card"
          onClick={() => onTabChange && onTabChange("users")}
        >
          <div className="card-content-centered">
            <div className="static-icon-centered">👥</div>
            <div className="static-value-centered">{totalUsers}</div>
            <div className="static-label-centered">Total Users</div>
            <div className="breakdown-items-centered">
              <div className="breakdown-item-centered">
                <span className="breakdown-label-centered">
                  External Patients:
                </span>
                <span className="breakdown-value-centered">
                  {metrics.users?.externalPatients || 0}
                </span>
              </div>
              <div className="breakdown-item-centered">
                <span className="breakdown-label-centered">Staff:</span>
                <span className="breakdown-value-centered">
                  {metrics.users?.staff || 0}
                </span>
              </div>
            </div>
          </div>
        </button>
        <button
          className="static-total-card"
          onClick={() => onTabChange && onTabChange("centers")}
        >
          <div className="card-content-centered">
            <div className="static-icon-centered">🏥</div>
            <div className="static-value-centered">{totalCenters}</div>
            <div className="static-label-centered">Total Centers</div>
          </div>
        </button>
        <button
          className="static-total-card"
          onClick={() => onTabChange && onTabChange("regions")}
        >
          <div className="card-content-centered">
            <div className="static-icon-centered">🗺️</div>
            <div className="static-value-centered">{totalRegions}</div>
            <div className="static-label-centered">Total Regions</div>
          </div>
        </button>
      </div>

      {/* Header with Controls */}
      {showControls && (
        <div className="metrics-header">
          <div className="metrics-title">
            <h3>Performance Metrics</h3>
            <p className="metrics-subtitle">Filter by time period</p>
          </div>

          <div className="metrics-controls">
            <select
              value={effectivePeriod}
              onChange={(e) => {
                const next = e.target.value;
                if (onTimePeriodChange) onTimePeriodChange(next);
                if (!externalTimePeriod) setTimePeriod(next);
              }}
              className="time-period-select"
            >
              <option value="all">All</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <button
              onClick={fetchMetrics}
              className="refresh-btn"
              title="Refresh metrics"
            >
              🔄
            </button>
            <span className="last-updated">Updated: {formatLastUpdated()}</span>
          </div>
        </div>
      )}

      {/* Filtered Metrics Grid - 4 cards */}
      <div className="metrics-grid">
        {/* Appointments Card */}
        <div className="metric-card appointments-card">
          <div className="metric-header">
            <h3>📅 Appointments</h3>
            <span className="metric-icon">📋</span>
          </div>
          <div className="metric-body">
            <div className="metric-main">
              <span className="metric-value">{totalAppointments}</span>
              <span className="metric-label">
                {effectivePeriod === "daily"
                  ? "Today"
                  : effectivePeriod === "weekly"
                    ? "This Week"
                    : effectivePeriod === "monthly"
                      ? "This Month"
                      : "All Time"}
              </span>
            </div>
          </div>
        </div>

        {/* Walk-ins Card */}
        <div className="metric-card walkin-card">
          <div className="metric-header">
            <h3>🚶 Walk-ins</h3>
            <span className="metric-icon">👤</span>
          </div>
          <div className="metric-body">
            <div className="metric-main">
              <span className="metric-value">{totalWalkIns}</span>
              <span className="metric-label">
                {effectivePeriod === "daily"
                  ? "Today"
                  : effectivePeriod === "weekly"
                    ? "This Week"
                    : effectivePeriod === "monthly"
                      ? "This Month"
                      : "All Time"}
              </span>
            </div>
          </div>
        </div>

        {/* Feedback Card */}
        <div className="metric-card feedback-card">
          <div className="metric-header">
            <h3>⭐ Feedback</h3>
            <span className="metric-icon">💬</span>
          </div>
          <div className="metric-body">
            <div className="metric-main">
              <span className="metric-value">{totalFeedback}</span>
              <span className="metric-label">
                {effectivePeriod === "daily"
                  ? "Today"
                  : effectivePeriod === "weekly"
                    ? "This Week"
                    : effectivePeriod === "monthly"
                      ? "This Month"
                      : "All Time"}
              </span>
            </div>
          </div>
        </div>

        {/* Patients Served Card */}
        <div className="metric-card patients-served-card">
          <div className="metric-header">
            <h3>🩺 Patients Served</h3>
            <span className="metric-icon">✅</span>
          </div>
          <div className="metric-body">
            <div className="metric-main">
              <span className="metric-value">{totalPatientsServed}</span>
              <span className="metric-label">
                {effectivePeriod === "daily"
                  ? "Today"
                  : effectivePeriod === "weekly"
                    ? "This Week"
                    : effectivePeriod === "monthly"
                      ? "This Month"
                      : "All Time"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Health Analytics Section */}
      {healthData && (
        <div className="health-analytics-section">
          <h3>🏥 Workplace Health Analytics</h3>

          {/* Filters */}
          <div className="health-filters">
            <div className="filter-group">
              <label>Center/Department</label>
              <select
                value={selectedCenter}
                onChange={(e) => setSelectedCenter(e.target.value)}
              >
                <option value="all">All Centers</option>
                {centers.map((center) => (
                  <option key={center.id} value={center.id}>
                    {center.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Condition Type</label>
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
              >
                <option value="all">All Conditions</option>
                <option value="hypertension">Hypertension</option>
                <option value="obesity">Obesity</option>
                <option value="diabetes">Diabetes</option>
                <option value="heart_issues">Heart Issues</option>
                <option value="respiratory_issues">Respiratory Issues</option>
              </select>
            </div>
          </div>

          {/* Health Score */}
          <div className="health-score-only">
            <div className="health-score-card">
              <h4>Overall Health Score</h4>
              <div className="score-display">
                <div className="score-value">
                  {Math.round(
                    healthData.totalVitalsRecorded > 0
                      ? ((healthData.totalVitalsRecorded -
                          healthData.highRiskCount) /
                          healthData.totalVitalsRecorded) *
                          100
                      : 0,
                  )}
                </div>
                <div className="score-label">/100</div>
              </div>
            </div>
          </div>

          {/* Expanded Health Stats Grid */}
          <div className="health-stats-expanded-grid">
            <div className="health-stat-expanded-card">
              <div className="stat-label">Total Employees</div>
              <div className="stat-value">{healthData.totalPatients}</div>
            </div>
            <div className="health-stat-expanded-card">
              <div className="stat-label">Healthy %</div>
              <div className="stat-value" style={{ color: "#10B981" }}>
                {healthData.totalVitalsRecorded > 0
                  ? Math.round(
                      ((healthData.totalVitalsRecorded -
                        healthData.highRiskCount -
                        healthData.criticalCount) /
                        healthData.totalVitalsRecorded) *
                        100,
                    )
                  : 0}
                %
              </div>
              <div className="stat-sublabel">{getHealthTimePeriodLabel()}</div>
            </div>
            <div className="health-stat-expanded-card">
              <div className="stat-label">At-Risk %</div>
              <div className="stat-value" style={{ color: "#F59E0B" }}>
                {healthData.totalVitalsRecorded > 0
                  ? Math.round(
                      (healthData.highRiskCount /
                        healthData.totalVitalsRecorded) *
                        100,
                    )
                  : 0}
                %
              </div>
              <div className="stat-sublabel">{getHealthTimePeriodLabel()}</div>
            </div>
            <div className="health-stat-expanded-card">
              <div className="stat-label">Critical %</div>
              <div className="stat-value" style={{ color: "#EF5350" }}>
                {healthData.totalVitalsRecorded > 0
                  ? Math.round(
                      (healthData.criticalCount /
                        healthData.totalVitalsRecorded) *
                        100,
                    )
                  : 0}
                %
              </div>
              <div className="stat-sublabel">{getHealthTimePeriodLabel()}</div>
            </div>
          </div>

          {/* Charts Grid - Condition Distribution */}
          <div className="health-charts-grid">
            {/* Condition Distribution - Pie Chart */}
            {healthData.patientConditions &&
              healthData.patientConditions.filter((c) => c.count > 0).length >
                0 && (
                <div className="health-chart-card">
                  <h4>Condition Distribution</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={healthData.patientConditions
                          .filter((c) => c.count > 0)
                          .slice(0, 6)
                          .map((item, index) => ({
                            name: item.label,
                            value: item.count + index * 0.01, // Add tiny offset to prevent overlap
                            color: item.color,
                            originalCount: item.count,
                          }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, originalCount }) =>
                          `${name}: ${originalCount}`
                        }
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {healthData.patientConditions
                          .filter((c) => c.count > 0)
                          .slice(0, 6)
                          .map((item, index) => (
                            <Cell key={`cell-${index}`} fill={item.color} />
                          ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name, props) => {
                          if (name === "value") {
                            return [props.payload.originalCount, "Count"];
                          }
                          return value;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

            {/* Condition Distribution - Area Chart */}
            {healthData.patientConditions &&
              healthData.patientConditions.filter((c) => c.count > 0).length >
                0 && (
                <div className="health-chart-card">
                  <h4>Condition Trends</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart
                      data={healthData.patientConditions
                        .filter((c) => c.count > 0)
                        .slice(0, 6)
                        .map((item, index) => ({
                          name: item.label,
                          value: item.count + index * 0.01, // Add tiny offset to prevent overlap
                          originalCount: item.count,
                          color: item.color,
                        }))}
                    >
                      <defs>
                        <linearGradient
                          id="colorCondition"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#3B82F6"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#3B82F6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="name" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#FFFFFF",
                          border: "2px solid #3B82F6",
                          borderRadius: "8px",
                          padding: "10px 15px",
                          color: "#1F2937",
                        }}
                        cursor={{ strokeDasharray: "3 3" }}
                        formatter={(value, name, props) => {
                          if (name === "value") {
                            return [props.payload.originalCount, "Count"];
                          }
                          return value;
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorCondition)"
                        dot={{ fill: "#3B82F6", r: 5 }}
                        activeDot={{ r: 7 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardMetrics;
