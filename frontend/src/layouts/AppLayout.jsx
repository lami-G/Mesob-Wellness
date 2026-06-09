import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/shared/Header';
import Sidebar from '../components/shared/Sidebar';
import { getSidebarConfig } from '../config/sidebarConfigs.jsx';
import '../styles/unified-layout.css';

/**
 * Unified App Layout
 * Replaces AdminLayout and MainLayout with a single, role-based layout system.
 * 
 * Props:
 * - role: User role (SYSTEM_ADMIN, MANAGER, REGIONAL_OFFICE, FEDERAL_OFFICE, NURSE_OFFICER, STAFF)
 * - activeTab: Current active tab/section
 * - onTabChange: Callback when user changes tab
 * - title: Header title (optional, defaults to role-based title)
 * - children: Page content
 * - capacityInfo: { slotsUsed, dailyLimit } - For manager dashboard
 * - staffCount: Number of staff - For manager dashboard
 * - centerStats: { active, total } - For regional dashboard
 * - centersCount: Number of centers - For regional dashboard
 * - onRefresh: Refresh callback - For manager dashboard
 * - loading: Loading state - For manager dashboard
 * - error: Error message to display
 */
function AppLayout({
  role,
  activeTab,
  onTabChange,
  title,
  children,
  // Widget data
  capacityInfo,
  staffCount,
  centerStats,
  centersCount,
  onRefresh,
  loading,
  error,
}) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Get sidebar configuration based on role
  const sidebarConfig = getSidebarConfig(role);

  // Determine header title
  const getHeaderTitle = () => {
    if (title) return title;
    
    const titles = {
      SYSTEM_ADMIN: 'MESOB Admin Portal',
      MANAGER: 'MESOB Manager Portal',
      REGIONAL_OFFICE: 'MESOB Regional Portal',
      FEDERAL_OFFICE: 'MESOB Federal Portal',
      NURSE_OFFICER: 'MESOB Nurse Portal',
      STAFF: 'MESOB Staff Portal',
    };
    
    return titles[role] || 'MESOB Portal';
  };

  // Get welcome bar content
  const getWelcomeContent = () => {
    const welcomeTitles = {
      SYSTEM_ADMIN: 'System Administrator',
      MANAGER: 'Center Manager',
      REGIONAL_OFFICE: 'Regional Officer',
      FEDERAL_OFFICE: 'Federal Officer',
      NURSE_OFFICER: 'Nurse Officer',
      STAFF: 'Staff Member',
    };

    const welcomeSubtitles = {
      SYSTEM_ADMIN: 'System-wide management and configuration',
      MANAGER: 'Center operations and staff management',
      REGIONAL_OFFICE: 'Regional oversight and center coordination',
      FEDERAL_OFFICE: 'System-wide overview and administration',
      NURSE_OFFICER: 'Manage patient queue and vitals',
      STAFF: 'Manage your health and appointments',
    };

    return {
      title: `Welcome, ${user?.fullName || welcomeTitles[role]}`,
      subtitle: welcomeSubtitles[role] || 'Welcome to MESOB Portal',
    };
  };

  const welcomeContent = getWelcomeContent();

  return (
    <div className="mesob-layout">
      {/* Sidebar - Full Height from Top */}
      <Sidebar
        config={sidebarConfig}
        activeTab={activeTab}
        onTabChange={onTabChange}
        isOpen={sidebarOpen}
        user={user}
        // Widget data
        capacityInfo={capacityInfo}
        staffCount={staffCount}
        centerStats={centerStats}
        centersCount={centersCount}
        onRefresh={onRefresh}
        loading={loading}
      />

      {/* Right Side: Header + Main Content */}
      <div className="mesob-layout-right">
        {/* Header */}
        <Header
          title={getHeaderTitle()}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          dashboardType={role}
        />

        {/* Main Content Area */}
        <div className="mesob-layout-main">
          {/* Welcome Bar */}
          <div className="mesob-welcome-bar">
            <div className="mesob-welcome-bar-left">
              <h2 className="mesob-welcome-bar-title">{welcomeContent.title}</h2>
              <p className="mesob-welcome-bar-subtitle">{welcomeContent.subtitle}</p>
            </div>
            <div className="mesob-welcome-bar-right">
              <span className="mesob-welcome-bar-date">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="mesob-layout-content">
            {error && (
              <div className="mesob-alert mesob-alert-error" style={{ marginBottom: '1rem' }}>
                {error}
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppLayout;
