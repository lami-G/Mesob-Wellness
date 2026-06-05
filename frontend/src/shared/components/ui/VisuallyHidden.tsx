/* ========================================
   VISUALLY HIDDEN COMPONENT
   Ethiopian Federal Healthcare Platform
   Accessibility - Screen Reader Only Content
   ======================================== */

import React from 'react';

export interface VisuallyHiddenProps {
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Visually Hidden - Hides content visually but keeps it accessible to screen readers
 * Use for descriptive text, labels, etc.
 */
export const VisuallyHidden: React.FC<VisuallyHiddenProps> = ({ 
  children, 
  as: Component = 'span' 
}) => {
  return <Component className="sr-only">{children}</Component>;
};

VisuallyHidden.displayName = 'VisuallyHidden';
