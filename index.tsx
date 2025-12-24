import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import { dbService } from './services/database';

// Initialize database and cleanup expired tokens
dbService.init().then(() => {
  // Cleanup expired tokens on startup
  dbService.cleanupExpiredTokens().catch(console.error);
  
  // Cleanup expired tokens every hour
  setInterval(() => {
    dbService.cleanupExpiredTokens().catch(console.error);
  }, 60 * 60 * 1000);
}).catch(console.error);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);