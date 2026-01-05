import React, { useState, useEffect } from 'react';
import { updateManager } from '../services/updateManager';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Detect Safari browser (including macOS Safari)
function isSafari(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  const isSafariUA = /^((?!chrome|android).)*safari/i.test(ua);
  const isMacOS = /Macintosh|MacIntel|MacPPC|Mac68K/i.test(ua);
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  return isSafariUA && (isMacOS || isIOS);
}

// Detect if running on macOS
function isMacOS(): boolean {
  if (typeof window === 'undefined') return false;
  return /Macintosh|MacIntel|MacPPC|Mac68K/i.test(window.navigator.userAgent);
}

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isSafariBrowser, setIsSafariBrowser] = useState(false);
  const [isMacOSDevice, setIsMacOSDevice] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<{ isNewInstall: boolean; isUpdate: boolean; currentVersion: string } | null>(null);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
      return;
    }

    // Get update info to show appropriate messaging
    const info = updateManager.getUpdateInfo();
    setUpdateInfo({
      isNewInstall: info.isNewInstall,
      isUpdate: info.isUpdate,
      currentVersion: info.currentVersion,
    });

    // Detect browser and OS
    setIsSafariBrowser(isSafari());
    setIsMacOSDevice(isMacOS());

    // Listen for beforeinstallprompt event (Chrome/Edge only)
    // Note: For non-Safari browsers, installation is also available via address bar icon
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt after a short delay to avoid interrupting initial load
      // Only show if user hasn't dismissed recently
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (dismissed) {
        const dismissedTime = parseInt(dismissed, 10);
        const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
        if (daysSinceDismissed < 7) {
          return; // Don't show if dismissed within 7 days
        }
      }
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For Safari, show manual installation instructions after a delay
    // Safari doesn't support beforeinstallprompt, so we show instructions directly
    if (isSafari()) {
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (dismissed) {
        const dismissedTime = parseInt(dismissed, 10);
        const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
        // Show again after 7 days
        if (daysSinceDismissed < 7) {
          return;
        }
      }
      // Show Safari instructions after 3 seconds
      setTimeout(() => setShowPrompt(true), 3000);
    }

    // Check if user dismissed the prompt before (for non-Safari browsers)
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed && !isSafari()) {
      const dismissedTime = parseInt(dismissed, 10);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        setShowPrompt(false);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
      setShowPrompt(false);
    } else {
      // User dismissed, remember for 7 days
      localStorage.setItem('pwa-install-dismissed', Date.now().toString());
      setShowPrompt(false);
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    setShowPrompt(false);
  };

  // Don't show if already installed
  if (isInstalled || !showPrompt) {
    return null;
  }

  // For Safari, show manual installation instructions
  if (isSafariBrowser) {
    return (
      <div className="fixed bottom-20 left-0 right-0 z-50 px-4 sm:px-6 lg:bottom-4 lg:left-auto lg:right-4 lg:max-w-md">
        <div className="bg-white dark:bg-dark-bg-primary border border-border-soft dark:border-dark-border rounded-xl shadow-2xl p-4 sm:p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-12 h-12 bg-navy-primary dark:bg-yellow-warm rounded-lg flex items-center justify-center">
              <img 
                src="/ac-minds-logo.png" 
                alt="AC MINDS" 
                className="w-8 h-8 object-contain"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-black text-text-primary dark:text-white mb-1">
                Install Grounded on Safari
              </h3>
              <p className="text-xs text-text-secondary dark:text-text-secondary mb-2">
                Safari doesn't show an install button in the address bar. Follow these steps to add Grounded to your {isMacOSDevice ? 'Dock' : 'Home Screen'} for future use:
              </p>
              {updateInfo && updateInfo.isUpdate && (
                <div className="mb-3 p-2 bg-yellow-warm/10 dark:bg-yellow-warm/20 border border-yellow-warm/30 rounded-lg">
                  <p className="text-xs font-semibold text-yellow-warm dark:text-yellow-warm">
                    🔄 Update Available: v{updateInfo.currentVersion}
                  </p>
                  <p className="text-xs text-text-primary/80 dark:text-white/80 mt-1">
                    Installing updates preserves all your existing data. Your reflections, goals, and settings will remain intact.
                  </p>
                </div>
              )}
              {updateInfo && updateInfo.isNewInstall && (
                <div className="mb-3 p-2 bg-calm-sage/10 dark:bg-calm-sage/20 border border-calm-sage/30 rounded-lg">
                  <p className="text-xs font-semibold text-calm-sage dark:text-calm-sage">
                    ✨ Fresh Install
                  </p>
                  <p className="text-xs text-text-primary/80 dark:text-white/80 mt-1">
                    This is a new installation. The app will check for updates automatically and preserve your data when updates are available.
                  </p>
                </div>
              )}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                  <p className="text-xs font-semibold text-blue-900 dark:text-blue-200">
                    {isMacOSDevice ? 'macOS Safari Instructions:' : 'iOS Safari Instructions:'}
                  </p>
                </div>
                <ol className="text-xs text-blue-800 dark:text-blue-300 space-y-2.5 ml-8">
                  {isMacOSDevice ? (
                    <>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-blue-600 dark:text-blue-400">1.</span>
                        <span>Click the <strong className="text-blue-900 dark:text-blue-100">Share button</strong> (square with arrow) in the Safari toolbar at the top</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-blue-600 dark:text-blue-400">2.</span>
                        <span>In the menu, select <strong className="text-blue-900 dark:text-blue-100">"Add to Dock"</strong> (recommended) or <strong className="text-blue-900 dark:text-blue-100">"Add to Home Screen"</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-blue-600 dark:text-blue-400">3.</span>
                        <span>Click <strong className="text-blue-900 dark:text-blue-100">"Add"</strong> in the confirmation dialog</span>
                      </li>
                      <li className="flex items-start gap-2 pt-1 border-t border-blue-200 dark:border-blue-700">
                        <span className="text-blue-600 dark:text-blue-400">✓</span>
                        <span className="text-blue-700 dark:text-blue-300">The app icon will appear in your Dock and can be launched like any other app!</span>
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-blue-600 dark:text-blue-400">1.</span>
                        <span>Tap the <strong className="text-blue-900 dark:text-blue-100">Share button</strong> (square with arrow pointing up) at the bottom of Safari</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-blue-600 dark:text-blue-400">2.</span>
                        <span>Scroll down in the Share menu and tap <strong className="text-blue-900 dark:text-blue-100">"Add to Home Screen"</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold text-blue-600 dark:text-blue-400">3.</span>
                        <span>Tap <strong className="text-blue-900 dark:text-blue-100">"Add"</strong> in the top right corner to confirm</span>
                      </li>
                      <li className="flex items-start gap-2 pt-1 border-t border-blue-200 dark:border-blue-700">
                        <span className="text-blue-600 dark:text-blue-400">✓</span>
                        <span className="text-blue-700 dark:text-blue-300">The app icon will appear on your home screen and can be launched like any other app!</span>
                      </li>
                    </>
                  )}
                </ol>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-text-tertiary dark:text-text-tertiary hover:text-text-primary dark:hover:text-white"
              aria-label="Dismiss"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex gap-2 pt-2 border-t border-border-soft dark:border-dark-border">
            <button
              onClick={handleDismiss}
              className="flex-1 px-4 py-2.5 text-xs font-bold text-text-secondary dark:text-text-secondary hover:text-text-primary dark:hover:text-white border border-border-soft dark:border-dark-border rounded-lg transition-colors"
            >
              Not Now
            </button>
            <button
              onClick={handleDismiss}
              className="flex-1 px-4 py-2.5 bg-navy-primary text-white text-xs font-black uppercase tracking-widest rounded-lg hover:opacity-90 transition-opacity"
            >
              Got It
            </button>
          </div>
        </div>
      </div>
    );
  }

  // For Chrome/Edge (with beforeinstallprompt support)
  if (!deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-0 right-0 z-50 px-4 sm:px-6 lg:bottom-4 lg:left-auto lg:right-4 lg:max-w-sm">
      <div className="bg-white dark:bg-dark-bg-primary border border-border-soft dark:border-dark-border rounded-xl shadow-2xl p-4 sm:p-6 space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 bg-navy-primary dark:bg-yellow-warm rounded-lg flex items-center justify-center">
            <img 
              src="/ac-minds-logo.png" 
              alt="AC MINDS" 
              className="w-8 h-8 object-contain"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-black text-text-primary dark:text-white mb-1">
              Install Grounded
            </h3>
            <p className="text-xs text-text-secondary dark:text-text-secondary mb-2">
              Install this app on your device for a better experience. Works offline and loads faster.
            </p>
            <p className="text-xs text-text-tertiary dark:text-text-tertiary italic mb-2">
              💡 Tip: You can also install via the install icon (➕) in your browser's address bar.
            </p>
            {updateInfo && updateInfo.isUpdate && (
              <div className="mt-2 p-2 bg-yellow-warm/10 dark:bg-yellow-warm/20 border border-yellow-warm/30 rounded-lg">
                <p className="text-xs font-semibold text-yellow-warm dark:text-yellow-warm">
                  🔄 Update Available: v{updateInfo.currentVersion}
                </p>
                <p className="text-xs text-text-primary/80 dark:text-white/80 mt-1">
                  Installing updates preserves all your existing data automatically.
                </p>
              </div>
            )}
            {updateInfo && updateInfo.isNewInstall && (
              <div className="mt-2 p-2 bg-calm-sage/10 dark:bg-calm-sage/20 border border-calm-sage/30 rounded-lg">
                <p className="text-xs font-semibold text-calm-sage dark:text-calm-sage">
                  ✨ New Installation
                </p>
                <p className="text-xs text-text-primary/80 dark:text-white/80 mt-1">
                  The app will automatically check for updates and preserve your data when updates are available.
                </p>
              </div>
            )}
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-text-tertiary dark:text-text-tertiary hover:text-text-primary dark:hover:text-white"
            aria-label="Dismiss"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDismiss}
            className="flex-1 px-4 py-2 text-xs font-bold text-text-secondary dark:text-text-secondary hover:text-text-primary dark:hover:text-white border border-border-soft dark:border-dark-border rounded-lg"
          >
            Not Now
          </button>
          <button
            onClick={handleInstallClick}
            className="flex-1 px-4 py-2 bg-navy-primary text-white text-xs font-black uppercase tracking-widest rounded-lg hover:opacity-90"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;

