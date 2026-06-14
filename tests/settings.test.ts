import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import {
  deleteCrisisContact,
  getCrisisContacts,
  saveCrisisContact,
  DEFAULT_CONTACTS,
  type CrisisContact
} from '../src/services/settings';

// Mock localStorage
const localStorageMock = (() => {
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
  };
})();

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

describe('Settings Service - Crisis Contacts', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('deleteCrisisContact', () => {
    it('should delete an existing contact by id', () => {
      const customContact: CrisisContact = {
        id: 'test-id-123',
        name: 'Test Contact',
        phone: '123456789',
        relationship: 'Friend',
        available: '24h'
      };

      // Save it first
      saveCrisisContact(customContact);

      // Verify it's there
      let contacts = getCrisisContacts();
      expect(contacts.find(c => c.id === 'test-id-123')).toBeDefined();

      // Delete it
      deleteCrisisContact('test-id-123');

      // Verify it's gone
      contacts = getCrisisContacts();
      expect(contacts.find(c => c.id === 'test-id-123')).toBeUndefined();
    });

    it('should not affect other contacts when deleting a non-existent contact', () => {
      // Setup some default state
      saveCrisisContact({
        id: 'existing-id',
        name: 'Existing Contact',
        phone: '111',
        relationship: 'Self',
        available: '24h'
      });

      const beforeContacts = getCrisisContacts();
      expect(beforeContacts.length).toBeGreaterThan(0);

      // Try to delete a non-existent ID
      deleteCrisisContact('non-existent-id-999');

      const afterContacts = getCrisisContacts();
      expect(afterContacts).toEqual(beforeContacts);
    });

    it('should handle deletion when localStorage is empty (default contacts)', () => {
      // Ensure we start from a clean state
      localStorage.removeItem('acminds_crisis_contacts');

      // The default contacts should be returned
      const defaultContacts = getCrisisContacts();
      expect(defaultContacts).toEqual(DEFAULT_CONTACTS);

      if (defaultContacts.length > 0) {
        const idToDelete = defaultContacts[0].id;

        deleteCrisisContact(idToDelete);

        const afterContacts = getCrisisContacts();
        expect(afterContacts.length).toBe(defaultContacts.length - 1);
        expect(afterContacts.find(c => c.id === idToDelete)).toBeUndefined();
      }
    });
  });
});
