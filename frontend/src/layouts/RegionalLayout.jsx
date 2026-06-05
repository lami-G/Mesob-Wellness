import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/shared/Sidebar";
import { regionalSidebarConfig } from "../config/sidebar";
import AdminHeader from "../components/admin/AdminHeader";
// All styles imported through main.jsx - no additional imports needed

function RegionalLayout({
  children,
  activeTab,
  onTabChange,
  user,
  centerStats,
  centersCount,
  selectedCenter,
  setSelectedCenter,
  centers,
  lastUpdated,
  error,
}) {
  const { user: authUser } = useAuth();
  const currentUser = user || authUser;
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="admin-layout">
      <Sidebar
        config={regionalSidebarConfig}
        activeTab={activeTab}
        onTabChange={onTabChange}
        isOpen={sidebarOpen}
        extras={{
          user: currentUser,
          centerStats,
          centersCount
        }}
      />

      <div className="admin-main">
        <AdminHeader
          user={currentUser}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onTabChange={onTabChange}
          title="MESOB Regional Portal"
          dashboardType="regional"
          selectedCenter={selectedCenter}
          setSelectedCenter={setSelectedCenter}
          centers={centers}
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

export default RegionalLayout;
