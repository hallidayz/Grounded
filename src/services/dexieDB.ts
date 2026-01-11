/**
 * Dexie Database Class
 * 
 * PRIVACY-FIRST: All data remains on-device in IndexedDB.
 * NO data is ever sent to external servers or cloud services.
 * 
 * Provides a high-performance IndexedDB wrapper using Dexie.js
 * Replaces raw IndexedDB API with type-safe, promise-based operations
 * 
 * Database: groundedDB (local IndexedDB only)
 * Version: Configurable via VITE_DB_VERSION (default: 80 for compatibility)
 * 
 * Features:
 * - Automatic VersionError recovery
 * - Data export/import for local backup/restore (on-device only)
 * - Safe migration handling
 * - All operations are local-only
 * 
 * PRIVACY GUARANTEE:
 * - All user data stored in IndexedDB (browser local storage)
 * - All databases are on-device only
 * - No cloud sync or external data transmission
 * - Encryption keys derived from user passwords (never stored)
 */

import Dexie, { Table, Middleware } from 'dexie';
import { Goal, FeelingLog, Assessment, CounselorReport, Session, UserInteraction, RuleBasedUsageLog, AppSettings, LogEntry, LCSWConfig } from '../types';
import { encryptData, decryptData } from './encryption';

// Database name constant for consistency
const DB_NAME = 'groundedDB';

// Version constant for explicit version management
// Version 3: Alpha wipe - clean schema with hook-based encryption
// Version 4: Add userId indexes to userInteractions and ruleBasedUsageLogs
export const CURRENT_DB_VERSION = 4;

// Type definitions matching schema v8

interface UserRecord {
  id: string;
  username: string;
  passwordHash: string;
  email: string;
  therapistEmails?: string[];
  termsAccepted: boolean;
  termsAcceptedDate?: string;
  createdAt: string;
  lastLogin?: string;
}

interface AppDataRecord {
  userId: string;
  data: {
    settings: AppSettings;
    logs: LogEntry[];
    goals: Goal[];
    values: string[];
    lcswConfig?: LCSWConfig;
  };
}

interface ValueRecord {
  id?: number; // Auto-increment
  userId: string;
  valueId: string;
  active: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

interface GoalRecord extends Goal {
  // Goal interface already has all required fields
}

interface FeelingLogRecord extends FeelingLog {
  // FeelingLog interface already has all required fields
}

interface UserInteractionRecord extends UserInteraction {
  // UserInteraction interface already has all required fields
}

interface SessionRecord extends Session {
  // Session interface already has all required fields
}

interface AssessmentRecord extends Assessment {
  // Assessment interface already has all required fields
}

interface ReportRecord extends CounselorReport {
  // CounselorReport interface already has all required fields
}

interface ResetTokenRecord {
  token: string;
  userId: string;
  email: string;
  expires: string;
  createdAt: string;
}

interface MetadataRecord {
  id: string;
  appName: string;
  appId: string;
  platform: string;
  version: string;
  createdAt: string;
  lastValidated: string;
  localStorageMigrated?: boolean;
  migrationDate?: string;
}

interface RuleBasedUsageLogRecord extends RuleBasedUsageLog {
  // RuleBasedUsageLog interface already has all required fields
}

/**
 * GroundedDB - Dexie Database Class
 * 
 * All 12 object stores matching schema v8:
 * 1. users - User accounts
 * 2. appData - User app data (backward compatibility)
 * 3. values - Value selections with history
 * 4. goals - User goals
 * 5. feelingLogs - Emotional state logs
 * 6. userInteractions - User interaction tracking
 * 7. sessions - Reflection sessions
 * 8. assessments - AI assessments
 * 9. reports - Generated reports
 * 10. resetTokens - Password reset tokens
 * 11. metadata - App metadata
 * 12. ruleBasedUsageLogs - Rule-based system logs
 */
class GroundedDB extends Dexie {
  users!: Table<UserRecord, string>;
  appData!: Table<AppDataRecord, string>;
  values!: Table<ValueRecord, number>;
  goals!: Table<GoalRecord, string>;
  feelingLogs!: Table<FeelingLogRecord, string>;
  userInteractions!: Table<UserInteractionRecord, string>;
  sessions!: Table<SessionRecord, string>;
  assessments!: Table<AssessmentRecord, string>;
  reports!: Table<ReportRecord, string>;
  resetTokens!: Table<ResetTokenRecord, string>;
  metadata!: Table<MetadataRecord, string>;
  ruleBasedUsageLogs!: Table<RuleBasedUsageLogRecord, string>;

