import { getCrisisContacts, saveCrisisContact, clearAllData, CrisisContact } from '../src/services/settings';

describe('Security Fix: Encrypted Crisis Contacts', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('should store crisis contacts in encrypted format in localStorage', async () => {
    const testContact: CrisisContact = {
      id: 'test-1',
      name: 'Secret Contact',
      phone: '123456789',
      relationship: 'Friend',
      available: '24h'
    };

    await saveCrisisContact(testContact);

    const savedRaw = localStorage.getItem('acminds_crisis_contacts');
    expect(savedRaw).toBeDefined();
    expect(savedRaw).not.toBeNull();

    // It should NOT contain raw text
    expect(savedRaw).not.toContain('Secret Contact');
    expect(savedRaw).not.toContain('123456789');

    // Now verify we can still get it back correctly
    const contacts = await getCrisisContacts();
    // Default contacts (2) + 1 new = 3
    expect(contacts.length).toBeGreaterThanOrEqual(1);
    const found = contacts.find(c => c.id === 'test-1');
    expect(found).toBeDefined();
    expect(found?.name).toBe('Secret Contact');
  });

  test('should handle migration from legacy plaintext data', async () => {
    const legacyContacts = [
      {
        id: 'legacy-1',
        name: 'Legacy Contact',
        phone: '999999',
        relationship: 'Old Friend',
        available: 'daytime'
      }
    ];

    localStorage.setItem('acminds_crisis_contacts', JSON.stringify(legacyContacts));

    // Should be able to read plaintext data
    const contacts = await getCrisisContacts();
    expect(contacts).toHaveLength(1);
    expect(contacts[0].name).toBe('Legacy Contact');

    // After saving a new contact, it should all be encrypted
    const newContact: CrisisContact = {
      id: 'new-1',
      name: 'New Contact',
      phone: '888888',
      relationship: 'New Friend',
      available: 'evening'
    };
    await saveCrisisContact(newContact);

    const savedRaw = localStorage.getItem('acminds_crisis_contacts');
    expect(savedRaw).not.toContain('New Contact');
    expect(savedRaw).not.toContain('Legacy Contact');

    const allContacts = await getCrisisContacts();
    expect(allContacts.length).toBe(2);
    expect(allContacts.map(c => c.name)).toContain('Legacy Contact');
    expect(allContacts.map(c => c.name)).toContain('New Contact');
  });

  test('clearAllData should remove encryption key', async () => {
    await saveCrisisContact({
      id: 'test-2',
      name: 'Another Contact',
      phone: '0000',
      relationship: 'Tester',
      available: '24h'
    });

    expect(localStorage.getItem('acminds_crypto_key')).not.toBeNull();

    clearAllData();

    expect(localStorage.getItem('acminds_crisis_contacts')).toBeNull();
    expect(localStorage.getItem('acminds_crypto_key')).toBeNull();
  });
});
