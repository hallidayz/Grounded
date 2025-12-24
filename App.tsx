
import React, { useState, useEffect } from 'react';
import { ALL_VALUES } from './constants';
import { ValueItem, LogEntry, Goal, AppSettings, LCSWConfig } from './types';
import ValueSelection from './components/ValueSelection';
import Dashboard from './components/Dashboard';
import ReportView from './components/ReportView';
import VaultControl from './components/VaultControl';
import HelpOverlay from './components/HelpOverlay';
import LCSWConfigComponent from './components/LCSWConfig';
import ThemeToggle from './components/ThemeToggle';
import Login from './components/Login';
import TermsAcceptance from './components/TermsAcceptance';
import BottomNavigation from './components/BottomNavigation';
import { preloadModels } from './services/aiService';
import { dbService } from './services/database';
import { isLoggedIn, getCurrentUser, acceptTerms, logoutUser } from './services/authService';

// Simple persistence helper
const useLocalStorage = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
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
  const [view, setView] = useState<'onboarding' | 'home' | 'report' | 'values' | 'vault'>('onboarding');
  const [showHelp, setShowHelp] = useState(false);
  const [showLCSWConfig, setShowLCSWConfig] = useState(false);

  // Initialize database and check auth state
  useEffect(() => {
    let isMounted = true; // Prevent state updates if component unmounts
    let cleanupInterval: NodeJS.Timeout | null = null;
    
    const initialize = async () => {
      try {
        await dbService.init();
        
        // Cleanup expired tokens on startup
        dbService.cleanupExpiredTokens().catch(console.error);
        
        // Set up cleanup interval
        cleanupInterval = setInterval(() => {
          dbService.cleanupExpiredTokens().catch(console.error);
        }, 60 * 60 * 1000); // Every hour
        
        if (!isMounted) return;
        
        if (isLoggedIn()) {
          const user = await getCurrentUser();
          if (!isMounted) return;
          
          if (user) {
            setUserId(user.id);
            
            // Load app data from database
            const appData = await dbService.getAppData(user.id);
            if (!isMounted) return;
            
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
            
            // Check if terms are accepted
            if (user.termsAccepted) {
              setAuthState('app');
            } else {
              setAuthState('terms');
            }
          } else {
            setAuthState('login');
          }
        } else {
          setAuthState('login');
        }
      } catch (error) {
        console.error('Initialization error:', error);
        if (isMounted) {
          setAuthState('login');
        }
      }
    };
    
    initialize();
    
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

  // Preload AI models in the background - start as early as possible
  // Don't wait for auth, start loading immediately for better UX
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 5000; // 5 seconds between retries
    let isMounted = true;
    
    const loadModels = async (attempt: number = 1) => {
      if (!isMounted) return;
      
      // Only log on first attempt to reduce console noise
      if (attempt === 1) {
        console.log('🚀 Loading AI models in background...');
      }
      
      const success = await preloadModels();
      
      if (!isMounted) return;
      
      if (!success && attempt <= maxRetries) {
        // Silently retry without logging each attempt
        setTimeout(() => {
          if (isMounted) {
            loadModels(attempt + 1);
          }
        }, retryDelay);
      } else if (!success) {
        // Only log once at the end if all retries failed
        console.info('ℹ️ AI models unavailable. App is fully functional with rule-based responses.');
      } else {
        console.log('✅ AI models ready!');
      }
    };
    
    // Start loading immediately when component mounts
    // Don't wait for auth - models can load in parallel
    loadModels();
    
    // Also try again when user logs in (in case network was unavailable)
    if (authState === 'app') {
      // Models may already be loading, but ensure they're ready
      setTimeout(() => {
        if (isMounted) {
          preloadModels().catch(() => {
            console.warn('Model preload retry on login failed');
          });
        }
      }, 2000);
    }
    
    return () => {
      isMounted = false;
    };
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

      if (Notification.permission !== 'granted') return;

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
        // Browser notification
        new Notification('Grounded', {
          body: notificationBody,
          icon: '/favicon.ico'
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

  // Show loading state while checking auth
  if (authState === 'checking') {
    return (
      <div className="min-h-screen bg-bg-primary dark:bg-dark-bg-primary flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-navy-primary dark:bg-yellow-warm rounded-xl flex items-center justify-center text-white dark:text-navy-primary font-black text-2xl mx-auto animate-pulse">
            IC
          </div>
          <p className="text-text-secondary dark:text-text-secondary">Loading...</p>
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
    <div className="min-h-screen bg-bg-primary dark:bg-dark-bg-primary text-text-primary dark:text-white flex flex-col transition-colors duration-300">
      <header className="bg-white dark:bg-dark-bg-primary border-b border-border-soft dark:border-dark-border sticky top-0 z-40 shadow-sm dark:shadow-lg">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-navy-primary dark:bg-yellow-warm rounded-lg flex items-center justify-center text-white dark:text-navy-primary font-bold text-sm">
              IC
            </div>
            <span className="font-bold text-base sm:text-lg tracking-tight text-text-primary dark:text-white hidden sm:inline">Grounded</span>
          </div>
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            {/* Top navigation kept for desktop, bottom nav for mobile */}
            {showNav && (
              <nav className="hidden lg:flex items-center space-x-0.5 sm:space-x-1">
                <button 
                  onClick={() => setView('home')}
                  className={`px-2 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-colors ${view === 'home' ? 'bg-yellow-warm/20 dark:bg-yellow-warm/30 text-yellow-warm dark:text-yellow-warm' : 'text-text-secondary dark:text-text-secondary hover:text-text-primary dark:hover:text-white hover:bg-bg-secondary dark:hover:bg-dark-bg-secondary'}`}
                >
                  <span className="hidden sm:inline">Home</span>
                  <span className="sm:hidden">H</span>
                </button>
                <button 
                  onClick={() => setView('values')}
                  className={`px-2 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-colors ${view === 'values' ? 'bg-yellow-warm/20 dark:bg-yellow-warm/30 text-yellow-warm dark:text-yellow-warm' : 'text-text-secondary dark:text-text-secondary hover:text-text-primary dark:hover:text-white hover:bg-bg-secondary dark:hover:bg-dark-bg-secondary'}`}
                >
                  <span className="hidden sm:inline">Values</span>
                  <span className="sm:hidden">V</span>
                </button>
                <button 
                  onClick={() => setView('report')}
                  className={`px-2 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-colors ${view === 'report' ? 'bg-yellow-warm/20 dark:bg-yellow-warm/30 text-yellow-warm dark:text-yellow-warm' : 'text-text-secondary dark:text-text-secondary hover:text-text-primary dark:hover:text-white hover:bg-bg-secondary dark:hover:bg-dark-bg-secondary'}`}
                >
                  <span className="hidden sm:inline">Reports</span>
                  <span className="sm:hidden">R</span>
                </button>
                <button 
                  onClick={() => setView('vault')}
                  className={`px-2 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-colors ${view === 'vault' ? 'bg-yellow-warm/20 dark:bg-yellow-warm/30 text-yellow-warm dark:text-yellow-warm' : 'text-text-secondary dark:text-text-secondary hover:text-text-primary dark:hover:text-white hover:bg-bg-secondary dark:hover:bg-dark-bg-secondary'}`}
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
          <Dashboard 
            values={selectedValues} 
            onLog={handleLogEntry}
            goals={goals}
            onUpdateGoals={handleUpdateGoals}
            logs={logs}
            lcswConfig={settings.lcswConfig}
            onNavigate={(view) => setView(view)}
          />
        )}

        {view === 'report' && (
          <ReportView 
            logs={logs} 
            values={selectedValues} 
            lcswConfig={settings.lcswConfig}
          />
        )}

        {view === 'vault' && (
          <VaultControl
            logs={logs}
            goals={goals}
            settings={settings}
            onUpdateSettings={setSettings}
            onClearData={handleClearData}
            selectedValueIds={selectedValueIds}
          />
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

      {showLCSWConfig && (
        <LCSWConfigComponent
          config={settings.lcswConfig}
          onUpdate={(config) => setSettings({ ...settings, lcswConfig: config })}
          onClose={() => setShowLCSWConfig(false)}
          settings={settings}
          onUpdateSettings={setSettings}
        />
      )}

      <footer className="py-4 text-center text-text-tertiary dark:text-text-tertiary text-[10px] font-medium tracking-wide">
        <p>Private & Secure. All AI processing happens on your device.</p>
      </footer>
    </div>
  );
};

export default App;