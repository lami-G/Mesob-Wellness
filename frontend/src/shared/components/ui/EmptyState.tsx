/* ========================================
   EMPTY STATE COMPONENT
   Ethiopian Federal Healthcare Platform
   ======================================== */

import React from 'react';
import { cn } from '@/utils';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon, title, description, action, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('empty-state', className)}
        {...props}
      >
        {icon && <div className="empty-state-icon">{icon}</div>}
        <h3 className="empty-state-title">{title}</h3>
        {description && <p className="empty-state-description">{description}</p>}
        {action && <div className="empty-state-action">{action}</div>}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';
