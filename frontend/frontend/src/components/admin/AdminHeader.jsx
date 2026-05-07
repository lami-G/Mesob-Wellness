import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function AdminHeader({ 
  user, 
  onToggleSidebar, 
  onTabChange, 
  title = "MESOB Wellness System",
  dashboardType = "admin",
  onRefresh,
  loading,
  lastUpdated,
  selectedCenter,
  setSelectedCenter,
  centers = []
}) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Live clock
  const [currentTime, setCurrentTime] = useState(new Date());
  React.useEffect(() => {
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

  const getHeaderActions = () => {
    if (dashboardType === "manager" || dashboardType === "regional") {
      return (
        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {/* Compact Center Filter for Regional Dashboard */}
          {dashboardType === "regional" && centers.length > 0 && setSelectedCenter && (
            <div 
            className="compact-center-filter"
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '12px',
              padding: '0.5rem 0.75rem',
              backdropFilter: 'blur(15px)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
            }}
            >
              {/* Animated background gradient */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
                animation: 'shimmer 3s infinite',
                pointerEvents: 'none'
              }} />
              
              <select
                value={selectedCenter || 'all'}
                onChange={(e) => setSelectedCenter(e.target.value)}
                className="compact-center-select"
                style={{
                  minWidth: '180px',
                  maxWidth: '200px',
                  padding: '0.5rem 2.5rem 0.5rem 0.75rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'transparent',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  outline: 'none',
                  WebkitAppearance: 'none',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 14 14'%3E%3Cpath fill='%23ffffff' stroke='%23ffffff' stroke-width='1' d='M7 10L3 5h8z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  zIndex: 1000,
                  // Enhanced visibility properties
                  maxHeight: 'none',
                  overflow: 'visible'
                }}
                onFocus={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.1)';
                  e.target.style.borderRadius = '8px';
                  e.target.style.zIndex = '1001';
                  e.target.style.boxShadow = '0 0 0 2px rgba(255,255,255,0.3)';
                }}
                onBlur={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.zIndex = '1000';
                  e.target.style.boxShadow = 'none';
                }}
                // Enhanced dropdown visibility
                size="1"
                multiple={false}
              >
                <option value="all" style={{ 
                  background: '#1e3a8a', 
                  color: '#ffffff', 
                  padding: '12px 16px',
                  fontWeight: 700,
                  fontSize: '14px',
                  lineHeight: '1.4',
                  minHeight: '40px',
                  display: 'block',
                  whiteSpace: 'nowrap',
                  borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                  🌟 All MESOB Centers ({centers.length})
                </option>
                {centers.map((c, index) => (
                  <option key={c.id} value={c.id} style={{ 
                    background: index % 2 === 0 ? '#1e3a8a' : '#1e40af', 
                    color: '#ffffff',
                    padding: '12px 16px',
                    fontWeight: 600,
                    fontSize: '14px',
                    lineHeight: '1.4',
                    minHeight: '40px',
                    display: 'block',
                    whiteSpace: 'nowrap',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    transition: 'all 0.2s ease'
                  }}>
                    {c.status === 'ACTIVE' ? '✅' : '⚠️'} {c.name}
                  </option>
                ))}
              </select>
              
              {/* Active center indicator */}
              {selectedCenter && selectedCenter !== 'all' && (
                <div style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  width: '16px',
                  height: '16px',
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.6rem',
                  color: '#ffffff',
                  fontWeight: 800,
                  boxShadow: '0 2px 6px rgba(34, 197, 94, 0.4)',
                  animation: 'pulse 2s infinite',
                  zIndex: 2
                }}>
                  ✓
                </div>
              )}
            </div>
          )}

          {/* Live Clock */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'flex-end',
            color: 'white'
          }}>
            <div style={{ 
              fontSize: '1.1rem', 
              fontWeight: 700, 
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '0.05em'
            }}>
              {currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
              })}
            </div>
            <div style={{ 
              fontSize: '0.75rem', 
              opacity: 0.8,
              marginTop: '-0.125rem'
            }}>
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
          </div>

          {/* Last Updated */}
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

          {/* Refresh Button */}
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

    // Default admin actions
    return (
      <div className="header-actions">
        <button className="notification-btn" title="Notifications">
          🔔
          <span className="notification-badge">3</span>
        </button>
      </div>
    );
  };

  return (
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
      </div>

      <div className="header-right">
        {dashboardType === "admin" && (
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="Search..." 
              className="search-input"
            />
          </div>
        )}

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
                "👤"
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
  );
}

export default AdminHeader;