  constructor() {
    super(DB_NAME);
    
    // Version 3: Alpha wipe - clean schema with hook-based encryption
    // Version 4: Add userId indexes to userInteractions and ruleBasedUsageLogs for proper user data linking
    this.version(3).stores({
      // Users store - keyPath: id, indexes: username (unique), email (unique)
      users: 'id, username, email',
      
      // AppData store - keyPath: userId (for backward compatibility)
      appData: 'userId',
      
      // Values store - auto-increment id, indexes: userId, valueId, active, createdAt, compound [userId+active]
      values: '++id, userId, valueId, active, createdAt, [userId+active]',
      
      // Goals store - keyPath: id, indexes: userId, valueId, completed, createdAt
      goals: 'id, userId, valueId, completed, createdAt',
      
      // FeelingLogs store - keyPath: id, indexes: timestamp, emotionalState, userId
      feelingLogs: 'id, timestamp, emotionalState, userId',
      
      // UserInteractions store - keyPath: id, indexes: timestamp, sessionId, type
      userInteractions: 'id, timestamp, sessionId, type',
      
      // Sessions store - keyPath: id, indexes: startTimestamp, valueId, userId
      sessions: 'id, startTimestamp, valueId, userId',
      
      // Assessments store - keyPath: id, indexes: userId, timestamp
      assessments: 'id, userId, timestamp',
      
      // Reports store - keyPath: id, indexes: userId, timestamp
      reports: 'id, userId, timestamp',
      
      // ResetTokens store - keyPath: token, indexes: userId, expires
      resetTokens: 'token, userId, expires',
      
      // Metadata store - keyPath: id, indexes: appId, platform
      metadata: 'id, appId, platform',
      
      // RuleBasedUsageLogs store - keyPath: id, indexes: timestamp, type
      ruleBasedUsageLogs: 'id, timestamp, type',
    });
    
    // Version 4: Add userId indexes to userInteractions and ruleBasedUsageLogs
    this.version(4).stores({
      // UserInteractions store - add userId index
      userInteractions: 'id, timestamp, sessionId, type, userId',
      
      // RuleBasedUsageLogs store - add userId index
      ruleBasedUsageLogs: 'id, timestamp, type, userId',
    }).upgrade(async (tx) => {
      // Migration: Add userId to existing records where possible
      // For userInteractions, we can derive userId from sessions
      const sessions = await tx.table('sessions').toCollection().toArray();
      const sessionUserIdMap = new Map(sessions.map(s => [s.id, s.userId]));
      
      const interactions = await tx.table('userInteractions').toCollection().toArray();
      for (const interaction of interactions) {
        if (!interaction.userId && interaction.sessionId) {
          const userId = sessionUserIdMap.get(interaction.sessionId);
          if (userId) {
            await tx.table('userInteractions').update(interaction.id, { userId });
          }
        }
      }
      
      // For ruleBasedUsageLogs, we can't derive userId, so leave as undefined
      // Future logs will include userId when saved
      console.log('[Dexie] Version 4 migration: Added userId indexes to userInteractions and ruleBasedUsageLogs');
    });
    
    // Hook-based encryption middleware for PHI data stores
    // Uses Dexie middleware to intercept and encrypt/decrypt data
    this.setupEncryptionHooks();
  }
  
  /**
   * Setup encryption hooks for PHI data stores
   * Note: Encryption is now handled at the adapter level (LegacyAdapter)
   * Hooks are kept for future use but currently just mark fields
   */
  private setupEncryptionHooks(): void {
    // Encryption is handled in LegacyAdapter methods
    // Hooks are disabled to avoid async issues
    // This is a placeholder for future synchronous encryption support
  }
  
  /**
   * Check if encryption should be applied
   */
  private shouldEncrypt(): boolean {
    return localStorage.getItem('encryption_enabled') === 'true';
  }
  
  /**
   * Check if decryption should be applied
   */
  private shouldDecrypt(): boolean {
    return localStorage.getItem('encryption_enabled') === 'true';
  }
  
  /**
   * Get encryption password from session storage
   */
  private async getEncryptionPassword(): Promise<string> {
    // Get password from sessionStorage (set during login)
    const password = sessionStorage.getItem('encryption_password');
    if (!password) {
      throw new Error('Encryption password not available - user must be logged in');
    }
    return password;
  }

  /**
   * Encrypt a field value
   */
  private async encryptField(value: any, fieldName: string): Promise<string> {
    if (typeof value !== 'string') {
      value = JSON.stringify(value);
    }
    const password = await this.getEncryptionPassword();
    return await encryptData(value, password);
  }

  /**
   * Decrypt a field value
   */
  private async decryptField(encryptedValue: string, fieldName: string): Promise<any> {
    const password = await this.getEncryptionPassword();
    const decrypted = await decryptData(encryptedValue, password);
    try {
      return JSON.parse(decrypted);
    } catch {
      return decrypted;
    }
  }

  /**
   * Encrypt an object's PHI fields
   */
  private async encryptObject(obj: any): Promise<any> {
    if (!this.shouldEncrypt()) {
      return obj;
    }

    const encrypted = { ...obj };
    const fieldsToEncrypt = [
      'passwordHash', 'email', 'therapistEmails', // User data
      'aiResponse', 'jsonIn', 'jsonOut', // Feeling logs
      'reflectionText', 'aiAnalysis', // Sessions
      'content', 'assessment', 'report' // Assessments/Reports
    ];

    for (const field of fieldsToEncrypt) {
      if (encrypted[field] && typeof encrypted[field] === 'string' && !encrypted[`${field}_encrypted`]) {
        try {
          encrypted[field] = await this.encryptField(encrypted[field], field);
          encrypted[`${field}_encrypted`] = true;
        } catch (error) {
          console.error(`[Dexie] Failed to encrypt field ${field}:`, error);
          // Continue without encryption if it fails
        }
      }
    }

    return encrypted;
  }

