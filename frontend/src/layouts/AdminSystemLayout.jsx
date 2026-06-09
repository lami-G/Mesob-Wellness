import AppLayout from "./AppLayout";

function AdminSystemLayout({
  children,
  activeTab,
  onTabChange,
  error,
}) {
  return (
    <AppLayout
      role="SYSTEM_ADMIN"
      activeTab={activeTab}
      onTabChange={onTabChange}
      error={error}
    >
      {children}
    </AppLayout>
  );
}

export default AdminSystemLayout;
