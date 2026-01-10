import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo, ReactNode } from 'react';
import { LogEntry, Goal, AppSettings, LCSWConfig, FeelingLog } from '../types';
import { getDatabaseAdapter } from '../services/databaseAdapter';

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

  // Get database adapter instance (memoized to avoid recreating on every render)
  const adapter = useMemo(() => getDatabaseAdapter(), []);

  // Track if we've loaded initial data to prevent overwriting with empty arrays
  // This is set to true once we receive data from either initialData or via setters
  const hasLoadedInitialDataRef = useRef(false);
  const initializationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingSaveRef = useRef<Promise<void> | null>(null); // Track pending save for exit handler
  const hasTriedDatabaseLoadRef = useRef(false); // Track if we've tried loading from database

  // Update state when initialData changes (from initialization)
  useEffect(() => {
    // Check if initialData has any actual data (not just empty object)
    const hasData = initialData && (
      (initialData.selectedValueIds && initialData.selectedValueIds.length > 0) ||
      (initialData.logs && initialData.logs.length > 0) ||
      (initialData.goals && initialData.goals.length > 0) ||
      initialData.settings
    );
    
    if (hasData && !hasLoadedInitialDataRef.current) {
      console.log('[DataContext] Loading initial data from props', {
        values: initialData.selectedValueIds?.length || 0,
        logs: initialData.logs?.length || 0,
        goals: initialData.goals?.length || 0,
        hasSettings: !!initialData.settings
      });
      
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
      hasLoadedInitialDataRef.current = true;
      setIsHydrating(false); // Data loaded, hydration complete
    } else if (initialData !== undefined && !hasData) {
      // Initial data is explicitly empty/undefined - hydration complete but no data
      setIsHydrating(false);
    }
  }, [initialData]);

  // CRITICAL FIX: Load values from database if initialData didn't have them
  useEffect(() => {
    // Only try once, and only if we haven't tried yet and user is authenticated
    // Don't check hasLoadedInitialDataRef - we want to try database even if other effects marked it as loaded
    if (hasTriedDatabaseLoadRef.current || !userId || authState !== 'app') {
      return;
    }

    // Always try to load from database if we have no values, regardless of initialData
    // This ensures we always check the database, even if initialData was empty
    hasTriedDatabaseLoadRef.current = true;
    
    const loadFromDatabase = async () => {
      try {
        console.log('[DataContext] Checking database for values...', { 
          userId, 
          currentValuesCount: selectedValueIds.length,
          hasInitialData: !!initialData?.selectedValueIds?.length 
        });
        await adapter.init();
        const activeValues = await adapter.getActiveValues(userId);
        
        console.log('[DataContext] Database query result:', { 
          activeValuesCount: activeValues.length,
          activeValues 
        });
        
        if (activeValues.length > 0) {
          console.log('[DataContext] Loaded values from database:', activeValues.length, activeValues);
          setSelectedValueIds(activeValues);
          hasLoadedInitialDataRef.current = true;
          setIsHydrating(false);
        } else if (selectedValueIds.length === 0) {
          // Only log as first-time user if we truly have no values
          console.log('[DataContext] No values found in database - user is first-time user');
          hasLoadedInitialDataRef.current = true; // Mark as loaded even if no values found
          setIsHydrating(false);
        } else {
          // We have values from initialData, just mark as loaded
          console.log('[DataContext] Using values from initialData:', selectedValueIds.length);
          hasLoadedInitialDataRef.current = true;
          setIsHydrating(false);
        }
      } catch (error) {
        console.error('[DataContext] Error loading values from database:', error);
        hasLoadedInitialDataRef.current = true; // Mark as loaded even on error to prevent retries
        setIsHydrating(false);
      }
    };

    // Small delay to ensure adapter is ready, but also retry if adapter isn't ready
    const timeoutId = setTimeout(loadFromDatabase, 200);
    return () => clearTimeout(timeoutId);
  }, [userId, authState, adapter]);

  // Track when data is set via setters (from sync in AppContent)
  // Mark as loaded when we have userId (user is authenticated) or after data appears
  useEffect(() => {
    // If we have userId (authenticated) OR any data, mark as loaded
    // This allows saves to happen immediately when user selects values, even before full initialization
    if ((userId || selectedValueIds.length > 0 || logs.length > 0 || goals.length > 0) && !hasLoadedInitialDataRef.current) {
      // Clear any existing timeout
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current);
      }
      
      // If userId is available, mark as loaded immediately; otherwise wait briefly for sync
      const delay = userId ? 100 : 1000;
      initializationTimeoutRef.current = setTimeout(() => {
        console.log('[DataContext] Marking data as loaded after sync', {
          values: selectedValueIds.length,
          logs: logs.length,
          goals: goals.length,
          userId: !!userId
        });
        hasLoadedInitialDataRef.current = true;
        setIsHydrating(false); // Mark hydration as complete
      }, delay);
    }
    
    return () => {
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current);
      }
    };
  }, [selectedValueIds.length, logs.length, goals.length, userId]);

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
            // Only include values in save if we should save them
            // If we haven't loaded yet and have no values, skip values field to avoid overwriting
            const appDataToSave: any = {
              settings,
              logs,
              goals,
              lcswConfig: settings.lcswConfig,
            };
            
            // Only add values if we should save them (prevents overwriting during init)
            if (shouldSaveValues) {
              appDataToSave.values = selectedValueIds;
            }
            
            console.log('[DataContext] Saving app data', {
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
            console.error('Error saving app data:', error);
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
        console.log('[DataContext] Saved values to values table with priorities', { 
          userId, 
          count: ids.length,
          priorities: ids.map((id, index) => ({ id, priority: index }))
        });
      } catch (error) {
        console.error('Error saving values to table:', error);
      }
    }
  }, [userId, authState, adapter]);

  // Handle mood entry from thumb swipe loop
  // Type-safe implementation with proper FeelingLog structure
  const handleMoodLoopEntry = useCallback(async (emotion: string, feeling: string): Promise<void> => {
    if (!emotion || !feeling) {
      console.warn('[DataContext] handleMoodLoopEntry called with invalid parameters', { emotion, feeling });
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
            console.log('[DataContext] Mood entry saved to database', { emotion, feeling, userId, logId });
          } else {
            console.warn('[DataContext] saveFeelingLog method not available on adapter');
          }
        } catch (error) {
          console.error('[DataContext] Error saving mood entry to database:', error);
          // Don't throw - allow local state update even if DB save fails
        }
      } else {
        console.warn('[DataContext] Cannot save mood entry - user not authenticated', { userId, authState });
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
      console.error('[DataContext] Error recording mood entry:', errorMessage, err);
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
        console.error('[DataContext] Error waiting for pending save:', error);
      }
    }

    // Force immediate save (no debounce)
    try {
      console.log('[DataContext] Persisting data on exit', {
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
      
      console.log('[DataContext] Data persisted successfully');
    } catch (error) {
      console.error('[DataContext] Error persisting data on exit:', error);
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
          console.error('[DataContext] Failed to persist on exit:', error);
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Also handle visibility change (tab switch, minimize, etc.)
    const handleVisibilityChange = () => {
      if (document.hidden && userId && authState === 'app') {
        // Tab is hidden - persist data
        persistData().catch((error) => {
          console.error('[DataContext] Failed to persist on visibility change:', error);
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

