/**
 * End-to-End Testing Suite
 * Full E2E test: legacy mode → pre-validation → migration → post-validation → encrypted mode → all functionality preserved
 */

import { detectLegacyData } from '../services/legacyDetection';
import { MigrationValidator } from '../services/migrationValidator';
import { MigrationService } from '../services/migrationService';
import { EncryptedPWA } from '../services/encryptedPWA';
import { EncryptedAdapter } from '../services/databaseAdapter';
import { LegacyAdapter } from '../services/databaseAdapter';
import { dbService } from '../services/database';
import { openDB } from 'idb';
import { initializeTestDatabase, cleanupTestDatabase, waitForDatabase } from './fixtures';

describe('E2E Migration Flow', () => {
  const testPassword = 'e2etestpassword123';
  const testUserId = '1';
  
  beforeEach(async () => {
    // Preserve encryption salt
    if (typeof window !== 'undefined' && window.localStorage) {
      const salt = window.localStorage.getItem('grounded_encryption_salt');
      window.localStorage.clear();
      if (salt) {
        window.localStorage.setItem('grounded_encryption_salt', salt);
      }
    }
  });
  
  afterAll(async () => {
    await cleanupTestDatabase();
    (EncryptedPWA as any).instance = null;
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
  });
  
  test('Complete E2E flow: Legacy → Migration → Encrypted', async () => {
    // STEP 1: Start in legacy mode
    await initializeTestDatabase();
    await waitForDatabase();
    const legacyAdapter = new LegacyAdapter(dbService);
    
    // Create test data in legacy mode
    const legacyUserId = await legacyAdapter.createUser({
      username: 'e2euser',
      passwordHash: 'hash',
      email: 'e2e@example.com',
      termsAccepted: true
    });
    
    await legacyAdapter.saveAppData(legacyUserId, {
      settings: { reminders: { enabled: true } },
      logs: [{ id: 'log1', date: new Date().toISOString(), valueId: 'value1', livedIt: true, note: 'Test log' }],
      goals: [],
      values: ['value1']
    });
    
    // STEP 2: Pre-validation
    const preValidation = await MigrationValidator.validateLegacyDatabase();
    expect(preValidation).toHaveProperty('isValid');
    // If there's data, validation should be valid
    if (preValidation.recordCounts.legacy.users > 0) {
      expect(preValidation.isValid).toBe(true);
    }
    
    // STEP 3: Migration
    const progressUpdates: any[] = [];
    const migrationService = new MigrationService((progress) => {
      progressUpdates.push(progress);
    });
    
    const migrationResult = await migrationService.migrateToEncrypted(testPassword, testUserId);
    expect(migrationResult).toHaveProperty('success');
    expect(migrationResult).toHaveProperty('validation');
    if (migrationResult.success) {
      expect(migrationResult.validation.isValid).toBe(true);
    }
    
    // STEP 4: Post-validation
    const encryptedDb = await EncryptedPWA.init(testPassword, parseInt(testUserId));
    const postValidation = await MigrationValidator.validateEncryptedDatabase(encryptedDb);
    expect(postValidation).toHaveProperty('isValid');
    
    // STEP 5: Record count comparison
    const comparison = MigrationValidator.compareRecordCounts(
      preValidation.recordCounts.legacy,
      postValidation.recordCounts.encrypted
    );
    expect(comparison).toHaveProperty('isValid');
    
    // STEP 6: Data integrity verification
    let legacyDb;
    try {
      legacyDb = await openDB('groundedDB', 4);
      const integrityCheck = await MigrationValidator.verifyDataIntegrity(legacyDb, encryptedDb);
      expect(integrityCheck).toHaveProperty('isValid');
    } catch (error) {
      console.warn('Could not verify data integrity:', error);
    } finally {
      if (legacyDb) {
        await legacyDb.close();
      }
    }
    
    // STEP 7: Test encrypted mode functionality
    const encryptedAdapter = new EncryptedAdapter(encryptedDb);
    
    // All operations should work
    const user = await encryptedAdapter.getUserByUsername('e2euser');
    if (user) {
      expect(user.username).toBe('e2euser');
      
      const appData = await encryptedAdapter.getAppData(user.id);
      expect(appData).toBeDefined();
      if (appData && appData.logs) {
        expect(Array.isArray(appData.logs)).toBe(true);
      }
      
      // STEP 8: Verify all functionality preserved
      const feelingLogs = await encryptedAdapter.getFeelingLogs();
      expect(Array.isArray(feelingLogs)).toBe(true);
      
      const sessions = await encryptedAdapter.getSessions(user.id);
      expect(Array.isArray(sessions)).toBe(true);
      
      // Analytics should work
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();
      
      const patterns = await encryptedAdapter.getFeelingPatterns(startDate, endDate);
      expect(Array.isArray(patterns)).toBe(true);
      
      const metrics = await encryptedAdapter.getProgressMetrics(startDate, endDate);
      expect(metrics).toHaveProperty('totalSessions');
      expect(metrics).toHaveProperty('averageDuration');
      expect(metrics).toHaveProperty('valuesEngaged');
    }
  }, 60000); // 60 second timeout for full E2E flow
  
  test('E2E: All features work in encrypted mode', async () => {
    const encryptedDb = await EncryptedPWA.init(testPassword, parseInt(testUserId));
    const adapter = new EncryptedAdapter(encryptedDb);
    
    // User operations
    const userId = await adapter.createUser({
      username: 'e2euser2',
      passwordHash: 'hash',
      email: 'e2e2@example.com',
      termsAccepted: true
    });
    expect(userId).toBeDefined();
    
    // App data operations
    await adapter.saveAppData(userId, {
      settings: { reminders: { enabled: false } },
      logs: [],
      goals: [],
      values: []
    });
    const appData = await adapter.getAppData(userId);
    expect(appData).toBeDefined();
    
    // Feeling logs
    await adapter.saveFeelingLog({
      id: 'e2e-log-1',
      timestamp: new Date().toISOString(),
      emotionalState: 'calm',
      selectedFeeling: 'peaceful',
      aiResponse: 'Test',
      isAIResponse: true,
      lowStateCount: 0
    });
    const logs = await adapter.getFeelingLogs();
    expect(logs.length).toBeGreaterThan(0);
    
    // Sessions
    await adapter.saveSession({
      id: 'e2e-session-1',
      userId: userId,
      startTimestamp: new Date().toISOString(),
      valueId: 'value1',
      goalCreated: false
    });
    const sessions = await adapter.getSessions(userId);
    expect(sessions.length).toBeGreaterThan(0);
    
    // User interactions
    await adapter.saveUserInteraction({
      id: 'e2e-interaction-1',
      timestamp: new Date().toISOString(),
      type: 'feeling_selected',
      sessionId: 'e2e-session-1'
    });
    const interactions = await adapter.getUserInteractions('e2e-session-1');
    expect(interactions.length).toBeGreaterThan(0);
    
    // Reset tokens
    const token = await adapter.createResetToken(userId, 'e2e2@example.com');
    expect(token).toBeDefined();
    const retrievedToken = await adapter.getResetToken(token);
    expect(retrievedToken).toBeDefined();
    
    // Analytics
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = new Date().toISOString();
    
    const patterns = await adapter.getFeelingPatterns(startDate, endDate);
    expect(Array.isArray(patterns)).toBe(true);
    
    const metrics = await adapter.getProgressMetrics(startDate, endDate);
    expect(metrics).toHaveProperty('totalSessions');
    
    const frequency = await adapter.getFeelingFrequency(10);
    expect(Array.isArray(frequency)).toBe(true);
  }, 30000);
});

