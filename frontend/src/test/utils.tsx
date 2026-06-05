/* ========================================
   TEST UTILITIES
   Ethiopian Federal Healthcare Platform
   Testing Helpers & Wrappers
   ======================================== */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import type { User } from '@/types';

// ========================================
// TEST WRAPPERS
// ========================================

interface AllProvidersProps {
  children: React.ReactNode;
}

/**
 * All Providers Wrapper for Testing
 */
export const AllProviders: React.FC<AllProvidersProps> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

/**
 * Custom render with all providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

// ========================================
// MOCK DATA
// ========================================

export const mockUser: User = {
  id: 'test-user-1',
  email: 'test@example.com',
  fullName: 'Test User',
  role: 'STAFF',
  userId: 'TEST001',
  isExternal: false,
  canLogin: true,
  centerId: 'center-1',
  dateOfBirth: '1990-01-01',
  gender: 'MALE',
  phone: '+251911234567',
  profilePicture: null,
  emergencyContactName: 'Emergency Contact',
  emergencyContactPhone: '+251911234568',
  isActive: true,
  isVerified: true,
  lastLoginAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockAdminUser: User = {
  ...mockUser,
  id: 'admin-user-1',
  email: 'admin@example.com',
  fullName: 'Admin User',
  role: 'SYSTEM_ADMIN',
  userId: 'ADMIN001',
};

export const mockPatient: User = {
  ...mockUser,
  id: 'patient-1',
  email: 'patient@example.com',
  fullName: 'Patient User',
  role: 'EXTERNAL_PATIENT',
  userId: 'PAT001',
  isExternal: true,
};

// ========================================
// MOCK FUNCTIONS
// ========================================

export const mockNavigate = vi.fn();
export const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
};

// ========================================
// ACCESSIBILITY TESTING HELPERS
// ========================================

/**
 * Check if element has accessible name
 */
export function hasAccessibleName(element: HTMLElement): boolean {
  return (
    !!element.getAttribute('aria-label') ||
    !!element.getAttribute('aria-labelledby') ||
    !!element.textContent
  );
}

/**
 * Check if element is keyboard accessible
 */
export function isKeyboardAccessible(element: HTMLElement): boolean {
  const tabIndex = element.getAttribute('tabindex');
  return (
    element.tagName === 'BUTTON' ||
    element.tagName === 'A' ||
    element.tagName === 'INPUT' ||
    element.tagName === 'SELECT' ||
    element.tagName === 'TEXTAREA' ||
    (tabIndex !== null && parseInt(tabIndex) >= 0)
  );
}

/**
 * Get all focusable elements in container
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
  );
}

/**
 * Simulate keyboard navigation
 */
export function simulateTab(element: HTMLElement, shiftKey: boolean = false) {
  const event = new KeyboardEvent('keydown', {
    key: 'Tab',
    code: 'Tab',
    shiftKey,
    bubbles: true,
    cancelable: true,
  });
  element.dispatchEvent(event);
}

/**
 * Simulate Enter key press
 */
export function simulateEnter(element: HTMLElement) {
  const event = new KeyboardEvent('keydown', {
    key: 'Enter',
    code: 'Enter',
    bubbles: true,
    cancelable: true,
  });
  element.dispatchEvent(event);
}

/**
 * Simulate Escape key press
 */
export function simulateEscape(element: HTMLElement) {
  const event = new KeyboardEvent('keydown', {
    key: 'Escape',
    code: 'Escape',
    bubbles: true,
    cancelable: true,
  });
  element.dispatchEvent(event);
}

// ========================================
// WAIT UTILITIES
// ========================================

/**
 * Wait for element to be removed
 */
export function waitForElementToBeRemoved(
  callback: () => HTMLElement | null,
  options?: { timeout?: number }
) {
  return new Promise<void>((resolve, reject) => {
    const timeout = options?.timeout || 1000;
    const startTime = Date.now();

    const check = () => {
      if (!callback()) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('Timeout waiting for element to be removed'));
      } else {
        setTimeout(check, 50);
      }
    };

    check();
  });
}

// ========================================
// QUERY MOCKING
// ========================================

/**
 * Create mock query client
 */
export function createMockQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
