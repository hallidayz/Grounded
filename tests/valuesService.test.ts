import { describe, test, expect } from "bun:test";
import { createSelection } from "../src/services/valuesService";

describe('valuesService', () => {
  describe('createSelection', () => {
    test('creates a valid selection with provided category and value', () => {
      const category = 'peace';
      const value = 'calm';
      const selection = createSelection(category, value);

      expect(selection.category).toBe(category);
      expect(selection.value).toBe(value);
      expect(selection.selectedAt).toBeDefined();
      expect(typeof selection.selectedAt).toBe('string');
      // Verify it's a valid ISO string
      expect(() => new Date(selection.selectedAt)).not.toThrow();
    });

    test('handles empty strings for category and value', () => {
      const selection = createSelection('', '');

      expect(selection.category).toBe('');
      expect(selection.value).toBe('');
      expect(selection.selectedAt).toBeDefined();
    });

    test('handles special characters in category and value', () => {
      const category = '!@#$%^&*()_+';
      const value = 'peace ✌️ & love ❤️';
      const selection = createSelection(category, value);

      expect(selection.category).toBe(category);
      expect(selection.value).toBe(value);
      expect(selection.selectedAt).toBeDefined();
    });

    test('generates different timestamps for selections created at different times', async () => {
      const selection1 = createSelection('peace', 'calm');
      // Wait a bit to ensure a different timestamp
      await new Promise(resolve => setTimeout(resolve, 10));
      const selection2 = createSelection('work', 'focus');

      expect(selection1.selectedAt).not.toBe(selection2.selectedAt);
    });
  });
});
