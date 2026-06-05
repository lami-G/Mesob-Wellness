/* ========================================
   BADGE COMPONENT
   Ethiopian Federal Healthcare Platform
   ======================================== */

import React from 'react';
import { cn } from '@/utils';
import type { BadgeVariant } from '@/types';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ children, variant = 'neutral', size = 'md', dot = false, className, ...props }, ref) => {
    const baseStyles = 'badge';
    const variantStyles = `badge-${variant}`;
    const sizeStyles = `badge-${size}`;

    return (
      <span
        ref={ref}
        className={cn(baseStyles, variantStyles, sizeStyles, className)}
        {...props}
      >
        {dot && <span className="badge-dot" />}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
