import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo, ReactNode } from 'react';
import { LogEntry, Goal, AppSettings, LCSWConfig, FeelingLog } from '../types';
import type { AppData } from '../services/adapters/types';
import { getDatabaseAdapter } from '../services/databaseAdapter';
import { logger } from '../utils/logger';

interface DataContextType {
  selectedValueIds: string[];
  logs: LogEntry[];
  goals: Goal[];
  settings: AppSettings;
  isHydrating: boolean; // Track if data is being loaded from database
  setSelectedValueIds: React.Dispatch<React.SetStateAction<string[]>>;
  setLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>;
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  handleLogEntry: (entry: LogEntry) => void;
  handleUpdateGoals: (updatedGoals: Goal[]) => void;
  handleUpdateGoalProgress: (goalId: string, update: { date: string; note: string; progress?: number }) => void;
  handleClearData: () => void;
  handleSelectionComplete: (ids: string[]) => void;
  handleMoodLoopEntry: (emotion: string, feeling: string) => Promise<void>; // Handle mood entry from thumb swipe loop
  persistData: () => Promise<void>; // Manual persistence trigger for exit handler
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
  userId: string | null;
  authState: 'checking' | 'login' | 'terms' | 'app';
  initialData?: {
    selectedValueIds?: string[];
    logs?: LogEntry[];
    goals?: Goal[];
    settings?: AppSettings;
  };
}

