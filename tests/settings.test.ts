import { expect, test, describe, beforeEach, afterEach, spyOn, setSystemTime } from 'bun:test';
import { agreeToTerms, TERMS_VERSION } from '../src/services/settings';

// Mock localStorage directly in this test file
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

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
});

Object.defineProperty(global, 'window', {
  value: {
    dispatchEvent: () => true
  },
  writable: true
});

Object.defineProperty(global, 'Event', {
  value: class Event {
    type: string;
    constructor(type: string) {
      this.type = type;
    }
  },
  writable: true
});

describe('settings.ts', () => {
  describe('agreeToTerms', () => {
    beforeEach(() => {
      global.localStorage.clear();
      spyOn(global.window, 'dispatchEvent');

      const fixedDate = new Date('2024-01-01T12:00:00Z');
      setSystemTime(fixedDate);
    });

    afterEach(() => {
      global.localStorage.clear();
      setSystemTime(); // Reset to current time
    });

    test('should save terms agreement to localStorage and dispatch event', () => {
      agreeToTerms();

      const saved = global.localStorage.getItem('acminds_terms_agreement');
      expect(saved).not.toBeNull();

      const parsed = JSON.parse(saved as string);
      expect(parsed.agreed).toBe(true);
      expect(parsed.version).toBe(TERMS_VERSION);
      expect(parsed.agreedAt).toBe('2024-01-01T12:00:00.000Z');

      expect(global.window.dispatchEvent).toHaveBeenCalled();
      const dispatchedEvent = (global.window.dispatchEvent as any).mock.calls[0][0];
      expect(dispatchedEvent.type).toBe('terms_agreed');
    });
  });
});
