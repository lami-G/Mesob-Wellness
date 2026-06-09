import AppLayout from "./AppLayout";

function ManagerLayout({
  children,
  activeTab,
  onTabChange,
  capacityInfo,
  staffCount,
  onRefresh,
  loading,
  error,
}) {
  return (
    <AppLayout
      role="MANAGER"
      activeTab={activeTab}
      onTabChange={onTabChange}
      capacityInfo={capacityInfo}
      staffCount={staffCount}
      onRefresh={onRefresh}
      loading={loading}
      error={error}
    >
      {children}
    </AppLayout>
  );
}

export default ManagerLayout;