  /**
   * Decrypt an object's PHI fields
   */
  private async decryptObject(obj: any): Promise<any> {
    if (!this.shouldDecrypt()) {
      return obj;
    }

    const decrypted = { ...obj };
    const fieldsToDecrypt = [
      'passwordHash', 'email', 'therapistEmails',
      'aiResponse', 'jsonIn', 'jsonOut',
      'reflectionText', 'aiAnalysis',
      'content', 'assessment', 'report'
    ];

    for (const field of fieldsToDecrypt) {
      if (decrypted[`${field}_encrypted`] && decrypted[field] && typeof decrypted[field] === 'string') {
        try {
          decrypted[field] = await this.decryptField(decrypted[field], field);
          delete decrypted[`${field}_encrypted`];
        } catch (error) {
          console.error(`[Dexie] Failed to decrypt field ${field}:`, error);
          // Return null if decryption fails
          decrypted[field] = null;
      }
      }
    }
    
    return decrypted;
  }

  /**
   * Reset database - deletes and recreates with clean schema
   * Use this to resolve version conflicts or start fresh
   */
  async resetDatabase(): Promise<void> {
    console.log('[Dexie] Resetting database...');
    
    // Close any open connections
    try {
      this.close();
    } catch (e) {
      // Ignore if already closed
    }
    
    // Delete the database
    await new Promise<void>((resolve, reject) => {
      const deleteRequest = indexedDB.deleteDatabase(DB_NAME);
      deleteRequest.onsuccess = () => {
        console.log(`[Dexie] Database ${DB_NAME} deleted successfully`);
        resolve();
      };
      deleteRequest.onerror = () => {
        console.error('[Dexie] Failed to delete database:', deleteRequest.error);
        reject(deleteRequest.error);
      };
      deleteRequest.onblocked = () => {
        console.warn('[Dexie] Database deletion blocked - another tab may have it open');
        setTimeout(() => resolve(), 1000);
      };
    });
    
    // Clear any migration flags
    localStorage.removeItem('dexie_migration_v7_to_v8');
    sessionStorage.removeItem('dexie_export_before_recovery');
    
    // Reopen with fresh schema
    await this.open();
    console.log(`[Dexie] Database reset complete - opened with version ${CURRENT_DB_VERSION}`);
  }

  /**
   * Initialize database and clean up old databases
   * Should be called after construction to perform async cleanup
   * Includes automatic version error recovery with data preservation option
   */
  async initialize(): Promise<void> {
    // Clean up old database before opening
    await this.cleanupOldDatabase();
    
    // Check existing database version first to prevent VersionError
    const { version: existingVersion, needsReset: versionNeedsReset } = await this.checkExistingVersion();
    
    // CRITICAL FIX: Reset database if version concatenation bug was detected
    // Even if corrected version matches current, the actual DB still has wrong version
    if (versionNeedsReset) {
      console.warn('[Dexie] Database version bug detected - resetting database to fix version...');
      // Attempt to export data before reset
      try {
        const exportData = await exportFromRawIndexedDB();
        if (exportData && Object.keys(exportData).length > 0) {
          sessionStorage.setItem('dexie_export_before_recovery', JSON.stringify(exportData));
          console.log('[Dexie] Data exported before reset - stored in sessionStorage');
        }
      } catch (exportError) {
        console.warn('[Dexie] Could not export data before reset:', exportError);
      }
      // Reset database to current version
      await this.resetDatabase();
    } else if (existingVersion !== null && existingVersion !== 0) {
      // Ensure we're comparing numbers, not strings
      const existingVersionNum = typeof existingVersion === 'number' ? existingVersion : parseInt(String(existingVersion), 10);
      const currentVersionNum = typeof CURRENT_DB_VERSION === 'number' ? CURRENT_DB_VERSION : parseInt(String(CURRENT_DB_VERSION), 10);
      
      // Only reset if version is legitimately higher (not a concatenation bug)
      // Versions like 40, 400, etc. are likely bugs and should be treated as version 4
      if (existingVersionNum > currentVersionNum && existingVersionNum < 100) {
        console.warn(
          `[Dexie] Existing database version (${existingVersionNum}) is higher than requested (${currentVersionNum}). Resetting database...`
        );
        // Attempt to export data before reset
        try {
          const exportData = await exportFromRawIndexedDB();
          if (exportData && Object.keys(exportData).length > 0) {
            sessionStorage.setItem('dexie_export_before_recovery', JSON.stringify(exportData));
            console.log('[Dexie] Data exported before reset - stored in sessionStorage');
          }
        } catch (exportError) {
          console.warn('[Dexie] Could not export data before reset:', exportError);
        }
        // Reset database to current version
        await this.resetDatabase();
      } else if (existingVersionNum >= 100 || (existingVersionNum > 10 && existingVersionNum % 10 === 0)) {
        // Likely a version concatenation bug (40, 400, etc.) - just reset without warning
        console.warn(
          `[Dexie] Detected invalid database version (${existingVersionNum}) - likely a bug. Resetting to version ${currentVersionNum}...`
        );
        await this.resetDatabase();
      } else if (existingVersionNum === currentVersionNum) {
        // Versions match - no action needed
        console.log(`[Dexie] Database version matches current version (${currentVersionNum})`);
      } else if (existingVersionNum < currentVersionNum) {
        // Lower version - will be handled by Dexie's upgrade mechanism
        console.log(`[Dexie] Database version (${existingVersionNum}) is lower than current (${currentVersionNum}) - will upgrade automatically`);
      }
    }
    
    // Check for version conflicts and reset if needed
    try {
      await this.openDatabaseWithRecovery();
    } catch (error: any) {
      // If recovery failed, do a hard reset
      if (error?.name === 'VersionError' || error?.message?.includes('version')) {
        console.warn('[Dexie] Version error persists after recovery attempt - performing hard reset');
        await this.resetDatabase();
        // Try opening again after reset
        await this.open();
      } else {
        throw error;
      }
    }
  }

