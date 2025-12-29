/**
 * Functionality Testing Suite
 * Tests all existing features work in both legacy and encrypted modes
 */

import { LegacyAdapter } from '../services/databaseAdapter';
import { EncryptedAdapter } from '../services/databaseAdapter';
import { dbService } from '../services/database';
import { EncryptedPWA } from '../services/encryptedPWA';
import { initializeTestDatabase, cleanupTestDatabase, waitForDatabase } from './fixtures';

describe('Functionality Tests - Legacy Mode', () => {
  let adapter: LegacyAdapter;
  
  beforeAll(async () => {
    await initializeTestDatabase();
    await waitForDatabase();
    adapter = new LegacyAdapter(dbService);
  }, 15000);
  
  afterAll(async () => {
    await cleanupTestDatabase();
  });
  
  test('User operations should work', async () => {
    const userId = await adapter.createUser({
      username: 'legacyuser',
      passwordHash: 'hash',
      email: 'legacy@example.com',
      termsAccepted: true
    });
    
    const user = await adapter.getUserById(userId);
    expect(user).toBeDefined();
    expect(user?.username).toBe('legacyuser');
  }, 10000);
  
  test('App data operations should work', async () => {
    const user = await adapter.getUserByUsername('legacyuser');
    if (user) {
      await adapter.saveAppData(user.id, {
        settings: { reminders: { enabled: false } },
        logs: [],
        goals: [],
        values: []
      });
      
      const appData = await adapter.getAppData(user.id);
      expect(appData).toBeDefined();
    }
  }, 10000);
  
  test('Feeling logs operations should work', async () => {
    await adapter.saveFeelingLog({
      id: 'legacy-log-1',
      timestamp: new Date().toISOString(),
      emotionalState: 'calm',
      selectedFeeling: 'peaceful',
      aiResponse: 'Test',
      isAIResponse: true,
      lowStateCount: 0
    });
    
    const logs = await adapter.getFeelingLogs();
    expect(logs.length).toBeGreaterThan(0);
  }, 10000);
});

describe('Functionality Tests - Encrypted Mode', () => {
  let adapter: EncryptedAdapter;
  const testPassword = 'testpassword123';
  const testUserId = 1;
  
  beforeAll(async () => {
    // Preserve encryption salt
    if (typeof window !== 'undefined' && window.localStorage) {
      const salt = window.localStorage.getItem('grounded_encryption_salt');
      window.localStorage.clear();
      if (salt) {
        window.localStorage.setItem('grounded_encryption_salt', salt);
      }
    }
    const encryptedDb = await EncryptedPWA.init(testPassword, testUserId);
    adapter = new EncryptedAdapter(encryptedDb);
  }, 15000);
  
  afterAll(async () => {
    (EncryptedPWA as any).instance = null;
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
  });
  
  test('User operations should work', async () => {
    const userId = await adapter.createUser({
      username: 'encrypteduser',
      passwordHash: 'hash',
      email: 'encrypted@example.com',
      termsAccepted: true
    });
    
    const user = await adapter.getUserById(userId);
    expect(user).toBeDefined();
    expect(user?.username).toBe('encrypteduser');
  });
  
  test('App data operations should work', async () => {
    const user = await adapter.getUserByUsername('encrypteduser');
    if (user) {
      await adapter.saveAppData(user.id, {
        settings: { reminders: { enabled: false } },
        logs: [],
        goals: [],
        values: []
      });
      
      const appData = await adapter.getAppData(user.id);
      expect(appData).toBeDefined();
    }
  });
  
  test('Feeling logs operations should work', async () => {
    await adapter.saveFeelingLog({
      id: 'encrypted-log-1',
      timestamp: new Date().toISOString(),
      emotionalState: 'calm',
      selectedFeeling: 'peaceful',
      aiResponse: 'Test',
      isAIResponse: true,
      lowStateCount: 0
    });
    
    const logs = await adapter.getFeelingLogs();
    expect(logs.length).toBeGreaterThan(0);
  });
  
  test('Sessions operations should work', async () => {
    const user = await adapter.getUserByUsername('encrypteduser');
    if (user) {
      await adapter.saveSession({
        id: 'encrypted-session-1',
        userId: user.id,
        startTimestamp: new Date().toISOString(),
        valueId: 'test-value',
        goalCreated: false
      });
      
      const sessions = await adapter.getSessions(user.id);
      expect(sessions.length).toBeGreaterThan(0);
    }
  });
  
  test('Analytics operations should work', async () => {
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = new Date().toISOString();
    
    const patterns = await adapter.getFeelingPatterns(startDate, endDate);
    expect(Array.isArray(patterns)).toBe(true);
    
    const metrics = await adapter.getProgressMetrics(startDate, endDate);
    expect(metrics).toHaveProperty('totalSessions');
    expect(metrics).toHaveProperty('averageDuration');
    expect(metrics).toHaveProperty('valuesEngaged');
  });
});

describe('Compatibility Tests', () => {
  test('Both adapters should have identical method signatures', () => {
    const legacyAdapter = new LegacyAdapter(dbService);
    const encryptedDb = EncryptedPWA.getInstance();
    
    if (encryptedDb) {
      const encryptedAdapter = new EncryptedAdapter(encryptedDb);
      
      // Check that both have the same methods
      const legacyMethods = Object.getOwnPropertyNames(LegacyAdapter.prototype)
        .filter(name => name !== 'constructor');
      const encryptedMethods = Object.getOwnPropertyNames(EncryptedAdapter.prototype)
        .filter(name => name !== 'constructor');
      
      expect(encryptedMethods.sort()).toEqual(legacyMethods.sort());
    }
  });
});

