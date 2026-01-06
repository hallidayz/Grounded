/**
 * localStorage Migration Service
 * 
 * Detects and migrates legacy localStorage data to IndexedDB.
 * Since no legacy keys (groundedAppData, groundedUser, groundedSession) were found
 * in the current codebase, this service focuses on detection and validation.
 * 
 * If legacy keys are found in the future, they will be migrated to IndexedDB.
 */

import { getDatabaseAdapter } from './databaseAdapter';
import { dbService } from './database';

// Legacy localStorage keys to check for
const LEGACY_KEYS = {
  APP_DATA: 'groundedAppData',
  USER: 'groundedUser',
  SESSION: 'groundedSession',
} as const;

interface LegacyAppData {
  values?: string[];
  goals?: any[];
  logs?: any[];
  settings?: any;
}

interface LegacyUser {
  id?: string;
  username?: string;
  email?: string;
  passwordHash?: string;
  termsAccepted?: boolean;
}

interface LegacySession {
  userId?: string;
  username?: string;
  timestamp?: string;
}

interface MigrationResult {
  success: boolean;
  migrated: boolean;
  keysFound: string[];
  keysMigrated: string[];
  errors: string[];
}

/**
 * Detect if any legacy localStorage keys exist
 */
export function detectLegacyLocalStorageKeys(): string[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [];
  }

  const foundKeys: string[] = [];
  
  for (const key of Object.values(LEGACY_KEYS)) {
    if (localStorage.getItem(key)) {
      foundKeys.push(key);
    }
  }

  return foundKeys;
}

/**
 * Parse legacy localStorage data
 */
function parseLegacyData(key: string): any {
  try {
    const data = localStorage.getItem(key);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error(`[localStorageMigration] Failed to parse ${key}:`, error);
    return null;
  }
}

/**
 * Migrate legacy appData to IndexedDB
 * Includes safety validations: duplicate prevention, error handling, data validation
 */
