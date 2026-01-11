/**
 * Legacy Detection Service
 * Detects legacy data and handles backup/restore operations
 */

import { openDB } from 'idb';

export interface LegacyDataInfo {
  hasLegacyData: boolean;
  recordCount: number;
  tables: string[];
  lastBackup?: string;
}

const BACKUP_KEY = 'grounded_legacy_backup';
const BACKUP_EXPIRY_DAYS = 7;

/**
 * Detect if legacy data exists
 */
export async function detectLegacyData(): Promise<LegacyDataInfo> {
  try {
    // Try to open database with current version (5), fallback to version 4 if needed
    // Handle VersionError gracefully - if database is newer, just check if it exists
    let db;
    try {
      db = await openDB('groundedDB', 5);
    } catch (versionError: unknown) {
      // If version error (requested version < existing), try to open without version
      // This happens when database was upgraded but we're checking with old version
      if (versionError?.name === 'VersionError' || versionError?.message?.includes('version')) {
        // Database exists but is newer - this means we're using Dexie (version 80/800)
        // Don't call dbService.init() as it will cause version conflicts
        // Return empty - database exists but is current version, not legacy
        return {
          hasLegacyData: false,
          recordCount: 0,
          tables: []
        };
      }
      // Try version 4 as fallback
      try {
        db = await openDB('groundedDB', 4);
      } catch (fallbackError) {
        // Database doesn't exist or can't be opened
        return {
          hasLegacyData: false,
          recordCount: 0,
          tables: []
        };
      }
    }
    
    const tables: string[] = [];
    let totalCount = 0;
    
    // Check each object store
    for (const storeName of db.objectStoreNames) {
      // Skip metadata store
      if (storeName === 'metadata') {
        continue;
      }
      
      const store = db.transaction(storeName, 'readonly').objectStore(storeName);
      const count = await store.count();
      
      if (count > 0) {
        tables.push(storeName);
        totalCount += count;
      }
    }
    
    await db.close();
    
    // Check for existing backup
    const backup = getLegacyBackup();
    
    return {
      hasLegacyData: totalCount > 0,
      recordCount: totalCount,
      tables,
      lastBackup: backup?.timestamp
    };
  } catch (error) {
    // Silently handle errors - database might not exist or be inaccessible
    // Don't log as error since this is expected in some cases
    return {
      hasLegacyData: false,
      recordCount: 0,
      tables: []
    };
  }
}

/**
 * Create backup of legacy database
 */
export async function createLegacyBackup(): Promise<void> {
  try {
    // Try current version first, fallback to version 4
    let db;
    try {
      db = await openDB('groundedDB', 5);
    } catch (versionError: unknown) {
      if (versionError?.name === 'VersionError' || versionError?.message?.includes('version')) {
        // Database is newer - can't backup with old version
        throw new Error('Database version mismatch - cannot create backup');
      }
      db = await openDB('groundedDB', 4);
    }
    const backup: Record<string, any[]> = {};
    
    // Backup all object stores
    for (const storeName of db.objectStoreNames) {
      const store = db.transaction(storeName, 'readonly').objectStore(storeName);
      const data = await store.getAll();
      backup[storeName] = data;
    }
    
    await db.close();
    
    // Store backup in localStorage with expiration
    const backupData = {
      timestamp: new Date().toISOString(),
      expiry: Date.now() + (BACKUP_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
      data: backup
    };
    
    try {
      localStorage.setItem(BACKUP_KEY, JSON.stringify(backupData));
    } catch (error) {
      // If localStorage is full, try to clear old backups first
      console.warn('Failed to save backup to localStorage:', error);
      throw new Error('Failed to create backup: localStorage may be full');
    }
  } catch (error) {
    console.error('Error creating legacy backup:', error);
    throw error;
  }
}

/**
 * Get legacy backup if it exists and hasn't expired
 */
export function getLegacyBackup(): { timestamp: string; data: Record<string, any[]> } | null {
  try {
    const backupStr = localStorage.getItem(BACKUP_KEY);
    if (!backupStr) {
      return null;
    }
    
    const backup = JSON.parse(backupStr);
    
    // Check if backup has expired
    if (backup.expiry && Date.now() > backup.expiry) {
      // Clean up expired backup
      localStorage.removeItem(BACKUP_KEY);
      return null;
    }
    
    return {
      timestamp: backup.timestamp,
      data: backup.data
    };
  } catch (error) {
    console.error('Error reading legacy backup:', error);
    return null;
  }
}

/**
 * Restore legacy backup
 */
export async function restoreLegacyBackup(): Promise<void> {
  const backup = getLegacyBackup();
  
  if (!backup) {
    throw new Error('No backup found or backup has expired');
  }
  
  try {
    // Try current version first, fallback to version 4
    let db;
    try {
      db = await openDB('groundedDB', 5);
    } catch (versionError: unknown) {
      if (versionError?.name === 'VersionError' || versionError?.message?.includes('version')) {
        throw new Error('Database version mismatch - cannot restore backup');
      }
      db = await openDB('groundedDB', 4);
    }
    
    // Clear existing data
    for (const storeName of db.objectStoreNames) {
      if (storeName === 'metadata') {
        continue; // Don't clear metadata
      }
      
      const store = db.transaction(storeName, 'readwrite').objectStore(storeName);
      await store.clear();
    }
    
    // Restore data from backup
    for (const [storeName, data] of Object.entries(backup.data)) {
      if (!db.objectStoreNames.contains(storeName)) {
        console.warn(`Store ${storeName} not found, skipping restore`);
        continue;
      }
      
      const store = db.transaction(storeName, 'readwrite').objectStore(storeName);
      
      for (const record of data) {
        await store.put(record);
      }
    }
    
    await db.close();
  } catch (error) {
    console.error('Error restoring legacy backup:', error);
    throw error;
  }
}

/**
 * Delete legacy backup
 */
export function deleteLegacyBackup(): void {
  try {
    localStorage.removeItem(BACKUP_KEY);
  } catch (error) {
    console.error('Error deleting legacy backup:', error);
  }
}

/**
 * Check if backup exists and is valid
 */
export function hasValidBackup(): boolean {
  return getLegacyBackup() !== null;
}

