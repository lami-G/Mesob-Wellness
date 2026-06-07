import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import BookingCalendar from "../../components/staff/Appointments/BookingCalendar";
import MyAppointments from "../../components/staff/Appointments/MyAppointments";
import HealthJourney from "../../components/staff/Health/HealthJourney";
import WellnessPlan from "../../components/staff/Wellness/WellnessPlan";
import ProfileSection from "../../components/staff/Profile/ProfileSection";
import FeedbackForm from "../../components/staff/Feedback/FeedbackForm";
import LongitudinalRecords from "../../components/staff/Records/LongitudinalRecords";
import styles from "./StaffDashboard.module.css";

function StaffDashboard() {
  const { user, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("appointments");

  useEffect(() => {
    const tab = searchParams.get("tab");
    const allowedTabs = ["appointments", "health", "wellness", "profile", "feedback", "records"];
    if (tab && allowedTabs.includes(tab)) {
      setActiveTab(tab);
      return;
    }
    setActiveTab("appointments");
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

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardContent}>
        {activeTab === "appointments" && (
          <>
            <BookingCalendar />
            <MyAppointments />
          </>
        )}

        {activeTab === "health" && (
          <>
            <HealthJourney />
          </>
        )}

        {activeTab === "wellness" && <WellnessPlan />}

        {activeTab === "records" && <LongitudinalRecords />}

        {activeTab === "feedback" && <FeedbackForm />}

        {activeTab === "profile" && <ProfileSection onLogout={logout} />}
      </div>
    </div>
  );
}

export default StaffDashboard;
