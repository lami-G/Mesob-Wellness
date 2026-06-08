import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../shared/Sidebar';
import Header from './Header';
import { getSidebarConfig } from '../../config/sidebar';

/**
 * MESOB AppShell - UNIFIED LAYOUT FOR ALL ROLES
 * 
 * Single consistent application layout shared across:
 * - Super Admin (SYSTEM_ADMIN)
 * - Federal Office (FEDERAL_OFFICE)
 * - Regional Admin (REGIONAL_OFFICE)
 * - Center Admin (MANAGER)
 * - Nurse Officer (NURSE_OFFICER)
 * - Staff (STAFF)
 * 
 * Features:
 * - One shared Header with MESOB branding
 * - One shared Sidebar with role-based menu items
 * - Consistent blue government theme
 * - Professional dashboard experience
 */
function AppShell({
  children,
  role = 'admin',
  activeTab,
  onTabChange,
  title,
  extras = {},
  error
}) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Get role-specific sidebar configuration
  const sidebarConfig = getSidebarConfig(role);
  
  // Determine dashboard title based on role
  const dashboardTitle = title || 'MESOB Service Wellness System';

  return (
    <div className="mesob-app-shell">
      {/* UNIFIED SIDEBAR - Same design for all roles, different menu items */}
      <Sidebar
        config={sidebarConfig}
        activeTab={activeTab}
        onTabChange={onTabChange}
        isOpen={sidebarOpen}
        extras={{ user, ...extras }}
      />

      {/* Main Content Area */}
      <div className="mesob-app-main">
        {/* UNIFIED HEADER - Same design for all roles */}
        <Header
          user={user}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onTabChange={onTabChange}
          title={dashboardTitle}
          role={role}
          activeTab={activeTab}
          {...extras}
        />

        {/* Page Content */}
        <main className="mesob-app-content">
          {error && (
            <div className="alert alert-error mb-4">
              {error}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppShell;