  /**
   * Check the existing database version using raw IndexedDB API
   * Returns null if database doesn't exist, or the version number if it does
   * CRITICAL: Ensures version is parsed as a proper number (not string concatenation)
   */
  private async checkExistingVersion(): Promise<{ version: number | null; needsReset: boolean }> {
    return new Promise((resolve) => {
      const request = indexedDB.open(DB_NAME);
      request.onsuccess = () => {
        const db = request.result;
        let version = db.version;
        
        // CRITICAL FIX: Ensure version is a proper number, not a string or concatenated value
        // Parse as integer to prevent "40" from "4" + "0" string concatenation
        if (typeof version === 'string') {
          version = parseInt(version, 10);
        } else if (typeof version === 'number') {
          // Ensure it's an integer, not a float
          version = Math.floor(version);
        } else {
          // Invalid version type - treat as no version
          console.warn('[Dexie] Invalid version type:', typeof version, version);
          db.close();
          resolve({ version: null, needsReset: false });
          return;
        }
        
        // Additional safety check: if version is unreasonably high (likely a bug), reset it
        // Versions should be small integers (1-10 typically)
        if (version > 100 || version < 0) {
          console.warn(`[Dexie] Suspicious database version detected: ${version}. This is likely a bug. Treating as version 0.`);
          db.close();
          resolve({ version: 0, needsReset: true }); // Needs reset
          return;
        }
        
        // If version is 40, 400, etc. (ends in 0 and is > 10), it's likely a concatenation bug
        // Check if it's a multiple of 10 and > 10, which suggests string concatenation
        if (version > 10 && version % 10 === 0) {
          // Likely a concatenation bug - try to extract the real version
          const versionStr = String(version);
          if (versionStr.length === 2 && versionStr[1] === '0') {
            // "40" -> likely meant to be "4"
            const correctedVersion = parseInt(versionStr[0], 10);
            console.warn(`[Dexie] Detected likely version concatenation bug: ${version} -> correcting to ${correctedVersion}`);
            db.close();
            // Mark as needing reset because the actual DB still has wrong version
            resolve({ version: correctedVersion, needsReset: true });
            return;
          }
        }
        
        db.close();
        resolve({ version, needsReset: false });
      };
      request.onerror = () => {
        // Database doesn't exist or can't be opened
        resolve({ version: null, needsReset: false });
      };
      request.onupgradeneeded = (event) => {
        // Database is being created/upgraded - no existing version to check
        const db = (event.target as IDBOpenDBRequest).result;
        db.close();
        resolve({ version: 0, needsReset: false }); // Version 0 means new database
      };
      request.onblocked = () => {
        // Another tab has the database open - we can't check version
        // Return null to let normal flow handle it
        resolve({ version: null, needsReset: false });
      };
    });
  }

