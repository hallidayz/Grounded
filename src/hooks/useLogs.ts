/**
 * LOGS HOOK
 * 
 * Provides log entry management utilities that extend DataContext.
 * Handles CRUD operations for feeling logs and log entries.
 */

import { useCallback, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { LogEntry } from '../types';
import { getDatabaseAdapter } from '../services/databaseAdapter';
import { getCurrentUser } from '../services/authService';

export interface UseLogsReturn {
  /**
   * All log entries from DataContext
   */
  logs: LogEntry[];
  
  /**
   * Get a log entry by ID
   */
  getLog: (logId: string) => LogEntry | undefined;
  
  /**
   * Get logs for a specific value
   */
  getLogsByValue: (valueId: string) => LogEntry[];
  
  /**
   * Get logs by emotional state
   */
  getLogsByEmotionalState: (emotionalState: string) => LogEntry[];
  
  /**
   * Get recent logs (sorted by date, newest first)
   */
  getRecentLogs: (limit?: number) => LogEntry[];
  
  /**
   * Add a new log entry
   */
  addLog: (entry: Omit<LogEntry, 'id' | 'date'>) => Promise<void>;
  
  /**
   * Update an existing log entry
   */
  updateLog: (logId: string, updates: Partial<LogEntry>) => Promise<void>;
  
  /**
   * Delete a log entry
   */
  deleteLog: (logId: string) => Promise<void>;
  
  /**
   * Clear all logs
   */
  clearLogs: () => Promise<void>;
  
  /**
   * Save a feeling log to the database
   */
  saveFeelingLog: (feelingLog: {
    id: string;
    timestamp: string;
    emotionalState: string;
    selectedFeeling: string | null;
    aiResponse: string;
    isAIResponse: boolean;
    lowStateCount: number;
    userId?: string;
  }) => Promise<void>;
  
  /**
   * Get feeling logs from the database
   */
  getFeelingLogs: (limit?: number) => Promise<any[]>;
  
  /**
   * Get feeling logs by emotional state
   */
  getFeelingLogsByState: (emotionalState: string, limit?: number) => Promise<any[]>;
}

/**
 * Hook for log entry management operations
 * 
 * @example
 * ```tsx
 * const { logs, addLog, getRecentLogs, deleteLog } = useLogs();
 * 
 * // Add a new log entry
 * await addLog({
 *   valueId: 'v1',
 *   livedIt: true,
 *   note: 'Felt great today',
 *   emotionalState: 'positive',
 * });
 * 
 * // Get recent logs
 * const recent = getRecentLogs(10);
 * ```
 */
export function useLogs(): UseLogsReturn {
  const data = useData();
  const adapter = getDatabaseAdapter();

  const getLog = useCallback((logId: string): LogEntry | undefined => {
    return data.logs.find(l => l.id === logId);
  }, [data.logs]);

  const getLogsByValue = useCallback((valueId: string): LogEntry[] => {
    return data.logs.filter(l => l.valueId === valueId);
  }, [data.logs]);

  const getLogsByEmotionalState = useCallback((emotionalState: string): LogEntry[] => {
    return data.logs.filter(l => l.emotionalState === emotionalState);
  }, [data.logs]);

  const getRecentLogs = useCallback((limit?: number): LogEntry[] => {
    const sorted = [...data.logs].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return limit ? sorted.slice(0, limit) : sorted;
  }, [data.logs]);

  const addLog = useCallback(async (entryData: Omit<LogEntry, 'id' | 'date'>): Promise<void> => {
    // Generate ID and date
    const id = crypto?.randomUUID?.() || `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const date = new Date().toISOString();

    const newEntry: LogEntry = {
      ...entryData,
      id,
      date,
    };

    // Update context
    data.handleLogEntry(newEntry);

    // Note: Persistence is handled automatically by DataContext
    console.log('[useLogs] Log entry added', { logId: id });
  }, [data]);

  const updateLog = useCallback(async (logId: string, updates: Partial<LogEntry>): Promise<void> => {
    const log = getLog(logId);
    if (!log) {
      throw new Error(`Log entry not found: ${logId}`);
    }

    const updatedLog: LogEntry = {
      ...log,
      ...updates,
    };

    // Update context
    data.setLogs(prev => prev.map(l => l.id === logId ? updatedLog : l));

    // Note: Persistence is handled automatically by DataContext
    console.log('[useLogs] Log entry updated', { logId });
  }, [data, getLog]);

  const deleteLog = useCallback(async (logId: string): Promise<void> => {
    const log = getLog(logId);
    if (!log) {
      throw new Error(`Log entry not found: ${logId}`);
    }

    // Update context
    data.setLogs(prev => prev.filter(l => l.id !== logId));

    // Note: Persistence is handled automatically by DataContext
    console.log('[useLogs] Log entry deleted', { logId });
  }, [data, getLog]);

  const clearLogs = useCallback(async (): Promise<void> => {
    data.setLogs([]);
    // Note: Persistence is handled automatically by DataContext
    console.log('[useLogs] All logs cleared');
  }, [data]);

  const saveFeelingLog = useCallback(async (feelingLog: {
    id: string;
    timestamp: string;
    emotionalState: string;
    selectedFeeling: string | null;
    aiResponse: string;
    isAIResponse: boolean;
    lowStateCount: number;
    userId?: string;
  }): Promise<void> => {
    const userId = getCurrentUser()?.id || feelingLog.userId;
    if (!userId) {
      throw new Error('User must be authenticated to save feeling logs');
    }

    try {
      await adapter.saveFeelingLog({
        ...feelingLog,
        userId,
      });
      console.log('[useLogs] Feeling log saved', { logId: feelingLog.id });
    } catch (error) {
      console.error('[useLogs] Error saving feeling log:', error);
      throw error;
    }
  }, [adapter]);

  const getFeelingLogs = useCallback(async (limit?: number): Promise<any[]> => {
    const userId = getCurrentUser()?.id;
    try {
      const logs = await adapter.getFeelingLogs(limit, userId);
      return logs;
    } catch (error) {
      console.error('[useLogs] Error getting feeling logs:', error);
      throw error;
    }
  }, [adapter]);

  const getFeelingLogsByState = useCallback(async (
    emotionalState: string,
    limit?: number
  ): Promise<any[]> => {
    try {
      const logs = await adapter.getFeelingLogsByState(emotionalState, limit);
      return logs;
    } catch (error) {
      console.error('[useLogs] Error getting feeling logs by state:', error);
      throw error;
    }
  }, [adapter]);

  return {
    logs: data.logs,
    getLog,
    getLogsByValue,
    getLogsByEmotionalState,
    getRecentLogs,
    addLog,
    updateLog,
    deleteLog,
    clearLogs,
    saveFeelingLog,
    getFeelingLogs,
    getFeelingLogsByState,
  };
}

export default useLogs;

