/**
 * Migration Validator
 * Validates legacy and encrypted databases during migration
 */

import { openDB, IDBPDatabase } from 'idb';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recordCounts: {
    legacy: Record<string, number>;
    encrypted: Record<string, number>;
  };
}

// Forward declaration for EncryptedPWA (will be defined in encryptedPWA.ts)
export interface EncryptedPWA {
  query(sql: string, params?: any[]): Promise<any[]>;
}

export class MigrationValidator {
  /**
   * Validate legacy database before migration
   */
  static async validateLegacyDatabase(): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const recordCounts: Record<string, number> = {};
    
    try {
      const db = await openDB('groundedDB', 4);
      
      // Check each object store
      for (const storeName of db.objectStoreNames) {
        const store = db.transaction(storeName, 'readonly').objectStore(storeName);
        const count = await store.count();
        recordCounts[storeName] = count;
        
        // Validate data structure
        if (count > 0) {
          const sample = await store.getAll();
          const firstRecord = sample[0];
          
          // Validate required fields based on store type
          if (storeName === 'users') {
            if (!firstRecord.id || !firstRecord.username || !firstRecord.passwordHash) {
              errors.push(`Invalid user record structure in ${storeName}`);
            }
          }
          
          if (storeName === 'appData') {
            if (!firstRecord.userId || !firstRecord.data) {
              errors.push(`Invalid appData record structure in ${storeName}`);
            }
          }
          
          if (storeName === 'feelingLogs') {
            if (!firstRecord.id || !firstRecord.timestamp) {
              errors.push(`Invalid feelingLog record structure in ${storeName}`);
            }
          }
        }
      }
      
      await db.close();
      
      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        recordCounts: { legacy: recordCounts, encrypted: {} }
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Failed to validate legacy database: ${error instanceof Error ? error.message : String(error)}`],
        warnings: [],
        recordCounts: { legacy: {}, encrypted: {} }
      };
    }
  }
  
  /**
   * Validate encrypted database after migration
   */
  static async validateEncryptedDatabase(encryptedDb: EncryptedPWA): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const recordCounts: Record<string, number> = {};
    
    try {
      // Count records in each encrypted table
      const tables = [
        'users_encrypted',
        'app_data_encrypted',
        'feeling_logs_encrypted',
        'goals_encrypted',
        'goal_updates_encrypted'
      ];
      
      for (const table of tables) {
        try {
          const result = await encryptedDb.query(`SELECT COUNT(*) as count FROM ${table}`);
          recordCounts[table] = result[0]?.count || 0;
        } catch (err) {
          // Table might not exist yet, which is OK
          warnings.push(`Table ${table} not found or empty`);
          recordCounts[table] = 0;
        }
      }
      
      // Verify database integrity
      try {
        const integrityCheck = await encryptedDb.query('PRAGMA integrity_check');
        const integrityResult = integrityCheck[0]?.values?.[0]?.[0] || integrityCheck[0]?.count;
        if (integrityResult !== 'ok' && integrityResult !== 1) {
          errors.push('Database integrity check failed');
        }
      } catch (err) {
        warnings.push('Could not run integrity check (database may be new)');
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        recordCounts: { legacy: {}, encrypted: recordCounts }
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Failed to validate encrypted database: ${error instanceof Error ? error.message : String(error)}`],
        warnings: [],
        recordCounts: { legacy: {}, encrypted: {} }
      };
    }
  }
  
  /**
   * Compare record counts between legacy and encrypted
   */
  static compareRecordCounts(
    legacyCounts: Record<string, number>,
    encryptedCounts: Record<string, number>
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Map legacy stores to encrypted tables
    const mapping: Record<string, string> = {
      'users': 'users_encrypted',
      'appData': 'app_data_encrypted',
      'feelingLogs': 'feeling_logs_encrypted',
      'goals': 'goals_encrypted'
    };
    
    for (const [legacyStore, encryptedTable] of Object.entries(mapping)) {
      const legacyCount = legacyCounts[legacyStore] || 0;
      const encryptedCount = encryptedCounts[encryptedTable] || 0;
      
      if (legacyCount !== encryptedCount) {
        errors.push(
          `Record count mismatch: ${legacyStore} (${legacyCount}) != ${encryptedTable} (${encryptedCount})`
        );
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      recordCounts: { legacy: legacyCounts, encrypted: encryptedCounts }
    };
  }
  
  /**
   * Verify data integrity by comparing sample records
   */
  static async verifyDataIntegrity(
    legacyDb: IDBPDatabase,
    encryptedDb: EncryptedPWA
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    try {
      // Verify users
      if (legacyDb.objectStoreNames.contains('users')) {
        const legacyUsers = await legacyDb.getAll('users');
        for (const user of legacyUsers.slice(0, 5)) { // Sample first 5
          try {
            const encryptedUser = await encryptedDb.query(
              'SELECT * FROM users_encrypted WHERE id = ?',
              [user.id]
            );
            
            if (!encryptedUser || encryptedUser.length === 0) {
              errors.push(`User ${user.id} not found in encrypted database`);
            } else {
              const encrypted = encryptedUser[0];
              // Verify key fields match
              if (encrypted.username !== user.username) {
                errors.push(`Username mismatch for user ${user.id}`);
              }
              if (encrypted.email !== user.email) {
                errors.push(`Email mismatch for user ${user.id}`);
              }
            }
          } catch (err) {
            warnings.push(`Could not verify user ${user.id}: ${err instanceof Error ? err.message : String(err)}`);
          }
        }
      }
      
      // Verify app data
      if (legacyDb.objectStoreNames.contains('appData')) {
        const legacyAppData = await legacyDb.getAll('appData');
        for (const data of legacyAppData.slice(0, 3)) { // Sample first 3
          try {
            const encryptedData = await encryptedDb.query(
              'SELECT * FROM app_data_encrypted WHERE user_id = ?',
              [data.userId]
            );
            
            if (!encryptedData || encryptedData.length === 0) {
              errors.push(`App data for user ${data.userId} not found in encrypted database`);
            } else {
              // Verify JSON data matches
              const legacyLogs = JSON.stringify(data.data.logs || []);
              const encryptedLogs = encryptedData[0].logs;
              if (legacyLogs !== encryptedLogs) {
                warnings.push(`Logs structure may differ for user ${data.userId}`);
              }
            }
          } catch (err) {
            warnings.push(`Could not verify app data for user ${data.userId}: ${err instanceof Error ? err.message : String(err)}`);
          }
        }
      }
      
      // Verify feeling logs
      if (legacyDb.objectStoreNames.contains('feelingLogs')) {
        const legacyLogs = await legacyDb.getAll('feelingLogs');
        const sampleSize = Math.min(5, legacyLogs.length);
        for (const log of legacyLogs.slice(0, sampleSize)) {
          try {
            const encryptedLog = await encryptedDb.query(
              'SELECT * FROM feeling_logs_encrypted WHERE id = ?',
              [log.id]
            );
            
            if (!encryptedLog || encryptedLog.length === 0) {
              warnings.push(`Feeling log ${log.id} not found in encrypted database`);
            }
          } catch (err) {
            warnings.push(`Could not verify feeling log ${log.id}: ${err instanceof Error ? err.message : String(err)}`);
          }
        }
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        recordCounts: { legacy: {}, encrypted: {} }
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Data integrity verification failed: ${error instanceof Error ? error.message : String(error)}`],
        warnings: [],
        recordCounts: { legacy: {}, encrypted: {} }
      };
    }
  }
}

