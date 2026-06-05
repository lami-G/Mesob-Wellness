import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/shared/Sidebar";
import { managerSidebarConfig } from "../config/sidebar";
import AdminHeader from "../components/admin/AdminHeader";
// All styles imported through main.jsx - no additional imports needed

function ManagerLayout({
  children,
  activeTab,
  onTabChange,
  user,
  capacityInfo,
  staffCount,
  onRefresh,
  loading,
  lastUpdated,
  error,
}) {
  const { user: authUser } = useAuth();
  const currentUser = user || authUser;
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="admin-layout">
      <Sidebar
        config={managerSidebarConfig}
        activeTab={activeTab}
        onTabChange={onTabChange}
        isOpen={sidebarOpen}
        extras={{
          user: currentUser,
          capacityInfo,
          staffCount,
          onRefresh,
          loading
        }}
      />

      <div className="admin-main">
        <AdminHeader
          user={currentUser}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onTabChange={onTabChange}
          title="MESOB Manager Portal"
          dashboardType="manager"
          onRefresh={onRefresh}
          loading={loading}
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

export default ManagerLayout;
