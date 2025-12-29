/**
 * Adapter Testing Suite
 * Tests LegacyAdapter compatibility with all dbService methods
 */

import { LegacyAdapter } from '../services/databaseAdapter';
import { dbService } from '../services/database';
import { initializeTestDatabase, cleanupTestDatabase, waitForDatabase } from './fixtures';

describe('LegacyAdapter Compatibility Tests', () => {
  let adapter: LegacyAdapter;
  
  beforeAll(async () => {
    await initializeTestDatabase();
    await waitForDatabase();
    adapter = new LegacyAdapter(dbService);
  }, 15000);
  
  afterAll(async () => {
    await cleanupTestDatabase();
  });
  
  describe('User Operations', () => {
    test('createUser should create a user and return ID', async () => {
      const userId = await adapter.createUser({
        username: 'testuser',
        passwordHash: 'hashedpassword',
        email: 'test@example.com',
        termsAccepted: true
      });
      
      expect(userId).toBeDefined();
      expect(typeof userId).toBe('string');
    }, 10000);
    
    test('getUserByUsername should retrieve user', async () => {
      const user = await adapter.getUserByUsername('testuser');
      expect(user).toBeDefined();
      expect(user?.username).toBe('testuser');
    }, 10000);
    
    test('getUserByEmail should retrieve user', async () => {
      const user = await adapter.getUserByEmail('test@example.com');
      expect(user).toBeDefined();
      expect(user?.email).toBe('test@example.com');
    }, 10000);
    
    test('getUserById should retrieve user', async () => {
      const createdUser = await adapter.getUserByUsername('testuser');
      if (createdUser) {
        const user = await adapter.getUserById(createdUser.id);
        expect(user).toBeDefined();
        expect(user?.id).toBe(createdUser.id);
      }
    }, 10000);
    
    test('updateUser should update user data', async () => {
      const user = await adapter.getUserByUsername('testuser');
      if (user) {
        await adapter.updateUser(user.id, { email: 'updated@example.com' });
        const updated = await adapter.getUserById(user.id);
        expect(updated?.email).toBe('updated@example.com');
      }
    }, 10000);
  });
  
  describe('App Data Operations', () => {
    test('saveAppData should save app data', async () => {
      const user = await adapter.getUserByUsername('testuser');
      if (user) {
        await adapter.saveAppData(user.id, {
          settings: { reminders: { enabled: true } },
          logs: [],
          goals: [],
          values: []
        });
        
        const appData = await adapter.getAppData(user.id);
        expect(appData).toBeDefined();
        expect(appData?.settings.reminders.enabled).toBe(true);
      }
    });
    
    test('getAppData should retrieve app data', async () => {
      const user = await adapter.getUserByUsername('testuser');
      if (user) {
        const appData = await adapter.getAppData(user.id);
        expect(appData).toBeDefined();
      }
    });
  });
  
  describe('Reset Token Operations', () => {
    test('createResetToken should create a token', async () => {
      const user = await adapter.getUserByUsername('testuser');
      if (user) {
        const token = await adapter.createResetToken(user.id, user.email || '');
        expect(token).toBeDefined();
        expect(typeof token).toBe('string');
      }
    });
    
    test('getResetToken should retrieve valid token', async () => {
      const user = await adapter.getUserByUsername('testuser');
      if (user) {
        const token = await adapter.createResetToken(user.id, user.email || '');
        const retrieved = await adapter.getResetToken(token);
        expect(retrieved).toBeDefined();
        expect(retrieved?.userId).toBe(user.id);
      }
    });
    
    test('deleteResetToken should delete token', async () => {
      const user = await adapter.getUserByUsername('testuser');
      if (user) {
        const token = await adapter.createResetToken(user.id, user.email || '');
        await adapter.deleteResetToken(token);
        const retrieved = await adapter.getResetToken(token);
        expect(retrieved).toBeNull();
      }
    });
  });
  
  describe('Feeling Logs Operations', () => {
    test('saveFeelingLog should save feeling log', async () => {
      await adapter.saveFeelingLog({
        id: 'test-log-1',
        timestamp: new Date().toISOString(),
        emotionalState: 'calm',
        selectedFeeling: 'peaceful',
        aiResponse: 'Test response',
        isAIResponse: true,
        lowStateCount: 0
      });
      
      const logs = await adapter.getFeelingLogs(1);
      expect(logs.length).toBeGreaterThan(0);
    }, 10000);
    
    test('getFeelingLogs should retrieve logs', async () => {
      const logs = await adapter.getFeelingLogs(10);
      expect(Array.isArray(logs)).toBe(true);
    });
    
    test('getFeelingLogsByState should filter by state', async () => {
      const logs = await adapter.getFeelingLogsByState('calm', 10);
      expect(Array.isArray(logs)).toBe(true);
      logs.forEach(log => {
        expect(log.emotionalState).toBe('calm');
      });
    });
  });
  
  describe('User Interactions Operations', () => {
    test('saveUserInteraction should save interaction', async () => {
      await adapter.saveUserInteraction({
        id: 'test-interaction-1',
        timestamp: new Date().toISOString(),
        type: 'feeling_selected',
        sessionId: 'test-session-1'
      });
      
      const interactions = await adapter.getUserInteractions('test-session-1');
      expect(interactions.length).toBeGreaterThan(0);
    }, 10000);
    
    test('getUserInteractions should retrieve interactions', async () => {
      const interactions = await adapter.getUserInteractions();
      expect(Array.isArray(interactions)).toBe(true);
    });
  });
  
  describe('Sessions Operations', () => {
    test('saveSession should save session', async () => {
      const user = await adapter.getUserByUsername('testuser');
      if (user) {
        await adapter.saveSession({
          id: 'test-session-1',
          userId: user.id,
          startTimestamp: new Date().toISOString(),
          valueId: 'test-value-1',
          goalCreated: false
        });
        
        const sessions = await adapter.getSessions(user.id);
        expect(sessions.length).toBeGreaterThan(0);
      }
    });
    
    test('updateSession should update session', async () => {
      const user = await adapter.getUserByUsername('testuser');
      if (user) {
        await adapter.updateSession('test-session-1', {
          endTimestamp: new Date().toISOString(),
          duration: 300
        });
        
        const sessions = await adapter.getSessions(user.id);
        const session = sessions.find(s => s.id === 'test-session-1');
        expect(session?.duration).toBe(300);
      }
    });
    
    test('getSessionsByValue should filter by value', async () => {
      const sessions = await adapter.getSessionsByValue('test-value-1');
      expect(Array.isArray(sessions)).toBe(true);
      sessions.forEach(session => {
        expect(session.valueId).toBe('test-value-1');
      });
    });
  });
  
  describe('Analytics Operations', () => {
    test('getFeelingPatterns should return patterns', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();
      
      const patterns = await adapter.getFeelingPatterns(startDate, endDate);
      expect(Array.isArray(patterns)).toBe(true);
      patterns.forEach(pattern => {
        expect(pattern).toHaveProperty('state');
        expect(pattern).toHaveProperty('count');
      });
    });
    
    test('getProgressMetrics should return metrics', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();
      
      const metrics = await adapter.getProgressMetrics(startDate, endDate);
      expect(metrics).toHaveProperty('totalSessions');
      expect(metrics).toHaveProperty('averageDuration');
      expect(metrics).toHaveProperty('valuesEngaged');
    });
    
    test('getFeelingFrequency should return frequency', async () => {
      const frequency = await adapter.getFeelingFrequency(10);
      expect(Array.isArray(frequency)).toBe(true);
      frequency.forEach(item => {
        expect(item).toHaveProperty('feeling');
        expect(item).toHaveProperty('count');
      });
    });
  });
});

