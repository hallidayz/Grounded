/**
 * Debug Log Service
 * Collects diagnostic information for troubleshooting and support
 */

import { getCompatibilityReport } from './aiService';
import { getModelStatus } from './aiService';

export interface DebugLogEntry {
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  details?: any;
  stack?: string;
}

export interface DebugLog {
  appVersion: string;
  timestamp: string;
  userAgent: string;
  platform: string;
  language: string;
  timezone: string;
  screenResolution: string;
  browserInfo: {
    name: string;
    version: string;
    engine: string;
  };
  compatibility: {
    sharedArrayBuffer: boolean;
    crossOriginIsolated: boolean;
    webGPU: boolean;
    webAssembly: boolean;
    estimatedMemory: number;
    device: string;
    browser: string;
  };
  aiModelStatus: {
    loaded: boolean;
    loading: boolean;
    moodTracker: boolean;
    counselingCoach: boolean;
  };
  errors: DebugLogEntry[];
  warnings: DebugLogEntry[];
  recentLogs: DebugLogEntry[];
  localStorage: {
    available: boolean;
    keys: string[];
  };
  indexedDB: {
    available: boolean;
    databases: string[];
  };
  serviceWorker: {
    available: boolean;
    registered: boolean;
    scope?: string;
  };
  networkStatus: {
    online: boolean;
    connectionType?: string;
  };
}

const MAX_LOG_ENTRIES = 100;
const logEntries: DebugLogEntry[] = [];

// Track initialization state to prevent multiple initializations
let isInitialized = false;
let originalError: typeof console.error | null = null;
let originalWarn: typeof console.warn | null = null;
const errorHandler = (event: ErrorEvent) => {
  logEntry('error', event.message, {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack,
  });
};
const rejectionHandler = (event: PromiseRejectionEvent) => {
  logEntry('error', `Unhandled Promise Rejection: ${event.reason}`, {
    reason: event.reason,
    stack: event.reason?.stack,
  });
};

/**
 * Initialize debug logging - capture console errors and warnings
 * Safe to call multiple times - will only initialize once
 */
export function initializeDebugLogging() {
  // Prevent multiple initializations
  if (isInitialized) {
    return;
  }

  // Store original console methods only on first call
  if (!originalError) {
    originalError = console.error.bind(console);
  }
  if (!originalWarn) {
    originalWarn = console.warn.bind(console);
  }

  // Wrap console.error
  console.error = (...args: any[]) => {
    logEntry('error', args.join(' '), { args });
    originalError.apply(console, args);
  };

  // Wrap console.warn
  console.warn = (...args: any[]) => {
    const message = args.join(' ');
    
    // Filter out benign ONNX Runtime warnings that are not actionable
    const isOnnxRuntimeWarning = 
      message.includes('onnxruntime') ||
      message.includes('ONNX Runtime') ||
      message.includes('CleanUnusedInitializersAndNodeArgs') ||
      message.includes('Removing initializer') ||
      message.includes('It is not used by any node') ||
      message.includes('/decoder/block.') ||
      message.includes('/DenseReluDense/act/Constant') ||
      message.includes('Constant_') ||
      message.includes('_output_0');
    
    // Filter out other known benign warnings
    const isBenignWarning =
      message.includes('[W:onnxruntime:') ||
      message.includes('graph.cc:') ||
      message.includes('should be removed from the model') ||
      message.includes('aph.cc:');
    
    // Only log warnings that are actionable (not ONNX Runtime internal messages)
    if (!isOnnxRuntimeWarning && !isBenignWarning) {
      logEntry('warning', message, { args });
    }
    // Suppress these warnings from console output entirely (they're not actionable)
    if (!isOnnxRuntimeWarning && !isBenignWarning) {
      originalWarn.apply(console, args);
    }
    // ONNX Runtime warnings are silently ignored - they're just model optimization messages
  };

  // Add event listeners (only once)
  window.addEventListener('error', errorHandler);
  window.addEventListener('unhandledrejection', rejectionHandler);

  isInitialized = true;
}

/**
 * Clear all debug logs
 */
export function clearDebugLog() {
  logEntries.length = 0;
  logEntry('info', 'Debug log cleared by user');
}

