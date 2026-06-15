import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import NurseLayout from "../../layouts/NurseLayout";
import NurseAnalytics from "../../components/nurse/Analytics/NurseAnalytics";
import LiveQueuePanel from "../../components/nurse/Queue/LiveQueuePanel";
import CapacityTracker from "../../components/nurse/Queue/CapacityTracker";
import RegisterWalkIn from "../../components/nurse/WalkIn/RegisterWalkIn";
import VitalsEntry from "../../components/nurse/Vitals/VitalsEntry";
import CallNextControl from "../../components/nurse/Queue/CallNextControl";
import WellnessPlanCreation from "../../components/nurse/Wellness/WellnessPlanCreation";
import CustomerHistoryView from "../../components/nurse/History/CustomerHistoryView";
import ProfileSection from "../../components/staff/Profile/ProfileSection";

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

  useEffect(() => {
    const tab = searchParams.get("tab");
    const allowedTabs = ["analytics", "queue", "vitals", "walkin", "wellness", "history", "profile"];
    if (tab && allowedTabs.includes(tab)) {
      setActiveTab(tab);
    } else {
      // Reset to default analytics tab when no tab parameter
      setActiveTab("analytics");
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
  };

  const handleStatusChanged = () => {
    // Trigger queue refresh when status changes
    setQueueRefreshTrigger(prev => prev + 1);
  };

  const handleWalkInSuccess = (data) => {
    if (data?.action === 'recordVitals' && data?.patientId) {
      setSelectedCustomer(data.patientId);
      setActiveTab('vitals');
    }
    setRefreshKey((prev) => prev + 1);
  };

  const handleVitalsSuccess = (data) => {
    if (data?.action === 'createWellnessPlan') {
      setSelectedCustomer(data.patientId);
      setActiveTab('wellness');
      // Pass vitals and suggested plan to wellness component
      if (data.suggestedPlan) {
        sessionStorage.setItem('suggestedWellnessPlan', JSON.stringify(data.suggestedPlan));
      }
      if (data.vitals) {
        sessionStorage.setItem('latestVitals', JSON.stringify(data.vitals));
      }
    }
    setRefreshKey((prev) => prev + 1);
  };

  const handleNavigateToWellness = (customerInfo) => {
    setSelectedCustomer(customerInfo.customerId);
    setSelectedAppointmentId(customerInfo.appointmentId);
    setActiveTab('wellness');
    // Pass vitals and suggested plan to wellness component
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
    // Reset selected customer and appointment
    setSelectedCustomer(null);
    setSelectedAppointmentId(null);
    // Refresh the queue to show updated status
    setRefreshKey((prev) => prev + 1);
    // Navigate to queue
    setActiveTab('queue');
  };

  const handleNavigateToHistory = (customerInfo) => {
    // Store customer info in sessionStorage for CustomerHistoryView to read
    sessionStorage.setItem('selectedCustomerForHistory', JSON.stringify({
      id: customerInfo.customerId,
      fullName: customerInfo.customerName,
    }));
    // Navigate to history tab
    setActiveTab('history');
  };

  const handleWellnessSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "analytics":
        return (
          <div className="analytics-section">
            <NurseAnalytics refreshTrigger={queueRefreshTrigger} />
          </div>
        );

      case "queue":
        return (
          <div className="queue-section">
            <div className="queue-main">
              <LiveQueuePanel key={refreshKey} refreshTrigger={queueRefreshTrigger} onNavigateToHistory={handleNavigateToHistory} />
            </div>
            <div className="queue-sidebar">
              <CapacityTracker onCapacityUpdate={handleCapacityUpdate} />
              <CallNextControl onNavigateToVitals={handleNavigateToVitals} onStatusChanged={handleStatusChanged} />
            </div>
          </div>
        );

      case "vitals":
        return (
          <div className="vitals-section">
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
          <div className="walkin-section">
            <RegisterWalkIn
              onSuccess={handleWalkInSuccess}
              capacityAvailable={capacity?.available > 0}
            />
          </div>
        );

      case "wellness":
        return (
          <div className="wellness-section">
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
          <div className="history-section">
            <CustomerHistoryView customerId={selectedCustomer} />
          </div>
        );

      case "profile":
        return (
          <div className="profile-section">
            <ProfileSection onLogout={logout} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <NurseLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderContent()}
    </NurseLayout>
  );
}

export default NurseDashboard;
