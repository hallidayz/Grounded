/**
 * PLATFORM DETECTION & ABSTRACTION
 * 
 * Provides platform detection and abstraction for Tauri, Web, and Mobile environments.
 * Allows the app to work seamlessly across different platforms.
 */

/**
 * Detect if running in Tauri environment
 */
export function isTauri(): boolean {
  // Check build-time constant first (injected by Vite)
  // @ts-ignore
  if (typeof __IS_TAURI_BUILD__ !== 'undefined') {
    // @ts-ignore
    return __IS_TAURI_BUILD__;
  }
  // Runtime fallback
  return typeof window !== 'undefined' && '__TAURI__' in window;
}

/**
 * Detect if running in web browser
 */
export function isWeb(): boolean {
  return typeof window !== 'undefined' && !isTauri();
}

/**
 * Detect if running on mobile device
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
}

/**
 * Detect if running on iOS
 */
export function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

/**
 * Detect if running on Android
 */
export function isAndroid(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android/.test(navigator.userAgent);
}

/**
 * Get platform name
 */
export function getPlatform(): 'tauri' | 'web' | 'mobile' | 'unknown' {
  if (isTauri()) return 'tauri';
  if (isMobile()) return 'mobile';
  if (isWeb()) return 'web';
  return 'unknown';
}

/**
 * Platform-specific feature detection
 */
export const PlatformFeatures = {
  /**
   * Check if localStorage is available
   */
  hasLocalStorage(): boolean {
    try {
      if (typeof window === 'undefined') return false;
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Check if notifications are available
   */
  hasNotifications(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  },

  /**
   * Check if service workers are available
   */
  hasServiceWorkers(): boolean {
    return typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
  },

  /**
   * Check if file system access is available (Tauri or File System Access API)
   */
  hasFileSystem(): boolean {
    if (isTauri()) return true;
    if (typeof window === 'undefined') return false;
    return 'showOpenFilePicker' in window || 'showSaveFilePicker' in window;
  },

  /**
   * Check if haptic feedback is available
   */
  hasHaptics(): boolean {
    if (typeof navigator === 'undefined') return false;
    return 'vibrate' in navigator;
  },
};