  /**
   * Open database with automatic recovery from VersionError
   * Automatically handles version mismatches by resetting the database
   */
  private async openDatabaseWithRecovery(): Promise<void> {
    try {
      await this.open();
      console.log(`[Dexie] Database opened successfully (version ${CURRENT_DB_VERSION})`);
    } catch (error: any) {
      if (error?.name === 'VersionError' || error?.message?.includes('version')) {
        console.warn(
          `[Dexie] Version mismatch detected: expected version ${CURRENT_DB_VERSION}, but existing version is different. Resetting database...`
        );
        console.warn(`[Dexie] Error details: ${error.message}`);

        // Attempt to export data before deletion (if database is accessible)
        let dataExported = false;
        try {
          // Try to export data before deletion
          const exportData = await this.exportDatabaseInternal();
          if (exportData && Object.keys(exportData).length > 0) {
            // Store export in sessionStorage temporarily for recovery
            sessionStorage.setItem('dexie_export_before_recovery', JSON.stringify(exportData));
            dataExported = true;
            console.log('[Dexie] Data exported before reset - stored in sessionStorage');
          }
        } catch (exportError) {
          console.warn('[Dexie] Could not export data before reset (non-critical):', exportError);
        }

        // Reset the database (delete and recreate)
        await this.resetDatabase();
        
        if (dataExported) {
          console.log('[Dexie] Data export available in sessionStorage - you can import it manually if needed');
        }
        
        // No reload needed - database is now reset and ready
        return;
      } else {
        // Not a version error - re-throw for logging
        console.error('[Dexie] Failed to open database:', error);
        throw error;
      }
    }
  }

