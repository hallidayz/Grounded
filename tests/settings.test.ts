import { getUserStats, trackCompletion } from '../src/services/settings';

describe('UserStats Settings Service', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('getUserStats', () => {
    it('returns empty object when no stats exist', () => {
      const stats = getUserStats();
      expect(stats).toEqual({});
    });

    it('returns empty object on JSON parse error', () => {
      localStorage.setItem('user_stats', 'invalid json');
      const stats = getUserStats();
      expect(stats).toEqual({});
    });

    it('returns parsed stats when they exist', () => {
      const mockStats = {
        'session-1': 1,
        totalCompletions: 1,
        lastSession: 'session-1',
        lastSessionTime: '2023-01-01T00:00:00.000Z'
      };
      localStorage.setItem('user_stats', JSON.stringify(mockStats));

      const stats = getUserStats();
      expect(stats).toEqual(mockStats);
    });
  });

  describe('trackCompletion', () => {
    it('initializes stats and increments count for a new session', () => {
      // Mock Date for predictable lastSessionTime
      const mockDate = new Date('2023-01-01T12:00:00.000Z');
      const spy = jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      trackCompletion('new-session');

      const stats = JSON.parse(localStorage.getItem('user_stats') || '{}');
      expect(stats).toEqual({
        'new-session': 1,
        totalCompletions: 1,
        lastSession: 'new-session',
        lastSessionTime: mockDate.toISOString()
      });

      spy.mockRestore();
    });

    it('increments existing counts', () => {
      const mockDate = new Date('2023-01-01T12:00:00.000Z');
      const spy = jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      const initialStats = {
        'existing-session': 2,
        totalCompletions: 5,
        lastSession: 'other-session',
        lastSessionTime: '2023-01-01T00:00:00.000Z'
      };
      localStorage.setItem('user_stats', JSON.stringify(initialStats));

      trackCompletion('existing-session');

      const stats = JSON.parse(localStorage.getItem('user_stats') || '{}');
      expect(stats).toEqual({
        'existing-session': 3,
        totalCompletions: 6,
        lastSession: 'existing-session',
        lastSessionTime: mockDate.toISOString()
      });

      spy.mockRestore();
    });

    it('handles JSON parse error gracefully by warning and not crashing', () => {
      const mockDate = new Date('2023-01-01T12:00:00.000Z');
      const dateSpy = jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      localStorage.setItem('user_stats', 'invalid json');

      trackCompletion('session-1');

      expect(warnSpy).toHaveBeenCalledWith('[Settings] Failed to track session completion:', expect.any(Error));

      dateSpy.mockRestore();
      warnSpy.mockRestore();
    });

    it('catches and warns on localStorage errors', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const setItemSpy = jest.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('Quota exceeded');
      });

      trackCompletion('session-1');

      expect(warnSpy).toHaveBeenCalledWith('[Settings] Failed to track session completion:', expect.any(Error));

      warnSpy.mockRestore();
      setItemSpy.mockRestore();
    });
  });
});