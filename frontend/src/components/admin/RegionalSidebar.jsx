import React from "react";
import { useAuth } from "../../context/AuthContext";

const Icons = {
  overview:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  centers:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  managers:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  performance: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
};

function RegionalSidebar({ activeTab, onTabChange, isOpen, user, centerStats, centersCount = 0 }) {
  const { user: authUser } = useAuth();
  const currentUser = user || authUser;

  const roleLabel = currentUser?.role === 'FEDERAL_OFFICE' ? 'Federal Office'
    : currentUser?.role === 'SYSTEM_ADMIN' ? 'System Admin'
    : 'Regional Office';

  const menuItems = [
    { id: "overview",     label: "Overview"             },
    { id: "centers",      label: "Centers", count: centersCount },
    { id: "managers",     label: "Managers"             },
    { id: "performance",  label: "Analytics"            },
  ];

  const initials = (name) => name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2) : "RO";

  return (
    <aside className={`admin-sidebar ${isOpen ? "open" : "closed"}`}>

      {/* Logo */}
      <div className="sidebar-logo-section">
        <img src="/Mesob-short-png.png" alt="MESOB Logo" className="sidebar-logo-img" />
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-name">MESOB</span>
          <span className="sidebar-logo-tagline">Regional Portal</span>
        </div>
      </div>

      {/* User card */}
      <div className="sidebar-user-card">
        <div className="sidebar-user-avatar">
          {currentUser?.profilePicture
            ? <img src={currentUser.profilePicture} alt={currentUser?.fullName} />
            : <div className="sidebar-avatar-initials">{initials(currentUser?.fullName)}</div>}
        </div>
        <div className="sidebar-user-info">
          <p className="sidebar-user-name">{currentUser?.fullName || "Regional Officer"}</p>
          <p className="sidebar-user-role">{roleLabel}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? "active" : ""}`}
            onClick={() => onTabChange(item.id)}
            title={!isOpen ? item.label : undefined}
          >
            <span style={{ display:"flex", alignItems:"center", flexShrink:0, marginRight: isOpen ? "0.625rem" : 0, opacity: activeTab===item.id ? 1 : 0.6 }}>
              {Icons[item.id]}
            </span>
            <span className="nav-label">
              {item.label}
              {item.count > 0 && (
                <span style={{ marginLeft:"0.5rem", background:"rgba(30,75,168,0.12)", color:"#1e4ba8", borderRadius:"12px", padding:"0.1rem 0.45rem", fontSize:"0.72rem", fontWeight:700 }}>
                  {item.count}
                </span>
              )}
            </span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer" style={{ flexDirection:"column", gap:"0.5rem", padding:"0.875rem 1rem", borderTop:"1px solid #e8edf5", alignItems:"flex-start" }}>
        {centerStats && (
          <div style={{ width:"100%" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"0.375rem" }}>
              <span style={{ fontSize:"0.75rem", fontWeight:600, color:"#64748b" }}>Active Centers</span>
              <span style={{ fontSize:"0.75rem", fontWeight:700, color:"#22c55e" }}>{centerStats.active}/{centerStats.total}</span>
            </div>
            <div style={{ width:"100%", height:"4px", background:"#e2e8f0", borderRadius:"2px", overflow:"hidden" }}>
              <div style={{ width:`${Math.min((centerStats.active/centerStats.total)*100,100)}%`, height:"100%", background:"#22c55e", borderRadius:"2px" }} />
            </div>
          </div>
        )}
        <p className="version">v1.0.0</p>
      </div>
    </aside>
  );
}

export default RegionalSidebar;