/**
 * Clear specific log entries by level
 */
export function clearLogEntriesByLevel(level: 'error' | 'warning' | 'info') {
  const initialLength = logEntries.length;
  for (let i = logEntries.length - 1; i >= 0; i--) {
    if (logEntries[i].level === level) {
      logEntries.splice(i, 1);
    }
  }
  if (logEntries.length < initialLength) {
    logEntry('info', `Cleared ${level} entries from debug log`);
  }
}

/**
 * Clear a specific log entry by matching timestamp and message
 */
export function clearLogEntry(timestamp: string, message: string, level: 'error' | 'warning' | 'info') {
  const index = logEntries.findIndex(
    e => e.timestamp === timestamp && e.message === message && e.level === level
  );
  if (index !== -1) {
    logEntries.splice(index, 1);
    return true;
  }
  return false;
}

/**
 * Get log entries (for UI components that need direct access)
 */
export function getLogEntries(): DebugLogEntry[] {
  return [...logEntries]; // Return a copy to prevent direct mutation
}

/**
 * Add a log entry
 */
export function logEntry(level: 'error' | 'warning' | 'info', message: string, details?: any) {
  const entry: DebugLogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    details,
    stack: details?.stack || (details?.error instanceof Error ? details.error.stack : undefined),
  };

  logEntries.push(entry);
  
  // Keep only the most recent entries
  if (logEntries.length > MAX_LOG_ENTRIES) {
    logEntries.shift();
  }
}

/**
 * Get browser information
 */
function getBrowserInfo() {
  const ua = navigator.userAgent;
  let browserName = 'Unknown';
  let browserVersion = 'Unknown';
  let engine = 'Unknown';

  // Detect browser - check Edge first since it includes Chrome in UA
  if (ua.includes('Edg')) {
    browserName = 'Edge';
    const match = ua.match(/Edg\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
    engine = 'Blink';
  } else if (ua.includes('Chrome') && !ua.includes('Edg')) {
    browserName = 'Chrome';
    const match = ua.match(/Chrome\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
    engine = 'Blink';
  } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
    browserName = 'Safari';
    const match = ua.match(/Version\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
    engine = 'WebKit';
  } else if (ua.includes('Firefox')) {
    browserName = 'Firefox';
    const match = ua.match(/Firefox\/(\d+)/);
    browserVersion = match ? match[1] : 'Unknown';
    engine = 'Gecko';
  }

  // Detect engine if not already set
  if (engine === 'Unknown') {
    if (ua.includes('WebKit')) {
      engine = 'WebKit';
    } else if (ua.includes('Gecko')) {
      engine = 'Gecko';
    }
  }

  return { name: browserName, version: browserVersion, engine };
}

/**
 * Get platform information
 * Note: Apple Silicon Macs (M1, M2, M3, etc.) report as "MacIntel" in navigator.platform
 * This is a browser limitation - the actual architecture cannot be reliably detected from JavaScript
 */
function getPlatformInfo(): string {
  const platform = navigator.platform;
  
  // Add architecture hint if available (some browsers expose this)
  if ('hardwareConcurrency' in navigator) {
    const cores = navigator.hardwareConcurrency;
    // Apple Silicon typically has more cores, but this is not reliable
    // For now, just return the platform as reported by the browser
  }
  
  return platform;
}

/**
 * Get IndexedDB database names
 */
async function getIndexedDBDatabases(): Promise<string[]> {
  try {
    if (!('indexedDB' in window)) {
      return [];
    }

    // Modern browsers support indexedDB.databases()
    if ('databases' in indexedDB) {
      const databases = await (indexedDB as any).databases();
      return databases.map((db: any) => db.name);
    }

    // Fallback: try to detect common database names
    return ['GroundedDB']; // Default database name
  } catch (error) {
    return [];
  }
}

/**
 * Get Service Worker information
 */
async function getServiceWorkerInfo() {
  const available = 'serviceWorker' in navigator;
  let registered = false;
  let scope: string | undefined;

  if (available) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      registered = !!registration;
      scope = registration?.scope;
    } catch (error) {
      // Ignore
    }
  }

  return { available, registered, scope };
}

/**
 * Get network connection information
 */
