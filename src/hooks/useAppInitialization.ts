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
          console.warn('[INIT] Initialization stuck for', elapsed, 'ms - resetting');
          sessionStorage.removeItem(INIT_STARTED_KEY);
          sessionStorage.removeItem(INIT_STARTED_TIME_KEY);
          initializationWarningLogged = false; // Reset warning flag
          return false;
        }
        return true;
      } else {
        console.warn('[INIT] Initialization started flag exists but no timestamp - resetting');
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
      console.log('[INIT] ⚠️ Initialization already completed and user authenticated, skipping...');
      setLoading(false);
      return;
    }
    
    // If initialization is complete but user is not authenticated (encryption enabled),
    // don't re-initialize
    if (isInitializationComplete() && !isAuthenticated && encryptionEnabled) {
      console.log('[INIT] Initialization complete - user needs to login (encryption enabled)');
      setLoading(false);
      return;
    }
    
    // Prevent multiple initializations using sessionStorage guard
    if (isInitializationStarted()) {
      // Debounce warning logs to prevent console spam
      const now = Date.now();
      if (!initializationWarningLogged || (now - lastWarningTime) > WARNING_DEBOUNCE_MS) {
        console.log('[INIT] ⚠️ Initialization already in progress, skipping...');
        initializationWarningLogged = true;
        lastWarningTime = now;
      }
      return;
    }
    
    // Reset warning flag when starting new initialization
    initializationWarningLogged = false;
    
    setInitializationStarted(true);
    console.log('[INIT] ✅ Marking initialization as started');
    
    let initializationTimeout: NodeJS.Timeout | null = null;
    
    // Set a timeout to prevent infinite hanging (15 seconds max)
    initializationTimeout = setTimeout(() => {
      if (isMountedRef.current) {
        console.error('⚠️ Initialization timeout after 15 seconds - proceeding');
        setLoading(false);
      }
    }, 15000);
    
    const initialize = async () => {
      try {
        console.log('[INIT] Starting initialization...');
        
        // Clear all caches to ensure fresh load
        console.log('[INIT] Clearing caches for fresh load...');
        try {
          // Clear browser caches (Cache API)
          if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => {
              console.log(`[INIT] Deleting cache: ${name}`);
              return caches.delete(name);
            }));
            console.log(`[INIT] Cleared ${cacheNames.length} cache(s)`);
          }
          
          // Clear service worker cache if available
          if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (const registration of registrations) {
              if (registration.active) {
                // Unregister service worker to force fresh registration
                await registration.unregister();
                console.log('[INIT] Unregistered service worker for fresh load');
              }
            }
          }
        } catch (cacheError) {
          console.warn('[INIT] Cache clearing failed (non-critical):', cacheError);
          // Non-critical, continue initialization
        }
        
        // Run deployment diagnostics in development mode
        if (import.meta.env?.DEV || window.location.hostname === 'localhost') {
          try {
            const diagnostics = await runDeploymentDiagnostics();
            if (diagnostics.issues.length > 0 || !diagnostics.dexie.versionMatch) {
              console.group('[INIT] 🔍 Deployment Diagnostics');
              logDeploymentDiagnostics(diagnostics);
              console.groupEnd();
            }
          } catch (diagError) {
            // Non-critical - don't block initialization
            console.warn('[INIT] Diagnostic check failed (non-critical):', diagError);
          }
        }
        
        setModelLoadingProgress(5, 'Starting...', 'Initializing app');
        
        // START AI MODEL LOADING IMMEDIATELY - don't wait, run in background
        console.log('[INIT] 🚀 Starting AI model loading in background (non-blocking)...');
        preloadModelsContinuously().catch((error) => {
          if (error instanceof Error && (
            error.message.includes('network') || 
            error.message.includes('fetch') || 
            error.message.includes('Failed to fetch') ||
            error.message.includes('No internet')
          )) {
            console.warn('[INIT] AI model loading stopped: No internet connection');
          }
        });
        
        await new Promise(resolve => setTimeout(resolve, 50));
        
        setModelLoadingProgress(10, 'Initializing app...', 'Setting up core services');
        console.log('[INIT] Progress updated to 10%');
        
        // Initialize debug logging first
        try {
          initializeDebugLogging();
          console.log('[INIT] Debug logging initialized');
        } catch (debugError) {
          console.warn('[INIT] Debug logging failed (non-critical):', debugError);
        }
        
        setModelLoadingProgress(20, 'Checking for updates...', '');
        console.log('[INIT] Progress updated to 20%');
        
        // Initialize update manager to detect new install vs update
        let updateInfo: { isNewInstall: boolean; isUpdate: boolean; previousVersion: string | null; currentVersion?: string } | null = null;
        try {
          const { updateManager } = await import('../services/updateManager');
          const updateInitPromise = updateManager.initialize();
          const updateInitTimeout = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Update manager initialization timeout')), 5000);
          });
          
          updateInfo = await Promise.race([updateInitPromise, updateInitTimeout]) as any;
          console.log('[INIT] Update manager initialized:', { isNewInstall: updateInfo?.isNewInstall, isUpdate: updateInfo?.isUpdate });
        } catch (updateError) {
          console.warn('[INIT] Update manager failed (non-critical):', updateError);
          updateInfo = { isNewInstall: false, isUpdate: false, previousVersion: null };
        }
        
        if (updateInfo?.isNewInstall) {
          console.log('🎉 New installation detected - setting up fresh app');
        } else if (updateInfo?.isUpdate) {
          console.log(`🔄 App updated from v${updateInfo.previousVersion} to v${updateInfo.currentVersion || 'unknown'}`);
          console.log('✅ User data preserved - database migrations applied');
        }
        
        setModelLoadingProgress(30, 'Setting up service worker...', '');
        console.log('[INIT] Progress updated to 30%');
        
        const swActive = await ensureServiceWorkerActive().catch(() => false);
        
        if (swActive) {
          console.log('✅ Service Worker is active - starting background model loading');
        } else {
          console.log('⚠️ Service Worker not active - starting model loading anyway');
        }
        
        try {
          listenForServiceWorkerUpdates();
        } catch (swError) {
          console.warn('[INIT] Service worker listener failed (non-critical):', swError);
        }
        
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistration().then(registration => {
            if (registration) {
              registration.update().catch(error => {
                console.warn('Service worker update check failed:', error);
              });
            }
          }).catch(error => {
            console.warn('Service worker registration check failed:', error);
          });
        }
        
        initializeShortcuts().catch((error) => {
          console.warn('Failed to initialize shortcuts:', error);
        });
        
        setModelLoadingProgress(40, 'Checking encryption...', '');
        console.log('[INIT] Progress updated to 40%, checking encryption...');
        
        if (encryptionEnabled) {
          await new Promise(resolve => setTimeout(resolve, 100));
          console.log('[INIT] Encryption enabled, auth state:', { isAuthenticated });
        } else {
          console.log('[INIT] Encryption not enabled');
        }
        
        if (encryptionEnabled) {
          if (!isAuthenticated) {
            console.log('[INIT] Encryption enabled but not authenticated - user needs to login');
            setModelLoadingProgress(100, 'Ready!', 'Please login to continue');
            await new Promise(resolve => setTimeout(resolve, 50));
            if (isMountedRef.current) {
              setLoading(false);
            }
            return;
          }
          console.log('[INIT] User authenticated, proceeding with database initialization');
        } else {
          const migrationDismissed = localStorage.getItem('migration_prompt_dismissed') === 'true';
          if (!migrationDismissed) {
            detectLegacyData().then((legacyData) => {
              if (legacyData.hasLegacyData && isMountedRef.current) {
                setShouldShowMigration(true);
                onSetShowMigrationScreen?.(true);
              }
            }).catch(() => {
              // Ignore errors in legacy detection
            });
          }
        }
        
        setModelLoadingProgress(50, 'Initializing database...', 'Loading user data');
        console.log('[INIT] Progress updated to 50%, initializing database...');
        
        let adapter;
        try {
          adapter = getDatabaseAdapter();
          console.log('[INIT] Database adapter obtained:', adapter.constructor.name);
        } catch (error) {
          console.error('[INIT] Failed to get database adapter:', error);
          throw error;
        }
        
        console.log('[INIT] Starting database initialization with 10s timeout...');
        
        // Attempt to recover exported data if available (from version recovery)
        try {
          const { recoverExportedData } = await import('../services/dexieDB');
          const recovered = await recoverExportedData();
          if (recovered) {
            console.log('[INIT] Data recovered from previous version error');
          }
        } catch (recoveryError) {
          // Non-critical - recovery is optional
          console.warn('[INIT] Data recovery check failed (non-critical):', recoveryError);
        }
        
        // Attempt cloud restore if enabled (after local recovery)
        try {
          const { restoreFromCloud, startAutoSync } = await import('../services/dexieDB');
          const cloudRestored = await restoreFromCloud();
          if (cloudRestored) {
            console.log('[INIT] Data restored from cloud backup');
          }
          // Start auto-sync after restore attempt (if not already started)
          startAutoSync();
        } catch (cloudError) {
          // Non-critical - cloud sync is optional
          console.warn('[INIT] Cloud restore check failed (non-critical):', cloudError);
        }
        
        const dbInitPromise = adapter.init();
        const dbInitTimeout = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Database initialization timeout after 10 seconds')), 10000);
        });
        
        try {
          await Promise.race([dbInitPromise, dbInitTimeout]);
          console.log('[INIT] Database initialization completed successfully');
        } catch (error) {
          console.error('[INIT] Database initialization failed:', error);
          console.log('[INIT] Retrying database initialization...');
          try {
            await Promise.race([
              adapter.init(),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Database retry timeout')), 5000))
            ]);
            console.log('[INIT] Database initialization retry succeeded');
          } catch (retryError) {
            console.error('[INIT] Database retry failed:', retryError);
            console.warn('[INIT] Continuing without database initialization - some features may be limited');
          }
        }

        // Phase 0.2: localStorage Migration (runs after database init, before data loading)
        setModelLoadingProgress(55, 'Checking for data migration...', '');
        if (!isLocalStorageMigrationComplete()) {
          console.log('[INIT] Legacy localStorage keys detected - starting migration...');
          try {
            const migrationResult = await migrateLocalStorageToIndexedDB();
            if (migrationResult.success && migrationResult.migrated) {
              console.log('[INIT] localStorage migration completed successfully:', {
                keysMigrated: migrationResult.keysMigrated.length,
              });
            } else if (migrationResult.keysFound.length > 0) {
              console.warn('[INIT] localStorage migration had issues:', migrationResult.errors);
            } else {
              console.log('[INIT] No legacy localStorage data found - migration not needed');
            }
          } catch (error) {
            console.error('[INIT] localStorage migration failed (non-critical):', error);
            // Non-critical, continue initialization
          }
        } else {
          console.log('[INIT] localStorage migration already complete or not needed');
        }
        
        setModelLoadingProgress(60, 'Checking authentication...', '');
        
        setModelLoadingProgress(40, 'Preparing AI models...', '');
        
        // Use adapter for cleanup operations (adapter already declared above)
        adapter.cleanupExpiredTokens().catch(console.error);
        
        cleanupIntervalRef.current = setInterval(() => {
          adapter.cleanupExpiredTokens().catch(console.error);
        }, 60 * 60 * 1000);
        
        // Phase 7: Data Pruning - Run on initialization and schedule weekly
        if (isDataPruningEnabled()) {
          console.log('[INIT] Running data pruning on initialization...');
          runDataPruning().catch((error) => {
            console.error('[INIT] Data pruning failed (non-critical):', error);
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
          console.log('[INIT] Data pruning is disabled');
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
          setModelLoadingProgress(70, 'Loading user data...', 'AI models loading in background');
          console.log('[INIT] Progress updated to 70%, loading user data...');
          
          const userDataPromise = (async () => {
            try {
              console.log('[INIT] Getting current user...');
              const user = await Promise.race([
                getCurrentUser(),
                new Promise<any>((_, reject) => setTimeout(() => reject(new Error('getCurrentUser timeout')), 5000))
              ]);
              if (!isMountedRef.current || !user) {
                console.warn('[INIT] No user found or component unmounted');
                return null;
              }
              
              console.log('[INIT] User loaded:', user.id);
              if (isMountedRef.current) {
                setUserId(user.id);
              }
              
              setModelLoadingProgress(80, 'Loading app data...', 'AI models loading in background');
              console.log('[INIT] Progress updated to 80%, loading app data...');
              
              try {
                const adapter = getDatabaseAdapter();
                console.log('[INIT] Getting app data for user:', user.id);
                
                // Load from both appData (backward compatibility) and new tables
                const [appData, activeValues, tableGoals] = await Promise.all([
                  Promise.race([
                    adapter.getAppData(user.id),
                    new Promise<any>((_, reject) => setTimeout(() => reject(new Error('getAppData timeout')), 5000))
                  ]).catch(() => null),
                  // Try to load from values table (new structure) - use adapter for security
                  Promise.race([
                    adapter.getActiveValues(user.id),
                    new Promise<string[]>((_, reject) => setTimeout(() => reject(new Error('getActiveValues timeout')), 2000))
                  ]).catch(() => []),
                  // Try to load from goals table (new structure) - use adapter for security
                  Promise.race([
                    adapter.getGoals(user.id),
                    new Promise<any[]>((_, reject) => setTimeout(() => reject(new Error('getGoals timeout')), 2000))
                  ]).catch(() => [])
                ]);
                
                if (!isMountedRef.current) {
                  console.warn('[INIT] Component unmounted during app data load');
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
                      initializeModels(false, loadedSettings.aiModel).catch(() => {
                        // Silently fail - models will retry later
                      });
                    }
                  }
                }
              } catch (appDataError) {
                console.error('[INIT] Failed to load app data:', appDataError);
              }
              
              return user;
            } catch (error) {
              console.error('[INIT] Error loading user data:', error);
              return null;
            }
          })();
          
          await userDataPromise;
          
          setModelLoadingProgress(100, 'Ready!', 'AI models continue loading in background');
        } else {
          setModelLoadingProgress(100, 'Ready!', 'AI models loading in background');
        }
        
        if (isMountedRef.current) {
          setLoading(false);
          setInitializationComplete(true);
        }
      } catch (error) {
        console.error('Initialization error:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        const isCriticalError = errorMessage.includes('Database initialization') && 
                                errorMessage.includes('timeout');
        
        if (isCriticalError) {
          console.warn('⚠️ Non-critical initialization issue - proceeding to login');
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
        console.log('[INIT] Starting initialize() function...');
        await initialize();
        const duration = Date.now() - initStartTime;
        console.log(`[INIT] initialize() completed successfully in ${duration}ms`);
        if (isMountedRef.current) {
          setInitializationComplete(true);
        }
        if (initializationTimeout) {
          clearTimeout(initializationTimeout);
        }
      } catch (error) {
        const duration = Date.now() - initStartTime;
        console.error(`[INIT] initialize() failed after ${duration}ms:`, error);
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
              console.error('Error parsing deep link URL:', e);
            }
          }
        }).catch(console.error);
        
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
              console.error('Error parsing deep link URL:', e);
            }
          }
        }).catch(() => {
          // No deep links on launch
        });
      }).catch(() => {
        console.warn('Deep-link plugin not available');
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

