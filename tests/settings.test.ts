import { clearAllData } from '../src/services/settings';
import { describe, it, expect, beforeEach, spyOn } from 'bun:test';

// Mock localStorage for the test
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Define global.localStorage if it doesn't exist
if (typeof global.localStorage === 'undefined') {
  Object.defineProperty(global, 'localStorage', {
    value: localStorageMock,
    writable: true
  });
}

describe('Settings Service', () => {
  beforeEach(() => {
    // Clear mock storage before each test
    global.localStorage.clear();
  });

  describe('clearAllData', () => {
    it('should remove all expected keys from localStorage', () => {
      const removeItemSpy = spyOn(global.localStorage, 'removeItem');

      clearAllData();

      expect(removeItemSpy).toHaveBeenCalledWith('grounded_moments');
      expect(removeItemSpy).toHaveBeenCalledWith('acminds_terms_agreement');
      expect(removeItemSpy).toHaveBeenCalledWith('acminds_crisis_contacts');
      expect(removeItemSpy).toHaveBeenCalledWith('theme');
      expect(removeItemSpy).toHaveBeenCalledWith('user_stats');
      expect(removeItemSpy).toHaveBeenCalledWith('grounded_value_selections');

      removeItemSpy.mockRestore();
    });
  });
});
