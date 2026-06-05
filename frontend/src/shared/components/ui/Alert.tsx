/* ========================================
   ALERT COMPONENT
   Ethiopian Federal Healthcare Platform
   ======================================== */

import React from 'react';
import { cn } from '@/utils';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';
import type { AlertVariant } from '@/types';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  onClose?: () => void;
  icon?: React.ReactNode;
}

const variantIcons: Record<AlertVariant, React.ReactNode> = {
  success: <CheckCircle size={20} />,
  warning: <AlertCircle size={20} />,
  danger: <XCircle size={20} />,
  info: <Info size={20} />,
};

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ children, variant = 'info', title, onClose, icon, className, ...props }, ref) => {
    const baseStyles = 'alert';
    const variantStyles = `alert-${variant}`;

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(baseStyles, variantStyles, className)}
        {...props}
      >
        <div className="alert-icon">{icon || variantIcons[variant]}</div>
        
        <div className="alert-content">
          {title && <div className="alert-title">{title}</div>}
          <div className="alert-message">{children}</div>
        </div>
        
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="alert-close"
            aria-label="Close alert"
          >
            <X size={16} />
          </button>
        )}
      </div>
    );
  }
);

Alert.displayName = 'Alert';
