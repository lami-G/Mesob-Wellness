import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { notificationService } from "../../services/notificationService";
import NotificationPanel from "./NotificationPanel";

function AdminHeader({ 
  onToggleSidebar, 
  onTabChange, 
  title = "MESOB Wellness System",
  dashboardType = "admin",
  onRefresh,
  loading,
  lastUpdated,
  selectedCenter,
  setSelectedCenter,
  centers = [],
  activeTab
}) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCenterFilter, setShowCenterFilter] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const handleNotificationClick = () => {
    setShowNotifications(true);
    if (unreadCount > 0) {
      notificationService.markAllAsRead().then(() => {
        setUnreadCount(0);
      });
    }
  };

  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleProfileClick = () => {
    setShowUserMenu(false);
    onTabChange("profile");
  };

  const handleSettingsClick = () => {
    setShowUserMenu(false);
    onTabChange("settings");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getInitials = (name) => {
    if (!name) return "SA";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase();
  };

  const getHeaderActions = () => {
    if (dashboardType === "manager" || dashboardType === "regional") {
      return (
        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'flex-end',
            color: 'white'
          }}>
            <div style={{ 
              fontSize: '0.95rem', 
              fontWeight: 700,
              letterSpacing: '0.02em'
            }}>
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
          </div>

          {lastUpdated && (
            <div style={{ 
              fontSize: '0.75rem', 
              color: 'rgba(255,255,255,0.7)',
              textAlign: 'right'
            }}>
              <div>Last Updated</div>
              <div style={{ fontWeight: 600, marginTop: '0.125rem' }}>
                {lastUpdated.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          )}

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.background = 'rgba(255,255,255,0.25)';
                  e.target.style.borderColor = 'rgba(255,255,255,0.5)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.15)';
                e.target.style.borderColor = 'rgba(255,255,255,0.3)';
              }}
            >
              <span>{loading ? '⏳' : '🔄'}</span>
              <span>{loading ? 'Updating...' : 'Refresh'}</span>
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="header-actions">
        <button 
          className="notification-btn" 
          title="Notifications"
          onClick={handleNotificationClick}
        >
          🔔
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
          )}
        </button>
      </div>
    );
  };

  return (
    <>
      <header className="admin-header">
        <div className="header-left">
          <button 
            className="sidebar-toggle"
            onClick={onToggleSidebar}
            title="Toggle sidebar"
          >
            ☰
          </button>

          <div className="header-brand-block">
            <div className="header-brand-amharic-1">በኢትዮጵያ ፌዴራላዊ ዲሞክራሲያዊ ሪፐብሊክ</div>
            <div className="header-brand-amharic-2">የመሶብ አገልግሎት</div>
            <div className="header-brand-separator"></div>
            <div className="header-brand-english">Federal Democratic Republic of Ethiopia</div>
            <div className="header-brand-mesob">MESOB Service</div>
          </div>
        </div>

        <h1 className="page-title">{title}</h1>

        <div className="header-right">
          {getHeaderActions()}

          <div className="user-menu">
            <button 
              className="user-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <span className="user-avatar">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt={user?.fullName} className="avatar-img" />
                ) : (
                  <div className="avatar-initials">{getInitials(user?.fullName)}</div>
                )}
              </span>
            </button>

            {showUserMenu && (
              <div className="user-dropdown">
                {dashboardType === "admin" && (
                  <>
                    <button 
                      className="dropdown-item"
                      onClick={handleProfileClick}
                    >
                      👤 Profile
                    </button>
                    <button 
                      className="dropdown-item"
                      onClick={handleSettingsClick}
                    >
                      ⚙️ Settings
                    </button>
                    <hr className="dropdown-divider" />
                  </>
                )}
                {dashboardType === "manager" && (
                  <>
                    <button 
                      className="dropdown-item"
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate("/manager-profile");
                      }}
                    >
                      👤 Profile
                    </button>
                    <hr className="dropdown-divider" />
                  </>
                )}
                {dashboardType === "regional" && (
                  <>
                    <button 
                      className="dropdown-item"
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate("/regional-profile");
                      }}
                    >
                      👤 Profile
                    </button>
                    <hr className="dropdown-divider" />
                  </>
                )}
                {dashboardType === "federal" && (
                  <>
                    <button 
                      className="dropdown-item"
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate("/federal-profile");
                      }}
                    >
                      👤 Profile
                    </button>
                    <hr className="dropdown-divider" />
                  </>
                )}
                <button 
                  className="dropdown-item logout"
                  onClick={handleLogout}
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <NotificationPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </>
  );
}

export default AdminHeader;