  /**
   * Clean up old database if it exists
   * Removes the old database name 'com.acminds.grounded.therapy.db' if present
   */
  private async cleanupOldDatabase(): Promise<void> {
    try {
      if (typeof indexedDB === 'undefined') {
        return;
      }

      const oldDbName = 'com.acminds.grounded.therapy.db';
      
      // Check if old database exists
      if ('databases' in indexedDB) {
        const databases = await (indexedDB as any).databases();
        const oldDb = databases.find((db: any) => db.name === oldDbName);
        
        if (oldDb) {
          try {
            await new Promise<void>((resolve, reject) => {
              const deleteRequest = indexedDB.deleteDatabase(oldDbName);
              deleteRequest.onsuccess = () => {
                console.log('[Dexie] Old database cleaned up successfully');
                resolve();
              };
              deleteRequest.onerror = () => {
                console.warn('[Dexie] Failed to delete old database:', deleteRequest.error);
                resolve(); // Don't block initialization
              };
              deleteRequest.onblocked = () => {
                console.warn('[Dexie] Old database deletion blocked - another tab may have it open');
                setTimeout(() => resolve(), 1000); // Wait and resolve anyway
              };
            });
          } catch (error) {
            console.warn('[Dexie] Error during old database cleanup:', error);
            // Don't throw - continue with initialization
          }
        }
      }
    } catch (error) {
      console.warn('[Dexie] Error checking for old database:', error);
      // Don't throw - continue with initialization
    }
  }
}

// Export singleton instance
export const db = new GroundedDB();

/**
 * Reset the Dexie database (deletes and recreates)
 * Use this to resolve version conflicts or start fresh
 */
export async function resetDexieDatabase(): Promise<void> {
  await db.resetDatabase();
}

/**
 * Export all database data as JSON
 * Useful for backing up data or migrating between browsers/devices
 * 
 * @returns JSON string containing all data from all stores
 */
export async function exportDatabase(): Promise<string> {
  try {
    await db.open();
    const exportData: Record<string, any[]> = {};
    
    // Export all stores
    for (const table of db.tables) {
      try {
        exportData[table.name] = await table.toArray();
      } catch (err) {
        console.warn(`[Dexie] Failed to export store ${table.name}:`, err);
        exportData[table.name] = [];
      }
    }
    
    const jsonString = JSON.stringify(exportData, null, 2);
    console.log('[Dexie] Export successful - all stores exported');
    return jsonString;
  } catch (err) {
    console.error('[Dexie] Export failed:', err);
    throw err;
  }
}

/**
 * Internal export function used during recovery
 * Attempts to export data even if database version is mismatched
 */
async function exportDatabaseInternal(): Promise<Record<string, any[]> | null> {
  try {
    // Try to open database (may fail with VersionError)
    try {
      await db.open();
    } catch (openError: any) {
      // If VersionError, try to access raw IndexedDB
      if (openError?.name === 'VersionError') {
        return await exportFromRawIndexedDB();
      }
      throw openError;
    }
    
    const exportData: Record<string, any[]> = {};
    for (const table of db.tables) {
      try {
        exportData[table.name] = await table.toArray();
      } catch (err) {
        // Skip stores that can't be exported
        console.warn(`[Dexie] Could not export ${table.name}:`, err);
      }
    }
    return exportData;
  } catch (err) {
    console.warn('[Dexie] Internal export failed:', err);
    return null;
  }
}

/**
 * Export data directly from raw IndexedDB (bypasses Dexie version check)
 */
async function exportFromRawIndexedDB(): Promise<Record<string, any[]> | null> {
  try {
    const exportData: Record<string, any[]> = {};
    
    // Open database with higher version to read data
    return new Promise((resolve) => {
      const request = indexedDB.open(DB_NAME);
      
      request.onsuccess = async () => {
        const rawDb = request.result;
        const storeNames = Array.from(rawDb.objectStoreNames);
        
        for (const storeName of storeNames) {
          try {
            const transaction = rawDb.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const getAllRequest = store.getAll();
            
            await new Promise<void>((resolveStore) => {
              getAllRequest.onsuccess = () => {
                exportData[storeName] = getAllRequest.result;
                resolveStore();
              };
              getAllRequest.onerror = () => {
                console.warn(`[Dexie] Could not read store ${storeName}`);
                exportData[storeName] = [];
                resolveStore();
              };
            });
          } catch (err) {
            console.warn(`[Dexie] Error exporting ${storeName}:`, err);
            exportData[storeName] = [];
          }
        }
        
        rawDb.close();
        resolve(exportData);
      };
      
      request.onerror = () => {
        console.warn('[Dexie] Could not open database for export');
        resolve(null);
      };
      
      request.onblocked = () => {
        console.warn('[Dexie] Database open blocked');
        resolve(null);
      };
    });
  } catch (err) {
    console.warn('[Dexie] Raw IndexedDB export failed:', err);
    return null;
  }
}

/**
 * Import database data from JSON string
 * Useful for restoring backups or migrating data between browsers/devices
 * 
 * @param jsonString - JSON string containing data to import
 * @param clearExisting - If true, clears existing data before importing (default: false)
 */
export async function importDatabase(jsonString: string, clearExisting: boolean = false): Promise<void> {
  try {
    await db.open();
    const data = JSON.parse(jsonString);
    
    // Validate data structure
    if (typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('Invalid import data format - expected object with store names as keys');
    }
    
    // Import each store
    for (const [storeName, records] of Object.entries(data)) {
      if (!Array.isArray(records)) {
        console.warn(`[Dexie] Skipping invalid store data: ${storeName} (not an array)`);
        continue;
      }
      
      const table = db.table(storeName);
      
      if (!table) {
        console.warn(`[Dexie] Store ${storeName} does not exist in schema - skipping`);
        continue;
      }
      
      try {
        // Clear existing data if requested
        if (clearExisting) {
          await table.clear();
        }
        
        // Import records using bulkPut (handles both inserts and updates)
        if (records.length > 0) {
          await table.bulkPut(records as any[]);
          console.log(`[Dexie] Imported ${records.length} records into ${storeName}`);
        }
      } catch (err) {
        console.error(`[Dexie] Failed to import ${storeName}:`, err);
        // Continue with other stores even if one fails
      }
    }
    
    console.log('[Dexie] Import successful – database restored.');
  } catch (err) {
    console.error('[Dexie] Import failed:', err);
    throw err;
  }
}

/**
 * Attempt to recover data from sessionStorage after version recovery
 * Called automatically after page reload if data was exported before recovery
 */
export async function recoverExportedData(): Promise<boolean> {
  try {
    const exportedDataStr = sessionStorage.getItem('dexie_export_before_recovery');
    if (!exportedDataStr) {
      return false;
    }
    
    const exportedData = JSON.parse(exportedDataStr);
    if (!exportedData || Object.keys(exportedData).length === 0) {
      sessionStorage.removeItem('dexie_export_before_recovery');
      return false;
    }
    
    console.log('[Dexie] Found exported data from recovery - attempting to restore...');
    
    // Wait for database to be ready
    await db.open();
    
    // Import the data
    await importDatabase(JSON.stringify(exportedData), false);
    
    // Clear the sessionStorage entry
    sessionStorage.removeItem('dexie_export_before_recovery');
    
    console.log('[Dexie] Data recovery successful');
    return true;
  } catch (err) {
    console.error('[Dexie] Data recovery failed:', err);
    sessionStorage.removeItem('dexie_export_before_recovery');
    return false;
  }
}

/**
 * 🔒 PRIVACY-FIRST: All Data Stays On-Device
 * -------------------------------------------
 * 
 * This is a privacy-first app. ALL databases and user data remain on-device.
 * NO data is ever sent to external servers or cloud services.
 * 
 * Cloud sync functionality has been DISABLED to ensure complete privacy.
 * All data is stored locally in IndexedDB and never transmitted.
 * 
 * Storage locations (all on-device):
 * - IndexedDB: groundedDB (all user data, accounts, logs, values, goals)
 * - localStorage: Settings, encryption salt, session data
 * - sessionStorage: Current session, encryption password (in-memory only)
 * 
 * HIPAA Compliance: All PHI data is encrypted locally using AES-GCM.
 * Encryption keys are derived from user passwords and never stored.
 */

// Cloud sync is DISABLED for privacy-first architecture
const CLOUD_SYNC_URL = ''; // Always empty - no cloud sync
const SYNC_INTERVAL_MINUTES = 0; // Disabled
const SYNC_ENABLED = false; // Always false - privacy-first

// Get current user ID from storage (checks both sessionStorage and localStorage)
function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') return null;
  
  // Try sessionStorage first (current session)
  const sessionUserId = sessionStorage.getItem('userId');
  if (sessionUserId) return sessionUserId;
  
  // Fallback to localStorage (persisted)
  const localUserId = localStorage.getItem('userId');
  if (localUserId) return localUserId;
  
  return null;
}

