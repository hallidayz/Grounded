import { removeSelection, getSelections, addSelection } from '../src/services/valuesService';
import { setUserValues } from '../src/services/aiService';

// Mock the aiService
jest.mock('../src/services/aiService', () => ({
  setUserValues: jest.fn(),
}));

const STORAGE_KEY = 'grounded_value_selections';

describe('valuesService - removeSelection', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should remove an existing selection and sync to aiService', () => {
    // Setup initial state
    addSelection('Category1', 'Value1');
    addSelection('Category2', 'Value2');

    // Clear the mock because addSelection also calls syncToAiService
    jest.clearAllMocks();

    removeSelection('Value1');

    const selections = getSelections();

    // Check localStorage state
    expect(selections.selections).toHaveLength(1);
    expect(selections.selections[0].value).toBe('Value2');

    // Check sync to aiService
    expect(setUserValues).toHaveBeenCalledTimes(1);
    expect(setUserValues).toHaveBeenCalledWith({
      values: ['Value2'],
      priority: [],
    });
  });

  it('should do nothing if the value is not found', () => {
    // Setup initial state
    addSelection('Category1', 'Value1');

    jest.clearAllMocks();

    removeSelection('NonExistentValue');

    const selections = getSelections();

    // Check localStorage state
    expect(selections.selections).toHaveLength(1);
    expect(selections.selections[0].value).toBe('Value1');

    // Check sync to aiService
    expect(setUserValues).toHaveBeenCalledTimes(1);
    expect(setUserValues).toHaveBeenCalledWith({
      values: ['Value1'],
      priority: [],
    });
  });

  it('should handle removing from an empty list gracefully', () => {
    removeSelection('Value1');

    const selections = getSelections();

    // Check localStorage state
    expect(selections.selections).toHaveLength(0);

    // Check sync to aiService
    expect(setUserValues).toHaveBeenCalledTimes(1);
    expect(setUserValues).toHaveBeenCalledWith({
      values: [],
      priority: [],
    });
  });

  it('should remove the last selection correctly', () => {
    // Setup initial state
    addSelection('Category1', 'Value1');

    jest.clearAllMocks();

    removeSelection('Value1');

    const selections = getSelections();

    // Check localStorage state
    expect(selections.selections).toHaveLength(0);

    // Check sync to aiService
    expect(setUserValues).toHaveBeenCalledTimes(1);
    expect(setUserValues).toHaveBeenCalledWith({
      values: [],
      priority: [],
    });
  });
});
