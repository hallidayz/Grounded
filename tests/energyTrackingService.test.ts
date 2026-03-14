import { logEnergySelection } from '../src/services/energyTrackingService';

describe('energyTrackingService', () => {
  let originalSessionStorage: Storage;
  let warnSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Keep a reference to the original sessionStorage
    originalSessionStorage = global.sessionStorage;

    // Clear mock sessionStorage for a clean state
    if (global.sessionStorage && typeof global.sessionStorage.clear === 'function') {
       global.sessionStorage.clear();
    }

    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore mocks
    jest.restoreAllMocks();
    Object.defineProperty(global, 'sessionStorage', {
      value: originalSessionStorage,
      writable: true,
    });
  });

  describe('saveInteraction error path', () => {
    it('should catch and log warning when sessionStorage.setItem throws an error', async () => {
      // Create a mock sessionStorage that throws an error only when saveInteraction tries to save
      const mockSessionStorage = {
        getItem: jest.fn().mockReturnValue(null),
        setItem: jest.fn().mockImplementation((key: string, value: string) => {
          if (key.startsWith('energy_interaction_')) {
            throw new Error('QuotaExceededError');
          }
        }),
        removeItem: jest.fn(),
        clear: jest.fn(),
        length: 0,
        key: jest.fn()
      };

      // Override global sessionStorage
      Object.defineProperty(global, 'sessionStorage', {
        value: mockSessionStorage,
        writable: true,
      });

      // Call logEnergySelection which internally calls saveInteraction
      await logEnergySelection('medium');

      // saveInteraction should catch the error and log a warning
      expect(warnSpy).toHaveBeenCalledWith(
        '[EnergyTracking] Failed to save interaction:',
        expect.any(Error)
      );

      // The specific error we threw should be caught
      const caughtError = warnSpy.mock.calls[0][1];
      expect(caughtError.message).toBe('QuotaExceededError');
    });
  });

  describe('happy path', () => {
     it('should successfully save interaction to sessionStorage', async () => {
        const store: Record<string, string> = {};
        const workingSessionStorage = {
            getItem: jest.fn((key: string) => store[key] || null),
            setItem: jest.fn((key: string, val: string) => { store[key] = val; }),
            removeItem: jest.fn((key: string) => { delete store[key]; }),
            clear: jest.fn(() => { for (const key in store) delete store[key]; }),
            length: 0,
            key: jest.fn()
        };

        Object.defineProperty(global, 'sessionStorage', {
            value: workingSessionStorage,
            writable: true
        });

        await logEnergySelection('high');

        expect(warnSpy).not.toHaveBeenCalled();
        expect(errorSpy).not.toHaveBeenCalled();

        // Check that something was stored
        const listKey = 'energy_interactions_list';
        const storedList = workingSessionStorage.getItem(listKey);
        expect(storedList).toBeTruthy();
        const parsedList = JSON.parse(storedList as string);
        expect(Array.isArray(parsedList)).toBe(true);
        expect(parsedList.length).toBe(1);

        // Check the actual interaction object
        const interactionKey = `energy_interaction_${parsedList[0]}`;
        const storedInteraction = workingSessionStorage.getItem(interactionKey);
        expect(storedInteraction).toBeTruthy();

        const parsedInteraction = JSON.parse(storedInteraction as string);
        expect(parsedInteraction.type).toBe('energy_checkin');

        const metadata = JSON.parse(parsedInteraction.metadata);
        expect(metadata.action).toBe('energy_selection');
        expect(metadata.energyLevel).toBe('high');
     });
  });
});
