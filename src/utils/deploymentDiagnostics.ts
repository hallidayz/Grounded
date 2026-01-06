/**
 * Deployment Diagnostics Utility
 * 
 * Helps identify deployment-related issues that can cause credential resets:
 * - Origin changes (preview vs production URLs)
 * - Dexie version mismatches
 * - Environment variable inconsistencies
 * - Storage scope issues
 */

import { db, CURRENT_DB_VERSION } from '../services/dexieDB';
import { isDevelopment } from '../constants/environment';

export interface DeploymentDiagnosticResult {
  origin: {
    current: string;
    isProduction: boolean;
    isPreview: boolean;
    storageScope: string;
  };
  dexie: {
    version: number;
    expectedVersion: number;
    versionMatch: boolean;
    databaseExists: boolean;
    storesCount: number;
  };
  storage: {
    indexedDBUsage: number | null;
    localStorageKeys: string[];
    sessionStorageKeys: string[];
    hasAuthData: boolean;
  };
  environment: {
    dbVersion: number;
    isDev: boolean;
    nodeEnv: string | undefined;
  };
  issues: string[];
  recommendations: string[];
}

/**
 * Run comprehensive deployment diagnostics
 */
export async function runDeploymentDiagnostics(): Promise<DeploymentDiagnosticResult> {
  const result: DeploymentDiagnosticResult = {
    origin: {
      current: window.location.origin,
      isProduction: false,
      isPreview: false,
      storageScope: window.location.origin,
    },
    dexie: {
      version: 0,
      expectedVersion: CURRENT_DB_VERSION,
      versionMatch: false,
      databaseExists: false,
      storesCount: 0,
    },
    storage: {
      indexedDBUsage: null,
      localStorageKeys: [],
      sessionStorageKeys: [],
      hasAuthData: false,
    },
    environment: {
      dbVersion: CURRENT_DB_VERSION,
      isDev: isDevelopment(),
      nodeEnv: typeof process !== 'undefined' ? process.env?.NODE_ENV : undefined,
    },
    issues: [],
    recommendations: [],
  };

  // 1. Check origin
  const origin = window.location.origin;
  result.origin.isProduction = origin.includes('grounded-nu.vercel.app') || 
                               origin.includes('grounded.app') ||
                               !origin.includes('vercel.app');
  result.origin.isPreview = origin.includes('.vercel.app') && !result.origin.isProduction;

  // 2. Check Dexie database version
  try {
    const databases = await indexedDB.databases();
    const groundedDB = databases.find(db => db.name === 'groundedDB');
    
    if (groundedDB) {
      result.dexie.databaseExists = true;
      result.dexie.version = groundedDB.version || 0;
      result.dexie.versionMatch = result.dexie.version === result.dexie.expectedVersion;
      
      // Count stores (approximate - open DB to get exact count)
      try {
        await db.open();
        result.dexie.storesCount = db.tables.length;
      } catch (err) {
        // Database might be locked or have version issues
        result.issues.push(`Cannot open database: ${err instanceof Error ? err.message : String(err)}`);
      }
    } else {
      result.issues.push('Dexie database not found - may be first visit or database was cleared');
    }
  } catch (err) {
    result.issues.push(`Error checking IndexedDB: ${err instanceof Error ? err.message : String(err)}`);
  }

  // 3. Check storage usage and keys
  try {
    const estimate = await navigator.storage.estimate();
    result.storage.indexedDBUsage = estimate.usage || null;
  } catch (err) {
    // Storage estimate not available
  }

  // Check localStorage
  if (typeof localStorage !== 'undefined') {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        result.storage.localStorageKeys.push(key);
        // Check for auth-related keys
        if (key.includes('auth') || key.includes('user') || key.includes('token') || key.includes('session')) {
          result.storage.hasAuthData = true;
        }
      }
    }
  }

  // Check sessionStorage
  if (typeof sessionStorage !== 'undefined') {
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        result.storage.sessionStorageKeys.push(key);
        if (key.includes('auth') || key.includes('user') || key.includes('token') || key.includes('session')) {
          result.storage.hasAuthData = true;
        }
      }
    }
  }

  // 4. Identify issues and provide recommendations
  if (!result.dexie.versionMatch && result.dexie.databaseExists) {
    result.issues.push(
      `Version mismatch: Database version (${result.dexie.version}) != Expected version (${result.dexie.expectedVersion})`
    );
    result.recommendations.push(
      'Version mismatch detected. This may cause VersionError. Check VITE_DB_VERSION environment variable.'
    );
  }

  if (result.origin.isPreview) {
    result.issues.push('Using preview URL - storage is isolated from production');
    result.recommendations.push(
      'Preview URLs have separate IndexedDB/localStorage. Use production URL (grounded-nu.vercel.app) for persistent data.'
    );
  }

  if (!result.storage.hasAuthData && result.dexie.databaseExists) {
    result.issues.push('No auth data found in storage despite database existing');
    result.recommendations.push(
      'Credentials may have been cleared. Check if this is expected (logout, migration, etc.)'
    );
  }

  if (result.dexie.databaseExists && result.dexie.storesCount === 0) {
    result.issues.push('Database exists but has no stores - may indicate schema issue');
    result.recommendations.push('Database may need migration or recreation');
  }

  return result;
}

