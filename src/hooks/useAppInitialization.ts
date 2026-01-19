import { useState, useEffect, useRef } from 'react';
import { LogEntry, Goal, AppSettings, LCSWConfig } from '../types';
import { preloadModelsContinuously, initializeModels, setSelectedModel } from '../services/aiService';
import { getDatabaseAdapter } from '../services/databaseAdapter';
import { isLoggedIn, getCurrentUser } from '../services/authService';
import { detectLegacyData } from '../services/legacyDetection';
import { initializeDebugLogging } from '../services/debugLog';
import { setModelLoadingProgress, setProgressError } from '../services/progressTracker';
import { initializeShortcuts } from '../utils/createShortcut';
import { ensureServiceWorkerActive, listenForServiceWorkerUpdates } from '../utils/serviceWorker';
import { runDeploymentDiagnostics, logDeploymentDiagnostics } from '../utils/deploymentDiagnostics';
import { migrateLocalStorageToIndexedDB, isLocalStorageMigrationComplete } from '../services/localStorageMigration';
import { runDataPruning, scheduleWeeklyPruning } from '../services/dataPruningService';
import { isDataPruningEnabled } from '../constants/environment';
import { logger } from '../utils/logger';

// Module-level guard to prevent multiple initializations (persists across remounts)
const INIT_STARTED_KEY = 'app_init_started';
const INIT_STARTED_TIME_KEY = 'app_init_started_time';
const INIT_COMPLETE_KEY = 'app_init_complete';

// Debounce flag to prevent multiple "already in progress" logs
let initializationWarningLogged = false;
let lastWarningTime = 0;
const WARNING_DEBOUNCE_MS = 2000; // Only log warning once per 2 seconds

function isInitializationStarted(): boolean {
  if (typeof sessionStorage !== 'undefined') {
    const started = sessionStorage.getItem(INIT_STARTED_KEY);
    if (started === 'true') {
      const startTime = sessionStorage.getItem(INIT_STARTED_TIME_KEY);
      if (startTime) {
        const elapsed = Date.now() - parseInt(startTime, 10);
        if (elapsed > 30000) {
          logger.warn('[INIT] Initialization stuck for', elapsed, 'ms - resetting');
          sessionStorage.removeItem(INIT_STARTED_KEY);
          sessionStorage.removeItem(INIT_STARTED_TIME_KEY);
          initializationWarningLogged = false; // Reset warning flag
          return false;
        }
        return true;
      } else {
        logger.warn('[INIT] Initialization started flag exists but no timestamp - resetting');
        sessionStorage.removeItem(INIT_STARTED_KEY);
        initializationWarningLogged = false; // Reset warning flag
        return false;
      }
    }
  }
  // Reset warning flag when initialization is not started
  initializationWarningLogged = false;
  return false;
}

function setInitializationStarted(value: boolean): void {
  if (typeof sessionStorage !== 'undefined') {
    if (value) {
      sessionStorage.setItem(INIT_STARTED_KEY, 'true');
      sessionStorage.setItem(INIT_STARTED_TIME_KEY, Date.now().toString());
    } else {
      sessionStorage.removeItem(INIT_STARTED_KEY);
      sessionStorage.removeItem(INIT_STARTED_TIME_KEY);
    }
  }
}

function isInitializationComplete(): boolean {
  if (typeof sessionStorage !== 'undefined') {
    return sessionStorage.getItem(INIT_COMPLETE_KEY) === 'true';
  }
  return false;
}

function setInitializationComplete(value: boolean): void {
  if (typeof sessionStorage !== 'undefined') {
    if (value) {
      sessionStorage.setItem(INIT_COMPLETE_KEY, 'true');
    } else {
      sessionStorage.removeItem(INIT_COMPLETE_KEY);
    }
  }
}

// Export function to reset initialization (for logout, etc.)
export function resetInitialization(): void {
  setInitializationStarted(false);
  setInitializationComplete(false);
}

export interface AppInitializationResult {
  userId: string | null;
  selectedValueIds: string[];
  logs: LogEntry[];
  goals: Goal[];
  settings: AppSettings;
  loading: boolean;
  error: string | null;
  shouldShowMigration: boolean;
  hasResetToken: boolean;
}

export interface UseAppInitializationOptions {
  encryptionEnabled: boolean;
  isAuthenticated: boolean;
  onSetShowMigrationScreen?: (show: boolean) => void;
}

