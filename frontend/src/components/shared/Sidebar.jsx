import React from "react";
import { useAuth } from "../../context/AuthContext";

/**
 * Unified Sidebar Component
 * Replaces: AdminSidebar, FederalSidebar, ManagerSidebar, RegionalSidebar
 */
function Sidebar({ 
  config, 
  activeTab, 
  onTabChange, 
  isOpen,
  extras = {}
}) {
  const { user } = useAuth();
  const currentUser = extras.user || user;

  // Extract extras for specific dashboard types
  const { 
    capacityInfo, 
    staffCount = 0, 
    centerStats, 
    centersCount = 0,
    onRefresh,
    loading 
  } = extras;

  // Capacity calculations for Manager dashboard
  const usedPct = capacityInfo 
    ? Math.round((capacityInfo.slotsUsed / (capacityInfo.dailyLimit || 1)) * 100) 
    : 0;
  const capColor = usedPct > 85 ? '#ef4444' : usedPct > 60 ? '#f59e0b' : '#22c55e';

  return (
    <aside className={`admin-sidebar ${config.type === 'federal' ? 'federal-sidebar' : ''} ${isOpen ? "open" : "closed"}`}>
      
      {/* ── Logo Block - Horizontal Layout ── */}
      <div className="sidebar-logo-section">
        <div className="sidebar-logo-emblem">
          <img
            src={config.logo.src}
            alt={config.logo.alt}
          />
        </div>
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-name">{config.logo.title}</span>
          <span className="sidebar-logo-tagline">{config.logo.subtitle}</span>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="sidebar-nav">
        {config.sections.map((section, sectionIdx) => (
          <React.Fragment key={sectionIdx}>
            {section.divider && <hr className="nav-divider" />}
            {section.label && <div className="nav-section-label">{section.label}</div>}
            {section.items.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${activeTab === item.id ? "active" : ""}`}
                onClick={() => onTabChange(item.id)}
                title={!isOpen ? item.label : undefined}
              >
                {item.icon}
                <span className="nav-label">
                  {item.label}
                  {item.showCount && item.id === 'users' && staffCount > 0 && (
                    <span className="nav-badge">{staffCount}</span>
                  )}
                  {item.showCount && item.id === 'centers' && centersCount > 0 && (
                    <span className="nav-badge">{centersCount}</span>
                  )}
                </span>
              </button>
            ))}
          </React.Fragment>
        ))}
      </nav>

      {/* ── Footer ── */}
      <div className="sidebar-footer">
        {/* Footer navigation items */}
        {config.footer.items.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? "active" : ""}`}
            onClick={() => onTabChange(item.id)}
            title={!isOpen ? item.label : undefined}
          >
            {item.icon}
            <span className="nav-label">{item.label}</span>
          </button>
        ))}

        {/* Manager: Capacity Widget */}
        {config.footer.showCapacity && capacityInfo && (
          <div style={{ width:"100%", padding: "0 0.5rem" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.375rem" }}>
              <span style={{ fontSize:"9px", fontWeight:600, color:"rgba(214,232,251,0.5)", textTransform:"uppercase", letterSpacing:"0.05em" }}>Capacity</span>
              <span style={{ fontSize:"10px", fontWeight:700, color: capColor }}>{usedPct}%</span>
            </div>
            <div style={{ width:"100%", height:"4px", background:"rgba(214,232,251,0.15)", borderRadius:"2px", overflow:"hidden" }}>
              <div style={{ width:`${Math.min(usedPct,100)}%`, height:"100%", background: capColor, borderRadius:"2px", transition:"width 0.3s ease" }} />
            </div>
            <p style={{ fontSize:"9px", color:"rgba(214,232,251,0.3)", margin:"0.25rem 0 0", textAlign:"center" }}>
              {capacityInfo.slotsUsed || 0} / {capacityInfo.dailyLimit || 100} slots
            </p>
          </div>
        )}

        {/* Manager: Refresh Button */}
        {config.footer.showRefresh && onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            style={{
              width:"calc(100% - 1rem)", background:"rgba(214,232,251,0.08)", border:"1px solid rgba(214,232,251,0.12)", borderRadius:"8px",
              padding:"0.5rem", color:"rgba(214,232,251,0.7)", fontSize:"11px", fontWeight:600,
              cursor: loading ? "not-allowed" : "pointer", fontFamily:"inherit",
              display:"flex", alignItems:"center", justifyContent:"center", gap:"0.375rem",
              transition:"all 150ms ease",
            }}
            onMouseEnter={e => { if(!loading) { e.currentTarget.style.background="rgba(214,232,251,0.15)"; e.currentTarget.style.color="rgba(214,232,251,0.95)"; } }}
            onMouseLeave={e => { e.currentTarget.style.background="rgba(214,232,251,0.08)"; e.currentTarget.style.color="rgba(214,232,251,0.7)"; }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: loading ? 0.5 : 1 }}>
              <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            {loading ? "Updating…" : "Refresh"}
          </button>
        )}

        {/* Regional: Center Stats */}
        {config.footer.showCenterStats && centerStats && (
          <div style={{ width:"100%", padding: "0 0.5rem" }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"0.375rem" }}>
              <span style={{ fontSize:"9px", fontWeight:600, color:"rgba(214,232,251,0.5)", textTransform:"uppercase", letterSpacing:"0.05em" }}>Active Centers</span>
              <span style={{ fontSize:"10px", fontWeight:700, color:"#4ade80" }}>{centerStats.active}/{centerStats.total}</span>
            </div>
            <div style={{ width:"100%", height:"4px", background:"rgba(214,232,251,0.15)", borderRadius:"2px", overflow:"hidden" }}>
              <div style={{ width:`${Math.min((centerStats.active/centerStats.total)*100,100)}%`, height:"100%", background:"#4ade80", borderRadius:"2px" }} />
            </div>
          </div>
        )}

        {/* Version */}
        <p className="version">{config.footer.version}</p>
      </div>
    </aside>
  );
}

export default Sidebar;
