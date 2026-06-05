/* ========================================
   USE LOCAL STORAGE HOOK
   Ethiopian Federal Healthcare Platform
   ======================================== */

import { useState, useEffect } from 'react';
import { getStorageItem, setStorageItem, removeStorageItem } from '@/utils';

/**
 * Hook to manage localStorage with React state
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    return getStorageItem(key, initialValue);
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      setStorageItem(key, valueToStore);
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  const removeValue = () => {
    try {
      setStoredValue(initialValue);
      removeStorageItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue] as const;
}
