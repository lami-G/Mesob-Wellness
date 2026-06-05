/* ========================================
   SIDEBAR COMPONENT
   Ethiopian Federal Healthcare Platform
   ======================================== */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  Heart,
  FileText,
  MessageSquare,
  Users,
  ClipboardList,
  Stethoscope,
  UserPlus,
  Clock,
} from 'lucide-react';
import { useAuth } from '@/hooks';
import { cn, hasAnyRole } from '@/utils';
import type { UserRole } from '@/types';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles?: UserRole[];
  children?: NavItem[];
}

const navigationItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: <LayoutDashboard size={20} />,
    roles: ['STAFF', 'EXTERNAL_PATIENT'],
    children: [
      {
        label: 'Appointments',
        path: '/dashboard?tab=appointments',
        icon: <ClipboardList size={18} />,
      },
      {
        label: 'Health Journey',
        path: '/dashboard?tab=health',
        icon: <Activity size={18} />,
      },
      {
        label: 'Wellness Plan',
        path: '/dashboard?tab=wellness',
        icon: <Heart size={18} />,
      },
      {
        label: 'Health Records',
        path: '/dashboard?tab=records',
        icon: <FileText size={18} />,
      },
      {
        label: 'Feedback',
        path: '/dashboard?tab=feedback',
        icon: <MessageSquare size={18} />,
      },
    ],
  },
  {
    label: 'Nurse Dashboard',
    path: '/nurse',
    icon: <Stethoscope size={20} />,
    roles: ['NURSE_OFFICER'],
    children: [
      {
        label: 'Queue',
        path: '/nurse?tab=queue',
        icon: <Users size={18} />,
      },
      {
        label: 'Vitals',
        path: '/nurse?tab=vitals',
        icon: <Activity size={18} />,
      },
      {
        label: 'Walk-in',
        path: '/nurse?tab=walkin',
        icon: <UserPlus size={18} />,
      },
      {
        label: 'Wellness',
        path: '/nurse?tab=wellness',
        icon: <Heart size={18} />,
      },
      {
        label: 'History',
        path: '/nurse?tab=history',
        icon: <Clock size={18} />,
      },
    ],
  },
  {
    label: 'Manager Dashboard',
    path: '/manager',
    icon: <Users size={20} />,
    roles: ['MANAGER', 'REGIONAL_OFFICE', 'SYSTEM_ADMIN'],
  },
  {
    label: 'Regional Dashboard',
    path: '/regional',
    icon: <Users size={20} />,
    roles: ['REGIONAL_OFFICE', 'SYSTEM_ADMIN'],
  },
  {
    label: 'Admin Dashboard',
    path: '/admin',
    icon: <Users size={20} />,
    roles: ['SYSTEM_ADMIN'],
  },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => {
    if (path.includes('?')) {
      return location.pathname + location.search === path;
    }
    return location.pathname === path;
  };

  const shouldShowItem = (item: NavItem) => {
    if (!item.roles) return true;
    if (!user) return false;
    return hasAnyRole(user.role, item.roles);
  };

  const currentMainPath = location.pathname;
  const activeMainItem = navigationItems.find((item) => item.path === currentMainPath);

  return (
    <aside className="app-sidebar">
      <nav className="sidebar-nav-main">
        {navigationItems.map((item) => {
          if (!shouldShowItem(item)) return null;

          const isMainActive = isActive(item.path);
          const showChildren = item.children && isMainActive;

          return (
            <div key={item.path}>
              <Link
                className={cn('sidebar-link', isMainActive && 'active')}
                to={item.path}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>

              {showChildren && (
                <div className="sidebar-subnav">
                  {item.children!.map((child) => (
                    <Link
                      key={child.path}
                      className={cn(
                        'sidebar-sublink',
                        isActive(child.path) && 'active'
                      )}
                      to={child.path}
                    >
                      {child.icon}
                      <span>{child.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user-info">
          <p className="sidebar-user-role">
            {user?.role?.replace(/_/g, ' ')}
          </p>
        </div>
        <p className="sidebar-version">v1.0.0</p>
      </div>
    </aside>
  );
};
