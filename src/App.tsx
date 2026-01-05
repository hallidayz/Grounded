import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { ALL_VALUES } from './constants';
import { ValueItem, GoalUpdate } from './types';
import Login from './components/Login';
import TermsAcceptance from './components/TermsAcceptance';
import ErrorBoundary from './components/ErrorBoundary';
import HelpOverlay from './components/HelpOverlay';
import SkeletonCard from './components/SkeletonCard';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import FeedbackButton from './components/FeedbackButton';
import { MigrationScreen } from './components/MigrationScreen';
import { EmotionProvider } from './contexts/EmotionContext';
import { AuthProvider, useAuthContext } from './contexts/AuthContext';
import { DataProvider, useData } from './contexts/DataContext';
import { useAppInitialization, resetInitialization } from './hooks/useAppInitialization';
import { useModalManager } from './hooks/useModalManager';
import { useReminderSystem } from './hooks/useReminderSystem';
import { useAuth } from './hooks/useAuth';
import { useModelInstallationStatus } from './hooks/useModelInstallationStatus';
import { AppLayout } from './components/Layout/AppLayout';
import { AppRouter, ViewType } from './routes/AppRouter';
import { subscribeToProgress, setModelLoadingProgress } from './services/progressTracker';
import { logoutUser } from './services/authService';
import { preloadModels } from './services/aiService';

const LCSWConfigComponent = lazy(() => import('./components/LCSWConfig'));

// Export function to reset initialization (for logout, etc.)
export { resetInitialization };

