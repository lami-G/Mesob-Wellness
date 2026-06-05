import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  LayoutDashboard, 
  Activity, 
  Heart, 
  FileText, 
  MessageSquare,
  Users,
  ClipboardList,
  Stethoscope,
  UserPlus,
  Clock,
  Bell,
  ChevronDown,
  User,
  LogOut,
  Globe
} from "lucide-react";

function MainLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [displayUser, setDisplayUser] = useState(user);
  const [announcement, setAnnouncement] = useState("");
  const userMenuRef = useRef(null);
  const dashboardTab =
    new URLSearchParams(location.search).get("tab") || "appointments";
  const nurseTab = new URLSearchParams(location.search).get("tab") || "queue";
  const isCustomerDashboard = location.pathname === "/dashboard";
  const isNurseDashboard = location.pathname === "/nurse";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showUserMenu]);

  // Close dropdown when location changes
  useEffect(() => {
    setShowUserMenu(false);
  }, [location.pathname, location.search]);

  // Update displayUser when user changes and log it
  useEffect(() => {
    console.log("Auth user after update:", user);
    setDisplayUser(user);
  }, [user]);

  // Announce route changes to screen readers
  useEffect(() => {
    const pathName = location.pathname.split('/').pop() || 'home';
    const formattedPath = pathName.charAt(0).toUpperCase() + pathName.slice(1).replace(/-/g, ' ');
    setAnnouncement(`Navigated to ${formattedPath} page`);
    
    // Clear announcement after it's been read
    const timer = setTimeout(() => setAnnouncement(""), 1000);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Check if user has manager access
  const hasManagerAccess = () => {
    return (
      user &&
      ["MANAGER", "REGIONAL_OFFICE", "SYSTEM_ADMIN"].includes(user.role)
    );
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleProfileClick = () => {
    setShowUserMenu(false);
    // Emit a custom event that the dashboard can listen to
    window.dispatchEvent(new CustomEvent('profileClicked'));
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase();
  };

  return (
    <div className="layout-shell">
      {/* Skip Navigation Links for Accessibility */}
      <a 
        href="#main-content" 
        className="skip-link"
        style={{
          position: 'absolute',
          left: '-9999px',
          zIndex: 9999,
          padding: '1rem',
          backgroundColor: '#2347A6',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '0.25rem',
        }}
        onFocus={(e) => {
          e.target.style.left = '1rem';
          e.target.style.top = '1rem';
        }}
        onBlur={(e) => {
          e.target.style.left = '-9999px';
        }}
      >
        Skip to main content
      </a>
      <a 
        href="#navigation" 
        className="skip-link"
        style={{
          position: 'absolute',
          left: '-9999px',
          zIndex: 9999,
          padding: '1rem',
          backgroundColor: '#2347A6',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '0.25rem',
        }}
        onFocus={(e) => {
          e.target.style.left = '1rem';
          e.target.style.top = '4rem';
        }}
        onBlur={(e) => {
          e.target.style.left = '-9999px';
        }}
      >
        Skip to navigation
      </a>

      {/* Screen Reader Announcements */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

      <header className="app-header" role="banner">
        <div className="app-header-left">
          <img
            src="/Mesob-short-png.png"
            alt="MESOB Logo"
            className="mesob-logo-img"
          />
          <div className="app-header-title">
            <h1 className="app-header-main-title">MESOB Wellness System</h1>
            <p className="app-header-subtitle">Federal Democratic Republic of Ethiopia</p>
          </div>
        </div>
        
        <div className="app-header-right">
          <button 
            className="notification-btn-modern" 
            title="Notifications"
            aria-label="View notifications"
          >
            <Bell size={20} aria-hidden="true" />
          </button>
          
          <div className="language-selector-modern">
            <Globe size={18} aria-hidden="true" />
            <select 
              className="language-select"
              aria-label="Select language"
            >
              <option value="en">EN</option>
              <option value="am">አማ</option>
            </select>
          </div>
          
          {user && (
            <div className="user-menu-header" ref={userMenuRef}>
              <button
                type="button"
                className="user-btn-header"
                onClick={() => setShowUserMenu(!showUserMenu)}
                aria-label={`User menu for ${displayUser?.fullName || 'user'}`}
                aria-expanded={showUserMenu}
                aria-haspopup="true"
              >
                <div className="user-avatar-header">
                  {displayUser?.profilePicture ? (
                    <img src={displayUser.profilePicture} alt="" className="avatar-img-header" />
                  ) : (
                    <div className="avatar-initials-header" aria-hidden="true">
                      {getInitials(displayUser?.fullName)}
                    </div>
                  )}
                </div>
                <ChevronDown size={16} className="dropdown-arrow-header" aria-hidden="true" />
              </button>

              {showUserMenu && (
                <div 
                  className="user-dropdown-header"
                  role="menu"
                  aria-label="User menu"
                >
                  <button 
                    className="dropdown-item-header"
                    onClick={handleProfileClick}
                    role="menuitem"
                  >
                    <User size={16} aria-hidden="true" />
                    <span>Profile</span>
                  </button>
                  <hr className="dropdown-divider-header" role="separator" />
                  <button 
                    className="dropdown-item-header logout-header"
                    onClick={handleLogout}
                    role="menuitem"
                  >
                    <LogOut size={16} aria-hidden="true" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="layout-body">
        <aside className="app-sidebar" role="complementary" id="navigation">
          <nav className="sidebar-nav-main" aria-label="Main navigation">
            {location.pathname === "/nurse" ? (
              <Link className="sidebar-link active" to="/nurse">
                <Stethoscope size={20} />
                <span>Nurse Dashboard</span>
              </Link>
            ) : (
              <Link
                className={`sidebar-link ${location.pathname === "/dashboard" ? "active" : ""}`}
                to="/dashboard"
              >
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </Link>
            )}

            {isCustomerDashboard && (
              <div className="sidebar-subnav">
                <Link
                  className={`sidebar-sublink ${dashboardTab === "appointments" ? "active" : ""}`}
                  to="/dashboard?tab=appointments"
                >
                  <ClipboardList size={18} />
                  <span>Appointments</span>
                </Link>
                <Link
                  className={`sidebar-sublink ${dashboardTab === "health" ? "active" : ""}`}
                  to="/dashboard?tab=health"
                >
                  <Activity size={18} />
                  <span>Health Journey</span>
                </Link>
                <Link
                  className={`sidebar-sublink ${dashboardTab === "wellness" ? "active" : ""}`}
                  to="/dashboard?tab=wellness"
                >
                  <Heart size={18} />
                  <span>Wellness Plan</span>
                </Link>
                <Link
                  className={`sidebar-sublink ${dashboardTab === "records" ? "active" : ""}`}
                  to="/dashboard?tab=records"
                >
                  <FileText size={18} />
                  <span>Health Records</span>
                </Link>
                <Link
                  className={`sidebar-sublink ${dashboardTab === "feedback" ? "active" : ""}`}
                  to="/dashboard?tab=feedback"
                >
                  <MessageSquare size={18} />
                  <span>Feedback</span>
                </Link>
              </div>
            )}

            {isNurseDashboard && (
              <div className="sidebar-subnav">
                <Link
                  className={`sidebar-sublink ${nurseTab === "queue" ? "active" : ""}`}
                  to="/nurse?tab=queue"
                >
                  <Users size={18} />
                  <span>Queue</span>
                </Link>
                <Link
                  className={`sidebar-sublink ${nurseTab === "vitals" ? "active" : ""}`}
                  to="/nurse?tab=vitals"
                >
                  <Activity size={18} />
                  <span>Vitals</span>
                </Link>
                <Link
                  className={`sidebar-sublink ${nurseTab === "walkin" ? "active" : ""}`}
                  to="/nurse?tab=walkin"
                >
                  <UserPlus size={18} />
                  <span>Walk-in</span>
                </Link>
                <Link
                  className={`sidebar-sublink ${nurseTab === "wellness" ? "active" : ""}`}
                  to="/nurse?tab=wellness"
                >
                  <Heart size={18} />
                  <span>Wellness</span>
                </Link>
                <Link
                  className={`sidebar-sublink ${nurseTab === "history" ? "active" : ""}`}
                  to="/nurse?tab=history"
                >
                  <Clock size={18} />
                  <span>History</span>
                </Link>
              </div>
            )}

            {hasManagerAccess() && (
              <Link
                className={`sidebar-link ${location.pathname === "/manager" ? "active" : ""}`}
                to="/manager"
              >
                <Users size={20} />
                <span>Manager Dashboard</span>
              </Link>
            )}
          </nav>
          
          <div className="sidebar-footer">
            <div className="sidebar-user-info">
              <p className="sidebar-user-role">{user?.role?.replace(/_/g, ' ')}</p>
            </div>
            <p className="sidebar-version">v1.0.0</p>
          </div>
        </aside>

        <main className="app-main" id="main-content" role="main" tabIndex="-1">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
