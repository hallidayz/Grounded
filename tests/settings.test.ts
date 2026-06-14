import {
  saveCrisisContact,
  getCrisisContacts,
  CrisisContact,
  DEFAULT_CONTACTS
} from '../src/services/settings';

describe('settings.ts - saveCrisisContact', () => {
  let localStorageMock: Record<string, string> = {};

  beforeEach(() => {
    // Reset our mock storage
    localStorageMock = {};

    // Re-assign the global localStorage explicitly for the test environment.
    const mockStorage = {
      getItem: (key: string) => localStorageMock[key] || null,
      setItem: (key: string, value: string) => {
        localStorageMock[key] = value.toString();
      },
      removeItem: (key: string) => {
        delete localStorageMock[key];
      },
      clear: () => {
        localStorageMock = {};
      }
    };

    // Polyfill global localStorage
    Object.defineProperty(global, 'localStorage', {
      value: mockStorage,
      writable: true,
      configurable: true
    });

    // Also polyfill window.localStorage if window exists
    if (typeof window !== 'undefined') {
      Object.defineProperty(window, 'localStorage', {
        value: mockStorage,
        writable: true,
        configurable: true
      });
    }
  });

  it('should add a completely new contact when storage is empty (falls back to default)', () => {
    // Store original length of DEFAULT_CONTACTS to verify behavior
    // and to clean up afterwards since the module might mutate it
    const originalDefaultLength = DEFAULT_CONTACTS.length;

    const newContact: CrisisContact = {
      id: '3',
      name: 'Local Emergency',
      phone: '911',
      relationship: 'Emergency Services',
      available: '24h'
    };

    saveCrisisContact(newContact);

    // Verify localStorage.setItem was called with correct data
    const savedData = localStorageMock['acminds_crisis_contacts'];
    expect(savedData).toBeDefined();

    const parsedData: CrisisContact[] = JSON.parse(savedData);

    // The length should be the original length of DEFAULT_CONTACTS + 1
    // (Note: saveCrisisContact mutates DEFAULT_CONTACTS when storage is empty,
    // so DEFAULT_CONTACTS.length might have changed to be equal to parsedData.length)
    expect(parsedData.length).toBe(originalDefaultLength + 1);

    // Check if the new contact is at the end
    const lastContact = parsedData[parsedData.length - 1];
    expect(lastContact.id).toBe('3');
    expect(lastContact.name).toBe('Local Emergency');

    // Cleanup: revert mutation to DEFAULT_CONTACTS so other tests are not affected
    if (DEFAULT_CONTACTS.length > originalDefaultLength) {
      DEFAULT_CONTACTS.pop();
    }
  });

  it('should add a new contact to existing contacts', () => {
    // Setup existing contacts
    const existingContacts: CrisisContact[] = [
      {
        id: '10',
        name: 'Friend',
        phone: '1234567890',
        relationship: 'Friend',
        available: 'daytime'
      }
    ];
    localStorageMock['acminds_crisis_contacts'] = JSON.stringify(existingContacts);

    const newContact: CrisisContact = {
      id: '11',
      name: 'Doctor',
      phone: '0987654321',
      relationship: 'Medical Professional',
      available: 'evening'
    };

    saveCrisisContact(newContact);

    const savedData = localStorageMock['acminds_crisis_contacts'];
    const parsedData: CrisisContact[] = JSON.parse(savedData);

    // Should have existing contact + new contact
    expect(parsedData.length).toBe(2);
    expect(parsedData[0].id).toBe('10');
    expect(parsedData[1].id).toBe('11');
    expect(parsedData[1].name).toBe('Doctor');
  });

  it('should update an existing contact if id matches', () => {
    // Setup existing contacts
    const existingContacts: CrisisContact[] = [
      {
        id: '10',
        name: 'Friend',
        phone: '1234567890',
        relationship: 'Friend',
        available: 'daytime'
      },
      {
        id: '11',
        name: 'Old Doctor Name',
        phone: '1112223333',
        relationship: 'Medical Professional',
        available: 'evening'
      }
    ];
    localStorageMock['acminds_crisis_contacts'] = JSON.stringify(existingContacts);

    // Updated contact with same ID as the second one
    const updatedContact: CrisisContact = {
      id: '11',
      name: 'New Doctor Name', // Changed
      phone: '4445556666',      // Changed
      relationship: 'Medical Professional',
      available: 'evening'
    };

    saveCrisisContact(updatedContact);

    const savedData = localStorageMock['acminds_crisis_contacts'];
    const parsedData: CrisisContact[] = JSON.parse(savedData);

    // Length should remain the same
    expect(parsedData.length).toBe(2);

    // First contact should be untouched
    expect(parsedData[0].id).toBe('10');
    expect(parsedData[0].name).toBe('Friend');

    // Second contact should be updated
    expect(parsedData[1].id).toBe('11');
    expect(parsedData[1].name).toBe('New Doctor Name');
    expect(parsedData[1].phone).toBe('4445556666');
  });
});