/**
 * Log diagnostic results to console in a readable format
 */
export function logDeploymentDiagnostics(result: DeploymentDiagnosticResult): void {
  console.group('🔍 Deployment Diagnostics');
  
  console.group('📍 Origin');
  console.log('Current:', result.origin.current);
  console.log('Is Production:', result.origin.isProduction);
  console.log('Is Preview:', result.origin.isPreview);
  console.log('Storage Scope:', result.origin.storageScope);
  console.groupEnd();
  
  console.group('💾 Dexie Database');
  console.log('Expected Version:', result.dexie.expectedVersion);
  console.log('Actual Version:', result.dexie.version);
  console.log('Version Match:', result.dexie.versionMatch ? '✅' : '❌');
  console.log('Database Exists:', result.dexie.databaseExists ? '✅' : '❌');
  console.log('Stores Count:', result.dexie.storesCount);
  console.groupEnd();
  
  console.group('📦 Storage');
  console.log('IndexedDB Usage:', result.storage.indexedDBUsage ? `${(result.storage.indexedDBUsage / 1024 / 1024).toFixed(2)} MB` : 'Unknown');
  console.log('localStorage Keys:', result.storage.localStorageKeys.length);
  console.log('sessionStorage Keys:', result.storage.sessionStorageKeys.length);
  console.log('Has Auth Data:', result.storage.hasAuthData ? '✅' : '❌');
  console.groupEnd();
  
  console.group('⚙️ Environment');
  console.log('DB Version (env):', result.environment.dbVersion);
  console.log('Is Dev:', result.environment.isDev);
  console.log('NODE_ENV:', result.environment.nodeEnv || 'undefined');
  console.groupEnd();
  
  if (result.issues.length > 0) {
    console.group('⚠️ Issues Detected');
    result.issues.forEach(issue => console.warn('•', issue));
    console.groupEnd();
  }
  
  if (result.recommendations.length > 0) {
    console.group('💡 Recommendations');
    result.recommendations.forEach(rec => console.info('•', rec));
    console.groupEnd();
  }
  
  console.groupEnd();
}

/**
 * Quick diagnostic check - returns true if deployment looks healthy
 */
export async function isDeploymentHealthy(): Promise<boolean> {
  const diagnostics = await runDeploymentDiagnostics();
  
  // Deployment is healthy if:
  // 1. No version mismatches
  // 2. No critical issues
  // 3. Either database doesn't exist (first visit) or version matches
  
  const hasVersionMismatch = diagnostics.dexie.databaseExists && !diagnostics.dexie.versionMatch;
  const hasCriticalIssues = diagnostics.issues.some(issue => 
    issue.includes('VersionError') || 
    issue.includes('Cannot open database')
  );
  
  return !hasVersionMismatch && !hasCriticalIssues;
}

/**
 * Export diagnostic data as JSON for debugging
 */
export async function exportDiagnostics(): Promise<string> {
  const diagnostics = await runDeploymentDiagnostics();
  return JSON.stringify(diagnostics, null, 2);
}

