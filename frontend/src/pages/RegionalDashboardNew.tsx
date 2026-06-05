/* ========================================
   REGIONAL DASHBOARD - NEW DESIGN
   Ethiopian Federal Healthcare Platform
   ======================================== */

import React from 'react';
import { 
  Building, 
  Users, 
  Star, 
  AlertCircle 
} from 'lucide-react';
import { GovHeader, GovSidebar, GovFooter } from '../shared/components/layout';
import { StatCard } from '../shared/components/ui';

const RegionalDashboardNew: React.FC = () => {
  return (
    <div className="mesob-system" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <GovHeader userRole="Regional Officer" />
      
      <div className="main-layout">
        <GovSidebar navItems={[
          { icon: <Building size={16} />, label: 'Region Overview', active: true },
          { icon: <Building size={16} />, label: 'Centers' },
          { icon: <Users size={16} />, label: 'Patients' },
          { icon: <AlertCircle size={16} />, label: 'Flagged Issues', badge: '3' },
        ]} />
        
        <main className="main-content">
          {/* Page Header */}
          <div className="page-header">
            <div className="page-breadcrumb">
              MESOB Wellness / <span>Regional Officer Dashboard</span>
            </div>
            <div className="page-title">Addis Ababa Region Overview</div>
            <div className="page-subtitle">
              Aggregated data from 8 centers · This month
            </div>
          </div>

          {/* Stat Cards */}
          <div className="stat-grid">
            <StatCard
              icon={Building}
              value="8"
              label="Centers"
              subtitle="7 active, 1 upgrading"
            />
            <StatCard
              icon={Users}
              value="4,821"
              label="Patients Served"
              trend={{ direction: 'up', text: '+9% this month' }}
              variant="teal"
            />
            <StatCard
              icon={Star}
              value="97.2%"
              label="Satisfaction"
              variant="success"
            />
            <StatCard
              icon={AlertCircle}
              value="3"
              label="Flagged Issues"
              variant="warning"
            />
          </div>

          {/* Cards Grid */}
          <div className="card-grid">
            {/* Center Performance */}
            <div className="card card-full">
              <div className="card-header">
                <div className="card-title">Center Performance</div>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Center</th>
                      <th>Patients MTD</th>
                      <th>Satisfaction</th>
                      <th>Capacity</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Bole Health Center</td>
                      <td>842</td>
                      <td>98.1%</td>
                      <td>91%</td>
                      <td><span className="badge badge-active">Active</span></td>
                    </tr>
                    <tr>
                      <td>Kirkos Wellness Hub</td>
                      <td>710</td>
                      <td>96.5%</td>
                      <td>85%</td>
                      <td><span className="badge badge-active">Active</span></td>
                    </tr>
                    <tr>
                      <td>Yeka Community Center</td>
                      <td>654</td>
                      <td>97.8%</td>
                      <td>78%</td>
                      <td><span className="badge badge-active">Active</span></td>
                    </tr>
                    <tr>
                      <td>Nifas Silk Center</td>
                      <td>510</td>
                      <td>95.2%</td>
                      <td>70%</td>
                      <td><span className="badge badge-pending">Review</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      <GovFooter />
    </div>
  );
};

export default RegionalDashboardNew;