function getNetworkInfo() {
  const online = navigator.onLine;
  let connectionType: string | undefined;

  if ('connection' in navigator) {
    const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (conn) {
      connectionType = conn.effectiveType || conn.type;
    }
  }

  return { online, connectionType };
}

/**
 * Generate complete debug log
 */
export async function generateDebugLog(): Promise<DebugLog> {
  const compatibilityReport = getCompatibilityReport();
  const compatibility = compatibilityReport || {
    sharedArrayBuffer: false,
    crossOriginIsolated: false,
    webGPU: false,
    wasm: false,
    estimatedMemory: null,
    deviceType: 'unknown' as const,
    browser: 'Unknown',
    os: 'Unknown',
    isCompatible: false,
    issues: [],
    recommendations: [],
    canUseAI: false,
    suggestedStrategy: 'unavailable' as const,
  };
  const modelStatus = getModelStatus();

  const errors = logEntries.filter(e => e.level === 'error');
  const warnings = logEntries.filter(e => e.level === 'warning');
  const recentLogs = logEntries.slice(-20); // Last 20 entries

  const browserInfo = getBrowserInfo();
  const indexedDBDatabases = await getIndexedDBDatabases();
  const serviceWorkerInfo = await getServiceWorkerInfo();
  const networkInfo = getNetworkInfo();

  // Get localStorage keys (excluding sensitive data)
  const localStorageKeys: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        localStorageKeys.push(key);
      }
    }
  } catch (error) {
    // Ignore
  }

  return {
    appVersion: '1.12.27', // Should match package.json version
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    platform: getPlatformInfo(),
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    browserInfo,
    compatibility: {
      sharedArrayBuffer: compatibility.sharedArrayBuffer,
      crossOriginIsolated: compatibility.crossOriginIsolated,
      webGPU: compatibility.webGPU,
      webAssembly: compatibility.wasm,
      estimatedMemory: compatibility.estimatedMemory || 0,
      device: compatibility.deviceType,
      browser: `${compatibility.browser} on ${compatibility.os}`,
    },
    aiModelStatus: {
      loaded: modelStatus.loaded,
      loading: modelStatus.loading,
      moodTracker: modelStatus.moodTracker,
      counselingCoach: modelStatus.counselingCoach,
    },
    errors,
    warnings,
    recentLogs,
    localStorage: {
      available: typeof Storage !== 'undefined',
      keys: localStorageKeys,
    },
    indexedDB: {
      available: 'indexedDB' in window,
      databases: indexedDBDatabases,
    },
    serviceWorker: serviceWorkerInfo,
    networkStatus: networkInfo,
  };
}

/**
 * Format debug log as text for email
 */
