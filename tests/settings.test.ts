import { getUserStats } from '../src/services/settings';

describe('Settings Service', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getUserStats', () => {
    it('returns empty object when no stats exist', () => {
      expect(getUserStats()).toEqual({});
    });

    it('returns parsed stats when valid json exists', () => {
      localStorage.setItem('user_stats', JSON.stringify({ session1: 5, totalCompletions: 5 }));
      expect(getUserStats()).toEqual({ session1: 5, totalCompletions: 5 });
    });

    it('returns empty object when invalid json exists (testing the error path)', () => {
      localStorage.setItem('user_stats', 'invalid-json');
      expect(getUserStats()).toEqual({});
    });
  });
});
