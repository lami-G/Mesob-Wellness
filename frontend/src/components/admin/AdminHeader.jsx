import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { notificationService } from "../../services/notificationService";
import NotificationPanel from "./NotificationPanel";
import styles from "./AdminHeader.module.css";

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
        <div className={styles.headerActions}>
          <div className={styles.dateDisplay}>
            <div className={styles.dateText}>
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
          </div>

          {lastUpdated && (
            <div className={styles.lastUpdatedContainer}>
              <span className={styles.lastUpdatedLabel}>Last Updated</span>
              <span className={styles.lastUpdatedTime}>
                {lastUpdated.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
          )}

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className={styles.refreshButton}
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
        <div className={styles.rightControls}>
          <select className={styles.languageSelect}>
            <option value="en">English</option>
            <option value="am">አማርኛ</option>
          </select>

          {getHeaderActions()}

          <div className={styles.userMenuContainer}>
            <button
              type="button"
              className={styles.userMenuButton}
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <span className={styles.userAvatar}>
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt={user?.fullName} className={styles.userAvatarImage} />
                ) : (
                  <span className={styles.userAvatarInitials}>{getInitials(user?.fullName)}</span>
                )}
              </span>
              <span className={styles.userMenuArrow}>▼</span>
            </button>

            {showUserMenu && (
              <div className={styles.userDropdown}>
                <button 
                  className={styles.dropdownButton}
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate("/federal-profile");
                  }}
                >
                  Profile
                </button>
                <hr className={styles.dropdownDivider} />
                <button 
                  className={`${styles.dropdownButton} ${styles.dropdownButtonLogout}`}
                  onClick={handleLogout}
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
            <div className={styles.centerFilterSection}>
              {/* Filter Centers Dropdown */}
              <div className={styles.centerFilterContainer}>
                <button
                  onClick={() => setShowCenterFilter(!showCenterFilter)}
                  className={styles.centerFilterButton}
                >
                  <span className={styles.centerFilterIcon}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="M21 21l-4.35-4.35"/>
                    </svg>
                  </span>
                  <span>Filter Centers</span>
                  <span className={styles.centerFilterArrow}>▼</span>
                </button>

                {/* Advanced Dropdown Menu */}
                {showCenterFilter && (
                  <div className={styles.centerDropdown}>
                    {/* Header Section */}
                    <div className={styles.centerDropdownHeader}>
                      <span className={styles.centerDropdownHeaderIcon}>
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
                      className={`${styles.centerOption} ${selectedCenter === 'all' ? styles.centerOptionActive : ''}`}
                    >
                      <span className={styles.centerOptionIcon}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </span>
                      <span className={styles.centerOptionContent}>All Centers</span>
                      {selectedCenter === 'all' && <span className={styles.centerOptionCheckmark}>✓</span>}
                    </button>

                    {/* Individual Centers */}
                    {centers && centers.length > 0 && centers.map((center, index) => (
                      <button
                        key={center.id}
                        onClick={() => {
                          setSelectedCenter(center.id);
                          setShowCenterFilter(false);
                        }}
                        className={`${styles.centerOption} ${selectedCenter === center.id ? styles.centerOptionActive : ''} ${index === centers.length - 1 ? styles.centerOptionLast : ''}`}
                      >
                        <span className={styles.centerOptionIcon}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={center.status === 'ACTIVE' ? '#4ade80' : '#f59e0b'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        </span>
                        <span className={styles.centerOptionContent}>
                          <div className={styles.centerOptionName}>{center.name}</div>
                          <div className={styles.centerOptionStatus}>
                            <span className={`${styles.centerStatusDot} ${center.status === 'ACTIVE' ? styles.centerStatusDotActive : styles.centerStatusDotInactive}`} />
                            {center.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                          </div>
                        </span>
                        {selectedCenter === center.id && (
                          <span className={styles.centerOptionCheckmark}>✓</span>
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
