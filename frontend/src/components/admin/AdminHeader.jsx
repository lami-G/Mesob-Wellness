import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { notificationService } from "../../services/notificationService";
import NotificationPanel from "./NotificationPanel";

function AdminHeader({ onToggleSidebar, onTabChange }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Refresh every 30 seconds
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
    // Mark all as read when opening
    if (unreadCount > 0) {
      notificationService.markAllAsRead().then(() => {
        setUnreadCount(0);
      });
    }
  };

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
          <h1 className="page-title">MESOB Wellness System</h1>
        </div>

        <div className="header-right">
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="Search..." 
              className="search-input"
            />
           
          </div>

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
        </div>
      </header>
      <NotificationPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </>
  );
}

export default AdminHeader;
