import React, { useCallback, useEffect, useMemo, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import { regionalService } from "../services/regionalService";
import { adminService } from "../services/adminService";
import { analyticsService } from "../services/analyticsService";
import CenterManagement from "./admin/CenterManagement";
import AppointmentManagement from "./admin/AppointmentManagement";
import FeedbackQuality from "./admin/FeedbackQuality";
import AuditLogs from "./admin/AuditLogs";
import DashboardMetrics from "../components/admin/DashboardMetrics";
import HealthConditionTrendsPanel from "../components/analytics/HealthConditionTrendsPanel";
import "../styles/admin-layout.css";
import "../styles/admin-dashboard.css";
import "../styles/admin-filters.css";
import "../styles/admin-tables.css";
import "../styles/admin-health.css";
import "../styles/admin-feedback.css";
import "../styles/admin-audit.css";
import "../styles/admin-regions.css";
import "../styles/admin-analytics.css";
import "../styles/admin-modals.css";

const FederalAnalyticsTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  const conditionCounts = payload[0]?.payload?.conditionCounts || null;
  const conditionLabels = {
    hypertension: "Hypertension",
    overweight: "Overweight",
    obesity: "Obesity",
    diabetes: "Diabetes",
    heart_respiratory: "Heart / Resp.",
    normal: "Normal",
    other: "Other",
  };

  const conditionEntries = Object.keys(conditionLabels)
    .map((key) => [key, conditionCounts?.[key] ?? 0])
    .sort((a, b) => Number(b[1]) - Number(a[1]));

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        border: "1px solid rgba(0,0,0,0.15)",
        borderRadius: "12px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        color: "#1f2937",
        padding: "0.75rem 1rem",
        minWidth: "180px",
      }}
    >
      <div
        style={{
          fontSize: "0.9rem",
          fontWeight: 700,
          color: "#111827",
          marginBottom: "0.5rem",
        }}
      >
        {label}
      </div>
      <div style={{ display: "grid", gap: "0.35rem" }}>
        {payload.map((item) => (
          <div
            key={item.dataKey}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.75rem",
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "#374151",
            }}
          >
            <span
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <span
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: item.color,
                  boxShadow: `0 0 6px ${item.color}55`,
                }}
              />
              {item.name}
            </span>
            <span style={{ fontWeight: 700, color: "#111827" }}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
      {conditionEntries.length > 0 && (
        <div
          style={{
            marginTop: "0.75rem",
            paddingTop: "0.6rem",
            borderTop: "1px solid rgba(0,0,0,0.08)",
            display: "grid",
            gap: "0.3rem",
          }}
        >
          <div
            style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6b7280" }}
          >
            Conditions
          </div>
          {conditionEntries.map(([key, value]) => (
            <div
              key={key}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "0.75rem",
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "#374151",
              }}
            >
              <span>{conditionLabels[key] || key}</span>
              <span style={{ fontWeight: 700, color: "#111827" }}>{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

function FederalDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [regions, setRegions] = useState([]);
  const [centers, setCenters] = useState([]);
  const [allCenters, setAllCenters] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [regionStatusFilter, setRegionStatusFilter] = useState("all");
  const [analytics, setAnalytics] = useState(null);
  const [newRegion, setNewRegion] = useState("");
  const [regionError, setRegionError] = useState("");
  const [regionSuccess, setRegionSuccess] = useState("");
  const [creatingRegion, setCreatingRegion] = useState(false);
  const [regionAccountEmail, setRegionAccountEmail] = useState("");
  const [regionAccountPassword, setRegionAccountPassword] = useState("");
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [editingRegion, setEditingRegion] = useState(null);
  const [regionDraftName, setRegionDraftName] = useState("");
  const [regionDraftStatus, setRegionDraftStatus] = useState("ACTIVE");
  const [regionActionLoading, setRegionActionLoading] = useState(false);
  const [regionActionError, setRegionActionError] = useState("");
  const [regionActionSuccess, setRegionActionSuccess] = useState("");
  const [timePeriod, setTimePeriod] = useState("daily");
  const [trendsData, setTrendsData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [globalFilters, setGlobalFilters] = useState({
    region: "all",
    center: "",
    dateFrom: "",
    dateTo: "",
    status: "",
  });

  const loadFederalData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [regionsRes, centersRes, allCentersRes, analyticsRes, trendsRes] =
        await Promise.allSettled([
          adminService.getRegions(),
          adminService.getCenters({
            region: selectedRegion === "all" ? undefined : selectedRegion,
            limit: 1000,
          }),
          adminService.getCenters({ limit: 1000 }),
          regionalService.getAllAnalytics(),
          analyticsService.getTrends(),
        ]);

      if (regionsRes.status === "fulfilled") {
        setRegions(regionsRes.value?.data || regionsRes.value || []);
      }

      if (centersRes.status === "fulfilled") {
        setCenters(centersRes.value?.data || centersRes.value || []);
      }

      if (allCentersRes.status === "fulfilled") {
        setAllCenters(allCentersRes.value?.data || allCentersRes.value || []);
      }

      if (analyticsRes.status === "fulfilled") {
        setAnalytics(analyticsRes.value?.data || analyticsRes.value || null);
      }

      if (trendsRes.status === "fulfilled") {
        setTrendsData(trendsRes.value?.data || trendsRes.value || null);
      }
      setLastUpdated(new Date());
    } catch (err) {
      setError("Failed to load federal data. Please refresh.");
      console.error("Federal dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedRegion]);

  const formatLastUpdated = () => {
    if (!lastUpdated) return "Never";
    const now = new Date();
    const diff = Math.floor((now - lastUpdated) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  useEffect(() => {
    setRegionError("");
    setRegionSuccess("");
    setRegionActionError("");
    setRegionActionSuccess("");
    loadFederalData();
  }, [loadFederalData, selectedRegion]);

  useEffect(() => {
    setSelectedRegion(globalFilters.region || "all");
  }, [globalFilters.region]);

  const statusOptions = useMemo(() => {
    switch (activeTab) {
      case "centers":
        return [
          { value: "ACTIVE", label: "Active" },
          { value: "INACTIVE", label: "Inactive" },
          { value: "MAINTENANCE", label: "Maintenance" },
        ];
      case "appointments":
        return [
          { value: "WAITING", label: "Waiting" },
          { value: "IN_PROGRESS", label: "In Progress" },
          { value: "IN_SERVICE", label: "In Service" },
          { value: "COMPLETED", label: "Completed" },
          { value: "CANCELLED", label: "Cancelled" },
          { value: "NO_SHOW", label: "No Show" },
          { value: "PENDING", label: "Pending" },
          { value: "CONFIRMED", label: "Confirmed" },
        ];
      default:
        return [];
    }
  }, [activeTab]);

  const statusLabel = useMemo(() => {
    switch (activeTab) {
      case "centers":
        return "Center Status";
      case "appointments":
        return "Appointment Status";
      default:
        return "Status";
    }
  }, [activeTab]);

  useEffect(() => {
    if (!statusOptions.length) {
      setGlobalFilters((prev) => ({ ...prev, status: "" }));
      return;
    }
    if (
      !statusOptions.find((option) => option.value === globalFilters.status)
    ) {
      setGlobalFilters((prev) => ({ ...prev, status: "" }));
    }
  }, [statusOptions, globalFilters.status]);

  useEffect(() => {
    const today = new Date();
    let startDate = null;
    let endDate = null;

    if (timePeriod === "daily") {
      const year = today.getUTCFullYear();
      const month = today.getUTCMonth();
      const date = today.getUTCDate();
      startDate = new Date(Date.UTC(year, month, date, 0, 0, 0));
      endDate = new Date(Date.UTC(year, month, date, 23, 59, 59));
    } else if (timePeriod === "weekly") {
      const year = today.getUTCFullYear();
      const month = today.getUTCMonth();
      const date = today.getUTCDate();
      startDate = new Date(Date.UTC(year, month, date - 6, 0, 0, 0));
      endDate = new Date(Date.UTC(year, month, date, 23, 59, 59));
    } else if (timePeriod === "monthly") {
      const year = today.getUTCFullYear();
      const month = today.getUTCMonth();
      const date = today.getUTCDate();
      startDate = new Date(Date.UTC(year, month, 1, 0, 0, 0));
      endDate = new Date(Date.UTC(year, month, date, 23, 59, 59));
    }

    setGlobalFilters((prev) => ({
      ...prev,
      dateFrom: startDate ? startDate.toISOString() : "",
      dateTo: endDate ? endDate.toISOString() : "",
    }));
  }, [timePeriod]);

  const summary = analytics?.summary || {};
  const completionRate = summary.totalAppointments
    ? Math.round(
        (summary.completedAppointments / summary.totalAppointments) * 100,
      )
    : 0;

  const regionStats = (analytics?.regions || []).map((region) => ({
    name: region.region,
    totalPatients: region.summary?.totalStaff || 0,
    averageFeedback: region.summary?.averageFeedback || 0,
    conditionCounts: region.summary?.conditionCounts || null,
  }));

  const centerNameLookup = useMemo(
    () => new Map(allCenters.map((center) => [center.id, center.name])),
    [allCenters],
  );

  const centerHealthStats = useMemo(() => {
    const centersFromAnalytics = analytics?.regions?.flatMap((region) =>
      (region.centers || []).map((center) => ({
        centerId: center.centerId,
        name: centerNameLookup.get(center.centerId) || center.centerId,
        totalPatients: center.totalStaff || 0,
        averageFeedback: center.averageFeedback || 0,
      })),
    );

    return centersFromAnalytics || [];
  }, [analytics, centerNameLookup]);

  const regionSummary =
    selectedRegion === "all"
      ? null
      : analytics?.regions?.find(
          (region) => region.region === selectedRegion,
        ) || null;

  const getRegionStatus = (regionCenters) => {
    if (!regionCenters.length) return "INACTIVE";
    if (regionCenters.some((center) => center.status === "MAINTENANCE")) {
      return "MAINTENANCE";
    }
    if (regionCenters.some((center) => center.status === "ACTIVE")) {
      return "ACTIVE";
    }
    return "INACTIVE";
  };

  const regionRows = regions.map((region) => {
    const regionCenters = allCenters.filter(
      (center) => center.region === region,
    );
    const status = getRegionStatus(regionCenters);
    const activeCenters = regionCenters.filter(
      (center) => center.status === "ACTIVE",
    ).length;
    const maintenanceCenters = regionCenters.filter(
      (center) => center.status === "MAINTENANCE",
    ).length;
    const inactiveCenters = regionCenters.filter(
      (center) => center.status === "INACTIVE",
    ).length;
    const analyticsSummary =
      analytics?.regions?.find((entry) => entry.region === region)?.summary ||
      {};
    const completion = analyticsSummary.totalAppointments
      ? Math.round(
          (analyticsSummary.completedAppointments /
            analyticsSummary.totalAppointments) *
            100,
        )
      : 0;

    return {
      region,
      status,
      totalCenters: regionCenters.length,
      activeCenters,
      maintenanceCenters,
      inactiveCenters,
      totalStaff: analyticsSummary.totalStaff || 0,
      totalAppointments: analyticsSummary.totalAppointments || 0,
      completion,
    };
  });

  const filteredRegionRows = regionRows.filter((row) =>
    regionStatusFilter === "all" ? true : row.status === regionStatusFilter,
  );

  const availableCenters = useMemo(() => {
    if (globalFilters.region && globalFilters.region !== "all") {
      return allCenters.filter(
        (center) => center.region === globalFilters.region,
      );
    }
    return allCenters;
  }, [allCenters, globalFilters.region]);

  const mapCenterStatus = (status) => {
    if (!status) return "";
    if (status !== status.toUpperCase()) return "";
    if (["ACTIVE", "INACTIVE", "MAINTENANCE"].includes(status)) return status;
    return "";
  };

  const mapAppointmentStatus = (status) => {
    if (!status) return "";
    if (status !== status.toUpperCase()) return "";
    if (
      [
        "WAITING",
        "IN_PROGRESS",
        "IN_SERVICE",
        "COMPLETED",
        "CANCELLED",
        "NO_SHOW",
        "PENDING",
        "CONFIRMED",
      ].includes(status)
    ) {
      return status;
    }
    return "";
  };

  const centerBaseFilters = useMemo(
    () => ({
      region: globalFilters.region === "all" ? "" : globalFilters.region,
      center: globalFilters.center || "",
      dateFrom: globalFilters.dateFrom || "",
      dateTo: globalFilters.dateTo || "",
      status: mapCenterStatus(globalFilters.status),
    }),
    [globalFilters],
  );

  const appointmentBaseFilters = useMemo(
    () => ({
      region: globalFilters.region === "all" ? "" : globalFilters.region,
      center: globalFilters.center || "",
      dateFrom: globalFilters.dateFrom || "",
      dateTo: globalFilters.dateTo || "",
      status: mapAppointmentStatus(globalFilters.status),
    }),
    [globalFilters],
  );

  const feedbackBaseFilters = useMemo(
    () => ({
      region: globalFilters.region === "all" ? "" : globalFilters.region,
      center: globalFilters.center || "",
      dateFrom: globalFilters.dateFrom || "",
      dateTo: globalFilters.dateTo || "",
    }),
    [globalFilters],
  );

  const auditBaseFilters = useMemo(
    () => ({
      region: globalFilters.region === "all" ? "" : globalFilters.region,
      center: globalFilters.center || "",
      dateFrom: globalFilters.dateFrom || "",
      dateTo: globalFilters.dateTo || "",
    }),
    [globalFilters],
  );

  const renderOverview = () => (
    <div className="dashboard-section">
      <div className="metrics-header" style={{ marginBottom: "1.5rem" }}>
        <div className="metrics-title">
          <h3>Federal Overview</h3>
          <p className="metrics-subtitle">Nationwide performance snapshot</p>
        </div>
        <div className="metrics-controls">
          <div
            className="time-period-select"
            style={{ padding: "0.4rem 0.75rem" }}
          >
            {globalFilters.region === "all" || !globalFilters.region
              ? "Nationwide"
              : globalFilters.region}
          </div>
          <button onClick={loadFederalData} className="refresh-btn">
            🔄
          </button>
        </div>
      </div>

      {loading ? (
        <div className="metrics-loading">Loading federal overview...</div>
      ) : (
        <div className="metrics-grid">
          <div className="metric-card appointments-card">
            <div className="metric-header">
              <h3>Regions</h3>
            </div>
            <div className="metric-body">
              <span className="metric-value">
                {analytics?.totalRegions || regions.length}
              </span>
              <span className="metric-label">Total Regions</span>
            </div>
          </div>

          <div className="metric-card walkin-card">
            <div className="metric-header">
              <h3>Centers</h3>
            </div>
            <div className="metric-body">
              <span className="metric-value">
                {analytics?.totalCenters || centers.length}
              </span>
              <span className="metric-label">Active Centers</span>
            </div>
          </div>

          <div className="metric-card feedback-card">
            <div className="metric-header">
              <h3>Appointments</h3>
            </div>
            <div className="metric-body">
              <span className="metric-value">
                {summary.totalAppointments || 0}
              </span>
              <span className="metric-label">Total Bookings</span>
            </div>
          </div>

          <div className="metric-card patients-served-card">
            <div className="metric-header">
              <h3>Completion</h3>
            </div>
            <div className="metric-body">
              <span className="metric-value">{completionRate}%</span>
              <span className="metric-label">Completion Rate</span>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-section" style={{ marginTop: "1.5rem" }}>
        <h3 style={{ marginBottom: "1rem" }}>System KPIs</h3>
        <DashboardMetrics
          onTabChange={setActiveTab}
          timePeriod={timePeriod}
          showControls={false}
        />
      </div>

      <div className="dashboard-section" style={{ marginTop: "1.5rem" }}>
        <h3 style={{ marginBottom: "1rem" }}>Health Condition Trends</h3>
        <HealthConditionTrendsPanel
          viewPeriod={timePeriod}
          showPeriodSwitcher={false}
        />
      </div>
    </div>
  );

  const renderRegions = () => (
    <div className="dashboard-section">
      <div className="users-header" style={{ marginBottom: "1rem" }}>
        <div>
          <h3>Region Directory</h3>
          <p style={{ marginTop: "0.25rem", color: "#6b7280" }}>
            Active regions and their center coverage
          </p>
        </div>
        <select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          className="form-input"
          style={{ maxWidth: "220px" }}
        >
          <option value="all">All Regions</option>
          {regions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
        <select
          value={regionStatusFilter}
          onChange={(e) => setRegionStatusFilter(e.target.value)}
          className="form-input"
          style={{ maxWidth: "200px" }}
        >
          <option value="all">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="MAINTENANCE">Maintenance</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      <div
        className="card"
        style={{ padding: "1.5rem", marginBottom: "1.5rem" }}
      >
        <h4 style={{ marginBottom: "0.5rem" }}>Create New Region</h4>
        <p style={{ color: "#6b7280", marginBottom: "1rem" }}>
          This creates a regional placeholder center to register the region.
        </p>
        <button
          className="btn btn-primary"
          onClick={() => setShowRegionModal(true)}
        >
          + Create Region
        </button>
      </div>

      {showRegionModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: "640px" }}>
            <div className="modal-header">
              <h3>Create New Region</h3>
              <button
                onClick={() => {
                  setShowRegionModal(false);
                  setNewRegion("");
                  setRegionAccountEmail("");
                  setRegionAccountPassword("");
                  setRegionError("");
                  setRegionSuccess("");
                }}
              >
                ×
              </button>
            </div>
            <div>
              {regionError && (
                <div
                  className="alert alert-error"
                  style={{ marginBottom: "0.75rem" }}
                >
                  {regionError}
                </div>
              )}
              {regionSuccess && (
                <div
                  className="success-message"
                  style={{ marginBottom: "0.75rem" }}
                >
                  {regionSuccess}
                </div>
              )}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <input
                  type="text"
                  className="form-input"
                  placeholder="Region name (e.g., Oromia)"
                  value={newRegion}
                  onChange={(e) => {
                    setNewRegion(e.target.value);
                    setRegionError("");
                    setRegionSuccess("");
                  }}
                />
                <input
                  type="email"
                  className="form-input"
                  placeholder="Regional office email"
                  value={regionAccountEmail}
                  onChange={(e) => setRegionAccountEmail(e.target.value)}
                />
                <input
                  type="password"
                  className="form-input"
                  placeholder="Regional office password"
                  value={regionAccountPassword}
                  onChange={(e) => setRegionAccountPassword(e.target.value)}
                />
              </div>
              <div className="modal-actions" style={{ marginTop: "1.5rem" }}>
                <button
                  className="btn btn-primary"
                  onClick={async () => {
                    const trimmed = newRegion.trim();
                    if (!trimmed) {
                      setRegionError("Please enter a region name.");
                      return;
                    }
                    if (regions.includes(trimmed)) {
                      setRegionError("This region already exists.");
                      return;
                    }
                    try {
                      setCreatingRegion(true);
                      setRegionError("");
                      setRegionSuccess("");

                      const codePrefix =
                        trimmed
                          .replace(/[^A-Za-z]/g, "")
                          .toUpperCase()
                          .slice(0, 3) || "REG";
                      await regionalService.createCenter({
                        name: `${trimmed} Regional Center`,
                        code: `${codePrefix}-001`,
                        region: trimmed,
                        city: trimmed,
                        address: "To be updated",
                        status: "ACTIVE",
                      });

                      setRegionSuccess(
                        `Region "${trimmed}" created successfully.`,
                      );
                      setNewRegion("");
                      setRegionAccountEmail("");
                      setRegionAccountPassword("");
                      setShowRegionModal(false);
                      await loadFederalData();
                    } catch (err) {
                      const message =
                        err.response?.data?.message ||
                        "Failed to create region.";
                      setRegionError(message);
                    } finally {
                      setCreatingRegion(false);
                    }
                  }}
                  disabled={creatingRegion}
                >
                  {creatingRegion ? "Creating..." : "Create Region"}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowRegionModal(false);
                    setNewRegion("");
                    setRegionAccountEmail("");
                    setRegionAccountPassword("");
                    setRegionError("");
                    setRegionSuccess("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {regionSummary && (
        <div
          className="analytics-cards-grid"
          style={{ marginBottom: "1.5rem" }}
        >
          <div className="analytics-card">
            <div className="card-icon">🏥</div>
            <div className="card-content">
              <p className="card-label">Centers</p>
              <p className="card-value">{regionSummary.totalCenters || 0}</p>
            </div>
          </div>
          <div className="analytics-card">
            <div className="card-icon">👥</div>
            <div className="card-content">
              <p className="card-label">Total Staff</p>
              <p className="card-value">
                {regionSummary.summary?.totalStaff || 0}
              </p>
            </div>
          </div>
          <div className="analytics-card">
            <div className="card-icon">📋</div>
            <div className="card-content">
              <p className="card-label">Appointments</p>
              <p className="card-value">
                {regionSummary.summary?.totalAppointments || 0}
              </p>
            </div>
          </div>
          <div className="analytics-card">
            <div className="card-icon">✅</div>
            <div className="card-content">
              <p className="card-label">Completed</p>
              <p className="card-value">
                {regionSummary.summary?.completedAppointments || 0}
              </p>
            </div>
          </div>
          <div className="analytics-card">
            <div className="card-icon">🩺</div>
            <div className="card-content">
              <p className="card-label">Vitals</p>
              <p className="card-value">
                {regionSummary.summary?.totalVitals || 0}
              </p>
            </div>
          </div>
          <div className="analytics-card">
            <div className="card-icon">⭐</div>
            <div className="card-content">
              <p className="card-label">Avg Feedback</p>
              <p className="card-value">
                {regionSummary.summary?.averageFeedback
                  ? regionSummary.summary.averageFeedback.toFixed(1)
                  : "0.0"}
              </p>
            </div>
          </div>
        </div>
      )}

      {regionActionError && (
        <div className="alert alert-error" style={{ marginBottom: "0.75rem" }}>
          {regionActionError}
        </div>
      )}
      {regionActionSuccess && (
        <div className="success-message" style={{ marginBottom: "0.75rem" }}>
          {regionActionSuccess}
        </div>
      )}

      {loading ? (
        <div className="metrics-loading">Loading regions...</div>
      ) : selectedRegion === "all" ? (
        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>Region</th>
                <th>Status</th>
                <th>Centers</th>
                <th>Active</th>
                <th>Appointments</th>
                <th>Completion %</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRegionRows.map((row) => (
                <tr key={row.region}>
                  <td>{row.region}</td>
                  <td>
                    <span
                      className={`status ${row.status === "ACTIVE" ? "active" : row.status === "MAINTENANCE" ? "maintenance" : "inactive"}`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td>{row.totalCenters}</td>
                  <td>{row.activeCenters}</td>
                  <td>{row.totalAppointments}</td>
                  <td>{row.completion}%</td>
                  <td>
                    {editingRegion === row.region ? (
                      <div
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <input
                          className="form-input"
                          value={regionDraftName}
                          onChange={(e) => setRegionDraftName(e.target.value)}
                          style={{ minWidth: "140px" }}
                        />
                        <select
                          className="form-input"
                          value={regionDraftStatus}
                          onChange={(e) => setRegionDraftStatus(e.target.value)}
                        >
                          <option value="ACTIVE">Active</option>
                          <option value="MAINTENANCE">Maintenance</option>
                          <option value="INACTIVE">Inactive</option>
                        </select>
                        <button
                          className="btn btn-secondary"
                          disabled={regionActionLoading}
                          onClick={async () => {
                            const trimmed = regionDraftName.trim();
                            const regionCenters = allCenters.filter(
                              (center) => center.region === row.region,
                            );
                            if (!trimmed) {
                              setRegionActionError(
                                "Region name cannot be empty.",
                              );
                              return;
                            }
                            if (
                              regions.includes(trimmed) &&
                              trimmed !== row.region
                            ) {
                              setRegionActionError(
                                "Region name already exists.",
                              );
                              return;
                            }
                            if (regionCenters.length === 0) {
                              setRegionActionError(
                                "No centers found for this region.",
                              );
                              return;
                            }
                            try {
                              setRegionActionLoading(true);
                              setRegionActionError("");
                              setRegionActionSuccess("");

                              await Promise.all(
                                regionCenters.map((center) =>
                                  adminService.updateCenter(center.id, {
                                    region: trimmed,
                                    status: regionDraftStatus,
                                  }),
                                ),
                              );

                              setRegionActionSuccess(
                                `Region "${row.region}" updated successfully.`,
                              );
                              setEditingRegion(null);
                              setRegionDraftName("");
                              await loadFederalData();
                            } catch (err) {
                              const message =
                                err.response?.data?.message ||
                                "Failed to update region.";
                              setRegionActionError(message);
                            } finally {
                              setRegionActionLoading(false);
                            }
                          }}
                        >
                          {regionActionLoading ? "Saving..." : "Save"}
                        </button>
                        <button
                          className="btn btn-reset"
                          onClick={() => {
                            setEditingRegion(null);
                            setRegionDraftName("");
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          className="btn btn-secondary"
                          onClick={() => {
                            setEditingRegion(row.region);
                            setRegionDraftName(row.region);
                            setRegionDraftStatus(row.status);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-reset"
                          disabled={regionActionLoading}
                          onClick={async () => {
                            const regionCenters = allCenters.filter(
                              (center) => center.region === row.region,
                            );
                            if (regionCenters.length === 0) {
                              setRegionActionError(
                                "No centers found for this region.",
                              );
                              return;
                            }
                            try {
                              setRegionActionLoading(true);
                              setRegionActionError("");
                              setRegionActionSuccess("");
                              await Promise.all(
                                regionCenters.map((center) =>
                                  adminService.updateCenter(center.id, {
                                    status: "INACTIVE",
                                  }),
                                ),
                              );
                              setRegionActionSuccess(
                                `Region "${row.region}" archived.`,
                              );
                              await loadFederalData();
                            } catch (err) {
                              const message =
                                err.response?.data?.message ||
                                "Failed to archive region.";
                              setRegionActionError(message);
                            } finally {
                              setRegionActionLoading(false);
                            }
                          }}
                        >
                          Archive
                        </button>
                        <button
                          className="btn btn-danger"
                          disabled={regionActionLoading}
                          onClick={async () => {
                            const regionCenters = allCenters.filter(
                              (center) => center.region === row.region,
                            );
                            if (regionCenters.length === 0) {
                              setRegionActionError(
                                "No centers found for this region.",
                              );
                              return;
                            }
                            const confirmed = window.confirm(
                              `Delete region "${row.region}" and ${regionCenters.length} centers? This cannot be undone.`,
                            );
                            if (!confirmed) return;
                            try {
                              setRegionActionLoading(true);
                              setRegionActionError("");
                              setRegionActionSuccess("");
                              await Promise.all(
                                regionCenters.map((center) =>
                                  adminService.deleteCenter(center.id),
                                ),
                              );
                              setRegionActionSuccess(
                                `Region "${row.region}" deleted.`,
                              );
                              await loadFederalData();
                            } catch (err) {
                              const message =
                                err.response?.data?.message ||
                                "Failed to delete region.";
                              setRegionActionError(message);
                            } finally {
                              setRegionActionLoading(false);
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card metrics-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ marginBottom: "1rem" }}>{selectedRegion} Summary</h3>
          <div
            className="analytics-cards-grid"
            style={{ marginBottom: "1rem" }}
          >
            <div className="analytics-card">
              <div className="card-icon">🏥</div>
              <div className="card-content">
                <p className="card-label">Centers</p>
                <p className="card-value">{analytics?.totalCenters || 0}</p>
              </div>
            </div>
            <div className="analytics-card">
              <div className="card-icon">👥</div>
              <div className="card-content">
                <p className="card-label">Total Staff</p>
                <p className="card-value">{summary.totalStaff || 0}</p>
              </div>
            </div>
            <div className="analytics-card">
              <div className="card-icon">📋</div>
              <div className="card-content">
                <p className="card-label">Appointments</p>
                <p className="card-value">{summary.totalAppointments || 0}</p>
              </div>
            </div>
          </div>
          <p style={{ color: "#6b7280" }}>
            Centers shown below are active only.
          </p>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "regions":
        return renderRegions();
      case "centers":
        return (
          <CenterManagement
            baseFilters={centerBaseFilters}
            allowDelete={false}
          />
        );
      case "appointments":
        return <AppointmentManagement baseFilters={appointmentBaseFilters} />;
      case "feedback":
        return <FeedbackQuality baseFilters={feedbackBaseFilters} />;
      case "audit":
        return <AuditLogs baseFilters={auditBaseFilters} />;
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <AdminLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      dashboardType="federal"
      error={error}
    >
      <div className="card" style={{ padding: "1rem", marginBottom: "1rem" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            alignItems: "flex-end",
          }}
        >
          <div style={{ minWidth: "180px" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#6b7280",
                marginBottom: "0.25rem",
              }}
            >
              Region
            </label>
            <select
              value={globalFilters.region}
              onChange={(e) =>
                setGlobalFilters((prev) => ({
                  ...prev,
                  region: e.target.value,
                  center: "",
                }))
              }
              className="form-input"
            >
              <option value="all">All Regions</option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>
          <div style={{ minWidth: "220px" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#6b7280",
                marginBottom: "0.25rem",
              }}
            >
              Center
            </label>
            <select
              value={globalFilters.center}
              onChange={(e) =>
                setGlobalFilters((prev) => ({
                  ...prev,
                  center: e.target.value,
                }))
              }
              className="form-input"
              disabled={availableCenters.length === 0}
            >
              <option value="">All Centers</option>
              {availableCenters.map((center) => (
                <option key={center.id} value={center.id}>
                  {center.name}
                </option>
              ))}
            </select>
          </div>
          <div style={{ minWidth: "200px" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#6b7280",
                marginBottom: "0.25rem",
              }}
            >
              Time Period
            </label>
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
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <button
              onClick={loadFederalData}
              className="refresh-btn"
              title="Refresh metrics"
              disabled={loading}
            >
              🔄
            </button>
            <span className="last-updated">Updated: {formatLastUpdated()}</span>
          </div>
          {statusOptions.length > 0 && (
            <div style={{ minWidth: "200px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#6b7280",
                  marginBottom: "0.25rem",
                }}
              >
                {statusLabel}
              </label>
              <select
                value={globalFilters.status}
                onChange={(e) =>
                  setGlobalFilters((prev) => ({
                    ...prev,
                    status: e.target.value,
                  }))
                }
                className="form-input"
              >
                <option value="">All Status</option>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <button
              className="btn btn-reset"
              onClick={() => {
                setTimePeriod("daily");
                setGlobalFilters({
                  region: "all",
                  center: "",
                  dateFrom: "",
                  dateTo: "",
                  status: "",
                });
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
      {renderContent()}
    </AdminLayout>
  );
}

export default FederalDashboard;
