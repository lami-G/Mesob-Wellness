import AppLayout from "./AppLayout";

function NurseLayout({
  children,
  activeTab,
  onTabChange,
  error,
}) {
  return (
    <AppLayout
      role="NURSE_OFFICER"
      activeTab={activeTab}
      onTabChange={onTabChange}
      error={error}
    >
      {children}
    </AppLayout>
  );
}

export default NurseLayout;
