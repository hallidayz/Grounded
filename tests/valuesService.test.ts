import { toggleSelection, getSelections, addSelection, removeSelection, isValueSelected } from '../src/services/valuesService';
import * as aiService from '../src/services/aiService';

// Mock aiService so we don't try to load the MLCEngine or do real aiService logic during unit tests
jest.mock('../src/services/aiService', () => ({
  setUserValues: jest.fn(),
  getUserValues: jest.fn(),
}));

describe('valuesService', () => {
  const STORAGE_KEY = 'grounded_value_selections';

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('toggleSelection', () => {
    it('should add the selection if it does not exist', () => {
      // Act
      const result = toggleSelection('health', 'Fitness');

      // Assert
      expect(result).toBe(true);
      expect(isValueSelected('Fitness')).toBe(true);

      const selections = getSelections();
      expect(selections.selections).toHaveLength(1);
      expect(selections.selections[0].value).toBe('Fitness');
      expect(selections.selections[0].category).toBe('health');

      // Also verify it got saved to localStorage
      const raw = localStorage.getItem(STORAGE_KEY);
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw!);
      expect(parsed.selections).toHaveLength(1);
      expect(parsed.selections[0].value).toBe('Fitness');

      // Check syncToAiService was called
      expect(aiService.setUserValues).toHaveBeenCalled();
    });

    it('should remove the selection if it already exists', () => {
      // Arrange - pre-populate a selection
      addSelection('health', 'Fitness');
      expect(isValueSelected('Fitness')).toBe(true); // Sanity check

      // Act - toggle it again
      const result = toggleSelection('health', 'Fitness');

      // Assert
      expect(result).toBe(false);
      expect(isValueSelected('Fitness')).toBe(false);

      const selections = getSelections();
      expect(selections.selections).toHaveLength(0);

      // Verify it was removed from localStorage
      const raw = localStorage.getItem(STORAGE_KEY);
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw!);
      expect(parsed.selections).toHaveLength(0);

      // Should have been called twice (once for add, once for remove)
      expect(aiService.setUserValues).toHaveBeenCalledTimes(2);
    });

    it('should only toggle the specific value and leave others intact', () => {
      // Arrange
      addSelection('health', 'Fitness');
      addSelection('relationships', 'Family');

      // Act
      const result = toggleSelection('health', 'Fitness');

      // Assert
      expect(result).toBe(false);
      expect(isValueSelected('Fitness')).toBe(false);
      expect(isValueSelected('Family')).toBe(true);

      const selections = getSelections();
      expect(selections.selections).toHaveLength(1);
      expect(selections.selections[0].value).toBe('Family');
    });
  });
});
