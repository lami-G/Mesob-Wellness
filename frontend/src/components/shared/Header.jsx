import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

function Header({ title, onToggleSidebar, dashboardType }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
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

  // Fetch notifications when component mounts
  useEffect(() => {
    if (showNotificationBell) {
      fetchNotifications();
    }
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const response = await api.get('/api/v1/notifications');
      if (response.data.status === 'success') {
        const notifs = response.data.data.notifications || [];
        setNotifications(notifs);
        const unread = notifs.filter(n => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/api/v1/notifications/${notificationId}/read`);
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    // Handle navigation based on notification type if needed
    setShowNotifications(false);
  };

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

  // Determine which roles should see notifications
  const showNotificationBell = ['SYSTEM_ADMIN', 'MANAGER', 'REGIONAL_OFFICE', 'FEDERAL_OFFICE'].includes(dashboardType);

  const formatNotificationTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <header className="mesob-header">
      {/* Left Section - Toggle + Logo */}
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

        {/* MESOB Logo */}
        <div className="mesob-header-logo">
          <img 
            src="/FDRE Mesob - Profile Asset 11Logo.png" 
            alt="MESOB Logo" 
            className="mesob-header-logo-img"
          />
        </div>
      </div>

      {/* Center - Wellness Center Title */}
      <h1 className="mesob-header-title">
        {user?.center?.name 
          ? `${user.center.name} Wellness Center` 
          : user?.center?.region 
          ? `${user.center.region} Wellness Center`
          : 'MESOB Wellness Center'}
      </h1>

      {/* Right Section - Language, Notifications, User */}
      <div className="mesob-header-right">
        {/* Language Selector */}
        <select className="mesob-header-language" aria-label="Language">
          <option value="en">English</option>
          <option value="am">አማርኛ</option>
        </select>

        {/* Notification Bell - Only for Admin, Manager, Regional, Federal */}
        {showNotificationBell && (
          <div className="mesob-header-notification" ref={notifRef}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) {
                  fetchNotifications();
                }
              }}
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
              {/* Badge for unread notifications - only show if count > 0 */}
              {unreadCount > 0 && (
                <span className="mesob-header-notification-badge">{unreadCount}</span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="mesob-header-user-dropdown" style={{ minWidth: '320px', maxHeight: '400px', overflowY: 'auto' }}>
                {loadingNotifications ? (
                  <div style={{ padding: '1rem', textAlign: 'center', color: '#6b7280', fontSize: '0.875rem' }}>
                    Loading notifications...
                  </div>
                ) : notifications.length === 0 ? (
                  <div style={{ padding: '1rem', textAlign: 'center', color: '#6b7280', fontSize: '0.875rem' }}>
                    No new notifications
                  </div>
                ) : (
                  <>
                    <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb', fontWeight: '600', color: '#111827', fontSize: '0.875rem' }}>
                      Notifications ({unreadCount} unread)
                    </div>
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        style={{
                          padding: '0.75rem 1rem',
                          borderBottom: '1px solid #f3f4f6',
                          backgroundColor: notification.isRead ? '#ffffff' : '#f0f9ff',
                          transition: 'background-color 0.15s'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                          {!notification.isRead && (
                            <div style={{ 
                              width: '8px', 
                              height: '8px', 
                              borderRadius: '50%', 
                              backgroundColor: '#3b82f6',
                              flexShrink: 0,
                              marginTop: '0.25rem'
                            }} />
                          )}
                          <div 
                            style={{ flex: 1, cursor: 'pointer' }}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div style={{ fontSize: '0.875rem', color: '#111827', fontWeight: notification.isRead ? '500' : '600', marginBottom: '0.25rem' }}>
                              {notification.title}
                            </div>
                            <div style={{ fontSize: '0.8125rem', color: '#4b5563', marginBottom: '0.25rem' }}>
                              {notification.message}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                              {formatNotificationTime(notification.createdAt)}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
                            {!notification.isRead && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                style={{
                                  background: 'none',
                                  border: '1px solid #d1d5db',
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '0.875rem',
                                  color: '#16a34a'
                                }}
                                title="Mark as read"
                              >
                                ✓
                              </button>
                            )}
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  await api.delete(`/api/v1/notifications/${notification.id}`);
                                  setNotifications(prev => prev.filter(n => n.id !== notification.id));
                                  if (!notification.isRead) {
                                    setUnreadCount(prev => Math.max(0, prev - 1));
                                  }
                                } catch (error) {
                                  console.error('Failed to delete notification:', error);
                                }
                              }}
                              style={{
                                background: 'none',
                                border: '1px solid #d1d5db',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                color: '#ef4444'
                              }}
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        )}

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
