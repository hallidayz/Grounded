import React, { lazy, Suspense, useEffect, useState } from "react";
import { useDataContext } from "./contexts/DataContext";
import BottomNavigation from "./components/BottomNavigation";
import AIResponseBubble from "./components/AIResponseBubble";

const GoalsView = lazy(() => import("./components/GoalsSection"));
const VaultView = lazy(() => import("./components/VaultControl"));
const GoalsUpdateView = lazy(() => import("./components/GoalsUpdateView"));

type AppView = "home" | "goals" | "vault" | "update";
type BottomNavView = "home" | "values" | "report" | "vault" | "goals" | "onboarding" | "settings";

export default function AppContent({ onHydrationReady }: { onHydrationReady?: () => void }) {
  const context = useDataContext();
  const [currentView, setCurrentView] = useState<AppView>("home");

  useEffect(() => { if (context && onHydrationReady) onHydrationReady(); }, [context, onHydrationReady]);

  if (!context)
    return (
      <div className="flex items-center justify-center h-screen text-neutral-300 bg-neutral-900">
        <span>Loading Grounded data …</span>
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col bg-neutral-900 text-neutral-100">
      <main className="flex-1 flex flex-col items-center justify-center w-full overflow-y-auto">
        <Suspense fallback={<p className="text-neutral-500 text-sm">Loading view …</p>}>
          {currentView === "home"   && <AIResponseBubble 
            message="Welcome to Grounded. How are you feeling today?"
            emotion="calm"
            feeling="balanced"
          />}
          {currentView === "goals"  && <GoalsView />}
          {currentView === "update" && <GoalsUpdateView />}
          {currentView === "vault"  && <VaultView />}
        </Suspense>
      </main>

      <footer className="flex-shrink-0">
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

