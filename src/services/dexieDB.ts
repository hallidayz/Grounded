/**
 * Dexie Database Class
 * 
 * Provides a high-performance IndexedDB wrapper using Dexie.js
 * Replaces raw IndexedDB API with type-safe, promise-based operations
 * 
 * Database: groundedDB
 * Version: 8
 */

import Dexie, { Table } from 'dexie';
import { Goal, FeelingLog, Assessment, CounselorReport, Session, UserInteraction, RuleBasedUsageLog, AppSettings, LogEntry, LCSWConfig } from '../types';

// Version constant for explicit version management
export const CURRENT_DB_VERSION = 8;

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
    super('groundedDB');
    
    // Version 8: Full schema with values and goals tables
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
    }).upgrade(async (trans) => {
      // TRANSACTION SEMANTICS:
      // Dexie upgrade transactions are atomic - either all changes commit or none do.
      // If any error is thrown, the entire upgrade is rolled back.
      // This prevents partial migrations that could corrupt data.
      // All awaited operations must target `trans.table(...)` to maintain atomicity.
      
      console.log(`[Dexie] Upgrading database to version ${CURRENT_DB_VERSION}`);
      
      // Migration from v7 → v8: Move values and goals from appData to dedicated tables
      // Note: We check for v7→v8 migration by checking if we're upgrading to v8
      // (Dexie doesn't expose old version cleanly in trans object)
      
      try {
        const appDataStore = trans.table('appData');
        const valuesStore = trans.table('values');
        const goalsStore = trans.table('goals');
        
        // Read migration flag BEFORE processing (read-only, safe in transaction)
        const migrationKey = 'dexie_migration_v7_to_v8';
        if (localStorage.getItem(migrationKey) === 'true') {
          console.log('[Dexie] Migration v7→v8 already completed, skipping');
          return; // Exit early to avoid duplicate migration
        }
        
        // Migrate values and goals from appData to dedicated tables
        const allAppData = await appDataStore.toArray();
        const migratedUserIds = new Set(); // Track users to prevent duplicate processing
        
          // Error/warning throttling for large datasets
          let warningCount = 0;
          const MAX_WARNINGS = 10; // Cap warnings to prevent console flooding
          
          for (const appData of allAppData) {
            // Safety validation: Ensure appData has required fields
            if (!appData || !appData.userId) {
              if (warningCount < MAX_WARNINGS) {
                console.warn('[Dexie] Skipping invalid appData entry:', appData);
                warningCount++;
              }
              continue;
            }
            
            // Duplicate prevention: Skip if already processed
            if (migratedUserIds.has(appData.userId)) {
              if (warningCount < MAX_WARNINGS) {
                console.warn(`[Dexie] User ${appData.userId} already processed, skipping duplicate`);
                warningCount++;
              }
              continue;
            }
          
          const userId = appData.userId;
          const now = new Date().toISOString();
          
          // Migrate values from appData to values table
          const valueIds: string[] = (appData.data as any)?.values ?? [];
          if (valueIds.length > 0 && Array.isArray(valueIds)) {
            // Get existing values for this user
            const existingValues = await valuesStore
              .where('userId').equals(userId)
              .toArray();
            
            // Prepare bulk updates for existing values (mark inactive)
            const updatePromises = existingValues
              .filter(v => v.id !== undefined)
              .map(v => valuesStore.update(v.id!, { 
                active: false, 
                updatedAt: now 
              }));
            
            // Prepare new value records (use bulkPut for performance)
            const newValueRecords = valueIds
              .filter((valueId, i) => {
                // Safety validation: Ensure valueId is valid
                if (!valueId || typeof valueId !== 'string') {
                  if (warningCount < MAX_WARNINGS) {
                    console.warn(`[Dexie] Invalid valueId at index ${i}, skipping`);
                    warningCount++;
                  }
                  return false;
                }
                return true;
              })
              .map((valueId, i) => {
                const existing = existingValues.find(v => v.valueId === valueId);
                if (existing && existing.id) {
                  // Will be updated to active via bulkPut
                  return {
                    id: existing.id,
                    userId,
                    valueId,
                    active: true,
                    priority: i,
                    createdAt: existing.createdAt || now,
                    updatedAt: now,
                  };
                } else {
                  // New entry (id will be auto-generated)
                  return {
                    userId,
                    valueId,
                    active: true,
                    priority: i,
                    createdAt: now,
                    updatedAt: now,
                  };
                }
              });
            
            // Execute updates and bulk insert/update
            await Promise.all(updatePromises);
            if (newValueRecords.length > 0) {
              await valuesStore.bulkPut(newValueRecords);
            }
          }
          
          // Migrate goals from appData to goals table
          const goalRecords: any[] = (appData.data as any)?.goals ?? [];
          if (goalRecords.length > 0 && Array.isArray(goalRecords)) {
            // Filter and prepare valid goals
            const validGoals = goalRecords
              .filter(g => {
                // Safety validation: Ensure goal has required fields
                if (!g || !g.id || typeof g.id !== 'string') {
                  if (warningCount < MAX_WARNINGS) {
                    console.warn('[Dexie] Skipping invalid goal:', g);
                    warningCount++;
                  }
                  return false;
                }
                return true;
              })
              .map(g => {
                // Add userId if missing
                return {
                  ...g,
                  userId: g.userId || userId,
                };
              })
              .filter(g => {
                // Safety validation: Ensure userId is present
                if (!g.userId) {
                  if (warningCount < MAX_WARNINGS) {
                    console.warn(`[Dexie] Goal ${g.id} missing userId, skipping`);
                    warningCount++;
                  }
                  return false;
                }
                return true;
              });
            
            // Check for duplicates before bulk add
            if (validGoals.length > 0) {
              const existingGoalIds = new Set(
                (await goalsStore.bulkGet(validGoals.map(g => g.id)))
                  .filter(Boolean)
                  .map((g: any) => g.id)
              );
              
              const newGoals = validGoals.filter(g => !existingGoalIds.has(g.id));
              
              if (newGoals.length > 0) {
                await goalsStore.bulkAdd(newGoals);
              }
            }
          }
          
          migratedUserIds.add(userId);
        }
        
        // Mark migration as completed (only if we reach here without errors)
        // Note: This is set AFTER successful migration within the transaction
        // If transaction fails, this won't be set, allowing retry
        localStorage.setItem(migrationKey, 'true');
        
        console.log('[Dexie] Migration from v7 to v8 completed successfully');
      } catch (error) {
        // CRITICAL: Throw error to rollback transaction
        // This ensures no partial migration commits
        // Don't set flag on error - allows retry on next open
        console.error('[Dexie] CRITICAL ERROR during v7→v8 migration:', error);
        console.error('[Dexie] Transaction will be rolled back - no partial migration will commit');
        console.error('[Dexie] Migration flag not set - will retry on next database open');
        throw error; // Re-throw to trigger transaction rollback
      }
    });
  }

  /**
   * Initialize database and clean up old databases
   * Should be called after construction to perform async cleanup
   */
  async initialize(): Promise<void> {
    // Clean up old database before opening
    await this.cleanupOldDatabase();
    // Open database (triggers schema creation/upgrade if needed)
    await this.open();
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

