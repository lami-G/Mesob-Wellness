/* ========================================
   GOVERNMENT SIDEBAR COMPONENT
   Ethiopian Federal Healthcare Platform
   ======================================== */

import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserHeart, 
  BarChart3, 
  FileText, 
  Calendar,
  Building
} from 'lucide-react';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: string;
  onClick?: () => void;
}

interface GovSidebarProps {
  navItems?: NavItem[];
}

const defaultNavItems: NavItem[] = [
  { icon: <LayoutDashboard size={16} />, label: 'Overview', active: true },
  { icon: <Users size={16} />, label: 'Staff', badge: '3' },
  { icon: <UserHeart size={16} />, label: 'Patients' },
  { icon: <BarChart3 size={16} />, label: 'Analytics' },
  { icon: <FileText size={16} />, label: 'Reports' },
  { icon: <Calendar size={16} />, label: 'Appointments', badge: '5' },
  { icon: <Building size={16} />, label: 'Centers' },
];

export const GovSidebar: React.FC<GovSidebarProps> = ({ 
  navItems = defaultNavItems 
}) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <div className="sidebar-section-label">Navigation</div>
        {navItems.map((item, index) => (
          <div 
            key={index}
            className={`nav-item ${item.active ? 'active' : ''}`}
            onClick={item.onClick}
            role="button"
            tabIndex={0}
          >
            {item.icon}
            <span>{item.label}</span>
            {item.badge && <span className="nav-badge">{item.badge}</span>}
          </div>
        ))}
      </div>
      
      <div className="sidebar-spacer"></div>
      
      <div style={{ padding: '0 12px', marginBottom: '12px' }}>
        <div className="sidebar-status">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span className="status-dot"></span>
            <span className="status-text" style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
              System Online
            </span>
          </div>
          <div className="status-text">API · DB · Auth — Active</div>
        </div>
      </div>
    </aside>
  );
};

GovSidebar.displayName = 'GovSidebar';
