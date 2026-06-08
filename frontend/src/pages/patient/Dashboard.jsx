import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import StaffLayout from "../../layouts/StaffLayout";
import BookingCalendar from "../../components/dashboard/BookingCalendar";
import MyAppointments from "../../components/dashboard/MyAppointments";
import HealthJourney from "../../components/dashboard/HealthJourney";
import WellnessPlan from "../../components/dashboard/WellnessPlan";
import ProfileSection from "../../components/dashboard/ProfileSection";
import RiskScoring from "../../components/dashboard/RiskScoring";
import HealthAlerts from "../../components/dashboard/HealthAlerts";
import FeedbackForm from "../../components/dashboard/FeedbackForm";
import LongitudinalRecords from "../../components/dashboard/LongitudinalRecords";

/**
 * Patient/Staff Dashboard - Unified MESOB Layout
 * Uses AppShell through StaffLayout for consistent experience
 */
function Dashboard() {
  const { user, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("appointments");

  useEffect(() => {
    const tab = searchParams.get("tab");
    const allowedTabs = ["appointments", "health", "wellness", "profile", "feedback", "records"];
    if (tab && allowedTabs.includes(tab)) {
      setActiveTab(tab);
    } else {
      setActiveTab("appointments");
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

  // Listen for navigate to appointments event
  useEffect(() => {
    const handleNavigateToAppointments = () => {
      setActiveTab('appointments');
    };
    
    window.addEventListener('navigateToAppointments', handleNavigateToAppointments);
    return () => window.removeEventListener('navigateToAppointments', handleNavigateToAppointments);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "appointments":
        return (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>My Appointments</h2>
              <p style={{ color: '#6b7280', marginTop: '0.25rem' }}>
                Book and manage your wellness appointments
              </p>
            </div>
            <BookingCalendar />
            <div style={{ marginTop: '2rem' }}>
              <MyAppointments />
            </div>
          </div>
        );

      case "health":
        return (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Health Journey</h2>
              <p style={{ color: '#6b7280', marginTop: '0.25rem' }}>
                Track your health metrics and progress
              </p>
            </div>
            <HealthAlerts />
            <div style={{ marginTop: '1.5rem' }}>
              <RiskScoring />
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <HealthJourney />
            </div>
          </div>
        );

      case "wellness":
        return (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Wellness Plan</h2>
              <p style={{ color: '#6b7280', marginTop: '0.25rem' }}>
                Your personalized wellness recommendations
              </p>
            </div>
            <WellnessPlan />
          </div>
        );

      case "records":
        return (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Health Records</h2>
              <p style={{ color: '#6b7280', marginTop: '0.25rem' }}>
                View your complete health history
              </p>
            </div>
            <LongitudinalRecords />
          </div>
        );

      case "feedback":
        return (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Feedback</h2>
              <p style={{ color: '#6b7280', marginTop: '0.25rem' }}>
                Share your experience with us
              </p>
            </div>
            <FeedbackForm />
          </div>
        );

      case "profile":
        return (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>My Profile</h2>
              <p style={{ color: '#6b7280', marginTop: '0.25rem' }}>
                Manage your personal information
              </p>
            </div>
            <ProfileSection onLogout={logout} />
          </div>
        );

      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <StaffLayout 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      user={user}
    >
      {renderContent()}
    </StaffLayout>
  );
}

export default Dashboard;
