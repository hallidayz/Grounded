import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
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

  // Update state when initialData changes (from initialization)
  useEffect(() => {
    if (initialData) {
      if (initialData.selectedValueIds) {
        setSelectedValueIds(initialData.selectedValueIds);
      }
      if (initialData.logs) {
        setLogs(initialData.logs);
      }
      if (initialData.goals) {
        setGoals(initialData.goals);
      }
      if (initialData.settings) {
        setSettings(initialData.settings);
      }
    }
  }, [initialData]);

  // Save app data to database whenever it changes
  useEffect(() => {
    if (userId && authState === 'app') {
      const saveData = async () => {
        try {
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

