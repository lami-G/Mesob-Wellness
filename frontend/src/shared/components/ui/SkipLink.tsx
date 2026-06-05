/* ========================================
   SKIP LINK COMPONENT
   Ethiopian Federal Healthcare Platform
   Accessibility - Skip to Main Content
   ======================================== */

import React from 'react';
import { cn } from '@/utils';

export interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Skip Link - Allows keyboard users to skip navigation
 * Visible only when focused
 */
export const SkipLink: React.FC<SkipLinkProps> = ({ href, children, className }) => {
  return (
    <a
      href={href}
      className={cn(
        'skip-link',
        'sr-only focus:not-sr-only',
        'focus:fixed focus:top-4 focus:left-4 focus:z-50',
        'focus:px-4 focus:py-2',
        'focus:bg-primary-600 focus:text-white',
        'focus:rounded-md focus:shadow-lg',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        className
      )}
    >
      {children}
    </a>
  );
};

SkipLink.displayName = 'SkipLink';
