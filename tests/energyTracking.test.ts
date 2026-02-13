import {
  logEnergySelection,
  logTechniqueDone,
  logTechniqueSelection,
  logTechniqueInteraction
} from '../src/services/energyTrackingService';

/**
 * Mock sessionStorage
 */
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    length: 0,
    key: (index: number) => null,
  };
})();

if (typeof window === 'undefined') {
  (global as any).window = {};
}

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Mock getUserId and getSessionId if necessary,
// but they use sessionStorage which we already mocked.

describe('EnergyTrackingService Refactoring', () => {
  beforeEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
    (console.warn as jest.Mock).mockRestore();
  });

  it('should log energy selection with correct metadata', async () => {
    await logEnergySelection('high');

    const listKey = 'energy_interactions_list';
    const existing = sessionStorage.getItem(listKey);
    const list = existing ? JSON.parse(existing) : [];
    expect(list.length).toBe(1);

    const interactionKey = `energy_interaction_${list[0]}`;
    const data = JSON.parse(sessionStorage.getItem(interactionKey) || '{}');

    expect(data.type).toBe('energy_checkin');
    const metadata = JSON.parse(data.metadata);
    expect(metadata.action).toBe('energy_selection');
    expect(metadata.energyLevel).toBe('high');
  });

  it('should handle technique selection', async () => {
    await logTechniqueSelection('medium', 'tech-123', 'Breathing');

    const listKey = 'energy_interactions_list';
    const list = JSON.parse(sessionStorage.getItem(listKey) || '[]');
    const data = JSON.parse(sessionStorage.getItem(`energy_interaction_${list[0]}`) || '{}');
    const metadata = JSON.parse(data.metadata);

    expect(metadata.action).toBe('technique_selection');
    expect(metadata.techniqueId).toBe('tech-123');
    expect(metadata.techniqueName).toBe('Breathing');
  });

  it('should clear session id on technique done', async () => {
    sessionStorage.setItem('energyCheckInSessionId', 'active-session');

    await logTechniqueDone('low', null, null, 300);

    expect(sessionStorage.getItem('energyCheckInSessionId')).toBeNull();

    const listKey = 'energy_interactions_list';
    const list = JSON.parse(sessionStorage.getItem(listKey) || '[]');
    const data = JSON.parse(sessionStorage.getItem(`energy_interaction_${list[0]}`) || '{}');
    const metadata = JSON.parse(data.metadata);
    expect(metadata.action).toBe('technique_done');
    expect(metadata.totalSessionDuration).toBe(300);
  });

  it('should handle technique interaction with extra data', async () => {
    await logTechniqueInteraction('tech-1', 'click', { button: 'next' });

    const listKey = 'energy_interactions_list';
    const list = JSON.parse(sessionStorage.getItem(listKey) || '[]');
    const data = JSON.parse(sessionStorage.getItem(`energy_interaction_${list[0]}`) || '{}');
    const metadata = JSON.parse(data.metadata);

    expect(metadata.action).toBe('technique_interaction');
    expect(metadata.interactionType).toBe('click');
    expect(metadata.button).toBe('next');
  });
});
