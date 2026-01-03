
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { ALL_VALUES } from './constants';
import { ValueItem, LogEntry, Goal, GoalUpdate, AppSettings, LCSWConfig } from './types';
import ValueSelection from './components/ValueSelection';
import HelpOverlay from './components/HelpOverlay';
import ThemeToggle from './components/ThemeToggle';
import Login from './components/Login';
import TermsAcceptance from './components/TermsAcceptance';
import BottomNavigation from './components/BottomNavigation';
import ErrorBoundary from './components/ErrorBoundary';
import SkeletonCard from './components/SkeletonCard';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import FeedbackButton from './components/FeedbackButton';

// Code splitting: Lazy load heavy components
const Dashboard = lazy(() => import('./components/Dashboard'));
const ReportView = lazy(() => import('./components/ReportView'));
const VaultControl = lazy(() => import('./components/VaultControl'));
const LCSWConfigComponent = lazy(() => import('./components/LCSWConfig'));
const GoalsUpdateView = lazy(() => import('./components/GoalsUpdateView'));
import { preloadModels, preloadModelsContinuously, initializeModels, setSelectedModel } from './services/aiService';
import { dbService } from './services/database';
import { getDatabaseAdapter } from './services/databaseAdapter';
import { isLoggedIn, getCurrentUser, acceptTerms, logoutUser } from './services/authService';
import { useAuth } from './hooks/useAuth';
import { detectLegacyData } from './services/legacyDetection';
import { MigrationScreen } from './components/MigrationScreen';
import { getItemSync, setItemSync } from './services/storage';
import { hasPermission, sendNotification } from './services/notifications';
import { initializeDebugLogging } from './services/debugLog';
import { subscribeToProgress, setModelLoadingProgress, setProgressSuccess, setProgressError } from './services/progressTracker';
import ProgressBar from './components/ProgressBar';
import { initializeShortcuts } from './utils/createShortcut';
import { ensureServiceWorkerActive, listenForServiceWorkerUpdates } from './utils/serviceWorker';
import { useModelInstallationStatus } from './hooks/useModelInstallationStatus';

// Module-level guard to prevent multiple initializations (persists across remounts)
// Use sessionStorage to persist across page reloads/remounts
const INIT_STARTED_KEY = 'app_init_started';
const INIT_STARTED_TIME_KEY = 'app_init_started_time';
const INIT_COMPLETE_KEY = 'app_init_complete';

function isInitializationStarted(): boolean {
  if (typeof sessionStorage !== 'undefined') {
    const started = sessionStorage.getItem(INIT_STARTED_KEY);
    if (started === 'true') {
      // Check if initialization has been stuck for too long (30 seconds)
      const startTime = sessionStorage.getItem(INIT_STARTED_TIME_KEY);
      if (startTime) {
        const elapsed = Date.now() - parseInt(startTime, 10);
        if (elapsed > 30000) {
          // Initialization stuck for more than 30 seconds - reset it
          console.warn('[INIT] Initialization stuck for', elapsed, 'ms - resetting');
          // Debug logging removed - was causing connection refused errors
          sessionStorage.removeItem(INIT_STARTED_KEY);
          sessionStorage.removeItem(INIT_STARTED_TIME_KEY);
          return false;
        }
        return true;
      } else {
        // No timestamp - this is from an old run, reset it
        console.warn('[INIT] Initialization started flag exists but no timestamp - resetting (likely from old run)');
        // Debug logging removed - was causing connection refused errors
        sessionStorage.removeItem(INIT_STARTED_KEY);
        return false;
      }
    }
  }
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

// Simple persistence helper using storage abstraction
const useLocalStorage = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = getItemSync<T>(key);
      return item !== null ? item : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      setItemSync(key, storedValue);
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
};

