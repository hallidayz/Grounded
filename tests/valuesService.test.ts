// @ts-ignore
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import * as valuesService from '../src/services/valuesService';
import * as aiService from '../src/services/aiService';
import type { UserValueSelectionsWithCategories } from '../src/types/values';

// Mock localStorage
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

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
} else {
  (global as any).localStorage = localStorageMock;
}

const getStorage = () => typeof window !== 'undefined' ? window.localStorage : (global as any).localStorage;

const STORAGE_KEY = 'grounded_value_selections';

describe('valuesService', () => {
  beforeEach(() => {
    getStorage().clear();
    // Mock setUserValues to prevent side effects and allow spying
    jest.spyOn(aiService, 'setUserValues').mockImplementation(() => {});
  });

  describe('addSelection', () => {
    it('should add a new selection to the list and sync to AI service', () => {
      const category = 'Core Values';
      const value = 'Integrity';

      valuesService.addSelection(category, value);

      const selectionsRaw = getStorage().getItem(STORAGE_KEY);
      expect(selectionsRaw).not.toBeNull();

      const parsed = JSON.parse(selectionsRaw!) as UserValueSelectionsWithCategories;
      expect(parsed.selections.length).toBe(1);
      expect(parsed.selections[0].category).toBe(category);
      expect(parsed.selections[0].value).toBe(value);
      expect(parsed.selections[0].selectedAt).toBeDefined();

      expect(aiService.setUserValues).toHaveBeenCalledWith({
        values: [value],
        priority: []
      });
    });

    it('should not duplicate an existing selection when added again', () => {
      const category = 'Work Values';
      const value = 'Creativity';

      // First add
      valuesService.addSelection(category, value);

      const initialSelectionsRaw = getStorage().getItem(STORAGE_KEY);
      const initialParsed = JSON.parse(initialSelectionsRaw!) as UserValueSelectionsWithCategories;
      expect(initialParsed.selections.length).toBe(1);

      // Add the exact same selection again
      valuesService.addSelection(category, value);

      const selectionsRaw = getStorage().getItem(STORAGE_KEY);
      const parsed = JSON.parse(selectionsRaw!) as UserValueSelectionsWithCategories;

      // Ensure no duplication occurred
      expect(parsed.selections.length).toBe(1);
      expect(parsed.selections[0].value).toBe(value);
      expect(parsed.selections[0].category).toBe(category);
    });
  });
});
