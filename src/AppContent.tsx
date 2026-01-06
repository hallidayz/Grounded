import React, { lazy, Suspense, useEffect } from "react";
import { useDataContext } from "./contexts/DataContext";
import BottomNavigation from "./components/BottomNavigation";
import AIResponseBubble from "./components/AIResponseBubble";

const GoalsView = lazy(() => import("./components/Goals"));
const VaultView = lazy(() => import("./components/Vault"));

interface Props {
  onHydrationReady?: () => void;
}

export default function AppContent({ onHydrationReady }: Props) {
  const context = useDataContext();

  useEffect(() => {
    if (context && onHydrationReady) onHydrationReady();
  }, [context, onHydrationReady]);

  if (!context)
    return (
      <div className="flex items-center justify-center h-screen bg-neutral-900 text-neutral-400">
        <span>Context initializing — please wait …</span>
      </div>
    );

  return (
    <div className="flex flex-col min-h-screen bg-neutral-900 text-neutral-100">
      <main className="flex-1 flex flex-col items-center justify-center">
        <Suspense
          fallback={<p className="text-neutral-500 text-sm">Loading interactive elements…</p>}
        >
          <AIResponseBubble 
            message="Welcome to Grounded. How are you feeling today?"
            emotion="calm"
            feeling="balanced"
          />
        </Suspense>
      </main>
      <footer>
        <BottomNavigation currentView="home" onViewChange={() => {}} />
      </footer>
    </div>
  );
}

