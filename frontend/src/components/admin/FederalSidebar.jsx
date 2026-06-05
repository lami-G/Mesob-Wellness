import React from "react";
import { useAuth } from "../../context/AuthContext";

const NAV_ICONS = {
  overview: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  regions: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  centers: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  "admin-users": (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  appointments: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  feedback: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  audit: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
};

function FederalSidebar({ activeTab, onTabChange, isOpen }) {
  const { user } = useAuth();

  const menuItems = [
    { id: "overview",     label: "Overview"    },
    { id: "regions",      label: "Regions"     },
    { id: "centers",      label: "Centers"     },
    { id: "admin-users",  label: "Admin Users" },
    { id: "appointments", label: "Appointments"},
    { id: "feedback",     label: "Feedback"    },
    { id: "audit",        label: "Audit"       },
  ];

  const getInitials = (name) => {
    if (!name) return "FO";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <aside className={`admin-sidebar federal-sidebar ${isOpen ? "open" : "closed"}`}>

      {/* ── Logo ── */}
      <div className="sidebar-logo-section">
        <img
          src="/Mesob-short-png.png"
          alt="MESOB Logo"
          className="sidebar-logo-img"
        />
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-name">MESOB</span>
          <span className="sidebar-logo-tagline">Federal Portal</span>
        </div>
      </div>

      {/* ── User Card ── */}
      <div className="sidebar-user-card">
        <div className="sidebar-user-avatar">
          {user?.profilePicture ? (
            <img src={user.profilePicture} alt={user?.fullName} />
          ) : (
            <div className="sidebar-avatar-initials">{getInitials(user?.fullName)}</div>
          )}
        </div>
        <div className="sidebar-user-info">
          <p className="sidebar-user-name">{user?.fullName || "Federal Officer"}</p>
          <p className="sidebar-user-role">Federal Office</p>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? "active" : ""}`}
            onClick={() => onTabChange(item.id)}
            title={!isOpen ? item.label : undefined}
          >
            <span style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              marginRight: isOpen ? "0.625rem" : 0,
              opacity: activeTab === item.id ? 1 : 0.6,
            }}>
              {NAV_ICONS[item.id]}
            </span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* ── Version Footer ── */}
      <div className="sidebar-footer">
        <p className="version">v1.0.0</p>
      </div>
    </aside>
  );
}

export default FederalSidebar;
