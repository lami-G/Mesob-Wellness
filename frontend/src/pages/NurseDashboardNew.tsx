/* ========================================
   NURSE DASHBOARD - GOVERNMENT DESIGN
   Ethiopian Federal Healthcare Platform
   ======================================== */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  AlertTriangle, 
  Check, 
  Activity, 
  Users,
  Calendar,
  ClipboardList,
  Stethoscope,
  Target,
  BookOpen,
  Bell,
  User as UserIcon
} from 'lucide-react';
import api from '@/services/api';

interface AnalyticsData {
  totalAppointments: number;
  completedToday: number;
  inProgressToday: number;
  pendingToday: number;
}

interface PatientCondition {
  id: string;
  patientId: string;
  patient: {
    fullName: string;
  };
  conditions: string[];
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  isNurseApproved: boolean;
}

const NurseDashboardNew: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('analytics');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [pendingConditions, setPendingConditions] = useState<PatientCondition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    fetchPendingConditions();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/api/v1/analytics/booking-stats');
      if (response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingConditions = async () => {
    try {
      const response = await api.get('/api/v1/patient-conditions/pending');
      if (response.data.success) {
        setPendingConditions(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching pending conditions:', error);
    }
  };

  const handleApproveCondition = async (conditionId: string) => {
    try {
      await api.post(`/api/v1/patient-conditions/${conditionId}/approve`);
      fetchPendingConditions(); // Refresh list
      fetchAnalytics(); // Update stats
    } catch (error) {
      console.error('Error approving condition:', error);
    }
  };

  return (
    <>
      <style>{`
        :root {
          --nav: #1A237E;
          --nav-mid: #283593;
          --nav-light: #3949AB;
          --sidebar: #162060;
          --sidebar-active: #1E2FA6;
          --teal: #00897B;
          --teal-light: #4DB6AC;
          --success: #2E7D32;
          --warning: #F57F17;
          --danger: #C62828;
          --bg: #F5F6FA;
          --card: #ffffff;
          --text-primary: #1A237E;
          --text-body: #333;
          --text-muted: #757575;
          --gold: #F9A825;
          --shadow: 0 2px 10px rgba(0,0,0,0.08);
          --radius: 8px;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body, .mesob-system { font-family: 'Trebuchet MS', system-ui, sans-serif; background: var(--bg); }

        .mesob-system { width: 100%; min-height: 100vh; display: flex; flex-direction: column; }

        /* HEADER */
        .gov-header {
          background: var(--nav);
          color: white;
          padding: 0 24px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 100;
          border-bottom: 3px solid var(--gold);
        }
        .header-logo { display: flex; align-items: center; gap: 12px; }
        .logo-circle {
          width: 36px; height: 36px; border-radius: 50%;
          border: 2px solid var(--gold);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700; color: var(--gold);
          background: rgba(249,168,37,0.1);
        }
        .header-org { line-height: 1.3; }
        .header-org .amharic { font-size: 10px; color: rgba(255,255,255,0.7); }
        .header-org .english { font-size: 12px; font-weight: 700; letter-spacing: 0.5px; }
        .header-title { font-size: 14px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
        .header-actions { display: flex; align-items: center; gap: 12px; }
        .role-badge {
          background: var(--gold); color: #1A237E;
          padding: 4px 12px; border-radius: 4px;
          font-size: 11px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.5px;
        }
        .icon-btn {
          width: 32px; height: 32px; border-radius: 50%;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.3);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: white; font-size: 14px;
        }

        /* LAYOUT */
        .main-layout { display: flex; flex: 1; }

        /* SIDEBAR */
        .sidebar {
          width: 220px; min-height: calc(100vh - 88px);
          background: var(--sidebar);
          flex-shrink: 0; padding: 16px 0;
          display: flex; flex-direction: column;
        }
        .sidebar-section { padding: 0 12px; margin-bottom: 8px; }
        .nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 6px; cursor: pointer;
          color: rgba(255,255,255,0.7); font-size: 12px; font-weight: 600;
          transition: all 0.15s; position: relative;
        }
        .nav-item.active {
          background: var(--sidebar-active); color: white;
          border-left: 3px solid var(--gold);
          padding-left: 9px;
        }
        .nav-item:hover:not(.active) { background: rgba(255,255,255,0.08); color: white; }
        .nav-item i { font-size: 16px; width: 18px; text-align: center; }
        .nav-badge {
          margin-left: auto; background: var(--teal);
          color: white; font-size: 9px; font-weight: 700;
          padding: 2px 6px; border-radius: 10px; min-width: 18px;
          text-align: center;
        }
        .sidebar-spacer { flex: 1; }

        /* MAIN CONTENT */
        .main-content { flex: 1; padding: 20px 24px; overflow: auto; }

        /* PAGE HEADER */
        .page-header { margin-bottom: 20px; }
        .page-breadcrumb { font-size: 11px; color: var(--text-muted); margin-bottom: 6px; }
        .page-breadcrumb span { color: var(--nav-light); }
        .page-title { font-size: 18px; font-weight: 700; color: var(--text-primary); }
        .page-subtitle { font-size: 12px; color: var(--text-muted); margin-top: 2px; }

        /* STAT CARDS */
        .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 14px; margin-bottom: 20px; }
        .stat-card {
          background: var(--card); border-radius: var(--radius);
          padding: 16px; box-shadow: var(--shadow);
          border-top: 4px solid var(--nav);
          position: relative; overflow: hidden;
        }
        .stat-card.teal { border-top-color: var(--teal); }
        .stat-card.success { border-top-color: var(--success); }
        .stat-card.warning { border-top-color: var(--warning); }
        .stat-card.danger { border-top-color: var(--danger); }
        .stat-card .stat-icon {
          width: 36px; height: 36px; border-radius: 50%;
          background: #E8EAF6; display: flex; align-items: center;
          justify-content: center; margin-bottom: 10px;
          color: var(--nav); font-size: 16px;
        }
        .stat-card.teal .stat-icon { background: #E0F2F1; color: var(--teal); }
        .stat-card.success .stat-icon { background: #E8F5E9; color: var(--success); }
        .stat-card.warning .stat-icon { background: #FFF3E0; color: var(--warning); }
        .stat-card.danger .stat-icon { background: #FFEBEE; color: var(--danger); }
        .stat-value { font-size: 28px; font-weight: 700; color: var(--text-primary); line-height: 1; }
        .stat-label { font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }

        /* CARDS */
        .card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
        .card-full { grid-column: 1 / -1; }
        .card {
          background: var(--card); border-radius: var(--radius);
          box-shadow: var(--shadow); overflow: hidden;
        }
        .card-header {
          padding: 14px 18px; border-bottom: 1px solid rgba(0,0,0,0.06);
          display: flex; align-items: center; justify-content: space-between;
        }
        .card-title { font-size: 13px; font-weight: 700; color: var(--text-primary); }
        .card-body { padding: 16px 18px; }
        .live-dot {
          display: flex; align-items: center; gap: 5px;
          font-size: 10px; font-weight: 700;
          color: var(--danger); text-transform: uppercase;
        }
        .live-dot::before {
          content: ''; width: 6px; height: 6px; border-radius: 50%;
          background: var(--danger); animation: pulse 1.5s infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

        /* TABLE */
        .data-table { width: 100%; border-collapse: collapse; font-size: 12px; }
        .data-table th {
          text-align: left; padding: 8px 12px;
          font-size: 11px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.5px; color: var(--text-muted);
          background: var(--bg); border-bottom: 1px solid rgba(0,0,0,0.08);
        }
        .data-table td {
          padding: 10px 12px; border-bottom: 1px solid rgba(0,0,0,0.04);
          color: var(--text-body); font-family: Calibri, system-ui;
        }
        .data-table tr:hover td { background: #F0F4FF; }
        .data-table tr:last-child td { border-bottom: none; }

        /* BADGES */
        .badge {
          display: inline-flex; align-items: center;
          padding: 3px 8px; border-radius: 10px;
          font-size: 10px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .badge-high { background: #FFEBEE; color: #C62828; }
        .badge-medium { background: #FFF8E1; color: #F57F17; }
        .badge-low { background: #E8F5E9; color: #2E7D32; }

        /* BUTTONS */
        .btn-primary {
          background: var(--nav); color: white; border: none;
          padding: 9px 20px; border-radius: 6px; cursor: pointer;
          font-size: 12px; font-weight: 700; letter-spacing: 0.5px;
          text-transform: uppercase; transition: background 0.15s;
        }
        .btn-primary:hover { background: var(--nav-mid); }
        .btn-secondary {
          background: white; color: var(--nav); border: 1px solid var(--nav);
          padding: 9px 20px; border-radius: 6px; cursor: pointer;
          font-size: 12px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;
        }

        /* FOOTER */
        .gov-footer {
          background: var(--nav);
          color: white;
          padding: 0 24px;
          display: flex; align-items: center; justify-content: space-between;
          min-height: 56px; border-top: 3px solid var(--gold);
        }
        .footer-left { font-size: 11px; color: rgba(255,255,255,0.6); }
        .footer-left strong { color: white; display: block; font-size: 12px; }
      `}</style>

      <div className="mesob-system">
        {/* HEADER */}
        <header className="gov-header">
          <div className="header-logo">
            <div className="logo-circle">M</div>
            <div className="header-org">
              <div className="amharic">በኢትዮጵያ ፌደራላዊ ዲሞክራሲያዊ ሪፐብሊክ</div>
              <div className="english">FDRE MESOB Wellness Service</div>
            </div>
          </div>
          <div className="header-title">MESOB Wellness — National Health Management System</div>
          <div className="header-actions">
            <div className="role-badge">Nurse Officer</div>
            <div className="icon-btn"><Bell size={16} /></div>
            <div className="icon-btn" onClick={logout}><UserIcon size={16} /></div>
          </div>
        </header>

        <div className="main-layout">
          {/* SIDEBAR */}
          <aside className="sidebar">
            <div className="sidebar-section">
              <div 
                className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
                onClick={() => setActiveTab('analytics')}
              >
                <Activity size={16} />
                <span>Analytics</span>
              </div>
              <div 
                className={`nav-item ${activeTab === 'queue' ? 'active' : ''}`}
                onClick={() => setActiveTab('queue')}
              >
                <ClipboardList size={16} />
                <span>Queue</span>
              </div>
              <div 
                className={`nav-item ${activeTab === 'vitals' ? 'active' : ''}`}
                onClick={() => setActiveTab('vitals')}
              >
                <Stethoscope size={16} />
                <span>Vitals</span>
              </div>
              <div 
                className={`nav-item ${activeTab === 'wellness' ? 'active' : ''}`}
                onClick={() => setActiveTab('wellness')}
              >
                <Target size={16} />
                <span>Wellness</span>
              </div>
              <div 
                className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                <BookOpen size={16} />
                <span>History</span>
              </div>
            </div>
            <div className="sidebar-spacer"></div>
          </aside>

          {/* MAIN */}
          <main className="main-content">
            <div className="page-header">
              <div className="page-breadcrumb">MESOB Wellness / <span>Nurse Officer Dashboard</span></div>
              <div className="page-title">Today's Overview</div>
              <div className="page-subtitle">Live data from your center · Last updated just now</div>
            </div>

            <div className="stat-grid">
              <div className="stat-card danger">
                <div className="stat-icon"><AlertTriangle size={18} /></div>
                <div className="stat-value">{pendingConditions.length}</div>
                <div className="stat-label">For Review</div>
              </div>
              <div className="stat-card teal">
                <div className="stat-icon"><Check size={18} /></div>
                <div className="stat-value">{analytics?.completedToday || 0}</div>
                <div className="stat-label">Completed Today</div>
              </div>
              <div className="stat-card warning">
                <div className="stat-icon"><Activity size={18} /></div>
                <div className="stat-value">{analytics?.inProgressToday || 0}</div>
                <div className="stat-label">In Progress</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><Users size={18} /></div>
                <div className="stat-value">{analytics?.totalAppointments || 0}</div>
                <div className="stat-label">Total Today</div>
              </div>
            </div>

            <div className="card-grid">
              <div className="card card-full">
                <div className="card-header">
                  <div className="card-title">Condition Review Queue</div>
                  <div className="live-dot">Live</div>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Conditions</th>
                        <th>Priority</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>Loading...</td></tr>
                      ) : pendingConditions.length === 0 ? (
                        <tr><td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>No pending conditions</td></tr>
                      ) : (
                        pendingConditions.map((condition) => (
                          <tr key={condition.id}>
                            <td>{condition.patient.fullName}</td>
                            <td>{condition.conditions.join(', ')}</td>
                            <td>
                              <span className={`badge badge-${condition.priority.toLowerCase()}`}>
                                {condition.priority}
                              </span>
                            </td>
                            <td>
                              <button 
                                className="btn-primary" 
                                style={{ fontSize: '10px', padding: '4px 10px' }}
                                onClick={() => handleApproveCondition(condition.id)}
                              >
                                Approve
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* FOOTER */}
        <footer className="gov-footer">
          <div className="footer-left">
            <strong>MESOB Wellness Service</strong>
            Ethiopian Federal Healthcare Platform
          </div>
        </footer>
      </div>
    </>
  );
};

export default NurseDashboardNew;
