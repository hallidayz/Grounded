import { clearAllData, getCrisisContacts, saveCrisisContact, deleteCrisisContact, DEFAULT_CONTACTS, hasAgreedToTerms, agreeToTerms, trackCompletion, getUserStats } from '../src/services/settings';

describe('Settings Service', () => {
  beforeEach(() => {
    // Clear localStorage before each test to ensure a clean state
    localStorage.clear();
  });

  describe('clearAllData', () => {
    it('should remove all designated keys from localStorage', () => {
      // Setup: Populate localStorage with the keys we expect to be cleared
      const expectedKeys = [
        'grounded_moments',
        'acminds_terms_agreement',
        'acminds_crisis_contacts',
        'theme',
        'user_stats',
        'grounded_value_selections'
      ];

      const unexpectedKeys = [
        'some_other_key',
        'another_unrelated_key'
      ];

      // Set items
      expectedKeys.forEach(key => localStorage.setItem(key, 'test_value'));
      unexpectedKeys.forEach(key => localStorage.setItem(key, 'keep_me'));

      // Verify they are set
      expectedKeys.forEach(key => {
        expect(localStorage.getItem(key)).toBe('test_value');
      });

      // Execute clearAllData
      clearAllData();

      // Verify target keys are removed
      expectedKeys.forEach(key => {
        expect(localStorage.getItem(key)).toBeNull();
      });

      // Verify other keys are NOT removed
      unexpectedKeys.forEach(key => {
        expect(localStorage.getItem(key)).toBe('keep_me');
      });
    });
  });

  describe('Crisis Contacts', () => {
    it('should return DEFAULT_CONTACTS when no contacts are saved', () => {
      expect(getCrisisContacts()).toEqual(DEFAULT_CONTACTS);
    });

    it('should save a new contact and retrieve it', () => {
      // Initialize with DEFAULT_CONTACTS implicitly to avoid leftover state if mock is strange
      const initialContacts = getCrisisContacts();

      const newContact = {
        id: 'test-1',
        name: 'Test Contact',
        phone: '1234567890',
        relationship: 'Friend',
        available: '24h' as const
      };
      saveCrisisContact(newContact);

      const contacts = getCrisisContacts();
      expect(contacts).toContainEqual(newContact);
      expect(contacts.length).toBe(initialContacts.length + 1);
    });

    it('should update an existing contact', () => {
      const newContact = {
        id: 'test-2',
        name: 'Initial Name',
        phone: '111',
        relationship: 'Friend',
        available: '24h' as const
      };
      saveCrisisContact(newContact);

      const updatedContact = { ...newContact, name: 'Updated Name' };
      saveCrisisContact(updatedContact);

      const contacts = getCrisisContacts();
      expect(contacts).toContainEqual(updatedContact);
      expect(contacts.find(c => c.id === 'test-2')?.name).toBe('Updated Name');
    });

    it('should delete a contact', () => {
      const contact = {
        id: 'test-3',
        name: 'To Delete',
        phone: '222',
        relationship: 'Friend',
        available: '24h' as const
      };
      saveCrisisContact(contact);

      deleteCrisisContact('test-3');
      const contacts = getCrisisContacts();
      expect(contacts.find(c => c.id === 'test-3')).toBeUndefined();
    });

    it('should fall back to DEFAULT_CONTACTS if JSON is invalid', () => {
      localStorage.setItem('acminds_crisis_contacts', 'invalid-json');
      expect(getCrisisContacts()).toEqual(DEFAULT_CONTACTS);
    });
  });

  describe('User Agreements', () => {
    it('should return false if not agreed', () => {
      expect(hasAgreedToTerms()).toBe(false);
    });

    it('should return true after agreeing to terms', () => {
      agreeToTerms();
      expect(hasAgreedToTerms()).toBe(true);
    });

    it('should return false if JSON is invalid', () => {
      localStorage.setItem('acminds_terms_agreement', 'invalid-json');
      expect(hasAgreedToTerms()).toBe(false);
    });

    it('should return false for old versions', () => {
      localStorage.setItem('acminds_terms_agreement', JSON.stringify({ agreed: true, version: '0.0.1' }));
      expect(hasAgreedToTerms()).toBe(false);
    });
  });

  describe('User Stats', () => {
    it('should return empty object if no stats', () => {
      expect(getUserStats()).toEqual({});
    });

    it('should track completion and update stats', () => {
      trackCompletion('session_1');
      const stats = getUserStats();
      expect(stats['session_1']).toBe(1);
      expect(stats.totalCompletions).toBe(1);
      expect(stats.lastSession).toBe('session_1');
      expect(stats.lastSessionTime).toBeDefined();
    });

    it('should increment existing stats', () => {
      trackCompletion('session_1');
      trackCompletion('session_1');
      trackCompletion('session_2');

      const stats = getUserStats();
      expect(stats['session_1']).toBe(2);
      expect(stats['session_2']).toBe(1);
      expect(stats.totalCompletions).toBe(3);
      expect(stats.lastSession).toBe('session_2');
    });

    it('should return empty object if JSON is invalid', () => {
      localStorage.setItem('user_stats', 'invalid-json');
      expect(getUserStats()).toEqual({});
    });
  });
});
