import { describe, it, expect, beforeEach, afterEach, spyOn, mock } from 'bun:test';


import * as energyTrackingService from '../src/services/energyTrackingService';

describe('energyTrackingService', () => {
  let sessionStorageMock: Record<string, string> = {};
  let localStorageMock: Record<string, string> = {};

  // Mock Date and Math.random for deterministic testing
  const MOCK_TIME = 1620000000000;
  const MOCK_RANDOM = 0.5;
  // Based on the code: Math.random().toString(36).substr(2, 9)
  const MOCK_RANDOM_STR = MOCK_RANDOM.toString(36).substr(2, 9);
  const EXPECTED_ID = `energy_${MOCK_TIME}_${MOCK_RANDOM_STR}`;

  // We need to ensure we have a consistent ID generated.
  // The service uses generateId() which calls Date.now() and Math.random().

  // Mock Date constructor for new Date().toISOString()
  const originalDate = global.Date;

  beforeEach(() => {
    sessionStorageMock = {};
    localStorageMock = {};

    global.sessionStorage = {
      getItem: (key: string) => sessionStorageMock[key] || null,
      setItem: (key: string, value: string) => { sessionStorageMock[key] = value.toString(); },
      removeItem: (key: string) => { delete sessionStorageMock[key]; },
      clear: () => { sessionStorageMock = {}; },
      length: 0,
      key: () => null
    } as any;

    global.localStorage = {
      getItem: (key: string) => localStorageMock[key] || null,
      setItem: (key: string, value: string) => { localStorageMock[key] = value.toString(); },
      removeItem: (key: string) => { delete localStorageMock[key]; },
      clear: () => { localStorageMock = {}; },
      length: 0,
      key: () => null
    } as any;

    spyOn(global.Date, 'now').mockReturnValue(MOCK_TIME);
    spyOn(global.Math, 'random').mockReturnValue(MOCK_RANDOM);

    // We cannot easily mock `new Date()` while keeping the rest of Date functioning in bun:test,
    // so we'll just check that timestamp is defined or spy on Date.prototype.toISOString
    spyOn(global.Date.prototype, 'toISOString').mockReturnValue('2021-05-03T00:00:00.000Z');
  });

  afterEach(() => {
    mock.restore();
  });

  describe('logEnergySelection', () => {
    it('should save interaction to sessionStorage', async () => {
      // Act
      await energyTrackingService.logEnergySelection('high');

      // Assert
      // Because we mocked Date.now and Math.random, it should generate EXPECTED_ID
      // both for the session ID and the interaction ID since it's the first call.

      // Wait, let's analyze how the service calls generateId():
      // 1. getSessionId() -> no session id in storage -> generateId() -> EXPECTED_ID
      // 2. saveInteraction() -> generateId() -> EXPECTED_ID
      // Since it's the SAME time and SAME random, it will return EXPECTED_ID twice!
      // This is perfectly fine since the IDs are just strings, but let's check sessionStorage keys.

      const sessionKey = sessionStorageMock['energyCheckInSessionId'];
      expect(sessionKey).toBe(EXPECTED_ID);

      const interactionKey = `energy_interaction_${EXPECTED_ID}`;
      const interactionDataStr = sessionStorageMock[interactionKey];
      expect(interactionDataStr).toBeDefined();

      const interactionData = JSON.parse(interactionDataStr);
      expect(interactionData).toMatchObject({
        id: EXPECTED_ID,
        timestamp: '2021-05-03T00:00:00.000Z',
        type: 'energy_checkin',
        sessionId: EXPECTED_ID,
        metadata: JSON.stringify({
          action: 'energy_selection',
          energyLevel: 'high',
        }),
      });
      // no userId in localStorage/sessionStorage so it defaults to anonymous
      expect(interactionData.userId).toBeUndefined();

      // Check list
      const listStr = sessionStorageMock['energy_interactions_list'];
      expect(listStr).toBeDefined();
      const list = JSON.parse(listStr);
      expect(list).toContain(EXPECTED_ID);
    });

    it('should include userId if available', async () => {
      localStorageMock['userId'] = 'user123';

      await energyTrackingService.logEnergySelection('low');

      const interactionKey = `energy_interaction_${EXPECTED_ID}`;
      const interactionData = JSON.parse(sessionStorageMock[interactionKey]);

      expect(interactionData.userId).toBe('user123');
    });
  });

  describe('logTechniqueSelection', () => {
    it('should save technique selection interaction', async () => {
      await energyTrackingService.logTechniqueSelection('medium', 'tech_1', 'Deep Breathing');

      const interactionKey = `energy_interaction_${EXPECTED_ID}`;
      const interactionDataStr = sessionStorageMock[interactionKey];
      expect(interactionDataStr).toBeDefined();

      const interactionData = JSON.parse(interactionDataStr);
      expect(interactionData).toMatchObject({
        id: EXPECTED_ID,
        timestamp: '2021-05-03T00:00:00.000Z',
        type: 'energy_checkin',
        sessionId: EXPECTED_ID,
        metadata: JSON.stringify({
          action: 'technique_selection',
          energyLevel: 'medium',
          techniqueId: 'tech_1',
          techniqueName: 'Deep Breathing'
        }),
      });
    });
  });

  describe('logTechniqueStart', () => {
    it('should save technique start interaction', async () => {
      await energyTrackingService.logTechniqueStart('low', 'tech_2', 'Body Scan');

      const interactionKey = `energy_interaction_${EXPECTED_ID}`;
      const interactionData = JSON.parse(sessionStorageMock[interactionKey]);

      expect(interactionData).toMatchObject({
        id: EXPECTED_ID,
        type: 'energy_checkin',
        metadata: JSON.stringify({
          action: 'technique_start',
          energyLevel: 'low',
          techniqueId: 'tech_2',
          techniqueName: 'Body Scan'
        })
      });
    });
  });

  describe('logTechniqueComplete', () => {
    it('should save technique complete interaction with default status', async () => {
      await energyTrackingService.logTechniqueComplete('high', 'tech_3', '5-4-3-2-1', 120);

      const interactionKey = `energy_interaction_${EXPECTED_ID}`;
      const interactionData = JSON.parse(sessionStorageMock[interactionKey]);

      expect(interactionData).toMatchObject({
        id: EXPECTED_ID,
        metadata: JSON.stringify({
          action: 'technique_complete',
          energyLevel: 'high',
          techniqueId: 'tech_3',
          techniqueName: '5-4-3-2-1',
          duration: 120,
          completionStatus: 'completed'
        })
      });
    });

    it('should save technique complete interaction with custom status', async () => {
      await energyTrackingService.logTechniqueComplete('high', 'tech_3', '5-4-3-2-1', 60, 'skipped');

      const interactionKey = `energy_interaction_${EXPECTED_ID}`;
      const interactionData = JSON.parse(sessionStorageMock[interactionKey]);

      expect(JSON.parse(interactionData.metadata).completionStatus).toBe('skipped');
    });
  });

  describe('logTechniqueRepeat', () => {
    it('should save technique repeat interaction', async () => {
      await energyTrackingService.logTechniqueRepeat('medium', 'tech_1', 'Deep Breathing', 2);

      const interactionKey = `energy_interaction_${EXPECTED_ID}`;
      const interactionData = JSON.parse(sessionStorageMock[interactionKey]);

      expect(interactionData).toMatchObject({
        id: EXPECTED_ID,
        metadata: JSON.stringify({
          action: 'technique_repeat',
          energyLevel: 'medium',
          techniqueId: 'tech_1',
          techniqueName: 'Deep Breathing',
          repeatCount: 2
        })
      });
    });
  });

  describe('logTechniqueInteraction', () => {
    it('should save specific technique interaction with additional data', async () => {
      await energyTrackingService.logTechniqueInteraction('tech_5', 'color_found', { color: 'blue', time: 10 });

      const interactionKey = `energy_interaction_${EXPECTED_ID}`;
      const interactionData = JSON.parse(sessionStorageMock[interactionKey]);

      expect(interactionData).toMatchObject({
        id: EXPECTED_ID,
        metadata: JSON.stringify({
          action: 'technique_interaction',
          techniqueId: 'tech_5',
          interactionType: 'color_found',
          color: 'blue',
          time: 10
        })
      });
    });
  });

  describe('logTechniqueDone', () => {
    it('should save technique done and clear session id', async () => {
      // Setup a session id first
      sessionStorageMock['energyCheckInSessionId'] = 'test_session_id';

      await energyTrackingService.logTechniqueDone('low', 'tech_1', 'Deep Breathing', 300);

      const interactionKey = `energy_interaction_${EXPECTED_ID}`;
      const interactionDataStr = sessionStorageMock[interactionKey];
      expect(interactionDataStr).toBeDefined();

      const interactionData = JSON.parse(interactionDataStr);
      expect(interactionData).toMatchObject({
        id: EXPECTED_ID,
        sessionId: 'test_session_id', // it should use the one we set
        metadata: JSON.stringify({
          action: 'technique_done',
          energyLevel: 'low',
          techniqueId: 'tech_1',
          techniqueName: 'Deep Breathing',
          totalSessionDuration: 300
        })
      });

      // Assert that session ID is cleared
      expect(sessionStorageMock['energyCheckInSessionId']).toBeUndefined();
    });

    it('should handle null technique id and name', async () => {
      await energyTrackingService.logTechniqueDone('low', null, null, 150);

      const interactionKey = `energy_interaction_${EXPECTED_ID}`;
      const interactionData = JSON.parse(sessionStorageMock[interactionKey]);

      const metadata = JSON.parse(interactionData.metadata);
      expect(metadata.techniqueId).toBeNull();
      expect(metadata.techniqueName).toBeNull();
    });
  });
});


  // Mock Dexie
