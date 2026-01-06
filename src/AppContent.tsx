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
import Dashboard from "./components/Dashboard";
import CrisisResourcesModal from "./components/CrisisResourcesModal";
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
  const [showResources, setShowResources] = useState(false);
  const [showReflection, setShowReflection] = useState(false);

  // Memoize values to prevent hydration mismatches - MUST be called before any early returns
  const selectedValues = useMemo(() => 
    (context?.selectedValueIds || []).map(id => ALL_VALUES.find(v => v.id === id)).filter(Boolean) as any[],
    [context?.selectedValueIds]
  );

  // Check if this is a first-time user (no values selected)
  const isFirstTimeUser = context ? (!context.selectedValueIds || context.selectedValueIds.length === 0) : false;

  useEffect(() => {
    if (context && authState === 'app' && onHydrationReady) {
      onHydrationReady();
    }
  }, [context, authState, onHydrationReady]);

  // Auto-navigate to values for first-time users
  useEffect(() => {
    if (isFirstTimeUser && currentView === 'home' && authState === 'app' && context) {
      setCurrentView('values');
    }
  }, [isFirstTimeUser, currentView, authState, context]);

  // Handle auth states
  if (authState === 'checking') {
    return (
      <div className="flex items-center justify-center h-screen text-text-primary dark:text-white bg-bg-primary dark:bg-dark-bg-primary">
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
      <div className="flex items-center justify-center h-screen text-text-primary dark:text-white bg-bg-primary dark:bg-dark-bg-primary">
        <span>Loading Grounded data …</span>
      </div>
    );
  }

  // Handle action clicks from AIResponseBubble
  const handleActionClick = (action: 'reflection' | 'values' | 'resources') => {
    if (action === 'values') {
      setCurrentView('values');
    } else if (action === 'reflection') {
      // Show Dashboard with reflection forms
      setShowReflection(true);
    } else if (action === 'resources') {
      // Show crisis resources modal with emergency contacts
      setShowResources(true);
    }
  };

  // Handle mood changes from AIResponseBubble
  const handleMoodChange = (emotion: string, feeling: string) => {
    console.log('Mood changed:', emotion, feeling);
    // Mood is already saved via handleMoodLoopEntry in AIResponseBubble
  };

  // Handle clear data with confirmation
  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all local data? This cannot be undone.')) {
      if (context) {
        context.handleClearData();
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary dark:bg-dark-bg-primary text-text-primary dark:text-white">
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
        {currentView === "update" && (
          <GoalsUpdateView
            goals={context?.goals || []}
            values={selectedValues}
            onUpdateGoal={(goalId, update) => {
              if (context) {
                const updatedGoals = (context.goals || []).map(g => {
                  if (g.id === goalId) {
                    return { ...g, updates: [...(g.updates || []), update] };
                  }
                  return g;
                });
                context.handleUpdateGoals(updatedGoals);
              }
            }}
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
            onEditGoal={(goalId, newText) => {
              if (context) {
                const updatedGoals = (context.goals || []).map(g => 
                  g.id === goalId ? { ...g, text: newText } : g
                );
                context.handleUpdateGoals(updatedGoals);
              }
            }}
          />
        )}
        {currentView === "vault" && <VaultControl />}
        {currentView === "values" && (
          <div className="max-w-2xl mx-auto">
            {isFirstTimeUser && (
              <div className="mb-6 p-4 bg-brand/10 dark:bg-brand/20 border border-brand/30 dark:border-brand/30 rounded-xl">
                <h2 className="text-lg font-black text-text-primary dark:text-white mb-2">
                  Welcome to Grounded! 🌱
                </h2>
                <p className="text-sm text-text-secondary dark:text-white/70 leading-relaxed mb-2">
                  To get started, select up to 10 values that matter most to you. These will guide your self-care journey.
                </p>
                <p className="text-sm text-text-secondary dark:text-white/70 leading-relaxed">
                  Once you've selected your values, click <strong>"Confirm Compass"</strong> to save and begin tracking your self-care.
                </p>
              </div>
            )}
            <ValueSelection
              initialSelected={context?.selectedValueIds || []}
              onComplete={(ids) => {
                if (context) {
                  context.handleSelectionComplete(ids);
                }
                // Navigate to home after confirming values
                setCurrentView('home');
              }}
              onAddGoal={(valueId) => {
                // Navigate to goals update view to add a goal for this value
                setCurrentView('update');
                // TODO: Pass valueId to GoalsUpdateView if it supports it
              }}
              goals={context?.goals || []}
            />
          </div>
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
            <div className="bg-bg-primary dark:bg-dark-bg-primary text-text-primary dark:text-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
              <button
                onClick={() => setShowSettings(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-bg-secondary dark:bg-dark-bg-secondary hover:bg-bg-tertiary dark:hover:bg-dark-bg-tertiary"
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

      {/* Hide bottom navigation on values view to show confirm button */}
      {currentView !== "values" && (
        <footer className="flex-shrink-0 border-t border-border-soft dark:border-dark-border">
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
      )}

      {showHelp && <HelpOverlay onClose={() => setShowHelp(false)} />}
      
      {/* Reflection Dashboard Modal */}
      {showReflection && context && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-primary dark:bg-dark-bg-primary rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowReflection(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-bg-secondary dark:bg-dark-bg-secondary hover:bg-bg-tertiary dark:hover:bg-dark-bg-tertiary"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="p-6">
              <Dashboard
                values={selectedValues}
                logs={context.logs || []}
                goals={context.goals || []}
                lcswConfig={context.settings?.lcswConfig}
                onLog={(entry) => {
                  if (context) {
                    context.handleLogEntry(entry);
                  }
                }}
                onUpdateGoals={(updatedGoals) => {
                  if (context) {
                    context.handleUpdateGoals(updatedGoals);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Crisis Resources Modal */}
      {showResources && context && (
        <CrisisResourcesModal
          onClose={() => setShowResources(false)}
          lcswConfig={context.settings?.lcswConfig}
        />
      )}
    </div>
  );
}

