/* ========================================
   LOADING BOUNDARY COMPONENT
   Ethiopian Federal Healthcare Platform
   ======================================== */

import React, { Suspense } from 'react';
import { Spinner, SpinnerOverlay } from '../ui';

interface LoadingBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  overlay?: boolean;
  message?: string;
}

export const LoadingBoundary: React.FC<LoadingBoundaryProps> = ({
  children,
  fallback,
  overlay = false,
  message,
}) => {
  const defaultFallback = overlay ? (
    <SpinnerOverlay message={message} />
  ) : (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px',
        gap: '1rem',
      }}
    >
      <Spinner size="lg" />
      {message && (
        <p style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: 500 }}>
          {message}
        </p>
      )}
    </div>
  );

  return <Suspense fallback={fallback || defaultFallback}>{children}</Suspense>;
};
