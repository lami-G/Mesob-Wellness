import React from "react";
import AppShell from "../components/layout/AppShell";

/**
 * Admin Layout - Using AppShell
 * Simplified layout that delegates to AppShell
 */
function AdminLayout({
  children,
  activeTab,
  onTabChange,
  user,
  lastUpdated,
  error,
}) {
  return (
    <AppShell
      role="admin"
      activeTab={activeTab}
      onTabChange={onTabChange}
      title="MESOB Admin Portal"
      error={error}
      extras={{
        user,
        lastUpdated
      }}
    >
      {children}
    </AppShell>
  );
}

export default AdminLayout;
