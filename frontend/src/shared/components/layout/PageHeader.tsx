/* ========================================
   PAGE HEADER COMPONENT
   Ethiopian Federal Healthcare Platform
   ======================================== */

import React from 'react';
import { cn } from '@/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  action,
  breadcrumbs,
  className,
}) => {
  return (
    <div className={cn('page-header', className)}>
      {breadcrumbs && <div className="page-breadcrumbs">{breadcrumbs}</div>}
      
      <div className="page-header-content">
        <div className="page-header-text">
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        
        {action && <div className="page-header-action">{action}</div>}
      </div>
    </div>
  );
};
