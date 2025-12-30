import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';

// Global error handlers to catch any errors before React mounts
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error, event.error?.stack);
  // Log to help debug Vercel issues
  if (event.error) {
    console.error('Error details:', {
      message: event.error.message,
      stack: event.error.stack,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  if (event.reason instanceof Error) {
    console.error('Rejection details:', {
      message: event.reason.message,
      stack: event.reason.stack
    });
  }
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  // Fallback if root element doesn't exist
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif; min-height: 100vh; display: flex; align-items: center; justify-content: center; flex-direction: column; background-color: #f6f7f9;">
      <h1 style="font-size: 24px; margin-bottom: 16px; color: #000;">Critical Error</h1>
      <p style="margin-bottom: 16px; color: #666;">Root element not found. Please check the HTML structure.</p>
      <button onclick="window.location.reload()" style="padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 16px;">
        Reload
      </button>
    </div>
  `;
  throw new Error("Could not find root element to mount to");
}

// Show immediate loading state while React initializes
rootElement.innerHTML = `
  <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background-color: #f6f7f9; font-family: 'Inter', sans-serif;">
    <div style="text-align: center;">
      <img src="/ac-minds-logo.png" alt="AC MINDS" style="width: 80px; height: 80px; margin: 0 auto 24px; object-fit: contain;" onerror="this.style.display='none'" />
      <h2 style="font-size: 20px; font-weight: 900; color: #000; margin-bottom: 16px;">Initializing...</h2>
      <div style="width: 200px; height: 4px; background-color: #e5e7eb; border-radius: 2px; margin: 0 auto; overflow: hidden;">
        <div style="width: 30%; height: 100%; background-color: #02295b; animation: pulse 1.5s ease-in-out infinite;"></div>
      </div>
      <style>
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      </style>
    </div>
  </div>
`;

// Timeout fallback - if React doesn't render within 5 seconds, show error
const renderTimeout = setTimeout(() => {
  const currentContent = rootElement.innerHTML;
  if (currentContent.includes('Initializing...')) {
    console.error('React failed to render within 5 seconds - showing error screen');
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: sans-serif; min-height: 100vh; display: flex; align-items: center; justify-content: center; flex-direction: column; background-color: #f6f7f9;">
        <h1 style="font-size: 24px; margin-bottom: 16px; color: #000;">Loading Timeout</h1>
        <p style="margin-bottom: 16px; color: #666; text-align: center; max-width: 500px;">The app is taking longer than expected to load. This may be due to a network issue or a problem with the deployment.</p>
        <p style="margin-bottom: 16px; color: #999; font-size: 14px;">Check the browser console (F12) for error details.</p>
        <button onclick="window.location.reload()" style="padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 16px;">
          Reload
        </button>
      </div>
    `;
  }
}, 5000);

const root = ReactDOM.createRoot(rootElement);

// Add error boundary at the top level
try {
  root.render(
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
  // Clear timeout if React renders successfully
  clearTimeout(renderTimeout);
} catch (error) {
  clearTimeout(renderTimeout);
  console.error('Error mounting App:', error);
  root.render(
    <div style={{ padding: '20px', fontFamily: 'sans-serif', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', backgroundColor: '#fff' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '16px', color: '#000' }}>Error Loading App</h1>
      <p style={{ marginBottom: '16px', color: '#666' }}>{String(error)}</p>
      {error instanceof Error && error.stack && (
        <pre style={{ fontSize: '12px', color: '#999', maxWidth: '600px', overflow: 'auto', textAlign: 'left', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
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