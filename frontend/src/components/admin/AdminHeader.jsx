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
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              <span>{loading ? 'Updating...' : 'Refresh'}</span>
            </button>
          )}
        </div>
      );
    }

    // Federal dashboard - add functional notifications
    return (
      <div className="header-actions">
        <button 
          className="notification-btn" 
          title="Notifications"
          onClick={handleNotificationClick}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
          )}
        </button>
      </div>
    );
  };

  // Federal and Admin dashboards - render only right-side controls
  if (dashboardType === "federal" || dashboardType === "admin") {
    return (
      <>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginLeft: "auto" }}>
          <select 
            style={{
              background: "transparent",
              border: "1.5px solid rgba(255, 255, 255, 0.35)",
              borderRadius: "7px",
              padding: "0.4rem 0.9rem",
              fontSize: "0.875rem",
              color: "#ffffff",
              cursor: "pointer",
              transition: "all 0.2s ease",
              fontFamily: "inherit",
            }}
          >
            <option value="en" style={{ color: "#1e293b", background: "#ffffff" }}>English</option>
            <option value="am" style={{ color: "#1e293b", background: "#ffffff" }}>አማርኛ</option>
          </select>

          {getHeaderActions()}

          <div style={{ position: "relative" }}>
            <button
              type="button"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(255, 255, 255, 0.1)",
                border: "1.5px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "10px",
                padding: "4px 12px 4px 4px",
                color: "white",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "0.875rem",
                transition: "all 0.2s ease",
                minHeight: "unset",
                height: "42px",
              }}
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <span style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "#f5a623",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                flexShrink: 0,
                overflow: "hidden",
              }}>
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt={user?.fullName} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }} />
                ) : (
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#213D8D" }}>{getInitials(user?.fullName)}</span>
                )}
              </span>
              <span style={{ fontSize: "0.65rem", opacity: 0.7, color: "rgba(255,255,255,0.8)" }}>▼</span>
            </button>

            {showUserMenu && (
              <div style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                right: 0,
                background: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.14)",
                minWidth: "160px",
                zIndex: 1001,
                overflow: "hidden",
              }}>
                <button 
                  style={{
                    width: "100%",
                    padding: "0.7rem 1rem",
                    background: "none",
                    border: "none",
                    textAlign: "left",
                    color: "#1e293b",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    transition: "background 0.15s",
                    fontFamily: "inherit",
                  }}
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate("/federal-profile");
                  }}
                >
                  Profile
                </button>
                <hr style={{ margin: 0, border: "none", borderTop: "1px solid #e2e8f0" }} />
                <button 
                  style={{
                    width: "100%",
                    padding: "0.7rem 1rem",
                    background: "none",
                    border: "none",
                    textAlign: "left",
                    color: "#1e293b",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    transition: "background 0.15s",
                    fontFamily: "inherit",
                  }}
                  onClick={handleLogout}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#fee2e2";
                    e.target.style.color = "#dc2626";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "none";
                    e.target.style.color = "#1e293b";
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
        <NotificationPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
      </>
    );
  }

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
          <h1 className="page-title">{title}</h1>
          
          {/* Advanced Filter Centers - Regional Dashboard */}
          {dashboardType === "regional" && selectedCenter !== undefined && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginLeft: '2.5rem',
              paddingLeft: '2.5rem',
              borderLeft: '2px solid rgba(255,255,255,0.2)',
              height: '100%'
            }}>
              {/* Filter Centers Dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowCenterFilter(!showCenterFilter)}
                  style={{
                    background: 'rgba(255,255,255,0.12)',
                    border: '1.5px solid rgba(255,255,255,0.3)',
                    borderRadius: '8px',
                    padding: '0.65rem 1.3rem',
                    color: 'white',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    whiteSpace: 'nowrap',
                    boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255,255,255,0.18)';
                    e.target.style.borderColor = 'rgba(255,255,255,0.5)';
                    e.target.style.boxShadow = 'inset 0 1px 2px rgba(255,255,255,0.15), 0 4px 12px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255,255,255,0.12)';
                    e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                    e.target.style.boxShadow = 'inset 0 1px 2px rgba(255,255,255,0.1)';
                  }}
                >
                  <span style={{ fontSize: '1.1rem' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="M21 21l-4.35-4.35"/>
                    </svg>
                  </span>
                  <span>Filter Centers</span>
                  <span style={{ fontSize: '0.75rem', opacity: 0.9, marginLeft: '0.25rem' }}>▼</span>
                </button>

                {/* Advanced Dropdown Menu */}
                {showCenterFilter && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '0.75rem',
                    background: '#1e3a8a',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
                    zIndex: 1000,
                    minWidth: '280px',
                    maxHeight: '500px',
                    overflowY: 'auto',
                    overflow: 'hidden'
                  }}>
                    {/* Header Section */}
                    <div style={{
                      padding: '1rem',
                      borderBottom: '1px solid rgba(255,255,255,0.1)',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span style={{ fontSize: '1.2rem' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                          <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                      </span>
                      <span>All Centers ({centers.length})</span>
                    </div>

                    {/* All Centers Option */}
                    <button
                      onClick={() => {
                        setSelectedCenter('all');
                        setShowCenterFilter(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: 'none',
                        background: selectedCenter === 'all' ? 'rgba(255,255,255,0.15)' : 'transparent',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        color: 'white',
                        fontWeight: selectedCenter === 'all' ? 600 : 500,
                        transition: 'all 0.15s ease',
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(255,255,255,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = selectedCenter === 'all' ? 'rgba(255,255,255,0.15)' : 'transparent';
                      }}
                    >
                      <span style={{ fontSize: '1rem', width: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </span>
                      <span style={{ flex: 1 }}>All Centers</span>
                      {selectedCenter === 'all' && <span style={{ color: '#4ade80', fontWeight: 700 }}>✓</span>}
                    </button>

                    {/* Individual Centers */}
                    {centers && centers.length > 0 && centers.map((center, index) => (
                      <button
                        key={center.id}
                        onClick={() => {
                          setSelectedCenter(center.id);
                          setShowCenterFilter(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          border: 'none',
                          background: selectedCenter === center.id ? 'rgba(255,255,255,0.15)' : 'transparent',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          color: 'white',
                          fontWeight: selectedCenter === center.id ? 600 : 500,
                          transition: 'all 0.15s ease',
                          borderBottom: index < centers.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'rgba(255,255,255,0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = selectedCenter === center.id ? 'rgba(255,255,255,0.15)' : 'transparent';
                        }}
                      >
                        <span style={{ fontSize: '1rem', width: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={center.status === 'ACTIVE' ? '#4ade80' : '#f59e0b'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        </span>
                        <span style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500 }}>{center.name}</div>
                          <div style={{ 
                            fontSize: '0.7rem', 
                            opacity: 0.7,
                            marginTop: '0.1rem'
                          }}>
                            <span style={{ 
                              display: 'inline-block',
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: center.status === 'ACTIVE' ? '#4ade80' : '#f59e0b',
                              marginRight: '4px'
                            }} />
                            {center.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                          </div>
                        </span>
                        {selectedCenter === center.id && (
                          <span style={{ color: '#4ade80', fontWeight: 700 }}>✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

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
              <span className="user-name">{user?.fullName}</span>
              <span className="dropdown-arrow">▼</span>
            </button>

            {showUserMenu && (
              <div className="user-dropdown">
                {dashboardType === "admin" && (
                  <>
                    <button 
                      className="dropdown-item"
                      onClick={handleProfileClick}
                    >
                      Profile
                    </button>
                    <button 
                      className="dropdown-item"
                      onClick={handleSettingsClick}
                    >
                      Settings
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
                      Profile
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
                      Profile
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
                      Profile
                    </button>
                    <hr className="dropdown-divider" />
                  </>
                )}
                <button 
                  className="dropdown-item logout"
                  onClick={handleLogout}
                >
                  Logout
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
