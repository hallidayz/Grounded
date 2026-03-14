import { logTechniqueDone } from '../src/services/energyTrackingService';

describe('energyTrackingService', () => {
  beforeEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
  });

  describe('logTechniqueDone', () => {
    it('should successfully log technique done and clear session ID', async () => {
      sessionStorage.setItem('energyCheckInSessionId', 'test-session-id');

      await logTechniqueDone('medium', 'tech-1', 'Technique 1', 120);

      // Should clear session ID
      expect(sessionStorage.getItem('energyCheckInSessionId')).toBeNull();

      // Should save interaction
      const listKey = 'energy_interactions_list';
      const list = JSON.parse(sessionStorage.getItem(listKey) || '[]');
      expect(list.length).toBe(1);
    });

    it('should catch and log error if an exception occurs during execution', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Mock getSessionId to throw by mocking sessionStorage.getItem
      // This will throw inside the try block of logTechniqueDone
      const getItemSpy = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Simulated Storage error');
      });

      await logTechniqueDone('medium', 'tech-1', 'Technique 1', 120);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[EnergyTracking] Error logging technique done:',
        expect.any(Error)
      );

      getItemSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });
  });
});
