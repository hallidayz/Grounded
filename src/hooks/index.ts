/**
 * HOOKS INDEX
 * 
 * Central export point for all custom hooks.
 * This makes imports cleaner: import { useGoals, useValues } from '../hooks';
 */

// Modular hooks that extend DataContext
export { usePersistence, type UsePersistenceReturn } from './usePersistence';
export { useGoals, type UseGoalsReturn } from './useGoals';
export { useValues, type UseValuesReturn } from './useValues';
export { useSession, type UseSessionReturn, type Session } from './useSession';
export { useLogs, type UseLogsReturn } from './useLogs';

// Existing hooks
export { useAppInitialization, resetInitialization, type AppInitializationResult, type UseAppInitializationOptions } from './useAppInitialization';
export { useAuth, type AuthState } from './useAuth';
export { useDashboard, type UseDashboardOptions } from './useDashboard';
export { useDebounce } from './useDebounce';
export { useDesignSystem, type UseDesignSystemReturn } from './useDesignSystem';
export { useModalManager, type ModalType } from './useModalManager';
export { useReminderSystem } from './useReminderSystem';
export { useUser } from './useUser';
export { useModelInstallationStatus } from './useModelInstallationStatus';
export { useInstallationStatus } from './useInstallationStatus';