async function migrateAppData(appData: LegacyAppData, userId: string): Promise<void> {
  // Safety validation: Ensure userId is valid
  if (!userId || typeof userId !== 'string') {
    throw new Error('[localStorageMigration] Invalid userId provided for migration');
  }
  
  // Duplicate prevention: Check if migration already completed
  const migrationKey = `localStorage_migration_${userId}`;
  const migrationCompleted = localStorage.getItem(migrationKey) === 'true';
  
  if (migrationCompleted) {
    console.log(`[localStorageMigration] Migration already completed for user ${userId}, skipping`);
    return;
  }
  
  const adapter = getDatabaseAdapter();
  const errors: string[] = [];
  const migratedItems = {
    values: 0,
    goals: 0,
    logs: 0,
  };
  
  // Migrate values with duplicate prevention
  if (appData.values && Array.isArray(appData.values) && appData.values.length > 0) {
    try {
      // Safety validation: Ensure values array is valid
      const validValues = appData.values.filter(v => v && typeof v === 'string');
      if (validValues.length !== appData.values.length) {
        console.warn('[localStorageMigration] Some invalid values filtered out');
      }
      
      if (validValues.length > 0) {
        await (dbService as any).setValuesActive(userId, validValues);
        migratedItems.values = validValues.length;
      }
    } catch (error) {
      const errorMsg = `Failed to migrate values: ${error instanceof Error ? error.message : String(error)}`;
      console.error('[localStorageMigration]', errorMsg);
      errors.push(errorMsg);
      // Continue with other migrations even if values fail
    }
  }

  // Migrate goals with duplicate prevention and error handling
  if (appData.goals && Array.isArray(appData.goals) && appData.goals.length > 0) {
    const processedGoalIds = new Set<string>(); // Track processed goals
    
    for (const goal of appData.goals) {
      // Safety validation: Ensure goal has required fields
      if (!goal || !goal.id || typeof goal.id !== 'string') {
        console.warn('[localStorageMigration] Skipping invalid goal:', goal);
        continue;
      }
      
      // Duplicate prevention: Skip if already processed
      if (processedGoalIds.has(goal.id)) {
        console.warn(`[localStorageMigration] Goal ${goal.id} already processed, skipping duplicate`);
        continue;
      }
      
      try {
        await (dbService as any).saveGoal(goal);
        processedGoalIds.add(goal.id);
        migratedItems.goals++;
      } catch (error) {
        const errorMsg = `Failed to migrate goal ${goal.id}: ${error instanceof Error ? error.message : String(error)}`;
        console.error('[localStorageMigration]', errorMsg);
        errors.push(errorMsg);
        // Continue with other goals even if one fails
      }
    }
  }
  
  // Migrate logs (feelingLogs) with duplicate prevention and error handling
  if (appData.logs && Array.isArray(appData.logs) && appData.logs.length > 0) {
    const processedLogIds = new Set<string>(); // Track processed logs
    
    for (const log of appData.logs) {
      // Safety validation: Ensure log has required fields
      if (!log || !log.id || typeof log.id !== 'string') {
        console.warn('[localStorageMigration] Skipping invalid log:', log);
        continue;
      }
      
      // Duplicate prevention: Skip if already processed
      if (processedLogIds.has(log.id)) {
        console.warn(`[localStorageMigration] Log ${log.id} already processed, skipping duplicate`);
        continue;
      }
      
      try {
        await adapter.saveFeelingLog({
          id: log.id,
          timestamp: log.timestamp || new Date().toISOString(),
          userId: userId,
          emotionalState: log.emotionalState || log.emotion || '',
          selectedFeeling: log.selectedFeeling || log.subEmotion || null,
          aiResponse: log.aiResponse || log.assessment || '',
          isAIResponse: log.isAIResponse !== undefined ? log.isAIResponse : true,
          lowStateCount: log.lowStateCount || 0,
        });
        processedLogIds.add(log.id);
        migratedItems.logs++;
      } catch (error) {
        const errorMsg = `Failed to migrate log ${log.id}: ${error instanceof Error ? error.message : String(error)}`;
        console.error('[localStorageMigration]', errorMsg);
        errors.push(errorMsg);
        // Continue with other logs even if one fails
      }
    }
  }
  
  // Mark migration as completed only if at least some data was migrated
  if (migratedItems.values > 0 || migratedItems.goals > 0 || migratedItems.logs > 0) {
    localStorage.setItem(migrationKey, 'true');
    console.log('[localStorageMigration] Migration completed:', migratedItems);
    if (errors.length > 0) {
      console.warn('[localStorageMigration] Migration completed with errors:', errors);
    }
  } else if (errors.length > 0) {
    throw new Error(`Migration failed: ${errors.join('; ')}`);
  }

  // Migrate settings
  if (appData.settings) {
    const existingAppData = await adapter.getAppData(userId);
    await adapter.saveAppData(userId, {
      ...existingAppData,
      settings: { ...existingAppData?.settings, ...appData.settings },
      values: appData.values || existingAppData?.values || [],
      goals: appData.goals || existingAppData?.goals || [],
      logs: appData.logs || existingAppData?.logs || [],
    });
  }
}

/**
 * Migrate legacy user data to IndexedDB
 */
async function migrateUserData(userData: LegacyUser): Promise<string | null> {
  if (!userData.id && !userData.username) {
    return null;
  }

  const adapter = getDatabaseAdapter();
  
  // Check if user already exists
  let existingUser = null;
  if (userData.username) {
    existingUser = await adapter.getUserByUsername(userData.username);
  }
  if (!existingUser && userData.id) {
    existingUser = await adapter.getUserById(userData.id);
  }

  if (existingUser) {
    // Update existing user if needed
    if (userData.email && !existingUser.email) {
      await adapter.updateUser(existingUser.id, { email: userData.email });
    }
    return existingUser.id;
  }

  // Create new user
  const userId = await adapter.createUser({
    username: userData.username || `user_${Date.now()}`,
    passwordHash: userData.passwordHash || '',
    email: userData.email || '',
    termsAccepted: userData.termsAccepted || false,
  });

  return userId;
}

