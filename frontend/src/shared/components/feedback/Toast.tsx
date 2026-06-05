/* ========================================
   TOAST NOTIFICATION SYSTEM
   Ethiopian Federal Healthcare Platform
   ======================================== */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/utils';

// ========================================
// TYPES
// ========================================

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

// ========================================
// CONTEXT
// ========================================

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

// ========================================
// PROVIDER
// ========================================

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration || 5000,
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto-hide after duration
    if (newToast.duration > 0) {
      setTimeout(() => {
        hideToast(id);
      }, newToast.duration);
    }
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback(
    (message: string, title?: string) => {
      showToast({ type: 'success', message, title });
    },
    [showToast]
  );

  const error = useCallback(
    (message: string, title?: string) => {
      showToast({ type: 'error', message, title });
    },
    [showToast]
  );

  const warning = useCallback(
    (message: string, title?: string) => {
      showToast({ type: 'warning', message, title });
    },
    [showToast]
  );

  const info = useCallback(
    (message: string, title?: string) => {
      showToast({ type: 'info', message, title });
    },
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{ toasts, showToast, hideToast, success, error, warning, info }}
    >
      {children}
      <ToastContainer toasts={toasts} onClose={hideToast} />
    </ToastContext.Provider>
  );
};

// ========================================
// TOAST CONTAINER
// ========================================

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  if (toasts.length === 0) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        maxWidth: '400px',
        width: '100%',
      }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => onClose(toast.id)} />
      ))}
    </div>,
    document.body
  );
};

// ========================================
// TOAST ITEM
// ========================================

interface ToastItemProps {
  toast: Toast;
  onClose: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  const icons = {
    success: <CheckCircle size={20} />,
    error: <XCircle size={20} />,
    warning: <AlertCircle size={20} />,
    info: <Info size={20} />,
  };

  const colors = {
    success: {
      bg: '#dcfce7',
      border: '#22c55e',
      icon: '#16a34a',
      text: '#166534',
    },
    error: {
      bg: '#fee2e2',
      border: '#ef4444',
      icon: '#dc2626',
      text: '#991b1b',
    },
    warning: {
      bg: '#fef3c7',
      border: '#f59e0b',
      icon: '#d97706',
      text: '#92400e',
    },
    info: {
      bg: '#dbeafe',
      border: '#3b82f6',
      icon: '#2563eb',
      text: '#1e40af',
    },
  };

  const color = colors[toast.type];

  return (
    <div
      style={{
        background: color.bg,
        border: `2px solid ${color.border}`,
        borderRadius: '12px',
        padding: '1rem',
        boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        animation: 'slideInRight 0.3s ease-out',
      }}
      role="alert"
    >
      <div style={{ color: color.icon, flexShrink: 0 }}>{icons[toast.type]}</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {toast.title && (
          <div
            style={{
              fontWeight: 700,
              fontSize: '0.875rem',
              color: color.text,
              marginBottom: '0.25rem',
            }}
          >
            {toast.title}
          </div>
        )}
        <div
          style={{
            fontSize: '0.875rem',
            color: color.text,
            lineHeight: 1.5,
          }}
        >
          {toast.message}
        </div>
      </div>

      <button
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          padding: '0.25rem',
          cursor: 'pointer',
          color: color.icon,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '4px',
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(0,0,0,0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
        aria-label="Close notification"
      >
        <X size={16} />
      </button>

      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
