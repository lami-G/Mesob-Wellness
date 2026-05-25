import React from "react";
import { useAuth } from "../../context/AuthContext";

function FederalSidebar({ activeTab, onTabChange, isOpen }) {
  const { user } = useAuth();

  const menuItems = [
    { id: "overview", label: "Overview" },
    { id: "regions", label: "Regions" },
    { id: "analytics", label: "Analytics" },
    { id: "users", label: "Users" },
    { id: "centers", label: "Centers" },
    { id: "appointments", label: "Appointments" },
    { id: "feedback", label: "Feedback" },
    { id: "audit", label: "Audit" },
  ];

  return (
    <aside className={`admin-sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon">🏛️</span>
          <span className="logo-text">MESOB Federal</span>
        </div>
        <div className="user-info">
          <p className="user-name">{user?.fullName}</p>
          <p className="user-role">Federal Office</p>
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

export default FederalSidebar;
