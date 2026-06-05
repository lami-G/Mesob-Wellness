/* ========================================
   FEDERAL DASHBOARD - NEW DESIGN
   Ethiopian Federal Healthcare Platform
   ======================================== */

import React from 'react';
import { 
  Map, 
  Building, 
  Users, 
  Star,
  List,
  Wrench
} from 'lucide-react';
import { GovHeader, GovSidebar, GovFooter } from '../shared/components/layout';
import { StatCard } from '../shared/components/ui';

const FederalDashboardNew: React.FC = () => {
  return (
    <div className="mesob-system" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <GovHeader userRole="Federal Office" />
      
      <div className="main-layout">
        <GovSidebar navItems={[
          { icon: <Map size={16} />, label: 'National Overview', active: true },
          { icon: <Map size={16} />, label: 'All Regions' },
          { icon: <Building size={16} />, label: 'All Centers' },
        ]} />
        
        <main className="main-content">
          {/* Page Header */}
          <div className="page-header">
            <div className="page-breadcrumb">
              MESOB Wellness / <span>Federal Office Dashboard</span>
            </div>
            <div className="page-title">National Health Overview</div>
            <div className="page-subtitle">
              All regions · All centers · Real-time aggregation
            </div>
          </div>

          {/* Stat Cards */}
          <div className="stat-grid">
            <StatCard
              icon={Map}
              value="15"
              label="Regions"
            />
            <StatCard
              icon={Building}
              value="27"
              label="MESOB Centers"
              variant="teal"
            />
            <StatCard
              icon={Users}
              value="45,699"
              label="Citizens This Month"
              subtitle="499,946 total served"
              variant="success"
            />
            <StatCard
              icon={Star}
              value="98.8%"
              label="Avg Satisfaction"
              variant="warning"
            />
            <StatCard
              icon={List}
              value="1,332"
              label="Total Services"
            />
            <StatCard
              icon={Wrench}
              value="0"
              label="Centers Under Construction"
              subtitle="3 recently completed"
              variant="success"
            />
          </div>

          {/* Cards Grid */}
          <div className="card-grid">
            {/* Daily Service Delivery */}
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">Daily Service Delivery</div>
                </div>
                <div className="live-dot">Live</div>
              </div>
              <div className="card-body">
                <div className="chart-area">
                  <div className="chart-bars">
                    {[55, 65, 60, 75, 70, 80, 72, 88, 85, 90, 78, 88, 100].map((height, i) => (
                      <div 
                        key={i}
                        className={`bar ${i === 3 ? 'teal' : ''} ${i === 12 ? 'highlight' : ''}`}
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Satisfaction Rate */}
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">Daily Satisfaction Rate</div>
                </div>
                <div className="live-dot">Live</div>
              </div>
              <div className="card-body">
                <div className="chart-area">
                  <div className="chart-bars">
                    {[97, 99, 98, 99, 100, 97, 99, 98, 100, 99, 98, 99, 99].map((height, i) => (
                      <div 
                        key={i}
                        className={`bar teal ${i === 12 ? 'highlight' : ''}`}
                        style={{ height: `${height}%` }}
                      />
                    ))}
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

export default FederalDashboardNew;
