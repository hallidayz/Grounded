import { getSelections } from '../src/services/valuesService';

// We explicitly mock localStorage here as required by the plan.
const localStorageMock = (() => {
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

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  configurable: true,
  writable: true
});

describe('valuesService', () => {
  describe('getSelections', () => {
    beforeEach(() => {
      localStorageMock.clear();
      localStorageMock.getItem.mockClear();
    });

    test('returns default object when localStorage is empty', () => {
      const result = getSelections();
      expect(result).toEqual({ userId: 'local', selections: [] });
      expect(localStorageMock.getItem).toHaveBeenCalledWith('grounded_value_selections');
    });

    test('returns parsed selections when localStorage has valid data', () => {
      const validData = {
        userId: 'test-user',
        selections: [
          { category: 'work', value: 'focus', selectedAt: '2023-01-01T00:00:00Z' }
        ]
      };
      localStorageMock.setItem('grounded_value_selections', JSON.stringify(validData));

      const result = getSelections();
      expect(result).toEqual(validData);
    });

    test('returns default object when localStorage has invalid JSON', () => {
      localStorageMock.setItem('grounded_value_selections', 'invalid-json');

      const result = getSelections();
      expect(result).toEqual({ userId: 'local', selections: [] });
    });

    test('returns default object when localStorage has invalid schema (missing userId)', () => {
      const invalidData = {
        selections: []
      };
      localStorageMock.setItem('grounded_value_selections', JSON.stringify(invalidData));

      const result = getSelections();
      expect(result).toEqual({ userId: 'local', selections: [] });
    });

    test('returns default object when localStorage has invalid schema (selections is not an array)', () => {
      const invalidData = {
        userId: 'local',
        selections: 'not-an-array'
      };
      localStorageMock.setItem('grounded_value_selections', JSON.stringify(invalidData));

      const result = getSelections();
      expect(result).toEqual({ userId: 'local', selections: [] });
    });
  });
});
