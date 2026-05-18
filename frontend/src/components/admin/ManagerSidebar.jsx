import React from "react";
import { useAuth } from "../../context/AuthContext";
import { 
  LayoutDashboard, 
  BarChart3, 
  Users, 
  FileText, 
  Settings,
  TrendingUp,
  Building2
} from "lucide-react";

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
  const capacityColor = usedPct > 85 ? '#DC2626' : usedPct > 60 ? '#F59E0B' : '#16A34A';

  const menuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "users", label: "Staff", icon: Users, count: staffCount },
    { id: "audit", label: "Audit", icon: FileText },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className={`admin-sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img src="/Mesob-short-png.png" alt="MESOB" className="sidebar-logo-img" />
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-title">MESOB</span>
            <span className="sidebar-logo-subtitle">Manager Portal</span>
          </div>
        </div>
        {currentUser?.center?.name && (
          <div className="sidebar-center-badge">
            <Building2 size={14} />
            <span>{currentUser.center.name}</span>
          </div>
        )}
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
        {/* Capacity Indicator */}
        <div className="sidebar-capacity-widget">
          <div className="capacity-header">
            <TrendingUp size={16} />
            <span className="capacity-title">Daily Capacity</span>
          </div>
          <div className="capacity-stats">
            <div className="capacity-percentage" style={{ color: capacityColor }}>
              {usedPct}%
            </div>
            <div className="capacity-text">
              {capacityInfo?.slotsUsed || 0} / {capacityInfo?.dailyLimit || 100}
            </div>
          </div>
          <div className="capacity-bar">
            <div 
              className="capacity-bar-fill" 
              style={{ 
                width: `${Math.min(usedPct, 100)}%`,
                backgroundColor: capacityColor 
              }} 
            />
          </div>
        </div>

        <div className="sidebar-user-compact">
          <div className="sidebar-user-role">Center Manager</div>
          <div className="sidebar-user-name">{currentUser?.fullName}</div>
        </div>
        <div className="sidebar-version">v1.0.0</div>
      </div>
    </aside>
  );
}

export default ManagerSidebar;