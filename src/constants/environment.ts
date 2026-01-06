/**
 * Environment Configuration
 * 
 * Provides environment-specific settings including Dev/Prod toggles
 * for development tools and features.
 */

/**
 * Check if we're in development mode
 * Uses process.env.NODE_ENV as primary source (set by build tools)
 */
export function isDevelopment(): boolean {
  // Primary: Check NODE_ENV (set by Vite/Webpack build scripts)
  // This is the most reliable indicator as it's set at build time
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
    return true;
  }
  
  // Secondary: Check Vite's import.meta.env (for Vite-based builds)
  if (typeof window !== 'undefined' && import.meta.env?.MODE === 'development') {
    return true;
  }
  
  // Tertiary: Check for localhost/127.0.0.1 (runtime detection)
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return true;
    }
  }
  
  // Override: Check for explicit dev flag in localStorage (for testing/debugging)
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('dev_mode') === 'true';
  }
  
  return false;
}

/**
 * Check if we're in production mode
 */
export function isProduction(): boolean {
  return !isDevelopment();
}

/**
 * Check if Database Inspector should be enabled
 * Only available in development mode
 */
export function isDatabaseInspectorEnabled(): boolean {
  return isDevelopment();
}

/**
 * Check if data pruning should be enabled
 * Enabled in production, can be disabled in dev for testing
 */
export function isDataPruningEnabled(): boolean {
  // In development, can be disabled via localStorage flag
  if (isDevelopment() && typeof localStorage !== 'undefined') {
    return localStorage.getItem('enable_data_pruning') !== 'false';
  }
  
  // Always enabled in production
  return true;
}

/**
 * Get environment name
 */
export function getEnvironment(): 'development' | 'production' {
  return isDevelopment() ? 'development' : 'production';
}

