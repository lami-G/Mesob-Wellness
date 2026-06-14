import React, { useCallback, useEffect, useMemo, useState } from "react";
import FederalLayout from "../../layouts/FederalLayout";
import { regionalService } from "../../services/regionalService";
import { adminService } from "../../services/adminService";
import { analyticsService } from "../../services/analyticsService";
import CenterManagement from "../../components/admin/Centers/CenterManagement";
import AppointmentManagement from "../../components/admin/Appointments/AppointmentManagement";
import FeedbackQuality from "../../components/admin/Feedback/FeedbackQuality";
import AuditLogs from "../../components/admin/Audit/AuditLogs";
import FederalUsers from "./FederalUsers";
import DashboardMetrics from "../../components/admin/Dashboard/DashboardMetrics";
import HealthConditionTrendsPanel from "../../components/analytics/HealthConditionTrendsPanel";
import RegionManagement from "../../components/admin/Regions/RegionManagement";
import "../../styles/admin-dashboard.css";
import "../../styles/admin-filters.css";
import "../../styles/admin-tables.css";
import "../../styles/admin-health.css";
import "../../styles/admin-feedback.css";
import "../../styles/admin-audit.css";
import "../../styles/admin-regions.css";
import "../../styles/admin-analytics.css";
import "../../styles/admin-modals.css";
import styles from "./FederalDashboard.module.css";

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
    <div className={styles.tooltipContainer}>
      <div className={styles.tooltipLabel}>
        {label}
      </div>
      <div className={styles.tooltipGrid}>
        {payload.map((item) => (
          <div key={item.dataKey} className={styles.tooltipItem}>
            <span className={styles.tooltipItemLabel}>
              <span
                className={styles.tooltipDot}
                style={{
                  background: item.color,
                  boxShadow: `0 0 6px ${item.color}55`,
                }}
              />
              {item.name}
            </span>
            <span className={styles.tooltipItemValue}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
      {conditionEntries.length > 0 && (
        <div className={styles.tooltipConditions}>
          <div className={styles.tooltipConditionsTitle}>
            Conditions
          </div>
          {conditionEntries.map(([key, value]) => (
            <div key={key} className={styles.tooltipConditionItem}>
              <span>{conditionLabels[key] || key}</span>
              <span className={styles.tooltipItemValue}>{value}</span>
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
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [editingRegion, setEditingRegion] = useState(null);
  const [showRegionEditModal, setShowRegionEditModal] = useState(false);
  const [selectedRegionForEdit, setSelectedRegionForEdit] = useState(null);
  const [selectedRegionStatus, setSelectedRegionStatus] = useState("ACTIVE");
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
        const regionsList = regionsRes.value?.data || regionsRes.value || [];
        setRegions(regionsList);
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

  // Auto-hide success messages after 3 seconds
  useEffect(() => {
    if (regionActionSuccess) {
      const timer = setTimeout(() => {
        setRegionActionSuccess("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [regionActionSuccess]);

  useEffect(() => {
    if (regionSuccess) {
      const timer = setTimeout(() => {
        setRegionSuccess("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [regionSuccess]);

  useEffect(() => {
    setSelectedRegion(globalFilters.region || "all");
  }, [globalFilters.region]);

  const availableCenters = useMemo(() => {
    if (globalFilters.region && globalFilters.region !== "all") {
      if (centers.length > 0) {
        return centers;
      }
      return allCenters.filter(
        (center) => center.region === globalFilters.region,
      );
    }
    return allCenters;
  }, [allCenters, centers, globalFilters.region]);

  useEffect(() => {
    if (!globalFilters.center) return;
    const centerExists = availableCenters.some(
      (center) => center.id === globalFilters.center,
    );
    if (!centerExists) {
      setGlobalFilters((prev) => ({ ...prev, center: "" }));
    }
  }, [availableCenters, globalFilters.center]);

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
      {loading ? (
        <div className="metrics-loading">Loading federal overview...</div>
      ) : null}

      <div className={`dashboard-section ${styles.overviewSection}`}>
        <h3 className={styles.overviewTitle}>System KPIs</h3>
        <DashboardMetrics
          onTabChange={setActiveTab}
          timePeriod={timePeriod}
          showControls={false}
          selectedCenter={globalFilters.center || "all"}
          selectedRegion={globalFilters.region || "all"}
        />
      </div>
    </div>
  );

  const renderRegions = () => <RegionManagement />;

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
            allowDelete={true}
          />
        );
      case "admin-users":
        return <FederalUsers />;
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
    <FederalLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      error={error}
    >
      {/* Show filters for overview tab */}
      {(activeTab === "overview") && (
        <div className={`card ${styles.filtersCard}`}>
          <div className={styles.filtersGrid}>
            <div className={styles.filterItem}>
              <label className={styles.filterLabel}>
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
            <div className={styles.filterItemWide}>
              <label className={styles.filterLabel}>
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
            <div className={styles.filterItemMedium}>
              <label className={styles.filterLabel}>
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
            {statusOptions.length > 0 && (
              <div className={styles.filterItemMedium}>
                <label className={styles.filterLabel}>
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
          </div>
        </div>
      )}
      {renderContent()}
    </FederalLayout>
  );
}

export default FederalDashboard;
