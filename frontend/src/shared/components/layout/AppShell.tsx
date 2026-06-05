/* ========================================
   APP SHELL COMPONENT
   Ethiopian Federal Healthcare Platform
   ======================================== */

import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useUIStore } from '@/stores';
import { cn } from '@/utils';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="layout-shell">
      <Header />
      
      <div className="layout-body">
        <Sidebar />
        
        <main
          className={cn(
            'app-main',
            sidebarCollapsed && 'app-main-expanded'
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
};
