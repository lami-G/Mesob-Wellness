/* ========================================
   STAFF DASHBOARD - NEW DESIGN
   Ethiopian Federal Healthcare Platform
   ======================================== */

import React from 'react';
import { 
  Calendar, 
  Clock, 
  Check, 
  MessageSquare 
} from 'lucide-react';
import { GovHeader, GovSidebar, GovFooter } from '../shared/components/layout';
import { StatCard } from '../shared/components/ui';

const StaffDashboardNew: React.FC = () => {
  return (
    <div className="mesob-system" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <GovHeader userRole="Staff" />
      
      <div className="main-layout">
        <GovSidebar navItems={[
          { icon: <Calendar size={16} />, label: 'My Queue', active: true },
          { icon: <Calendar size={16} />, label: 'Appointments', badge: '3' },
          { icon: <Clock size={16} />, label: 'Tasks', badge: '2' },
          { icon: <MessageSquare size={16} />, label: 'Messages', badge: '3' },
        ]} />
        
        <main className="main-content">
          {/* Page Header */}
          <div className="page-header">
            <div className="page-breadcrumb">
              MESOB Wellness / <span>Staff Dashboard</span>
            </div>
            <div className="page-title">Today's Work Queue</div>
            <div className="page-subtitle">
              Addis Ababa Health Center · Shift: Morning
            </div>
          </div>

          {/* Stat Cards */}
          <div className="stat-grid">
            <StatCard
              icon={Calendar}
              value="7"
              label="My Appointments"
              subtitle="3 remaining"
              variant="teal"
            />
            <StatCard
              icon={Clock}
              value="2"
              label="Pending Tasks"
              variant="warning"
            />
            <StatCard
              icon={Check}
              value="4"
              label="Completed"
              variant="success"
            />
            <StatCard
              icon={MessageSquare}
              value="3"
              label="Messages"
            />
          </div>

          {/* Cards Grid */}
          <div className="card-grid">
            {/* My Appointment List */}
            <div className="card card-full">
              <div className="card-header">
                <div className="card-title">My Appointment List</div>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Patient</th>
                      <th>Service Type</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>08:00</td>
                      <td>Worke Tadesse</td>
                      <td>Physical Exam</td>
                      <td><span className="badge badge-completed">Done</span></td>
                    </tr>
                    <tr>
                      <td>09:30</td>
                      <td>Selam Bekele</td>
                      <td>Wellness Consult</td>
                      <td><span className="badge badge-active">Active</span></td>
                    </tr>
                    <tr>
                      <td>11:00</td>
                      <td>Girma Ayana</td>
                      <td>Follow-Up</td>
                      <td><span className="badge badge-pending">Next</span></td>
                    </tr>
                    <tr>
                      <td>13:30</td>
                      <td>Hiwot Mengistu</td>
                      <td>Nutrition Check</td>
                      <td><span className="badge badge-pending">Scheduled</span></td>
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

export default StaffDashboardNew;
