/**
 * Validation Constants
 * 
 * Centralized validation rules and thresholds used throughout the application.
 * Replace magic numbers with these named constants for better maintainability.
 */

/**
 * Minimum reflection text length required
 * Used in: useDashboard.ts, ReflectionForm.tsx
 */
export const MIN_REFLECTION_LENGTH = 20;

/**
 * Maximum reflection text length
 * Prevents extremely long reflections that may impact performance
 */
export const MAX_REFLECTION_LENGTH = 5000;

/**
 * Minimum goal text length
 */
export const MIN_GOAL_LENGTH = 3;

/**
 * Maximum goal text length
 */
export const MAX_GOAL_LENGTH = 500;

/**
 * Minimum username length
 */
export const MIN_USERNAME_LENGTH = 3;

/**
 * Maximum username length
 */
export const MAX_USERNAME_LENGTH = 50;

/**
 * Minimum password length
 */
export const MIN_PASSWORD_LENGTH = 8;

/**
 * Maximum password length
 */
export const MAX_PASSWORD_LENGTH = 128;

/**
 * Email validation regex pattern
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Username validation regex pattern
 * Allows alphanumeric, underscore, hyphen, and spaces
 */
export const USERNAME_REGEX = /^[a-zA-Z0-9_\-\s]+$/;
