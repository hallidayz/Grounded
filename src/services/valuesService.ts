/**
 * Values service: persist and manage user value selections (with categories and timestamps).
 * Syncs selected value names to aiService for prompt context.
 */

import type {
  UserValueSelection,
  UserValueSelectionsWithCategories,
} from '../types/values';
import { setUserValues } from './aiService';

const STORAGE_KEY = 'grounded_value_selections';
const USER_ID = 'local';

function loadRaw(): UserValueSelectionsWithCategories | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserValueSelectionsWithCategories;
    if (typeof parsed?.userId === 'string' && Array.isArray(parsed?.selections)) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function save(data: UserValueSelectionsWithCategories): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function syncToAiService(selections: ReadonlyArray<UserValueSelection>): void {
  const names = selections.map((s) => s.value);
  setUserValues({ values: names, priority: [] });
}

/**
 * Create a new selection entry (no persistence).
 */
export function createSelection(
  category: string,
  value: string
): UserValueSelection {
  return {
    category,
    value,
    selectedAt: new Date(Date.now()).toISOString(),
  };
}

/**
 * Return a copy of the selection with updatedAt set to now.
 */
export function updateSelectionTime(
  selection: UserValueSelection
): UserValueSelection {
  return {
    ...selection,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Get current selections (with categories).
 */
export function getSelections(): UserValueSelectionsWithCategories {
  const loaded = loadRaw();
  if (loaded) return loaded;
  return { userId: USER_ID, selections: [] };
}

/**
 * Get only the list of selected value names (for aiService).
 */
export function getSelectedValueNames(): string[] {
  return getSelections().selections.map((s) => s.value);
}

/**
 * Add a selection. If the value is already selected, refresh category and updatedAt.
 */
export function addSelection(category: string, value: string): void {
  const current = getSelections();
  const now = new Date().toISOString();
  const existingIndex = current.selections.findIndex((s) => s.value === value);
  let nextSelections: UserValueSelection[];

  if (existingIndex >= 0) {
    nextSelections = current.selections.slice();
    nextSelections[existingIndex] = {
      ...nextSelections[existingIndex],
      category,
      updatedAt: now,
    };
  } else {
    nextSelections = [
      ...current.selections,
      { category, value, selectedAt: now },
    ];
  }

  const next: UserValueSelectionsWithCategories = {
    userId: USER_ID,
    selections: nextSelections,
  };
  save(next);
  syncToAiService(next.selections);
}

/**
 * Remove a selection by value name.
 */
export function removeSelection(value: string): void {
  const current = getSelections();
  const nextSelections = current.selections.filter((s) => s.value !== value);
  const next: UserValueSelectionsWithCategories = {
    userId: USER_ID,
    selections: nextSelections,
  };
  save(next);
  syncToAiService(next.selections);
}

/**
 * Toggle: if value is selected, remove it; otherwise add it for the given category.
 */
export function toggleSelection(category: string, value: string): boolean {
  const current = getSelections();
  const isSelected = current.selections.some((s) => s.value === value);
  if (isSelected) {
    removeSelection(value);
    return false;
  }
  addSelection(category, value);
  return true;
}

/**
 * Check if a value is currently selected.
 */
export function isValueSelected(value: string): boolean {
  return getSelections().selections.some((s) => s.value === value);
}

/**
 * Initialize AI service with current selections (call on app load).
 */
export function initAiSync(): void {
  syncToAiService(getSelections().selections);
}
