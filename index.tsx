import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// Add error boundary at the top level
try {
  root.render(
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
} catch (error) {
  console.error('Error mounting App:', error);
  root.render(
    <div style={{ padding: '20px', fontFamily: 'sans-serif', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', backgroundColor: '#fff' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '16px', color: '#000' }}>Error Loading App</h1>
      <p style={{ marginBottom: '16px', color: '#666' }}>{String(error)}</p>
      {error instanceof Error && error.stack && (
        <pre style={{ fontSize: '12px', color: '#999', maxWidth: '600px', overflow: 'auto', textAlign: 'left' }}>
          {error.stack}
        </pre>
      )}
      <button 
        onClick={() => window.location.reload()} 
        style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '16px' }}
      >
        Reload
      </button>
    </div>
  );
}