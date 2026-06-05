import AppShell from "../components/layout/AppShell";

function ManagerLayout({
  children,
  activeTab,
  onTabChange,
  user,
  capacityInfo,
  staffCount,
  onRefresh,
  loading,
  lastUpdated,
  error,
}) {
  return (
    <AppShell
      role="manager"
      activeTab={activeTab}
      onTabChange={onTabChange}
      error={error}
      extras={{
        capacityInfo,
        staffCount,
        onRefresh,
        loading,
        lastUpdated
      }}
    >
      {children}
    </AppShell>
  );
}

export default ManagerLayout;
