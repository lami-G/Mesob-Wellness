/* ========================================
   USE TOGGLE HOOK
   Ethiopian Federal Healthcare Platform
   ======================================== */

import { useState, useCallback } from 'react';

/**
 * Hook to manage boolean state with toggle functionality
 */
export function useToggle(initialValue: boolean = false): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState<boolean>(initialValue);

  const toggle = useCallback(() => {
    setValue((prev) => !prev);
  }, []);

  return [value, toggle, setValue];
}
