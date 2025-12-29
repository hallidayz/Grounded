/**
 * Service Worker Management
 * 
 * Ensures the service worker is registered and active on every app launch.
 * Critical for PWA functionality, offline support, and AI model caching.
 */

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
        // Wait for installation to complete
        return new Promise((resolve) => {
          registration.installing!.addEventListener('statechange', () => {
            if (registration.installing!.state === 'activated') {
              console.log('✅ Service Worker installation complete and ACTIVE');
              resolve(true);
            }
          });
        });
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
    
    console.warn('⚠️ Service Worker not active after waiting');
    return false;
  } catch (error) {
    console.error('❌ Error checking service worker:', error);
    return false;
  }
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

