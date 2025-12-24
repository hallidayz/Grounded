/**
 * STORAGE ABSTRACTION
 * 
 * Unified storage interface for Tauri store and browser localStorage.
 * Automatically uses the appropriate storage mechanism based on platform.
 */

import { isTauri } from './platform';

// Tauri store interface (will be imported when available)
let tauriStore: any = null;

/**
 * Initialize storage - loads Tauri store if in Tauri environment
 */
async function initStorage(): Promise<void> {
  if (isTauri()) {
    try {
      // Dynamic import to avoid errors in web environment
      // Use eval to prevent bundler from trying to resolve this at build time
      const tauriStoreModule = await (eval('import("@tauri-apps/plugin-store")') as Promise<typeof import('@tauri-apps/plugin-store')>);
      const { Store } = tauriStoreModule;
      tauriStore = new Store('.settings.dat');
    } catch (error) {
      console.warn('Tauri store not available, falling back to localStorage:', error);
      tauriStore = null;
    }
  }
}

// Initialize on module load
let storageInitialized = false;
if (typeof window !== 'undefined') {
  initStorage().then(() => {
    storageInitialized = true;
  }).catch(() => {
    storageInitialized = true; // Continue even if Tauri store fails
  });
}

/**
 * Get item from storage
 */
export async function getItem<T = string>(key: string): Promise<T | null> {
  if (!storageInitialized) {
    await initStorage();
  }

  try {
    if (isTauri() && tauriStore) {
      const value = await tauriStore.get(key);
      return value as T | null;
    } else {
      // Use localStorage
      const item = localStorage.getItem(key);
      if (item === null) return null;
      try {
        return JSON.parse(item) as T;
      } catch {
        return item as T;
      }
    }
  } catch (error) {
    console.error(`Error getting item ${key}:`, error);
    // Fallback to localStorage
    try {
      const item = localStorage.getItem(key);
      if (item === null) return null;
      try {
        return JSON.parse(item) as T;
      } catch {
        return item as T;
      }
    } catch {
      return null;
    }
  }
}

/**
 * Set item in storage
 */
export async function setItem<T = string>(key: string, value: T): Promise<void> {
  if (!storageInitialized) {
    await initStorage();
  }

  try {
    if (isTauri() && tauriStore) {
      await tauriStore.set(key, value);
      await tauriStore.save();
    } else {
      // Use localStorage
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, serialized);
    }
  } catch (error) {
    console.error(`Error setting item ${key}:`, error);
    // Fallback to localStorage
    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, serialized);
    } catch (fallbackError) {
      console.error('Fallback storage also failed:', fallbackError);
    }
  }
}

/**
 * Remove item from storage
 */
export async function removeItem(key: string): Promise<void> {
  if (!storageInitialized) {
    await initStorage();
  }

  try {
    if (isTauri() && tauriStore) {
      await tauriStore.delete(key);
      await tauriStore.save();
    } else {
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.error(`Error removing item ${key}:`, error);
    // Fallback to localStorage
    try {
      localStorage.removeItem(key);
    } catch (fallbackError) {
      console.error('Fallback storage removal also failed:', fallbackError);
    }
  }
}

/**
 * Clear all storage
 */
export async function clear(): Promise<void> {
  if (!storageInitialized) {
    await initStorage();
  }

  try {
    if (isTauri() && tauriStore) {
      await tauriStore.clear();
      await tauriStore.save();
    } else {
      localStorage.clear();
    }
  } catch (error) {
    console.error('Error clearing storage:', error);
    // Fallback to localStorage
    try {
      localStorage.clear();
    } catch (fallbackError) {
      console.error('Fallback storage clear also failed:', fallbackError);
    }
  }
}

/**
 * Get all keys from storage
 */
export async function keys(): Promise<string[]> {
  if (!storageInitialized) {
    await initStorage();
  }

  try {
    if (isTauri() && tauriStore) {
      return await tauriStore.keys();
    } else {
      return Object.keys(localStorage);
    }
  } catch (error) {
    console.error('Error getting storage keys:', error);
    // Fallback to localStorage
    try {
      return Object.keys(localStorage);
    } catch {
      return [];
    }
  }
}

/**
 * Synchronous getItem for compatibility (uses localStorage only)
 * Use this only when you need synchronous access and are sure you're in web mode
 */
export function getItemSync<T = string>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return null;
    try {
      return JSON.parse(item) as T;
    } catch {
      return item as T;
    }
  } catch {
    return null;
  }
}

/**
 * Synchronous setItem for compatibility (uses localStorage only)
 * Use this only when you need synchronous access and are sure you're in web mode
 */
export function setItemSync<T = string>(key: string, value: T): void {
  try {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, serialized);
  } catch (error) {
    console.error(`Error setting item ${key} synchronously:`, error);
  }
}

