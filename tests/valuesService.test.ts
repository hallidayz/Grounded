import { getSelections } from '../src/services/valuesService';

// Mock the aiService to prevent actual calls during testing
jest.mock('../src/services/aiService', () => ({
  setUserValues: jest.fn(),
}));

const STORAGE_KEY = 'grounded_value_selections';

describe('valuesService - getSelections (loadRaw testing)', () => {
  beforeEach(() => {
    // Clear localStorage mock before each test
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  it('returns default empty structure when localStorage is empty', () => {
    const result = getSelections();
    expect(result).toEqual({
      userId: 'local',
      selections: [],
    });
  });

  it('returns loaded data when localStorage contains valid JSON matching UserValueSelectionsWithCategories', () => {
    const validData = {
      userId: 'local',
      selections: [
        {
          category: 'Core',
          value: 'Integrity',
          selectedAt: '2023-01-01T00:00:00.000Z',
        },
      ],
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(validData));

    const result = getSelections();
    expect(result).toEqual(validData);
  });

  it('returns default structure when localStorage contains invalid JSON (error path)', () => {
    // This tests the `catch` block in `loadRaw`
    window.localStorage.setItem(STORAGE_KEY, 'invalid json {');

    const result = getSelections();
    expect(result).toEqual({
      userId: 'local',
      selections: [],
    });
  });

  it('returns default structure when localStorage JSON is valid but does not match expected shape', () => {
    // This tests the `if (typeof parsed?.userId === 'string' && Array.isArray(parsed?.selections))` block

    // Missing userId
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      selections: []
    }));
    expect(getSelections()).toEqual({
      userId: 'local',
      selections: [],
    });

    // Missing selections
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      userId: 'local'
    }));
    expect(getSelections()).toEqual({
      userId: 'local',
      selections: [],
    });

    // userId is not string
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      userId: 123,
      selections: []
    }));
    expect(getSelections()).toEqual({
      userId: 'local',
      selections: [],
    });

    // selections is not array
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      userId: 'local',
      selections: 'not an array'
    }));
    expect(getSelections()).toEqual({
      userId: 'local',
      selections: [],
    });
  });
});