export function useAppInitialization(options: UseAppInitializationOptions): AppInitializationResult {
  const { encryptionEnabled, isAuthenticated, onSetShowMigrationScreen } = options;
  
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedValueIds, setSelectedValueIds] = useState<string[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    reminders: { enabled: false, frequency: 'daily', time: '09:00' }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shouldShowMigration, setShouldShowMigration] = useState(false);
  const [hasResetToken, setHasResetToken] = useState(false);
  
  const isMountedRef = useRef(true);
  const cleanupIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    
    // If initialization is complete and user is authenticated, skip re-initialization
    if (isInitializationComplete() && isAuthenticated) {
      logger.info('[INIT] ⚠️ Initialization already completed and user authenticated, skipping...');
      setLoading(false);
      return;
    }
    
    // If initialization is complete but user is not authenticated (encryption enabled),
    // don't re-initialize
    if (isInitializationComplete() && !isAuthenticated && encryptionEnabled) {
      logger.info('[INIT] Initialization complete - user needs to login (encryption enabled)');
      setLoading(false);
      return;
    }
    
    // Prevent multiple initializations using sessionStorage guard
    if (isInitializationStarted()) {
      // Debounce warning logs to prevent console spam
      const now = Date.now();
      if (!initializationWarningLogged || (now - lastWarningTime) > WARNING_DEBOUNCE_MS) {
        logger.info('[INIT] ⚠️ Initialization already in progress, skipping...');
        initializationWarningLogged = true;
        lastWarningTime = now;
      }
      return;
    }
    
    // Reset warning flag when starting new initialization
    initializationWarningLogged = false;
    
    setInitializationStarted(true);
    logger.info('[INIT] ✅ Marking initialization as started');
    
    let initializationTimeout: NodeJS.Timeout | null = null;
    
    // Set a timeout to prevent infinite hanging (10 seconds max - safer for slow connections)
    initializationTimeout = setTimeout(() => {
      if (isMountedRef.current) {
        logger.error('⚠️ Initialization timeout after 10 seconds - proceeding');
        setLoading(false);
      }
    }, 10000);
    
    const initialize = async () => {
      try {
        logger.info('[INIT] Starting initialization...');
        
        // OPTIMIZATION: Only clear caches when version changes (not on every load)
        const lastVersion = localStorage.getItem('app_version');
        const currentVersion = (import.meta as any).env?.VITE_APP_VERSION || 'unknown';

        if (lastVersion && lastVersion !== currentVersion) {
          logger.info('[INIT] Version changed from', lastVersion, 'to', currentVersion, '- clearing caches');
          try {
            // Only clear caches when version actually changes
            if ('caches' in window) {
              const cacheNames = await caches.keys();
              await Promise.all(cacheNames.map(name => {
                logger.info(`[INIT] Deleting cache: ${name}`);
                return caches.delete(name);
              }));
              logger.info(`[INIT] Cleared ${cacheNames.length} cache(s)`);
            }

            // Lazy service worker unregistration (only on version change)
            if ('serviceWorker' in navigator) {
              const registrations = await navigator.serviceWorker.getRegistrations();
              for (const registration of registrations) {
                if (registration.active) {
                  await registration.unregister();
                  logger.info('[INIT] Unregistered service worker due to version change');
                }
              }
            }
          } catch (cacheError) {
            logger.warn('[INIT] Cache clearing failed (non-critical):', cacheError);
          }
          localStorage.setItem('app_version', currentVersion);
        } else if (!lastVersion) {
          localStorage.setItem('app_version', currentVersion);
        } else {
          logger.debug('[INIT] Same version detected - skipping cache clearing');
        }
        
        // Run deployment diagnostics in development mode
        if ((import.meta as any).env?.DEV || window.location.hostname === 'localhost') {
          try {
            const diagnostics = await runDeploymentDiagnostics();
            if (diagnostics.issues.length > 0 || !diagnostics.dexie.versionMatch) {
              console.group('[INIT] 🔍 Deployment Diagnostics');
              logDeploymentDiagnostics(diagnostics);
              console.groupEnd();
            }
          } catch (diagError) {
            // Non-critical - don't block initialization
            logger.warn('[INIT] Diagnostic check failed (non-critical):', diagError);
          }
        }
        
        setModelLoadingProgress(5, 'Starting...', 'Initializing app');
        
        // OPTIMIZATION: Defer AI model loading until first user interaction
        // Models will be loaded on-demand when first AI interaction occurs
        logger.info('[INIT] ⏸️ AI model loading deferred - will load on first user interaction');
        
        setModelLoadingProgress(10, 'Initializing app...', 'Setting up core services');
        logger.info('[INIT] Progress updated to 10%');
        
        // OPTIMIZATION: Parallelize truly independent initialization steps
        logger.info('[INIT] 🚀 Parallelizing independent initialization steps...');
        
        // Step 1: Independent init (parallel)
        const [debugResult, shortcutsResult, updateResult] = await Promise.allSettled([
          // Initialize debug logging
          (async () => {
            try {
              initializeDebugLogging();
              logger.info('[INIT] Debug logging initialized');
              return { success: true };
            } catch (debugError) {
              logger.warn('[INIT] Debug logging failed (non-critical):', debugError);
              return { success: false, error: debugError };
            }
          })(),

          // Initialize shortcuts
          (async () => {
            try {
              await initializeShortcuts();
              return { success: true };
            } catch (error) {
              logger.warn('Failed to initialize shortcuts:', error);
              return { success: false };
            }
          })(),

          // Initialize update manager
          (async () => {
            try {
              const { updateManager } = await import('../services/updateManager');
              const updateInitPromise = updateManager.initialize();
              const updateInitTimeout = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Update manager initialization timeout')), 3000);
              });

              const updateInfo = await Promise.race([updateInitPromise, updateInitTimeout]) as any;
              logger.info('[INIT] Update manager initialized:', { isNewInstall: updateInfo?.isNewInstall, isUpdate: updateInfo?.isUpdate });

              if (updateInfo?.isNewInstall) {
                logger.info('🎉 New installation detected - setting up fresh app');
              } else if (updateInfo?.isUpdate) {
                logger.info(`🔄 App updated from v${updateInfo.previousVersion} to v${updateInfo.currentVersion || 'unknown'}`);
                logger.info('✅ User data preserved - database migrations applied');
              }

              return { success: true, updateInfo };
            } catch (updateError) {
              logger.warn('[INIT] Update manager failed (non-critical):', updateError);
              return { success: false, updateInfo: { isNewInstall: false, isUpdate: false, previousVersion: null } };
            }
          })(),
        ]);

        // Step 2: Service worker setup (critical, sequential)
        logger.info('[INIT] Setting up service worker...');
        
        const swActive = await ensureServiceWorkerActive().catch((error) => {
          logger.error('[INIT] Error ensuring service worker active:', error);
          return false;
        });

        if (swActive) {
          logger.info('✅ Service Worker is active');
        } else {
          logger.info('⚠️ Service Worker not active');
        }

        // Step 3: Legacy data detection (only if not encryption enabled)
        let legacyData: any = null;
        if (!encryptionEnabled) {
          try {
            const migrationDismissed = localStorage.getItem('migration_prompt_dismissed') === 'true';
            if (!migrationDismissed) {
              legacyData = await detectLegacyData();
              if (legacyData.hasLegacyData && isMountedRef.current) {
                setShouldShowMigration(true);
                onSetShowMigrationScreen?.(true);
              }
            }
          } catch (error) {
            logger.error('[INIT] Error detecting legacy data:', error);
          }
        }

        logger.info('[INIT] ✅ Parallel initialization completed');
        
        setModelLoadingProgress(40, 'Checking encryption...', '');
        logger.info('[INIT] Progress updated to 40%, checking encryption...');
        
        if (encryptionEnabled) {
          await new Promise(resolve => setTimeout(resolve, 50)); // Reduced delay
          logger.info('[INIT] Encryption enabled, auth state:', { isAuthenticated });
        } else {
          logger.info('[INIT] Encryption not enabled');
        }
        
        if (encryptionEnabled) {
          if (!isAuthenticated) {
            logger.info('[INIT] Encryption enabled but not authenticated - user needs to login');
            setModelLoadingProgress(100, 'Ready!', 'Please login to continue');
            await new Promise(resolve => setTimeout(resolve, 50));
            if (isMountedRef.current) {
              setLoading(false);
            }
            return;
          }
          logger.info('[INIT] User authenticated, proceeding with database initialization');
        } else {
          const migrationDismissed = localStorage.getItem('migration_prompt_dismissed') === 'true';
          if (!migrationDismissed) {
            detectLegacyData().then((legacyData) => {
              if (legacyData.hasLegacyData && isMountedRef.current) {
                setShouldShowMigration(true);
                onSetShowMigrationScreen?.(true);
              }
            }).catch((error) => {
              logger.error('[INIT] Error detecting legacy data:', error);
              // Continue initialization even if legacy detection fails
            });
          }
        }
        
        setModelLoadingProgress(50, 'Initializing database...', 'Loading user data');
        logger.info('[INIT] Progress updated to 50%, initializing database...');
        
        let adapter;
        try {
          adapter = getDatabaseAdapter();
          logger.info('[INIT] Database adapter obtained:', adapter.constructor.name);
        } catch (error) {
          logger.error('[INIT] Failed to get database adapter:', error);
          throw error;
        }
        
        logger.info('[INIT] Starting database initialization with 5s timeout...');

        // OPTIMIZATION: Parallelize data recovery check with database init
        const [recoveryResult, dbInitResult] = await Promise.allSettled([
          // Data recovery (optional, run in parallel)
          (async () => {
            try {
              const { recoverExportedData } = await import('../services/dexieDB') as any;
              const recovered = await recoverExportedData();
              if (recovered) {
                logger.info('[INIT] Data recovered from previous version error');
              }
              return { success: true };
            } catch (recoveryError) {
              logger.warn('[INIT] Data recovery check failed (non-critical):', recoveryError);
              return { success: false };
            }
          })(),

          // Database initialization with reduced timeout
          (async () => {
            const dbInitPromise = adapter.init();
            const dbInitTimeout = new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Database initialization timeout after 10 seconds')), 10000);
            });

            try {
              await Promise.race([dbInitPromise, dbInitTimeout]);
              logger.info('[INIT] Database initialization completed successfully');
              return { success: true };
            } catch (error) {
              logger.error('[INIT] Database initialization failed:', error);
              logger.info('[INIT] Retrying database initialization...');
              try {
                await Promise.race([
                  adapter.init(),
                  new Promise((_, reject) => setTimeout(() => reject(new Error('Database retry timeout')), 5000))
                ]);
                logger.info('[INIT] Database initialization retry succeeded');
                return { success: true };
              } catch (retryError) {
                logger.error('[INIT] Database retry failed:', retryError);
                logger.warn('[INIT] Continuing without database initialization - some features may be limited');
                return { success: false };
              }
            }
          })()
        ]);

        const dbInitSuccess = dbInitResult.status === 'fulfilled' && dbInitResult.value?.success;

        // Phase 0.2: localStorage Migration (runs after database init, before data loading)
        setModelLoadingProgress(55, 'Checking for data migration...', '');
        if (!isLocalStorageMigrationComplete()) {
          logger.info('[INIT] Legacy localStorage keys detected - starting migration...');
          try {
            const migrationResult = await migrateLocalStorageToIndexedDB();
            if (migrationResult.success && migrationResult.migrated) {
              logger.info('[INIT] localStorage migration completed successfully:', {
                keysMigrated: migrationResult.keysMigrated.length,
              });
            } else if (migrationResult.keysFound.length > 0) {
              logger.warn('[INIT] localStorage migration had issues:', migrationResult.errors);
            } else {
              logger.info('[INIT] No legacy localStorage data found - migration not needed');
            }
          } catch (error) {
            logger.error('[INIT] localStorage migration failed (non-critical):', error);
            // Non-critical, continue initialization
          }
        } else {
          logger.info('[INIT] localStorage migration already complete or not needed');
        }
        
        setModelLoadingProgress(60, 'Checking authentication...', '');

        // Only perform database operations if initialization succeeded
        if (dbInitSuccess) {
          setModelLoadingProgress(40, 'Preparing AI models...', 'AI models will load on-demand when used');

          // Use adapter for cleanup operations (only if DB is ready)
          adapter.cleanupExpiredTokens().catch((error) => logger.error('[INIT] Cleanup expired tokens failed:', error));

          cleanupIntervalRef.current = setInterval(() => {
            adapter.cleanupExpiredTokens().catch((error) => logger.error('[INIT] Cleanup expired tokens failed:', error));
          }, 60 * 60 * 1000);
        } else {
          logger.warn('[INIT] Skipping database cleanup operations - database not initialized');
        }
        
        // Phase 7: Data Pruning - Run on initialization and schedule weekly
        if (isDataPruningEnabled()) {
          logger.info('[INIT] Running data pruning on initialization...');
          runDataPruning().catch((error) => {
            logger.error('[INIT] Data pruning failed (non-critical):', error);
          });
          
          // Schedule weekly pruning
          const pruningIntervalId = scheduleWeeklyPruning();
          // Store in cleanupIntervalRef or a separate ref for cleanup
          // Note: This will run weekly, so we don't need to clear it on unmount
          // But we should clear it in the cleanup function
          if (cleanupIntervalRef.current) {
            // Store both intervals - we'll need to track multiple intervals
            // For now, we'll just let the weekly pruning run independently
          }
        } else {
          logger.info('[INIT] Data pruning is disabled');
        }
        
        if (!isMountedRef.current) return;
        
        // Check for password reset link in URL hash
        const hash = window.location.hash;
        const hasResetToken = hash.match(/^#reset\/(.+)$/);
        setHasResetToken(!!hasResetToken);
        
        if (hasResetToken) {
          if (isMountedRef.current) {
            setLoading(false);
          }
          return;
        }
        
        if (isLoggedIn()) {
          setModelLoadingProgress(70, 'Loading user data...', 'AI models load on-demand when used');
          logger.info('[INIT] Progress updated to 70%, loading user data...');
          
          const userDataPromise = (async () => {
            try {
              logger.info('[INIT] Getting current user...');
              const user = await Promise.race([
                getCurrentUser(),
                new Promise<any>((_, reject) => setTimeout(() => reject(new Error('getCurrentUser timeout')), 5000))
              ]);
              if (!isMountedRef.current || !user) {
                logger.warn('[INIT] No user found or component unmounted');
                return null;
              }
              
              logger.info('[INIT] User loaded:', user.id);
              if (isMountedRef.current) {
                setUserId(user.id);
              }
              
              setModelLoadingProgress(80, 'Loading app data...', 'AI models loading in background');
              logger.info('[INIT] Progress updated to 80%, loading app data...');
              
              try {
                const adapter = getDatabaseAdapter();
                logger.info('[INIT] Getting app data for user:', user.id);
                
                // Load from both appData (backward compatibility) and new tables
                const [appData, activeValues, tableGoals] = await Promise.all([
                  Promise.race([
                    adapter.getAppData(user.id),
                    new Promise<any>((_, reject) => setTimeout(() => reject(new Error('getAppData timeout')), 5000))
                  ]).catch((error) => {
                    logger.error('[INIT] Error loading appData:', error);
                    return null;
                  }),
                  // Try to load from values table (new structure) - use adapter for security
                  Promise.race([
                    adapter.getActiveValues(user.id),
                    new Promise<string[]>((_, reject) => setTimeout(() => reject(new Error('getActiveValues timeout')), 2000))
                  ]).catch((error) => {
                    logger.error('[INIT] Error loading activeValues:', error);
                    return [];
                  }),
                  // Try to load from goals table (new structure) - use adapter for security
                  Promise.race([
                    adapter.getGoals(user.id),
                    new Promise<any[]>((_, reject) => setTimeout(() => reject(new Error('getGoals timeout')), 2000))
                  ]).catch((error) => {
                    logger.error('[INIT] Error loading goals:', error);
                    return [];
                  })
                ]);
                
                if (!isMountedRef.current) {
                  logger.warn('[INIT] Component unmounted during app data load');
                  return null;
                }
              
                // Use values from table if available, otherwise fall back to appData
                const values = activeValues.length > 0 ? activeValues : (appData?.values || []);
                // Use goals from table if available, otherwise fall back to appData
                const goals = tableGoals.length > 0 ? tableGoals : (appData?.goals || []);
                
                if (appData || values.length > 0 || goals.length > 0) {
                  if (isMountedRef.current) {
                    setSelectedValueIds(values);
                    setLogs(appData?.logs || []);
                    setGoals(goals);
                    const loadedSettings = appData?.settings || { reminders: { enabled: false, frequency: 'daily', time: '09:00' } };
                    if (loadedSettings.reminders && !loadedSettings.reminders.frequency) {
                      loadedSettings.reminders.frequency = 'daily';
                    }
                    if (!loadedSettings.aiModel || (loadedSettings.aiModel as any) === 'tinyllama') {
                      loadedSettings.aiModel = 'lamini';
                    }
                    setSettings(loadedSettings);
                    
                    if (loadedSettings.aiModel) {
                      setSelectedModel(loadedSettings.aiModel);
                      initializeModels(false, loadedSettings.aiModel).catch((error) => {
                        logger.error('[INIT] Error initializing models:', error);
                        // Silently fail - models will retry later
                      });
                    }
                  }
                }
              } catch (appDataError) {
                logger.error('[INIT] Failed to load app data:', appDataError);
              }
              
              return user;
            } catch (error) {
              logger.error('[INIT] Error loading user data:', error);
              return null;
            }
          })();
          
          await userDataPromise;
          
          setModelLoadingProgress(100, 'Ready!', 'AI models load on-demand when used');
        } else {
          setModelLoadingProgress(100, 'Ready!', 'AI models load on-demand when used');
        }
        
        if (isMountedRef.current) {
          setLoading(false);
          setInitializationComplete(true);
        }
      } catch (error) {
        logger.error('Initialization error:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        const isCriticalError = errorMessage.includes('Database initialization') && 
                                errorMessage.includes('timeout');
        
        if (isCriticalError) {
          logger.warn('⚠️ Non-critical initialization issue - proceeding to login');
          setModelLoadingProgress(100, 'Ready!', 'Some features may be limited');
        } else {
          setProgressError('Initialization issue', 'Some features may be limited');
        }
        
        if (isMountedRef.current) {
          setError(errorMessage);
          setLoading(false);
          setInitializationComplete(true);
        }
      } finally {
        if (initializationTimeout) {
          clearTimeout(initializationTimeout);
        }
      }
    };
    
    const initializeWithTimeout = async () => {
      const initStartTime = Date.now();
      try {
        logger.info('[INIT] Starting initialize() function...');
        await initialize();
        const duration = Date.now() - initStartTime;
        logger.info(`[INIT] initialize() completed successfully in ${duration}ms`);
        if (isMountedRef.current) {
          setInitializationComplete(true);
        }
        if (initializationTimeout) {
          clearTimeout(initializationTimeout);
        }
      } catch (error) {
        const duration = Date.now() - initStartTime;
        logger.error(`[INIT] initialize() failed after ${duration}ms:`, error);
        if (isMountedRef.current) {
          setInitializationComplete(true);
          setLoading(false);
        }
      }
    };
    
    initializeWithTimeout();
    
    // Set up Tauri deep-link listener
    if (typeof window !== 'undefined' && '__TAURI__' in window) {
      import('@tauri-apps/plugin-deep-link').then(({ onOpenUrl, getCurrent }) => {
        if (!isMountedRef.current) return;
        
        onOpenUrl((urls) => {
          for (const url of urls) {
            try {
              const urlObj = new URL(url);
              if (urlObj.protocol === 'tauri:' && urlObj.hostname === 'localhost') {
                const hash = urlObj.hash || '';
                if (hash.startsWith('#reset/')) {
                  if (window.location.hash !== hash) {
                    window.location.hash = hash;
                  }
                  window.dispatchEvent(new Event('hashchange'));
                }
              }
            } catch (e) {
              logger.error('Error parsing deep link URL:', e);
            }
          }
        }).catch((error) => logger.error('[INIT] Deep link handler error:', error));
        
        getCurrent().then((urls) => {
          if (!isMountedRef.current || !urls || urls.length === 0) return;
          
          for (const url of urls) {
            try {
              const urlObj = new URL(url);
              if (urlObj.protocol === 'tauri:' && urlObj.hostname === 'localhost') {
                const hash = urlObj.hash || '';
                if (hash.startsWith('#reset/')) {
                  if (window.location.hash !== hash) {
                    window.location.hash = hash;
                  }
                  window.dispatchEvent(new Event('hashchange'));
                }
              }
            } catch (e) {
              logger.error('Error parsing deep link URL:', e);
            }
          }
        }).catch((error) => {
          logger.error('[INIT] Error handling deep link:', error);
          // No deep links on launch
        });
      }).catch((error) => {
        logger.warn('[INIT] Deep-link plugin not available:', error);
      });
    }
    
    return () => {
      isMountedRef.current = false;
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
      }
      if (initializationTimeout) {
        clearTimeout(initializationTimeout);
      }
    };
  }, [encryptionEnabled, isAuthenticated, onSetShowMigrationScreen]);

  return {
    userId,
    selectedValueIds,
    logs,
    goals,
    settings,
    loading,
    error,
    shouldShowMigration,
    hasResetToken,
  };
}

