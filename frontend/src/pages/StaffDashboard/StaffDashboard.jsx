import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import StaffLayout from "../../layouts/StaffLayout";
import BookingCalendar from "../../components/staff/Appointments/BookingCalendar";
import MyAppointments from "../../components/staff/Appointments/MyAppointments";
import HealthJourney from "../../components/staff/Health/HealthJourney";
import WellnessPlan from "../../components/staff/Wellness/WellnessPlan";
import ProfileSection from "../../components/staff/Profile/ProfileSection";
import FeedbackForm from "../../components/staff/Feedback/FeedbackForm";
import LongitudinalRecords from "../../components/staff/Records/LongitudinalRecords";

function StaffDashboard() {
  const { user, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("health");

  useEffect(() => {
    const tab = searchParams.get("tab");
    const allowedTabs = ["health", "appointments", "wellness", "profile", "feedback", "records"];
    if (tab && allowedTabs.includes(tab)) {
      setActiveTab(tab);
      return;
    }
    setActiveTab("health");
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
          <>
            <BookingCalendar />
            <MyAppointments />
          </>
        );

      case "health":
        return <HealthJourney />;

      case "wellness":
        return <WellnessPlan />;

      case "records":
        return <LongitudinalRecords />;

      case "feedback":
        return <FeedbackForm />;

      case "profile":
        return <ProfileSection onLogout={logout} />;

      default:
        return null;
    }
  };

  return (
    <StaffLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {renderContent()}
    </StaffLayout>
  );
}

export default StaffDashboard;
