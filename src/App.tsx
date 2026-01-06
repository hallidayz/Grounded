import React, { Suspense } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider, useAuthContext } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import AppContent from './AppContent';

// Export function to reset initialization (for logout, etc.)
export { resetInitialization } from './hooks/useAppInitialization';

const AppWithData: React.FC<{ onHydrationReady?: () => void }> = ({ onHydrationReady }) => {
  const authContext = useAuthContext();
  
  return (
    <DataProvider
      userId={authContext.userId}
      authState={authContext.authState}
      initialData={{}}
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
      bottom: 8,
      right: 8,
      background: "rgba(0,0,0,0.65)",
      color: "#00ffff",
      padding: "6px 10px",
      fontSize: 12,
      borderRadius: 5,
      fontFamily: "monospace",
      zIndex: 9999,
    }}
  >
    ⚙️ Grounded: {status}
  </div>
);

const App: React.FC = () => {
  const [status, setStatus] = React.useState("Initializing contexts...");

  return (
    <>
      <ErrorBoundary>
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center h-screen bg-black text-gray-100">
            <div className="animate-pulse text-lg tracking-wide">Loading Grounded ...</div>
          </div>
        }>
          <AuthProvider
            onLoginComplete={(userId, appData) => {
              // Data will be synced via DataContext
              setStatus("User authenticated");
            }}
            onLogoutComplete={() => {
              // Handled by DataContext
              setStatus("User logged out");
            }}
          >
            <AppWithData onHydrationReady={() => setStatus("Rendering ready")} />
          </AuthProvider>
        </Suspense>
      </ErrorBoundary>
      <DiagnosticOverlay status={status} />
    </>
  );
};

export default App;
