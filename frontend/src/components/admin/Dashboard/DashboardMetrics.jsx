import { useEffect, useState } from "react";
import { adminService } from "../../../services/adminService";
import api from "../../../services/api";
import HealthConditionTrendsPanel from "../../analytics/HealthConditionTrendsPanel";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import styles from "./DashboardMetrics.module.css";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className={styles.highlightCard}>
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
  selectedCenter: externalSelectedCenter,
  selectedRegion: externalSelectedRegion,
  dateRange: externalDateRange,
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
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [centers, setCenters] = useState([]);
  const [regions, setRegions] = useState([]);

  const effectivePeriod = externalTimePeriod || timePeriod;
  const effectiveCenter =
    externalSelectedCenter !== undefined ? externalSelectedCenter : "all";
  const effectiveRegion =
    externalSelectedRegion !== undefined ? externalSelectedRegion : "all";
  const effectiveDateRange = externalDateRange || { start: "", end: "" };

  useEffect(() => {
    if (externalTimePeriod) setTimePeriod(externalTimePeriod);
  }, [externalTimePeriod]);

  useEffect(() => {
    fetchMetrics();
    fetchCenters();
    fetchRegions();
    fetchHealthData();
    const interval = setInterval(() => {
      fetchMetrics();
    }, 60000);
    return () => clearInterval(interval);
  }, [effectivePeriod, effectiveCenter, effectiveRegion]);

  useEffect(() => {
    fetchHealthData();
  }, [
    effectivePeriod,
    effectiveCenter,
    effectiveRegion,
    effectiveDateRange.start,
    effectiveDateRange.end,
    selectedRegion,
  ]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDashboardMetrics(effectivePeriod, {
        region: effectiveRegion !== "all" ? effectiveRegion : undefined,
        center: effectiveCenter !== "all" ? effectiveCenter : undefined,
      });
      setMetrics(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load metrics");
    } finally {
      setLoading(false);
    }
  };

  const fetchHealthData = async () => {
    try {
      setHealthLoading(true);
      const today = new Date();
      let startDate, endDate;

      // Use custom date range if provided, otherwise use period
      if (effectiveDateRange.start && effectiveDateRange.end) {
        startDate = new Date(effectiveDateRange.start);
        endDate = new Date(effectiveDateRange.end);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
      } else if (effectivePeriod === "all") {
        startDate = null;
        endDate = null;
      } else if (effectivePeriod === "daily") {
        const y = today.getUTCFullYear(),
          m = today.getUTCMonth(),
          d = today.getUTCDate();
        startDate = new Date(Date.UTC(y, m, d, 0, 0, 0));
        endDate = new Date(Date.UTC(y, m, d, 23, 59, 59));
      } else if (effectivePeriod === "weekly") {
        const y = today.getUTCFullYear(),
          m = today.getUTCMonth(),
          d = today.getUTCDate();
        startDate = new Date(Date.UTC(y, m, d - 6, 0, 0, 0));
        endDate = new Date(Date.UTC(y, m, d, 23, 59, 59));
      } else if (effectivePeriod === "monthly") {
        const y = today.getUTCFullYear(),
          m = today.getUTCMonth(),
          d = today.getUTCDate();
        startDate = new Date(Date.UTC(y, m, 1, 0, 0, 0));
        endDate = new Date(Date.UTC(y, m, d, 23, 59, 59));
      }

      const params =
        effectivePeriod === "all" && !effectiveDateRange.start
          ? {}
          : {
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString(),
            };
      if (effectiveCenter !== "all") params.center = effectiveCenter;
      if (effectiveRegion !== "all") params.region = effectiveRegion;
      if (selectedRegion !== "all") params.region = selectedRegion;
      
      const response = await api.get("/api/v1/conditions/period", { params });
      const conditions = response.data.data || [];
      const totalWellnessPlans = response.data.meta?.totalWellnessPlans || 0;
      
      // Build vitals params with same filters
      const vitalsParams =
        effectivePeriod === "all" && !effectiveDateRange.start
          ? {}
          : {
              startDate: startDate.toISOString(),
              endDate: endDate.toISOString(),
            };
      
      // Apply the same region/center filters to vitals
      if (effectiveCenter !== "all") vitalsParams.center = effectiveCenter;
      if (effectiveRegion !== "all") vitalsParams.region = effectiveRegion;
      if (selectedRegion !== "all") vitalsParams.region = selectedRegion;
      
      const vitalsRes = await api.get("/api/v1/vitals/all", {
        params: vitalsParams,
      });
      const vitalsData = vitalsRes.data?.data || vitalsRes.data || [];
      const uniquePatients = new Set(
        vitalsData.map((v) => v.userId).filter(Boolean),
      );
      const totalPatients = uniquePatients.size;
      const predefinedConditions = [
        { key: "hypertension", label: "Hypertension", color: "#dc2626" },
        { key: "overweight", label: "Overweight", color: "#f59e0b" },
        { key: "obesity", label: "Obesity", color: "#7c3aed" },
        { key: "diabetes", label: "Diabetes", color: "#2563eb" },
        { key: "heart_respiratory", label: "Heart / Resp.", color: "#ec4899" },
        { key: "normal", label: "Normal", color: "#10b981" },
      ];
      const conditionMap = {};
      const customConditions = new Set();
      conditions.forEach((c) => {
        const key = c.condition.toLowerCase().replace(/ /g, "_");
        if (key === "other") return;
        if (key === "heart_issues" || key === "respiratory_issues") {
          conditionMap["heart_respiratory"] =
            (conditionMap["heart_respiratory"] || 0) + c.count;
        } else {
          conditionMap[key] = (conditionMap[key] || 0) + c.count;
          const isPredefined = predefinedConditions.some(
            (pc) => pc.key === key,
          );
          if (
            !isPredefined &&
            key !== "heart_issues" &&
            key !== "respiratory_issues"
          )
            customConditions.add(key);
        }
      });
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
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" "),
          color: customColors[index % customColors.length],
        }),
      );
      const allConditions = [...predefinedConditions, ...customConditionsList];
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
          totalPatients,
        }))
        .filter((c) => c.count > 0)
        .sort((a, b) => b.count - a.count);
      setHealthData({
        totalPatients,
        totalVitalsRecorded: vitalsData.length,
        highRiskCount: vitalsData.filter(
          (v) => v.riskLevel === "high" || v.riskLevel === "critical",
        ).length,
        criticalCount: vitalsData.filter((v) => v.riskLevel === "critical")
          .length,
        patientConditions: rankedConditions,
      });
    } catch (err) {
      console.error("Failed to load health data:", err);
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

  const fetchRegions = async () => {
    try {
      const response = await api.get("/api/v1/admin/regions");
      setRegions(response.data.data || []);
    } catch (err) {
      console.error("Failed to fetch regions:", err);
    }
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return "Never";
    const diff = Math.floor((new Date() - lastUpdated) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  const getPeriodLabel = () => {
    switch (effectivePeriod) {
      case "daily":
        return "Today";
      case "weekly":
        return "This week";
      case "monthly":
        return "This month";
      case "all":
        return "All time";
      default:
        return "Today";
    }
  };

  if (loading && !metrics)
    return <div className={styles.metricsLoading}>Loading metrics...</div>;
  if (error && !metrics)
    return <div className={styles.metricsError}>Error: {error}</div>;
  if (!metrics)
    return <div className={styles.metricsEmpty}>No metrics available</div>;

  const totalUsers = metrics.users?.total || 0;
  const totalCenters = metrics.centers?.total || 0;
  const totalRegions = metrics.regions?.total || 0;
  const totalAppointments = metrics.appointments?.total || 0;
  const totalWalkIns = metrics.walkIns?.total || 0;
  const totalFeedback = metrics.feedback?.total || 0;
  const totalPatientsServed = metrics.patientsServed?.total || 0;

  return (
    <div className={styles.dashboardMetrics}>
      {/* ── TOP 3 STATIC KPI CARDS ── */}
      <div className={styles.staticTotalsRow}>
        <div className={styles.staticTotalCard}>
          <div className={styles.staticValue}>{totalUsers}</div>
          <div className={styles.staticLabel}>Total Users</div>
          <hr className={styles.staticDivider} />
          <div className={styles.staticBreakdown}>
            <div className={styles.staticBreakdownItem}>
              <span className={styles.bdLabel}>External patients</span>
              <span className={styles.bdValue}>
                {metrics.users?.externalPatients || 0}
              </span>
            </div>
            <div className={styles.staticBreakdownItem}>
              <span className={styles.bdLabel}>Staff</span>
              <span className={styles.bdValue}>{metrics.users?.staff || 0}</span>
            </div>
          </div>
        </div>

        <div className={styles.staticTotalCard}>
          <div className={styles.staticValue}>{totalCenters}</div>
          <div className={styles.staticLabel}>Total Centers</div>
        </div>

        <div className={styles.staticTotalCard}>
          <div className={styles.staticValue}>{totalRegions}</div>
          <div className={styles.staticLabel}>Total Regions</div>
        </div>
      </div>

      {/* ── CONTROLS ── */}
      {showControls && (
        <div className={styles.metricsHeader}>
          <div className={styles.metricsTitle}>
            <h3>Performance Metrics</h3>
            <p className={styles.metricsSubtitle}>Updated: {formatLastUpdated()}</p>
          </div>
          <div className={styles.metricsControls}>
            <select
              value={effectivePeriod}
              onChange={(e) => {
                const next = e.target.value;
                if (onTimePeriodChange) onTimePeriodChange(next);
                if (!externalTimePeriod) setTimePeriod(next);
              }}
              className={styles.timePeriodSelect}
            >
              <option value="all">All</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>
      )}

      {/* ── BOTTOM 4 ACTIVITY CARDS ── */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricTitle}>Appointments</div>
          <div className={styles.metricValue}>{totalAppointments}</div>
          <div className={styles.metricPeriod}>{getPeriodLabel()}</div>
          <div className={styles.metricCircleDeco} />
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricTitle}>Walk-ins</div>
          <div className={styles.metricValue}>{totalWalkIns}</div>
          <div className={styles.metricPeriod}>{getPeriodLabel()}</div>
          <div className={styles.metricCircleDeco} />
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricTitle}>Feedback</div>
          <div className={styles.metricValue}>{totalFeedback}</div>
          <div className={styles.metricPeriod}>{getPeriodLabel()}</div>
          <div className={styles.metricCircleDeco} />
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricTitle}>Patients served</div>
          <div className={styles.metricValue}>{totalPatientsServed}</div>
          <div className={styles.metricPeriod}>{getPeriodLabel()}</div>
          <div className={styles.metricCircleDeco} />
        </div>
      </div>

      {/* ── HEALTH ANALYTICS ── */}
      <div className={styles.healthAnalyticsSection}>
        <h3>Workplace Health Analytics</h3>
        <div className={styles.healthFilters}>
          <div className={styles.filterGroup}>
            <label>Region</label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
            >
              <option value="all">All Regions</option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>
        </div>

        {healthLoading ? (
          <div className={styles.loadingState}>
            Loading health data...
          </div>
        ) : healthData ? (
          <>
            {/* 2x2 Grid Layout */}
            <div className={styles.healthCardsGrid}>
              {/* Overall Health Score - Large Card */}
              <div className={styles.healthScoreCard}>
                <h4>Overall Health Score</h4>
                <div className={styles.scoreDisplay}>
                  <div className={styles.scoreValue}>
                    {Math.round(
                      healthData.totalVitalsRecorded > 0
                        ? ((healthData.totalVitalsRecorded -
                            healthData.highRiskCount) /
                            healthData.totalVitalsRecorded) *
                            100
                        : 100,
                    )}
                  </div>
                  <div className={styles.scoreLabel}>/100</div>
                </div>
              </div>

              {/* Total Employees */}
              <div className={styles.healthStatCard}>
                <div className={styles.statLabel}>Total Employees</div>
                <div className={styles.statValue}>{healthData.totalPatients}</div>
              </div>

              {/* Healthy % */}
              <div className={styles.healthStatCard}>
                <div className={styles.statLabel}>Healthy %</div>
                <div className={`${styles.statValue} ${styles.statValueHealthy}`}>
                  {healthData.totalVitalsRecorded > 0
                    ? Math.round(
                        ((healthData.totalVitalsRecorded -
                          healthData.highRiskCount -
                          healthData.criticalCount) /
                          healthData.totalVitalsRecorded) *
                          100,
                      )
                    : 100}
                  %
                </div>
                <div className={styles.statSublabel}>Today</div>
              </div>

              {/* At-Risk % */}
              <div className={styles.healthStatCard}>
                <div className={styles.statLabel}>At-Risk %</div>
                <div className={`${styles.statValue} ${styles.statValueAtRisk}`}>
                  {healthData.totalVitalsRecorded > 0
                    ? Math.round(
                        (healthData.highRiskCount /
                          healthData.totalVitalsRecorded) *
                          100,
                      )
                    : 0}
                  %
                </div>
                <div className={styles.statSublabel}>Today</div>
              </div>

              {/* Critical % */}
              <div className={styles.healthStatCard}>
                <div className={styles.statLabel}>Critical %</div>
                <div className={`${styles.statValue} ${styles.statValueCritical}`}>
                  {healthData.totalVitalsRecorded > 0
                    ? Math.round(
                        (healthData.criticalCount /
                          healthData.totalVitalsRecorded) *
                          100,
                      )
                    : 0}
                  %
                </div>
                <div className={styles.statSublabel}>{getPeriodLabel()}</div>
              </div>
            </div>

            <div className={styles.healthChartsGrid}>
              {healthData.patientConditions?.filter((c) => c.count > 0).length >
                0 && (
                <div className={styles.healthChartCard}>
                  <h4>Condition Trends</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart
                      data={healthData.patientConditions
                        .filter((c) => c.count > 0)
                        .slice(0, 6)
                        .map((item, i) => ({
                          name: item.label,
                          value: item.count + i * 0.01,
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
                            stopColor="#213D8D"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#213D8D"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="name" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "2px solid #213D8D",
                          borderRadius: "8px",
                        }}
                        formatter={(value, name, props) => [
                          props.payload.originalCount,
                          "Count",
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#213D8D"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorCondition)"
                        dot={{ fill: "#f5a623", r: 5 }}
                        activeDot={{ r: 7 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className={styles.emptyState}>
            No health data available for the selected period.
          </div>
        )}
      </div>

      {/* ── HEALTH CONDITION TRENDS (BAR CHART + LINE CHART) ── */}
      <HealthConditionTrendsPanel
        viewPeriod={effectivePeriod}
        showPeriodSwitcher={false}
        selectedCenter={effectiveCenter}
        selectedRegion={effectiveRegion}
        dateRange={effectiveDateRange}
      />
    </div>
  );
}

export default DashboardMetrics;
