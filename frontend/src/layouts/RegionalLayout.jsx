import AppShell from "../components/layout/AppShell";

function RegionalLayout({
  children,
  activeTab,
  onTabChange,
  user,
  centerStats,
  centersCount,
  selectedCenter,
  setSelectedCenter,
  centers,
  lastUpdated,
  error,
}) {
  return (
    <AppShell
      role="regional"
      activeTab={activeTab}
      onTabChange={onTabChange}
      error={error}
      extras={{
        centerStats,
        centersCount,
        selectedCenter,
        setSelectedCenter,
        centers,
        lastUpdated
      }}
    >
      {children}
    </AppShell>
  );
}

export default RegionalLayout;
