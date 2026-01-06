/**
 * Dexie Database Class
 * 
 * Provides a high-performance IndexedDB wrapper using Dexie.js
 * Replaces raw IndexedDB API with type-safe, promise-based operations
 * 
 * Database: groundedDB
 * Version: Configurable via VITE_DB_VERSION (default: 80 for compatibility)
 * 
 * Features:
 * - Automatic VersionError recovery
 * - Data export/import for cross-browser portability
 * - Safe migration handling
 */

import Dexie, { Table, Middleware } from 'dexie';
import { Goal, FeelingLog, Assessment, CounselorReport, Session, UserInteraction, RuleBasedUsageLog, AppSettings, LogEntry, LCSWConfig } from '../types';
import { encryptData, decryptData } from './encryption';

// Database name constant for consistency
const DB_NAME = 'groundedDB';

// Version constant for explicit version management
// Version 3: Alpha wipe - clean schema with hook-based encryption
export const CURRENT_DB_VERSION = 3;

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
    this.version(CURRENT_DB_VERSION).stores({
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
    
    // Hook-based encryption middleware for PHI data stores
    // Uses Dexie middleware to intercept and encrypt/decrypt data
    this.setupEncryptionHooks();
  }
  
  /**
   * Setup encryption hooks for PHI data stores
   * Hooks mark fields for encryption/decryption - actual crypto happens in adapter
   */
  private setupEncryptionHooks(): void {
    const phiStores = ['feelingLogs', 'sessions', 'assessments', 'reports', 'userInteractions'];
    
    phiStores.forEach(storeName => {
      const table = this.table(storeName);
      
      // Hook into creating to mark fields for encryption
      table.hook('creating', (primKey, obj, trans) => {
        if (this.shouldEncrypt() && obj) {
          return this.markForEncryption(obj);
        }
        return obj;
      });
      
      // Hook into updating to mark fields for encryption
      table.hook('updating', (modifications, primKey, obj, trans) => {
        if (this.shouldEncrypt() && modifications) {
          return this.markForEncryption(modifications);
        }
        return modifications;
      });
      
      // Hook into reading to mark fields for decryption
      table.hook('reading', (obj) => {
        if (this.shouldDecrypt() && obj) {
          return this.markForDecryption(obj);
        }
        return obj;
      });
    });
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
   * Mark fields for encryption (actual encryption happens in adapter)
   */
  private markForEncryption(obj: any): any {
    const fieldsToEncrypt = ['reflectionText', 'aiAnalysis', 'content', 'assessment', 'report'];
    const marked = { ...obj };
    
    fieldsToEncrypt.forEach(field => {
      if (marked[field] && typeof marked[field] === 'string' && !marked[`${field}_encrypted`]) {
        marked[`${field}_needs_encryption`] = true;
      }
    });
    
    return marked;
  }
  
  /**
   * Mark fields for decryption (actual decryption happens in adapter)
   */
  private markForDecryption(obj: any): any {
    const fieldsToDecrypt = ['reflectionText', 'aiAnalysis', 'content', 'assessment', 'report'];
    const marked = { ...obj };
    
    fieldsToDecrypt.forEach(field => {
      if (marked[`${field}_encrypted`] && typeof marked[field] === 'string') {
        marked[`${field}_needs_decryption`] = true;
      }
    });
    
    return marked;
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
    
    // Check for version conflicts and reset if needed
    try {
      await this.openDatabaseWithRecovery();
    } catch (error: any) {
      // If recovery failed, do a hard reset
      if (error?.name === 'VersionError' || error?.message?.includes('version')) {
        console.warn('[Dexie] Version error persists after recovery attempt - performing hard reset');
        await this.resetDatabase();
      } else {
        throw error;
      }
    }
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
 * 🔄 Cloud Backup Auto-Sync Extension
 * -----------------------------------
 * Automatically exports Dexie data to a cloud backup
 * and restores from cloud on first launch (or user switch).
 *
 * Integrates with any REST/Firebase-style endpoint.
 * Only syncs in production mode and when user is authenticated.
 * 
 * HIPAA Note: If encryption is enabled, cloud sync should be disabled
 * or use encrypted endpoints only.
 */

const CLOUD_SYNC_URL = (import.meta.env?.VITE_CLOUD_SYNC_URL as string) || '';
const SYNC_INTERVAL_MINUTES = Number(import.meta.env?.VITE_SYNC_INTERVAL_MINUTES ?? 10);
const SYNC_ENABLED = import.meta.env?.VITE_ENABLE_CLOUD_SYNC === 'true';

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
 * Uploads the entire local database to cloud backup storage.
 * Only runs in production and when user is authenticated.
 */
export async function syncToCloud(): Promise<void> {
  try {
    // Skip if sync is disabled or in development
    if (!SYNC_ENABLED || import.meta.env?.DEV) {
      return;
    }

    const userId = getCurrentUserId();
    if (!userId) {
      console.warn('[Sync] No user ID found. Skipping cloud sync.');
      return;
    }

    if (!CLOUD_SYNC_URL) {
      console.warn('[Sync] No CLOUD_SYNC_URL configured. Skipping cloud sync.');
      return;
    }

    // Check if encryption is enabled - warn if syncing PHI data
    const encryptionEnabled = localStorage.getItem('encryption_enabled') === 'true';
    if (encryptionEnabled) {
      console.warn('[Sync] ⚠️ Encryption enabled - ensure cloud endpoint is HIPAA-compliant before syncing PHI data');
    }

    // Export database
    const exportJson = await exportDatabase();
    const payload = {
      userId,
      timestamp: new Date().toISOString(),
      version: CURRENT_DB_VERSION,
      data: JSON.parse(exportJson)
    };

    // Upload to cloud
    const res = await fetch(`${CLOUD_SYNC_URL}/backup`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        // Add auth token if available
        ...(localStorage.getItem('auth_token') && {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        })
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`Backup failed: ${res.status} ${res.statusText}`);
    }

    const result = await res.json();
    console.log('[Sync] ✅ Cloud backup successful', result);
    
    // Store last sync timestamp
    localStorage.setItem('last_cloud_sync', new Date().toISOString());
  } catch (error) {
    console.error('[Sync] ❌ Cloud backup failed:', error);
    // Non-blocking - don't throw, just log
  }
}

/**
 * Downloads the latest backup and restores the local database.
 * Only runs in production and when user is authenticated.
 */
export async function restoreFromCloud(): Promise<boolean> {
  try {
    // Skip if sync is disabled or in development
    if (!SYNC_ENABLED || import.meta.env?.DEV) {
      return false;
    }

    const userId = getCurrentUserId();
    if (!userId || !CLOUD_SYNC_URL) {
      return false;
    }

    // Check if encryption is enabled - warn if restoring PHI data
    const encryptionEnabled = localStorage.getItem('encryption_enabled') === 'true';
    if (encryptionEnabled) {
      console.warn('[Sync] ⚠️ Encryption enabled - ensure cloud endpoint is HIPAA-compliant before restoring PHI data');
    }

    // Fetch latest backup
    const res = await fetch(`${CLOUD_SYNC_URL}/backup/${userId}`, {
      headers: {
        // Add auth token if available
        ...(localStorage.getItem('auth_token') && {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        })
      }
    });

    if (!res.ok) {
      if (res.status === 404) {
        console.log('[Sync] No existing backup found - this is normal for new users');
      } else {
        console.warn(`[Sync] Backup fetch failed: ${res.status} ${res.statusText}`);
      }
      return false;
    }

    const response = await res.json();
    if (!response || !response.data) {
      console.log('[Sync] No backup data in response');
      return false;
    }

    // Check version compatibility
    if (response.version && response.version !== CURRENT_DB_VERSION) {
      console.warn(`[Sync] Version mismatch: backup version ${response.version} != current ${CURRENT_DB_VERSION}`);
      // Still attempt import - export/import handles version differences
    }

    // Import the data (merge mode - don't clear existing data)
    await importDatabase(JSON.stringify(response.data), false);
    console.log('[Sync] ✅ Cloud restore completed');
    
    // Store last restore timestamp
    localStorage.setItem('last_cloud_restore', new Date().toISOString());
    return true;
  } catch (error) {
    console.error('[Sync] ❌ Cloud restore failed:', error);
    return false;
  }
}

/**
 * Initializes periodic auto-sync every SYNC_INTERVAL_MINUTES.
 * Only starts in production mode when sync is enabled.
 */
let syncIntervalId: NodeJS.Timeout | null = null;

export function startAutoSync(): void {
  // Only run in production
  if (import.meta.env?.DEV) {
    console.log('[Sync] Auto-sync skipped in development mode');
    return;
  }

  // Check if sync is enabled
  if (!SYNC_ENABLED) {
    console.log('[Sync] Auto-sync disabled (VITE_ENABLE_CLOUD_SYNC not set to "true")');
    return;
  }

  // Check if URL is configured
  if (!CLOUD_SYNC_URL) {
    console.warn('[Sync] Auto-sync disabled - CLOUD_SYNC_URL not configured');
    return;
  }

  // Stop any existing sync interval
  if (syncIntervalId) {
    clearInterval(syncIntervalId);
  }

  // Run initial backup after app startup delay (5 seconds)
  setTimeout(() => {
    syncToCloud().catch(err => {
      console.warn('[Sync] Initial backup failed (non-critical):', err);
    });
  }, 5000);

  // Schedule periodic backups
  const intervalMs = SYNC_INTERVAL_MINUTES * 60 * 1000;
  syncIntervalId = setInterval(() => {
    syncToCloud().catch(err => {
      console.warn('[Sync] Periodic backup failed (non-critical):', err);
    });
  }, intervalMs);

  console.log(`[Sync] Auto-sync started (interval: ${SYNC_INTERVAL_MINUTES} minutes)`);
}

/**
 * Stops the auto-sync interval
 */
export function stopAutoSync(): void {
  if (syncIntervalId) {
    clearInterval(syncIntervalId);
    syncIntervalId = null;
    console.log('[Sync] Auto-sync stopped');
  }
}

/**
 * Manually trigger a cloud sync (useful for "Sync Now" button)
 */
export async function triggerManualSync(): Promise<{ success: boolean; error?: string }> {
  try {
    await syncToCloud();
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMessage };
  }
}

/**
 * Check if cloud sync is available and configured
 */
export function isCloudSyncAvailable(): boolean {
  return SYNC_ENABLED && !!CLOUD_SYNC_URL && !import.meta.env?.DEV;
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

// Auto-initialize: Restore data on module load, then start auto-sync
// This runs when the module is imported, but we'll also call it explicitly in useAppInitialization
if (typeof window !== 'undefined') {
  // Only auto-restore in production
  if (!import.meta.env?.DEV && SYNC_ENABLED && CLOUD_SYNC_URL) {
    // Delay restore to avoid blocking app initialization
    setTimeout(() => {
      restoreFromCloud().then(restored => {
        if (restored) {
          console.log('[Sync] Auto-restore completed on module load');
        }
        // Start auto-sync after restore attempt
        startAutoSync();
      }).catch(err => {
        console.warn('[Sync] Auto-restore on module load failed (non-critical):', err);
        // Still start auto-sync even if restore fails
        startAutoSync();
      });
    }, 2000); // 2 second delay to let app initialize
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

