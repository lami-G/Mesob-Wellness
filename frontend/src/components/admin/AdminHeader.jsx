import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { notificationService } from "../../services/notificationService";
import NotificationPanel from "./NotificationPanel";
import { 
  Menu, 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  ChevronDown,
  RefreshCw,
  Filter,
  Building2
} from "lucide-react";

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
    if (dashboardType === "manager" || dashboardType === "regional" || dashboardType === "nurse") {
      return (
        <div className="header-actions-modern">
          <div className="header-date-display">
            <div className="header-date-text">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
          </div>

          {lastUpdated && (
            <div className="header-last-updated">
              <div className="header-updated-label">Last Updated</div>
              <div className="header-updated-time">
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
              className="header-refresh-btn"
            >
              <RefreshCw size={16} className={loading ? "spinning" : ""} />
              <span>{loading ? 'Updating...' : 'Refresh'}</span>
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="header-actions-modern">
        <button 
          className="header-notification-btn" 
          title="Notifications"
          onClick={handleNotificationClick}
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="notification-badge-modern">{unreadCount > 99 ? "99+" : unreadCount}</span>
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
            className="sidebar-toggle-modern"
            onClick={onToggleSidebar}
            title="Toggle sidebar"
          >
            <Menu size={24} />
          </button>
          <h1 className="page-title-modern">{title}</h1>
          
          {/* Advanced Filter Centers - Regional Dashboard */}
          {dashboardType === "regional" && selectedCenter !== undefined && (
            <div className="header-center-filter">
              <div className="center-filter-wrapper">
                <button
                  onClick={() => setShowCenterFilter(!showCenterFilter)}
                  className="center-filter-btn"
                >
                  <Filter size={18} />
                  <span>Filter Centers</span>
                  <ChevronDown size={14} />
                </button>

                {showCenterFilter && (
                  <div className="center-filter-dropdown">
                    <div className="filter-dropdown-header">
                      <Building2 size={18} />
                      <span>All Centers ({centers.length})</span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedCenter('all');
                        setShowCenterFilter(false);
                      }}
                      className={`filter-dropdown-item ${selectedCenter === 'all' ? 'active' : ''}`}
                    >
                      <span className="filter-item-icon">✓</span>
                      <span className="filter-item-text">All Centers</span>
                      {selectedCenter === 'all' && <span className="filter-item-check">✓</span>}
                    </button>

                    {centers && centers.length > 0 && centers.map((center) => (
                      <button
                        key={center.id}
                        onClick={() => {
                          setSelectedCenter(center.id);
                          setShowCenterFilter(false);
                        }}
                        className={`filter-dropdown-item ${selectedCenter === center.id ? 'active' : ''}`}
                      >
                        <span className="filter-item-icon">
                          {center.status === 'ACTIVE' ? '●' : '○'}
                        </span>
                        <div className="filter-item-content">
                          <div className="filter-item-name">{center.name}</div>
                          <div className="filter-item-status">
                            {center.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                          </div>
                        </div>
                        {selectedCenter === center.id && <span className="filter-item-check">✓</span>}
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

          <div className="user-menu-modern">
            <button 
              className="user-btn-modern"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="user-avatar-modern">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt={user?.fullName} className="avatar-img-modern" />
                ) : (
                  <div className="avatar-initials-modern">{getInitials(user?.fullName)}</div>
                )}
              </div>
              <span className="user-name-modern">{user?.fullName}</span>
              <ChevronDown size={16} className="dropdown-arrow-modern" />
            </button>

            {showUserMenu && (
              <div className="user-dropdown-modern">
                {dashboardType === "admin" && (
                  <>
                    <button 
                      className="dropdown-item-modern"
                      onClick={handleProfileClick}
                    >
                      <User size={16} />
                      <span>Profile</span>
                    </button>
                    <button 
                      className="dropdown-item-modern"
                      onClick={handleSettingsClick}
                    >
                      <Settings size={16} />
                      <span>Settings</span>
                    </button>
                    <hr className="dropdown-divider-modern" />
                  </>
                )}
                {dashboardType === "manager" && (
                  <>
                    <button 
                      className="dropdown-item-modern"
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate("/manager-profile");
                      }}
                    >
                      <User size={16} />
                      <span>Profile</span>
                    </button>
                    <hr className="dropdown-divider-modern" />
                  </>
                )}
                {dashboardType === "nurse" && (
                  <>
                    <button 
                      className="dropdown-item-modern"
                      onClick={() => {
                        setShowUserMenu(false);
                        onTabChange("profile");
                      }}
                    >
                      <User size={16} />
                      <span>Profile</span>
                    </button>
                    <hr className="dropdown-divider-modern" />
                  </>
                )}
                {dashboardType === "regional" && (
                  <>
                    <button 
                      className="dropdown-item-modern"
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate("/regional-profile");
                      }}
                    >
                      <User size={16} />
                      <span>Profile</span>
                    </button>
                    <hr className="dropdown-divider-modern" />
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
                  className="dropdown-item-modern logout-modern"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  <span>Logout</span>
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
