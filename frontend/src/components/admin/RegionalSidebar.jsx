import React from "react";
import { useAuth } from "../../context/AuthContext";
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  BarChart3,
  Globe
} from "lucide-react";

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
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "centers", label: "Centers", icon: Building2, count: centersCount },
    { id: "managers", label: "Managers", icon: Users },
    { id: "performance", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <aside className={`admin-sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img src="/Mesob-short-png.png" alt="MESOB" className="sidebar-logo-img" />
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-title">MESOB</span>
            <span className="sidebar-logo-subtitle">Regional Portal</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-title">Dashboard</div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-item ${activeTab === item.id ? "active" : ""}`}
                onClick={() => onTabChange(item.id)}
                title={item.label}
              >
                <Icon size={20} className="nav-icon" />
                <span className="nav-label">
                  {item.label}
                  {item.count !== undefined && (
                    <span className="nav-badge">{item.count}</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <div className="sidebar-footer">
        {/* Center Statistics */}
        {centerStats && (
          <div className="sidebar-stats-widget">
            <div className="stats-header">
              <Globe size={16} />
              <span className="stats-title">System Status</span>
            </div>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-label">Active Centers</div>
                <div className="stat-value" style={{ color: '#16A34A' }}>
                  {centerStats.active}/{centerStats.total}
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Total Capacity</div>
                <div className="stat-value" style={{ color: '#2347A6' }}>
                  {centerStats.totalCapacity}
                </div>
              </div>
            </div>
            <div className="stats-progress-bar">
              <div 
                className="stats-progress-fill" 
                style={{ 
                  width: `${Math.min((centerStats.active / centerStats.total) * 100, 100)}%` 
                }} 
              />
            </div>
          </div>
        )}

        <div className="sidebar-user-compact">
          <div className="sidebar-user-role">{roleLabel}</div>
          <div className="sidebar-user-name">{currentUser?.fullName}</div>
        </div>
        <div className="sidebar-version">v1.0.0</div>
      </div>
    </aside>
  );
}

export default RegionalSidebar;