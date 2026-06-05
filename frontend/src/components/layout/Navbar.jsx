import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { notificationService } from "../../services/notificationService";
import NotificationPanel from "../admin/NotificationPanel";

/**
 * MESOB Unified Navbar
 * Shared across all dashboards (Admin, Federal, Regional, Manager, Nurse, Patient)
 * Matches the design from the reference screenshot
 */
function Navbar({ 
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
      <header className="admin-header">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Sidebar Toggle */}
          <button 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
            onClick={onToggleSidebar}
            title="Toggle sidebar"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          {/* Government Branding */}
          <div className="hidden md:flex flex-col text-white text-xs leading-tight">
            <div className="font-semibold opacity-90">በኢትዮጵያ ፌዴራላዊ ዲሞክራሲያዊ ሪፐብሊክ</div>
            <div className="opacity-75">Federal Democratic Republic of Ethiopia</div>
            <div className="font-bold mt-0.5">MESOB Service</div>
          </div>
        </div>

        {/* Center Title */}
        <h1 className="absolute left-1/2 transform -translate-x-1/2 text-white text-lg font-bold hidden lg:block">
          {title}
        </h1>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {getRightActions()}

          {/* User Menu */}
          <div className="relative">
            <button 
              className="flex items-center gap-2 hover:bg-white/10 p-2 rounded-lg transition-colors"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="w-10 h-10 rounded-full bg-mesob-gold flex items-center justify-center text-white font-bold overflow-hidden">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt={user?.fullName} className="w-full h-full object-cover" />
                ) : (
                  <span>{getInitials(user?.fullName)}</span>
                )}
              </div>
              <svg className="w-4 h-4 text-white hidden sm:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-200">
                <button 
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
                  onClick={handleProfileClick}
                >
                  <span>👤</span>
                  <span>Profile</span>
                </button>
                
                {(role === "admin" || role === "manager") && (
                  <button 
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
                    onClick={handleSettingsClick}
                  >
                    <span>⚙️</span>
                    <span>Settings</span>
                  </button>
                )}
                
                <hr className="my-2 border-gray-200" />
                
                <button 
                  className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 transition-colors flex items-center gap-2"
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

export default Navbar;
