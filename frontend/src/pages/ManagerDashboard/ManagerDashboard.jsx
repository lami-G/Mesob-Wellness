import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { analyticsService } from '../../services/analyticsService';
import ManagerLayout from '../../layouts/ManagerLayout';
import Overview from '../../components/manager/Overview/Overview';
import Capacity from '../../components/manager/Capacity/Capacity';
import Analytics from '../../components/manager/Analytics/Analytics';
import Users from '../../components/manager/Users/Users';
import Audit from '../../components/manager/Audit/Audit';
import Settings from '../../components/manager/Settings/Settings';
import Referrals from '../../components/nurse/Referrals/Referrals';
import '../../styles/admin-dashboard.css';
import '../../styles/tooltip-fix.css';
import styles from './ManagerDashboard.module.css';

// ─── Role guard ───────────────────────────────────────────────────────────────
// MANAGER role only — REGIONAL_OFFICE uses /regional, SYSTEM_ADMIN uses /admin
const MANAGER_ROLES = ['MANAGER'];

// ─── Root Component ───────────────────────────────────────────────────────────
const ManagerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab]       = useState('overview');
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [lastUpdated, setLastUpdated]   = useState(null);
  const [dateFilter, setDateFilter]     = useState('today');
  const [capacityInfo, setCapacityInfo] = useState(null);
  const [bookingStats, setBookingStats] = useState(null);
  const [queueData, setQueueData]       = useState(null);
  const [healthData, setHealthData]     = useState(null);
  const [users, setUsers]               = useState([]);
  const [auditLogs, setAuditLogs]       = useState([]);
  const [trendsData, setTrendsData]     = useState(null);
  const [systemSettings, setSystemSettings] = useState({
    dailySlotLimit: 36,
    appointmentIntervalMinutes: 15,
    walkInEnabled: true,
    autoConfirmBookings: false,
  });


  const hasAccess = MANAGER_ROLES.includes(user?.role);

  const loadDashboardData = useCallback(async (filter = 'today') => {
    setLoading(true);
    setError(null);
    try {
      // Convert filter to dateRange for API
      const dateRangeMap = {
        'today': '0',
        'week': '7',
        'month': '30',
        'all': 'all'
      };
      const dateRange = dateRangeMap[filter] || '0';
      
      const [capacity, booking, queue, health, settings, staffUsers, logs, trends] =
        await Promise.allSettled([
          analyticsService.getCapacityInfo(),
          analyticsService.getBookingStats(),
          analyticsService.getQueueAnalytics(),
          analyticsService.getHealthAnalytics({ dateRange }),
          analyticsService.getSystemSettings(),
          analyticsService.getStaffUsers(),
          analyticsService.getAuditLogs(30),
          analyticsService.getTrends(),
        ]);

      if (capacity.status === 'fulfilled')   setCapacityInfo(capacity.value.data);
      if (booking.status === 'fulfilled')    setBookingStats(booking.value.data);
      if (queue.status === 'fulfilled')      setQueueData(queue.value.data);
      if (health.status === 'fulfilled')     setHealthData(health.value.data);
      if (settings.status === 'fulfilled')   setSystemSettings(settings.value.data);
      if (staffUsers.status === 'fulfilled') {
        // Show NURSE_OFFICER and STAFF users from this center
        const centerStaff = staffUsers.value.data.filter(u => 
          u.role === 'NURSE_OFFICER' || u.role === 'STAFF'
        );
        setUsers(centerStaff);
      }
      if (logs.status === 'fulfilled')       setAuditLogs(logs.value.data);
      if (trends.status === 'fulfilled')     setTrendsData(trends.value.data);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to load dashboard data. Please refresh.');
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (hasAccess) {
      loadDashboardData(dateFilter);
    }
  }, [hasAccess, dateFilter, loadDashboardData]);

  const handleDateFilterChange = (newFilter) => {
    setDateFilter(newFilter);
  };
  useEffect(() => {
    if (hasAccess) {
      loadDashboardData();
    }
  }, [hasAccess, loadDashboardData]);

  if (!hasAccess) {
    return (
      <div className="dashboard-container">
        <div className="access-denied">
          <h2>🚫 Access Denied</h2>
          <p>Center Manager role required to access this dashboard.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview',  label: '📊 Overview'  },
    { id: 'capacity',  label: '📈 Capacity'  },
    { id: 'analytics', label: 'Analytics' },
    { id: 'referrals', label: 'Referrals' },
    { id: 'users',     label: `Staff (${users.length})`     },
    { id: 'audit',     label: 'Audit'     },
    { id: 'settings',  label: 'Settings'  },
  ];

  // Capacity urgency color
  const usedPct = capacityInfo
    ? Math.round((capacityInfo.slotsUsed / (capacityInfo.dailyLimit || 1)) * 100)
    : 0;
  const capacityColor = usedPct > 85 ? '#ef4444' : usedPct > 60 ? '#f59e0b' : '#22c55e';

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="dashboard-section">
            <Overview 
              loading={loading} 
              capacityInfo={capacityInfo} 
              bookingStats={bookingStats} 
              healthData={healthData}
              dateFilter={dateFilter}
              onDateFilterChange={handleDateFilterChange}
            />
          </div>
        );
      case 'capacity':
        return (
          <div className="dashboard-section">
            <Capacity loading={loading} capacityInfo={capacityInfo} />
          </div>
        );
      case 'analytics':
        return (
          <div className="dashboard-section">
            <Analytics loading={loading} queueData={queueData} healthData={healthData} trendsData={trendsData} />
          </div>
        );
      case 'referrals':
        return (
          <div className="dashboard-section">
            <Referrals />
          </div>
        );
      case 'users':
        return (
          <div className="dashboard-section">
            <Users loading={loading} users={users} onRefresh={loadDashboardData} />
          </div>
        );
      case 'audit':
        return (
          <div className="dashboard-section">
            <Audit loading={loading} logs={auditLogs} />
          </div>
        );
      case 'settings':
        return (
          <div className="dashboard-section">
            <Settings systemSettings={systemSettings} setSystemSettings={setSystemSettings} />
          </div>
        );
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <ManagerLayout 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      capacityInfo={capacityInfo}
      staffCount={users.length}
      onRefresh={loadDashboardData}
      loading={loading}
      error={error}
    >
      {renderContent()}
    </ManagerLayout>
  );
};

export default ManagerDashboard;
