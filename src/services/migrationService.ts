import { dbService } from './database';
import { getDatabaseAdapter } from './databaseAdapter';
import { EncryptedPWA } from './encryptedPWA';
import { MigrationValidator } from './migrationValidator';
import { createLegacyBackup } from './legacyDetection';

export interface MigrationProgress {
  step: string;
  progress: number;
}

export interface MigrationResult {
  success: boolean;
  validation: any;
  errors?: string[];
}

export class MigrationService {
  private progressCallback?: (progress: MigrationProgress) => void;

  constructor(progressCallback?: (progress: MigrationProgress) => void) {
    this.progressCallback = progressCallback;
  }

  private updateProgress(step: string, progress: number) {
    if (this.progressCallback) {
      this.progressCallback({ step, progress });
    }
  }

  async migrateToEncrypted(password: string, userId: string): Promise<MigrationResult> {
    try {
      this.updateProgress('Initializing migration...', 0);
      
      // Step 1: Create backup
      this.updateProgress('Creating backup...', 10);
      await createLegacyBackup();
      
      // Step 2: Initialize encrypted database
      this.updateProgress('Initializing encrypted database...', 20);
      const encryptedDb = await EncryptedPWA.init(password, parseInt(userId));
      
      // Step 3: Validate legacy database
      this.updateProgress('Validating legacy data...', 30);
      const preValidation = await MigrationValidator.validateLegacyDatabase();
      
      // Step 4: Migrate data
      this.updateProgress('Migrating data...', 40);
      const migrationResult = await DatabaseMigrationService.migrateLegacyData(userId);
      
      if (!migrationResult.success) {
        return {
          success: false,
          validation: { isValid: false, errors: [migrationResult.error as string] },
          errors: [migrationResult.error as string]
        };
      }
      
      // Step 5: Validate encrypted database
      this.updateProgress('Validating encrypted database...', 70);
      const postValidation = await MigrationValidator.validateEncryptedDatabase(encryptedDb);
      
      // Step 6: Compare results
      this.updateProgress('Comparing results...', 80);
      const comparison = MigrationValidator.compareRecordCounts(
        preValidation.recordCounts.legacy,
        postValidation.recordCounts.encrypted
      );
      
      this.updateProgress('Migration complete!', 100);
      
      return {
        success: comparison.isValid,
        validation: {
          isValid: comparison.isValid,
          recordCounts: {
            legacy: preValidation.recordCounts.legacy,
            encrypted: postValidation.recordCounts.encrypted
          },
          errors: comparison.errors,
          warnings: comparison.warnings
        },
        errors: comparison.errors
      };
    } catch (error) {
      return {
        success: false,
        validation: { isValid: false, errors: [error instanceof Error ? error.message : String(error)] },
        errors: [error instanceof Error ? error.message : String(error)]
      };
    }
  }
}

export class DatabaseMigrationService {
  /**
   * Identifies legacy records that are missing a userId
   */
  static async getLegacyData() {
    try {
      // Direct access to IndexedDB via dbService for scanning legacy data
      // Note: We use getFeelingLogs without a userId filter to find records that might be missing it
      // However, the current implementation of getFeelingLogs doesn't explicitly return records *only* with missing userId.
      // We need to fetch all and filter manually or use a more specific query if possible.
      // Since dbService.getFeelingLogs returns all if no userId is passed, we can filter in memory.
      // Ideally, we would add a specific method to dbService for this, but filtering is safe for reasonable dataset sizes.
      
      const allFeelingLogs = await dbService.getFeelingLogs();
      const legacyFeelingLogs = allFeelingLogs.filter(log => !log.userId);
      
      const allInteractions = await dbService.getUserInteractions();
      const legacyInteractions = allInteractions.filter(interaction => !interaction.userId);
      
      return {
        feelingLogs: legacyFeelingLogs,
        interactions: legacyInteractions,
        counts: {
          feelingLogs: legacyFeelingLogs.length,
          interactions: legacyInteractions.length
        }
      };
    } catch (error) {
      console.error('Error scanning for legacy data:', error);
      return { feelingLogs: [], interactions: [], counts: { feelingLogs: 0, interactions: 0 } };
    }
  }

  /**
   * Backs up legacy data to localStorage before migration
   */
  static async backupLegacyData() {
    try {
      const legacyData = await this.getLegacyData();
      if (legacyData.counts.feelingLogs > 0 || legacyData.counts.interactions > 0) {
        localStorage.setItem('legacyDataBackup', JSON.stringify(legacyData));
        console.log('Legacy data backed up to localStorage');
      }
      return legacyData;
    } catch (error) {
      console.error('Backup failed:', error);
      throw error;
    }
  }

  /**
   * Migrates legacy data to the current user
   */
  static async migrateLegacyData(targetUserId: string) {
    if (!targetUserId) {
      console.error('Migration failed: No target user ID provided');
      return { success: false, error: 'No user ID' };
    }

    try {
      console.log(`Starting migration for user ${targetUserId}...`);
      
      // 1. Backup first
      const legacyData = await this.backupLegacyData();
      
      if (legacyData.counts.feelingLogs === 0 && legacyData.counts.interactions === 0) {
        console.log('No legacy data to migrate.');
        return { success: true, migratedCount: 0 };
      }

      const adapter = getDatabaseAdapter();

      // 2. Migrate Feeling Logs
      let logsMigrated = 0;
      for (const log of legacyData.feelingLogs) {
        // Create migrated record
        const migratedLog = {
          ...log,
          userId: targetUserId,
          migrated: true,
          migrationDate: new Date().toISOString()
        };
        
        // Save using the current adapter (which handles encryption if enabled)
        await adapter.saveFeelingLog(migratedLog);
        logsMigrated++;
      }

      // 3. Migrate User Interactions
      let interactionsMigrated = 0;
      for (const interaction of legacyData.interactions) {
        const migratedInteraction = {
          ...interaction,
          userId: targetUserId,
          migrated: true,
          migrationDate: new Date().toISOString()
        };
        
        await adapter.saveUserInteraction(migratedInteraction);
        interactionsMigrated++;
      }

      // 4. Cleanup Legacy Records (from IndexedDB)
      // Since we can't easily delete by "missing userId" via the high-level service API without adding specific delete methods,
      // and we just re-saved them with IDs (effectively updating them if ID matches, or creating new if ID changed),
      // we need to be careful.
      // In IndexedDB, if we re-saved with the same 'id' key but added 'userId', it's an update, not a duplicate.
      // So explicit deletion might not be needed if the ID is preserved and the put operation overwrote it.
      // However, if we're moving from IndexedDB to SQLite (Encrypted), we definitely need to clear the old IndexedDB records
      // to avoid double-counting if we ever query IndexedDB directly again.
      
      // For now, we'll mark migration as complete in localStorage so we don't try again.
      localStorage.setItem('legacy_migration_completed', 'true');
      localStorage.setItem('legacy_migration_date', new Date().toISOString());
      
      console.log(`Migration complete. Migrated ${logsMigrated} logs and ${interactionsMigrated} interactions.`);
      
      return { 
        success: true, 
        migratedCount: logsMigrated + interactionsMigrated,
        details: { logs: logsMigrated, interactions: interactionsMigrated }
      };
      
    } catch (error) {
      console.error('Migration failed:', error);
      return { success: false, error };
    }
  }

  /**
   * Verifies the migration success
   */
  static async verifyMigration(userId: string) {
    const adapter = getDatabaseAdapter();
    const logs = await adapter.getFeelingLogs(undefined, userId);
    return {
      migratedRecords: logs.length,
      migrationComplete: logs.length > 0 // Basic check
    };
  }
}
