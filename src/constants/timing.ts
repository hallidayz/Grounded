/**
 * Timing Constants
 * 
 * Centralized timing values used throughout the application.
 * Replace magic numbers with these named constants for better maintainability.
 */

/**
 * Debounce delay for user input (milliseconds)
 * Used in: useDashboard.ts, useDebounce.ts
 */
export const DEBOUNCE_DELAY_MS = 500;

/**
 * Request timeout for API calls (milliseconds)
 * Used in: aiService.ts, network requests
 */
export const REQUEST_TIMEOUT_MS = 60000; // 60 seconds

/**
 * Retry delay for failed requests (milliseconds)
 */
export const RETRY_DELAY_MS = 1000; // 1 second

/**
 * Maximum number of retry attempts
 */
export const MAX_RETRY_ATTEMPTS = 3;

/**
 * Session timeout (milliseconds)
 * Time before a session is considered expired
 */
export const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Token expiration time (milliseconds)
 * Time before a reset token expires
 */
export const TOKEN_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Cache refresh interval (milliseconds)
 * How often to check for updates
 */
export const CACHE_REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Model loading timeout (milliseconds)
 * Maximum time to wait for AI model to load
 */
export const MODEL_LOADING_TIMEOUT_MS = 120000; // 2 minutes

/**
 * Animation duration (milliseconds)
 * Standard animation timing
 */
export const ANIMATION_DURATION_MS = 300;

/**
 * Toast notification display time (milliseconds)
 */
export const TOAST_DURATION_MS = 3000; // 3 seconds

/**
 * Auto-save interval (milliseconds)
 * How often to auto-save user data
 */
export const AUTO_SAVE_INTERVAL_MS = 30000; // 30 seconds
