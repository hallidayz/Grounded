/**
 * Migration Script: Consolidate groundedAuthDB into groundedDB
 * 
 * This script migrates all user accounts from the separate groundedAuthDB
 * into the main groundedDB.users table, enabling a single unified database.
 */

import { db } from './dexieDB';
import type { UserRecord } from './dexieDB';

interface AuthUserData {
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

/**
 * Check if migration has already been completed
 */
export async function isMigrationComplete(): Promise<boolean> {
  try {
    const migrationMarker = localStorage.getItem('auth_migration_complete');
    return migrationMarker === 'true';
  } catch {
    return false;
  }
}

/**
 * Mark migration as complete
 */
export async function markMigrationComplete(): Promise<void> {
  try {
    localStorage.setItem('auth_migration_complete', 'true');
    console.log('[Migration] Migration marked as complete');
  } catch (error) {
    console.error('[Migration] Failed to mark migration complete:', error);
  }
}

/**
 * Read all users from groundedAuthDB
 */
async function readUsersFromAuthDB(): Promise<AuthUserData[]> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      resolve([]);
      return;
    }

    const request = indexedDB.open('groundedAuthDB', 1);

    request.onsuccess = () => {
      const authDb = request.result;
      
      if (!authDb.objectStoreNames.contains('users')) {
        console.log('[Migration] groundedAuthDB has no users store - nothing to migrate');
        authDb.close();
        resolve([]);
        return;
      }

      const transaction = authDb.transaction(['users'], 'readonly');
      const store = transaction.objectStore('users');
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => {
        const users = getAllRequest.result || [];
        console.log(`[Migration] Found ${users.length} user(s) in groundedAuthDB`);
        authDb.close();
        resolve(users);
      };

      getAllRequest.onerror = () => {
        console.error('[Migration] Error reading users from groundedAuthDB:', getAllRequest.error);
        authDb.close();
        reject(getAllRequest.error);
      };
    };

    request.onerror = () => {
      // If groundedAuthDB doesn't exist, that's OK - nothing to migrate
      if (request.error?.name === 'NotFoundError') {
        console.log('[Migration] groundedAuthDB does not exist - nothing to migrate');
        resolve([]);
      } else {
        console.error('[Migration] Error opening groundedAuthDB:', request.error);
        reject(request.error);
      }
    };

    request.onupgradeneeded = () => {
      // If upgrade is needed, database doesn't exist yet
      request.transaction?.abort();
      resolve([]);
    };
  });
}

/**
 * Migrate users to groundedDB
 */
async function migrateUsersToDexie(users: AuthUserData[]): Promise<number> {
  if (users.length === 0) {
    return 0;
  }

  let migratedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const user of users) {
    try {
      // Check if user already exists in groundedDB
      const existing = await db.users.get(user.id);
      
      if (existing) {
        console.log(`[Migration] User ${user.username} already exists in groundedDB - skipping`);
        skippedCount++;
        continue;
      }

      // Convert to UserRecord format
      const userRecord: UserRecord = {
        id: user.id,
        username: user.username,
        passwordHash: user.passwordHash,
        email: user.email,
        therapistEmails: user.therapistEmails,
        termsAccepted: user.termsAccepted,
        termsAcceptedDate: user.termsAcceptedDate,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      };

      // Add to groundedDB
      await db.users.add(userRecord);
      migratedCount++;
      console.log(`[Migration] Migrated user: ${user.username} (${user.id})`);
    } catch (error: unknown) {
      // If user already exists (ConstraintError), that's OK
      if (error?.name === 'ConstraintError' || error?.message?.includes('already exists')) {
        console.log(`[Migration] User ${user.username} already exists - skipping`);
        skippedCount++;
      } else {
        console.error(`[Migration] Error migrating user ${user.username}:`, error);
        errorCount++;
      }
    }
  }

  console.log(`[Migration] Migration complete: ${migratedCount} migrated, ${skippedCount} skipped, ${errorCount} errors`);
  return migratedCount;
}

/**
 * Main migration function
 */
export async function migrateAuthToDexie(): Promise<{
  success: boolean;
  migrated: number;
  skipped: number;
  errors: number;
}> {
  try {
    // Check if migration already completed
    if (await isMigrationComplete()) {
      console.log('[Migration] Migration already completed - skipping');
      return { success: true, migrated: 0, skipped: 0, errors: 0 };
    }

    console.log('[Migration] Starting migration from groundedAuthDB to groundedDB...');

    // Ensure groundedDB is initialized
    await db.open();

    // Read users from groundedAuthDB
    const users = await readUsersFromAuthDB();

    if (users.length === 0) {
      console.log('[Migration] No users to migrate');
      await markMigrationComplete();
      return { success: true, migrated: 0, skipped: 0, errors: 0 };
    }

    // Migrate users
    const migrated = await migrateUsersToDexie(users);

    // Mark migration as complete
    await markMigrationComplete();

    return {
      success: true,
      migrated,
      skipped: users.length - migrated,
      errors: 0,
    };
  } catch (error) {
    console.error('[Migration] Migration failed:', error);
    return {
      success: false,
      migrated: 0,
      skipped: 0,
      errors: 1,
    };
  }
}