const AppContent: React.FC = () => {
  const auth = useAuth();
  const authContext = useAuthContext();
  const { authState, userId, setAuthState, handleLogin, handleAcceptTerms, handleDeclineTerms, handleLogout } = authContext;
  const data = useData();
  const modals = useModalManager();
  const [view, setView] = useState<ViewType>('onboarding');
  const [initialValueIdForGoal, setInitialValueIdForGoal] = useState<string | null>(null);
  const [progressState, setProgressState] = useState({ progress: 0, status: 'idle' as const, label: 'Initializing...', details: '' });
  
  const { status: installationStatus, label: installationLabel, progress: installationProgress, displayText: aiStatusText } = useModelInstallationStatus();

  // Encryption check
  let encryptionEnabled: boolean;
  try {
    encryptionEnabled = localStorage.getItem('encryption_enabled') === 'true';
  } catch (error) {
    encryptionEnabled = false;
  }

  // Initialize app
  const initResult = useAppInitialization({
    encryptionEnabled,
    isAuthenticated: auth.isAuthenticated,
    onSetShowMigrationScreen: (show) => {
      if (show) modals.openMigration();
    },
  });

  // Track if we've synced data to prevent multiple syncs
  const hasSyncedDataRef = useRef<string | null>(null);

  // Sync initialization data with DataContext
  // This effect runs whenever initialization completes and we have a userId
  useEffect(() => {
    if (!initResult.loading && initResult.userId) {
      // Only sync once per userId to prevent overwriting
      if (hasSyncedDataRef.current !== initResult.userId) {
        // Always sync data, even if arrays are empty - this ensures DataContext has the latest state
        console.log('[SYNC] Syncing initialization data to DataContext', {
          userId: initResult.userId,
          values: initResult.selectedValueIds.length,
          logs: initResult.logs.length,
          goals: initResult.goals.length,
          hasSettings: !!initResult.settings,
          authState
        });
        
        // Use functional updates to ensure we're setting the exact values from initialization
        data.setSelectedValueIds(() => initResult.selectedValueIds);
        data.setLogs(() => initResult.logs);
        data.setGoals(() => initResult.goals);
        if (initResult.settings) {
          data.setSettings(() => initResult.settings);
        }
        
        hasSyncedDataRef.current = initResult.userId;
      }
    }
  }, [initResult.loading, initResult.userId, initResult.selectedValueIds, initResult.logs, initResult.goals, initResult.settings, authState, data]);

  // Update auth state based on initialization
  useEffect(() => {
    if (!initResult.loading) {
      if (initResult.hasResetToken) {
        setAuthState('login');
      } else if (initResult.userId) {
        // User data loaded - check terms
        // This will be handled by AuthContext after login
      } else if (encryptionEnabled && !auth.isAuthenticated) {
        setAuthState('login');
      } else if (!encryptionEnabled) {
        setAuthState('login');
      }
    }
  }, [initResult.loading, initResult.userId, initResult.hasResetToken, encryptionEnabled, auth.isAuthenticated, setAuthState]);

  // Subscribe to progress updates
  useEffect(() => {
    let isFirstCallback = true;
    const unsubscribe = subscribeToProgress((state) => {
      if (isFirstCallback && state.status === 'idle' && !state.label && state.progress === 0) {
        isFirstCallback = false;
        return;
      }
      isFirstCallback = false;
      const transformedStatus = state.status === 'idle' ? 'loading' : state.status;
      
      setProgressState(prevState => {
        if (prevState.progress === state.progress && 
            prevState.label === (state.label || 'Loading...') && 
            prevState.status === transformedStatus &&
            prevState.details === (state.details || '')) {
          return prevState;
        }
        
        return {
          progress: state.progress,
          status: transformedStatus,
          label: state.label || 'Loading...',
          details: state.details || '',
        };
      });
    });
    
    setModelLoadingProgress(0, 'Initializing...', 'Starting app');
    
    return unsubscribe;
  }, []);

  // Safety timeout for checking state
  useEffect(() => {
    if (authState === 'checking') {
      const safetyTimeout = setTimeout(() => {
        console.warn('[SAFETY] App stuck in checking state for 20 seconds - forcing login screen');
        setAuthState('login');
      }, 20000);
      
      return () => clearTimeout(safetyTimeout);
    }
  }, [authState, setAuthState]);

  // Auto-navigate to login after timeout
  useEffect(() => {
    if (authState === 'checking') {
      const timer = setTimeout(() => {
        setAuthState('login');
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [authState, setAuthState]);

  // Determine initial view based on data
  useEffect(() => {
    if (authState === 'app' && data.selectedValueIds.length > 0 && view === 'onboarding') {
      setView('home');
    }
  }, [data.selectedValueIds, view, authState]);

  // Reminder system
  useReminderSystem({
    settings: data.settings,
    selectedValueIds: data.selectedValueIds,
    onUpdateSettings: (updater) => {
      data.setSettings(updater(data.settings));
    },
  });

  // Preload AI models when in app
  useEffect(() => {
    if (authState === 'app') {
      const retryTimer = setTimeout(() => {
        preloadModels().catch(() => {
          // Silently fail - models may already be loading
        });
      }, 1000);
      
      return () => clearTimeout(retryTimer);
    }
  }, [authState]);

  // Handle login completion - sync data
  const handleLoginComplete = (loggedInUserId: string, appData: {
    values: string[];
    logs: any[];
    goals: any[];
    settings: any;
  }) => {
    data.setSelectedValueIds(appData.values);
    data.setLogs(appData.logs);
    data.setGoals(appData.goals);
    data.setSettings(appData.settings);
  };

  // Handle logout completion
  const handleLogoutComplete = () => {
    data.handleClearData();
    setView('onboarding');
    resetInitialization();
  };

  // Handle accept terms - navigate to vault
  const handleAcceptTermsWithNavigation = async () => {
    await handleAcceptTerms();
    setView('vault');
  };

  // Show loading state while checking auth
  if (authState === 'checking') {
    return (
      <div className="min-h-screen bg-bg-primary dark:bg-dark-bg-primary flex items-center justify-center p-4">
        <div className="text-center space-y-6 w-full max-w-md">
          <img 
            src="/ac-minds-logo.png" 
            alt="AC MINDS" 
            className="w-20 h-20 object-contain mx-auto"
            onError={(e) => {
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
    return <TermsAcceptance onAccept={handleAcceptTermsWithNavigation} onDecline={handleDeclineTerms} />;
  }
  
  // Safety check
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

  const selectedValues = data.selectedValueIds
    .map(id => ALL_VALUES.find(v => v.id === id))
    .filter(Boolean) as ValueItem[];

  const showNav = data.selectedValueIds.length > 0 && view !== 'onboarding';

  return (
    <EmotionProvider>
      <ErrorBoundary>
        <AppLayout
          authState={authState}
          showNav={showNav}
          view={view}
          aiStatusText={aiStatusText}
          onViewChange={setView}
          onOpenLCSWConfig={modals.openLCSWConfig}
          onOpenHelp={modals.openHelp}
          onLogout={() => {
            if (window.confirm('Are you sure you want to lock the app?')) {
              logoutUser();
              handleLogout();
            }
          }}
        >
          <AppRouter
            view={view}
            selectedValueIds={data.selectedValueIds}
            selectedValues={selectedValues}
            logs={data.logs}
            goals={data.goals}
            settings={data.settings}
            initialValueIdForGoal={initialValueIdForGoal}
            onSelectionComplete={(ids) => {
              data.handleSelectionComplete(ids);
              setView('home');
            }}
            onLogEntry={data.handleLogEntry}
            onUpdateGoals={data.handleUpdateGoals}
            onUpdateGoalProgress={data.handleUpdateGoalProgress}
            onUpdateSettings={data.setSettings}
            onClearData={data.handleClearData}
            onViewChange={(newView) => {
              setView(newView);
              if (newView === 'home') {
                // Reset dashboard state when navigating to home
                if ((window as any).__dashboardReset) {
                  (window as any).__dashboardReset();
                }
              }
            }}
            onSetInitialValueIdForGoal={setInitialValueIdForGoal}
            onLogout={() => {
              if (window.confirm('Are you sure you want to lock the app?')) {
                logoutUser();
                handleLogout();
              }
            }}
            onOpenHelp={modals.openHelp}
          />
        </AppLayout>

        {modals.showHelp && <HelpOverlay onClose={modals.closeHelp} />}

        {modals.showMigrationScreen && (
          <MigrationScreen
            onClose={() => {
              modals.closeMigration();
              localStorage.setItem('migration_prompt_dismissed', 'true');
            }}
            onComplete={() => {
              modals.closeMigration();
              window.location.reload();
            }}
          />
        )}

        <PWAInstallPrompt />

        {authState === 'app' && <FeedbackButton />}

        {modals.showLCSWConfig && (
          <Suspense fallback={<SkeletonCard lines={5} showHeader={true} />}>
            <LCSWConfigComponent
              config={data.settings.lcswConfig}
              onUpdate={(config) => data.setSettings({ ...data.settings, lcswConfig: config })}
              onClose={modals.closeLCSWConfig}
              settings={data.settings}
              onUpdateSettings={(newSettings) => data.setSettings(newSettings)}
            />
          </Suspense>
        )}
      </ErrorBoundary>
    </EmotionProvider>
  );
};

const AppWithData: React.FC = () => {
  const authContext = useAuthContext();
  
  return (
    <DataProvider
      userId={authContext.userId}
      authState={authContext.authState}
      initialData={{}}
    >
      <AppContent />
    </DataProvider>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider
      onLoginComplete={(userId, appData) => {
        // Data will be synced via DataContext
      }}
      onLogoutComplete={() => {
        // Handled by DataContext
      }}
    >
      <AppWithData />
    </AuthProvider>
  );
};

export default App;
