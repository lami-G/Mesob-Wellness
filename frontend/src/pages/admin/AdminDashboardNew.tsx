/* ========================================
   ADMIN DASHBOARD - NEW DESIGN
   Ethiopian Federal Healthcare Platform
   ======================================== */

import React from 'react';
import { 
  Server, 
  Users, 
  AlertCircle, 
  Shield 
} from 'lucide-react';
import { GovHeader, GovSidebar, GovFooter } from '../../shared/components/layout';
import { StatCard } from '../../shared/components/ui';

const AdminDashboardNew: React.FC = () => {
  return (
    <div className="mesob-system" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <GovHeader userRole="System Admin" />
      
      <div className="main-layout">
        <GovSidebar navItems={[
          { icon: <Server size={16} />, label: 'System Overview', active: true },
          { icon: <Users size={16} />, label: 'User Management' },
          { icon: <Server size={16} />, label: 'System Health' },
          { icon: <Shield size={16} />, label: 'Audit Logs' },
          { icon: <AlertCircle size={16} />, label: 'Configuration', badge: '2' },
        ]} />
        
        <main className="main-content">
          {/* Page Header */}
          <div className="page-header">
            <div className="page-breadcrumb">
              MESOB Wellness / <span>System Administration</span>
            </div>
            <div className="page-title">System Health & Administration</div>
            <div className="page-subtitle">
              Platform management · MESOB Wellness v1.0
            </div>
          </div>

          {/* Stat Cards */}
          <div className="stat-grid">
            <StatCard
              icon={Server}
              value="99.9%"
              label="Uptime"
              variant="success"
            />
            <StatCard
              icon={Users}
              value="842"
              label="Active Users"
              variant="teal"
            />
            <StatCard
              icon={AlertCircle}
              value="2"
              label="Pending Config"
              variant="warning"
            />
            <StatCard
              icon={Shield}
              value="12"
              label="Audit Logs Today"
            />
          </div>

          {/* Cards Grid */}
          <div className="card-grid">
            {/* System Health */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">System Health</div>
                <div className="live-dot">Live</div>
              </div>
              <div className="card-body">
                <div className="sys-row">
                  <span className="sys-label">API Server</span>
                  <span className="sys-status">
                    <span className="dot-green"></span>Online
                  </span>
                </div>
                <div className="sys-row">
                  <span className="sys-label">Database</span>
                  <span className="sys-status">
                    <span className="dot-green"></span>Connected
                  </span>
                </div>
                <div className="sys-row">
                  <span className="sys-label">Email Service</span>
                  <span className="sys-status">
                    <span className="dot-green"></span>Configured
                  </span>
                </div>
                <div className="sys-row">
                  <span className="sys-label">Auth Service</span>
                  <span className="sys-status">
                    <span className="dot-green"></span>Active
                  </span>
                </div>
                <div className="sys-row">
                  <span className="sys-label">Rate Limiting</span>
                  <span className="sys-status">
                    <span className="dot-orange"></span>Not Set
                  </span>
                </div>
                <div className="sys-row">
                  <span className="sys-label">Caching Layer</span>
                  <span className="sys-status">
                    <span className="dot-orange"></span>Not Set
                  </span>
                </div>
                <div className="sys-row">
                  <span className="sys-label">Backup</span>
                  <span className="sys-status">
                    <span className="dot-orange"></span>Manual
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Audit Log */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">Recent Audit Log</div>
              </div>
              <div className="card-body">
                <div className="notif-item">
                  <div className="notif-dot" style={{ background: 'var(--teal)' }}></div>
                  <div>
                    <div className="notif-text">nurse.tigist — VITALS_RECORDED</div>
                    <div className="notif-time">08:55 today</div>
                  </div>
                </div>
                <div className="notif-item">
                  <div className="notif-dot" style={{ background: 'var(--nav-light)' }}></div>
                  <div>
                    <div className="notif-text">staff.habtamu — APPT_CREATED</div>
                    <div className="notif-time">08:48 today</div>
                  </div>
                </div>
                <div className="notif-item">
                  <div className="notif-dot" style={{ background: 'var(--warning)' }}></div>
                  <div>
                    <div className="notif-text">admin@mesob.gov — SETTINGS_UPDATED</div>
                    <div className="notif-time">08:30 today</div>
                  </div>
                </div>
                <div className="notif-item">
                  <div className="notif-dot" style={{ background: 'var(--success)' }}></div>
                  <div>
                    <div className="notif-text">manager.abebe — REPORT_EXPORTED</div>
                    <div className="notif-time">08:15 today</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <GovFooter />
    </div>
  );
};

export default AdminDashboardNew;
