/* ========================================
   PATIENT DASHBOARD - NEW DESIGN
   Ethiopian Federal Healthcare Platform
   ======================================== */

import React from 'react';
import { 
  Calendar, 
  Heart, 
  Scale, 
  Pill 
} from 'lucide-react';
import { GovHeader, GovSidebar, GovFooter } from '../shared/components/layout';
import { StatCard } from '../shared/components/ui';

const PatientDashboardNew: React.FC = () => {
  return (
    <div className="mesob-system" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <GovHeader userRole="Patient" />
      
      <div className="main-layout">
        <GovSidebar navItems={[
          { icon: <Heart size={16} />, label: 'My Dashboard', active: true },
          { icon: <Calendar size={16} />, label: 'Appointments', badge: '2' },
          { icon: <Heart size={16} />, label: 'Wellness Goals' },
        ]} />
        
        <main className="main-content">
          {/* Page Header */}
          <div className="page-header">
            <div className="page-breadcrumb">
              MESOB Wellness / <span>My Health Portal</span>
            </div>
            <div className="page-title">Welcome, Worke Tadesse</div>
            <div className="page-subtitle">
              Your personal wellness dashboard
            </div>
          </div>

          {/* Stat Cards */}
          <div className="stat-grid">
            <StatCard
              icon={Calendar}
              value="2"
              label="Upcoming Appts"
              subtitle="Next: May 30"
              variant="teal"
            />
            <StatCard
              icon={Heart}
              value="120/80"
              label="Last BP Reading"
              subtitle="May 23 · Normal"
            />
            <StatCard
              icon={Scale}
              value="72kg"
              label="Weight"
              trend={{ direction: 'up', text: 'Healthy BMI' }}
              variant="success"
            />
            <StatCard
              icon={Pill}
              value="1"
              label="Active Referrals"
              subtitle="Specialist review"
              variant="warning"
            />
          </div>

          {/* Cards Grid */}
          <div className="card-grid">
            {/* My Appointments */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">My Appointments</div>
              </div>
              <div className="card-body">
                <div className="info-row">
                  <div className="info-avatar" style={{ background: '#E0F2F1', color: 'var(--teal)' }}>
                    <Heart size={14} />
                  </div>
                  <div>
                    <div className="info-name">Wellness Consultation</div>
                    <div className="info-meta">May 30 · 10:00 AM · Dr. Lemma</div>
                  </div>
                  <div className="info-right">
                    <span className="badge badge-completed">Confirmed</span>
                  </div>
                </div>
                <div className="info-row">
                  <div className="info-avatar" style={{ background: '#E8EAF6', color: 'var(--nav)' }}>
                    <Calendar size={14} />
                  </div>
                  <div>
                    <div className="info-name">Lab Results Review</div>
                    <div className="info-meta">Jun 5 · 09:00 AM · Nurse Tigist</div>
                  </div>
                  <div className="info-right">
                    <span className="badge badge-pending">Pending</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Wellness Goals */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">Wellness Goals</div>
              </div>
              <div className="card-body">
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px' }}>
                    <span>Daily Steps</span>
                    <span style={{ fontWeight: 600, color: 'var(--teal)' }}>7,200 / 10,000</span>
                  </div>
                  <div className="progress-wrap">
                    <div className="progress-fill teal" style={{ width: '72%' }}></div>
                  </div>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px' }}>
                    <span>Water Intake</span>
                    <span style={{ fontWeight: 600, color: 'var(--nav-light)' }}>1.8L / 2.5L</span>
                  </div>
                  <div className="progress-wrap">
                    <div className="progress-fill" style={{ width: '72%' }}></div>
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px' }}>
                    <span>Sleep Quality</span>
                    <span style={{ fontWeight: 600, color: 'var(--success)' }}>Good</span>
                  </div>
                  <div className="progress-wrap">
                    <div className="progress-fill success" style={{ width: '80%' }}></div>
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

export default PatientDashboardNew;
