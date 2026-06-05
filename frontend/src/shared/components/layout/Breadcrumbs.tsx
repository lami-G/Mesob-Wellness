/* ========================================
   BREADCRUMBS COMPONENT
   Ethiopian Federal Healthcare Platform
   ======================================== */

import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/utils';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  showHome = true,
  className,
}) => {
  return (
    <nav aria-label="Breadcrumb" className={cn('breadcrumbs', className)}>
      <ol className="breadcrumbs-list">
        {showHome && (
          <>
            <li className="breadcrumb-item">
              <Link to="/dashboard" className="breadcrumb-link">
                <Home size={16} />
              </Link>
            </li>
            <li className="breadcrumb-separator">
              <ChevronRight size={16} />
            </li>
          </>
        )}
        
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <React.Fragment key={index}>
              <li className="breadcrumb-item">
                {item.path && !isLast ? (
                  <Link to={item.path} className="breadcrumb-link">
                    {item.label}
                  </Link>
                ) : (
                  <span className="breadcrumb-current">{item.label}</span>
                )}
              </li>
              
              {!isLast && (
                <li className="breadcrumb-separator">
                  <ChevronRight size={16} />
                </li>
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};
