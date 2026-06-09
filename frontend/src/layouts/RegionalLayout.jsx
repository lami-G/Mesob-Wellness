import AppLayout from "./AppLayout";

function RegionalLayout({
  children,
  activeTab,
  onTabChange,
  centerStats,
  centersCount,
  error,
}) {
  return (
    <AppLayout
      role="REGIONAL_OFFICE"
      activeTab={activeTab}
      onTabChange={onTabChange}
      centerStats={centerStats}
      centersCount={centersCount}
      error={error}
    >
      {children}
    </AppLayout>
  );
}

export default RegionalLayout;
