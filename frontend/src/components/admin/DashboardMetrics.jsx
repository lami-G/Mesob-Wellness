import { useEffect, useState } from "react";
import { adminService } from "../../services/adminService";
import api from "../../services/api";
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Custom Tooltip Component
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '2px solid #3B82F6',
        borderRadius: '8px',
        padding: '10px 15px',
        color: '#1F2937',
        fontWeight: '600',
        fontSize: '14px'
      }}>
        {`${data.name} = ${data.value}`}
      </div>
    );
  }
  return null;
};

function DashboardMetrics({ onTabChange }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timePeriod, setTimePeriod] = useState("daily");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [healthData, setHealthData] = useState(null);
  const [vitalsTrends, setVitalsTrends] = useState(null);
  const [centerData, setCenterData] = useState(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [dateRange, setDateRange] = useState("all");
  const [selectedCenter, setSelectedCenter] = useState("all");
  const [selectedCondition, setSelectedCondition] = useState("all");
  const [centers, setCenters] = useState([]);

  useEffect(() => {
    fetchMetrics();
    fetchCenters();
    fetchHealthData();
    const interval = setInterval(() => {
      fetchMetrics();
    }, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [timePeriod]);

  useEffect(() => {
    fetchHealthData();
  }, [dateRange, selectedCenter, selectedCondition]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDashboardMetrics(timePeriod);
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
      const params = new URLSearchParams();
      if (dateRange) params.append('dateRange', dateRange);
      if (selectedCenter !== 'all') params.append('center', selectedCenter);
      if (selectedCondition !== 'all') params.append('condition', selectedCondition);

      const [healthRes, trendsRes, centerRes] = await Promise.all([
        api.get(`/api/v1/analytics/health/analytics?${params.toString()}`),
        api.get(`/api/v1/analytics/vitals-trends?${params.toString()}`),
        api.get(`/api/v1/analytics/health-by-center?${params.toString()}`)
      ]);

      setHealthData(healthRes.data.data);
      setVitalsTrends(trendsRes.data.data);
      setCenterData(centerRes.data.data);
    } catch (err) {
      console.error('Failed to load health data:', err);
    } finally {
      setHealthLoading(false);
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
    switch(dateRange) {
      case "1": return "Today";
      case "7": return "This Week";
      case "30": return "This Month";
      case "90": return "Last 90 Days";
      case "all": return "All Time";
      default: return "Today";
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
                <span className="breakdown-label-centered">External Patients:</span>
                <span className="breakdown-value-centered">{metrics.users?.externalPatients || 0}</span>
              </div>
              <div className="breakdown-item-centered">
                <span className="breakdown-label-centered">Staff:</span>
                <span className="breakdown-value-centered">{metrics.users?.staff || 0}</span>
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
      <div className="metrics-header">
        <div className="metrics-title">
          <h3>Performance Metrics</h3>
          <p className="metrics-subtitle">Filter by time period</p>
        </div>

        <div className="metrics-controls">
          <select 
            value={timePeriod} 
            onChange={(e) => setTimePeriod(e.target.value)}
            className="time-period-select"
          >
            <option value="all">All</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <button onClick={fetchMetrics} className="refresh-btn" title="Refresh metrics">
            🔄
          </button>
          <span className="last-updated">Updated: {formatLastUpdated()}</span>
        </div>
      </div>

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
                {timePeriod === "daily" ? "Today" : timePeriod === "weekly" ? "This Week" : timePeriod === "monthly" ? "This Month" : "All Time"}
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
                {timePeriod === "daily" ? "Today" : timePeriod === "weekly" ? "This Week" : timePeriod === "monthly" ? "This Month" : "All Time"}
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
                {timePeriod === "daily" ? "Today" : timePeriod === "weekly" ? "This Week" : timePeriod === "monthly" ? "This Month" : "All Time"}
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
                {timePeriod === "daily" ? "Today" : timePeriod === "weekly" ? "This Week" : timePeriod === "monthly" ? "This Month" : "All Time"}
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
              <label>Time Period</label>
              <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                <option value="1">Today</option>
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
          </div>
          
          {/* Health Score */}
          <div className="health-score-only">
            <div className="health-score-card">
              <h4>Overall Health Score</h4>
              <div className="score-display">
                <div className="score-value">{Math.round((healthData.totalVitalsRecorded > 0 ? ((healthData.totalVitalsRecorded - healthData.highRiskCount) / healthData.totalVitalsRecorded) * 100 : 0))}</div>
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
              <div className="stat-value" style={{ color: '#10B981' }}>
                {healthData.totalVitalsRecorded > 0 ? Math.round(((healthData.totalVitalsRecorded - healthData.highRiskCount - healthData.criticalCount) / healthData.totalVitalsRecorded) * 100) : 0}%
              </div>
              <div className="stat-sublabel">{getHealthTimePeriodLabel()}</div>
            </div>
            <div className="health-stat-expanded-card">
              <div className="stat-label">At-Risk %</div>
              <div className="stat-value" style={{ color: '#F59E0B' }}>
                {healthData.totalVitalsRecorded > 0 ? Math.round((healthData.highRiskCount / healthData.totalVitalsRecorded) * 100) : 0}%
              </div>
              <div className="stat-sublabel">{getHealthTimePeriodLabel()}</div>
            </div>
            <div className="health-stat-expanded-card">
              <div className="stat-label">Critical %</div>
              <div className="stat-value" style={{ color: '#EF5350' }}>
                {healthData.totalVitalsRecorded > 0 ? Math.round((healthData.criticalCount / healthData.totalVitalsRecorded) * 100) : 0}%
              </div>
              <div className="stat-sublabel">{getHealthTimePeriodLabel()}</div>
            </div>
          </div>

          {/* Charts Grid - Condition Distribution */}
          <div className="health-charts-grid">
            {/* Condition Distribution - Pie Chart */}
            {healthData.patientConditions && healthData.patientConditions.length > 0 && (
              <div className="health-chart-card">
                <h4>Condition Distribution</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={healthData.patientConditions.slice(0, 6).map(item => ({
                        name: item.condition.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                        value: item.count
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {['#3B82F6', '#10B981', '#F59E0B', '#EF5350', '#8B0000', '#6B7280'].map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Condition Distribution - Area Chart */}
            {healthData.patientConditions && healthData.patientConditions.length > 0 && (
              <div className="health-chart-card">
                <h4>Condition Trends</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={healthData.patientConditions.slice(0, 6).map(item => ({
                    name: item.condition.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    value: item.count
                  }))}>
                    <defs>
                      <linearGradient id="colorCondition" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="name" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#FFFFFF', 
                        border: '2px solid #3B82F6', 
                        borderRadius: '8px',
                        padding: '10px 15px',
                        color: '#1F2937'
                      }}
                      cursor={{ strokeDasharray: '3 3' }}
                      content={<CustomTooltip />}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorCondition)"
                      dot={{ fill: '#3B82F6', r: 5 }}
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
