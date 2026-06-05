import React, { useState, useEffect, lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MainLayout from "../components/MainLayout";
import RoleBasedRoute from "../components/RoleBasedRoute";
import MaintenanceMode from "../components/MaintenanceMode";
import ErrorBoundary from "../components/errors/ErrorBoundary";
import RouteErrorBoundary from "../components/errors/RouteErrorBoundary";
import DashboardSkeleton from "../components/loading/DashboardSkeleton";
import api from "../services/api";

// Lazy-loaded route components for code splitting
const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));
const PatientDashboard = lazy(() => import("../pages/patient/Dashboard"));
const NurseDashboard = lazy(() => import("../pages/nurse/Dashboard"));
const ManagerDashboard = lazy(() => import("../pages/manager/Dashboard"));
const ManagerProfile = lazy(() => import("../pages/manager/Profile"));
const RegionalDashboard = lazy(() => import("../pages/regional/Dashboard"));
const RegionalProfile = lazy(() => import("../pages/regional/Profile"));
const FederalDashboard = lazy(() => import("../pages/federal/Dashboard"));
const FederalProfile = lazy(() => import("../pages/federal/Profile"));
const AdminDashboard = lazy(() => import("../pages/admin/Dashboard"));
import AdminDashboard from "../pages/admin/Dashboard";

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
    <ErrorBoundary>
      <Routes>
        <Route 
          path="/login" 
          element={
            <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
              <RouteErrorBoundary>
                <Login />
              </RouteErrorBoundary>
            </Suspense>
          } 
        />
        <Route 
          path="/register" 
          element={
            <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
              <RouteErrorBoundary>
                <Register />
              </RouteErrorBoundary>
            </Suspense>
          } 
        />
        <Route
          path="/dashboard"
          element={
            <RoleBasedRoute allowedRoles={["STAFF"]}>
              <Suspense fallback={<DashboardSkeleton />}>
                <RouteErrorBoundary>
                  <MainLayout>
                    <PatientDashboard />
                  </MainLayout>
                </RouteErrorBoundary>
              </Suspense>
            </RoleBasedRoute>
          }
        />
        <Route
          path="/nurse"
          element={
            <RoleBasedRoute allowedRoles={["NURSE_OFFICER"]}>
              <Suspense fallback={<DashboardSkeleton />}>
                <RouteErrorBoundary>
                  <MainLayout>
                    <NurseDashboard />
                  </MainLayout>
                </RouteErrorBoundary>
              </Suspense>
            </RoleBasedRoute>
          }
        />
              <NurseDashboard />
            </MainLayout>
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
            <ManagerProfile />
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
            <FederalProfile />
          </RoleBasedRoute>
        }
      />
      <Route
        path="/regional-profile"
        element={
          <RoleBasedRoute allowedRoles={["REGIONAL_OFFICE"]}>
            <RegionalProfile />
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
