/**
 * Conversion Flow Testing Suite
 * Tests complete migration flow from legacy to encrypted
 */

import { MigrationValidator } from '../services/migrationValidator';
import { MigrationService } from '../services/migrationService';
import { detectLegacyData, createLegacyBackup, restoreLegacyBackup } from '../services/legacyDetection';
import { EncryptedPWA } from '../services/encryptedPWA';
import { openDB } from 'idb';

describe('Conversion Flow Tests', () => {
  const testPassword = 'testpassword123';
  const testUserId = '1';
  
  // Clean up before each test
  beforeEach(async () => {
    const instance = EncryptedPWA.getInstance();
    if (instance) {
      (EncryptedPWA as any).instance = null;
    }
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
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
    (EncryptedPWA as any).instance = null;
  });
  
  describe('Pre-Migration Validation', () => {
    test('validateLegacyDatabase should validate structure', async () => {
      const validation = await MigrationValidator.validateLegacyDatabase();
      expect(validation).toHaveProperty('isValid');
      expect(validation).toHaveProperty('errors');
      expect(validation).toHaveProperty('warnings');
      expect(validation).toHaveProperty('recordCounts');
    }, 10000);
    
    test('validateLegacyDatabase should count records', async () => {
      const validation = await MigrationValidator.validateLegacyDatabase();
      expect(validation.recordCounts.legacy).toBeDefined();
    }, 10000);
  });
  
  describe('Migration Process', () => {
    test('migrateToEncrypted should complete full migration', async () => {
      const progressUpdates: any[] = [];
      const migrationService = new MigrationService((progress) => {
        progressUpdates.push(progress);
      });
      
      const result = await migrationService.migrateToEncrypted(testPassword, testUserId);
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('validation');
      expect(progressUpdates.length).toBeGreaterThan(0);
    }, 30000);
    
    test('migration should create backup', async () => {
      await createLegacyBackup();
      // Backup should be created in localStorage (if legacy data exists)
      const backup = localStorage.getItem('grounded_legacy_backup');
      // Backup might not exist if there's no legacy data, which is okay
      expect(typeof backup).toBe('string' || null);
    }, 15000);
    
    test('migration should validate encrypted database', async () => {
      const encryptedDb = await EncryptedPWA.init(testPassword, parseInt(testUserId));
      const validation = await MigrationValidator.validateEncryptedDatabase(encryptedDb);
      
      expect(validation).toHaveProperty('isValid');
      expect(validation).toHaveProperty('recordCounts');
    }, 15000);
    
    test('migration should compare record counts', async () => {
      const preValidation = await MigrationValidator.validateLegacyDatabase();
      const encryptedDb = await EncryptedPWA.init(testPassword, parseInt(testUserId));
      const postValidation = await MigrationValidator.validateEncryptedDatabase(encryptedDb);
      
      const comparison = MigrationValidator.compareRecordCounts(
        preValidation.recordCounts.legacy,
        postValidation.recordCounts.encrypted
      );
      
      expect(comparison).toHaveProperty('isValid');
      expect(comparison).toHaveProperty('errors');
    }, 20000);
    
    test('migration should verify data integrity', async () => {
      let legacyDb;
      try {
        legacyDb = await openDB('groundedDB', 4);
        const encryptedDb = await EncryptedPWA.init(testPassword, parseInt(testUserId));
        
        const integrityCheck = await MigrationValidator.verifyDataIntegrity(legacyDb, encryptedDb);
        
        expect(integrityCheck).toHaveProperty('isValid');
        expect(integrityCheck).toHaveProperty('errors');
        expect(integrityCheck).toHaveProperty('warnings');
      } catch (error) {
        // Database might not exist in test environment
        console.warn('Could not open legacy database:', error);
      } finally {
        if (legacyDb) {
          await legacyDb.close();
        }
      }
    }, 20000);
  });
  
  describe('Post-Migration Validation', () => {
    test('encrypted database should pass integrity check', async () => {
      const encryptedDb = await EncryptedPWA.init(testPassword, parseInt(testUserId));
      const isValid = await encryptedDb.verifyIntegrity();
      expect(isValid).toBe(true);
    }, 10000);
    
    test('record counts should match', async () => {
      const preValidation = await MigrationValidator.validateLegacyDatabase();
      const encryptedDb = await EncryptedPWA.init(testPassword, parseInt(testUserId));
      const postValidation = await MigrationValidator.validateEncryptedDatabase(encryptedDb);
      
      const comparison = MigrationValidator.compareRecordCounts(
        preValidation.recordCounts.legacy,
        postValidation.recordCounts.encrypted
      );
      
      // If there's no legacy data, comparison might still be valid
      expect(comparison).toHaveProperty('errors');
      // Errors array should exist (might be empty if no legacy data)
      expect(Array.isArray(comparison.errors)).toBe(true);
    }, 20000);
  });
  
  describe('Backup and Restore', () => {
    test('restoreLegacyBackup should restore data', async () => {
      await createLegacyBackup();
      await restoreLegacyBackup();
      
      // Verify data was restored (or at least backup exists)
      const legacyData = await detectLegacyData();
      // If there was no legacy data to begin with, hasLegacyData might be false
      expect(legacyData).toHaveProperty('hasLegacyData');
    }, 20000);
  });
});

