/**
 * VALUES HOOK
 * 
 * Provides value management utilities that extend DataContext.
 * Handles value selection, prioritization, and historical tracking.
 */

import { useCallback, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { ValueItem } from '../types';
import { ALL_VALUES } from '../constants';
import { getDatabaseAdapter } from '../services/databaseAdapter';
import { getCurrentUser } from '../services/authService';

export interface UseValuesReturn {
  /**
   * Currently selected value IDs
   */
  selectedValueIds: string[];
  
  /**
   * Currently selected value objects
   */
  selectedValues: ValueItem[];
  
  /**
   * Get a value by ID
   */
  getValue: (valueId: string) => ValueItem | undefined;
  
  /**
   * Check if a value is selected
   */
  isValueSelected: (valueId: string) => boolean;
  
  /**
   * Select values (replaces current selection)
   */
  selectValues: (valueIds: string[]) => Promise<void>;
  
  /**
   * Add a value to selection
   */
  addValue: (valueId: string) => Promise<void>;
  
  /**
   * Remove a value from selection
   */
  removeValue: (valueId: string) => Promise<void>;
  
  /**
   * Toggle a value's selection state
   */
  toggleValue: (valueId: string) => Promise<void>;
  
  /**
   * Set value priority (reorder selected values)
   */
  setPriority: (valueIds: string[]) => Promise<void>;
  
  /**
   * Clear all selected values
   */
  clearValues: () => Promise<void>;
  
  /**
   * Get all available values
   */
  getAllValues: () => ValueItem[];
}

/**
 * Hook for value management operations
 * 
 * @example
 * ```tsx
 * const { selectedValues, selectValues, addValue, removeValue } = useValues();
 * 
 * // Select multiple values
 * await selectValues(['v1', 'v2', 'v3']);
 * 
 * // Add a value
 * await addValue('v4');
 * 
 * // Remove a value
 * await removeValue('v1');
 * ```
 */
export function useValues(): UseValuesReturn {
  const data = useData();
  const adapter = getDatabaseAdapter();

  const selectedValues = useMemo(() => {
    return data.selectedValueIds
      .map(id => ALL_VALUES.find(v => v.id === id))
      .filter((v): v is ValueItem => v !== undefined);
  }, [data.selectedValueIds]);

  const getValue = useCallback((valueId: string): ValueItem | undefined => {
    return ALL_VALUES.find(v => v.id === valueId);
  }, []);

  const isValueSelected = useCallback((valueId: string): boolean => {
    return data.selectedValueIds.includes(valueId);
  }, [data.selectedValueIds]);

  const selectValues = useCallback(async (valueIds: string[]): Promise<void> => {
    const userId = getCurrentUser()?.id;
    if (!userId) {
      throw new Error('User must be authenticated to select values');
    }

    // Validate all IDs exist
    const invalidIds = valueIds.filter(id => !getValue(id));
    if (invalidIds.length > 0) {
      throw new Error(`Invalid value IDs: ${invalidIds.join(', ')}`);
    }

    // Update context
    data.setSelectedValueIds(valueIds);

    // Persist to database
    try {
      await adapter.setValuesActive(userId, valueIds);
      console.log('[useValues] Values selected', { count: valueIds.length });
    } catch (error) {
      // Rollback on error
      data.setSelectedValueIds(data.selectedValueIds);
      console.error('[useValues] Error selecting values:', error);
      throw error;
    }
  }, [data, adapter, getValue]);

  const addValue = useCallback(async (valueId: string): Promise<void> => {
    if (!getValue(valueId)) {
      throw new Error(`Invalid value ID: ${valueId}`);
    }

    if (isValueSelected(valueId)) {
      console.warn('[useValues] Value already selected', { valueId });
      return;
    }

    const newSelection = [...data.selectedValueIds, valueId];
    await selectValues(newSelection);
  }, [data.selectedValueIds, selectValues, getValue, isValueSelected]);

  const removeValue = useCallback(async (valueId: string): Promise<void> => {
    if (!isValueSelected(valueId)) {
      console.warn('[useValues] Value not selected', { valueId });
      return;
    }

    const newSelection = data.selectedValueIds.filter(id => id !== valueId);
    await selectValues(newSelection);
  }, [data.selectedValueIds, selectValues, isValueSelected]);

  const toggleValue = useCallback(async (valueId: string): Promise<void> => {
    if (isValueSelected(valueId)) {
      await removeValue(valueId);
    } else {
      await addValue(valueId);
    }
  }, [isValueSelected, addValue, removeValue]);

  const setPriority = useCallback(async (valueIds: string[]): Promise<void> => {
    // Validate all IDs are selected
    const missingIds = valueIds.filter(id => !isValueSelected(id));
    if (missingIds.length > 0) {
      throw new Error(`Cannot prioritize unselected values: ${missingIds.join(', ')}`);
    }

    // Validate all selected IDs are included
    const extraIds = data.selectedValueIds.filter(id => !valueIds.includes(id));
    if (extraIds.length > 0) {
      throw new Error(`Missing selected values in priority list: ${extraIds.join(', ')}`);
    }

    await selectValues(valueIds);
  }, [data.selectedValueIds, selectValues, isValueSelected]);

  const clearValues = useCallback(async (): Promise<void> => {
    await selectValues([]);
  }, [selectValues]);

  const getAllValues = useCallback((): ValueItem[] => {
    return ALL_VALUES;
  }, []);

  return {
    selectedValueIds: data.selectedValueIds,
    selectedValues,
    getValue,
    isValueSelected,
    selectValues,
    addValue,
    removeValue,
    toggleValue,
    setPriority,
    clearValues,
    getAllValues,
  };
}

export default useValues;

