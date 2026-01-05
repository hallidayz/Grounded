import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { LogEntry, Goal, AppSettings, LCSWConfig } from '../types';
import { dbService } from '../services/database';

interface DataContextType {
  selectedValueIds: string[];
  logs: LogEntry[];
  goals: Goal[];
  settings: AppSettings;
  setSelectedValueIds: React.Dispatch<React.SetStateAction<string[]>>;
  setLogs: React.Dispatch<React.SetStateAction<LogEntry[]>>;
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  handleLogEntry: (entry: LogEntry) => void;
  handleUpdateGoals: (updatedGoals: Goal[]) => void;
  handleUpdateGoalProgress: (goalId: string, update: { date: string; note: string; progress?: number }) => void;
  handleClearData: () => void;
  handleSelectionComplete: (ids: string[]) => void;
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

  // Track if we've loaded initial data to prevent overwriting with empty arrays
  // This is set to true once we receive data from either initialData or via setters
  const hasLoadedInitialDataRef = useRef(false);
  const initializationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    }
  }, [initialData]);

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
      
      // Save if flag is set OR if we have any data (user is actively using the app)
      if (hasLoadedInitialDataRef.current || selectedValueIds.length > 0 || logs.length > 0 || goals.length > 0) {
        const saveData = async () => {
          try {
            console.log('[DataContext] Saving app data', {
              values: selectedValueIds.length,
              logs: logs.length,
              goals: goals.length,
              userId
            });
            await dbService.saveAppData(userId, {
              settings,
              logs,
              goals,
              values: selectedValueIds,
              lcswConfig: settings.lcswConfig,
            });
          } catch (error) {
            console.error('Error saving app data:', error);
          }
        };
        
        // Debounce saves
        const timeoutId = setTimeout(saveData, 500);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [userId, settings, logs, goals, selectedValueIds, authState]);

  const handleLogEntry = useCallback((entry: LogEntry) => {
    setLogs(prev => [entry, ...prev]);
  }, []);

  const handleUpdateGoals = useCallback((updatedGoals: Goal[]) => {
    setGoals(updatedGoals);
  }, []);

  const handleUpdateGoalProgress = useCallback((goalId: string, update: { date: string; note: string; progress?: number }) => {
    setGoals(prevGoals => 
      prevGoals.map(goal => 
        goal.id === goalId 
          ? { ...goal, updates: [...(goal.updates || []), update] }
          : goal
      )
    );
  }, []);

  const handleClearData = useCallback(() => {
    setLogs([]);
    setSelectedValueIds([]);
    setGoals([]);
    setSettings({ reminders: { enabled: false, frequency: 'daily', time: '09:00' } });
  }, []);

  const handleSelectionComplete = useCallback((ids: string[]) => {
    setSelectedValueIds(ids);
  }, []);

  return (
    <DataContext.Provider
      value={{
        selectedValueIds,
        logs,
        goals,
        settings,
        setSelectedValueIds,
        setLogs,
        setGoals,
        setSettings,
        handleLogEntry,
        handleUpdateGoals,
        handleUpdateGoalProgress,
        handleClearData,
        handleSelectionComplete,
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

