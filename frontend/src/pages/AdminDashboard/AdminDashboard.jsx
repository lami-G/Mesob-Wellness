import React, { useState, useEffect } from "react";
import AdminSystemLayout from "../../layouts/AdminSystemLayout";
import DashboardMetrics from "../../components/admin/Dashboard/DashboardMetrics";
import api from "../../services/api";
import RegionManagement from "../../components/admin/Regions/RegionManagement";
import UserManagement from "../../components/admin/Users/UserManagement";
import CenterManagement from "../../components/admin/Centers/CenterManagement";
import AppointmentManagement from "../../components/admin/Appointments/AppointmentManagement";
import HealthData from "../../components/admin/Health/HealthData";
import FeedbackQuality from "../../components/admin/Feedback/FeedbackQuality";
import AuditLogs from "../../components/admin/Audit/AuditLogs";
import SystemSettings from "../../components/admin/Settings/SystemSettings";
import AdminProfile from "../../components/admin/Profile/AdminProfile";
import "../../styles/admin-dashboard.css";
import "../../styles/admin-health-dashboard.css";
import "../../styles/admin-filters.css";
import "../../styles/admin-tables.css";
import "../../styles/admin-health.css";
import "../../styles/admin-feedback.css";
import "../../styles/admin-audit.css";
import "../../styles/admin-settings.css";
import "../../styles/admin-modals.css";
import "../../styles/admin-regions.css";

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

  const shouldShowFilters = ["dashboard"].includes(activeTab);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="dashboard-section">
            <h2>System Dashboard</h2>
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
    <AdminSystemLayout 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
    >
      {shouldShowFilters && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={globalFilters.timePeriod}
              onChange={(e) => handleFilterChange("timePeriod", e.target.value)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                backgroundColor: '#FFFFFF',
                fontWeight: 600,
                color: '#374151',
                cursor: 'pointer',
              }}
            >
              <option value="all">All Time</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>

            <select
              value={globalFilters.center}
              onChange={(e) => handleFilterChange("center", e.target.value)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                backgroundColor: '#FFFFFF',
                fontWeight: 600,
                color: '#374151',
                cursor: 'pointer',
              }}
            >
              <option value="all">All Centers</option>
              {centers.map((center) => (
                <option key={center.id} value={center.id}>
                  {center.name}
                </option>
              ))}
            </select>

            <select
              value={globalFilters.region}
              onChange={(e) => handleFilterChange("region", e.target.value)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: '1px solid #D1D5DB',
                backgroundColor: '#FFFFFF',
                fontWeight: 600,
                color: '#374151',
                cursor: 'pointer',
              }}
              className="region-select"
            >
              <option value="all">All Regions</option>
              {regions.map((region) => (
                <option key={region.id || region} value={region.id || region}>
                  {region.name || region}
                </option>
              ))}
            </select>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontWeight: 600, color: '#374151' }}>Date:</label>
              <input
                type="date"
                value={globalFilters.dateRange.start}
                onChange={(e) =>
                  handleDateRangeChange(e.target.value, globalFilters.dateRange.end)
                }
                style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #D1D5DB', fontWeight: 600, color: '#374151' }}
              />
              <span style={{ color: '#6b7280' }}>to</span>
              <input
                type="date"
                value={globalFilters.dateRange.end}
                onChange={(e) =>
                  handleDateRangeChange(globalFilters.dateRange.start, e.target.value)
                }
                style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #D1D5DB', fontWeight: 600, color: '#374151' }}
              />
            </div>
          </div>
        </div>
      )}
      {renderContent()}
    </AdminSystemLayout>
  );
}

export default AdminDashboard;
