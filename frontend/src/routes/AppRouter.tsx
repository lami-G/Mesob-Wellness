/* ========================================
   APP ROUTER (TYPESCRIPT)
   Ethiopian Federal Healthcare Platform
   ======================================== */

import React, { useState, useEffect, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LoadingBoundary } from '@/components/feedback';
import MainLayout from '../components/MainLayout';
import RoleBasedRoute from '../components/RoleBasedRoute';
import MaintenanceMode from '../components/MaintenanceMode';

// Eager-loaded pages
import Login from '../pages/Login';

// Lazy-loaded pages for code splitting
const Dashboard = lazy(() => import('../pages/PatientDashboardNew'));
const NurseDashboard = lazy(() => import('../pages/NurseDashboardNew'));
const ManagerDashboard = lazy(() => import('../pages/admin/ManagerDashboardNew'));
const RegionalDashboard = lazy(() => import('../pages/RegionalDashboardNew'));
const ManagerDashboardProfile = lazy(() => import('../pages/ManagerDashboardProfile'));
const RegionalDashboardProfile = lazy(() => import('../pages/RegionalDashboardProfile'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboardNew'));
const Register = lazy(() => import('../pages/Register'));

// Phase 3: Patient Management Module
const PatientManagement = lazy(() => import('../pages/admin/PatientManagement'));
const PatientProfile = lazy(() => import('../pages/admin/PatientProfile'));

// Phase 3: Notification Center
const NotificationCenter = lazy(() => import('../pages/admin/NotificationCenter'));

// Phase 3: Appointment Operations
const AppointmentOperations = lazy(() => import('../pages/admin/AppointmentOperations'));



// ========================================
// COMPONENT
// ========================================

const AppRouter: React.FC = () => {
  const { user } = useAuth();
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
    const checkMaintenanceMode = () => {
      const settings = localStorage.getItem('systemSettings');
      if (settings) {
        try {
          const parsed = JSON.parse(settings);
          setMaintenanceMode(parsed.maintenanceMode || false);
        } catch (error) {
          console.error('Error parsing system settings:', error);
        }
      }
    };

    checkMaintenanceMode();
    const interval = setInterval(checkMaintenanceMode, 5000);
    return () => clearInterval(interval);
  }, []);

  // Show maintenance page for non-admin users when maintenance mode is on
  // Allow login and admin routes even in maintenance mode
  const isLoginRoute = window.location.pathname === '/login';
  const isRegisterRoute = window.location.pathname === '/register';
  const isAdminRoute = window.location.pathname.startsWith('/admin');

  if (
    maintenanceMode &&
    user?.role !== 'SYSTEM_ADMIN' &&
    !isLoginRoute &&
    !isRegisterRoute &&
    !isAdminRoute
  ) {
    return <MaintenanceMode />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/register"
        element={
          <LoadingBoundary>
            <Register />
          </LoadingBoundary>
        }
      />
      <Route
        path="/dashboard"
        element={
          <RoleBasedRoute allowedRoles={['STAFF']}>
            <MainLayout>
              <LoadingBoundary>
                <Dashboard />
              </LoadingBoundary>
            </MainLayout>
          </RoleBasedRoute>
        }
      />
      <Route
        path="/nurse"
        element={
          <RoleBasedRoute allowedRoles={['NURSE_OFFICER']}>
            <LoadingBoundary>
              <NurseDashboard />
            </LoadingBoundary>
          </RoleBasedRoute>
        }
      />
      <Route path="/nurse-dashboard" element={<Navigate to="/nurse" replace />} />
      <Route
        path="/manager"
        element={
          <RoleBasedRoute allowedRoles={['MANAGER']}>
            <LoadingBoundary>
              <ManagerDashboard />
            </LoadingBoundary>
          </RoleBasedRoute>
        }
      />
      <Route
        path="/manager-profile"
        element={
          <RoleBasedRoute allowedRoles={['MANAGER']}>
            <LoadingBoundary>
              <ManagerDashboardProfile />
            </LoadingBoundary>
          </RoleBasedRoute>
        }
      />
      <Route
        path="/regional"
        element={
          <RoleBasedRoute allowedRoles={['REGIONAL_OFFICE', 'FEDERAL_OFFICE']}>
            <LoadingBoundary>
              <RegionalDashboard />
            </LoadingBoundary>
          </RoleBasedRoute>
        }
      />
      <Route
        path="/regional-profile"
        element={
          <RoleBasedRoute allowedRoles={['REGIONAL_OFFICE', 'FEDERAL_OFFICE']}>
            <LoadingBoundary>
              <RegionalDashboardProfile />
            </LoadingBoundary>
          </RoleBasedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <RoleBasedRoute allowedRoles={['SYSTEM_ADMIN']}>
            <LoadingBoundary>
              <AdminDashboard />
            </LoadingBoundary>
          </RoleBasedRoute>
        }
      />
      <Route
        path="/admin/patients"
        element={
          <RoleBasedRoute allowedRoles={['SYSTEM_ADMIN', 'MANAGER', 'REGIONAL_OFFICE', 'FEDERAL_OFFICE']}>
            <LoadingBoundary>
              <PatientManagement />
            </LoadingBoundary>
          </RoleBasedRoute>
        }
      />
      <Route
        path="/admin/patients/:id"
        element={
          <RoleBasedRoute allowedRoles={['SYSTEM_ADMIN', 'MANAGER', 'REGIONAL_OFFICE', 'FEDERAL_OFFICE', 'NURSE_OFFICER']}>
            <LoadingBoundary>
              <PatientProfile />
            </LoadingBoundary>
          </RoleBasedRoute>
        }
      />
      <Route
        path="/admin/notifications"
        element={
          <RoleBasedRoute allowedRoles={['SYSTEM_ADMIN', 'MANAGER', 'REGIONAL_OFFICE', 'FEDERAL_OFFICE', 'NURSE_OFFICER', 'STAFF']}>
            <LoadingBoundary>
              <NotificationCenter />
            </LoadingBoundary>
          </RoleBasedRoute>
        }
      />
      <Route
        path="/admin/appointments"
        element={
          <RoleBasedRoute allowedRoles={['SYSTEM_ADMIN', 'MANAGER', 'NURSE_OFFICER']}>
            <LoadingBoundary>
              <AppointmentOperations />
            </LoadingBoundary>
          </RoleBasedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRouter;
