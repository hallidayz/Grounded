/**
 * GOALS HOOK
 * 
 * Provides goal management utilities that extend DataContext.
 * Handles CRUD operations for goals with automatic persistence.
 */

import { useCallback, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { Goal, GoalUpdate } from '../types';
import { getDatabaseAdapter } from '../services/databaseAdapter';
import { getCurrentUser } from '../services/authService';

export interface UseGoalsReturn {
  /**
   * All goals from DataContext
   */
  goals: Goal[];
  
  /**
   * Get a goal by ID
   */
  getGoal: (goalId: string) => Goal | undefined;
  
  /**
   * Get goals for a specific value
   */
  getGoalsByValue: (valueId: string) => Goal[];
  
  /**
   * Get active (incomplete) goals
   */
  getActiveGoals: () => Goal[];
  
  /**
   * Get completed goals
   */
  getCompletedGoals: () => Goal[];
  
  /**
   * Add a new goal
   */
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => Promise<void>;
  
  /**
   * Update an existing goal
   */
  updateGoal: (goalId: string, updates: Partial<Goal>) => Promise<void>;
  
  /**
   * Delete a goal
   */
  deleteGoal: (goalId: string) => Promise<void>;
  
  /**
   * Add an update to a goal's progress
   */
  addGoalUpdate: (goalId: string, update: Omit<GoalUpdate, 'id' | 'timestamp'>) => Promise<void>;
  
  /**
   * Mark a goal as completed
   */
  completeGoal: (goalId: string) => Promise<void>;
  
  /**
   * Mark a goal as incomplete
   */
  uncompleteGoal: (goalId: string) => Promise<void>;
}

/**
 * Hook for goal management operations
 * 
 * @example
 * ```tsx
 * const { goals, addGoal, updateGoal, deleteGoal } = useGoals();
 * 
 * // Add a new goal
 * await addGoal({
 *   valueId: 'v1',
 *   text: 'Exercise daily',
 *   frequency: 'daily',
 * });
 * 
 * // Get active goals
 * const activeGoals = getActiveGoals();
 * ```
 */
export function useGoals(): UseGoalsReturn {
  const data = useData();
  const adapter = getDatabaseAdapter();

  const getGoal = useCallback((goalId: string): Goal | undefined => {
    return data.goals.find(g => g.id === goalId);
  }, [data.goals]);

  const getGoalsByValue = useCallback((valueId: string): Goal[] => {
    return data.goals.filter(g => g.valueId === valueId);
  }, [data.goals]);

  const getActiveGoals = useCallback((): Goal[] => {
    return data.goals.filter(g => !g.completed);
  }, [data.goals]);

  const getCompletedGoals = useCallback((): Goal[] => {
    return data.goals.filter(g => g.completed);
  }, [data.goals]);

  const addGoal = useCallback(async (goalData: Omit<Goal, 'id' | 'createdAt'>): Promise<void> => {
    const userId = getCurrentUser()?.id;
    if (!userId) {
      throw new Error('User must be authenticated to add goals');
    }

    // Generate ID
    const id = crypto?.randomUUID?.() || `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const createdAt = new Date().toISOString();

    const newGoal: Goal = {
      ...goalData,
      id,
      createdAt,
      completed: false,
      updates: [],
    };

    // Update context
    data.setGoals(prev => [...prev, newGoal]);

    // Persist to database
    try {
      await adapter.saveGoal(newGoal);
      console.log('[useGoals] Goal added', { goalId: id });
    } catch (error) {
      // Rollback on error
      data.setGoals(prev => prev.filter(g => g.id !== id));
      console.error('[useGoals] Error adding goal:', error);
      throw error;
    }
  }, [data, adapter]);

  const updateGoal = useCallback(async (goalId: string, updates: Partial<Goal>): Promise<void> => {
    const goal = getGoal(goalId);
    if (!goal) {
      throw new Error(`Goal not found: ${goalId}`);
    }

    const updatedGoal: Goal = {
      ...goal,
      ...updates,
    };

    // Update context
    data.setGoals(prev => prev.map(g => g.id === goalId ? updatedGoal : g));

    // Persist to database
    try {
      await adapter.saveGoal(updatedGoal);
      console.log('[useGoals] Goal updated', { goalId });
    } catch (error) {
      // Rollback on error
      data.setGoals(prev => prev.map(g => g.id === goalId ? goal : g));
      console.error('[useGoals] Error updating goal:', error);
      throw error;
    }
  }, [data, adapter, getGoal]);

  const deleteGoal = useCallback(async (goalId: string): Promise<void> => {
    const goal = getGoal(goalId);
    if (!goal) {
      throw new Error(`Goal not found: ${goalId}`);
    }

    const userId = getCurrentUser()?.id;
    if (!userId) {
      throw new Error('User must be authenticated to delete goals');
    }

    // Update context
    data.setGoals(prev => prev.filter(g => g.id !== goalId));

    // Persist to database
    try {
      await adapter.deleteGoal(goalId);
      console.log('[useGoals] Goal deleted', { goalId });
    } catch (error) {
      // Rollback on error
      data.setGoals(prev => [...prev, goal]);
      console.error('[useGoals] Error deleting goal:', error);
      throw error;
    }
  }, [data, adapter, getGoal]);

  const addGoalUpdate = useCallback(async (
    goalId: string,
    updateData: Omit<GoalUpdate, 'id' | 'timestamp'>
  ): Promise<void> => {
    const goal = getGoal(goalId);
    if (!goal) {
      throw new Error(`Goal not found: ${goalId}`);
    }

    const update: GoalUpdate = {
      ...updateData,
      id: crypto?.randomUUID?.() || `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };

    const updatedGoal: Goal = {
      ...goal,
      updates: [...(goal.updates || []), update],
    };

    // Update context
    data.setGoals(prev => prev.map(g => g.id === goalId ? updatedGoal : g));

    // Persist to database
    try {
      await adapter.saveGoal(updatedGoal);
      console.log('[useGoals] Goal update added', { goalId, updateId: update.id });
    } catch (error) {
      // Rollback on error
      data.setGoals(prev => prev.map(g => g.id === goalId ? goal : g));
      console.error('[useGoals] Error adding goal update:', error);
      throw error;
    }
  }, [data, adapter, getGoal]);

  const completeGoal = useCallback(async (goalId: string): Promise<void> => {
    await updateGoal(goalId, { completed: true });
  }, [updateGoal]);

  const uncompleteGoal = useCallback(async (goalId: string): Promise<void> => {
    await updateGoal(goalId, { completed: false });
  }, [updateGoal]);

  return {
    goals: data.goals,
    getGoal,
    getGoalsByValue,
    getActiveGoals,
    getCompletedGoals,
    addGoal,
    updateGoal,
    deleteGoal,
    addGoalUpdate,
    completeGoal,
    uncompleteGoal,
  };
}

export default useGoals;

