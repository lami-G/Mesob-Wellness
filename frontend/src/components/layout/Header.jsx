import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { notificationService } from "../../services/notificationService";
import NotificationPanel from "../admin/NotificationPanel";

/**
 * MESOB Unified Header
 * 
 * Single shared header component used across ALL roles:
 * - Displays official MESOB branding with logo
 * - Shows government identity (FDRE)
 * - Notification bell
 * - User profile menu
 * - Same visual design regardless of role
 * 
 * This is the ONE AND ONLY header in the system.
 */
function Header({ 
  onToggleSidebar, 
  onTabChange, 
  title = "MESOB Dashboard",
  role = "admin",
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
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Fetch unread notifications
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Every 30s
    return () => clearInterval(interval);
  }, []);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
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

  const handleProfileClick = () => {
    setShowUserMenu(false);
    const profileRoutes = {
      admin: "profile",
      federal: "/federal-profile",
      regional: "/regional-profile",
      manager: "/manager-profile",
      nurse: "/nurse-profile",
      patient: "/patient-profile"
    };
    
    if (role === "admin") {
      onTabChange("profile");
    } else {
      navigate(profileRoutes[role] || "/profile");
    }
  };

  const handleSettingsClick = () => {
    setShowUserMenu(false);
    if (role === "admin") {
      onTabChange("settings");
    } else {
      navigate("/settings");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getRightActions = () => {
    // Manager & Regional dashboards show clock and refresh
    if (role === "manager" || role === "regional") {
      return (
        <div className="flex items-center gap-6">
          {/* Live Clock */}
          <div className="flex flex-col items-end text-white">
            <div className="text-sm font-bold tracking-wide">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
            <div className="text-xs text-white/70">
              {currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
              })}
            </div>
          </div>

          {/* Last Updated */}
          {lastUpdated && (
            <div className="text-xs text-white/70 text-right">
              <div>Last Updated</div>
              <div className="font-semibold mt-0.5">
                {lastUpdated.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          )}

          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="px-4 py-2 bg-white/15 border border-white/30 rounded-lg text-white text-sm font-semibold
                         hover:bg-white/25 hover:border-white/50 transition-all duration-200 flex items-center gap-2
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{loading ? '⏳' : '🔄'}</span>
              <span>{loading ? 'Updating...' : 'Refresh'}</span>
            </button>
          )}
        </div>
      );
    }

    // Other dashboards show notification bell
    return (
      <button 
        className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
        title="Notifications"
        onClick={handleNotificationClick}
      >
        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    );
  };

  return (
    <>
      <header className="mesob-header">
        {/* Left Section - Government Branding */}
        <div className="mesob-header-left">
          {/* Sidebar Toggle Button - Angular Bracket */}
          <button 
            className="mesob-header-toggle"
            onClick={onToggleSidebar}
            title="Toggle sidebar"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="11 17 6 12 11 7"/>
              <polyline points="18 17 13 12 18 7"/>
            </svg>
          </button>

          {/* Government Identity */}
          <div className="mesob-header-brand">
            <div className="mesob-header-brand-line mesob-header-brand-amharic">በኢትዮጵያ ፌዴራላዊ ዲሞክራሲያዊ ሪፐብሊክ</div>
            <div className="mesob-header-brand-line">Federal Democratic Republic of Ethiopia MESOB Service</div>
          </div>
        </div>

        {/* Center - Dashboard Title */}
        <h1 className="mesob-header-title">
          MESOB Service Wellness System
        </h1>

        {/* Right Section - Notifications & User */}
        <div className="mesob-header-right">
          {/* Notification Bell */}
          <button 
            className="mesob-header-notification"
            title="Notifications"
            onClick={handleNotificationClick}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {unreadCount > 0 && (
              <span className="mesob-header-notification-badge">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Menu */}
          <div className="mesob-header-user">
            <button 
              className="mesob-header-user-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="mesob-header-user-avatar">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt={user?.fullName} />
                ) : (
                  <span>{getInitials(user?.fullName)}</span>
                )}
              </div>
              <svg className="mesob-header-user-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="mesob-header-user-dropdown">
                <button 
                  className="mesob-header-user-dropdown-item"
                  onClick={handleProfileClick}
                >
                  <span>👤</span>
                  <span>Profile</span>
                </button>
                
                {(role === "admin" || role === "manager") && (
                  <button 
                    className="mesob-header-user-dropdown-item"
                    onClick={handleSettingsClick}
                  >
                    <span>⚙️</span>
                    <span>Settings</span>
                  </button>
                )}
                
                <hr className="mesob-header-user-dropdown-divider" />
                
                <button 
                  className="mesob-header-user-dropdown-item mesob-header-user-dropdown-logout"
                  onClick={handleLogout}
                >
                  <span>🚪</span>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Notification Panel */}
      <NotificationPanel 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </>
  );
}

export default Header;
