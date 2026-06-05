import React, { useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import DashboardMetrics from "../../components/admin/DashboardMetrics";
import api from "../../services/api";
import RegionManagement from "./RegionManagement";
import UserManagement from "./UserManagement";
import CenterManagement from "./CenterManagement";
import AppointmentManagement from "./AppointmentManagement";
import HealthData from "./HealthData";
import FeedbackQuality from "./FeedbackQuality";
import AuditLogs from "./AuditLogs";
import SystemSettings from "./SystemSettings";
import AdminProfile from "./Profile.jsx";
// All styles imported through main.jsx - no additional imports needed

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [globalFilters, setGlobalFilters] = useState({
    timePeriod: "daily",
    center: "all",
    region: "all",
    dateRange: { start: "", end: "" },
  });
  const [centers, setCenters] = useState([]);
  const [regions, setRegions] = useState([]);

  useEffect(() => {
    fetchCenters();
    fetchRegions();
  }, []);

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
      const response = await api.get("/api/v1/regions");
      setRegions(response.data.data || []);
    } catch (err) {
      console.error("Failed to fetch regions:", err);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setGlobalFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const handleDateRangeChange = (start, end) => {
    setGlobalFilters((prev) => ({
      ...prev,
      dateRange: { start, end },
    }));
  };

  const shouldShowFilters = ["dashboard", "feedback", "audit"].includes(activeTab);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="dashboard-section">
            <p className="kpi-section-label">System KPIs</p>
            <DashboardMetrics 
              onTabChange={setActiveTab}
              timePeriod={globalFilters.timePeriod}
              onTimePeriodChange={(value) => handleFilterChange("timePeriod", value)}
              selectedCenter={globalFilters.center}
              selectedRegion={globalFilters.region}
              dateRange={globalFilters.dateRange}
              showControls={false}
            />
          </div>
        );
      case "regions":
        return <RegionManagement />;
      case "users":
        return <UserManagement />;
      case "centers":
        return <CenterManagement />;
      case "appointments":
        return <AppointmentManagement />;
      case "vitals":
        return <HealthData />;
      case "feedback":
        return <FeedbackQuality />;
      case "audit":
        return <AuditLogs />;
      case "settings":
        return <SystemSettings />;
      case "profile":
        return <AdminProfile />;
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {shouldShowFilters && (
        <div className="dashboard-filter-bar" style={{ marginBottom: '1.25rem' }}>
          <div className="filter-field">
            <label>Region</label>
            <select
              value={globalFilters.region}
              onChange={(e) => handleFilterChange("region", e.target.value)}
            >
              <option value="all">All Regions</option>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>{region.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-field">
            <label>Center</label>
            <select
              value={globalFilters.center}
              onChange={(e) => handleFilterChange("center", e.target.value)}
            >
              <option value="all">All Centers</option>
              {centers.map((center) => (
                <option key={center.id} value={center.id}>{center.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-field">
            <label>Time Period</label>
            <select
              value={globalFilters.timePeriod}
              onChange={(e) => handleFilterChange("timePeriod", e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="filter-field" style={{ minWidth: 'auto' }}>
            <label>Date From</label>
            <input
              type="date"
              value={globalFilters.dateRange.start}
              onChange={(e) => handleDateRangeChange(e.target.value, globalFilters.dateRange.end)}
              style={{
                padding: '0.5rem 0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontFamily: 'inherit',
                background: '#f8fafc',
                color: '#334155',
                outline: 'none',
              }}
            />
          </div>

          <div className="filter-field" style={{ minWidth: 'auto' }}>
            <label>Date To</label>
            <input
              type="date"
              value={globalFilters.dateRange.end}
              onChange={(e) => handleDateRangeChange(globalFilters.dateRange.start, e.target.value)}
              style={{
                padding: '0.5rem 0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontFamily: 'inherit',
                background: '#f8fafc',
                color: '#334155',
                outline: 'none',
              }}
            />
          </div>
        </div>
      )}
      {renderContent()}
    </AdminLayout>
  );
}

export default AdminDashboard;
