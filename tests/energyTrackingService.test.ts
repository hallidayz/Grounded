import { logTechniqueComplete } from '../src/services/energyTrackingService';

describe('logTechniqueComplete error path', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Suppress console.error in test output
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Clear storage before each test
    sessionStorage.clear();
    localStorage.clear();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    jest.restoreAllMocks();
  });

  it('should handle errors during logging and log to console.error', async () => {
    // Mock sessionStorage.setItem to throw an error
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Simulated storage error');
    });

    await logTechniqueComplete('medium', 'tech_1', 'Breathing', 60, 'completed');

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[EnergyTracking] Error logging technique completion:',
      expect.any(Error)
    );
  });
});
