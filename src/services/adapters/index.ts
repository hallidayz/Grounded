/**
 * Database Adapter Factory
 * 
 * PRIVACY-FIRST: All database operations are local-only.
 * NO data is ever sent to external servers or cloud services.
 * 
 * Provides unified interface for local IndexedDB operations.
 * All data remains on-device in IndexedDB (groundedDB).
 */

import { LegacyAdapter } from './LegacyAdapter';
import type { DatabaseAdapter } from './types';

/**
 * Check if encryption is enabled
 * Encryption is handled at the Dexie hook level, not at the adapter level
 */
export function isEncryptionEnabled(): boolean {
  try {
    return localStorage.getItem('encryption_enabled') === 'true';
  } catch (error) {
    console.error('[databaseAdapter] Error checking encryption status:', error);
    return false;
  }
}

/**
 * Factory function to get the database adapter
 * 
 * ALWAYS returns LegacyAdapter (Dexie-based) for unified database architecture.
 * Encryption is handled at the Dexie hook level, not at the adapter level.
 * 
 * This consolidates all data into a single groundedDB database, eliminating
 * the need for separate EncryptedPWA (SQLite) storage.
 * 
 * @returns DatabaseAdapter instance (always LegacyAdapter)
 * 
 * @example
 * ```typescript
 * const adapter = getDatabaseAdapter();
 * await adapter.init();
 * const users = await adapter.getAllUsers();
 * ```
 */
export function getDatabaseAdapter(): DatabaseAdapter {
  // Always return Dexie-based adapter
  // Encryption is handled by Dexie hooks when encryption_enabled === 'true'
  return new LegacyAdapter();
}

// Re-export types for convenience
export type { DatabaseAdapter, UserData, AppData } from './types';
