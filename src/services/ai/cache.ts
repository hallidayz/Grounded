/**
 * AI Response Cache Service
 * 
 * Caches AI responses to reduce redundant processing and improve performance.
 * Uses IndexedDB for persistent storage with 24-hour TTL.
 */

import { GoalFrequency } from '../types';

export interface CachedResponse {
  key: string;
  reflectionAnalysis?: string;
  goalSuggestion?: string;
  encouragement?: string;
  timestamp: number;
  expiresAt: number;
}

/**
 * Generate cache key from input parameters
 */
export function generateCacheKey(
  reflectionText: string,
  emotionalState: string | null,
  selectedFeeling: string | null,
  goalFreq: GoalFrequency,
  protocols: string[] = []
): string {
  // Create a simple hash from the input string
  const inputString = `${reflectionText}|${emotionalState}|${selectedFeeling}|${goalFreq}|${JSON.stringify(protocols)}`;
  
  // Simple hash function (for browser compatibility)
  let hash = 0;
  for (let i = 0; i < inputString.length; i++) {
    const char = inputString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return `ai_cache_${Math.abs(hash).toString(36)}`;
}

/**
 * Get cached response if available and not expired
 */
export async function getCachedResponse(key: string): Promise<CachedResponse | null> {
  try {
    // Use localStorage as a simpler cache mechanism for now
    // IndexedDB access would require exposing getDB() method from dbService
    const cacheKey = `ai_cache_${key}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (!cached) return null;

    const parsed: CachedResponse = JSON.parse(cached);
    
    // Check if expired
    if (Date.now() > parsed.expiresAt) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    return parsed;
  } catch (error) {
    console.warn('Cache read error:', error);
    return null;
  }
}

/**
 * Store response in cache
 */
export async function setCachedResponse(
  key: string,
  data: {
    reflectionAnalysis?: string;
    goalSuggestion?: string;
    encouragement?: string;
  }
): Promise<void> {
  try {
    const now = Date.now();
    const ttl = 24 * 60 * 60 * 1000; // 24 hours

    const cached: CachedResponse = {
      key,
      ...data,
      timestamp: now,
      expiresAt: now + ttl,
    };

    // Use localStorage for caching
    const cacheKey = `ai_cache_${key}`;
    localStorage.setItem(cacheKey, JSON.stringify(cached));
  } catch (error) {
    console.warn('Cache write error:', error);
  }
}

/**
 * Delete cached response
 */
export async function deleteCachedResponse(key: string): Promise<void> {
  try {
    const cacheKey = `ai_cache_${key}`;
    localStorage.removeItem(cacheKey);
  } catch (error) {
    console.warn('Cache delete error:', error);
  }
}

/**
 * Invalidate cache based on content similarity
 * Returns true if content changed significantly (>20% different)
 */
export function shouldInvalidateCache(
  oldReflection: string,
  newReflection: string
): boolean {
  if (!oldReflection || !newReflection) return true;
  
  // Simple similarity check using Levenshtein distance
  const similarity = calculateSimilarity(oldReflection, newReflection);
  return similarity < 0.8; // Less than 80% similar = invalidate
}

/**
 * Calculate similarity between two strings (0-1)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Clear all expired cache entries
 */
export async function clearExpiredCache(): Promise<void> {
  try {
    const now = Date.now();
    const keysToRemove: string[] = [];

    // Check all localStorage keys that start with ai_cache_
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('ai_cache_')) {
        try {
          const cached = JSON.parse(localStorage.getItem(key) || '{}') as CachedResponse;
          if (cached.expiresAt && cached.expiresAt < now) {
            keysToRemove.push(key);
          }
        } catch (error) {
          console.error('[ai/cache] Invalid cache entry, removing:', key, error);
          // Invalid cache entry, remove it
          keysToRemove.push(key);
        }
      }
    }

    // Remove expired entries
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.warn('Cache cleanup error:', error);
  }
}

/**
 * Invalidate cache entries based on various conditions
 */
export async function invalidateCache(
  conditions: {
    emotionalStateChanged?: boolean;
    protocolsChanged?: boolean;
    reflectionChanged?: { old: string; new: string };
  }
): Promise<void> {
  try {
    const keysToRemove: string[] = [];

    // Check all cache entries
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('ai_cache_')) {
        try {
          const cached = JSON.parse(localStorage.getItem(key) || '{}') as CachedResponse;
          
          // Check expiration
          if (cached.expiresAt && Date.now() > cached.expiresAt) {
            keysToRemove.push(key);
            continue;
          }

          // Check if reflection changed significantly
          if (conditions.reflectionChanged) {
            const shouldInvalidate = shouldInvalidateCache(
              conditions.reflectionChanged.old,
              conditions.reflectionChanged.new
            );
            if (shouldInvalidate) {
              keysToRemove.push(key);
              continue;
            }
          }

          // If emotional state or protocols changed, invalidate all
          if (conditions.emotionalStateChanged || conditions.protocolsChanged) {
            keysToRemove.push(key);
          }
        } catch (error) {
          console.error('[ai/cache] Invalid cache entry, removing:', key, error);
          // Invalid cache entry, remove it
          keysToRemove.push(key);
        }
      }
    }

    // Remove invalidated entries
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.warn('Cache invalidation error:', error);
  }
}