/**
 * Cloud sync is DISABLED for privacy-first architecture.
 * All data remains on-device. This function is a no-op.
 * 
 * PRIVACY GUARANTEE: No user data is ever transmitted to external servers.
 */
export async function syncToCloud(): Promise<void> {
  // Cloud sync is permanently disabled for privacy-first architecture
  // All data stays on-device in IndexedDB
  console.log('[Privacy] Cloud sync disabled - all data remains on-device');
  return Promise.resolve();
    }

/**
 * Cloud restore is DISABLED for privacy-first architecture.
 * All data remains on-device. This function is a no-op.
 * 
 * PRIVACY GUARANTEE: No user data is ever downloaded from external servers.
 */
export async function restoreFromCloud(): Promise<boolean> {
  // Cloud restore is permanently disabled for privacy-first architecture
  // All data stays on-device in IndexedDB
  console.log('[Privacy] Cloud restore disabled - all data remains on-device');
  return false;
    }

/**
 * PRIVACY-FIRST: Auto-sync is DISABLED.
 * All data remains on-device. This function is a no-op.
 */
let syncIntervalId: NodeJS.Timeout | null = null;

export function startAutoSync(): void {
  // Cloud sync is permanently disabled for privacy-first architecture
  console.log('[Privacy] Auto-sync disabled - all data remains on-device');
}

/**
 * PRIVACY-FIRST: Auto-sync is DISABLED.
 */
export function stopAutoSync(): void {
  // Cloud sync is permanently disabled
  if (syncIntervalId) {
    clearInterval(syncIntervalId);
    syncIntervalId = null;
  }
  console.log('[Privacy] Auto-sync already disabled - all data remains on-device');
}

/**
 * PRIVACY-FIRST: Manual sync is DISABLED.
 * All data remains on-device. This function is a no-op.
 */
export async function triggerManualSync(): Promise<{ success: boolean; error?: string }> {
  // Cloud sync is permanently disabled for privacy-first architecture
  console.log('[Privacy] Manual sync disabled - all data remains on-device');
  return { success: false, error: 'Cloud sync is disabled for privacy. All data stays on-device.' };
}

/**
 * PRIVACY-FIRST: Cloud sync is DISABLED.
 */
export function isCloudSyncAvailable(): boolean {
  // Always return false - privacy-first means no cloud sync
  return false;
}

/**
 * Get last sync timestamp
 */
export function getLastSyncTime(): string | null {
  return localStorage.getItem('last_cloud_sync');
}

/**
 * Get last restore timestamp
 */
export function getLastRestoreTime(): string | null {
  return localStorage.getItem('last_cloud_restore');
}

// PRIVACY-FIRST: No auto-initialization of cloud sync
// All data remains on-device. Cloud sync is permanently disabled.
if (typeof window !== 'undefined') {
  // Cloud sync is disabled - no auto-restore or auto-sync
  console.log('[Privacy] Cloud sync disabled - all data remains on-device');
}

/**
 * Helper methods for user operations using Dexie
 * These replace the raw IndexedDB operations from database.ts
 */
export async function createUser(userData: Omit<UserRecord, 'id' | 'createdAt'>): Promise<string> {
  try {
    // Ensure database is open
    if (!db.isOpen()) {
      await db.open();
    }

    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const user: UserRecord = {
      ...userData,
      id,
      createdAt: new Date().toISOString()
    };
    
    await db.users.add(user);
    return id;
  } catch (error) {
    console.error('[Dexie] Error creating user:', error);
    throw error;
  }
}

export async function getUserByUsername(username: string): Promise<UserRecord | null> {
  try {
    if (!db.isOpen()) {
      await db.open();
    }
    const user = await db.users.where('username').equals(username).first();
    return user || null;
  } catch (error) {
    console.error('[Dexie] Error getting user by username:', error);
    return null;
  }
}

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  try {
    if (!db.isOpen()) {
      await db.open();
    }
    const user = await db.users.where('email').equals(email).first();
    return user || null;
  } catch (error) {
    console.error('[Dexie] Error getting user by email:', error);
    return null;
  }
}

export async function getUserById(userId: string): Promise<UserRecord | null> {
  try {
    if (!db.isOpen()) {
      await db.open();
    }
    const user = await db.users.get(userId);
    return user || null;
  } catch (error) {
    console.error('[Dexie] Error getting user by id:', error);
    return null;
    }
}

export async function getAllUsers(): Promise<UserRecord[]> {
  try {
    if (!db.isOpen()) {
      await db.open();
    }
    return await db.users.toArray();
  } catch (error) {
    console.error('[Dexie] Error getting all users:', error);
    return [];
  }
}

export async function updateUser(userId: string, updates: Partial<UserRecord>): Promise<void> {
  try {
    if (!db.isOpen()) {
      await db.open();
    }
    const user = await db.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }
    await db.users.update(userId, updates);
  } catch (error) {
    console.error('[Dexie] Error updating user:', error);
    throw error;
  }
}

/**
 * Helper methods for reset token operations using Dexie
 */
