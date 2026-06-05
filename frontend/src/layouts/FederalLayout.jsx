import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/shared/Sidebar";
import { federalSidebarConfig } from "../config/sidebar";
import AdminHeader from "../components/admin/AdminHeader";
// All styles imported through main.jsx - no additional imports needed

function FederalLayout({
  children,
  activeTab,
  onTabChange,
  user,
  lastUpdated,
  error,
}) {
  const { user: authUser } = useAuth();
  const currentUser = user || authUser;
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="admin-layout">
      <Sidebar
        config={federalSidebarConfig}
        activeTab={activeTab}
        onTabChange={onTabChange}
        isOpen={sidebarOpen}
        extras={{ user: currentUser }}
      />

      <div className="admin-main">
        <AdminHeader
          user={currentUser}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onTabChange={onTabChange}
          title="MESOB Federal Portal"
          dashboardType="federal"
          lastUpdated={lastUpdated}
          activeTab={activeTab}
        />

        <main className="admin-content">
          {error && (
            <div className="alert alert-error" style={{ marginBottom: "1rem" }}>
              {error}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}

export default FederalLayout;
