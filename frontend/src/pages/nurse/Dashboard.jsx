import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import NurseAnalytics from "../../components/nurse/NurseAnalytics";
import LiveQueuePanel from "../../components/nurse/LiveQueuePanel";
import CapacityTracker from "../../components/nurse/CapacityTracker";
import RegisterWalkIn from "../../components/nurse/RegisterWalkIn";
import VitalsEntry from "../../components/nurse/VitalsEntry";
import CallNextControl from "../../components/nurse/CallNextControl";
import WellnessPlanCreation from "../../components/nurse/WellnessPlanCreation";
import CustomerHistoryView from "../../components/nurse/CustomerHistoryView";
import ProfileSection from "../../components/dashboard/ProfileSection";
// All styles imported through main.jsx - no additional imports needed

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

  const getTabTitle = () => {
    switch (activeTab) {
      case 'analytics': return 'Service Analytics';
      case 'queue': return 'Queue Management';
      case 'vitals': return 'Record Vitals';
      case 'walkin': return 'Register Walk-in';
      case 'wellness': return 'Create Wellness Plan';
      case 'history': return 'Patient History';
      case 'profile': return 'Profile';
      default: return 'Nurse Dashboard';
    }
  };

  return (
    <div className="mesob-nurse-dashboard">
      {/* FDRE MESOB Style Header */}
      <header className="mesob-header">
        <div className="mesob-header-left">
          <div className="mesob-logo">
            <span className="logo-icon">🏥</span>
            <div className="logo-text">
              <div className="logo-title">FDRE MESOB Health System</div>
              <div className="logo-subtitle">Federal Democratic Republic of Ethiopia MESOB Service</div>
            </div>
          </div>
        </div>
        <div className="mesob-header-right">
          <div className="header-user-info">
            <span className="user-role">Nurse Officer</span>
            <span className="user-name">{user?.fullName}</span>
          </div>
          <button className="notification-btn">🔔</button>
          <button className="profile-btn" onClick={() => setActiveTab('profile')}>
            {user?.fullName?.charAt(0) || 'N'}
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="mesob-nav-tabs">
        <button
          className={`mesob-tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <span className="tab-icon">📊</span>
          <span className="tab-label">Analytics</span>
        </button>
        
        <button
          className={`mesob-tab ${activeTab === 'queue' ? 'active' : ''}`}
          onClick={() => setActiveTab('queue')}
        >
          <span className="tab-icon">📋</span>
          <span className="tab-label">Queue</span>
        </button>
        
        <button
          className={`mesob-tab ${activeTab === 'vitals' ? 'active' : ''}`}
          onClick={() => setActiveTab('vitals')}
        >
          <span className="tab-icon">🩺</span>
          <span className="tab-label">Vitals</span>
        </button>
        
        <button
          className={`mesob-tab ${activeTab === 'walkin' ? 'active' : ''}`}
          onClick={() => setActiveTab('walkin')}
        >
          <span className="tab-icon">🚶</span>
          <span className="tab-label">Walk-in</span>
        </button>
        
        <button
          className={`mesob-tab ${activeTab === 'wellness' ? 'active' : ''}`}
          onClick={() => setActiveTab('wellness')}
        >
          <span className="tab-icon">💪</span>
          <span className="tab-label">Wellness</span>
        </button>
        
        <button
          className={`mesob-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <span className="tab-icon">📝</span>
          <span className="tab-label">History</span>
        </button>
      </nav>

      {/* Page Title Bar */}
      <div className="mesob-page-title">
        <h1>{getTabTitle()}</h1>
        <div className="breadcrumb">
          <span>Home</span>
          <span className="separator">/</span>
          <span className="current">{getTabTitle()}</span>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="mesob-content">
        {activeTab === "analytics" && (
          <div className="content-section">
            <NurseAnalytics refreshTrigger={queueRefreshTrigger} />
          </div>
        )}

        {activeTab === "queue" && (
          <div className="queue-layout">
            <div className="queue-main-panel">
              <LiveQueuePanel key={refreshKey} refreshTrigger={queueRefreshTrigger} onNavigateToHistory={handleNavigateToHistory} />
            </div>
            <div className="queue-side-panel">
              <CapacityTracker onCapacityUpdate={handleCapacityUpdate} />
              <CallNextControl onNavigateToVitals={handleNavigateToVitals} onStatusChanged={handleStatusChanged} />
            </div>
          </div>
        )}

        {activeTab === "vitals" && (
          <div className="content-section">
            <VitalsEntry
              customerId={selectedCustomer}
              appointmentId={selectedAppointmentId}
              onSuccess={handleVitalsSuccess}
              onNavigateToWellness={handleNavigateToWellness}
            />
          </div>
        )}

        {activeTab === "walkin" && (
          <div className="content-section">
            <RegisterWalkIn
              onSuccess={handleWalkInSuccess}
              capacityAvailable={capacity?.available > 0}
            />
          </div>
        )}

        {activeTab === "wellness" && (
          <div className="content-section">
            <WellnessPlanCreation
              customerId={selectedCustomer}
              appointmentId={selectedAppointmentId}
              onSuccess={handleWellnessSuccess}
              onBackToQueue={handleBackToQueue}
              onStatusChanged={handleStatusChanged}
            />
          </div>
        )}

        {activeTab === "history" && (
          <div className="content-section">
            <CustomerHistoryView customerId={selectedCustomer} />
          </div>
        )}

        {activeTab === "profile" && (
          <div className="content-section">
            <ProfileSection onLogout={logout} />
          </div>
        )}
      </main>
    </div>
  );
}

export default NurseDashboard;