export const DataProvider: React.FC<DataProviderProps> = ({
  children,
  userId,
  authState,
  initialData
}) => {
  const [selectedValueIds, setSelectedValueIds] = useState<string[]>(
    initialData?.selectedValueIds || []
  );
  const [logs, setLogs] = useState<LogEntry[]>(initialData?.logs || []);
  const [goals, setGoals] = useState<Goal[]>(initialData?.goals || []);
  const [settings, setSettings] = useState<AppSettings>(
    initialData?.settings || { reminders: { enabled: false, frequency: 'daily', time: '09:00' } }
  );
  const [isHydrating, setIsHydrating] = useState(true); // Start as true, set to false after initial load

  // OPTIMIZATION: Memoize expensive derived data
  const selectedValues = useMemo(() =>
    selectedValueIds.map(id => ({ id, name: id })) // Simplified - can be enhanced with full value objects
  , [selectedValueIds]);

  // Get database adapter instance (memoized to avoid recreating on every render)
  const adapter = useMemo(() => getDatabaseAdapter(), []);

  // Track if we've loaded initial data to prevent overwriting with empty arrays
  // This is set to true once we receive data from either initialData or via setters
  const hasLoadedInitialDataRef = useRef(false);
  const initializationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingSaveRef = useRef<Promise<void> | null>(null); // Track pending save for exit handler
  const hasTriedDatabaseLoadRef = useRef(false); // Track if we've tried loading from database

  // OPTIMIZATION: Consolidated initialization effect - eliminates race conditions
  useEffect(() => {
    // Early return if already initialized or not authenticated
    if (hasLoadedInitialDataRef.current || !userId || authState !== 'app') {
      return;
    }

    // Mark as tried to prevent multiple attempts
    hasTriedDatabaseLoadRef.current = true;

    const initializeData = async () => {
      try {
        logger.info('[DataContext] Starting consolidated data initialization');

        // Step 1: Load from initialData if available
        if (initialData) {
          logger.info('[DataContext] Loading data from initial props');
          if (initialData.selectedValueIds !== undefined) {
            setSelectedValueIds(initialData.selectedValueIds);
          }
          if (initialData.logs !== undefined) {
            setLogs(initialData.logs);
          }
          if (initialData.goals !== undefined) {
            setGoals(initialData.goals);
          }
          if (initialData.settings) {
            setSettings(initialData.settings);
          }
        }

        // Step 2: Load additional data from database
        await adapter.init();

        // Load values from database (prioritize over initialData)
        let activeValues = await adapter.getActiveValues(userId);

        if (activeValues.length === 0) {
          // Fallback to appData
          const appData = await adapter.getAppData(userId);
          if (appData?.values && appData.values.length > 0) {
            activeValues = appData.values;
            // Migrate to values table for future loads
            await adapter.setValuesActive(userId, activeValues);
            logger.info('[DataContext] Migrated values from appData to values table');
          }
        }

        if (activeValues.length > 0) {
          logger.info('[DataContext] Loaded values from database:', activeValues.length);
          setSelectedValueIds(activeValues);
        }

        // Step 3: Load goals from database
        const goalsData = await adapter.getGoals(userId);
        if (goalsData.length > 0) {
          logger.info('[DataContext] Loaded goals from database:', goalsData.length);
          setGoals(goalsData);
        }

        hasLoadedInitialDataRef.current = true;
        setIsHydrating(false);
        logger.info('[DataContext] Data initialization complete');

      } catch (error) {
        logger.error('[DataContext] Error during data initialization:', error);

        // Single retry after delay
        setTimeout(async () => {
          try {
            const retryValues = await adapter.getActiveValues(userId);
            if (retryValues.length > 0) {
              setSelectedValueIds(retryValues);
            }
            const retryGoals = await adapter.getGoals(userId);
            if (retryGoals.length > 0) {
              setGoals(retryGoals);
            }
          } catch (retryError) {
            logger.error('[DataContext] Initialization retry failed:', retryError);
          }
          hasLoadedInitialDataRef.current = true;
          setIsHydrating(false);
        }, 1000);
      }
    };

    // Execute initialization
    initializeData();
  }, [userId, authState, initialData, adapter]);



  // Save app data to database whenever it changes
  // Allow saves as soon as userId is available - don't wait for slow initialization flags
  useEffect(() => {
    if (userId && authState === 'app') {
      // If flag isn't set yet but we have data, set it immediately to allow saves
      if (!hasLoadedInitialDataRef.current && (selectedValueIds.length > 0 || logs.length > 0 || goals.length > 0)) {
        hasLoadedInitialDataRef.current = true;
      }
      
      // CRITICAL: Don't save empty values array if we haven't finished loading yet
      // This prevents overwriting existing values with empty array during initialization
      // Only save values if:
      // 1. We've loaded initial data (hydration complete), OR
      // 2. We have values to save (user actively selected them)
      const shouldSaveValues = hasLoadedInitialDataRef.current || selectedValueIds.length > 0;
      
      // Save if flag is set OR if we have any data (user is actively using the app)
      if (hasLoadedInitialDataRef.current || selectedValueIds.length > 0 || logs.length > 0 || goals.length > 0) {
        const saveData = async () => {
          try {
            // Always include values in save (required by AppData interface)
            const appDataToSave: AppData = {
              settings,
              logs,
              goals,
              values: selectedValueIds, // Always provide values array
              lcswConfig: settings.lcswConfig,
            };
            
            logger.info('[DataContext] Saving app data', {
              values: shouldSaveValues ? selectedValueIds.length : '(skipped - not loaded yet)',
              logs: logs.length,
              goals: goals.length,
              userId,
              hasLoadedInitialData: hasLoadedInitialDataRef.current,
              shouldSaveValues
            });
            
            // Save to appData (for backward compatibility and quick access)
            await adapter.saveAppData(userId, appDataToSave);
            
            // Also save values to values table (for historical tracking)
            // Only if we have values AND we should save them
            if (shouldSaveValues && selectedValueIds.length > 0) {
              await adapter.setValuesActive(userId, selectedValueIds);
            }
            
            // Also save goals to goals table (for better querying)
            if (goals.length > 0) {
              for (const goal of goals) {
                await adapter.saveGoal(goal);
              }
            }
            
            // Clear pending save ref
            pendingSaveRef.current = null;
          } catch (error) {
            logger.error('Error saving app data:', error);
            pendingSaveRef.current = null;
          }
        };
        
        // Store save promise for exit handler
        pendingSaveRef.current = saveData();
        
        // Debounce saves
        const timeoutId = setTimeout(() => {
          saveData();
        }, 500);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [userId, settings, logs, goals, selectedValueIds, authState, adapter]);

  const handleLogEntry = useCallback((entry: LogEntry) => {
    setLogs(prev => [entry, ...prev]);
  }, []);

  const handleUpdateGoals = useCallback((updatedGoals: Goal[]) => {
    setGoals(updatedGoals);
  }, []);

  const handleUpdateGoalProgress = useCallback((goalId: string, update: { date: string; note: string; progress?: number }) => {
    setGoals(prevGoals => 
      prevGoals.map(goal => {
        if (goal.id === goalId) {
          // Convert update to GoalUpdate format
          const goalUpdate: Goal['updates'][0] = {
            id: `update-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: update.date,
            note: update.note,
            mood: undefined, // Optional field
          };
          return { ...goal, updates: [...(goal.updates || []), goalUpdate] };
        }
        return goal;
      })
    );
  }, []);

  const handleClearData = useCallback(() => {
    setLogs([]);
    setSelectedValueIds([]);
    setGoals([]);
    setSettings({ reminders: { enabled: false, frequency: 'daily', time: '09:00' } });
  }, []);

  const handleSelectionComplete = useCallback(async (ids: string[]) => {
    setSelectedValueIds(ids);
    // Save to values table when user confirms selection
    // setValuesActive already saves with priority based on array index (0 = highest priority)
    if (userId && authState === 'app') {
      try {
        await adapter.setValuesActive(userId, ids);
        logger.info('[DataContext] Saved values to values table with priorities', { 
          userId, 
          count: ids.length,
          priorities: ids.map((id, index) => ({ id, priority: index }))
        });
      } catch (error) {
        logger.error('Error saving values to table:', error);
      }
    }
  }, [userId, authState, adapter]);

  // Handle mood entry from thumb swipe loop
  // Type-safe implementation with proper FeelingLog structure
  const handleMoodLoopEntry = useCallback(async (emotion: string, feeling: string): Promise<void> => {
    if (!emotion || !feeling) {
      logger.warn('[DataContext] handleMoodLoopEntry called with invalid parameters', { emotion, feeling });
      return;
    }

    try {
      const timestamp = new Date().toISOString();
      const logId = `mood-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Create feeling log entry for database with proper typing
      const feelingLogData: Parameters<typeof adapter.saveFeelingLog>[0] = {
        id: logId,
        timestamp,
        userId: userId || undefined,
        emotionalState: emotion,
        selectedFeeling: feeling || null,
        aiResponse: '',
        isAIResponse: false,
        lowStateCount: 0,
      };

      // Persist to database if user is authenticated
      if (userId && authState === 'app') {
        try {
          if (adapter && typeof adapter.saveFeelingLog === 'function') {
            await adapter.saveFeelingLog(feelingLogData);
            logger.info('[DataContext] Mood entry saved to database', { emotion, feeling, userId, logId });
          } else {
            logger.warn('[DataContext] saveFeelingLog method not available on adapter');
          }
        } catch (error) {
          logger.error('[DataContext] Error saving mood entry to database:', error);
          // Don't throw - allow local state update even if DB save fails
        }
      } else {
        logger.warn('[DataContext] Cannot save mood entry - user not authenticated', { userId, authState });
      }

      // Also create a LogEntry for local state (if needed for UI display)
      // Note: LogEntry uses different structure, so we create a minimal entry
      // Type-safe emotionalState: only use if it matches allowed values
      const allowedEmotionalStates: LogEntry['emotionalState'][] = [
        'drained', 'heavy', 'overwhelmed', 'mixed', 'calm', 'hopeful', 'positive', 'energized'
      ];
      const validEmotionalState = allowedEmotionalStates.includes(emotion as LogEntry['emotionalState'])
        ? (emotion as LogEntry['emotionalState'])
        : undefined;

      const logEntry: LogEntry = {
        id: logId,
        date: timestamp,
        valueId: '', // No value associated with mood loop entry
        livedIt: false,
        note: `Mood: ${emotion} - ${feeling}`,
        emotionalState: validEmotionalState,
        selectedFeeling: feeling,
      };

      // Update local log state
      setLogs((prev) => [logEntry, ...prev]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logger.error('[DataContext] Error recording mood entry:', errorMessage, err);
      // Re-throw to allow caller to handle if needed
      throw new Error(`Failed to record mood entry: ${errorMessage}`);
    }
  }, [userId, authState, adapter]);

  // Manual persistence function for exit handler
  const persistData = useCallback(async () => {
    if (!userId || authState !== 'app') {
      return;
    }

    // Wait for any pending save to complete
    if (pendingSaveRef.current) {
      try {
        await pendingSaveRef.current;
      } catch (error) {
        logger.error('[DataContext] Error waiting for pending save:', error);
      }
    }

    // Force immediate save (no debounce)
    try {
      logger.info('[DataContext] Persisting data on exit', {
        values: selectedValueIds.length,
        logs: logs.length,
        goals: goals.length,
        userId
      });
      
      await adapter.saveAppData(userId, {
        settings,
        logs,
        goals,
        values: selectedValueIds,
        lcswConfig: settings.lcswConfig,
      });
      
      if (selectedValueIds.length > 0) {
        await adapter.setValuesActive(userId, selectedValueIds);
      }
      
      if (goals.length > 0) {
        for (const goal of goals) {
          await adapter.saveGoal(goal);
        }
      }
      
      logger.info('[DataContext] Data persisted successfully');
    } catch (error) {
      logger.error('[DataContext] Error persisting data on exit:', error);
    }
  }, [userId, authState, selectedValueIds, logs, goals, settings, adapter]);

  // Exit persistence handler - save data before page unload
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Only persist if we have data and user is authenticated
      if (userId && authState === 'app' && (selectedValueIds.length > 0 || logs.length > 0 || goals.length > 0)) {
        // Use sendBeacon for reliable persistence (works even if page is closing)
        const data = JSON.stringify({
          userId,
          values: selectedValueIds,
          logs: logs.slice(0, 10), // Only save recent logs to avoid payload size issues
          goals: goals.slice(0, 10), // Only save recent goals
          settings,
        });
        
        // Try to persist synchronously (limited time available)
        persistData().catch((error) => {
          logger.error('[DataContext] Failed to persist on exit:', error);
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Also handle visibility change (tab switch, minimize, etc.)
    const handleVisibilityChange = () => {
      if (document.hidden && userId && authState === 'app') {
        // Tab is hidden - persist data
        persistData().catch((error) => {
          logger.error('[DataContext] Failed to persist on visibility change:', error);
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [userId, authState, selectedValueIds, logs, goals, settings, persistData]);

  return (
    <DataContext.Provider
      value={{
        selectedValueIds,
        logs,
        goals,
        settings,
        isHydrating,
        setSelectedValueIds,
        setLogs,
        setGoals,
        setSettings,
        handleLogEntry,
        handleUpdateGoals,
        handleUpdateGoalProgress,
        handleClearData,
        handleSelectionComplete,
        handleMoodLoopEntry,
        persistData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Alias for convenience - provides same functionality with different name
export const useDataContext = useData;

