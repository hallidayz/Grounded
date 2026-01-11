/**
 * Centralized Logging Utility
 * 
 * Replaces console.* statements with environment-aware logging.
 * - Development: All logs enabled
 * - Production: Only errors logged (warnings can be toggled)
 * 
 * Use this instead of console.log/warn/error throughout the codebase.
 */

const isDevelopment = import.meta.env.DEV || process.env.NODE_ENV === 'development';

/**
 * Log levels for filtering
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * Logger configuration
 */
interface LoggerConfig {
  level: LogLevel;
  enableWarningsInProduction: boolean;
}

let config: LoggerConfig = {
  level: isDevelopment ? LogLevel.DEBUG : LogLevel.ERROR,
  enableWarningsInProduction: false, // Set to true to enable warnings in production
};

/**
 * Set logger configuration
 */
export function setLoggerConfig(newConfig: Partial<LoggerConfig>): void {
  config = { ...config, ...newConfig };
}

/**
 * Get current logger configuration
 */
export function getLoggerConfig(): LoggerConfig {
  return { ...config };
}

/**
 * Check if a log level should be output
 */
function shouldLog(level: LogLevel): boolean {
  if (isDevelopment) {
    return true; // Log everything in development
  }
  
  // In production:
  if (level === LogLevel.ERROR) {
    return true; // Always log errors
  }
  
  if (level === LogLevel.WARN && config.enableWarningsInProduction) {
    return true; // Warnings only if enabled
  }
  
  return false; // Don't log debug/info in production
}

/**
 * Logger interface
 */
export const logger = {
  /**
   * Debug logging (development only)
   * Use for detailed debugging information
   */
  debug: (...args: unknown[]): void => {
    if (shouldLog(LogLevel.DEBUG)) {
      console.debug('[DEBUG]', ...args);
    }
  },

  /**
   * Info logging (development only)
   * Use for general information
   */
  info: (...args: unknown[]): void => {
    if (shouldLog(LogLevel.INFO)) {
      console.info('[INFO]', ...args);
    }
  },

  /**
   * Warning logging
   * Use for non-critical issues that should be addressed
   */
  warn: (...args: unknown[]): void => {
    if (shouldLog(LogLevel.WARN)) {
      console.warn('[WARN]', ...args);
    }
  },

  /**
   * Error logging (always enabled)
   * Use for errors that need attention
   */
  error: (...args: unknown[]): void => {
    if (shouldLog(LogLevel.ERROR)) {
      console.error('[ERROR]', ...args);
    }
  },

  /**
   * Log with context prefix
   * Useful for module-specific logging
   */
  withContext: (context: string) => ({
    debug: (...args: unknown[]) => logger.debug(`[${context}]`, ...args),
    info: (...args: unknown[]) => logger.info(`[${context}]`, ...args),
    warn: (...args: unknown[]) => logger.warn(`[${context}]`, ...args),
    error: (...args: unknown[]) => logger.error(`[${context}]`, ...args),
  }),
};

/**
 * Default export for convenience
 */
export default logger;
