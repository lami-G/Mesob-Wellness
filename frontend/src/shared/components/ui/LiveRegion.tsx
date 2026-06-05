/* ========================================
   LIVE REGION COMPONENT
   Ethiopian Federal Healthcare Platform
   Accessibility - Screen Reader Announcements
   ======================================== */

import React, { useEffect, useRef } from 'react';

export interface LiveRegionProps {
  message: string;
  priority?: 'polite' | 'assertive';
  atomic?: boolean;
  clearAfter?: number;
}

/**
 * Live Region - Announces dynamic content to screen readers
 * Used for notifications, status updates, etc.
 */
export const LiveRegion: React.FC<LiveRegionProps> = ({
  message,
  priority = 'polite',
  atomic = true,
  clearAfter,
}) => {
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!clearAfter || !message) return;

    const timer = setTimeout(() => {
      if (regionRef.current) {
        regionRef.current.textContent = '';
      }
    }, clearAfter);

    return () => clearTimeout(timer);
  }, [message, clearAfter]);

  return (
    <div
      ref={regionRef}
      role="status"
      aria-live={priority}
      aria-atomic={atomic}
      className="sr-only"
    >
      {message}
    </div>
  );
};

LiveRegion.displayName = 'LiveRegion';
