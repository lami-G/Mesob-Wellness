import React from "react";
import { useAuth } from "../../context/AuthContext";

const Icons = {
  overview: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  analytics: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  users:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  audit:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  settings:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 1.64 13.45M4.93 4.93a10 10 0 0 0 0 14.14"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>,
};

function ManagerSidebar({ activeTab, onTabChange, isOpen, user, capacityInfo, staffCount = 0, onRefresh, loading }) {
  const { user: authUser } = useAuth();
  const currentUser = user || authUser;

  const usedPct = capacityInfo ? Math.round((capacityInfo.slotsUsed / (capacityInfo.dailyLimit || 1)) * 100) : 0;
  const capColor = usedPct > 85 ? '#ef4444' : usedPct > 60 ? '#f59e0b' : '#22c55e';

  const menuItems = [
    { id: "overview",  label: "Overview"  },
    { id: "analytics", label: "Analytics" },
    { id: "users",     label: "Staff",    count: staffCount },
    { id: "audit",     label: "Audit"     },
    { id: "settings",  label: "Settings"  },
  ];

  const initials = (name) => name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2) : "MG";

  return (
    <aside className={`admin-sidebar ${isOpen ? "open" : "closed"}`}>

      {/* Logo */}
      <div className="sidebar-logo-section">
        <img src="/Mesob-short-png.png" alt="MESOB Logo" className="sidebar-logo-img" />
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-name">MESOB</span>
          <span className="sidebar-logo-tagline">Manager Portal</span>
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
          <p className="sidebar-user-name">{currentUser?.fullName || "Manager"}</p>
          <p className="sidebar-user-role">{currentUser?.center?.name || "Center Manager"}</p>
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

      {/* Footer — capacity + refresh */}
      <div className="sidebar-footer" style={{ flexDirection:"column", gap:"0.75rem", padding:"0.875rem 1rem", borderTop:"1px solid #e8edf5" }}>
        {/* Capacity bar */}
        <div style={{ width:"100%" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.375rem" }}>
            <span style={{ fontSize:"0.75rem", fontWeight:600, color:"#64748b" }}>Capacity</span>
            <span style={{ fontSize:"0.75rem", fontWeight:700, color: capColor }}>{usedPct}%</span>
          </div>
          <div style={{ width:"100%", height:"5px", background:"#e2e8f0", borderRadius:"3px", overflow:"hidden" }}>
            <div style={{ width:`${Math.min(usedPct,100)}%`, height:"100%", background: capColor, borderRadius:"3px", transition:"width 0.3s ease" }} />
          </div>
          <p style={{ fontSize:"0.7rem", color:"#94a3b8", margin:"0.25rem 0 0" }}>
            {capacityInfo?.slotsUsed || 0} / {capacityInfo?.dailyLimit || 100} slots
          </p>
        </div>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={loading}
          style={{
            width:"100%", background:"#f1f5f9", border:"1px solid #e2e8f0", borderRadius:"8px",
            padding:"0.5rem", color:"#475569", fontSize:"0.8125rem", fontWeight:600,
            cursor: loading ? "not-allowed" : "pointer", fontFamily:"inherit",
            display:"flex", alignItems:"center", justifyContent:"center", gap:"0.375rem",
            transition:"background 150ms ease",
          }}
          onMouseEnter={e => { if(!loading) e.currentTarget.style.background="#e2e8f0"; }}
          onMouseLeave={e => { e.currentTarget.style.background="#f1f5f9"; }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: loading ? 0.5 : 1 }}>
            <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          {loading ? "Updating…" : "Refresh"}
        </button>

        <p className="version">v1.0.0</p>
      </div>
    </aside>
  );
}

export default ManagerSidebar;
