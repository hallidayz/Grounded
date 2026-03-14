import { logTechniqueInteraction } from '../src/services/energyTrackingService';

describe('Energy Tracking Service', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let originalSessionStorage: Storage;

  beforeEach(() => {
    originalSessionStorage = global.sessionStorage;
    const store = new Map<string, string>();
    global.sessionStorage = {
      getItem: (key: string) => store.get(key) || null,
      setItem: (key: string, value: string) => store.set(key, value),
      removeItem: (key: string) => store.delete(key),
      clear: () => store.clear(),
      length: 0,
      key: () => null,
    } as any;

    // Spy on console.error to avoid output clutter and test for error logging
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    global.sessionStorage = originalSessionStorage;
    jest.restoreAllMocks();
  });

  describe('logTechniqueInteraction', () => {
    it('should correctly log a technique interaction', async () => {
      // Setup mock date
      const mockDate = new Date('2023-01-01T00:00:00.000Z');
      const originalDate = global.Date;

      class MockDate extends Date {
        constructor() {
          super();
          return mockDate;
        }
      }
      (MockDate as any).now = () => mockDate.getTime();

      global.Date = MockDate as any;

      // Spy on Math.random to make generated ID deterministic
      const mathRandomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.5);

      await logTechniqueInteraction('test-technique', 'test-interaction', { extraKey: 'extraValue' });

      // SessionId should be generated
      const sessionId = sessionStorage.getItem('energyCheckInSessionId');
      expect(sessionId).toBeDefined();

      // Interactions list should have an item
      const listStr = sessionStorage.getItem('energy_interactions_list');
      expect(listStr).toBeDefined();
      const list = JSON.parse(listStr!);
      expect(list.length).toBe(1);

      // The interaction itself should be saved
      const interactionKey = `energy_interaction_${list[0]}`;
      const interactionStr = sessionStorage.getItem(interactionKey);
      expect(interactionStr).toBeDefined();

      const interaction = JSON.parse(interactionStr!);
      expect(interaction.type).toBe('energy_checkin');
      expect(interaction.sessionId).toBe(sessionId);

      // Check metadata
      const metadata = JSON.parse(interaction.metadata);
      expect(metadata.action).toBe('technique_interaction');
      expect(metadata.techniqueId).toBe('test-technique');
      expect(metadata.interactionType).toBe('test-interaction');
      expect(metadata.extraKey).toBe('extraValue');

      // Ensure console.error wasn't called
      expect(consoleErrorSpy).not.toHaveBeenCalled();

      // Restore Date
      global.Date = originalDate;
    });

    it('should catch and log error when an exception is thrown', async () => {
      // Mocking Date.prototype.toISOString is a reliable way to trigger the try/catch block
      const dateSpy = jest.spyOn(Date.prototype, 'toISOString').mockImplementation(() => {
        throw new Error('Test date error');
      });

      await logTechniqueInteraction('test-technique', 'test-interaction', { key: 'value' });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[EnergyTracking] Error logging technique interaction:',
        expect.any(Error)
      );

      expect(consoleErrorSpy.mock.calls[0][1].message).toBe('Test date error');
    });
  });
});
