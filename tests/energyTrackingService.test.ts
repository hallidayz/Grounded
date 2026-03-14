import { logEnergySelection } from '../src/services/energyTrackingService';

describe('energyTrackingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    localStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('logEnergySelection', () => {
    it('should save an energy selection successfully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await logEnergySelection('high');

      // Verify no errors were logged
      expect(consoleErrorSpy).not.toHaveBeenCalled();

      // We can also verify sessionStorage has the item, but simple success path is fine for now
      const listStr = sessionStorage.getItem('energy_interactions_list');
      expect(listStr).toBeTruthy();
    });

    it('should catch and log error if a dependency throws', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const error = new Error('Mocked storage error');

      // Mock sessionStorage.getItem to throw an error to simulate storage failure.
      // Since getSessionId() doesn't wrap sessionStorage.getItem in try-catch,
      // this will throw, and logEnergySelection's catch block will trigger.
      jest.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
        if (key === 'energyCheckInSessionId') {
          throw error;
        }
        return null;
      });

      await logEnergySelection('medium');

      expect(consoleSpy).toHaveBeenCalledWith(
        '[EnergyTracking] Error logging energy selection:',
        error
      );
    });
  });
});
