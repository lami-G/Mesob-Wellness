import { useEffect, useState } from "react";
import { adminService } from "../../services/adminService";
import api from "../../services/api";
import HealthConditionTrendsPanel from "../analytics/HealthConditionTrendsPanel";
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

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{
        backgroundColor: "#FFFFFF",
        border: "2px solid #213D8D",
        borderRadius: "8px",
        padding: "10px 15px",
        color: "#213D8D",
        fontWeight: "600",
        fontSize: "14px",
      }}>
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
  const [selectedCondition, setSelectedCondition] = useState("all");
  const [centers, setCenters] = useState([]);

  const effectivePeriod = externalTimePeriod || timePeriod;
  const effectiveCenter = externalSelectedCenter !== undefined ? externalSelectedCenter : "all";
  const effectiveRegion = externalSelectedRegion !== undefined ? externalSelectedRegion : "all";
  const effectiveDateRange = externalDateRange || { start: "", end: "" };

  useEffect(() => {
    if (externalTimePeriod) setTimePeriod(externalTimePeriod);
  }, [externalTimePeriod]);

  useEffect(() => {
    fetchMetrics();
    fetchCenters();
    fetchHealthData();
    const interval = setInterval(() => { fetchMetrics(); }, 60000);
    return () => clearInterval(interval);
  }, [effectivePeriod]);

  useEffect(() => { fetchHealthData(); }, [effectivePeriod, effectiveCenter, effectiveRegion, effectiveDateRange.start, effectiveDateRange.end, selectedCondition]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDashboardMetrics(effectivePeriod);
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
        startDate = null; endDate = null;
      } else if (effectivePeriod === "daily") {
        const y = today.getUTCFullYear(), m = today.getUTCMonth(), d = today.getUTCDate();
        startDate = new Date(Date.UTC(y, m, d, 0, 0, 0));
        endDate = new Date(Date.UTC(y, m, d, 23, 59, 59));
      } else if (effectivePeriod === "weekly") {
        const y = today.getUTCFullYear(), m = today.getUTCMonth(), d = today.getUTCDate();
        startDate = new Date(Date.UTC(y, m, d - 6, 0, 0, 0));
        endDate = new Date(Date.UTC(y, m, d, 23, 59, 59));
      } else if (effectivePeriod === "monthly") {
        const y = today.getUTCFullYear(), m = today.getUTCMonth(), d = today.getUTCDate();
        startDate = new Date(Date.UTC(y, m, 1, 0, 0, 0));
        endDate = new Date(Date.UTC(y, m, d, 23, 59, 59));
      }
      
      const params = effectivePeriod === "all" && !effectiveDateRange.start ? {} : { startDate: startDate.toISOString(), endDate: endDate.toISOString() };
      if (effectiveCenter !== "all") params.center = effectiveCenter;
      if (effectiveRegion !== "all") params.region = effectiveRegion;
      if (selectedCondition !== "all") params.condition = selectedCondition;
      const response = await api.get("/api/v1/conditions/period", { params });
      const conditions = response.data.data || [];
      const totalWellnessPlans = response.data.meta?.totalWellnessPlans || 0;
      const vitalsParams = effectivePeriod === "all" ? {} : { startDate: startDate.toISOString(), endDate: endDate.toISOString() };
      const vitalsRes = await api.get("/api/v1/vitals/all", { params: vitalsParams });
      const vitalsData = vitalsRes.data?.data || vitalsRes.data || [];
      const uniquePatients = new Set(vitalsData.map((v) => v.userId).filter(Boolean));
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
          conditionMap["heart_respiratory"] = (conditionMap["heart_respiratory"] || 0) + c.count;
        } else {
          conditionMap[key] = (conditionMap[key] || 0) + c.count;
          const isPredefined = predefinedConditions.some((pc) => pc.key === key);
          if (!isPredefined && key !== "heart_issues" && key !== "respiratory_issues") customConditions.add(key);
        }
      });
      const customColors = ["#8b5cf6","#06b6d4","#84cc16","#f97316","#ec4899","#6366f1"];
      const customConditionsList = Array.from(customConditions).map((key, index) => ({
        key, label: key.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
        color: customColors[index % customColors.length],
      }));
      const allConditions = [...predefinedConditions, ...customConditionsList];
      const rankedConditions = allConditions
        .map((c) => ({ ...c, count: conditionMap[c.key] || 0, percentage: totalWellnessPlans > 0 ? Math.round(((conditionMap[c.key] || 0) / totalWellnessPlans) * 100) : 0, totalPatients }))
        .filter((c) => c.count > 0)
        .sort((a, b) => b.count - a.count);
      setHealthData({
        totalPatients,
        totalVitalsRecorded: vitalsData.length,
        highRiskCount: vitalsData.filter((v) => v.riskLevel === "high" || v.riskLevel === "critical").length,
        criticalCount: vitalsData.filter((v) => v.riskLevel === "critical").length,
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
    } catch (err) { console.error("Failed to fetch centers:", err); }
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
      case "daily": return "Today";
      case "weekly": return "This week";
      case "monthly": return "This month";
      case "all": return "All time";
      default: return "Today";
    }
  };

  if (loading && !metrics) return <div className="metrics-loading">Loading metrics...</div>;
  if (error && !metrics) return <div className="metrics-error">Error: {error}</div>;
  if (!metrics) return <div className="metrics-empty">No metrics available</div>;

  const totalUsers = metrics.users?.total || 0;
  const totalCenters = metrics.centers?.total || 0;
  const totalRegions = metrics.regions?.total || 0;
  const totalAppointments = metrics.appointments?.total || 0;
  const totalWalkIns = metrics.walkIns?.total || 0;
  const totalFeedback = metrics.feedback?.total || 0;
  const totalPatientsServed = metrics.patientsServed?.total || 0;

  return (
    <div className="dashboard-metrics">

      {/* ── TOP 3 STATIC KPI CARDS ── */}
      <div className="static-totals-row">

        <div className="static-total-card">
          <div className="static-icon-wrap">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div className="static-value">{totalUsers}</div>
          <div className="static-label">Total Users</div>
          <hr className="static-divider" />
          <div className="static-breakdown">
            <div className="static-breakdown-item">
              <span className="bd-label">External patients</span>
              <span className="bd-value">{metrics.users?.externalPatients || 0}</span>
            </div>
            <div className="static-breakdown-item">
              <span className="bd-label">Staff</span>
              <span className="bd-value">{metrics.users?.staff || 0}</span>
            </div>
          </div>
        </div>

        <div className="static-total-card">
          <div className="static-icon-wrap">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div className="static-value">{totalCenters}</div>
          <div className="static-label">Total Centers</div>
        </div>

        <div className="static-total-card">
          <div className="static-icon-wrap">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <div className="static-value">{totalRegions}</div>
          <div className="static-label">Total Regions</div>
        </div>

      </div>

      {/* ── CONTROLS ── */}
      {showControls && (
        <div className="metrics-header">
          <div className="metrics-title">
            <h3>Performance Metrics</h3>
            <p className="metrics-subtitle">Updated: {formatLastUpdated()}</p>
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
          </div>
        </div>
      )}

      {/* ── BOTTOM 4 ACTIVITY CARDS ── */}
      <div className="metrics-grid">

        <div className="metric-card">
          <span className="metric-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1e4ba8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </span>
          <div className="metric-title">Appointments</div>
          <div className="metric-value">{totalAppointments}</div>
          <div className="metric-period">{getPeriodLabel()}</div>
          <div className="metric-circle-deco" />
        </div>

        <div className="metric-card">
          <span className="metric-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1e4ba8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </span>
          <div className="metric-title">Walk-ins</div>
          <div className="metric-value">{totalWalkIns}</div>
          <div className="metric-period">{getPeriodLabel()}</div>
          <div className="metric-circle-deco" />
        </div>

        <div className="metric-card">
          <span className="metric-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1e4ba8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </span>
          <div className="metric-title">Feedback</div>
          <div className="metric-value">{totalFeedback}</div>
          <div className="metric-period">{getPeriodLabel()}</div>
          <div className="metric-circle-deco" />
        </div>

        <div className="metric-card">
          <span className="metric-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1e4ba8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </span>
          <div className="metric-title">Patients served</div>
          <div className="metric-value">{totalPatientsServed}</div>
          <div className="metric-period">{getPeriodLabel()}</div>
          <div className="metric-circle-deco" />
        </div>

      </div>

      {/* ── HEALTH ANALYTICS ── */}
      <div className="health-analytics-section">
        <h3>Workplace Health Analytics</h3>
        <div className="health-filters">
          <div className="filter-group">
            <label>Condition type</label>
            <select value={selectedCondition} onChange={(e) => setSelectedCondition(e.target.value)}>
              <option value="all">All Conditions</option>
              <option value="hypertension">Hypertension</option>
              <option value="obesity">Obesity</option>
              <option value="diabetes">Diabetes</option>
              <option value="heart_issues">Heart Issues</option>
              <option value="respiratory_issues">Respiratory Issues</option>
            </select>
          </div>
        </div>

        {healthLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
            Loading health data...
          </div>
        ) : healthData ? (
          <>
            <div className="health-score-only">
              <div className="health-score-card">
                <h4>Overall Health Score</h4>
                <div className="score-display">
                  <div className="score-value">
                    {Math.round(healthData.totalVitalsRecorded > 0
                      ? ((healthData.totalVitalsRecorded - healthData.highRiskCount) / healthData.totalVitalsRecorded) * 100
                      : 0)}
                  </div>
                  <div className="score-label">/100</div>
                </div>
              </div>
            </div>

            <div className="health-stats-expanded-grid">
              <div className="health-stat-expanded-card"><div className="stat-label">Total Employees</div><div className="stat-value">{healthData.totalPatients}</div></div>
              <div className="health-stat-expanded-card"><div className="stat-label">Healthy %</div><div className="stat-value" style={{color:"#10B981"}}>{healthData.totalVitalsRecorded > 0 ? Math.round(((healthData.totalVitalsRecorded - healthData.highRiskCount - healthData.criticalCount) / healthData.totalVitalsRecorded) * 100) : 0}%</div><div className="stat-sublabel">{getPeriodLabel()}</div></div>
              <div className="health-stat-expanded-card"><div className="stat-label">At-Risk %</div><div className="stat-value" style={{color:"#F59E0B"}}>{healthData.totalVitalsRecorded > 0 ? Math.round((healthData.highRiskCount / healthData.totalVitalsRecorded) * 100) : 0}%</div><div className="stat-sublabel">{getPeriodLabel()}</div></div>
              <div className="health-stat-expanded-card"><div className="stat-label">Critical %</div><div className="stat-value" style={{color:"#EF5350"}}>{healthData.totalVitalsRecorded > 0 ? Math.round((healthData.criticalCount / healthData.totalVitalsRecorded) * 100) : 0}%</div><div className="stat-sublabel">{getPeriodLabel()}</div></div>
            </div>

            <div className="health-charts-grid">
              {healthData.patientConditions?.filter((c) => c.count > 0).length > 0 && (
                <div className="health-chart-card">
                  <h4>Condition Distribution</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={healthData.patientConditions.filter((c) => c.count > 0).slice(0,6).map((item,i) => ({ name: item.label, value: item.count + i * 0.01, color: item.color, originalCount: item.count }))} cx="50%" cy="50%" labelLine={false} label={({ name, originalCount }) => `${name}: ${originalCount}`} outerRadius={70} dataKey="value">
                        {healthData.patientConditions.filter((c) => c.count > 0).slice(0,6).map((item, i) => <Cell key={`cell-${i}`} fill={item.color} />)}
                      </Pie>
                      <Tooltip formatter={(value, name, props) => [props.payload.originalCount, "Count"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
              {healthData.patientConditions?.filter((c) => c.count > 0).length > 0 && (
                <div className="health-chart-card">
                  <h4>Condition Trends</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={healthData.patientConditions.filter((c) => c.count > 0).slice(0,6).map((item,i) => ({ name: item.label, value: item.count + i * 0.01, originalCount: item.count, color: item.color }))}>
                      <defs><linearGradient id="colorCondition" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#213D8D" stopOpacity={0.8}/><stop offset="95%" stopColor="#213D8D" stopOpacity={0}/></linearGradient></defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB"/>
                      <XAxis dataKey="name" stroke="#6B7280"/>
                      <YAxis stroke="#6B7280"/>
                      <Tooltip contentStyle={{ backgroundColor:"#fff", border:"2px solid #213D8D", borderRadius:"8px" }} formatter={(value, name, props) => [props.payload.originalCount, "Count"]}/>
                      <Area type="monotone" dataKey="value" stroke="#213D8D" strokeWidth={2} fillOpacity={1} fill="url(#colorCondition)" dot={{ fill:"#f5a623", r:5 }} activeDot={{ r:7 }}/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
            No health data available for the selected period.
          </div>
        )}
      </div>

      {/* ── HEALTH CONDITION TRENDS (BAR CHART + LINE CHART) ── */}
      <HealthConditionTrendsPanel 
        viewPeriod={effectivePeriod}
        showPeriodSwitcher={false}
      />
    </div>
  );
}

export default DashboardMetrics;