export function formatDebugLogForEmail(log: DebugLog): string {
  const lines: string[] = [];

  lines.push('='.repeat(60));
  lines.push('GROUNDED APP DEBUG LOG');
  lines.push('='.repeat(60));
  lines.push('');
  lines.push(`Generated: ${log.timestamp}`);
  lines.push(`App Version: ${log.appVersion}`);
  lines.push('');

  lines.push('SYSTEM INFORMATION');
  lines.push('-'.repeat(60));
  lines.push(`Platform: ${log.platform}`);
  lines.push(`Browser: ${log.browserInfo.name} ${log.browserInfo.version} (${log.browserInfo.engine})`);
  lines.push(`User Agent: ${log.userAgent}`);
  lines.push(`Language: ${log.language}`);
  lines.push(`Timezone: ${log.timezone}`);
  lines.push(`Screen Resolution: ${log.screenResolution}`);
  lines.push('');

  lines.push('BROWSER COMPATIBILITY');
  lines.push('-'.repeat(60));
  lines.push(`SharedArrayBuffer: ${log.compatibility.sharedArrayBuffer ? '✓ Available' : '✗ Not Available'}`);
  lines.push(`Cross-Origin Isolated: ${log.compatibility.crossOriginIsolated ? '✓ Enabled' : '✗ Not Enabled'}`);
  lines.push(`WebGPU: ${log.compatibility.webGPU ? '✓ Available' : '✗ Not Available'}`);
  lines.push(`WebAssembly: ${log.compatibility.webAssembly ? '✓ Available' : '✗ Not Available'}`);
  lines.push(`Estimated Memory: ${log.compatibility.estimatedMemory} MB`);
  lines.push(`Device: ${log.compatibility.device}`);
  lines.push(`Browser: ${log.compatibility.browser}`);
  lines.push('');

  lines.push('AI MODEL STATUS');
  lines.push('-'.repeat(60));
  lines.push(`Models Loaded: ${log.aiModelStatus.loaded ? '✓ Yes' : '✗ No'}`);
  lines.push(`Currently Loading: ${log.aiModelStatus.loading ? 'Yes' : 'No'}`);
  lines.push(`Mood Tracker: ${log.aiModelStatus.moodTracker ? '✓ Available' : '✗ Not Available'}`);
  lines.push(`Counseling Coach: ${log.aiModelStatus.counselingCoach ? '✓ Available' : '✗ Not Available'}`);
  lines.push('');

  lines.push('STORAGE');
  lines.push('-'.repeat(60));
  lines.push(`LocalStorage: ${log.localStorage.available ? '✓ Available' : '✗ Not Available'}`);
  lines.push(`LocalStorage Keys: ${log.localStorage.keys.join(', ') || 'None'}`);
  lines.push(`IndexedDB: ${log.indexedDB.available ? '✓ Available' : '✗ Not Available'}`);
  lines.push(`IndexedDB Databases: ${log.indexedDB.databases.join(', ') || 'None'}`);
  lines.push('');

  lines.push('SERVICE WORKER');
  lines.push('-'.repeat(60));
  lines.push(`Available: ${log.serviceWorker.available ? '✓ Yes' : '✗ No'}`);
  lines.push(`Registered: ${log.serviceWorker.registered ? '✓ Yes' : '✗ No'}`);
  if (log.serviceWorker.scope) {
    lines.push(`Scope: ${log.serviceWorker.scope}`);
  }
  lines.push('');

  lines.push('NETWORK');
  lines.push('-'.repeat(60));
  lines.push(`Online: ${log.networkStatus.online ? '✓ Yes' : '✗ No'}`);
  if (log.networkStatus.connectionType) {
    lines.push(`Connection Type: ${log.networkStatus.connectionType}`);
  }
  lines.push('');

  if (log.errors.length > 0) {
    lines.push('ERRORS');
    lines.push('-'.repeat(60));
    log.errors.forEach((error, index) => {
      lines.push(`${index + 1}. [${error.timestamp}] ${error.message}`);
      if (error.stack) {
        lines.push(`   Stack: ${error.stack.split('\n').slice(0, 3).join('\n   ')}`);
      }
      if (error.details) {
        lines.push(`   Details: ${JSON.stringify(error.details, null, 2).split('\n').slice(0, 5).join('\n   ')}`);
      }
      lines.push('');
    });
  }

  if (log.warnings.length > 0) {
    lines.push('WARNINGS');
    lines.push('-'.repeat(60));
    log.warnings.forEach((warning, index) => {
      lines.push(`${index + 1}. [${warning.timestamp}] ${warning.message}`);
      if (warning.details) {
        lines.push(`   Details: ${JSON.stringify(warning.details, null, 2).split('\n').slice(0, 3).join('\n   ')}`);
      }
      lines.push('');
    });
  }

  if (log.recentLogs.length > 0) {
    lines.push('RECENT LOG ENTRIES (Last 20)');
    lines.push('-'.repeat(60));
    log.recentLogs.forEach((entry, index) => {
      lines.push(`${index + 1}. [${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}`);
    });
    lines.push('');
  }

  lines.push('='.repeat(60));
  lines.push('END OF DEBUG LOG');
  lines.push('='.repeat(60));

  return lines.join('\n');
}

/**
 * Create email with debug log
 */
export function createEmailWithDebugLog(log: DebugLog): string {
  const subject = encodeURIComponent('Grounded App Debug Log - Support Request');
  const body = encodeURIComponent(
    `Hello,\n\nI'm experiencing issues with the Grounded app. Please find the debug log attached below.\n\n` +
    `---\n\n${formatDebugLogForEmail(log)}\n\n---\n\nThank you for your help!`
  );
  
  return `mailto:ac.minds.ai@gmail.com?subject=${subject}&body=${body}`;
}

