import React from "react";
import { useAuth } from "../../context/AuthContext";

function AdminSidebar({ activeTab, onTabChange, isOpen }) {
  const { user } = useAuth();

  const menuItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "health", label: "Health Analytics" },
    { id: "regions", label: "Regions" },
    { id: "users", label: "Users" },
    { id: "centers", label: "Centers" },
    { id: "appointments", label: "Appointments" },
    { id: "vitals", label: "Health Data" },
    { id: "feedback", label: "Feedback" },
    { id: "audit", label: "Audit Logs" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <aside className={`admin-sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon">🏥</span>
          <span className="logo-text">MESOB Admin</span>
        </div>
        <div className="user-info">
          <p className="user-name">{user?.fullName}</p>
          <p className="user-role">System Admin</p>
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
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p className="version">v1.0.0</p>
      </div>
    </aside>
  );
}

export default AdminSidebar;
