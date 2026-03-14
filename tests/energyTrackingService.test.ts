import { logTechniqueSelection } from '../src/services/energyTrackingService';

describe('EnergyTrackingService', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let originalSessionStorage: Storage;

  beforeAll(() => {
    // Save original sessionStorage
    originalSessionStorage = window.sessionStorage;
  });

  afterAll(() => {
    // Restore original sessionStorage
    Object.defineProperty(window, 'sessionStorage', {
      value: originalSessionStorage,
      writable: true,
    });
  });

  beforeEach(() => {
    // Mock console.error
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Clear and mock sessionStorage for each test
    const storageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
      length: 0,
      key: jest.fn(),
    };

    Object.defineProperty(window, 'sessionStorage', {
      value: storageMock,
      writable: true,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('logTechniqueSelection', () => {
    it('should catch and log errors during execution', async () => {
      // Force an error in getSessionId by making sessionStorage.getItem throw
      const testError = new Error('Session storage unavailable');
      window.sessionStorage.getItem = jest.fn().mockImplementation(() => {
        throw testError;
      });

      // Execute the function
      await logTechniqueSelection('medium', 'tech_1', 'Deep Breathing');

      // Verify that console.error was called with the exact message and error object
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[EnergyTracking] Error logging technique selection:',
        testError
      );
    });
  });
});
