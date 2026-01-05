/**
 * Backup Manager Service
 * Manages backup creation, restoration, and cleanup operations
 */

import { createLegacyBackup, restoreLegacyBackup, deleteLegacyBackup, hasValidBackup, getLegacyBackup } from './legacyDetection';

export interface BackupInfo {
  exists: boolean;
  timestamp?: string;
  expiry?: string;
  size?: number;
}

/**
 * Create a backup of the current database state
 */
export async function createBackup(): Promise<void> {
  await createLegacyBackup();
}

/**
 * Restore from the most recent backup
 */
export async function restoreBackup(): Promise<void> {
  await restoreLegacyBackup();
}

/**
 * Delete the current backup
 */
export function deleteBackup(): void {
  deleteLegacyBackup();
}

/**
 * Get information about the current backup
 */
export function getBackupInfo(): BackupInfo {
  const backup = getLegacyBackup();
  
  if (!backup) {
    return { exists: false };
  }
  
  // Calculate approximate size
  const size = JSON.stringify(backup.data).length;
  
  // Get expiry from localStorage
  try {
    const backupStr = localStorage.getItem('grounded_legacy_backup');
    if (backupStr) {
      const backupData = JSON.parse(backupStr);
      return {
        exists: true,
        timestamp: backup.timestamp,
        expiry: new Date(backupData.expiry).toISOString(),
        size
      };
    }
  } catch (error) {
    console.error('Error getting backup info:', error);
  }
  
  return {
    exists: true,
    timestamp: backup.timestamp,
    size
  };
}

/**
 * Check if a valid backup exists
 */
export function hasBackup(): boolean {
  return hasValidBackup();
}

/**
 * Re-export functions for convenience
 */
export { hasValidBackup, restoreLegacyBackup };

/**
 * Clean up expired backups
 */
export function cleanupExpiredBackups(): void {
  // This is handled automatically in getLegacyBackup, but we can call it explicitly
  getLegacyBackup(); // This will remove expired backups
}