/**
 * Migrate legacy session data
 * Note: Session data is typically temporary, so we mainly validate it exists
 */
async function migrateSessionData(sessionData: LegacySession): Promise<void> {
  // Session data is typically stored in sessionStorage, not localStorage
  // If found in localStorage, it's likely stale and can be ignored
  // But we'll log it for debugging
  if (sessionData.userId) {
    console.log('[localStorageMigration] Found legacy session data:', {
      userId: sessionData.userId,
      username: sessionData.username,
    });
    // Session data doesn't need to be migrated to IndexedDB
    // It's temporary and should be in sessionStorage
  }
}

/**
 * Update metadata with migration status
 * Uses raw IndexedDB API since metadata methods are private in DatabaseService
 */
async function updateMetadataWithMigrationStatus(): Promise<void> {
  try {
    // Use raw IndexedDB API for metadata update (non-critical operation)
    return new Promise((resolve) => {
      const request = indexedDB.open('groundedDB', 8);
      request.onsuccess = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('metadata')) {
          console.warn('[localStorageMigration] Metadata store does not exist');
          resolve();
          return;
        }

        const transaction = db.transaction(['metadata'], 'readwrite');
        const store = transaction.objectStore('metadata');
        
        // Get existing metadata
        const getRequest = store.get('app_metadata');
        getRequest.onsuccess = () => {
          const existing = getRequest.result || {};
          
          // Detect platform
          let platform = 'pwa';
          if (typeof window !== 'undefined') {
            if ('__TAURI__' in window) {
              platform = 'desktop';
            } else if ((window as any).Capacitor) {
              platform = (window as any).Capacitor.getPlatform() || 'mobile';
            } else {
              const ua = navigator.userAgent || '';
              if (/android/i.test(ua)) platform = 'android';
              else if (/iPad|iPhone|iPod/.test(ua)) platform = 'ios';
            }
          }
          
          const version = (import.meta as any).env?.VITE_APP_VERSION || '1.13.5';
          
          const updatedMetadata = {
            id: 'app_metadata',
            appName: 'Grounded',
            appId: 'com.acminds.grounded',
            platform,
            version,
            createdAt: existing.createdAt || new Date().toISOString(),
            lastValidated: new Date().toISOString(),
            localStorageMigrated: true,
            migrationDate: new Date().toISOString(),
          };

          const putRequest = store.put(updatedMetadata);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => {
            console.warn('[localStorageMigration] Failed to update metadata (non-critical)');
            resolve();
          };
        };
        getRequest.onerror = () => {
          console.warn('[localStorageMigration] Failed to get metadata (non-critical)');
          resolve();
        };
      };
      request.onerror = () => {
        console.warn('[localStorageMigration] Failed to open database for metadata update (non-critical)');
        resolve();
      };
    });
  } catch (error) {
    console.warn('[localStorageMigration] Failed to update metadata:', error);
    // Non-critical, don't throw
  }
}

/**
 * Main migration function
 * Detects legacy localStorage keys and migrates them to IndexedDB
 */
