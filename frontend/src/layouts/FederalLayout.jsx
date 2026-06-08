import React from "react";
import AppShell from "../components/layout/AppShell";

/**
 * Federal Layout - Using AppShell
 * Simplified layout that delegates to AppShell
 */
function FederalLayout({
  children,
  activeTab,
  onTabChange,
  user,
  lastUpdated,
  error,
}) {
  return (
    <AppShell
      role="federal"
      activeTab={activeTab}
      onTabChange={onTabChange}
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

export default FederalLayout;
