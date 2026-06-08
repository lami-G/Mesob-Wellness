import React from "react";
import { useAuth } from "../../context/AuthContext";
import styles from "./RegionalSidebar.module.css";

function RegionalSidebar({ 
  activeTab, 
  onTabChange, 
  isOpen, 
  user, 
  centerStats, 
  centersCount = 0,
  selectedCenter,
  setSelectedCenter,
  centers = []
}) {
  const { user: authUser } = useAuth();
  const currentUser = user || authUser;

  const roleLabel = currentUser?.role === 'FEDERAL_OFFICE' ? 'Federal Office'
    : currentUser?.role === 'SYSTEM_ADMIN' ? 'System Admin'
    : 'Regional Office';

  const menuItems = [
    { id: "overview", label: "Overview" },
    { id: "centers", label: "Centers", count: centersCount },
    { id: "managers", label: "Managers" },
    { id: "performance", label: "Analytics" },
  ];

  return (
    <aside className={`admin-sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon">🌍</span>
          <span className="logo-text">MESOB Regional</span>
        </div>
        <div className="user-info">
          <p className="user-name">{currentUser?.fullName}</p>
          <p className="user-role">{roleLabel}</p>
          <div className={styles.statsRow}>
            <span>🏥</span>
            <span>{centerStats?.total || centersCount} Centers</span>
            <span className={styles.statsSeparator}>•</span>
            <span>👥 {centerStats?.totalStaff || 0} Staff</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? "active" : ""}`}
            onClick={() => onTabChange(item.id)}
            title={item.label}
          >
            <span className="nav-label">
              {item.label}
              {item.count !== undefined && (
                <span className={styles.navCount}>
                  {item.count}
                </span>
              )}
            </span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        {/* Center Statistics */}
        {centerStats && (
          <div className={styles.footerSystemStatus}>
            <div className={styles.statusTitle}>
              📊 System Status
            </div>
            <div className={styles.statusList}>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>Active Centers</span>
                <span className={`${styles.statusValue} ${styles.statusValueActive}`}>
                  {centerStats.active}/{centerStats.total}
                </span>
              </div>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>Total Capacity</span>
                <span className={`${styles.statusValue} ${styles.statusValueCapacity}`}>
                  {centerStats.totalCapacity}
                </span>
              </div>
              <div className={styles.progressBarContainer}>
                <div 
                  className={styles.progressBarFill}
                  style={{
                    width: `${Math.min((centerStats.active / centerStats.total) * 100, 100)}%`
                  }}
                />
              </div>
            </div>
          </div>
        )}

        <p className="version">Regional v1.0.0</p>
      </div>
    </aside>
  );
}

export default RegionalSidebar;