import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../shared/Sidebar';
import Navbar from './Navbar';
import { getSidebarConfig } from '../../config/sidebar';

/**
 * MESOB AppShell
 * Unified layout wrapper for all dashboard types
 * Provides consistent Sidebar + Navbar + Content structure
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
  
  // Determine dashboard title
  const dashboardTitle = title || {
    admin: 'MESOB Admin Portal',
    federal: 'MESOB Federal Portal',
    regional: 'MESOB Regional Portal',
    manager: 'MESOB Manager Portal',
    nurse: 'MESOB Nurse Portal',
    patient: 'My Health Dashboard'
  }[role] || 'MESOB Dashboard';

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <Sidebar
        config={sidebarConfig}
        activeTab={activeTab}
        onTabChange={onTabChange}
        isOpen={sidebarOpen}
        extras={{ user, ...extras }}
      />

      {/* Main Content Area */}
      <div className="admin-main">
        {/* Navbar */}
        <Navbar
          user={user}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onTabChange={onTabChange}
          title={dashboardTitle}
          role={role}
          activeTab={activeTab}
          {...extras}
        />

        {/* Page Content */}
        <main className="admin-content">
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
