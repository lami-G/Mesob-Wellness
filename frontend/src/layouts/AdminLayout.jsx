import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import AdminSidebar from "../components/admin/AdminSidebar";
import ManagerSidebar from "../components/admin/ManagerSidebar";
import RegionalSidebar from "../components/admin/RegionalSidebar";
import FederalSidebar from "../components/admin/FederalSidebar";
import AdminHeader from "../components/admin/AdminHeader";
import "../styles/admin-layout.css";

function AdminLayout({
  children,
  activeTab,
  onTabChange,
  dashboardType = "admin",
  user,
  capacityInfo,
  staffCount,
  centerStats,
  centersCount,
  onRefresh,
  loading,
  lastUpdated,
  error,
  selectedCenter,
  setSelectedCenter,
  centers,
}) {
  const { user: authUser } = useAuth();
  const currentUser = user || authUser;
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const renderSidebar = () => {
    const commonProps = {
      activeTab,
      onTabChange,
      isOpen: sidebarOpen,
      user: currentUser,
    };

    switch (dashboardType) {
      case "manager":
        return (
          <ManagerSidebar
            {...commonProps}
            capacityInfo={capacityInfo}
            staffCount={staffCount}
            onRefresh={onRefresh}
            loading={loading}
          />
        );
      case "regional":
        return (
          <RegionalSidebar
            {...commonProps}
            centerStats={centerStats}
            centersCount={centersCount}
            selectedCenter={selectedCenter}
            setSelectedCenter={setSelectedCenter}
            centers={centers}
          />
        );
      case "federal":
        return <FederalSidebar {...commonProps} />;
      default:
        return <AdminSidebar {...commonProps} />;
    }
  };

  const getHeaderTitle = () => {
    switch (dashboardType) {
      case "manager":
        return "MESOB Manager Portal";
      case "regional":
        return "MESOB Regional Portal";
      case "federal":
        return "MESOB";
      default:
        return "MESOB Admin Portal";
    }
  };

  /* ── Federal and Admin layouts use the nurse-dashboard pattern ── */
  if (dashboardType === "federal" || dashboardType === "admin") {
    const dashboardLabel = dashboardType === "federal" ? "Federal Officer" : "System Admin";
    const dashboardSubtitle = dashboardType === "federal" 
      ? "System-wide overview and administration"
      : "System-wide management and configuration";

    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          overflow: "hidden",
          background: "#f1f5f9",
          flexDirection: "column",
        }}
      >
        {/* Top global header (matches nurse's MESOB + user widget) */}
        <header
          style={{
            padding: "0 2rem",
            background: "#213D8D",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "80px",
            minHeight: "80px",
            flexShrink: 0,
          }}
        >
          {/* Left - MESOB Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <img
              src="/Mesob-short-png.png"
              alt="MESOB Logo"
              style={{
                width: "50px",
                height: "50px",
                objectFit: "contain",
                flexShrink: 0,
              }}
            />
          </div>

          {/* Center - MESOB Brand Title */}
          <h1
            style={{
              margin: 0,
              fontFamily: "Sora, Manrope, sans-serif",
              fontSize: "1.75rem",
              color: "#ffffff",
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            MESOB
          </h1>

          {/* Right - Language + Notifications + User */}
          <AdminHeader
            user={currentUser}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            onTabChange={onTabChange}
            title={getHeaderTitle()}
            dashboardType={dashboardType}
            onRefresh={onRefresh}
            loading={loading}
            lastUpdated={lastUpdated}
            selectedCenter={selectedCenter}
            setSelectedCenter={setSelectedCenter}
            centers={centers}
            activeTab={activeTab}
          />
        </header>

        {/* Body: sidebar + main */}
        <div
          style={{
            display: "flex",
            flex: 1,
            overflow: "hidden",
          }}
        >
          {/* Sidebar */}
          {dashboardType === "federal" ? (
            <FederalSidebar
              activeTab={activeTab}
              onTabChange={onTabChange}
              isOpen={sidebarOpen}
              user={currentUser}
            />
          ) : (
            <AdminSidebar
              activeTab={activeTab}
              onTabChange={onTabChange}
              isOpen={sidebarOpen}
              user={currentUser}
            />
          )}

          {/* Main content area */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              minHeight: 0,
            }}
          >
            {/* Slim welcome bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 20px",
                background: "#ffffff",
                borderBottom: "1px solid #e2e8f0",
                flexShrink: 0,
              }}
            >
              <div>
                <h2
                  style={{
                    margin: "0 0 2px",
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "#213D8D",
                  }}
                >
                  Welcome, {currentUser?.fullName || dashboardLabel}
                </h2>
                <p style={{ margin: 0, fontSize: "11px", color: "#6b7a99" }}>
                  {dashboardSubtitle}
                </p>
              </div>
              <span
                style={{
                  fontSize: "11px",
                  color: "#6b7a99",
                  background: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  whiteSpace: "nowrap",
                }}
              >
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>

            {/* Scrollable content */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "16px 18px",
              }}
            >
              {error && (
                <div
                  className="alert alert-error"
                  style={{ marginBottom: "1rem" }}
                >
                  {error}
                </div>
              )}
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── All other dashboard types keep the original layout ── */
  return (
    <div className="admin-layout">
      {renderSidebar()}

      <div className="admin-main">
        <AdminHeader
          user={currentUser}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onTabChange={onTabChange}
          title={getHeaderTitle()}
          dashboardType={dashboardType}
          onRefresh={onRefresh}
          loading={loading}
          lastUpdated={lastUpdated}
          selectedCenter={selectedCenter}
          setSelectedCenter={setSelectedCenter}
          centers={centers}
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

export default AdminLayout;