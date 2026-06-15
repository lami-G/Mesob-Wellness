import AppLayout from "./AppLayout";

function StaffLayout({
  children,
  activeTab,
  onTabChange,
  error,
}) {
  return (
    <AppLayout
      role="STAFF"
      activeTab={activeTab}
      onTabChange={onTabChange}
      error={error}
    >
      {children}
    </AppLayout>
  );
}

export default StaffLayout;
