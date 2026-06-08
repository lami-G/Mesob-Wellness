import AppShell from "../components/layout/AppShell";

/**
 * Nurse Layout - Using Unified AppShell
 * Provides consistent MESOB experience for Nurse Officers
 */
function NurseLayout({
  children,
  activeTab,
  onTabChange,
  user,
  lastUpdated,
  error,
}) {
  return (
    <AppShell
      role="nurse"
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

export default NurseLayout;
