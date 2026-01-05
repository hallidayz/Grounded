/**
 * Update Manager Service
 * 
 * Handles app version tracking, update detection, and migration logic.
 * Ensures user data is preserved during updates and database migrations are applied correctly.
 */

import { dbService } from './database';

const APP_VERSION_KEY = 'app_version';
const INSTALL_DATE_KEY = 'install_date';
const LAST_UPDATE_KEY = 'last_update';

// Get app version from package.json (injected at build time)
const CURRENT_APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.12.27';

interface UpdateInfo {
  isNewInstall: boolean;
  isUpdate: boolean;
  previousVersion: string | null;
  currentVersion: string;
  installDate: string | null;
  lastUpdateDate: string | null;
}

class UpdateManager {
  /**
   * Initialize update manager and detect install/update status
   */
  async initialize(): Promise<UpdateInfo> {
    const storedVersion = localStorage.getItem(APP_VERSION_KEY);
    const installDate = localStorage.getItem(INSTALL_DATE_KEY);
    const lastUpdate = localStorage.getItem(LAST_UPDATE_KEY);

    const isNewInstall = !storedVersion && !installDate;
    const isUpdate = storedVersion !== null && storedVersion !== CURRENT_APP_VERSION;

    // Store current version and dates
    if (isNewInstall) {
      // New installation
      localStorage.setItem(APP_VERSION_KEY, CURRENT_APP_VERSION);
      localStorage.setItem(INSTALL_DATE_KEY, new Date().toISOString());
      localStorage.setItem(LAST_UPDATE_KEY, new Date().toISOString());
      console.log(`✅ New installation detected: v${CURRENT_APP_VERSION}`);
    } else if (isUpdate) {
      // Update detected
      const previousVersion = storedVersion;
      localStorage.setItem(APP_VERSION_KEY, CURRENT_APP_VERSION);
      localStorage.setItem(LAST_UPDATE_KEY, new Date().toISOString());
      console.log(`🔄 Update detected: v${previousVersion} → v${CURRENT_APP_VERSION}`);
      
      // Run update migrations
      await this.runMigrations(previousVersion, CURRENT_APP_VERSION);
    } else {
      // Same version, no update needed
      console.log(`✅ App version unchanged: v${CURRENT_APP_VERSION}`);
    }

    return {
      isNewInstall,
      isUpdate,
      previousVersion: storedVersion,
      currentVersion: CURRENT_APP_VERSION,
      installDate,
      lastUpdateDate: localStorage.getItem(LAST_UPDATE_KEY),
    };
  }

  /**
   * Run migrations between versions
   */
  private async runMigrations(fromVersion: string, toVersion: string): Promise<void> {
    console.log(`🔄 Running migrations from v${fromVersion} to v${toVersion}`);

    try {
      // Version comparison helper
      const versionCompare = (v1: string, v2: string): number => {
        const parts1 = v1.split('.').map(Number);
        const parts2 = v2.split('.').map(Number);
        for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
          const p1 = parts1[i] || 0;
          const p2 = parts2[i] || 0;
          if (p1 < p2) return -1;
          if (p1 > p2) return 1;
        }
        return 0;
      };

      // Run migrations in order
      const migrations: Array<{ version: string; migrate: () => Promise<void> }> = [
        {
          version: '1.12.26',
          migrate: async () => {
            console.log('  → Migration 1.12.26: Ensuring feelingLogs store exists');
            // Database migration is handled by IndexedDB onupgradeneeded
            // This is for any app-level data migrations
          },
        },
        {
          version: '1.12.27',
          migrate: async () => {
            console.log('  → Migration 1.12.27: Adding userInteractions and sessions stores');
            // Database migration is handled by IndexedDB onupgradeneeded (dbVersion 3)
            // This ensures the stores are created for interaction and session tracking
            // Force database re-initialization to trigger onupgradeneeded
            try {
              await dbService.init();
            } catch (error) {
              console.warn('Database re-initialization warning:', error);
            }
          },
        },
        // Add more migrations here as needed
        // Example:
        // {
        //   version: '1.13.0',
        //   migrate: async () => {
        //     console.log('  → Migration 1.13.0: Migrating user settings format');
        //     // Migrate user settings if format changed
        //   },
        // },
      ];

      // Run applicable migrations
      for (const migration of migrations) {
        if (versionCompare(fromVersion, migration.version) < 0 && 
            versionCompare(toVersion, migration.version) >= 0) {
          await migration.migrate();
        }
      }

      console.log(`✅ Migrations completed successfully`);
    } catch (error) {
      console.error('❌ Migration error:', error);
      // Don't throw - allow app to continue even if migration fails
      // User data should still be accessible
    }
  }

  /**
   * Get current update info
   */
  getUpdateInfo(): UpdateInfo {
    const storedVersion = localStorage.getItem(APP_VERSION_KEY);
    const installDate = localStorage.getItem(INSTALL_DATE_KEY);
    const lastUpdate = localStorage.getItem(LAST_UPDATE_KEY);

    return {
      isNewInstall: !storedVersion && !installDate,
      isUpdate: storedVersion !== null && storedVersion !== CURRENT_APP_VERSION,
      previousVersion: storedVersion,
      currentVersion: CURRENT_APP_VERSION,
      installDate,
      lastUpdateDate: lastUpdate,
    };
  }

  /**
   * Get current app version
   */
  getCurrentVersion(): string {
    return CURRENT_APP_VERSION;
  }

  /**
   * Check if this is a new installation
   */
  isNewInstall(): boolean {
    const storedVersion = localStorage.getItem(APP_VERSION_KEY);
    const installDate = localStorage.getItem(INSTALL_DATE_KEY);
    return !storedVersion && !installDate;
  }

  /**
   * Check if this is an update
   */
  isUpdate(): boolean {
    const storedVersion = localStorage.getItem(APP_VERSION_KEY);
    return storedVersion !== null && storedVersion !== CURRENT_APP_VERSION;
  }
}

export const updateManager = new UpdateManager();

