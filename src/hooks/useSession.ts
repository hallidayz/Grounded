/**
 * SESSION HOOK
 * 
 * Provides session management utilities for reflection sessions.
 * Handles session creation, updates, and retrieval.
 */

import { useCallback } from 'react';
import { getDatabaseAdapter } from '../services/databaseAdapter';
import { getCurrentUser } from '../services/authService';

export interface Session {
  id: string;
  userId: string;
  startTimestamp: string;
  endTimestamp?: string;
  valueId: string;
  initialEmotionalState?: string;
  finalEmotionalState?: string;
  selectedFeeling?: string;
  reflectionLength?: number;
  goalCreated: boolean;
  duration?: number;
}

export interface UseSessionReturn {
  /**
   * Create a new session
   */
  createSession: (sessionData: Omit<Session, 'id' | 'userId'>) => Promise<Session>;
  
  /**
   * Update an existing session
   */
  updateSession: (sessionId: string, updates: Partial<Session>) => Promise<void>;
  
  /**
   * Get a session by ID
   */
  getSession: (sessionId: string) => Promise<Session | null>;
  
  /**
   * Get all sessions for the current user
   */
  getSessions: (limit?: number) => Promise<Session[]>;
  
  /**
   * Get sessions for a specific value
   */
  getSessionsByValue: (valueId: string, limit?: number) => Promise<Session[]>;
  
  /**
   * End a session (set endTimestamp and duration)
   */
  endSession: (sessionId: string, finalEmotionalState?: string) => Promise<void>;
}

/**
 * Hook for session management operations
 * 
 * @example
 * ```tsx
 * const { createSession, updateSession, endSession } = useSession();
 * 
 * // Create a new session
 * const session = await createSession({
 *   valueId: 'v1',
 *   startTimestamp: new Date().toISOString(),
 *   initialEmotionalState: 'mixed',
 *   goalCreated: false,
 * });
 * 
 * // End the session
 * await endSession(session.id, 'calm');
 * ```
 */
export function useSession(): UseSessionReturn {
  const adapter = getDatabaseAdapter();

  const createSession = useCallback(async (
    sessionData: Omit<Session, 'id' | 'userId'>
  ): Promise<Session> => {
    const userId = getCurrentUser()?.id;
    if (!userId) {
      throw new Error('User must be authenticated to create sessions');
    }

    const id = crypto?.randomUUID?.() || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: Session = {
      ...sessionData,
      id,
      userId,
    };

    try {
      await adapter.saveSession(session);
      console.log('[useSession] Session created', { sessionId: id });
      return session;
    } catch (error) {
      console.error('[useSession] Error creating session:', error);
      throw error;
    }
  }, [adapter]);

  const updateSession = useCallback(async (
    sessionId: string,
    updates: Partial<Session>
  ): Promise<void> => {
    try {
      await adapter.updateSession(sessionId, updates);
      console.log('[useSession] Session updated', { sessionId });
    } catch (error) {
      console.error('[useSession] Error updating session:', error);
      throw error;
    }
  }, [adapter]);

  const getSession = useCallback(async (sessionId: string): Promise<Session | null> => {
    try {
      const sessions = await adapter.getSessions();
      return sessions.find(s => s.id === sessionId) || null;
    } catch (error) {
      console.error('[useSession] Error getting session:', error);
      throw error;
    }
  }, [adapter]);

  const getSessions = useCallback(async (limit?: number): Promise<Session[]> => {
    try {
      const sessions = await adapter.getSessions(limit);
      return sessions as Session[];
    } catch (error) {
      console.error('[useSession] Error getting sessions:', error);
      throw error;
    }
  }, [adapter]);

  const getSessionsByValue = useCallback(async (
    valueId: string,
    limit?: number
  ): Promise<Session[]> => {
    try {
      const sessions = await adapter.getSessionsByValue(valueId, limit);
      return sessions as Session[];
    } catch (error) {
      console.error('[useSession] Error getting sessions by value:', error);
      throw error;
    }
  }, [adapter]);

  const endSession = useCallback(async (
    sessionId: string,
    finalEmotionalState?: string
  ): Promise<void> => {
    const session = await getSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const endTimestamp = new Date().toISOString();
    const startTime = new Date(session.startTimestamp).getTime();
    const endTime = new Date(endTimestamp).getTime();
    const duration = Math.floor((endTime - startTime) / 1000); // Duration in seconds

    await updateSession(sessionId, {
      endTimestamp,
      finalEmotionalState: finalEmotionalState || session.finalEmotionalState,
      duration,
    });
  }, [getSession, updateSession]);

  return {
    createSession,
    updateSession,
    getSession,
    getSessions,
    getSessionsByValue,
    endSession,
  };
}

export default useSession;

