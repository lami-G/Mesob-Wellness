import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Header({ title, onToggleSidebar, dashboardType }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const userMenuRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleProfileClick = () => {
    setShowUserMenu(false);
    // Dispatch event for profile navigation
    window.dispatchEvent(new CustomEvent('profileClicked'));
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="mesob-header">
      {/* Left Section - Toggle + Branding */}
      <div className="mesob-header-left">
        <button
          className="mesob-header-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle Sidebar"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Government Branding */}
        <div className="mesob-header-brand">
          <div className="mesob-header-brand-line">
            Ethiopian Federal Ministry of Health
          </div>
          <div className="mesob-header-brand-line mesob-header-brand-amharic">
            የኢትዮጵያ ፌዴራላዊ ሪፐብሊክ ጤና ሚኒስቴር
          </div>
        </div>
      </div>

      {/* Center - Dashboard Title */}
      <h1 className="mesob-header-title">{title || 'MESOB Portal'}</h1>

      {/* Right Section - Language, Notifications, User */}
      <div className="mesob-header-right">
        {/* Language Selector */}
        <select className="mesob-header-language" aria-label="Language">
          <option value="en">English</option>
          <option value="am">አማርኛ</option>
        </select>

        {/* Notification Bell */}
        <div className="mesob-header-notification" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
            aria-expanded={showNotifications}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {/* Badge for notifications */}
            <span className="mesob-header-notification-badge">3</span>
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="mesob-header-user-dropdown">
              <div style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
                No new notifications
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="mesob-header-user" ref={userMenuRef}>
          <button
            className="mesob-header-user-btn"
            onClick={() => setShowUserMenu(!showUserMenu)}
            aria-label="User Menu"
            aria-expanded={showUserMenu}
          >
            <div className="mesob-header-user-avatar">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt={user.fullName} />
              ) : (
                getInitials(user?.fullName)
              )}
            </div>
            <svg
              className="mesob-header-user-arrow"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* User Dropdown */}
          {showUserMenu && (
            <div className="mesob-header-user-dropdown">
              <button
                className="mesob-header-user-dropdown-item"
                onClick={handleProfileClick}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Profile
              </button>
              <hr className="mesob-header-user-dropdown-divider" />
              <button
                className="mesob-header-user-dropdown-item mesob-header-user-dropdown-logout"
                onClick={handleLogout}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
