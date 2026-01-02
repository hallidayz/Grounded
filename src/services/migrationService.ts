import { db, User, AppData, ResetToken, FeelingLog, Reflection, Metadata, RuleBasedUsageLog } from './database';
import { openDB, IDBPDatabase } from 'idb'; // Using 'idb' to access the old IndexedDB

// Define a type for the old database schema if available
interface OldDatabaseSchema {
  users: User[];
  appData: AppData[];
  resetTokens: ResetToken[];
  feelingLogs: FeelingLog[];
  // Add other old stores
  metadata: Metadata[];
  ruleBasedUsageLogs: RuleBasedUsageLog[];
  // If reflections were a separate store in the old DB
  reflections?: Reflection[];
}

const OLD_DB_NAME = 'GroundedDB'; // Name of your old IndexedDB
const OLD_DB_VERSION = 1; // Or whatever the last version of your old DB was

export async function runMigrations(): Promise<void> {
  console.group('[MigrationService]');
  console.info('Attempting to run database migrations...');

  let oldDB: IDBPDatabase<OldDatabaseSchema> | undefined;

  try {
    // Check if the old database exists. If not, no migration is needed.
    const dbExists = await IndexedDB.databases();
    const oldDbInfo = dbExists.find(d => d.name === OLD_DB_NAME);

    if (!oldDbInfo) {
      console.info('Old database not found. No migration needed.');
      console.groupEnd();
      return;
    }

    // Open the old IndexedDB
    oldDB = await openDB<OldDatabaseSchema>(OLD_DB_NAME, OLD_DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        // This upgrade function is for the old DB, if needed to access older versions
        console.warn(`Old DB upgrade needed: ${oldVersion} -> ${newVersion}`);
        // Example: if old DB had multiple versions, handle them here
        // if (oldVersion < 1) { db.createObjectStore('some_old_store'); }
      },
    });

    // Start a transactional migration with Dexie
    await db.transaction('rw', db.users, db.appData, db.resetTokens, db.feelingLogs, db.reflections, db.metadata, db.ruleBasedUsageLogs, async (tx) => {
      console.info('Starting Dexie transaction for migration...');

      // --- Migrate 'users' store ---
      if (oldDB && oldDB.objectStoreNames.contains('users')) {
        const oldUsers = await oldDB.getAll('users');
        if (oldUsers.length > 0) {
          console.info(`Migrating ${oldUsers.length} users...`);
          await db.users.bulkAdd(oldUsers);
        }
      }

      // --- Migrate 'appData' store ---
      if (oldDB && oldDB.objectStoreNames.contains('appData')) {
        const oldAppData = await oldDB.getAll('appData');
        if (oldAppData.length > 0) {
          console.info(`Migrating ${oldAppData.length} app data entries...`);
          await db.appData.bulkPut(oldAppData); // Use bulkPut for unique keys
        }
      }

      // --- Migrate 'resetTokens' store ---
      if (oldDB && oldDB.objectStoreNames.contains('resetTokens')) {
        const oldResetTokens = await oldDB.getAll('resetTokens');
        if (oldResetTokens.length > 0) {
          console.info(`Migrating ${oldResetTokens.length} reset tokens...`);
          await db.resetTokens.bulkAdd(oldResetTokens);
        }
      }

      // --- Migrate 'feelingLogs' store ---
      if (oldDB && oldDB.objectStoreNames.contains('feelingLogs')) {
        const oldFeelingLogs = await oldDB.getAll('feelingLogs');
        if (oldFeelingLogs.length > 0) {
          console.info(`Migrating ${oldFeelingLogs.length} feeling logs...`);
          await db.feelingLogs.bulkAdd(oldFeelingLogs);
        }
      }
      
      // --- Migrate 'reflections' store (if separate) ---
      // Assuming reflections might be part of feelingLogs or a separate store
      if (oldDB && oldDB.objectStoreNames.contains('reflections')) {
        const oldReflections = await oldDB.getAll('reflections');
        if (oldReflections.length > 0) {
          console.info(`Migrating ${oldReflections.length} reflections...`);
          await db.reflections.bulkAdd(oldReflections);
        }
      }

      // --- Migrate 'metadata' store ---
      if (oldDB && oldDB.objectStoreNames.contains('metadata')) {
        const oldMetadata = await oldDB.getAll('metadata');
        if (oldMetadata.length > 0) {
          console.info(`Migrating ${oldMetadata.length} metadata entries...`);
          await db.metadata.bulkPut(oldMetadata); // Use bulkPut for unique keys
        }
      }

      // --- Migrate 'ruleBasedUsageLogs' store ---
      if (oldDB && oldDB.objectStoreNames.contains('ruleBasedUsageLogs')) {
        const oldRuleBasedUsageLogs = await oldDB.getAll('ruleBasedUsageLogs');
        if (oldRuleBasedUsageLogs.length > 0) {
          console.info(`Migrating ${oldRuleBasedUsageLogs.length} rule-based usage logs...`);
          await db.ruleBasedUsageLogs.bulkAdd(oldRuleBasedUsageLogs);
        }
      }

      console.info('[MigrationService] All data moved to Dexie.js.');
    });

    console.info('[MigrationService] Migration transaction successful.');
    // Optionally, delete the old database after successful migration
    if (oldDB) {
      oldDB.close();
      await indexedDB.deleteDatabase(OLD_DB_NAME);
      console.info(`[MigrationService] Old database '${OLD_DB_NAME}' deleted.`);
    }

  } catch (error: any) {
    console.error('[MigrationService] Migration failed:', error);
    // If migration fails, attempt to rollback by deleting the new Dexie DB
    await rollbackMigration();
    throw error; // Re-throw to propagate the error
  } finally {
    if (oldDB) oldDB.close();
    console.groupEnd();
  }
}

// Rollback strategy: delete the new Dexie.js database
export async function rollbackMigration(): Promise<void> {
  console.warn('[MigrationService] Rolling back Dexie.js database...');
  await db.delete(); // This deletes the entire Dexie database
  console.info('[MigrationService] Dexie.js database cleared (rollback complete).');
}

// Helper to check if IndexedDBs exist
class IndexedDB {
  static databases(): Promise<IDBDatabaseInfo[]> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.getDatabaseNames();
      request.onsuccess = (event: any) => {
        resolve(event.target.result);
      };
      request.onerror = (event: any) => {
        reject(event.target.error);
      };
    });
  }
}
