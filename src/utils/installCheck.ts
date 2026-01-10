/**
 * Installation Check and Verification
 * 
 * Ensures the app is installed locally before running.
 * Checks for component availability, updates if needed, then opens from device.
 * Critical for iOS which doesn't download from address bar.
 */

interface InstallationStatus {
  isInstalled: boolean;
  isStandalone: boolean;
  serviceWorkerActive: boolean;
  cacheReady: boolean;
  needsUpdate: boolean;
  platform: 'ios' | 'android' | 'desktop' | 'unknown';
}

/**
 * Check if app is installed as PWA
 */
export function isPWAInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check display mode (most reliable)
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  
  // iOS Safari standalone mode
  if ((window.navigator as any).standalone === true) {
    return true;
  }
  
  // Check if launched from home screen (iOS)
  if (window.matchMedia('(display-mode: fullscreen)').matches) {
    return true;
  }
  
  return false;
}

/**
 * Detect platform for installation instructions
 */
export function detectPlatform(): 'ios' | 'android' | 'desktop' | 'unknown' {
  if (typeof window === 'undefined') return 'unknown';
  
  const ua = window.navigator.userAgent || '';
  const platform = window.navigator.platform || '';
  
  // iOS detection
  if (/iPad|iPhone|iPod/.test(ua) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
    return 'ios';
  }
  
  // Android detection
  if (/Android/.test(ua)) {
    return 'android';
  }
  
  // Desktop
  return 'desktop';
}

/**
 * Check if service worker is active and caching
 */
export async function checkServiceWorkerStatus(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }
  
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return false;
    
    // Check if service worker is active
    if (registration.active) {
      return true;
    }
    
    // Check if installing
    if (registration.installing) {
      // Wait for installation
      return new Promise((resolve) => {
        const stateChangeHandler = () => {
          if (registration.installing!.state === 'activated') {
            resolve(true);
          } else if (registration.installing!.state === 'redundant') {
            resolve(false);
          }
        };
        registration.installing!.addEventListener('statechange', stateChangeHandler);
        
        // Timeout after 5 seconds
        setTimeout(() => resolve(false), 5000);
      });
    }
    
    return false;
  } catch (error) {
    console.error('[installCheck] Error checking service worker:', error);
    return false;
  }
}

/**
 * Check if critical assets are cached
 */
export async function checkCacheReady(): Promise<boolean> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    // In development, be lenient - return true if caches API not available
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return true;
    }
    return false;
  }
  
  try {
    const cacheNames = await caches.keys();
    if (cacheNames.length === 0) {
      // In development, be lenient
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return true;
      }
      return false;
    }
    
    // Check for critical files in cache
    const criticalFiles = [
      '/',
      '/index.html',
      '/manifest.json',
    ];
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const cached = await Promise.all(
        criticalFiles.map(url => cache.match(url))
      );
      
      // If at least one critical file is cached, consider cache ready
      if (cached.some(response => response !== undefined)) {
        return true;
      }
    }
    
    // In development, be lenient - return true even if cache not ready
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('[installCheck] Error checking cache:', error);
    // In development, be lenient
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return true;
    }
    return false;
  }
}

/**
 * Check for service worker updates
 */
export async function checkForUpdates(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }
  
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return false;
    
    // Check if there's an update available
    await registration.update();
    
    // If there's a waiting worker, update is available
    if (registration.waiting) {
      return true;
    }
    
    // Check if installing (update in progress)
    if (registration.installing) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('[installCheck] Error checking for updates:', error);
    return false;
  }
}

/**
 * Get comprehensive installation status
 */
export async function getInstallationStatus(): Promise<InstallationStatus> {
  const [serviceWorkerActive, cacheReady, needsUpdate] = await Promise.all([
    checkServiceWorkerStatus(),
    checkCacheReady(),
    checkForUpdates(),
  ]);
  
  return {
    isInstalled: isPWAInstalled(),
    isStandalone: window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true,
    serviceWorkerActive,
    cacheReady,
    needsUpdate,
    platform: detectPlatform(),
  };
}

/**
 * Wait for service worker to be ready before loading app
 */
export async function waitForServiceWorkerReady(maxWait: number = 10000): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }
  
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWait) {
    const registration = await navigator.serviceWorker.getRegistration();
    
    if (registration?.active) {
      return true;
    }
    
    // Wait a bit before checking again
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return false;
}

/**
 * Ensure app is installed before proceeding
 * Shows installation prompt if not installed
 */
export async function ensureInstalled(): Promise<boolean> {
  const status = await getInstallationStatus();
  
  // If already installed and ready, proceed
  if (status.isInstalled && status.serviceWorkerActive && status.cacheReady) {
    return true;
  }
  
  // If not installed, we need to show installation prompt
  // This will be handled by the InstallationGate component
  return false;
}

