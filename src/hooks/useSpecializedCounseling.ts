/**
 * useSpecializedCounseling Hook
 * 
 * React hook for using specialized system prompts for mental health counseling.
 * Provides evidence-based, framework-driven AI support instead of generic advice.
 */

import { useState, useCallback } from 'react';
import {
  SystemPromptType,
  CounselingSession,
  startCounselingSession,
  continueCounselingSession,
  recommendSystemPrompt,
  getSystemPrompt,
} from '../services/ai/specializedCounseling';
import { CrisisResponse } from '../services/safetyService';
import { logger } from '../utils/logger';

export interface UseSpecializedCounselingReturn {
  session: CounselingSession | null;
  isGenerating: boolean;
  error: string | null;
  startSession: (
    promptType: SystemPromptType,
    initialMessage: string,
    context?: CounselingSession['context']
  ) => Promise<string | CrisisResponse>;
  continueSession: (message: string) => Promise<string | CrisisResponse>;
  endSession: () => void;
  recommendPrompt: (emotionalState?: string, situation?: string) => SystemPromptType | null;
}

/**
 * Hook for specialized counseling sessions
 */
export function useSpecializedCounseling(): UseSpecializedCounselingReturn {
  const [session, setSession] = useState<CounselingSession | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startSession = useCallback(
    async (
      promptType: SystemPromptType,
      initialMessage: string,
      context?: CounselingSession['context']
    ): Promise<string | CrisisResponse> => {
      setIsGenerating(true);
      setError(null);

      try {
        const response = await startCounselingSession(promptType, initialMessage, context);

        // If crisis response, don't create session
        if (typeof response === 'object' && 'isCrisis' in response) {
          setIsGenerating(false);
          return response;
        }

        // Create new session
        const newSession: CounselingSession = {
          promptType,
          messages: [
            {
              role: 'user',
              content: initialMessage,
              timestamp: new Date().toISOString(),
            },
            {
              role: 'assistant',
              content: response as string,
              timestamp: new Date().toISOString(),
            },
          ],
          context,
        };

        setSession(newSession);
        setIsGenerating(false);
        return response;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        logger.error('[useSpecializedCounseling] Error starting session:', errorMsg);
        setError(errorMsg);
        setIsGenerating(false);
        throw err;
      }
    },
    []
  );

  const continueSession = useCallback(
    async (message: string): Promise<string | CrisisResponse> => {
      if (!session) {
        throw new Error('No active session. Start a session first.');
      }

      setIsGenerating(true);
      setError(null);

      try {
        const response = await continueCounselingSession(session, message);

        // If crisis response, don't update session
        if (typeof response === 'object' && 'isCrisis' in response) {
          setIsGenerating(false);
          return response;
        }

        // Update session with new messages
        const updatedSession: CounselingSession = {
          ...session,
          messages: [
            ...session.messages,
            {
              role: 'user',
              content: message,
              timestamp: new Date().toISOString(),
            },
            {
              role: 'assistant',
              content: response as string,
              timestamp: new Date().toISOString(),
            },
          ],
        };

        setSession(updatedSession);
        setIsGenerating(false);
        return response;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        logger.error('[useSpecializedCounseling] Error continuing session:', errorMsg);
        setError(errorMsg);
        setIsGenerating(false);
        throw err;
      }
    },
    [session]
  );

  const endSession = useCallback(() => {
    setSession(null);
    setError(null);
    setIsGenerating(false);
  }, []);

  const recommendPrompt = useCallback(
    (emotionalState?: string, situation?: string): SystemPromptType | null => {
      return recommendSystemPrompt(emotionalState, situation);
    },
    []
  );

  return {
    session,
    isGenerating,
    error,
    startSession,
    continueSession,
    endSession,
    recommendPrompt,
  };
}

/**
 * Helper hook to get system prompt info
 */
export function useSystemPromptInfo(promptType: SystemPromptType) {
  return getSystemPrompt(promptType);
}
