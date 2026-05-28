import React from "react";
import { useAuth } from "../../context/AuthContext";

function FederalSidebar({ activeTab, onTabChange, isOpen }) {
  const { user } = useAuth();

  const menuItems = [
    { id: "overview", label: "Overview" },
    { id: "regions", label: "Regions" },
    { id: "centers", label: "Centers" },
    { id: "admin-users", label: "Admin Users" },
    { id: "appointments", label: "Appointments" },
    { id: "feedback", label: "Feedback" },
    { id: "audit", label: "Audit" },
  ];

  return (
    <aside className={`admin-sidebar federal-sidebar ${isOpen ? "open" : "closed"}`}>
      {/* Logo Section */}
      <div className="sidebar-logo-section">
        <div className="sidebar-logo-icon">📋</div>
        <span className="sidebar-logo-text">MESOB Federal</span>
      </div>

      {/* Navigation Menu */}
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

      {/* Version Footer */}
      <div className="sidebar-footer">
        <p className="version">v1.0.0</p>
      </div>
    </aside>
  );
}

export default FederalSidebar;
