import AppLayout from "./AppLayout";

function FederalLayout({
  children,
  activeTab,
  onTabChange,
  error,
}) {
  return (
    <AppLayout
      role="FEDERAL_OFFICE"
      activeTab={activeTab}
      onTabChange={onTabChange}
      error={error}
    >
      {children}
    </AppLayout>
  );
}

export default FederalLayout;
