import React, { useEffect, useState, useMemo } from "react";
import { useDataContext } from "./contexts/DataContext";
import { useAuthContext } from "./contexts/AuthContext";
import BottomNavigation from "./components/BottomNavigation";
import AIResponseBubble from "./components/AIResponseBubble";
import Login from "./components/Login";
import TermsAcceptance from "./components/TermsAcceptance";
import GoalsSection from "./components/GoalsSection";
import VaultControl from "./components/VaultControl";
import GoalsUpdateView from "./components/GoalsUpdateView";
import ValueSelection from "./components/ValueSelection";
import ReportView from "./components/ReportView";
import Settings from "./components/Settings";
import HelpOverlay from "./components/HelpOverlay";
import { AppHeader } from "./components/Layout/AppHeader";
import { ALL_VALUES } from "./constants";

type AppView = "home" | "goals" | "vault" | "update" | "values" | "report";
type BottomNavView = "home" | "values" | "report" | "vault" | "goals" | "onboarding" | "settings";

export default function AppContent({ onHydrationReady }: { onHydrationReady?: () => void }) {
  const authContext = useAuthContext();
  const { authState, handleLogin, handleAcceptTerms, handleDeclineTerms, handleLogout } = authContext;
  
  // Only use DataContext when authenticated (to avoid errors)
  let context;
  try {
    context = useDataContext();
  } catch {
    context = null;
  }
  
  const [currentView, setCurrentView] = useState<AppView>("home");
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (context && authState === 'app' && onHydrationReady) {
      onHydrationReady();
    }
  }, [context, authState, onHydrationReady]);

  // Handle auth states
  if (authState === 'checking') {
    return (
      <div className="flex items-center justify-center h-screen text-neutral-300 bg-neutral-900">
        <span>Initializing Grounded …</span>
      </div>
    );
  }

  if (authState === 'login') {
    return <Login onLogin={handleLogin} />;
  }

  if (authState === 'terms') {
    return <TermsAcceptance onAccept={handleAcceptTerms} onDecline={handleDeclineTerms} />;
  }

  if (!context || authState !== 'app') {
    return (
      <div className="flex items-center justify-center h-screen text-neutral-300 bg-neutral-900">
        <span>Loading Grounded data …</span>
      </div>
    );
  }

  // Handle action clicks from AIResponseBubble
  const handleActionClick = (action: 'reflection' | 'values' | 'resources') => {
    if (action === 'values') {
      setCurrentView('values');
    } else if (action === 'reflection') {
      // Could navigate to reflection form or show modal
      console.log('Reflection action clicked');
    } else if (action === 'resources') {
      // Could navigate to resources view
      console.log('Resources action clicked');
    }
  };

  // Handle mood changes from AIResponseBubble
  const handleMoodChange = (emotion: string, feeling: string) => {
    console.log('Mood changed:', emotion, feeling);
    // Mood is already saved via handleMoodLoopEntry in AIResponseBubble
  };

  // Memoize values to prevent hydration mismatches
  const selectedValues = useMemo(() => 
    (context?.selectedValueIds || []).map(id => ALL_VALUES.find(v => v.id === id)).filter(Boolean) as any[],
    [context?.selectedValueIds]
  );

  // Handle clear data with confirmation
  const handleClearData = () => {
    if (window.confirm('Are you sure you want to hard clear all data from the database? This action cannot be undone and will permanently delete all your logs, goals, and settings.')) {
      if (context) {
        context.handleClearData();
        // Also clear from database
        const adapter = require('./services/databaseAdapter').getDatabaseAdapter();
        adapter.init().then(() => {
          if (authContext.userId) {
            adapter.clearAllData(authContext.userId).catch(console.error);
          }
        }).catch(console.error);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-900 text-neutral-100">
      <AppHeader
        authState={authState}
        showNav={authState === 'app'}
        view={currentView === 'settings' ? 'settings' : currentView === 'home' ? 'home' : currentView}
        onViewChange={(view) => {
          if (view === 'settings') {
            setShowSettings(true);
            setCurrentView('home'); // Keep current view but show settings overlay
          } else {
            setCurrentView(view as AppView);
          }
        }}
        onOpenLCSWConfig={() => {
          // Open settings which includes LCSW config
          setShowSettings(true);
        }}
        onOpenHelp={() => setShowHelp(true)}
        onLogout={handleLogout}
      />
      <main className="flex-1 w-full overflow-y-auto p-4 pb-24">
        {currentView === "home" && (
          <div className="max-w-2xl mx-auto py-8">
            <AIResponseBubble 
              message="Welcome to Grounded. How are you feeling today?"
              emotion="calm"
              feeling="balanced"
              onActionClick={handleActionClick}
              onMoodChange={handleMoodChange}
            />
          </div>
        )}
        {currentView === "goals" && (
          <GoalsSection
            goals={context?.goals || []}
            values={selectedValues}
            onCompleteGoal={(goal) => {
              if (context) {
                const updatedGoals = (context.goals || []).map(g => 
                  g.id === goal.id ? { ...g, completed: true } : g
                );
                context.handleUpdateGoals(updatedGoals);
              }
            }}
            onDeleteGoal={(goalId) => {
              if (context) {
                const updatedGoals = (context.goals || []).filter(g => g.id !== goalId);
                context.handleUpdateGoals(updatedGoals);
              }
            }}
          />
        )}
        {currentView === "update" && <GoalsUpdateView />}
        {currentView === "vault" && <VaultControl />}
        {currentView === "values" && (
          <ValueSelection
            initialSelected={context?.selectedValueIds || []}
            onComplete={(ids) => {
              if (context) {
                context.handleSelectionComplete(ids);
              }
              setCurrentView('home');
            }}
          />
        )}
        {currentView === "report" && (
          <ReportView
            logs={context?.logs || []}
            values={selectedValues}
            goals={context?.goals || []}
          />
        )}
        {showSettings && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-neutral-900 text-neutral-100 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
              <button
                onClick={() => setShowSettings(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-neutral-800 hover:bg-neutral-700"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <Settings
                onLogout={handleLogout}
                onShowHelp={() => {
                  setShowSettings(false);
                  setShowHelp(true);
                }}
                onClearData={handleClearData}
              />
            </div>
          </div>
        )}
      </main>

      <footer className="flex-shrink-0 border-t border-neutral-800">
        <BottomNavigation 
          currentView={currentView as BottomNavView} 
          onViewChange={(view) => {
            // Map all BottomNavigation views to AppContent views
            if (view === "goals" || view === "vault" || view === "home" || view === "values" || view === "report") {
              setCurrentView(view as AppView);
            }
          }}
          onLogout={handleLogout}
        />
      </footer>

      {showHelp && <HelpOverlay onClose={() => setShowHelp(false)} />}
    </div>
  );
}

