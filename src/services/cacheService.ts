/**
 * Cache Service
 * Provides utilities for clearing various caches without deleting user data
 */

/**
 * Clear all caches (Cache API, Service Workers, AI model cache)
 * This does NOT delete user data, logs, or settings
 */
export async function clearAllCaches(): Promise<void> {
  console.log('[CacheService] Starting cache clear...');
  
  try {
    // Step 1: Clear Cache API caches
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        console.log(`[CacheService] Found ${cacheNames.length} cache(s) to delete`);
        
        await Promise.all(
          cacheNames.map(cacheName => {
            console.log(`[CacheService] Deleting cache: ${cacheName}`);
            return caches.delete(cacheName);
          })
        );
        console.log('[CacheService] Cleared all Cache API caches');
      } catch (error) {
        console.warn('[CacheService] Failed to clear Cache API caches:', error);
      }
    }
    
    // Step 2: Unregister service workers (forces fresh registration)
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        console.log(`[CacheService] Found ${registrations.length} service worker(s) to unregister`);
        
        await Promise.all(
          registrations.map(registration => {
            console.log(`[CacheService] Unregistering service worker: ${registration.scope}`);
            return registration.unregister();
          })
        );
        console.log('[CacheService] Unregistered all service workers');
      } catch (error) {
        console.warn('[CacheService] Failed to unregister service workers:', error);
      }
    }
    
    // Step 3: Clear AI model cache
    try {
      const { clearModels } = await import('./ai/models');
      await clearModels();
      console.log('[CacheService] Cleared AI model cache');
    } catch (error) {
      console.warn('[CacheService] Failed to clear AI model cache:', error);
    }
    
    // Step 4: Clear AI response cache (localStorage)
    try {
      const aiCacheKeys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('ai_cache_')) {
          aiCacheKeys.push(key);
        }
      }
      aiCacheKeys.forEach(key => localStorage.removeItem(key));
      console.log(`[CacheService] Cleared ${aiCacheKeys.length} AI response cache entries`);
    } catch (error) {
      console.warn('[CacheService] Failed to clear AI response cache:', error);
    }
    
    // Step 5: Clear OPFS (Origin Private File System) cache if available
    if ('storage' in navigator && 'getDirectory' in navigator.storage) {
      try {
        const root = await navigator.storage.getDirectory();
        let clearedCount = 0;
        for await (const [name, handle] of root.entries()) {
          if (handle.kind === 'file' && (name.includes('cache') || name.includes('model'))) {
            try {
              await root.removeEntry(name, { recursive: true });
              clearedCount++;
            } catch (e) {
              // Ignore individual file errors
            }
          }
        }
        console.log(`[CacheService] Cleared ${clearedCount} OPFS cache files`);
      } catch (error) {
        console.warn('[CacheService] Failed to clear OPFS cache:', error);
      }
    }
    
    console.log('[CacheService] Cache clear completed successfully');
  } catch (error) {
    console.error('[CacheService] Error during cache clear:', error);
    throw new Error(`Failed to clear caches: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Clear cache and reload the page
 */
export async function clearCacheAndReload(): Promise<void> {
  await clearAllCaches();
  console.log('[CacheService] Reloading page after cache clear...');
  window.location.reload();
}

/**
 * Make cache clearing available globally for easy access
 */
if (typeof window !== 'undefined') {
  (window as any).clearCache = clearAllCaches;
  (window as any).clearCacheAndReload = clearCacheAndReload;
  console.log('[CacheService] Cache clearing functions available globally: window.clearCache() and window.clearCacheAndReload()');
}
