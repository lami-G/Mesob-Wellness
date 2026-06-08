import React from "react";
import { useAuth } from "../../context/AuthContext";
import styles from "./ManagerSidebar.module.css";

function ManagerSidebar({ 
  activeTab, 
  onTabChange, 
  isOpen, 
  user, 
  capacityInfo, 
  staffCount = 0, 
  onRefresh, 
  loading 
}) {
  const { user: authUser } = useAuth();
  const currentUser = user || authUser;

  // Calculate capacity percentage for urgency indicator
  const usedPct = capacityInfo
    ? Math.round((capacityInfo.slotsUsed / (capacityInfo.dailyLimit || 1)) * 100)
    : 0;
  const capacityColor = usedPct > 85 ? '#ef4444' : usedPct > 60 ? '#f59e0b' : '#22c55e';

  const menuItems = [
    { id: "overview", label: "Overview" },
    { id: "analytics", label: "Analytics" },
    { id: "users", label: "Staff", count: staffCount },
    { id: "audit", label: "Audit" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <aside className={`admin-sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon">🏥</span>
          <span className="logo-text">MESOB Manager</span>
        </div>
        <div className="user-info">
          <p className="user-name">{currentUser?.fullName}</p>
          <p className="user-role">Center Manager</p>
          {currentUser?.center?.name && (
            <p className={`user-center ${styles.userCenter}`}>
              📍 {currentUser.center.name}
            </p>
          )}
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
        {/* Capacity Indicator */}
        <div className={styles.capacityContainer}>
          <div className={styles.capacityHeader}>
            <span className={styles.capacityIcon}>
              {usedPct > 85 ? '🔴' : usedPct > 60 ? '🟡' : '🟢'}
            </span>
            <span 
              className={styles.capacityLabel}
              style={{ color: capacityColor }}
            >
              Capacity {usedPct}%
            </span>
          </div>
          <div className={styles.capacityProgressBar}>
            <div 
              className={styles.capacityProgressFill}
              style={{
                width: `${Math.min(usedPct, 100)}%`,
                background: capacityColor
              }}
            />
          </div>
          <div className={styles.capacityInfo}>
            {capacityInfo?.slotsUsed || 0} of {capacityInfo?.dailyLimit || 100} slots
          </div>
        </div>

        {/* Refresh Button */}
        <div className={styles.refreshContainer}>
          <button
            onClick={onRefresh}
            disabled={loading}
            className={styles.refreshButton}
          >
            {loading ? '⏳ Updating...' : '🔄 Refresh Data'}
          </button>
        </div>

        <p className="version">Manager v1.0.0</p>
      </div>
    </aside>
  );
}

export default ManagerSidebar;