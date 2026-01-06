/**
 * PERSISTENCE HOOK
 * 
 * Provides data persistence utilities that extend DataContext.
 * Handles manual saves, loading states, and persistence operations.
 */

import { useCallback } from 'react';
import { useData } from '../contexts/DataContext';
import { getDatabaseAdapter } from '../services/databaseAdapter';
import { getCurrentUser } from '../services/authService';

export interface UsePersistenceReturn {
  /**
   * Manually persist all current data to database
   * Useful for explicit saves before navigation or critical operations
   */
  persist: () => Promise<void>;
  
  /**
   * Check if data is currently being hydrated (loaded from database)
   */
  isHydrating: boolean;
  
  /**
   * Force a save of specific data types
   */
  saveValues: () => Promise<void>;
  saveLogs: () => Promise<void>;
  saveGoals: () => Promise<void>;
  saveSettings: () => Promise<void>;
}

/**
 * Hook for data persistence operations
 * 
 * @example
 * ```tsx
 * const { persist, isHydrating } = usePersistence();
 * 
 * // Manual save before navigation
 * await persist();
 * 
 * // Check if data is loading
 * if (isHydrating) return <LoadingScreen />;
 * ```
 */
export function usePersistence(): UsePersistenceReturn {
  const data = useData();
  const adapter = getDatabaseAdapter();

  const persist = useCallback(async () => {
    // Use the context's persistData method
    await data.persistData();
  }, [data]);

  const saveValues = useCallback(async () => {
    const userId = getCurrentUser()?.id;
    if (!userId) {
      console.warn('[usePersistence] No userId available for saving values');
      return;
    }

    try {
      await adapter.setValuesActive(userId, data.selectedValueIds);
      console.log('[usePersistence] Values saved', { count: data.selectedValueIds.length });
    } catch (error) {
      console.error('[usePersistence] Error saving values:', error);
      throw error;
    }
  }, [data.selectedValueIds, adapter]);

  const saveLogs = useCallback(async () => {
    const userId = getCurrentUser()?.id;
    if (!userId) {
      console.warn('[usePersistence] No userId available for saving logs');
      return;
    }

    try {
      await adapter.saveAppData(userId, {
        settings: data.settings,
        logs: data.logs,
        goals: data.goals,
        values: data.selectedValueIds,
        lcswConfig: data.settings.lcswConfig,
      });
      console.log('[usePersistence] Logs saved', { count: data.logs.length });
    } catch (error) {
      console.error('[usePersistence] Error saving logs:', error);
      throw error;
    }
  }, [data.logs, data.settings, data.goals, data.selectedValueIds, adapter]);

  const saveGoals = useCallback(async () => {
    const userId = getCurrentUser()?.id;
    if (!userId) {
      console.warn('[usePersistence] No userId available for saving goals');
      return;
    }

    try {
      // Save all goals to the goals table
      for (const goal of data.goals) {
        await adapter.saveGoal(goal);
      }
      console.log('[usePersistence] Goals saved', { count: data.goals.length });
    } catch (error) {
      console.error('[usePersistence] Error saving goals:', error);
      throw error;
    }
  }, [data.goals, adapter]);

  const saveSettings = useCallback(async () => {
    const userId = getCurrentUser()?.id;
    if (!userId) {
      console.warn('[usePersistence] No userId available for saving settings');
      return;
    }

    try {
      await adapter.saveAppData(userId, {
        settings: data.settings,
        logs: data.logs,
        goals: data.goals,
        values: data.selectedValueIds,
        lcswConfig: data.settings.lcswConfig,
      });
      console.log('[usePersistence] Settings saved');
    } catch (error) {
      console.error('[usePersistence] Error saving settings:', error);
      throw error;
    }
  }, [data.settings, data.logs, data.goals, data.selectedValueIds, adapter]);

  return {
    persist,
    isHydrating: data.isHydrating,
    saveValues,
    saveLogs,
    saveGoals,
    saveSettings,
  };
}

export default usePersistence;

