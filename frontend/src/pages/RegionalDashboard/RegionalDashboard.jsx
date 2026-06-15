import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { regionalService } from "../../services/regionalService";
import { analyticsService } from "../../services/analyticsService";
import RegionalLayout from "../../layouts/RegionalLayout";
import Managers from "../../components/regional/Managers/Managers";
import Centers from "../../components/regional/Centers/Centers";
import Overview from "../../components/regional/Overview/Overview";
import Performance from "../../components/regional/Performance/Performance";
import "../../styles/admin-dashboard.css";
import "../../styles/manager-dashboard.css";
import "../../styles/regional-dashboard-responsive.css";

// ─── Role guard ───────────────────────────────────────────────────────────────
const REGIONAL_ROLES = ["REGIONAL_OFFICE", "SYSTEM_ADMIN"];

// ─── Root Component ───────────────────────────────────────────────────────────
const RegionalDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCenter, setSelectedCenter] = useState("all");
  const [analytics, setAnalytics] = useState(null);
  const [centerAnalytics, setCenterAnalytics] = useState(null); // per-center analytics
  const [centers, setCenters] = useState([]);
  const [trendsData, setTrendsData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const hasAccess = REGIONAL_ROLES.includes(user?.role);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashboardData, trends] = await Promise.allSettled([
        regionalService.getDashboardData(null),
        analyticsService.getTrends(),
      ]);

      if (dashboardData.status === "fulfilled") {
        const { analytics, centers } = dashboardData.value;
        setAnalytics(analytics);
        setCenters(Array.isArray(centers) ? centers : []);
      }
      if (trends.status === "fulfilled") {
        setTrendsData(trends.value.data);
      }
      setLastUpdated(new Date());
    } catch (err) {
      setError("Failed to load dashboard data. Please refresh.");
      console.error("Center dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load per-center analytics when a specific center is selected
  useEffect(() => {
    if (selectedCenter !== "all") {
      regionalService
        .getCenterAnalytics(selectedCenter)
        .then((res) => setCenterAnalytics(res?.data ?? res ?? null))
        .catch(() => setCenterAnalytics(null));
    } else {
      setCenterAnalytics(null);
    }
  }, [selectedCenter]);

  // Initial load
  useEffect(() => {
    if (hasAccess) {
      loadDashboardData();
    }
  }, [hasAccess, loadDashboardData]);

  if (!hasAccess) {
    return (
      <div className="dashboard-container">
        <div className="access-denied">
          <h2>🚫 Access Denied</h2>
          <p>Regional Office role required to access this dashboard.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "📊 Overview" },
    { id: "centers", label: `🏥 Centers (${centers.length})` },
    { id: "managers", label: "👔 Managers" },
    { id: "performance", label: "📈 Analytics" },
  ];

  // Filter centers based on selection
  const filteredCenters =
    selectedCenter === "all"
      ? centers
      : centers.filter((c) => c.id === selectedCenter);

  // Effective analytics: use per-center analytics if a center is selected
  const effectiveAnalytics =
    selectedCenter !== "all" && centerAnalytics
      ? { summary: centerAnalytics }
      : analytics;

  // Get center statistics
  const centerStats = {
    total: centers.length,
    active: centers.filter((c) => c.status === "ACTIVE").length,
    totalStaff: centers.reduce((sum, c) => sum + (c._count?.staff || 0), 0),
    totalCapacity: centers.reduce((sum, c) => sum + (c.capacity || 0), 0),
  };

  const roleLabel =
    user?.role === "FEDERAL_OFFICE"
      ? "Federal Office"
      : user?.role === "SYSTEM_ADMIN"
        ? "System Admin"
        : "Regional Office";

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>📊 Regional Overview</h2>
              <div
                className="center-selector"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  padding: "0.5rem",
                }}
              >
                <select
                  value={selectedCenter}
                  onChange={(e) => setSelectedCenter(e.target.value)}
                  style={{
                    minWidth: "200px",
                    padding: "0.5rem 2rem 0.5rem 0.85rem",
                    borderRadius: "6px",
                    border: "none",
                    background: "transparent",
                    color: "#2d3748",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    outline: "none",
                    WebkitAppearance: "none",
                    appearance: "none",
                  }}
                >
                  <option value="all">🏥 All Centers ({centers.length})</option>
                  {centers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.status === "ACTIVE" ? "✅" : "⚠️"} {c.name} — {c.city}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Overview
              loading={loading}
              analytics={effectiveAnalytics}
              centers={filteredCenters}
              selectedCenter={selectedCenter}
              centerStats={centerStats}
            />
          </div>
        );
      case "centers":
        return (
          <div className="dashboard-section">
            <h2>🏥 Center Management</h2>
            <Centers
              loading={loading}
              centers={filteredCenters}
              selectedCenter={selectedCenter}
              onRefresh={loadDashboardData}
            />
          </div>
        );
      case "managers":
        return (
          <div className="dashboard-section">
            <h2>👔 Manager Oversight</h2>
            <Managers
              loading={loading}
              centers={centers}
              onRefresh={loadDashboardData}
            />
          </div>
        );
      case "performance":
        return (
          <div className="dashboard-section">
            <h2>📈 Analytics</h2>
            <Performance
              loading={loading}
              analytics={effectiveAnalytics}
              trendsData={trendsData}
              centers={filteredCenters}
            />
          </div>
        );
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <RegionalLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      centerStats={centerStats}
      centersCount={centers.length}
      error={error}
    >
      {renderContent()}
    </RegionalLayout>
  );
};

export default RegionalDashboard;
