import { logTechniqueStart } from '../src/services/energyTrackingService';

describe('logTechniqueStart error handling', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Silence console.error for clean test output
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    // As getUserId and saveInteraction handle their own errors or are non-exported async functions,
    // the cleanest way to force an error in the outer logTechniqueStart is to make
    // Storage.prototype.getItem throw an error. This will cause getSessionId to throw,
    // bypassing the try/catch in getUserId and saveInteraction and hitting the main catch block.
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Forced read error');
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should catch and log error when internal storage operation throws', async () => {
    await logTechniqueStart('low', 'test-id', 'Test Technique');

    // The catch block in logTechniqueStart should log the error
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[EnergyTracking] Error logging technique start:',
      expect.any(Error)
    );
  });
});
