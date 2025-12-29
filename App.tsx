
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
import { preloadModels, initializeModels, setSelectedModel } from './services/aiService';
import { dbService } from './services/database';
import { isLoggedIn, getCurrentUser, acceptTerms, logoutUser } from './services/authService';
import { getItemSync, setItemSync } from './services/storage';
import { hasPermission, sendNotification } from './services/notifications';
import { initializeDebugLogging } from './services/debugLog';
import { subscribeToProgress, setModelLoadingProgress, setProgressSuccess, setProgressError } from './services/progressTracker';
import ProgressBar from './components/ProgressBar';
import { initializeShortcuts } from './utils/createShortcut';
import { ensureServiceWorkerActive, listenForServiceWorkerUpdates } from './utils/serviceWorker';

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

  // Initialize database and check auth state
  useEffect(() => {
    let isMounted = true; // Prevent state updates if component unmounts
    let cleanupInterval: NodeJS.Timeout | null = null;
    let initializationTimeout: NodeJS.Timeout | null = null;
    
    // Set a timeout to prevent infinite hanging (30 seconds max)
    initializationTimeout = setTimeout(() => {
      if (isMounted && authState === 'checking') {
        console.error('⚠️ Initialization timeout - proceeding to login screen');
        setAuthState('login');
      }
    }, 30000);
    
    const initialize = async () => {
      try {
        // Update progress: Starting initialization
        setModelLoadingProgress(10, 'Initializing app...', 'Setting up core services');
        
        // Initialize debug logging first
        initializeDebugLogging();
        
        // Update progress: Checking for updates
        setModelLoadingProgress(20, 'Checking for updates...', '');
        
        // Initialize update manager to detect new install vs update
        const { updateManager } = await import('./services/updateManager');
        const updateInfo = await updateManager.initialize();
        
        if (updateInfo.isNewInstall) {
          console.log('🎉 New installation detected - setting up fresh app');
        } else if (updateInfo.isUpdate) {
          console.log(`🔄 App updated from v${updateInfo.previousVersion} to v${updateInfo.currentVersion}`);
          console.log('✅ User data preserved - database migrations applied');
        }
        
        // Update progress: Setting up service worker
        setModelLoadingProgress(30, 'Setting up service worker...', '');
        
        // Ensure service worker is active (critical for PWA, offline, and AI model caching)
        ensureServiceWorkerActive().then((active) => {
          if (active) {
            console.log('✅ Service Worker verified active - PWA features enabled');
          } else {
            console.warn('⚠️ Service Worker not active - some features may be limited');
          }
        }).catch((error) => {
          console.warn('⚠️ Service Worker check failed:', error);
        });
        
        // Listen for service worker updates
        listenForServiceWorkerUpdates();
        
        // Initialize shortcuts (desktop/home screen icons) to show successful installation
        initializeShortcuts().catch((error) => {
          // Shortcuts may already exist, log but don't block app initialization
          console.warn('Failed to initialize shortcuts:', error);
        });
        
        // Update progress: Initializing database
        setModelLoadingProgress(40, 'Initializing database...', 'Loading user data');
        
        // Initialize database first (needed for user data)
        // Add timeout wrapper to prevent hanging, but handle gracefully
        try {
          const dbInitPromise = dbService.init();
          const dbTimeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database initialization timeout')), 15000)
          );
          await Promise.race([dbInitPromise, dbTimeoutPromise]);
        } catch (dbError) {
          // Database initialization failed - log but don't block app
          console.warn('Database initialization warning:', dbError);
          // Try to continue - database may still be accessible
          // If it's truly broken, subsequent operations will fail gracefully
          try {
            // Quick retry with shorter timeout
            await Promise.race([
              dbService.init(),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Retry timeout')), 5000))
            ]);
          } catch (retryError) {
            console.warn('Database retry also failed, continuing anyway:', retryError);
            // Continue - user can still try to use the app
            // Database operations will fail gracefully later if needed
          }
        }
        
        // Update progress: Checking authentication
        setModelLoadingProgress(60, 'Checking authentication...', '');
        
        // Start AI model download immediately in background - don't wait for anything
        // This ensures models are downloading while user is reading terms/login
        // Service worker will cache models for offline use
        // On updates, models will be reloaded if needed (cached models are preserved)
        const modelLoadPromise = preloadModels().then((loaded) => {
          if (loaded) {
            console.log('✅ AI models loaded successfully - AI features enabled');
          } else {
            console.warn('⚠️ AI models not loaded - using rule-based responses');
          }
        }).catch((error) => {
          // Models will retry later, but log the error for debugging
          console.warn('AI model preload failed, will retry later:', error);
        });
        
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
          
          // Load user data in parallel with AI model loading
          const userDataPromise = (async () => {
            try {
              const user = await getCurrentUser();
              if (!isMounted || !user) return null;
              
              setUserId(user.id);
              
              // Update progress: Loading app data
              setModelLoadingProgress(80, 'Loading app data...', 'AI models loading in background');
              
              const appData = await dbService.getAppData(user.id);
              if (!isMounted) return null;
              
              if (appData) {
                setSelectedValueIds(appData.values || []);
                setLogs(appData.logs || []);
                setGoals(appData.goals || []);
                // Ensure settings.reminders.frequency exists (migration for old data)
                const loadedSettings = appData.settings || { reminders: { enabled: false, frequency: 'daily', time: '09:00' } };
                if (loadedSettings.reminders && !loadedSettings.reminders.frequency) {
                  loadedSettings.reminders.frequency = 'daily';
                }
                // Set default AI model if not set (TinyLlama for healthcare/psychology)
                if (!loadedSettings.aiModel) {
                  loadedSettings.aiModel = 'tinyllama';
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
              
              return user;
            } catch (error) {
              console.error('Error loading user data:', error);
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
      } catch (error) {
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
    
    initialize();
    
    return () => {
      isMounted = false;
      if (cleanupInterval) {
        clearInterval(cleanupInterval);
      }
      if (initializationTimeout) {
        clearTimeout(initializationTimeout);
      }
    };
    
    // Listen for deep links in Tauri (when app is already running)
    if (typeof window !== 'undefined' && '__TAURI__' in window) {
      // Dynamically import Tauri deep-link plugin
      import('@tauri-apps/plugin-deep-link').then(({ onOpenUrl, getCurrent }) => {
        // Handle deep links when app is already running
        onOpenUrl((urls) => {
          for (const url of urls) {
            try {
              const urlObj = new URL(url);
              if (urlObj.protocol === 'tauri:' && urlObj.hostname === 'localhost') {
                // Extract hash from URL
                const hash = urlObj.hash || '';
                if (hash.startsWith('#reset/')) {
                  // Update window hash and trigger hashchange
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
          if (urls && urls.length > 0) {
            for (const url of urls) {
              try {
                const urlObj = new URL(url);
                if (urlObj.protocol === 'tauri:' && urlObj.hostname === 'localhost') {
                  // Extract hash from URL
                  const hash = urlObj.hash || '';
                  if (hash.startsWith('#reset/')) {
                    // Update window hash and trigger hashchange
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
          }
        }).catch(() => {
          // No deep links on launch
        });
      }).catch(() => {
        // Deep-link plugin not available, fallback to hash change listener
        console.warn('Deep-link plugin not available');
      });
    }
    
    return () => {
      isMounted = false;
      if (cleanupInterval) {
        clearInterval(cleanupInterval);
      }
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
    setUserId(loggedInUserId);
    const user = await getCurrentUser();
    if (user) {
      if (user.termsAccepted) {
        // Load app data
        const appData = await dbService.getAppData(loggedInUserId);
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
        }
        setAuthState('app');
      } else {
        setAuthState('terms');
      }
    }
  };

  const handleAcceptTerms = async () => {
    if (userId) {
      await acceptTerms(userId);
      setAuthState('app');
      
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
      // Skip transformation on first callback if it's idle with empty label (preserve initial "Initializing..." state)
      if (isFirstCallback && state.status === 'idle' && !state.label) {
        isFirstCallback = false;
        return; // Preserve initial state
      }
      isFirstCallback = false;
      const transformedStatus = state.status === 'idle' ? 'loading' : state.status;
      setProgressState({
        progress: state.progress,
        status: transformedStatus,
        label: state.label || 'Loading...',
        details: state.details || '',
      });
    });
    return unsubscribe;
  }, []);

  // Show loading state while checking auth
  if (authState === 'checking') {
    return (
      <div className="min-h-screen bg-bg-primary dark:bg-dark-bg-primary flex items-center justify-center p-4">
        <div className="text-center space-y-6 w-full max-w-md">
          <img 
            src="/ac-minds-logo.png" 
            alt="AC MINDS" 
            className="w-20 h-20 object-contain mx-auto"
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

  // Show login screen
  if (authState === 'login') {
    return <Login onLogin={handleLogin} />;
  }

  // Show terms acceptance
  if (authState === 'terms') {
    return <TermsAcceptance onAccept={handleAcceptTerms} onDecline={handleDeclineTerms} />;
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
              onNavigate={(view) => setView(view)}
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
};

export default App;