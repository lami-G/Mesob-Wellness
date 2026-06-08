import AppShell from "../components/layout/AppShell";

/**
 * Staff/Patient Layout - Using Unified AppShell
 * Provides consistent MESOB experience for Staff users
 */
function StaffLayout({
  children,
  activeTab,
  onTabChange,
  user,
  lastUpdated,
  error,
}) {
  return (
    <AppShell
      role="staff"
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

export default StaffLayout;
