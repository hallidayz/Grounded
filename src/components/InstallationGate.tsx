/**
 * Installation Gate Component
 * 
 * Ensures the app is installed locally before allowing access.
 * Critical for iOS which doesn't download from address bar.
 * 
 * Flow:
 * 1. Check if installed
 * 2. If not, show installation instructions (iOS-specific)
 * 3. Wait for installation
 * 4. Verify service worker and cache
 * 5. Check for updates
 * 6. Load app only when ready
 */

import React, { useState, useEffect } from 'react';
import { 
  getInstallationStatus, 
  isPWAInstalled, 
  detectPlatform,
  waitForServiceWorkerReady,
  checkForUpdates
} from '../utils/installCheck';

interface InstallationGateProps {
  children: React.ReactNode;
}

const InstallationGate: React.FC<InstallationGateProps> = ({ children }) => {
  const [status, setStatus] = useState<{
    isInstalled: boolean;
    serviceWorkerActive: boolean;
    cacheReady: boolean;
    needsUpdate: boolean;
    platform: 'ios' | 'android' | 'desktop' | 'unknown';
    checking: boolean;
    updating: boolean;
  }>({
    isInstalled: false,
    serviceWorkerActive: false,
    cacheReady: false,
    needsUpdate: false,
    platform: 'unknown',
    checking: true,
    updating: false,
  });

  useEffect(() => {
    const checkStatus = async () => {
      setStatus(prev => ({ ...prev, checking: true }));
      
      const installationStatus = await getInstallationStatus();
      
      setStatus({
        isInstalled: installationStatus.isInstalled,
        serviceWorkerActive: installationStatus.serviceWorkerActive,
        cacheReady: installationStatus.cacheReady,
        needsUpdate: installationStatus.needsUpdate,
        platform: installationStatus.platform,
        checking: false,
        updating: false,
      });
      
      // If installed but needs update, apply update
      if (installationStatus.isInstalled && installationStatus.needsUpdate) {
        await applyUpdate();
      }
      
      // If not installed but service worker is ready, wait a bit for installation
      if (!installationStatus.isInstalled && installationStatus.serviceWorkerActive) {
        // Wait up to 3 seconds for user to install
        setTimeout(async () => {
          const newStatus = await getInstallationStatus();
          if (newStatus.isInstalled) {
            setStatus(prev => ({ ...prev, isInstalled: true }));
          }
        }, 3000);
      }
    };
    
    checkStatus();
    
    // Re-check every 2 seconds if not installed
    const interval = setInterval(() => {
      if (!status.isInstalled) {
        checkStatus();
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, [status.isInstalled]);

  const applyUpdate = async () => {
    setStatus(prev => ({ ...prev, updating: true }));
    
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration?.waiting) {
        // Tell the waiting service worker to skip waiting
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        
        // Wait for controller change
        await new Promise<void>((resolve) => {
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            resolve();
          }, { once: true });
          
          // Timeout after 5 seconds
          setTimeout(() => resolve(), 5000);
        });
        
        // Reload to activate new service worker
        window.location.reload();
      }
    } catch (error) {
      console.error('[InstallationGate] Error applying update:', error);
      setStatus(prev => ({ ...prev, updating: false }));
    }
  };

  // If installed and ready, show app
  if (status.isInstalled && status.serviceWorkerActive && status.cacheReady && !status.checking) {
    return <>{children}</>;
  }

  // If checking or updating, show loading
  if (status.checking || status.updating) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary dark:bg-dark-bg-primary">
        <div className="text-center space-y-4 p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand dark:border-brand-light mx-auto"></div>
          <p className="text-text-primary dark:text-white font-medium">
            {status.updating ? 'Updating app...' : 'Checking installation...'}
          </p>
        </div>
      </div>
    );
  }

  // Show installation instructions
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary dark:bg-dark-bg-primary p-4">
      <div className="max-w-md w-full bg-white dark:bg-dark-bg-secondary rounded-2xl shadow-2xl p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black text-text-primary dark:text-white">
            Install Grounded
          </h1>
          <p className="text-sm text-text-secondary dark:text-white/70">
            Install the app locally for the best experience
          </p>
        </div>

        {status.platform === 'ios' && (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-bold text-blue-900 dark:text-blue-200 mb-2">
                iOS Installation Instructions
              </p>
              <ol className="text-xs text-blue-800 dark:text-blue-300 space-y-2 list-decimal list-inside">
                <li>Tap the <strong>Share</strong> button <span className="text-lg">📤</span> at the bottom of Safari</li>
                <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
                <li>Tap <strong>"Add"</strong> in the top right corner</li>
                <li>The app will open from your home screen</li>
              </ol>
            </div>
            <div className="flex items-center gap-2 text-xs text-text-secondary dark:text-white/60">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>
                <strong>Important:</strong> iOS doesn't download from the address bar. 
                You must use "Add to Home Screen" to install the app.
              </p>
            </div>
          </div>
        )}

        {status.platform === 'android' && (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
              <p className="text-sm font-bold text-green-900 dark:text-green-200 mb-2">
                Android Installation
              </p>
              <p className="text-xs text-green-800 dark:text-green-300">
                Look for the install prompt that appears in your browser, 
                or tap the menu (⋮) and select "Install app" or "Add to Home screen".
              </p>
            </div>
          </div>
        )}

        {status.platform === 'desktop' && (
          <div className="space-y-4">
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
              <p className="text-sm font-bold text-purple-900 dark:text-purple-200 mb-2">
                Desktop Installation
              </p>
              <p className="text-xs text-purple-800 dark:text-purple-300">
                Look for the install icon in your browser's address bar, 
                or check the browser menu for "Install Grounded" option.
              </p>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-border-soft dark:border-dark-border">
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-brand dark:bg-brand-light text-white dark:text-navy-dark rounded-xl font-black uppercase tracking-widest hover:opacity-90 transition-opacity"
          >
            I've Installed It - Continue
          </button>
          <button
            onClick={() => {
              // Allow user to proceed anyway (for development/testing)
              setStatus(prev => ({ ...prev, isInstalled: true, serviceWorkerActive: true, cacheReady: true }));
            }}
            className="w-full mt-2 py-2 text-sm text-text-secondary dark:text-white/60 hover:text-text-primary dark:hover:text-white transition-colors"
          >
            Continue Without Installing
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallationGate;

