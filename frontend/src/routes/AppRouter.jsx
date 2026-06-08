import { useState, useEffect, lazy, Suspense } from "react";
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

// Loading fallback for auth pages
const AuthLoading = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

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
        console.warn("Failed to parse systemSettings from localStorage:", error);
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
          JSON.stringify({ ...current, maintenanceMode: isEnabled })
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
        {/* Auth Routes */}
        <Route
          path="/login"
          element={
            <Suspense fallback={<AuthLoading />}>
              <RouteErrorBoundary>
                <Login />
              </RouteErrorBoundary>
            </Suspense>
          }
        />
        <Route
          path="/register"
          element={
            <Suspense fallback={<AuthLoading />}>
              <RouteErrorBoundary>
                <Register />
              </RouteErrorBoundary>
            </Suspense>
          }
        />

        {/* Patient Route - Using unified AppShell */}
        <Route
          path="/dashboard"
          element={
            <RoleBasedRoute allowedRoles={["STAFF"]}>
              <Suspense fallback={<DashboardSkeleton />}>
                <RouteErrorBoundary>
                  <PatientDashboard />
                </RouteErrorBoundary>
              </Suspense>
            </RoleBasedRoute>
          }
        />

        {/* Nurse Routes - Using unified AppShell */}
        <Route
          path="/nurse"
          element={
            <RoleBasedRoute allowedRoles={["NURSE_OFFICER"]}>
              <Suspense fallback={<DashboardSkeleton />}>
                <RouteErrorBoundary>
                  <NurseDashboard />
                </RouteErrorBoundary>
              </Suspense>
            </RoleBasedRoute>
          }
        />
        <Route
          path="/nurse-dashboard"
          element={<Navigate to="/nurse" replace />}
        />

        {/* Manager Routes - Using unified AppShell */}
        <Route
          path="/manager"
          element={
            <RoleBasedRoute allowedRoles={["MANAGER"]}>
              <Suspense fallback={<DashboardSkeleton />}>
                <RouteErrorBoundary>
                  <ManagerDashboard />
                </RouteErrorBoundary>
              </Suspense>
            </RoleBasedRoute>
          }
        />
        <Route
          path="/manager-profile"
          element={
            <RoleBasedRoute allowedRoles={["MANAGER"]}>
              <Suspense fallback={<DashboardSkeleton />}>
                <RouteErrorBoundary>
                  <ManagerProfile />
                </RouteErrorBoundary>
              </Suspense>
            </RoleBasedRoute>
          }
        />

        {/* Regional Routes - Using unified AppShell */}
        <Route
          path="/regional"
          element={
            <RoleBasedRoute allowedRoles={["REGIONAL_OFFICE"]}>
              <Suspense fallback={<DashboardSkeleton />}>
                <RouteErrorBoundary>
                  <RegionalDashboard />
                </RouteErrorBoundary>
              </Suspense>
            </RoleBasedRoute>
          }
        />
        <Route
          path="/regional-profile"
          element={
            <RoleBasedRoute allowedRoles={["REGIONAL_OFFICE"]}>
              <Suspense fallback={<DashboardSkeleton />}>
                <RouteErrorBoundary>
                  <RegionalProfile />
                </RouteErrorBoundary>
              </Suspense>
            </RoleBasedRoute>
          }
        />

        {/* Federal Routes - Using unified AppShell */}
        <Route
          path="/federal"
          element={
            <RoleBasedRoute allowedRoles={["FEDERAL_OFFICE"]}>
              <Suspense fallback={<DashboardSkeleton />}>
                <RouteErrorBoundary>
                  <FederalDashboard />
                </RouteErrorBoundary>
              </Suspense>
            </RoleBasedRoute>
          }
        />
        <Route
          path="/federal-profile"
          element={
            <RoleBasedRoute allowedRoles={["FEDERAL_OFFICE"]}>
              <Suspense fallback={<DashboardSkeleton />}>
                <RouteErrorBoundary>
                  <FederalProfile />
                </RouteErrorBoundary>
              </Suspense>
            </RoleBasedRoute>
          }
        />

        {/* Admin Routes - Using unified AppShell */}
        <Route
          path="/admin"
          element={
            <RoleBasedRoute allowedRoles={["SYSTEM_ADMIN"]}>
              <Suspense fallback={<DashboardSkeleton />}>
                <RouteErrorBoundary>
                  <AdminDashboard />
                </RouteErrorBoundary>
              </Suspense>
            </RoleBasedRoute>
          }
        />

        {/* Default Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default AppRouter;