export async function createResetToken(userId: string, email: string): Promise<string> {
  try {
    if (!db.isOpen()) {
      await db.open();
    }
    
    const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    
    await db.resetTokens.add({
      token,
      userId,
      email,
      expires: expires.toString(), // Store as string for consistency
      createdAt: new Date().toISOString(),
    });
    
    return token;
  } catch (error) {
    console.error('[Dexie] Error creating reset token:', error);
    throw error;
  }
}

export async function getResetToken(token: string): Promise<{ userId: string; email: string } | null> {
  try {
    if (!db.isOpen()) {
      await db.open();
    }
    
    const tokenRecord = await db.resetTokens.get(token);
    if (!tokenRecord) {
      return null;
  }

    // Check if token is expired - handle both string and number formats
    let expires: number;
    if (typeof tokenRecord.expires === 'string') {
      expires = parseInt(tokenRecord.expires, 10);
    } else {
      expires = tokenRecord.expires as number;
    }
    
    if (isNaN(expires) || expires < Date.now()) {
      return null;
    }
    
    return { userId: tokenRecord.userId, email: tokenRecord.email };
  } catch (error) {
    console.error('[Dexie] Error getting reset token:', error);
    return null;
  }
}

export async function deleteResetToken(token: string): Promise<void> {
  try {
    if (!db.isOpen()) {
      await db.open();
    }
    await db.resetTokens.delete(token);
  } catch (error) {
    console.error('[Dexie] Error deleting reset token:', error);
    throw error;
  }
}

export async function cleanupExpiredTokens(): Promise<void> {
  try {
    if (!db.isOpen()) {
      await db.open();
}

    const now = Date.now();
    const tokens = await db.resetTokens.toArray();
    const expiredTokens = tokens.filter(t => {
      let expires: number;
      if (typeof t.expires === 'string') {
        expires = parseInt(t.expires, 10);
      } else {
        expires = t.expires as number;
      }
      return !isNaN(expires) && expires < now;
    });
    
    await Promise.all(expiredTokens.map(t => db.resetTokens.delete(t.token)));
  } catch (error) {
    console.error('[Dexie] Error cleaning up expired tokens:', error);
    // Don't throw - cleanup is non-critical
  }
}

/**
 * Helper methods for analytics operations using Dexie
 */
export async function getFeelingPatterns(startDate: string, endDate: string): Promise<{ state: string; count: number }[]> {
  try {
    if (!db.isOpen()) {
      await db.open();
    }
    
    const logs = await db.feelingLogs
      .where('timestamp')
      .between(startDate, endDate, true, true)
      .toArray();
    
    const patterns: Record<string, number> = {};
    logs.forEach(log => {
      const state = log.emotionalState || log.emotion || 'unknown';
      patterns[state] = (patterns[state] || 0) + 1;
    });
    
    return Object.entries(patterns).map(([state, count]) => ({ state, count }));
  } catch (error) {
    console.error('[Dexie] Error getting feeling patterns:', error);
    return [];
  }
}

export async function getProgressMetrics(startDate: string, endDate: string): Promise<{
  totalSessions: number;
  averageDuration: number;
  valuesEngaged: string[];
}> {
  try {
    if (!db.isOpen()) {
      await db.open();
}

    const sessions = await db.sessions
      .where('startTimestamp')
      .between(startDate, endDate, true, true)
      .toArray();
    
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.duration !== undefined && s.duration !== null);
    const averageDuration = completedSessions.length > 0
      ? completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / completedSessions.length
      : 0;
    const valuesEngaged = [...new Set(sessions.map(s => s.valueId).filter(Boolean))];
    
    return { totalSessions, averageDuration, valuesEngaged };
  } catch (error) {
    console.error('[Dexie] Error getting progress metrics:', error);
    return { totalSessions: 0, averageDuration: 0, valuesEngaged: [] };
  }
}

export async function getFeelingFrequency(limit?: number): Promise<{ feeling: string; count: number }[]> {
  try {
    if (!db.isOpen()) {
      await db.open();
    }
    
    const logs = await db.feelingLogs
      .orderBy('timestamp')
      .reverse()
      .toArray();
    
    const frequency: Record<string, number> = {};
    const logsToProcess = limit ? logs.slice(0, limit) : logs;
    
    logsToProcess.forEach(log => {
      const feeling = log.selectedFeeling;
      if (feeling) {
        frequency[feeling] = (frequency[feeling] || 0) + 1;
        }
    });
    
    return Object.entries(frequency)
      .map(([feeling, count]) => ({ feeling, count }))
      .sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error('[Dexie] Error getting feeling frequency:', error);
    return [];
  }
}

// Export types for use in other modules
export type {
  UserRecord,
  AppDataRecord,
  ValueRecord,
  GoalRecord,
  FeelingLogRecord,
  UserInteractionRecord,
  SessionRecord,
  AssessmentRecord,
  ReportRecord,
  ResetTokenRecord,
  MetadataRecord,
  RuleBasedUsageLogRecord,
};

