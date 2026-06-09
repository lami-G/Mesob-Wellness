import React, { useState, useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RoleBasedRoute from "../components/RoleBasedRoute";
import MaintenanceMode from "../components/MaintenanceMode";
import api from "../services/api";
import StaffDashboard from "../pages/StaffDashboard/StaffDashboard";
import NurseDashboard from "../pages/NurseDashboard/NurseDashboard";
import ManagerDashboard from "../pages/ManagerDashboard/ManagerDashboard";
import RegionalDashboard from "../pages/RegionalDashboard/RegionalDashboard";
import ManagerDashboardProfile from "../pages/ManagerDashboardProfile";
import RegionalDashboardProfile from "../pages/RegionalDashboardProfile";
import FederalDashboardProfile from "../pages/FederalDashboardProfile";
import FederalDashboard from "../pages/FederalDashboard/FederalDashboard";
import AdminDashboard from "../pages/AdminDashboard/AdminDashboard";
import Login from "../pages/Login";
import Register from "../pages/Register";

function AppRouter() {
  const { user } = useAuth();
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const readLocalSettings = () => {
      const settings = localStorage.getItem("systemSettings");
      if (!settings) return {};
      try {
        return JSON.parse(settings);
      } catch (error) {
        console.warn(
          "Failed to parse systemSettings from localStorage:",
          error,
        );
        return {};
      }
    };

    const checkMaintenanceMode = async () => {
      try {
        const response = await api.get("/api/v1/settings/public");
        const isEnabled = Boolean(response?.data?.data?.maintenanceMode);

        if (isMounted) {
          setMaintenanceMode(isEnabled);
        }

        const current = readLocalSettings();
        localStorage.setItem(
          "systemSettings",
          JSON.stringify({ ...current, maintenanceMode: isEnabled }),
        );
      } catch (error) {
        const current = readLocalSettings();
        if (isMounted) {
          setMaintenanceMode(Boolean(current.maintenanceMode));
        }
      }
    };

    checkMaintenanceMode();
    const interval = setInterval(checkMaintenanceMode, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Show maintenance page for non-admin users when maintenance mode is on
  // Allow login and admin routes even in maintenance mode
  const isLoginRoute = window.location.pathname === "/login";
  const isRegisterRoute = window.location.pathname === "/register";
  const isAdminRoute = window.location.pathname.startsWith("/admin");

  if (
    maintenanceMode &&
    user?.role !== "SYSTEM_ADMIN" &&
    !isLoginRoute &&
    !isRegisterRoute &&
    !isAdminRoute
  ) {
    return <MaintenanceMode />;
  }
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <RoleBasedRoute allowedRoles={["STAFF"]}>
            <StaffDashboard />
          </RoleBasedRoute>
        }
      />
      <Route
        path="/nurse"
        element={
          <RoleBasedRoute allowedRoles={["NURSE_OFFICER"]}>
            <NurseDashboard />
          </RoleBasedRoute>
        }
      />
      <Route
        path="/nurse-dashboard"
        element={<Navigate to="/nurse" replace />}
      />
      <Route
        path="/manager"
        element={
          <RoleBasedRoute allowedRoles={["MANAGER"]}>
            <ManagerDashboard />
          </RoleBasedRoute>
        }
      />
      <Route
        path="/manager-profile"
        element={
          <RoleBasedRoute allowedRoles={["MANAGER"]}>
            <ManagerDashboardProfile />
          </RoleBasedRoute>
        }
      />
      <Route
        path="/regional"
        element={
          <RoleBasedRoute allowedRoles={["REGIONAL_OFFICE"]}>
            <RegionalDashboard />
          </RoleBasedRoute>
        }
      />
      <Route
        path="/federal"
        element={
          <RoleBasedRoute allowedRoles={["FEDERAL_OFFICE"]}>
            <FederalDashboard />
          </RoleBasedRoute>
        }
      />
      <Route
        path="/federal-profile"
        element={
          <RoleBasedRoute allowedRoles={["FEDERAL_OFFICE"]}>
            <FederalDashboardProfile />
          </RoleBasedRoute>
        }
      />
      <Route
        path="/regional-profile"
        element={
          <RoleBasedRoute allowedRoles={["REGIONAL_OFFICE"]}>
            <RegionalDashboardProfile />
          </RoleBasedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <RoleBasedRoute allowedRoles={["SYSTEM_ADMIN"]}>
            <AdminDashboard />
          </RoleBasedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRouter;
