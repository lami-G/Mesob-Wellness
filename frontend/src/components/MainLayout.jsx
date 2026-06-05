import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
// import "./layout.css";

// SVG icons — no emoji
const Icons = {
  dashboard: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
    </svg>
  ),
  appointments: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  health: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  ),
  wellness: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4"/>
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
  ),
  records: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  feedback: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  queue: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
      <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  ),
  vitals: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  walkin: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="1"/><path d="M9 20l1-5 2 2 1-5"/><path d="M6 9l2-2 4 2 2-2"/>
    </svg>
  ),
  history: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/>
      <path d="M12 7v5l4 2"/>
    </svg>
  ),
  manager: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
};

function MainLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [displayUser, setDisplayUser] = useState(user);
  const userMenuRef = useRef(null);

  const dashboardTab = new URLSearchParams(location.search).get("tab") || "appointments";
  const nurseTab     = new URLSearchParams(location.search).get("tab") || "queue";
  const isCustomerDashboard = location.pathname === "/dashboard";
  const isNurseDashboard    = location.pathname === "/nurse";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showUserMenu]);

  useEffect(() => { setShowUserMenu(false); }, [location.pathname, location.search]);
  useEffect(() => { setDisplayUser(user); }, [user]);

  const hasManagerAccess = () =>
    user && ["MANAGER", "REGIONAL_OFFICE", "SYSTEM_ADMIN"].includes(user.role);

  const handleLogout = () => { logout(); navigate("/login", { replace: true }); };

  const handleProfileClick = () => {
    setShowUserMenu(false);
    window.dispatchEvent(new CustomEvent("profileClicked"));
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  // Welcome bar title per route
  const getWelcomeTitle = () => {
    if (isNurseDashboard) return `Welcome, ${displayUser?.fullName || "Nurse"}`;
    return `Welcome, ${displayUser?.fullName || "Staff Member"}`;
  };

  const getWelcomeSub = () => {
    if (isNurseDashboard) return "Manage patient queue and vitals";
    return "Manage your health and appointments";
  };

  return (
    <div className="layout-shell">

      {/* ── HEADER (full width, fixed top) ── */}
      <header className="app-header">
        <div className="app-header-left">
          {/* Logo stays exactly as-is */}
          <img
            src="/Mesob-short-png.png"
            alt="MESOB Logo"
            className="mesob-logo-img"
          />
        </div>

        {/* Centered brand title */}
        <h1>MESOB</h1>

        <div className="app-header-right">
          <select className="language-selector">
            <option value="en">English</option>
            <option value="am">አማርኛ</option>
          </select>

          {user && (
            <div className="user-menu-header" ref={userMenuRef}>
              <button
                type="button"
                className="user-btn-header"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <span className="user-avatar-header">
                  {displayUser?.profilePicture ? (
                    <img src={displayUser.profilePicture} alt={displayUser?.fullName} className="avatar-img-header" />
                  ) : (
                    <span className="avatar-initials-header">{getInitials(displayUser?.fullName)}</span>
                  )}
                </span>
                <span className="dropdown-arrow-header">▼</span>
              </button>

              {showUserMenu && (
                <div className="user-dropdown-header">
                  <button className="dropdown-item-header" onClick={handleProfileClick}>
                    Profile
                  </button>
                  <hr className="dropdown-divider-header" />
                  <button className="dropdown-item-header logout-header" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* ── BODY (sidebar + main, sits BELOW header via padding-top) ── */}
      <div className="layout-body">

        {/* ── SIDEBAR ── */}
        <aside className="app-sidebar">
          {/* Logo Section - only show for nurse dashboard */}
          {isNurseDashboard && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "16px 14px",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                marginBottom: "8px",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "#f5a623",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "16px",
                  color: "#213D8D",
                  flexShrink: 0,
                }}
              >
                N
              </div>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: "14px",
                  color: "#ffffff",
                  letterSpacing: "0.04em",
                  whiteSpace: "nowrap",
                }}
              >
                NURSE
              </span>
            </div>
          )}

          <nav>
            {/* Nurse sub-nav - all items are siblings now */}
            {isNurseDashboard && (
              <div className="sidebar-subnav" aria-label="Nurse dashboard sections">
                <Link className={nurseTab === "dashboard" ? "active" : ""} to="/nurse?tab=dashboard">{Icons.dashboard} Dashboard</Link>
                <Link className={nurseTab === "queue"   ? "active" : ""} to="/nurse?tab=queue">   {Icons.queue}   Queue</Link>
                <Link className={nurseTab === "vitals"  ? "active" : ""} to="/nurse?tab=vitals">  {Icons.vitals}  Vitals</Link>
                <Link className={nurseTab === "walkin"  ? "active" : ""} to="/nurse?tab=walkin">  {Icons.walkin}  Walk-in</Link>
                <Link className={nurseTab === "wellness"? "active" : ""} to="/nurse?tab=wellness">{Icons.wellness} Wellness</Link>
                <Link className={nurseTab === "history" ? "active" : ""} to="/nurse?tab=history"> {Icons.history} History</Link>
              </div>
            )}

            {/* Customer Dashboard - keep as is */}
            {isCustomerDashboard && (
              <>
                <Link
                  className={location.pathname === "/dashboard" ? "active" : ""}
                  to="/dashboard"
                >
                  {Icons.dashboard} Dashboard
                </Link>
                <div className="sidebar-subnav" aria-label="Customer dashboard sections">
                  <Link
                    className={dashboardTab === "appointments" ? "active" : ""}
                    to="/dashboard?tab=appointments"
                  >
                    {Icons.appointments} Appointments
                  </Link>
                  <Link
                    className={dashboardTab === "health" ? "active" : ""}
                    to="/dashboard?tab=health"
                  >
                    {Icons.health} Health Journey
                  </Link>
                  <Link
                    className={dashboardTab === "wellness" ? "active" : ""}
                    to="/dashboard?tab=wellness"
                  >
                    {Icons.wellness} Wellness Plan
                  </Link>
                  <Link
                    className={dashboardTab === "records" ? "active" : ""}
                    to="/dashboard?tab=records"
                  >
                    {Icons.records} Health Records
                  </Link>
                  <Link
                    className={dashboardTab === "feedback" ? "active" : ""}
                    to="/dashboard?tab=feedback"
                  >
                    {Icons.feedback} Feedback
                  </Link>
                </div>
              </>
            )}

            {hasManagerAccess() && (
              <Link
                className={location.pathname === "/manager" ? "active" : ""}
                to="/manager"
              >
                {Icons.manager} Manager Dashboard
              </Link>
            )}
          </nav>
        </aside>

        {/* ── MAIN ── */}
        <main className="app-main">
          {/* Welcome bar — clean inline strip, no card */}
          <div className="welcome-bar">
            <div className="welcome-bar-left">
              <div className="welcome-bar-title">{getWelcomeTitle()}</div>
              <div className="welcome-bar-sub">{getWelcomeSub()}</div>
            </div>
            <div className="welcome-bar-right">
              {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </div>
          </div>

          {/* Page content */}
          <div className="app-main-content">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}

export default MainLayout;