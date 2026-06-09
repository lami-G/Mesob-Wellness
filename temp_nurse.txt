import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import NurseLayout from "../../layouts/NurseLayout";
import NurseAnalytics from "../../components/nurse/NurseAnalytics";
import LiveQueuePanel from "../../components/nurse/LiveQueuePanel";
import CapacityTracker from "../../components/nurse/CapacityTracker";
import RegisterWalkIn from "../../components/nurse/RegisterWalkIn";
import VitalsEntry from "../../components/nurse/VitalsEntry";
import CallNextControl from "../../components/nurse/CallNextControl";
import WellnessPlanCreation from "../../components/nurse/WellnessPlanCreation";
import CustomerHistoryView from "../../components/nurse/CustomerHistoryView";
import ProfileSection from "../../components/dashboard/ProfileSection";

/**
 * Nurse Dashboard - Unified MESOB Layout
 * Uses AppShell through NurseLayout for consistent experience
 */
function NurseDashboard() {
  const { user, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    const tab = searchParams.get("tab");
    const allowedTabs = ["analytics", "queue", "vitals", "walkin", "wellness", "history", "profile"];
    return tab && allowedTabs.includes(tab) ? tab : "analytics";
  });
  const [capacity, setCapacity] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [queueRefreshTrigger, setQueueRefreshTrigger] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const tab = searchParams.get("tab");
    const allowedTabs = ["analytics", "queue", "vitals", "walkin", "wellness", "history", "profile"];
    if (tab && allowedTabs.includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Listen for profile click from dropdown
  useEffect(() => {
    const handleProfileClick = () => {
      setActiveTab('profile');
    };
    
    window.addEventListener('profileClicked', handleProfileClick);
    return () => window.removeEventListener('profileClicked', handleProfileClick);
  }, []);

  const handleCapacityUpdate = (newCapacity) => {
    setCapacity(newCapacity);
    setLastUpdated(new Date());
  };

  const handleStatusChanged = () => {
    setQueueRefreshTrigger(prev => prev + 1);
    setLastUpdated(new Date());
  };

  const handleWalkInSuccess = (data) => {
    if (data?.action === 'recordVitals' && data?.patientId) {
      setSelectedCustomer(data.patientId);
      setActiveTab('vitals');
    }
    setRefreshKey((prev) => prev + 1);
    setLastUpdated(new Date());
  };

  const handleVitalsSuccess = (data) => {
    if (data?.action === 'createWellnessPlan') {
      setSelectedCustomer(data.patientId);
      setActiveTab('wellness');
      if (data.suggestedPlan) {
        sessionStorage.setItem('suggestedWellnessPlan', JSON.stringify(data.suggestedPlan));
      }
      if (data.vitals) {
        sessionStorage.setItem('latestVitals', JSON.stringify(data.vitals));
      }
    }
    setRefreshKey((prev) => prev + 1);
    setLastUpdated(new Date());
  };

  const handleNavigateToWellness = (customerInfo) => {
    setSelectedCustomer(customerInfo.customerId);
    setSelectedAppointmentId(customerInfo.appointmentId);
    setActiveTab('wellness');
    if (customerInfo.suggestedPlan) {
      sessionStorage.setItem('suggestedWellnessPlan', JSON.stringify(customerInfo.suggestedPlan));
    }
    if (customerInfo.vitals) {
      sessionStorage.setItem('latestVitals', JSON.stringify(customerInfo.vitals));
    }
  };

  const handleNavigateToVitals = (customerInfo) => {
    setSelectedCustomer(customerInfo.customerId);
    setSelectedAppointmentId(customerInfo.appointmentId);
    setActiveTab('vitals');
  };

  const handleBackToQueue = async () => {
    setSelectedCustomer(null);
    setSelectedAppointmentId(null);
    setRefreshKey((prev) => prev + 1);
    setActiveTab('queue');
  };

  const handleNavigateToHistory = (customerInfo) => {
    sessionStorage.setItem('selectedCustomerForHistory', JSON.stringify({
      id: customerInfo.customerId,
      fullName: customerInfo.customerName,
    }));
    setActiveTab('history');
  };

  const handleWellnessSuccess = () => {
    setRefreshKey((prev) => prev + 1);
    setLastUpdated(new Date());
  };

  const renderContent = () => {
    switch (activeTab) {
      case "analytics":
        return (
          <div className="dashboard-section">
            <NurseAnalytics refreshTrigger={queueRefreshTrigger} />
          </div>
        );

      case "queue":
        return (
          <div className="nurse-queue-layout">
            <div className="nurse-queue-main">
              <LiveQueuePanel 
                key={refreshKey} 
                refreshTrigger={queueRefreshTrigger} 
                onNavigateToHistory={handleNavigateToHistory} 
              />
            </div>
            <div className="nurse-queue-sidebar">
              <CapacityTracker onCapacityUpdate={handleCapacityUpdate} />
              <CallNextControl 
                onNavigateToVitals={handleNavigateToVitals} 
                onStatusChanged={handleStatusChanged} 
              />
            </div>
          </div>
        );

      case "vitals":
        return (
          <div className="dashboard-section">
            <VitalsEntry
              customerId={selectedCustomer}
              appointmentId={selectedAppointmentId}
              onSuccess={handleVitalsSuccess}
              onNavigateToWellness={handleNavigateToWellness}
            />
          </div>
        );

      case "walkin":
        return (
          <div className="dashboard-section">
            <RegisterWalkIn
              onSuccess={handleWalkInSuccess}
              capacityAvailable={capacity?.available > 0}
            />
          </div>
        );

      case "wellness":
        return (
          <div className="dashboard-section">
            <WellnessPlanCreation
              customerId={selectedCustomer}
              appointmentId={selectedAppointmentId}
              onSuccess={handleWellnessSuccess}
              onBackToQueue={handleBackToQueue}
              onStatusChanged={handleStatusChanged}
            />
          </div>
        );

      case "history":
        return (
          <div className="dashboard-section">
            <CustomerHistoryView customerId={selectedCustomer} />
          </div>
        );

      case "profile":
        return (
          <div className="dashboard-section">
            <ProfileSection onLogout={logout} />
          </div>
        );

      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <NurseLayout 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      user={user}
      lastUpdated={lastUpdated}
    >
      {renderContent()}
    </NurseLayout>
  );
}

export default NurseDashboard;
