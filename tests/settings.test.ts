import {
  trackCompletion,
  getUserStats,
  hasAgreedToTerms,
  agreeToTerms,
  getCrisisContacts,
  saveCrisisContact,
  deleteCrisisContact,
  clearAllData,
  DEFAULT_CONTACTS,
  TERMS_VERSION,
  CrisisContact
} from '../src/services/settings';

describe('Settings Service', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();

    // Mock the current date
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('User Statistics (trackCompletion & getUserStats)', () => {
    it('should return empty object when no stats exist', () => {
      expect(getUserStats()).toEqual({});
    });

    it('should track first completion correctly', () => {
      const sessionKey = 'session_1';
      trackCompletion(sessionKey);

      const stats = getUserStats();
      expect(stats[sessionKey]).toBe(1);
      expect(stats.totalCompletions).toBe(1);
      expect(stats.lastSession).toBe(sessionKey);
      expect(stats.lastSessionTime).toBe('2024-01-01T12:00:00.000Z');
    });

    it('should increment completion count for existing session', () => {
      const sessionKey = 'session_1';
      trackCompletion(sessionKey);
      trackCompletion(sessionKey);

      const stats = getUserStats();
      expect(stats[sessionKey]).toBe(2);
      expect(stats.totalCompletions).toBe(2);
      expect(stats.lastSession).toBe(sessionKey);
    });

    it('should track completions across multiple sessions', () => {
      trackCompletion('session_1');
      trackCompletion('session_2');
      trackCompletion('session_1');

      const stats = getUserStats();
      expect(stats['session_1']).toBe(2);
      expect(stats['session_2']).toBe(1);
      expect(stats.totalCompletions).toBe(3);
      expect(stats.lastSession).toBe('session_1');
    });

    it('should handle malformed user_stats JSON gracefully in trackCompletion', () => {
      localStorage.setItem('user_stats', '{ invalid json }');

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      trackCompletion('session_1');

      expect(consoleSpy).toHaveBeenCalledWith(
        '[Settings] Failed to track session completion:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should handle malformed user_stats JSON gracefully in getUserStats', () => {
      localStorage.setItem('user_stats', '{ invalid json }');
      expect(getUserStats()).toEqual({});
    });
  });

  describe('User Agreement', () => {
    it('should return false initially', () => {
      expect(hasAgreedToTerms()).toBe(false);
    });

    it('should return true after agreeing to terms', () => {
      agreeToTerms();
      expect(hasAgreedToTerms()).toBe(true);
    });

    it('should return false if agreement is for an older version', () => {
      localStorage.setItem('acminds_terms_agreement', JSON.stringify({
        agreed: true,
        agreedAt: new Date().toISOString(),
        version: '0.9.0' // Assuming TERMS_VERSION is different
      }));
      expect(hasAgreedToTerms()).toBe(false);
    });

    it('should return false if localStorage has invalid JSON', () => {
      localStorage.setItem('acminds_terms_agreement', '{ invalid }');
      expect(hasAgreedToTerms()).toBe(false);
    });
  });

  describe('Crisis Contacts', () => {
    it('should return default contacts initially', () => {
      const contacts = getCrisisContacts();
      expect(contacts).toEqual(DEFAULT_CONTACTS);
    });

    it('should return default contacts if localStorage has invalid JSON', () => {
      localStorage.setItem('acminds_crisis_contacts', '{ invalid }');
      expect(getCrisisContacts()).toEqual(DEFAULT_CONTACTS);
    });

    it('should add a new crisis contact', () => {
      // Get initial contacts to know the baseline length
      const initialContacts = getCrisisContacts();
      const newContact: CrisisContact = {
        id: 'new-id',
        name: 'Test Contact',
        phone: '1234567890',
        relationship: 'Friend',
        available: '24h'
      };

      saveCrisisContact(newContact);

      const contacts = getCrisisContacts();
      expect(contacts).toContainEqual(newContact);
      // We expect the original length to be DEFAULT_CONTACTS.length, and adding one makes it +1
      expect(contacts.length).toBe(DEFAULT_CONTACTS.length + 1);
    });

    it('should update an existing crisis contact', () => {
      const initialContacts = getCrisisContacts();
      // Ensure we have at least one contact to update, or use a default one
      const contactToUpdate = initialContacts.length > 0 ? initialContacts[0] : DEFAULT_CONTACTS[0];
      const updatedContact: CrisisContact = {
        ...contactToUpdate,
        name: 'Updated Name',
        phone: '0000000000'
      };

      saveCrisisContact(updatedContact);

      const contacts = getCrisisContacts();
      expect(contacts).toContainEqual(updatedContact);
      expect(contacts.length).toBe(initialContacts.length); // length shouldn't change
      const retrieved = contacts.find(c => c.id === updatedContact.id);
      expect(retrieved?.name).toBe('Updated Name');
      expect(retrieved?.phone).toBe('0000000000');
    });

    it('should delete a crisis contact', () => {
      // Ensure we have something to delete first
      saveCrisisContact({
        id: 'to-delete',
        name: 'To Delete',
        phone: '0000000000',
        relationship: 'Test',
        available: '24h'
      });
      const initialContacts = getCrisisContacts();
      const idToDelete = 'to-delete';

      deleteCrisisContact(idToDelete);

      const contacts = getCrisisContacts();
      expect(contacts.find(c => c.id === idToDelete)).toBeUndefined();
      expect(contacts.length).toBe(initialContacts.length - 1);
    });
  });

  describe('Clear All Data', () => {
    it('should clear all relevant localStorage keys', () => {
      // Set some data first
      localStorage.setItem('grounded_moments', '[]');
      localStorage.setItem('acminds_terms_agreement', '{}');
      localStorage.setItem('acminds_crisis_contacts', '[]');
      localStorage.setItem('theme', 'dark');
      localStorage.setItem('user_stats', '{}');
      localStorage.setItem('grounded_value_selections', '{}');
      localStorage.setItem('other_key', 'should remain');

      clearAllData();

      expect(localStorage.getItem('grounded_moments')).toBeNull();
      expect(localStorage.getItem('acminds_terms_agreement')).toBeNull();
      expect(localStorage.getItem('acminds_crisis_contacts')).toBeNull();
      expect(localStorage.getItem('theme')).toBeNull();
      expect(localStorage.getItem('user_stats')).toBeNull();
      expect(localStorage.getItem('grounded_value_selections')).toBeNull();
      expect(localStorage.getItem('other_key')).toBe('should remain');
    });
  });
});
