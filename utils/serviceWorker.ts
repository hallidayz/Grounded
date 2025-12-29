/**
 * Service Worker Management
 * 
 * Ensures the service worker is registered and active on every app launch.
 * Critical for PWA functionality, offline support, and AI model caching.
 */

// Guard to prevent multiple simultaneous service worker checks
let serviceWorkerCheckInProgress = false;

/**
 * Verify and activate service worker on app startup
 * This ensures the service worker is running every time the app opens
 * 
 * The service worker is automatically registered by VitePWA plugin via registerSW.js
 * This function verifies it's active and handles activation if needed
 */
export async function ensureServiceWorkerActive(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.warn('⚠️ Service Worker not available in this environment');
    return false;
  }

  // Prevent multiple simultaneous checks
  if (serviceWorkerCheckInProgress) {
    return false;
  }
  
  serviceWorkerCheckInProgress = true;

  // Wrap entire function in timeout to prevent hanging (10 seconds max)
  const checkPromise = Promise.race([
    (async () => {
      try {
        // Wait a moment for auto-registration to complete (registerSW.js runs on page load)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check if service worker is already registered
        const registration = await navigator.serviceWorker.getRegistration();
        
        if (registration) {
      // Service worker is registered
      console.log('✅ Service Worker registered:', registration.scope);
      
      // Check if service worker is active
      if (registration.active) {
        console.log('✅ Service Worker is ACTIVE');
        return true;
      }
      
      // Check if service worker is installing
      if (registration.installing) {
        console.log('⏳ Service Worker is installing...');
        // Wait for installation to complete with timeout (5 seconds max)
        return Promise.race([
          new Promise<boolean>((resolve) => {
            const stateChangeHandler = () => {
              if (registration.installing!.state === 'activated') {
                console.log('✅ Service Worker installation complete and ACTIVE');
                resolve(true);
              } else if (registration.installing!.state === 'redundant') {
                console.warn('⚠️ Service Worker installation failed (redundant)');
                resolve(false);
              }
            };
            registration.installing!.addEventListener('statechange', stateChangeHandler);
            
            // Also check if it becomes active immediately
            if (registration.installing.state === 'activated') {
              resolve(true);
            }
          }),
          new Promise<boolean>((resolve) => {
            setTimeout(() => {
              console.warn('⚠️ Service Worker installation timeout after 5 seconds');
              resolve(false);
            }, 5000);
          })
        ]);
      }
      
      // Check if service worker is waiting
      if (registration.waiting) {
        console.log('⏳ Service Worker is waiting to activate...');
        // Skip waiting to activate immediately
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        // Reload to activate
        window.location.reload();
        return true;
      }
      
      // Service worker registered but not active yet - wait a bit
      console.log('⏳ Service Worker registered but not yet active, waiting...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check again
      const updatedRegistration = await navigator.serviceWorker.getRegistration();
      if (updatedRegistration?.active) {
        console.log('✅ Service Worker is now ACTIVE');
        return true;
      }
    } else {
      // Service worker not registered - wait for auto-registration
      console.log('⏳ Service Worker not yet registered, waiting for auto-registration...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check again after waiting
      const newRegistration = await navigator.serviceWorker.getRegistration();
      if (newRegistration?.active) {
        console.log('✅ Service Worker auto-registered and ACTIVE');
        return true;
      } else if (newRegistration) {
        console.log('⏳ Service Worker registered but not yet active');
        return true; // Will activate soon
      }
        }
        
        // Service worker not active - this is non-critical
        // Common reasons: development mode, localhost, browser settings, or HTTPS required
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const isDev = import.meta.env.DEV;
        
        if (isDev || isLocalhost) {
          console.info('ℹ️ Service Worker not active (expected in development/localhost). App will work normally.');
        } else {
          console.warn('⚠️ Service Worker not active - PWA features may be limited. App will work normally.');
        }
        return false;
      } catch (error) {
        console.error('❌ Error checking service worker:', error);
        return false;
      }
    })(),
    new Promise<boolean>((resolve) => {
      setTimeout(() => {
        // Silent timeout - service worker check is non-critical and expected to timeout in dev
        resolve(false);
      }, 10000);
    })
  ]);

  // Reset flag when check completes (success or failure) and return result
  return checkPromise.then((result) => {
    serviceWorkerCheckInProgress = false;
    return result;
  }).catch((error) => {
    serviceWorkerCheckInProgress = false;
    return false; // Return false on error instead of throwing
  });
}

/**
 * Get service worker status
 */
export async function getServiceWorkerStatus(): Promise<{
  available: boolean;
  registered: boolean;
  active: boolean;
  scope: string | null;
  state: string | null;
}> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return {
      available: false,
      registered: false,
      active: false,
      scope: null,
      state: null
    };
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    
    if (!registration) {
      return {
        available: true,
        registered: false,
        active: false,
        scope: null,
        state: null
      };
    }

    return {
      available: true,
      registered: true,
      active: registration.active !== null,
      scope: registration.scope,
      state: registration.active?.state || registration.waiting?.state || registration.installing?.state || null
    };
  } catch (error) {
    console.error('Error getting service worker status:', error);
    return {
      available: true,
      registered: false,
      active: false,
      scope: null,
      state: null
    };
  }
}

/**
 * Listen for service worker updates
 */
export function listenForServiceWorkerUpdates(callback?: (registration: ServiceWorkerRegistration) => void): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  // Auto-reload when new service worker takes control
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('✅ Service Worker controller changed - new version activated');
    if (callback) {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration) callback(registration);
      });
    }
    // Reload to get new assets immediately
    window.location.reload();
  });

  // Check for updates more frequently (every 5 minutes instead of hourly)
  setInterval(async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        await registration.update();
        
        // If there's a waiting worker, prompt to update
        if (registration.waiting) {
          // Post SKIP_WAITING message to activate immediately
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      }
    } catch (error) {
      // Silently fail - updates are not critical
    }
  }, 5 * 60 * 1000); // Check every 5 minutes
}

