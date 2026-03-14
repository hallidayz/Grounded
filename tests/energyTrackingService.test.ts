import { logEnergySelection } from '../src/services/energyTrackingService';

describe('EnergyTrackingService', () => {
  let sessionStorageGetItemMock: jest.Mock;
  let sessionStorageSetItemMock: jest.Mock;
  let localStorageGetItemMock: jest.Mock;

  const originalSessionStorage = window.sessionStorage;
  const originalLocalStorage = window.localStorage;

  beforeEach(() => {
    // Setup mocks
    sessionStorageGetItemMock = jest.fn();
    sessionStorageSetItemMock = jest.fn();
    localStorageGetItemMock = jest.fn();

    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: sessionStorageGetItemMock,
        setItem: sessionStorageSetItemMock,
        removeItem: jest.fn(),
      },
      writable: true,
    });

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: localStorageGetItemMock,
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    Object.defineProperty(window, 'sessionStorage', { value: originalSessionStorage, writable: true });
    Object.defineProperty(window, 'localStorage', { value: originalLocalStorage, writable: true });
  });

  describe('getUserId error handling', () => {
    it('returns "anonymous" when sessionStorage throws an error', async () => {
      // Force an error in getUserId's first call to sessionStorage.getItem
      sessionStorageGetItemMock.mockImplementation((key) => {
        if (key === 'userId') {
          throw new Error('Storage disabled');
        }
        return null; // for other calls like energyCheckInSessionId
      });

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Call logEnergySelection, which internally calls getUserId
      await logEnergySelection('low');

      // Check that it didn't throw all the way to console.error
      expect(consoleErrorSpy).not.toHaveBeenCalled();

      // Verify that the saved interaction does not include a userId (because it defaults to 'anonymous',
      // and logEnergySelection drops the userId if it's 'anonymous')
      expect(sessionStorageSetItemMock).toHaveBeenCalled();
      const firstCallArg = sessionStorageSetItemMock.mock.calls.find(call => call[0].startsWith('energy_interaction_'));
      expect(firstCallArg).toBeDefined();

      const savedData = JSON.parse(firstCallArg[1]);
      expect(savedData.userId).toBeUndefined();

      consoleErrorSpy.mockRestore();
    });

    it('returns "anonymous" when localStorage throws an error', async () => {
      // Mock sessionStorage to return null so it falls back to localStorage
      sessionStorageGetItemMock.mockImplementation((key) => {
        return null; // normal operation, returns null for both 'userId' and 'energyCheckInSessionId'
      });

      // Force an error in getUserId's call to localStorage.getItem
      localStorageGetItemMock.mockImplementation((key) => {
        if (key === 'userId') {
          throw new Error('Storage disabled');
        }
        return null;
      });

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Call logEnergySelection, which internally calls getUserId
      await logEnergySelection('low');

      // Check that it didn't throw all the way to console.error
      expect(consoleErrorSpy).not.toHaveBeenCalled();

      // Verify that the saved interaction does not include a userId
      expect(sessionStorageSetItemMock).toHaveBeenCalled();
      const firstCallArg = sessionStorageSetItemMock.mock.calls.find(call => call[0].startsWith('energy_interaction_'));
      expect(firstCallArg).toBeDefined();

      const savedData = JSON.parse(firstCallArg[1]);
      expect(savedData.userId).toBeUndefined();

      consoleErrorSpy.mockRestore();
    });
  });
});