export async function migrateLocalStorageToIndexedDB(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: true,
    migrated: false,
    keysFound: [],
    keysMigrated: [],
    errors: [],
  };

  try {
    // Detect legacy keys
    const foundKeys = detectLegacyLocalStorageKeys();
    result.keysFound = foundKeys;

    if (foundKeys.length === 0) {
      console.log('[localStorageMigration] No legacy localStorage keys found - migration not needed');
      // Still update metadata to mark migration as checked
      await updateMetadataWithMigrationStatus();
      return result;
    }

    console.log('[localStorageMigration] Found legacy keys:', foundKeys);

    // Ensure database is initialized
    const adapter = getDatabaseAdapter();
    await adapter.init();

    // Migrate appData
    if (foundKeys.includes(LEGACY_KEYS.APP_DATA)) {
      try {
        const appData = parseLegacyData(LEGACY_KEYS.APP_DATA) as LegacyAppData;
        if (appData) {
          // Get or create user
          let userId: string | null = null;
          const userKey = localStorage.getItem(LEGACY_KEYS.USER);
          if (userKey) {
            const userData = parseLegacyData(LEGACY_KEYS.USER) as LegacyUser;
            if (userData) {
              userId = await migrateUserData(userData);
            }
          }

          // If no user found, try to get current user from session
          if (!userId) {
            const sessionKey = localStorage.getItem(LEGACY_KEYS.SESSION);
            if (sessionKey) {
              const sessionData = parseLegacyData(LEGACY_KEYS.SESSION) as LegacySession;
              if (sessionData?.userId) {
                userId = sessionData.userId;
              }
            }
          }

          // If still no userId, we can't migrate appData (it's user-specific)
          if (userId) {
            await migrateAppData(appData, userId);
            result.keysMigrated.push(LEGACY_KEYS.APP_DATA);
          } else {
            result.errors.push('No userId found - cannot migrate appData');
          }
        }
      } catch (error) {
        const errorMsg = `Failed to migrate appData: ${error}`;
        console.error('[localStorageMigration]', errorMsg);
        result.errors.push(errorMsg);
        result.success = false;
      }
    }

    // Migrate user data
    if (foundKeys.includes(LEGACY_KEYS.USER)) {
      try {
        const userData = parseLegacyData(LEGACY_KEYS.USER) as LegacyUser;
        if (userData) {
          await migrateUserData(userData);
          result.keysMigrated.push(LEGACY_KEYS.USER);
        }
      } catch (error) {
        const errorMsg = `Failed to migrate user data: ${error}`;
        console.error('[localStorageMigration]', errorMsg);
        result.errors.push(errorMsg);
        result.success = false;
      }
    }

    // Migrate session data (validation only)
    if (foundKeys.includes(LEGACY_KEYS.SESSION)) {
      try {
        const sessionData = parseLegacyData(LEGACY_KEYS.SESSION) as LegacySession;
        if (sessionData) {
          await migrateSessionData(sessionData);
          result.keysMigrated.push(LEGACY_KEYS.SESSION);
        }
      } catch (error) {
        const errorMsg = `Failed to migrate session data: ${error}`;
        console.error('[localStorageMigration]', errorMsg);
        result.errors.push(errorMsg);
        // Session migration failure is non-critical
      }
    }

    // Remove migrated keys only if migration was successful
    if (result.success && result.keysMigrated.length > 0) {
      for (const key of result.keysMigrated) {
        try {
          localStorage.removeItem(key);
          console.log(`[localStorageMigration] Removed migrated key: ${key}`);
        } catch (error) {
          console.warn(`[localStorageMigration] Failed to remove key ${key}:`, error);
        }
      }
      result.migrated = true;
    }

    // Update metadata
    await updateMetadataWithMigrationStatus();

    console.log('[localStorageMigration] Migration completed:', result);
    return result;

  } catch (error) {
    const errorMsg = `Migration failed: ${error}`;
    console.error('[localStorageMigration]', errorMsg);
    result.success = false;
    result.errors.push(errorMsg);
    return result;
  }
}

/**
 * Check if migration has already been completed
 */
export function isLocalStorageMigrationComplete(): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return true; // No localStorage, consider migration complete
  }

  // Check if migration flag exists in metadata (would be set after migration)
  // For now, check if legacy keys exist (if they don't, migration is effectively complete)
  const foundKeys = detectLegacyLocalStorageKeys();
  return foundKeys.length === 0;
}


