/* ========================================
   ACCESSIBILITY UTILITIES
   Ethiopian Federal Healthcare Platform
   WCAG 2.1 AA Compliance Helpers
   ======================================== */

/**
 * Focus Management Utilities
 */

export const focusManagement = {
  /**
   * Trap focus within an element (for modals, dropdowns)
   */
  trapFocus: (element: HTMLElement) => {
    const focusableElements = element.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable?.focus();
          e.preventDefault();
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);
    return () => element.removeEventListener('keydown', handleTabKey);
  },

  /**
   * Store and restore focus (for modals)
   */
  storeFocus: () => {
    const previouslyFocused = document.activeElement as HTMLElement;
    return () => previouslyFocused?.focus();
  },

  /**
   * Focus first error in form
   */
  focusFirstError: (formElement: HTMLElement) => {
    const firstError = formElement.querySelector<HTMLElement>('[aria-invalid="true"]');
    firstError?.focus();
  },

  /**
   * Move focus to main content (skip links)
   */
  skipToMain: () => {
    const main = document.querySelector<HTMLElement>('main, [role="main"]');
    if (main) {
      main.tabIndex = -1;
      main.focus();
      main.removeAttribute('tabindex');
    }
  },
};

/**
 * ARIA Announcements
 */

let announcer: HTMLDivElement | null = null;

export const announce = {
  /**
   * Initialize screen reader announcer
   */
  init: () => {
    if (announcer) return;

    announcer = document.createElement('div');
    announcer.setAttribute('role', 'status');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    document.body.appendChild(announcer);
  },

  /**
   * Announce message to screen readers
   */
  message: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announcer) announce.init();
    if (!announcer) return;

    announcer.setAttribute('aria-live', priority);
    announcer.textContent = '';

    setTimeout(() => {
      if (announcer) announcer.textContent = message;
    }, 100);
  },

  /**
   * Clear announcer
   */
  clear: () => {
    if (announcer) announcer.textContent = '';
  },
};

/**
 * Keyboard Navigation Helpers
 */

export const keyboard = {
  /**
   * Check if key is navigation key
   */
  isNavigationKey: (key: string): boolean => {
    return ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key);
  },

  /**
   * Check if key is action key
   */
  isActionKey: (key: string): boolean => {
    return ['Enter', ' ', 'Space'].includes(key);
  },

  /**
   * Handle list navigation (for dropdowns, menus)
   */
  handleListNavigation: (
    event: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    onSelect: (index: number) => void
  ) => {
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'ArrowUp':
        event.preventDefault();
        newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = items.length - 1;
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        onSelect(currentIndex);
        return;
      default:
        return;
    }

    items[newIndex]?.focus();
  },

  /**
   * Handle table navigation
   */
  handleTableNavigation: (
    event: KeyboardEvent,
    rows: HTMLElement[],
    cols: number,
    currentRow: number,
    currentCol: number,
    onNavigate: (row: number, col: number) => void
  ) => {
    let newRow = currentRow;
    let newCol = currentCol;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        newRow = Math.min(currentRow + 1, rows.length - 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        newRow = Math.max(currentRow - 1, 0);
        break;
      case 'ArrowRight':
        event.preventDefault();
        newCol = Math.min(currentCol + 1, cols - 1);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        newCol = Math.max(currentCol - 1, 0);
        break;
      case 'Home':
        event.preventDefault();
        newCol = 0;
        break;
      case 'End':
        event.preventDefault();
        newCol = cols - 1;
        break;
      default:
        return;
    }

    onNavigate(newRow, newCol);
  },
};

/**
 * ARIA Attribute Helpers
 */

export const aria = {
  /**
   * Generate unique ID for ARIA relationships
   */
  generateId: (prefix: string): string => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Get ARIA props for form field
   */
  getFieldProps: (
    id: string,
    label: string,
    error?: string,
    description?: string,
    required?: boolean
  ) => {
    const describedBy: string[] = [];
    if (description) describedBy.push(`${id}-description`);
    if (error) describedBy.push(`${id}-error`);

    return {
      id,
      'aria-label': label,
      'aria-required': required,
      'aria-invalid': !!error,
      'aria-describedby': describedBy.length > 0 ? describedBy.join(' ') : undefined,
    };
  },

  /**
   * Get ARIA props for button
   */
  getButtonProps: (
    label: string,
    pressed?: boolean,
    expanded?: boolean,
    controls?: string
  ) => {
    return {
      'aria-label': label,
      'aria-pressed': pressed,
      'aria-expanded': expanded,
      'aria-controls': controls,
    };
  },

  /**
   * Get ARIA props for modal
   */
  getModalProps: (labelId: string, descriptionId?: string) => {
    return {
      role: 'dialog',
      'aria-modal': true,
      'aria-labelledby': labelId,
      'aria-describedby': descriptionId,
    };
  },

  /**
   * Get ARIA props for table
   */
  getTableProps: (label: string, rowCount: number, colCount: number) => {
    return {
      role: 'table',
      'aria-label': label,
      'aria-rowcount': rowCount,
      'aria-colcount': colCount,
    };
  },
};

/**
 * Color Contrast Utilities
 */

export const contrast = {
  /**
   * Calculate relative luminance
   */
  getLuminance: (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  /**
   * Calculate contrast ratio
   */
  getContrastRatio: (rgb1: [number, number, number], rgb2: [number, number, number]): number => {
    const lum1 = contrast.getLuminance(...rgb1);
    const lum2 = contrast.getLuminance(...rgb2);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
  },

  /**
   * Check if contrast meets WCAG AA
   */
  meetsWCAG_AA: (
    rgb1: [number, number, number],
    rgb2: [number, number, number],
    isLargeText: boolean = false
  ): boolean => {
    const ratio = contrast.getContrastRatio(rgb1, rgb2);
    return isLargeText ? ratio >= 3 : ratio >= 4.5;
  },
};

/**
 * Screen Reader Only Class
 */
export const SR_ONLY_CLASS = 'sr-only';

/**
 * Focus Visible Class
 */
export const FOCUS_VISIBLE_CLASS = 'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2';

/**
 * Skip Link Component Props
 */
export interface SkipLinkProps {
  href: string;
  label: string;
}

/**
 * Accessible Icon Props
 */
export interface AccessibleIconProps {
  label: string;
  decorative?: boolean;
}

/**
 * Live Region Props
 */
export interface LiveRegionProps {
  message: string;
  priority?: 'polite' | 'assertive';
  atomic?: boolean;
}
