import { getUserValues, setUserValues, type UserValues } from '../src/services/aiService';

describe('aiService - UserValues management', () => {
  // Reset values before each test to ensure test isolation
  beforeEach(() => {
    setUserValues({ values: [], priority: [] });
  });

  it('should return default empty values initially', () => {
    const values = getUserValues();
    expect(values).toEqual({ values: [], priority: [] });
  });

  it('should correctly set and get user values', () => {
    const testValues: UserValues = {
      values: ['nature', 'creativity'],
      priority: ['creativity', 'nature']
    };

    setUserValues(testValues);

    const retrievedValues = getUserValues();
    expect(retrievedValues).toEqual(testValues);
    // Verify it's the exact same reference
    expect(retrievedValues).toBe(testValues);
  });

  it('should handle consecutive updates correctly', () => {
    const firstUpdate: UserValues = {
      values: ['learning'],
      priority: ['learning']
    };

    setUserValues(firstUpdate);
    expect(getUserValues()).toEqual(firstUpdate);

    const secondUpdate: UserValues = {
      values: ['learning', 'health'],
      priority: ['health', 'learning']
    };

    setUserValues(secondUpdate);
    expect(getUserValues()).toEqual(secondUpdate);
  });
});
