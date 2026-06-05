/* ========================================
   STAT CARD COMPONENT
   Ethiopian Federal Healthcare Platform
   ======================================== */

import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  subtitle?: string;
  trend?: {
    direction: 'up' | 'down';
    text: string;
  };
  variant?: 'default' | 'teal' | 'success' | 'warning' | 'danger';
}

export const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  value,
  label,
  subtitle,
  trend,
  variant = 'default'
}) => {
  return (
    <div className={`stat-card ${variant}`}>
      <div className="stat-icon">
        <Icon size={16} aria-hidden="true" />
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {subtitle && <div className="stat-sub">{subtitle}</div>}
      {trend && (
        <div className={`stat-trend ${trend.direction}`}>
          {trend.direction === 'up' ? '↗' : '↘'} {trend.text}
        </div>
      )}
    </div>
  );
};

StatCard.displayName = 'StatCard';
