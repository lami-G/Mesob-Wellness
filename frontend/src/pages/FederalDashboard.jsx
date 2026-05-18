import React, { useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import "../styles/admin-layout.css";
import "../styles/admin-dashboard.css";

function FederalDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="dashboard-section">
            <h2>Federal Overview</h2>
            <p>Federal analytics and governance features will be shown here.</p>
          </div>
        );
      case "regions":
        return (
          <div className="dashboard-section">
            <h2>Region Management</h2>
            <p>Region creation, status, and filters will be available here.</p>
          </div>
        );
      case "analytics":
        return (
          <div className="dashboard-section">
            <h2>Federal Analytics</h2>
            <p>Nationwide trends and KPIs will be available here.</p>
          </div>
        );
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <AdminLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      dashboardType="federal"
    >
      {renderContent()}
    </AdminLayout>
  );
}

export default FederalDashboard;