// Unlock Form Component
const UnlockForm: React.FC<{ onUnlock: (password: string) => Promise<void>; error: string | null }> = ({ onUnlock, error }) => {
  const [password, setPassword] = useState('');
  const [unlocking, setUnlocking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnlocking(true);
    await onUnlock(password);
    setUnlocking(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-primary dark:text-white mb-2">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 bg-bg-secondary dark:bg-dark-bg-secondary text-text-primary dark:text-white rounded-lg border border-border-soft dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-yellow-warm"
          placeholder="Enter your password"
          autoFocus
        />
      </div>
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      <button
        type="submit"
        disabled={unlocking || !password}
        className="w-full px-4 py-3 bg-yellow-warm text-white rounded-lg text-sm font-black uppercase tracking-widest hover:opacity-90 disabled:opacity-50"
      >
        {unlocking ? 'Unlocking...' : 'Unlock'}
      </button>
    </form>
  );
};

const App: React.FC = () => {
  const [authState, setAuthState] = useState<'checking' | 'login' | 'terms' | 'app'>('checking');
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedValueIds, setSelectedValueIds] = useState<string[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    reminders: { enabled: false, frequency: 'daily', time: '09:00' }
  });
  const [view, setView] = useState<'onboarding' | 'home' | 'report' | 'values' | 'vault' | 'goals'>('onboarding');
  const [showHelp, setShowHelp] = useState(false);
  const [showLCSWConfig, setShowLCSWConfig] = useState(false);
  const [showMigrationScreen, setShowMigrationScreen] = useState(false);
  const [showUnlockScreen, setShowUnlockScreen] = useState(false);
  const [initialValueIdForGoal, setInitialValueIdForGoal] = useState<string | null>(null);
  
  // Encryption and auth state
  let encryptionEnabled: boolean;
  try {
    encryptionEnabled = localStorage.getItem('encryption_enabled') === 'true';
  } catch (error) {
    encryptionEnabled = false;
  }
  
  const auth = useAuth();
  const { status: installationStatus, label: installationLabel, progress: installationProgress, displayText: aiStatusText } = useModelInstallationStatus();

  // Initialize database and check auth state
  useEffect(() => {
    // Debug logging removed - was causing connection refused errors
    console.log('[INIT] useEffect triggered - checking guards...', {
      started: isInitializationStarted(),
      complete: isInitializationComplete(),
      authState,
      encryptionEnabled,
      isAuthenticated: auth.isAuthenticated
    });
    
    // If user is authenticated (after login), allow re-initialization
    if (auth.isAuthenticated && isInitializationComplete()) {
      // Debug logging removed - was causing connection refused errors
      console.log('[INIT] User authenticated after login - clearing flags to allow re-initialization');
      setInitializationStarted(false);
      setInitializationComplete(false);
    }
    
    // CRITICAL: Check completion status FIRST, before checking if started
    // This ensures we handle the case where initialization completed but authState wasn't set
    
    // If initialization is complete and user is authenticated, skip re-initialization
    if (isInitializationComplete() && auth.isAuthenticated) {
      // Debug logging removed - was causing connection refused errors
      console.log('[INIT] ⚠️ Initialization already completed and user authenticated, skipping...');
      return;
    }
    
    // If initialization is complete but user is not authenticated (encryption enabled),
    // ensure authState is set to 'login' and don't re-initialize
    if (isInitializationComplete() && !auth.isAuthenticated && encryptionEnabled) {
      // Debug logging removed - was causing connection refused errors
      console.log('[INIT] Initialization complete - user needs to login (encryption enabled)');
      // CRITICAL: Ensure authState is set to login (in case it got reset or wasn't set)
      if (authState === 'checking') {
        console.log('[INIT] Setting authState to login (was checking)');
        setAuthState('login');
      }
      return;
    }
    
    // Prevent multiple initializations using sessionStorage guard
    // Only check if started AFTER we've handled completion cases
    if (isInitializationStarted()) {
      // Debug logging removed - was causing connection refused errors
      console.log('[INIT] ⚠️ Initialization already in progress, skipping...');
      return;
    }
    
    setInitializationStarted(true);
    // Debug logging removed - was causing connection refused errors
    console.log('[INIT] ✅ Marking initialization as started');
    
    let isMounted = true; // Prevent state updates if component unmounts
    let cleanupInterval: NodeJS.Timeout | null = null;
    let initializationTimeout: NodeJS.Timeout | null = null;
    
    // Set a timeout to prevent infinite hanging (15 seconds max - reduced from 30)
    initializationTimeout = setTimeout(() => {
      if (isMounted && authState === 'checking') {
        console.error('⚠️ Initialization timeout after 15 seconds - proceeding to login screen');
        console.error('[INIT] This suggests a blocking operation is taking too long');
        // If encryption is enabled, show unlock screen instead of login
        if (encryptionEnabled && !auth.isAuthenticated) {
          setShowUnlockScreen(true);
        }
        setAuthState('login');
      }
    }, 15000);
    
    // Also set a shorter timeout (5 seconds) to ensure something renders
    const quickTimeout = setTimeout(() => {
      if (isMounted && authState === 'checking') {
        // If encryption enabled and not authenticated, show unlock screen
        if (encryptionEnabled && !auth.isAuthenticated) {
          setShowUnlockScreen(true);
        }
      }
    }, 5000);
    
    const initialize = async () => {
      // Debug logging removed - was causing connection refused errors
      try {
        // IMMEDIATE progress update - this should show right away
        console.log('[INIT] Starting initialization...');
        setModelLoadingProgress(5, 'Starting...', 'Initializing app');
        
        // START AI MODEL LOADING IMMEDIATELY - don't wait, run in background
        // This ensures models start downloading as early as possible
        // Keep retrying until models load or network error (no internet)
        console.log('[INIT] 🚀 Starting AI model loading in background (non-blocking)...');
        preloadModelsContinuously().catch((error) => {
          // Only log network errors - other errors will keep retrying
          if (error instanceof Error && (
            error.message.includes('network') || 
            error.message.includes('fetch') || 
            error.message.includes('Failed to fetch') ||
            error.message.includes('No internet')
          )) {
            console.warn('[INIT] AI model loading stopped: No internet connection');
          }
          // For all other errors, retrying continues in background
        });
        
        // Small delay to ensure UI updates
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Update progress: Starting initialization
        setModelLoadingProgress(10, 'Initializing app...', 'Setting up core services');
        console.log('[INIT] Progress updated to 10%');
        
        // Set auth state to login quickly - don't wait for everything
        // This allows user to start using app immediately
        if (authState === 'checking') {
          console.log('[INIT] Setting authState to login (non-blocking initialization)');
          setAuthState('login');
        }
        
        // Initialize debug logging first
        try {
          initializeDebugLogging();
          console.log('[INIT] Debug logging initialized');
        } catch (debugError) {
          console.warn('[INIT] Debug logging failed (non-critical):', debugError);
        }
        
        // Update progress: Checking for updates
        setModelLoadingProgress(20, 'Checking for updates...', '');
        console.log('[INIT] Progress updated to 20%');
        
        // Initialize update manager to detect new install vs update
        let updateInfo: { isNewInstall: boolean; isUpdate: boolean; previousVersion: string | null; currentVersion?: string } | null = null;
        try {
          const { updateManager } = await import('./services/updateManager');
          // Add timeout to update manager initialization (5 seconds max)
          const updateInitPromise = updateManager.initialize();
          const updateInitTimeout = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Update manager initialization timeout')), 5000);
          });
          
          updateInfo = await Promise.race([updateInitPromise, updateInitTimeout]) as any;
          console.log('[INIT] Update manager initialized:', { isNewInstall: updateInfo?.isNewInstall, isUpdate: updateInfo?.isUpdate });
        } catch (updateError) {
          console.warn('[INIT] Update manager failed (non-critical):', updateError);
          // Continue anyway - set default values
          updateInfo = { isNewInstall: false, isUpdate: false, previousVersion: null };
        }
        
        if (updateInfo?.isNewInstall) {
          console.log('🎉 New installation detected - setting up fresh app');
        } else if (updateInfo?.isUpdate) {
          console.log(`🔄 App updated from v${updateInfo.previousVersion} to v${updateInfo.currentVersion || 'unknown'}`);
          console.log('✅ User data preserved - database migrations applied');
        }
        
        // Update progress: Setting up service worker
        setModelLoadingProgress(30, 'Setting up service worker...', '');
        console.log('[INIT] Progress updated to 30%');
        
        // Ensure service worker is active (for PWA, offline, and AI model caching)
        // Wait for service worker to be active before starting model loading
        const swActive = await ensureServiceWorkerActive().catch(() => false);
        
        if (swActive) {
          console.log('✅ Service Worker is active - starting background model loading');
        } else {
          console.log('⚠️ Service Worker not active - starting model loading anyway');
        }
        
        // Listen for service worker updates
        try {
          listenForServiceWorkerUpdates();
        } catch (swError) {
          console.warn('[INIT] Service worker listener failed (non-critical):', swError);
        }
        
        // Check for service worker updates immediately on app load
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
        
        // Initialize shortcuts (desktop/home screen icons) to show successful installation
        // Don't await - run in parallel
        initializeShortcuts().catch((error) => {
          // Shortcuts may already exist, log but don't block app initialization
          console.warn('Failed to initialize shortcuts:', error);
        });
        
        // Update progress: Checking encryption status
        setModelLoadingProgress(40, 'Checking encryption...', '');
        console.log('[INIT] Progress updated to 40%, checking encryption...');
        
        // Wait a tick for useAuth to initialize (if encryption is enabled)
        if (encryptionEnabled) {
          // Give useAuth's useEffect a chance to run and set auth state
          await new Promise(resolve => setTimeout(resolve, 100));
          console.log('[INIT] Encryption enabled, auth state:', { isAuthenticated: auth.isAuthenticated });
        } else {
          console.log('[INIT] Encryption not enabled');
        }
        
        // Check encryption status FIRST - before database initialization
        if (encryptionEnabled) {
          // Debug logging removed - was causing connection refused errors
          // Encryption is enabled - check if we need authentication
          if (!auth.isAuthenticated) {
            // Debug logging removed - was causing connection refused errors
            // No active session - user needs to login (which will unlock database)
            // Don't show separate unlock screen - login handles both
            console.log('[INIT] Encryption enabled but not authenticated - user needs to login');
            setModelLoadingProgress(100, 'Ready!', 'Please login to continue');
            // Small delay to ensure progress update is processed
            await new Promise(resolve => setTimeout(resolve, 50));
            // Don't proceed with normal initialization until logged in
            // authState will be set to 'login' in initializeWithTimeout after completion
            return;
          }
          
          // User is authenticated - continue with database initialization
          console.log('[INIT] User authenticated, proceeding with database initialization');
          // Session is valid - continue with normal flow using encrypted adapter
        } else {
          // Encryption not enabled - check for legacy data and migration prompt
          const migrationDismissed = localStorage.getItem('migration_prompt_dismissed') === 'true';
          if (!migrationDismissed) {
            detectLegacyData().then((legacyData) => {
              if (legacyData.hasLegacyData && isMounted) {
                setShowMigrationScreen(true);
              }
            }).catch(() => {
              // Ignore errors in legacy detection
            });
          }
        }
        
        // Update progress: Initializing database
        setModelLoadingProgress(50, 'Initializing database...', 'Loading user data');
        console.log('[INIT] Progress updated to 50%, initializing database...');
        
        // Get the appropriate database adapter (legacy or encrypted)
        let adapter;
        try {
          adapter = getDatabaseAdapter();
          console.log('[INIT] Database adapter obtained:', adapter.constructor.name);
        } catch (error) {
          console.error('[INIT] Failed to get database adapter:', error);
          throw error;
        }
        
        // Add timeout to database initialization (10 seconds max)
        console.log('[INIT] Starting database initialization with 10s timeout...');
        const dbInitPromise = adapter.init();
        const dbInitTimeout = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Database initialization timeout after 10 seconds')), 10000);
        });
        
        try {
          await Promise.race([dbInitPromise, dbInitTimeout]);
          console.log('[INIT] Database initialization completed successfully');
        } catch (error) {
          console.error('[INIT] Database initialization failed:', error);
          // Try one quick retry with shorter timeout (5 seconds)
          console.log('[INIT] Retrying database initialization...');
          try {
            await Promise.race([
              adapter.init(),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Database retry timeout')), 5000))
            ]);
            console.log('[INIT] Database initialization retry succeeded');
          } catch (retryError) {
            console.error('[INIT] Database retry failed:', retryError);
            // Don't throw - continue anyway, database might work later
            console.warn('[INIT] Continuing without database initialization - some features may be limited');
          }
        }
        
        // Update progress: Checking authentication
        setModelLoadingProgress(60, 'Checking authentication...', '');
        
        // Start AI model download in background AFTER service worker is ready
        // This ensures models can be cached by service worker
        // Don't block app initialization - allow user to create account immediately
        setModelLoadingProgress(40, 'Preparing AI models...', '');
        
        // Start model loading in background (already started earlier, but ensure it continues)
        // Don't await - let it run in background
        // User can create account and use app while models load
        
        // Cleanup expired tokens on startup
        dbService.cleanupExpiredTokens().catch(console.error);
        
        // Set up cleanup interval
        cleanupInterval = setInterval(() => {
          dbService.cleanupExpiredTokens().catch(console.error);
        }, 60 * 60 * 1000); // Every hour
        
        if (!isMounted) return;
        
        // Check for password reset link in URL hash
        // If present, show login screen even if user is logged in
        const hash = window.location.hash;
        const hasResetToken = hash.match(/^#reset\/(.+)$/);
        
        if (hasResetToken) {
          // Force login view for password reset
          setAuthState('login');
          return;
        }
        
        if (isLoggedIn()) {
          // Update progress: Loading user data (in parallel with AI models)
          setModelLoadingProgress(70, 'Loading user data...', 'AI models loading in background');
          console.log('[INIT] Progress updated to 70%, loading user data...');
          
          // Load user data in parallel with AI model loading - with timeout
          const userDataPromise = (async () => {
            try {
              console.log('[INIT] Getting current user...');
              const user = await Promise.race([
                getCurrentUser(),
                new Promise<any>((_, reject) => setTimeout(() => reject(new Error('getCurrentUser timeout')), 5000))
              ]);
              if (!isMounted || !user) {
                console.warn('[INIT] No user found or component unmounted');
                return null;
              }
              
              console.log('[INIT] User loaded:', user.id);
              setUserId(user.id);
              
              // Update progress: Loading app data
              setModelLoadingProgress(80, 'Loading app data...', 'AI models loading in background');
              console.log('[INIT] Progress updated to 80%, loading app data...');
              
              try {
                const adapter = getDatabaseAdapter();
                console.log('[INIT] Getting app data for user:', user.id);
                const appData = await Promise.race([
                  adapter.getAppData(user.id),
                  new Promise<any>((_, reject) => setTimeout(() => reject(new Error('getAppData timeout')), 5000))
                ]);
                if (!isMounted) {
                  console.warn('[INIT] Component unmounted during app data load');
                  return null;
                }
              
                if (appData) {
                  setSelectedValueIds(appData.values || []);
                  setLogs(appData.logs || []);
                  setGoals(appData.goals || []);
                  // Ensure settings.reminders.frequency exists (migration for old data)
                  const loadedSettings = appData.settings || { reminders: { enabled: false, frequency: 'daily', time: '09:00' } };
                  if (loadedSettings.reminders && !loadedSettings.reminders.frequency) {
                    loadedSettings.reminders.frequency = 'daily';
                  }
                  // Set default AI model if not set (LaMini for healthcare/psychology)
                  // Also migrate legacy 'tinyllama' setting to 'lamini'
                  if (!loadedSettings.aiModel || (loadedSettings.aiModel as any) === 'tinyllama') {
                    loadedSettings.aiModel = 'lamini';
                  }
                  setSettings(loadedSettings);
                  
                  // Initialize models with the selected model from settings (in background)
                  if (loadedSettings.aiModel) {
                    setSelectedModel(loadedSettings.aiModel);
                    initializeModels(false, loadedSettings.aiModel).catch(() => {
                      // Silently fail - models will retry later
                    });
                  }
                }
              } catch (appDataError) {
                console.error('[INIT] Failed to load app data:', appDataError);
                // Continue without app data - user can still use the app
              }
              
              return user;
            } catch (error) {
              console.error('[INIT] Error loading user data:', error);
              return null;
            }
          })();
          
          // Wait for user data to load (but don't block on AI models)
          const user = await userDataPromise;
          
          // Update progress: Complete (AI models may still be loading in background)
          setModelLoadingProgress(100, 'Ready!', 'AI models continue loading in background');
          
          // Check if terms are accepted
          if (user) {
            if (user.termsAccepted) {
              setAuthState('app');
            } else {
              setAuthState('terms');
            }
          } else {
            setAuthState('login');
          }
        } else {
          setModelLoadingProgress(100, 'Ready!', 'AI models loading in background');
          setAuthState('login');
        }
        
        // Don't await model loading - let it continue in background
        // Models will be ready when user needs them
        // Debug logging removed - was causing connection refused errors
      } catch (error) {
        // Debug logging removed - was causing connection refused errors
        console.error('Initialization error:', error);
        // Only show error for critical failures, not recoverable ones
        const errorMessage = error instanceof Error ? error.message : String(error);
        const isCriticalError = errorMessage.includes('Database initialization') && 
                                errorMessage.includes('timeout');
        
        if (isCriticalError) {
          // For critical errors, show warning but still proceed
          console.warn('⚠️ Non-critical initialization issue - proceeding to login');
          setModelLoadingProgress(100, 'Ready!', 'Some features may be limited');
        } else {
          // For other errors, show error briefly
          setProgressError('Initialization issue', 'Some features may be limited');
        }
        
        if (isMounted) {
          // Always proceed to login screen - let user try to use the app
          // But if encryption is enabled and not authenticated, show unlock screen
          if (encryptionEnabled && !auth.isAuthenticated) {
            setShowUnlockScreen(true);
          }
          setTimeout(() => {
            if (isMounted) {
              setAuthState('login');
            }
          }, isCriticalError ? 500 : 2000); // Shorter delay for non-critical errors
        }
      } finally {
        // Clear timeout if initialization completes
        if (initializationTimeout) {
          clearTimeout(initializationTimeout);
        }
      }
    };
    
    // Wrap initialize() to ensure it always completes
    const initializeWithTimeout = async () => {
      const initStartTime = Date.now();
      // Debug logging removed - was causing connection refused errors
      try {
        console.log('[INIT] Starting initialize() function...');
        await initialize();
        const duration = Date.now() - initStartTime;
        // Debug logging removed - was causing connection refused errors
        console.log(`[INIT] initialize() completed successfully in ${duration}ms`);
        // Mark initialization as complete
        setInitializationComplete(true);
        // Debug logging removed - was causing connection refused errors
        // CRITICAL: If encryption enabled but not authenticated, ensure authState is set to 'login'
        // This must happen AFTER setInitializationComplete to ensure state updates in correct order
        if (isMounted && encryptionEnabled && !auth.isAuthenticated) {
          console.log('[INIT] Encryption enabled but not authenticated - setting authState to login');
          setAuthState('login');
        }
        // Clear the timeout since we completed successfully
        if (initializationTimeout) {
          clearTimeout(initializationTimeout);
          initializationTimeout = null;
        }
      } catch (error) {
        const duration = Date.now() - initStartTime;
        console.error(`[INIT] initialize() failed after ${duration}ms:`, error);
        // Mark initialization as complete even on error (so we don't retry)
        setInitializationComplete(true);
        // Ensure we still proceed to login screen
        if (isMounted) {
          if (encryptionEnabled && !auth.isAuthenticated) {
            setShowUnlockScreen(true);
          }
          setAuthState('login');
        }
      } finally {
        // Don't reset started flag - keep it true to prevent re-initialization
        // Only reset when explicitly needed (e.g., after logout)
        // The completion flag will prevent re-initialization
      }
    };
    
    initializeWithTimeout();
    
    // Set up Tauri deep-link listener
    if (typeof window !== 'undefined' && '__TAURI__' in window) {
      import('@tauri-apps/plugin-deep-link').then(({ onOpenUrl, getCurrent }) => {
        if (!isMounted) return;
        
        // Handle deep links when app is already running
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
        
        // Handle deep links on initial app launch
        getCurrent().then((urls) => {
          if (!isMounted || !urls || urls.length === 0) return;
          
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
      // Debug logging removed - was causing connection refused errors
      isMounted = false;
      clearTimeout(quickTimeout);
      if (cleanupInterval) {
        clearInterval(cleanupInterval);
      }
      if (initializationTimeout) {
        clearTimeout(initializationTimeout);
      }
      // Don't reset the flags here - we want to prevent re-initialization even on unmount/remount
      // Only reset if we explicitly want to allow re-initialization (e.g., after logout)
    };
  }, []);

  // Save app data to database whenever it changes
  useEffect(() => {
    if (userId && authState === 'app') {
      const saveData = async () => {
        try {
          await dbService.saveAppData(userId, {
            settings,
            logs,
            goals,
            values: selectedValueIds,
            lcswConfig: settings.lcswConfig,
          });
        } catch (error) {
          console.error('Error saving app data:', error);
        }
      };
      
      // Debounce saves
      const timeoutId = setTimeout(saveData, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [userId, settings, logs, goals, selectedValueIds, authState]);

  // Preload AI models in the background - retry mechanism
  // Models start loading immediately in initialize() above
  // This effect handles retries when auth state changes
  useEffect(() => {
    if (authState === 'app') {
      // User is in the app - ensure models are ready
      // Models may already be loading from initialize(), but retry if needed
      const retryTimer = setTimeout(() => {
        preloadModels().catch(() => {
          // Silently fail - models may already be loading
        });
      }, 1000); // Short delay to avoid duplicate loads
      
      return () => clearTimeout(retryTimer);
    }
  }, [authState]);

  // Reminder Heartbeat - supports Hourly, Daily, Weekly, Monthly
  useEffect(() => {
    if (!settings.reminders.enabled) return;

    const checkReminders = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMin = now.getMinutes();
      const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;
      const today = now.toISOString().split('T')[0];
      const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
      const currentDate = now.getDate(); // 1-31

      if (!hasPermission()) return;

      // Get the top value (North Star) from selected values
      const topValue = selectedValueIds.length > 0 
        ? ALL_VALUES.find(v => v.id === selectedValueIds[0])?.name || 'your values'
        : 'your values';
      let shouldNotify = false;
      let notificationBody = "";

      // Ensure frequency has a valid default value
      const frequency = settings.reminders.frequency || 'daily';
      
      switch (frequency) {
        case 'hourly':
          // Hourly: 8 AM to 8 PM only, check every minute at :00
          if (currentHour >= 8 && currentHour < 20 && currentMin === 0 && settings.reminders.lastNotifiedHour !== currentHour) {
            shouldNotify = true;
            notificationBody = `💛 Hourly Pulse: Are your actions right now aligned with your North Star (${topValue})?`;
          }
          break;
        
        case 'daily':
          // Daily: At specified time (check within 1 minute window)
          const [targetHour, targetMin] = settings.reminders.time.split(':').map(Number);
          if (currentHour === targetHour && currentMin === targetMin && settings.reminders.lastNotifiedDay !== today) {
            shouldNotify = true;
            notificationBody = `💛 Time for your daily Grounded check-in. Your North Star is ${topValue}.`;
          }
          break;
        
        case 'weekly':
          // Weekly: On specified day at specified time
          const targetDay = settings.reminders.dayOfWeek ?? 0;
          const [weeklyHour, weeklyMin] = settings.reminders.time.split(':').map(Number);
          if (currentDay === targetDay && currentHour === weeklyHour && currentMin === weeklyMin && settings.reminders.lastNotifiedWeek !== today) {
            shouldNotify = true;
            notificationBody = `💛 Weekly Reflection: Time to check in with your North Star (${topValue}).`;
          }
          break;
        
        case 'monthly':
          // Monthly: On specified day of month at specified time
          const targetDate = settings.reminders.dayOfMonth ?? 1;
          const [monthlyHour, monthlyMin] = settings.reminders.time.split(':').map(Number);
          if (currentDate === targetDate && currentHour === monthlyHour && currentMin === monthlyMin && settings.reminders.lastNotifiedMonth !== today) {
            shouldNotify = true;
            notificationBody = `💛 Monthly Reflection: Time to reflect on your North Star (${topValue}).`;
          }
          break;
        
        default:
          // Fallback to daily if frequency is invalid or undefined
          const [defaultHour, defaultMin] = settings.reminders.time.split(':').map(Number);
          if (currentHour === defaultHour && currentMin === defaultMin && settings.reminders.lastNotifiedDay !== today) {
            shouldNotify = true;
            notificationBody = `💛 Time for your daily Grounded check-in. Your North Star is ${topValue}.`;
          }
          break;
      }

      if (shouldNotify) {
        // Send notification using abstraction
        sendNotification('Grounded', {
          body: notificationBody,
          icon: '/favicon.ico'
        }).catch(err => {
          console.error('Failed to send notification:', err);
        });
        
        // Ntfy.sh push notification (if enabled)
        if (settings.reminders.useNtfyPush && settings.reminders.ntfyTopic) {
          import('./services/ntfyService').then(({ sendNtfyNotification }) => {
            sendNtfyNotification(
              notificationBody,
              'Grounded Reminder',
              {
                topic: settings.reminders.ntfyTopic,
                server: settings.reminders.ntfyServer
              }
            ).catch(err => {
              console.error('Failed to send ntfy notification:', err);
            });
          });
        }
        
        // Calendar event (if enabled)
        if (settings.reminders.useDeviceCalendar && frequency !== 'hourly') {
          const [hours, minutes] = settings.reminders.time.split(':').map(Number);
          const eventDate = new Date();
          eventDate.setHours(hours, minutes, 0, 0);
          
          // Create calendar event URL
          const calendarTitle = encodeURIComponent(`Grounded ${frequency.charAt(0).toUpperCase() + frequency.slice(1)} Check-in`);
          const calendarDescription = encodeURIComponent(notificationBody);
          const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${calendarTitle}&details=${calendarDescription}&dates=${eventDate.toISOString().replace(/[-:]|\.\d{3}/g, '')}/${new Date(eventDate.getTime() + 30 * 60 * 1000).toISOString().replace(/[-:]|\.\d{3}/g, '')}`;
          
          // Only open if we haven't created an event for this reminder yet
          if (!settings.reminders.calendarEventId) {
            window.open(googleCalendarUrl, '_blank');
            setSettings(prev => ({
              ...prev,
              reminders: { ...prev.reminders, calendarEventId: Date.now().toString() }
            }));
          }
        }
        
        // Update last notified timestamp to prevent duplicates
        const updateData: Partial<AppSettings['reminders']> = {};
        if (frequency === 'hourly') {
          updateData.lastNotifiedHour = currentHour;
        } else if (frequency === 'daily') {
          updateData.lastNotifiedDay = today;
        } else if (frequency === 'weekly') {
          updateData.lastNotifiedWeek = today;
        } else if (frequency === 'monthly') {
          updateData.lastNotifiedMonth = today;
        }
        
        setSettings(prev => ({
          ...prev,
          reminders: { 
            ...prev.reminders,
            ...updateData
          }
        }));
      }
    };

    // Check every minute for accurate timing (especially for hourly reminders)
    const interval = setInterval(checkReminders, 60000); // Check every minute
    checkReminders(); // Check immediately on mount/enable

    return () => clearInterval(interval);
  }, [settings.reminders, selectedValueIds]);

  // Determine initial view based on data
  useEffect(() => {
    if (authState === 'app' && selectedValueIds.length > 0 && view === 'onboarding') {
      setView('home');
    }
  }, [selectedValueIds, view, authState]);

  const handleLogin = async (loggedInUserId: string) => {
    try {
      console.log('[LOGIN] handleLogin called with userId:', loggedInUserId);
      setUserId(loggedInUserId);
      
      // Reset initialization flags to allow app to continue after login
      setInitializationComplete(false);
      setInitializationStarted(false);
      
      // Add timeout to prevent hanging
      const userDataPromise = getCurrentUser();
      const userDataTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('getCurrentUser timeout')), 5000);
      });
      
      const user = await Promise.race([userDataPromise, userDataTimeout]) as any;
      console.log('[LOGIN] User data loaded:', user ? 'found' : 'not found');
      
      if (user) {
        if (user.termsAccepted) {
          // Load app data with timeout
          try {
            console.log('[LOGIN] Loading app data...');
            const adapter = getDatabaseAdapter();
            console.log('[LOGIN] Database adapter:', adapter.constructor.name);
            
            // Initialize adapter if needed
            await adapter.init();
            
            const appDataPromise = adapter.getAppData(loggedInUserId);
            const appDataTimeout = new Promise((_, reject) => {
              setTimeout(() => reject(new Error('getAppData timeout')), 5000);
            });
            
            const appData = await Promise.race([appDataPromise, appDataTimeout]) as any;
            console.log('[LOGIN] App data loaded:', appData ? 'found' : 'not found');
            
            if (appData) {
              setSelectedValueIds(appData.values || []);
              setLogs(appData.logs || []);
              setGoals(appData.goals || []);
              // Ensure settings.reminders.frequency exists (migration for old data)
              const loadedSettings = appData.settings || { reminders: { enabled: false, frequency: 'daily', time: '09:00' } };
              if (loadedSettings.reminders && !loadedSettings.reminders.frequency) {
                loadedSettings.reminders.frequency = 'daily';
              }
              setSettings(loadedSettings);
            } else {
              console.log('[LOGIN] No app data found - using defaults');
            }
          } catch (appDataError) {
            console.error('[LOGIN] Failed to load app data after login:', appDataError);
            // Continue anyway - user can still use the app with default data
          }
          console.log('[LOGIN] Setting authState to app');
          setAuthState('app');
        } else {
          console.log('[LOGIN] User has not accepted terms - showing terms screen');
          setAuthState('terms');
        }
      } else {
        console.error('[LOGIN] No user found after login');
        setAuthState('login');
      }
    } catch (error) {
      console.error('[LOGIN] Error in handleLogin:', error);
      // On error, stay on login screen
      setAuthState('login');
    }
  };

  const handleAcceptTerms = async () => {
    if (userId) {
      await acceptTerms(userId);
      setAuthState('app');
      // Navigate to settings (vault) after terms acceptance
      setView('vault');
      
      // User has committed to using the app - ensure models are loading
      // This is a good time to start/retry model loading if not already started
      preloadModels().catch((error) => {
        // Models may already be loading or will retry, but log for debugging
        console.warn('AI model preload retry failed:', error);
      });
    }
  };

  const handleDeclineTerms = () => {
    logoutUser();
    setAuthState('login');
    setUserId(null);
  };

  const handleLogout = () => {
    logoutUser();
    setAuthState('login');
    setUserId(null);
    setSelectedValueIds([]);
    setLogs([]);
    setGoals([]);
    setSettings({ reminders: { enabled: false, frequency: 'daily', time: '09:00' } });
    setView('onboarding');
  };

  const handleSelectionComplete = (ids: string[]) => {
    setSelectedValueIds(ids);
    setView('home');
  };

  const handleLogEntry = (entry: LogEntry) => {
    setLogs(prev => [entry, ...prev]);
  };

  const handleUpdateGoals = (updatedGoals: Goal[]) => {
    setGoals(updatedGoals);
  };

  const handleUpdateGoalProgress = (goalId: string, update: GoalUpdate) => {
    setGoals(prevGoals => 
      prevGoals.map(goal => 
        goal.id === goalId 
          ? { ...goal, updates: [...goal.updates, update] }
          : goal
      )
    );
  };

  const handleClearData = () => {
    setLogs([]);
    setSelectedValueIds([]);
    setGoals([]);
    setSettings({ reminders: { enabled: false, frequency: 'daily', time: '09:00' } });
    setView('onboarding');
  };

  const selectedValues = selectedValueIds
    .map(id => ALL_VALUES.find(v => v.id === id))
    .filter(Boolean) as ValueItem[];

  const showNav = selectedValueIds.length > 0 && view !== 'onboarding';

  // Progress state for loading screen
  const [progressState, setProgressState] = useState({ progress: 0, status: 'idle' as const, label: 'Initializing...', details: '' });
  
  // Subscribe to progress updates
  useEffect(() => {
    let isFirstCallback = true;
    const unsubscribe = subscribeToProgress((state) => {
      // On first callback, only skip if it's truly empty (no progress, no label)
      // Otherwise, always update to show real progress
      if (isFirstCallback && state.status === 'idle' && !state.label && state.progress === 0) {
        isFirstCallback = false;
        return; // Preserve initial "Initializing..." state only if nothing has happened yet
      }
      isFirstCallback = false;
      const transformedStatus = state.status === 'idle' ? 'loading' : state.status;
      
      // Prevent infinite updates by checking if state actually changed
      setProgressState(prevState => {
        // Only update if something actually changed
        if (prevState.progress === state.progress && 
            prevState.label === (state.label || 'Loading...') && 
            prevState.status === transformedStatus &&
            prevState.details === (state.details || '')) {
          return prevState; // No change, return previous state
        }
        
        console.log('[PROGRESS] Updating progress state:', { progress: state.progress, label: state.label, status: transformedStatus });
        return {
          progress: state.progress,
          status: transformedStatus,
          label: state.label || 'Loading...',
          details: state.details || '',
        };
      });
    });
    
    // Immediately trigger an initial progress update to ensure UI shows something
    setModelLoadingProgress(0, 'Initializing...', 'Starting app');
    
    return unsubscribe;
  }, []);
  
  // If encryption is enabled but not authenticated, login screen will handle unlock
  // No separate unlock screen needed - login combines both steps
  
  // Safety timeout: If stuck in 'checking' state for too long, force transition to login
  useEffect(() => {
    if (authState === 'checking') {
      const safetyTimeout = setTimeout(() => {
        console.warn('[SAFETY] App stuck in checking state for 10 seconds - forcing login screen');
        setAuthState('login');
      }, 20000); // 20 second safety timeout
      
      return () => clearTimeout(safetyTimeout);
    }
  }, [authState]);

  // Show loading state while checking auth
  if (authState === 'checking') {
    
    // If encryption is enabled but not authenticated, login screen will handle unlock
    // No separate unlock screen needed - login combines both steps
    
    return (
      <div className="min-h-screen bg-bg-primary dark:bg-dark-bg-primary flex items-center justify-center p-4">
        <div className="text-center space-y-6 w-full max-w-md">
          <img 
            src="/ac-minds-logo.png" 
            alt="AC MINDS" 
            className="w-20 h-20 object-contain mx-auto"
            onError={(e) => {
              // Hide image if it fails to load
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="space-y-4">
            <h2 className="text-xl font-black text-text-primary dark:text-white">
              {progressState.label || 'Initializing...'}
            </h2>
            {progressState.details && (
              <p className="text-sm text-text-secondary dark:text-text-secondary">
                {progressState.details}
              </p>
            )}
            <ProgressBar
              progress={progressState.progress}
              status={progressState.status}
              showPercentage={true}
              height="lg"
              className="mt-4"
            />
            {progressState.status === 'error' && (
              <button
                onClick={() => setAuthState('login')}
                className="mt-4 px-4 py-2 bg-yellow-warm text-text-primary rounded-lg font-black uppercase tracking-widest text-xs hover:opacity-90 transition-all"
              >
                Continue to Login
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show login screen (but allow unlock screen overlay on top if needed)
  if (authState === 'login') {
    return (
      <>
        <Login onLogin={handleLogin} />
      </>
    );
  }

  // Show terms acceptance
  if (authState === 'terms') {
    return <TermsAcceptance onAccept={handleAcceptTerms} onDecline={handleDeclineTerms} />;
  }
  
  // Safety check: if we somehow get here without a valid authState, show login
  if (!['checking', 'login', 'terms', 'app'].includes(authState)) {
    return (
      <div className="min-h-screen bg-bg-primary dark:bg-dark-bg-primary flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid State</h1>
          <p className="mb-4">AuthState: {String(authState)}</p>
          <button onClick={() => setAuthState('login')} className="px-4 py-2 bg-blue-500 text-white rounded">
            Go to Login
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-bg-primary dark:bg-dark-bg-primary text-text-primary dark:text-white flex flex-col transition-colors duration-300">
        <header className="bg-white dark:bg-dark-bg-primary border-b border-border-soft dark:border-dark-border sticky top-0 z-40 shadow-sm dark:shadow-lg">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img 
              src="/ac-minds-logo.png" 
              alt="AC MINDS" 
              className="w-7 h-7 object-contain"
            />
            <span className="font-bold text-base sm:text-lg tracking-tight text-text-primary dark:text-white hidden sm:inline">Grounded</span>
            {/* AI Status Indicator */}
            {authState === 'app' && aiStatusText && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                aiStatusText === 'AI Ready' 
                  ? 'bg-green-500/20 dark:bg-green-500/30 text-green-600 dark:text-green-400 border-green-500/30'
                  : 'bg-yellow-warm/20 dark:bg-yellow-warm/30 text-yellow-warm dark:text-yellow-warm border-yellow-warm/30'
              }`}>
                {aiStatusText}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            {/* Top navigation kept for desktop, bottom nav for mobile */}
            {showNav && (
              <nav className="hidden lg:flex items-center space-x-0.5 sm:space-x-1">
                <button 
                  onClick={() => {
                    setView('home');
                    // Reset dashboard state when navigating to home
                    if ((window as any).__dashboardReset) {
                      (window as any).__dashboardReset();
                    }
                    // Scroll to top when navigating to home
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-colors ${view === 'home' ? 'bg-yellow-warm/20 dark:bg-yellow-warm/30 text-yellow-warm dark:text-yellow-warm' : 'text-text-secondary dark:text-text-secondary hover:text-text-primary dark:hover:text-white hover:bg-bg-secondary dark:hover:bg-dark-bg-secondary'}`}
                >
                  <span className="hidden sm:inline">Home</span>
                  <span className="sm:hidden">H</span>
                </button>
                <button 
                  onClick={() => setView('values')}
                  className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-colors ${view === 'values' ? 'bg-yellow-warm/20 dark:bg-yellow-warm/30 text-yellow-warm dark:text-yellow-warm' : 'text-text-secondary dark:text-text-secondary hover:text-text-primary dark:hover:text-white hover:bg-bg-secondary dark:hover:bg-dark-bg-secondary'}`}
                >
                  <span className="hidden sm:inline">Values</span>
                  <span className="sm:hidden">V</span>
                </button>
                <button 
                  onClick={() => setView('goals')}
                  className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-colors ${view === 'goals' ? 'bg-yellow-warm/20 dark:bg-yellow-warm/30 text-yellow-warm dark:text-yellow-warm' : 'text-text-secondary dark:text-text-secondary hover:text-text-primary dark:hover:text-white hover:bg-bg-secondary dark:hover:bg-dark-bg-secondary'}`}
                >
                  <span className="hidden sm:inline">Goals</span>
                  <span className="sm:hidden">G</span>
                </button>
                <button 
                  onClick={() => setView('report')}
                  className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-colors ${view === 'report' ? 'bg-yellow-warm/20 dark:bg-yellow-warm/30 text-yellow-warm dark:text-yellow-warm' : 'text-text-secondary dark:text-text-secondary hover:text-text-primary dark:hover:text-white hover:bg-bg-secondary dark:hover:bg-dark-bg-secondary'}`}
                >
                  <span className="hidden sm:inline">Reports</span>
                  <span className="sm:hidden">R</span>
                </button>
                <button 
                  onClick={() => setView('vault')}
                  className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-colors ${view === 'vault' ? 'bg-yellow-warm/20 dark:bg-yellow-warm/30 text-yellow-warm dark:text-yellow-warm' : 'text-text-secondary dark:text-text-secondary hover:text-text-primary dark:hover:text-white hover:bg-bg-secondary dark:hover:bg-dark-bg-secondary'}`}
                >
                  <span className="hidden sm:inline">Vault</span>
                  <span className="sm:hidden">V</span>
                </button>
              </nav>
            )}
            {showNav && (
              <button 
                onClick={() => setShowLCSWConfig(true)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-text-secondary dark:text-text-secondary hover:text-yellow-warm dark:hover:text-yellow-warm hover:bg-yellow-warm/10 dark:hover:bg-yellow-warm/20 transition-all"
                aria-label="Configuration"
                title="Configuration"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </button>
            )}
            <ThemeToggle />
            <button 
              onClick={() => setShowHelp(true)}
              className="w-8 h-8 flex items-center justify-center rounded-full text-text-secondary dark:text-text-secondary hover:text-yellow-warm dark:hover:text-yellow-warm hover:bg-yellow-warm/10 dark:hover:bg-yellow-warm/20 transition-all"
              aria-label="Help"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>
            <button 
              onClick={handleLogout}
              className="w-8 h-8 flex items-center justify-center rounded-full text-text-secondary dark:text-text-secondary hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
              aria-label="Logout"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-4xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-24 lg:pb-6">
        {view === 'onboarding' && (
          <ValueSelection 
            initialSelected={selectedValueIds} 
            onComplete={handleSelectionComplete} 
          />
        )}
        
        {view === 'values' && (
          <ValueSelection 
            initialSelected={selectedValueIds} 
            onComplete={handleSelectionComplete} 
            onAddGoal={(valueId) => {
              // Navigate to home and open the value card for goal creation
              setInitialValueIdForGoal(valueId);
              setView('home');
            }}
            goals={goals}
          />
        )}
        
        {view === 'home' && (
          <Suspense fallback={<SkeletonCard lines={5} showHeader={true} />}>
            <Dashboard 
              values={selectedValues} 
              onLog={handleLogEntry}
              goals={goals}
              onUpdateGoals={handleUpdateGoals}
              logs={logs}
              lcswConfig={settings.lcswConfig}
              onNavigate={(view) => {
                setView(view);
                // Clear initialValueId when navigating away from home
                if (view !== 'home') {
                  setInitialValueIdForGoal(null);
                }
              }}
              initialValueId={initialValueIdForGoal}
            />
          </Suspense>
        )}

        {view === 'report' && (
          <Suspense fallback={<SkeletonCard lines={5} showHeader={true} />}>
            <ReportView 
              logs={logs} 
              values={selectedValues} 
              lcswConfig={settings.lcswConfig}
            />
          </Suspense>
        )}

        {view === 'vault' && (
          <Suspense fallback={<SkeletonCard lines={5} showHeader={true} />}>
            <VaultControl
              logs={logs}
              goals={goals}
              settings={settings}
              onUpdateSettings={setSettings}
              onClearData={handleClearData}
              selectedValueIds={selectedValueIds}
            />
          </Suspense>
        )}

        {view === 'goals' && (
          <Suspense fallback={<SkeletonCard lines={5} showHeader={true} />}>
            <GoalsUpdateView
              goals={goals}
              values={selectedValues}
              lcswConfig={settings.lcswConfig}
              onUpdateGoal={handleUpdateGoalProgress}
              onCompleteGoal={(goal) => {
                const completedGoal = { ...goal, completed: true };
                handleLogEntry({
                  id: Date.now().toString() + "-done",
                  date: new Date().toISOString(),
                  valueId: goal.valueId,
                  livedIt: true,
                  note: `Achieved Commitment: ${goal.text.substring(0, 40)}...`,
                  type: 'goal-completion',
                  goalText: goal.text
                });
                handleUpdateGoals(goals.map(g => g.id === goal.id ? completedGoal : g));
              }}
              onDeleteGoal={(goalId) => handleUpdateGoals(goals.filter(g => g.id !== goalId))}
              onEditGoal={(goalId, newText) => handleUpdateGoals(goals.map(g => g.id === goalId ? { ...g, text: newText } : g))}
            />
          </Suspense>
        )}
      </main>

      {/* Bottom Navigation - Mobile First */}
      {showNav && (
        <BottomNavigation
          currentView={view}
          onViewChange={(newView) => setView(newView)}
        />
      )}

      {showHelp && <HelpOverlay onClose={() => setShowHelp(false)} />}


      {/* Encryption Migration Screen (OPT-IN, dismissible) */}
      {showMigrationScreen && (
        <MigrationScreen
          onClose={() => {
            setShowMigrationScreen(false);
            localStorage.setItem('migration_prompt_dismissed', 'true');
          }}
          onComplete={() => {
            setShowMigrationScreen(false);
            window.location.reload();
          }}
        />
      )}


      <PWAInstallPrompt />

      {/* Feedback Button - Always accessible when user is in the app */}
      {authState === 'app' && <FeedbackButton />}

      {showLCSWConfig && (
        <Suspense fallback={<SkeletonCard lines={5} showHeader={true} />}>
          <LCSWConfigComponent
            config={settings.lcswConfig}
            onUpdate={(config) => setSettings({ ...settings, lcswConfig: config })}
            onClose={() => setShowLCSWConfig(false)}
            settings={settings}
            onUpdateSettings={setSettings}
          />
        </Suspense>
      )}

        <footer className="py-4 text-center text-text-tertiary dark:text-text-tertiary text-xs sm:text-sm font-medium tracking-wide">
          <p>Private & Secure. All AI processing happens on your device.</p>
        </footer>
      </div>
    </ErrorBoundary>
  );
  
  // Final safety net - should never reach here, but if we do, show something
  return (
    <div style={{ padding: '20px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', backgroundColor: '#f0f0f0' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>App Render Error</h1>
      <p style={{ marginBottom: '16px' }}>The app component reached the end without returning a valid component.</p>
      <p style={{ marginBottom: '16px', fontSize: '12px', color: '#666' }}>authState: {String(authState)}</p>
      <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
        Reload
      </button>
    </div>
  );
};

export default App;