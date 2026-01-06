import React, { Suspense } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider, useAuthContext } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import AppContent from './AppContent';

// Export function to reset initialization (for logout, etc.)
export { resetInitialization } from './hooks/useAppInitialization';

const AppWithData: React.FC<{ onHydrationReady?: () => void }> = ({ onHydrationReady }) => {
  const authContext = useAuthContext();
  const { appData } = React.useContext(AppDataContext);
  
  return (
    <DataProvider
      userId={authContext.userId}
      authState={authContext.authState}
      initialData={appData || {}}
    >
      <AppContent onHydrationReady={onHydrationReady} />
    </DataProvider>
  );
};

/* ---------- Diagnostic Overlay ---------- */
const DiagnosticOverlay: React.FC<{ status: string }> = ({ status }) => (
  <div
    style={{
      position: "fixed",
      top: 8,
      right: 8,
      background: "rgba(0,0,0,0.65)",
      color: "#00ffff",
      padding: "4px 8px",
      fontSize: 10,
      borderRadius: 4,
      fontFamily: "monospace",
      zIndex: 9999,
      pointerEvents: "none",
      opacity: 0.8,
    }}
  >
    ⚙️ {status}
  </div>
);

// Create a context to pass appData from AuthProvider to AppWithData
const AppDataContext = React.createContext<{
  appData: { values?: string[]; logs?: any[]; goals?: any[]; settings?: any; } | null;
  setAppData: (data: { values?: string[]; logs?: any[]; goals?: any[]; settings?: any; } | null) => void;
}>({
  appData: null,
  setAppData: () => {},
});

const App: React.FC = () => {
  const [status, setStatus] = React.useState("Initializing contexts...");
  const [showStatus, setShowStatus] = React.useState(true);
  const [appData, setAppData] = React.useState<{
    values?: string[];
    logs?: any[];
    goals?: any[];
    settings?: any;
  } | null>(null);

  // Auto-hide status after 5 seconds
  React.useEffect(() => {
    if (status) {
      setShowStatus(true);
      const timer = setTimeout(() => {
        setShowStatus(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  return (
    <>
      <ErrorBoundary>
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center h-screen bg-bg-primary dark:bg-dark-bg-primary text-text-primary dark:text-white">
            <div className="animate-pulse text-lg tracking-wide">Loading Grounded ...</div>
          </div>
        }>
          <AppDataContext.Provider value={{ appData, setAppData }}>
            <AuthProvider
              onLoginComplete={(userId, loginAppData) => {
                // Store appData to pass to DataProvider
                setAppData(loginAppData);
                setStatus("User authenticated");
              }}
              onLogoutComplete={() => {
                // Clear appData on logout
                setAppData(null);
                setStatus("User logged out");
              }}
            >
              <AppWithData onHydrationReady={() => setStatus("Rendering ready")} />
            </AuthProvider>
          </AppDataContext.Provider>
        </Suspense>
      </ErrorBoundary>
      {showStatus && <DiagnosticOverlay status={status} />}
    </>
  );
};

export default App;
