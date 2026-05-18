import React from "react";
import { useAuth } from "../../context/AuthContext";
import { 
  LayoutDashboard, 
  Activity, 
  MapPin, 
  Users, 
  Building2, 
  Calendar, 
  Heart, 
  MessageSquare, 
  FileText, 
  Settings 
} from "lucide-react";

function AdminSidebar({ activeTab, onTabChange, isOpen }) {
  const { user } = useAuth();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "health", label: "Health Analytics", icon: Activity },
    { id: "regions", label: "Regions", icon: MapPin },
    { id: "users", label: "Users", icon: Users },
    { id: "centers", label: "Centers", icon: Building2 },
    { id: "appointments", label: "Appointments", icon: Calendar },
    { id: "vitals", label: "Health Data", icon: Heart },
    { id: "feedback", label: "Feedback", icon: MessageSquare },
    { id: "audit", label: "Audit Logs", icon: FileText },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className={`admin-sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img src="/Mesob-short-png.png" alt="MESOB" className="sidebar-logo-img" />
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-title">MESOB</span>
            <span className="sidebar-logo-subtitle">Admin Portal</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-title">Main</div>
          {menuItems.slice(0, 2).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-item ${activeTab === item.id ? "active" : ""}`}
                onClick={() => onTabChange(item.id)}
                title={item.label}
              >
                <Icon size={20} className="nav-icon" />
                <span className="nav-label">{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="nav-section">
          <div className="nav-section-title">Management</div>
          {menuItems.slice(2, 9).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-item ${activeTab === item.id ? "active" : ""}`}
                onClick={() => onTabChange(item.id)}
                title={item.label}
              >
                <Icon size={20} className="nav-icon" />
                <span className="nav-label">{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="nav-section">
          <div className="nav-section-title">System</div>
          {menuItems.slice(9).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-item ${activeTab === item.id ? "active" : ""}`}
                onClick={() => onTabChange(item.id)}
                title={item.label}
              >
                <Icon size={20} className="nav-icon" />
                <span className="nav-label">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user-compact">
          <div className="sidebar-user-role">System Administrator</div>
          <div className="sidebar-user-name">{user?.fullName}</div>
        </div>
        <div className="sidebar-version">v1.0.0</div>
      </div>
    </aside>
  );
}

export default AdminSidebar;
