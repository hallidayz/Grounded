import { addSelection, getSelections } from '../src/services/valuesService';
import { setUserValues } from '../src/services/aiService';

// Mock the aiService module
jest.mock('../src/services/aiService', () => ({
  setUserValues: jest.fn(),
}));

// Ensure localStorage is explicitly mocked for this test suite
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

describe('valuesService', () => {
  const STORAGE_KEY = 'grounded_value_selections';

  beforeEach(() => {
    // Clear the localStorage and mocks before each test
    global.localStorage.clear();
    jest.clearAllMocks();
  });

  describe('addSelection', () => {
    it('should add a new selection when the value does not exist', () => {
      // Setup: ensure localStorage is empty initially
      expect(global.localStorage.getItem(STORAGE_KEY)).toBeNull();

      // Execute: add a new selection
      addSelection('Core', 'Integrity');

      // Verify: check getSelections returns the new item
      const selections = getSelections();
      expect(selections.selections).toHaveLength(1);
      expect(selections.selections[0]).toMatchObject({
        category: 'Core',
        value: 'Integrity',
      });
      // Verify selectedAt is a valid ISO string
      expect(new Date(selections.selections[0].selectedAt).getTime()).not.toBeNaN();

      // Verify: localStorage was updated
      const stored = JSON.parse(global.localStorage.getItem(STORAGE_KEY) || '{}');
      expect(stored.selections).toHaveLength(1);
      expect(stored.selections[0].value).toBe('Integrity');

      // Verify: aiService was synced
      expect(setUserValues).toHaveBeenCalledWith({
        values: ['Integrity'],
        priority: [],
      });
    });

    it('should update an existing selection when the value already exists', () => {
      // Setup: Add an initial selection
      addSelection('Core', 'Integrity');

      // Get the original selectedAt time to compare later
      const originalSelection = getSelections().selections[0];
      const originalSelectedAt = originalSelection.selectedAt;

      // Mock Date to ensure updatedAt is strictly greater (if needed, or just let time pass slightly)
      // Actually, standard Date.now() is fine since we just check for presence of updatedAt.

      // Execute: add the same value with a different category
      addSelection('Aspirational', 'Integrity');

      // Verify: check getSelections
      const selections = getSelections();
      expect(selections.selections).toHaveLength(1); // Should still be 1
      const updatedSelection = selections.selections[0];

      expect(updatedSelection).toMatchObject({
        category: 'Aspirational', // Category should be updated
        value: 'Integrity',
      });

      // selectedAt should remain the same
      expect(updatedSelection.selectedAt).toBe(originalSelectedAt);

      // updatedAt should be set to a valid ISO string
      expect(updatedSelection.updatedAt).toBeDefined();
      expect(new Date(updatedSelection.updatedAt!).getTime()).not.toBeNaN();

      // Verify: localStorage was updated
      const stored = JSON.parse(global.localStorage.getItem(STORAGE_KEY) || '{}');
      expect(stored.selections).toHaveLength(1);
      expect(stored.selections[0].category).toBe('Aspirational');

      // Verify: aiService was synced again
      expect(setUserValues).toHaveBeenCalledTimes(2);
      expect(setUserValues).toHaveBeenLastCalledWith({
        values: ['Integrity'],
        priority: [],
      });
    });
  });
});
