import { logTechniqueSelection } from '../src/services/energyTrackingService';

describe('EnergyTrackingService', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Mock console.error
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('logTechniqueSelection', () => {
    it('should catch and log errors during execution', async () => {
      const testError = new Error('Session storage unavailable');

      // Spy on Storage.prototype.getItem and make it throw unconditionally.
      // Since getUserId() has a try/catch, it will handle this error and return 'anonymous'.
      // Then getSessionId() will call getItem, throw this error, and because it lacks a try/catch,
      // the error will propagate up to logTechniqueSelection, which will catch it and log it.
      jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw testError;
      });

      // Execute the function
      await logTechniqueSelection('medium', 'tech_1', 'Deep Breathing');

      // Verify that console.error was called with any string and our test error
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.any(String),
        testError
      );
    });
  });
});
