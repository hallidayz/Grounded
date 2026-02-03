/**
 * User value selection types with timestamps for analytics and change tracking.
 */

/** Single selection entry (simple keys, no category). */
export interface UserValueSelectionEntry {
  readonly value: string;
  readonly selectedAt: string;
  readonly updatedAt?: string;
}

/** User's selected values by key only. */
export interface UserValueSelections {
  readonly userId: string;
  readonly selectedValues: ReadonlyArray<UserValueSelectionEntry>;
}

/** Single selection with category. */
export interface UserValueSelection {
  readonly category: string;
  readonly value: string;
  readonly selectedAt: string;
  readonly updatedAt?: string;
}

/** User's selected values with categories. */
export interface UserValueSelectionsWithCategories {
  readonly userId: string;
  readonly selections: ReadonlyArray<UserValueSelection>;
}
