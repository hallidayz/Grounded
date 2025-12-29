/**
 * Migration Service
 * Handles complete migration flow from legacy IndexedDB to encrypted SQLite
 */

import { openDB, IDBPDatabase } from 'idb';
import { MigrationValidator, ValidationResult } from './migrationValidator';
import { createLegacyBackup } from './legacyDetection';

// Forward declaration for EncryptedPWA (will be defined in encryptedPWA.ts)
export interface EncryptedPWA {
  query(sql: string, params?: any[]): Promise<any[]>;
  save(): Promise<void>;
}

export interface MigrationProgress {
  step: string;
  progress: number;
  status: 'pending' | 'running' | 'completed' | 'error';
  message: string;
}

export class MigrationService {
  private onProgress?: (progress: MigrationProgress) => void;
  
  constructor(onProgress?: (progress: MigrationProgress) => void) {
    this.onProgress = onProgress;
  }
  
  /**
   * Complete migration flow with validation at each step
   */
  async migrateToEncrypted(password: string, userId: string): Promise<{
    success: boolean;
    errors: string[];
    validation: ValidationResult;
  }> {
    const errors: string[] = [];
    
    try {
      // STEP 1: Pre-migration validation
      this.updateProgress('Validating legacy database...', 5, 'running');
      const preValidation = await MigrationValidator.validateLegacyDatabase();
      
      if (!preValidation.isValid) {
        errors.push(...preValidation.errors);
        return { success: false, errors, validation: preValidation };
      }
      
      // STEP 2: Create backup
      this.updateProgress('Creating backup...', 10, 'running');
      await createLegacyBackup();
      
      // STEP 3: Initialize encrypted database
      this.updateProgress('Initializing encrypted database...', 15, 'running');
      // Import EncryptedPWA dynamically to avoid circular dependencies
      const { EncryptedPWA } = await import('./encryptedPWA');
      const encryptedDb = await EncryptedPWA.init(password, parseInt(userId));
      
      // STEP 4: Migrate users to auth store (separate authentication database)
      // This must happen FIRST so authentication can work before database unlock
      this.updateProgress('Migrating users to authentication store...', 20, 'running');
      const authStoreMigration = await this.migrateUsersToAuthStore();
      if (!authStoreMigration.success) {
        errors.push(...authStoreMigration.errors);
      }
      
      // STEP 5: Migrate users to encrypted database (for backward compatibility)
      // Note: Authentication now uses separate authStore, but we still store user data
      // in encrypted database for backward compatibility and user metadata
      this.updateProgress('Migrating users to encrypted database...', 25, 'running');
      const userMigration = await this.migrateUsers(encryptedDb);
      if (!userMigration.success) {
        errors.push(...userMigration.errors);
      }
      
      // STEP 6: Migrate app data
      this.updateProgress('Migrating app data...', 40, 'running');
      const appDataMigration = await this.migrateAppData(encryptedDb);
      if (!appDataMigration.success) {
        errors.push(...appDataMigration.errors);
      }
      
      // STEP 7: Migrate feeling logs
      this.updateProgress('Migrating feeling logs...', 60, 'running');
      const logsMigration = await this.migrateFeelingLogs(encryptedDb);
      if (!logsMigration.success) {
        errors.push(...logsMigration.errors);
      }
      
      // STEP 8: Migrate goals (from appData)
      this.updateProgress('Migrating goals...', 80, 'running');
      const goalsMigration = await this.migrateGoals(encryptedDb);
      if (!goalsMigration.success) {
        errors.push(...goalsMigration.errors);
      }
      
      // STEP 9: Save encrypted database
      this.updateProgress('Saving encrypted database...', 90, 'running');
      await encryptedDb.save();
      
      // STEP 10: Post-migration validation
      this.updateProgress('Validating migration...', 95, 'running');
      const postValidation = await MigrationValidator.validateEncryptedDatabase(encryptedDb);
      
      // STEP 11: Compare record counts
      const comparison = MigrationValidator.compareRecordCounts(
        preValidation.recordCounts.legacy,
        postValidation.recordCounts.encrypted
      );
      
      if (!comparison.isValid) {
        errors.push(...comparison.errors);
      }
      
      // STEP 12: Verify data integrity
      const legacyDb = await openDB('groundedDB', 4);
      const integrityCheck = await MigrationValidator.verifyDataIntegrity(legacyDb, encryptedDb);
      await legacyDb.close();
      
      if (!integrityCheck.isValid) {
        errors.push(...integrityCheck.errors);
      }
      
      // STEP 13: Final validation
      this.updateProgress('Finalizing migration...', 100, 'completed');
      
      const finalValidation: ValidationResult = {
        isValid: errors.length === 0,
        errors,
        warnings: [
          ...preValidation.warnings,
          ...postValidation.warnings,
          ...comparison.warnings,
          ...integrityCheck.warnings
        ],
        recordCounts: {
          legacy: preValidation.recordCounts.legacy,
          encrypted: postValidation.recordCounts.encrypted
        }
      };
      
      return {
        success: errors.length === 0,
        errors,
        validation: finalValidation
      };
      
    } catch (error) {
      this.updateProgress('Migration failed', 0, 'error');
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        validation: {
          isValid: false,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
          warnings: [],
          recordCounts: { legacy: {}, encrypted: {} }
        }
      };
    }
  }
  
  /**
   * Migrate users to auth store (separate authentication database)
   * This must happen FIRST so authentication can work before database unlock
   */
  private async migrateUsersToAuthStore(): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];
    try {
      // Import authStore dynamically to avoid circular dependencies
      const { authStore } = await import('./authStore');
      
      // Initialize auth store
      await authStore.init();
      
      const legacyDb = await openDB('groundedDB', 4);
      
      if (legacyDb.objectStoreNames.contains('users')) {
        const users = await legacyDb.getAll('users');
        
        for (const user of users) {
          try {
            // Check if user already exists in auth store (skip if exists)
            const existingUser = await authStore.getUserByUsername(user.username);
            if (existingUser) {
              console.log(`User ${user.username} already exists in auth store, skipping...`);
              continue;
            }
            
            // Create user in auth store
            await authStore.createUser({
              username: user.username,
              passwordHash: user.passwordHash,
              email: user.email || '',
              therapistEmails: user.therapistEmails || [],
              termsAccepted: user.termsAccepted || false,
              termsAcceptedDate: user.termsAcceptedDate || undefined,
            });
          } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            // If user already exists (ConstraintError), that's okay - skip it
            if (errorMsg.includes('ConstraintError') || errorMsg.includes('already exists')) {
              console.log(`User ${user.username} already exists in auth store, skipping...`);
              continue;
            }
            errors.push(`Failed to migrate user ${user.username} to auth store: ${errorMsg}`);
          }
        }
        
        await legacyDb.close();
      }
      
      return { success: errors.length === 0, errors };
    } catch (error) {
      return { success: false, errors: [error instanceof Error ? error.message : 'Unknown error'] };
    }
  }
  
  /**
   * Migrate users to encrypted database (for backward compatibility)
   * Note: Authentication now uses separate authStore, but we still store user data
   * in encrypted database for backward compatibility and user metadata
   */
  private async migrateUsers(encryptedDb: EncryptedPWA): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];
    try {
      const legacyDb = await openDB('groundedDB', 4);
      
      if (legacyDb.objectStoreNames.contains('users')) {
        const users = await legacyDb.getAll('users');
        
        for (const user of users) {
          try {
            await encryptedDb.query(
              `INSERT INTO users_encrypted (id, username, password_hash, email, therapist_emails, terms_accepted, terms_accepted_date, created_at, last_login)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                user.id,
                user.username,
                user.passwordHash,
                user.email || null,
                JSON.stringify(user.therapistEmails || []),
                user.termsAccepted ? 1 : 0,
                user.termsAcceptedDate || null,
                user.createdAt,
                user.lastLogin || null
              ]
            );
          } catch (err) {
            errors.push(`Failed to migrate user ${user.id}: ${err instanceof Error ? err.message : String(err)}`);
          }
        }
        
        await legacyDb.close();
      }
      
      return { success: errors.length === 0, errors };
    } catch (error) {
      return { success: false, errors: [error instanceof Error ? error.message : 'Unknown error'] };
    }
  }
  
  private async migrateAppData(encryptedDb: EncryptedPWA): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];
    try {
      const legacyDb = await openDB('groundedDB', 4);
      
      if (legacyDb.objectStoreNames.contains('appData')) {
        const appData = await legacyDb.getAll('appData');
        
        for (const data of appData) {
          try {
            await encryptedDb.query(
              `INSERT INTO app_data_encrypted (user_id, settings, logs, goals, "values", lcsw_config, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [
                data.userId,
                JSON.stringify(data.data.settings || {}),
                JSON.stringify(data.data.logs || []),
                JSON.stringify(data.data.goals || []),
                JSON.stringify(data.data.values || []),
                JSON.stringify(data.data.lcswConfig || {}),
                new Date().toISOString()
              ]
            );
          } catch (err) {
            errors.push(`Failed to migrate app data for user ${data.userId}: ${err instanceof Error ? err.message : String(err)}`);
          }
        }
        
        await legacyDb.close();
      }
      
      return { success: errors.length === 0, errors };
    } catch (error) {
      return { success: false, errors: [error instanceof Error ? error.message : 'Unknown error'] };
    }
  }
  
  private async migrateFeelingLogs(encryptedDb: EncryptedPWA): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];
    try {
      const legacyDb = await openDB('groundedDB', 4);
      
      if (legacyDb.objectStoreNames.contains('feelingLogs')) {
        const logs = await legacyDb.getAll('feelingLogs');
        
        for (const log of logs) {
          try {
            await encryptedDb.query(
              `INSERT INTO feeling_logs_encrypted (id, user_id, timestamp, emotional_state, selected_feeling, reflection_text, ai_analysis, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                log.id,
                log.userId || null,
                log.timestamp,
                log.emotionalState || null,
                log.selectedFeeling || null,
                log.reflectionText || null,
                JSON.stringify(log.aiAnalysis || {}),
                log.createdAt || new Date().toISOString()
              ]
            );
          } catch (err) {
            errors.push(`Failed to migrate feeling log ${log.id}: ${err instanceof Error ? err.message : String(err)}`);
          }
        }
        
        await legacyDb.close();
      }
      
      return { success: errors.length === 0, errors };
    } catch (error) {
      return { success: false, errors: [error instanceof Error ? error.message : 'Unknown error'] };
    }
  }
  
  private async migrateGoals(encryptedDb: EncryptedPWA): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];
    try {
      const legacyDb = await openDB('groundedDB', 4);
      
      // Goals are stored in appData, so we need to extract them
      if (legacyDb.objectStoreNames.contains('appData')) {
        const appData = await legacyDb.getAll('appData');
        
        for (const data of appData) {
          const goals = data.data?.goals || [];
          const userId = data.userId;
          
          for (const goal of goals) {
            try {
              // Extract goal updates if they exist
              const updates = goal.updates || [];
              
              await encryptedDb.query(
                `INSERT INTO goals_encrypted (id, user_id, value_id, text, frequency, completed, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  goal.id,
                  userId,
                  goal.valueId,
                  goal.text,
                  goal.frequency || null,
                  goal.completed ? 1 : 0,
                  goal.createdAt,
                  goal.updatedAt || null
                ]
              );
              
              // Migrate goal updates
              for (const update of updates) {
                try {
                  await encryptedDb.query(
                    `INSERT INTO goal_updates_encrypted (id, goal_id, timestamp, note, mood, created_at)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                      update.id,
                      goal.id,
                      update.timestamp,
                      update.note || null,
                      update.mood || null,
                      update.createdAt || new Date().toISOString()
                    ]
                  );
                } catch (err) {
                  errors.push(`Failed to migrate goal update ${update.id}: ${err instanceof Error ? err.message : String(err)}`);
                }
              }
            } catch (err) {
              errors.push(`Failed to migrate goal ${goal.id}: ${err instanceof Error ? err.message : String(err)}`);
            }
          }
        }
        
        await legacyDb.close();
      }
      
      return { success: errors.length === 0, errors };
    } catch (error) {
      return { success: false, errors: [error instanceof Error ? error.message : 'Unknown error'] };
    }
  }
  
  private updateProgress(message: string, progress: number, status: MigrationProgress['status']) {
    if (this.onProgress) {
      this.onProgress({
        step: message,
        progress,
        status,
        message
      });
    }
  }
}

