import React, { useEffect, useState } from "react";
import { useDataContext } from "./contexts/DataContext";
import { useAuthContext } from "./contexts/AuthContext";
import BottomNavigation from "./components/BottomNavigation";
import AIResponseBubble from "./components/AIResponseBubble";
import Login from "./components/Login";
import TermsAcceptance from "./components/TermsAcceptance";
import GoalsSection from "./components/GoalsSection";
import VaultControl from "./components/VaultControl";
import GoalsUpdateView from "./components/GoalsUpdateView";

type AppView = "home" | "goals" | "vault" | "update";
type BottomNavView = "home" | "values" | "report" | "vault" | "goals" | "onboarding" | "settings";

export default function AppContent({ onHydrationReady }: { onHydrationReady?: () => void }) {
  const authContext = useAuthContext();
  const { authState, handleLogin, handleAcceptTerms, handleDeclineTerms } = authContext;
  
  // Only use DataContext when authenticated (to avoid errors)
  let context;
  try {
    context = useDataContext();
  } catch {
    context = null;
  }
  
  const [currentView, setCurrentView] = useState<AppView>("home");

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

  return (
    <div className="min-h-screen flex flex-col bg-neutral-900 text-neutral-100">
      <main className="flex-1 flex flex-col items-center justify-center w-full overflow-y-auto p-4">
        {currentView === "home" && (
          <AIResponseBubble 
            message="Welcome to Grounded. How are you feeling today?"
            emotion="calm"
            feeling="balanced"
          />
        )}
        {currentView === "goals" && <GoalsSection />}
        {currentView === "update" && <GoalsUpdateView />}
        {currentView === "vault" && <VaultControl />}
      </main>

      <footer className="flex-shrink-0 border-t border-neutral-800">
        <BottomNavigation 
          currentView={currentView as BottomNavView} 
          onViewChange={(view) => {
            // Map BottomNavigation views to AppContent views
            if (view === "goals" || view === "vault" || view === "home") {
              setCurrentView(view as AppView);
            }
          }}
          onLogout={() => {
            // Handle logout if needed
            console.log("Logout requested");
          }}
        />
      </footer>
    </div>
  );
}

