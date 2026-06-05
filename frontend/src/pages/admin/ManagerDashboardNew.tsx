/* ========================================
   MANAGER DASHBOARD - NEW DESIGN
   Ethiopian Federal Healthcare Platform
   ======================================== */

import React from 'react';
import { 
  Users, 
  CalendarCheck, 
  Stethoscope, 
  AlertCircle, 
  Star,
  ClipboardCheck
} from 'lucide-react';
import { GovHeader, GovSidebar, GovFooter } from '../../shared/components/layout';
import { StatCard } from '../../shared/components/ui';

const ManagerDashboardNew: React.FC = () => {
  return (
    <div className="mesob-system" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <GovHeader userRole="Manager" />
      
      <div className="main-layout">
        <GovSidebar />
        
        <main className="main-content">
          {/* Page Header */}
          <div className="page-header">
            <div className="page-breadcrumb">
              MESOB Wellness / <span>Manager Dashboard</span>
            </div>
            <div className="page-title">Today's Center Overview</div>
            <div className="page-subtitle">
              Live data from Addis Ababa Health Center · Last updated 2 min ago
            </div>
          </div>

          {/* Stat Cards */}
          <div className="stat-grid">
            <StatCard
              icon={Users}
              value="18"
              label="Patients Today"
              trend={{ direction: 'up', text: '+3 vs yesterday' }}
            />
            <StatCard
              icon={CalendarCheck}
              value="94%"
              label="Fill Rate"
              subtitle="Target: 90%"
              variant="teal"
            />
            <StatCard
              icon={Stethoscope}
              value="3"
              label="Staff On Duty"
              subtitle="All present"
              variant="success"
            />
            <StatCard
              icon={AlertCircle}
              value="2"
              label="Urgent Cases"
              subtitle="Requires attention"
              variant="danger"
            />
            <StatCard
              icon={Star}
              value="4.6"
              label="Avg Rating"
              subtitle="NPS: 72 · 48 reviews"
              variant="warning"
            />
            <StatCard
              icon={ClipboardCheck}
              value="12"
              label="Completed Today"
              trend={{ direction: 'up', text: 'On track' }}
              variant="teal"
            />
          </div>

          {/* Cards Grid */}
          <div className="card-grid">
            {/* Staff On Duty Card */}
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">Staff On Duty</div>
                  <div className="card-subtitle">Current shift</div>
                </div>
                <div className="live-dot">Live</div>
              </div>
              <div className="card-body">
                <div className="info-row">
                  <div className="info-avatar">TH</div>
                  <div>
                    <div className="info-name">Nurse Tigist H.</div>
                    <div className="info-meta">Nurse Officer</div>
                  </div>
                  <div className="info-right">
                    <span className="badge badge-active">On Duty</span>
                  </div>
                </div>
                <div className="info-row">
                  <div className="info-avatar">LA</div>
                  <div>
                    <div className="info-name">Dr. Lemma A.</div>
                    <div className="info-meta">Staff Physician</div>
                  </div>
                  <div className="info-right">
                    <span className="badge badge-completed">In Service</span>
                  </div>
                </div>
                <div className="info-row">
                  <div className="info-avatar">HG</div>
                  <div>
                    <div className="info-name">Habtamu G.</div>
                    <div className="info-meta">Receptionist</div>
                  </div>
                  <div className="info-right">
                    <span className="badge badge-active">On Duty</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Service Volume Card */}
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">Daily Service Volume</div>
                  <div className="card-subtitle">This month</div>
                </div>
                <div className="live-dot">Live</div>
              </div>
              <div className="card-body">
                <div className="chart-area">
                  <div className="chart-bars">
                    {[45, 60, 55, 70, 65, 80, 72, 85, 78, 90, 82, 88, 95].map((height, i) => (
                      <div 
                        key={i}
                        className={`bar ${i === 9 ? 'teal' : ''} ${i === 12 ? 'highlight' : ''}`}
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '10px', color: 'var(--text-muted)' }}>
                  <span>May 1</span>
                  <span>May 14</span>
                  <span>Today</span>
                </div>
              </div>
            </div>

            {/* Recent Appointments Table */}
            <div className="card card-full">
              <div className="card-header">
                <div>
                  <div className="card-title">Recent Appointments</div>
                  <div className="card-subtitle">Today's schedule</div>
                </div>
                <button className="btn-secondary" style={{ fontSize: '11px', padding: '5px 12px' }}>
                  View All
                </button>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Time</th>
                      <th>Service</th>
                      <th>Staff</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Worke Tadesse</td>
                      <td>08:00</td>
                      <td>Vitals Check</td>
                      <td>Nurse Tigist</td>
                      <td><span className="badge badge-completed">Completed</span></td>
                      <td style={{ color: 'var(--nav-light)', cursor: 'pointer', fontWeight: 600 }}>View</td>
                    </tr>
                    <tr>
                      <td>Selam Bekele</td>
                      <td>09:30</td>
                      <td>Wellness Consult</td>
                      <td>Dr. Lemma</td>
                      <td><span className="badge badge-active">In Progress</span></td>
                      <td style={{ color: 'var(--nav-light)', cursor: 'pointer', fontWeight: 600 }}>View</td>
                    </tr>
                    <tr>
                      <td>Girma Ayana</td>
                      <td>10:00</td>
                      <td>Follow-Up</td>
                      <td>Dr. Lemma</td>
                      <td><span className="badge badge-pending">Waiting</span></td>
                      <td style={{ color: 'var(--nav-light)', cursor: 'pointer', fontWeight: 600 }}>View</td>
                    </tr>
                    <tr>
                      <td>Hiwot Mengistu</td>
                      <td>11:30</td>
                      <td>Nutrition Review</td>
                      <td>Nurse Tigist</td>
                      <td><span className="badge badge-pending">Scheduled</span></td>
                      <td style={{ color: 'var(--nav-light)', cursor: 'pointer', fontWeight: 600 }}>View</td>
                    </tr>
                    <tr>
                      <td>Abebe Girma</td>
                      <td>14:00</td>
                      <td>Physical Exam</td>
                      <td>Dr. Lemma</td>
                      <td><span className="badge badge-high">URGENT</span></td>
                      <td style={{ color: 'var(--nav-light)', cursor: 'pointer', fontWeight: 600 }}>View</td>
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

export default ManagerDashboardNew;
