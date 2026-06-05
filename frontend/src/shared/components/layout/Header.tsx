/* ========================================
   HEADER COMPONENT
   Ethiopian Federal Healthcare Platform
   ======================================== */

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Globe, ChevronDown, User, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks';
import { useClickOutside } from '@/hooks';
import { Avatar } from '@/components/ui';
import { getInitials } from '@/utils';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useClickOutside(userMenuRef, () => setShowUserMenu(false), showUserMenu);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleProfileClick = () => {
    setShowUserMenu(false);
    window.dispatchEvent(new CustomEvent('profileClicked'));
  };

  return (
    <header className="app-header">
      <div className="app-header-left">
        <img
          src="/Mesob-short-png.png"
          alt="MESOB Logo"
          className="mesob-logo-img"
        />
        <div className="app-header-title">
          <h1 className="app-header-main-title">MESOB Wellness System</h1>
          <p className="app-header-subtitle">
            Federal Democratic Republic of Ethiopia
          </p>
        </div>
      </div>

      <div className="app-header-right">
        <button className="notification-btn-modern" title="Notifications">
          <Bell size={20} />
        </button>

        <div className="language-selector-modern">
          <Globe size={18} />
          <select className="language-select">
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
            >
              <Avatar
                src={user.profilePicture}
                name={user.fullName}
                size="sm"
              />
              <ChevronDown size={16} className="dropdown-arrow-header" />
            </button>

            {showUserMenu && (
              <div className="user-dropdown-header">
                <button
                  className="dropdown-item-header"
                  onClick={handleProfileClick}
                >
                  <User size={16} />
                  <span>Profile</span>
                </button>
                <hr className="dropdown-divider-header" />
                <button
                  className="dropdown-item-header logout-header"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
