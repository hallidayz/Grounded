// src/hooks/useDashboard.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ValueItem,
  LogEntry,
  Goal,
  GoalFrequency,
  LCSWConfig,
  FeelingLog,
  UserInteraction,
  Session,
  ReflectionAnalysisResponse,
} from '../types';
import { EmotionalState, getEmotionalState } from '../services/emotionalStates';
import {
  generateEncouragement,
  generateEmotionalEncouragement,
  generateValueMantra,
  suggestGoal,
  detectCrisis,
  analyzeReflection,
  generateFocusLens,
  generateCounselingGuidance,
} from '../services/aiService';
import { CrisisResponse } from '../services/safetyService';
import { shareViaEmail, generateGoalsEmail } from '../services/emailService';
import { useDebounce } from './useDebounce';
import { getItem, setItem, removeItem } from '../services/storage';
import { getDatabaseAdapter } from '../services/databaseAdapter';
import { getCurrentUser } from '../services/authService';

/**
 * Unified hook configuration interface — prevents argument-order bugs.
 */
export interface UseDashboardOptions {
  values?: ValueItem[];
  goals?: Goal[];
  logs?: LogEntry[];
  lcswConfig?: LCSWConfig;
  onLog?: (entry: LogEntry) => void;
  onUpdateGoals?: (goals: Goal[]) => void;
}

/**
 * Centralized dashboard state & logic for emotions, goals, and AI interactions.
 */
export function useDashboard({
  values = [],
  goals = [],
  logs = [],
  lcswConfig,
  onLog = () => {},
  onUpdateGoals = () => {},
}: UseDashboardOptions) {
  const [activeValueId, setActiveValueId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Emotional/tracking state
  const [emotionalState, setEmotionalState] = useState<EmotionalState>('mixed');
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const [lowStateCount, setLowStateCount] = useState(0);
  const [encouragementText, setEncouragementText] = useState<string | null>(null);
  const [encouragementLoading, setEncouragementLoading] = useState(false);

  // Reflection & AI generated data
  const [reflectionText, setReflectionText] = useState('');
  const [goalText, setGoalText] = useState('');
  const [goalFreq, setGoalFreq] = useState<GoalFrequency>('daily');
  const [reflectionAnalysis, setReflectionAnalysis] = useState<string | null>(
    null
  );
  const [rawReflectionAnalysis, setRawReflectionAnalysis] =
    useState<ReflectionAnalysisResponse | null>(null);
  const [coachInsight, setCoachInsight] = useState<string | null>(null);
  const [valueMantra, setValueMantra] = useState<string | null>(null);

  const [crisisAlert, setCrisisAlert] = useState<CrisisResponse | null>(null);
  const debouncedReflection = useDebounce(reflectionText, 1000);
  const valueCardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  /**
   * Utility — safely generate UUIDs
   */
  const generateUUID = useCallback((): string => {
    if (crypto?.randomUUID) return crypto.randomUUID();
    return 'xxxxxx4xxxyxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }, []);

  /**
   * Save emotion/feeling entries to the local database
   */
  const saveEmotionInteraction = useCallback(
    async (emotion: string, subEmotion: string, valueId: string) => {
      try {
        // Get userId properly from getCurrentUser or sessionStorage
        let userId: string = 'anonymous';
        try {
          const user = await getCurrentUser();
          userId = user?.id || sessionStorage.getItem('userId') || 'anonymous';
        } catch (err) {
          userId = sessionStorage.getItem('userId') || 'anonymous';
        }

        const timestamp = new Date().toISOString();
        const logId = `feeling-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 9)}`;

        const jsonIn = JSON.stringify({ emotion, subEmotion, valueId, timestamp, userId });
        // generateEmotionalEncouragement only takes 2 parameters: emotion and subEmotion
        const encouragement = await generateEmotionalEncouragement(
          emotion as EmotionalState,
          subEmotion
        );

        const feelingLog: FeelingLog = {
          id: logId,
          timestamp,
          userId: userId !== 'anonymous' ? userId : undefined, // Add userId to feelingLog
          emotion,
          subEmotion,
          jsonIn,
          jsonOut: JSON.stringify(encouragement),
          focusLens: '',
          reflection: '',
          selfAdvocacy: '',
          frequency: 'daily',
          jsonAssessment: '',
          isAIResponse: true,
          lowStateCount,
        };

        // Use adapter for security (encryption boundary validation)
        const adapter = getDatabaseAdapter();
        await adapter.saveFeelingLog({
          id: feelingLog.id,
          timestamp: feelingLog.timestamp,
          userId: feelingLog.userId,
          emotionalState: feelingLog.emotion || feelingLog.emotionalState || '',
          selectedFeeling: feelingLog.subEmotion || feelingLog.selectedFeeling || null,
          aiResponse: feelingLog.jsonOut || '',
          isAIResponse: feelingLog.isAIResponse !== undefined ? feelingLog.isAIResponse : true,
          lowStateCount: feelingLog.lowStateCount || 0,
        });
      } catch (err) {
        console.error('Error saving emotion interaction:', err);
      }
    },
    [lcswConfig, lowStateCount]
  );

  /**
   * Handle AI‑based encouragement generation
   */
  const handleEmotionalEncourage = useCallback(
    async (state: EmotionalState, subEmotion?: string | null) => {
      setEncouragementLoading(true);
      setEncouragementText(null);

      // Use the passed subEmotion, or fall back to selectedFeeling from state
      const feelingToUse = subEmotion !== undefined ? subEmotion : selectedFeeling;

      let newLowCount = lowStateCount;
      if (['heavy', 'drained', 'overwhelmed'].includes(state))
        newLowCount += 1;
      else newLowCount = 0;
      setLowStateCount(newLowCount);

      try {
        // generateEmotionalEncouragement only takes 2 parameters: emotion and subEmotion
        const encouragement = await generateEmotionalEncouragement(
          state,
          feelingToUse || null
        );

        setEncouragementText(encouragement);
        // Use adapter for security (encryption boundary validation)
        const adapter = getDatabaseAdapter();
        await adapter.saveFeelingLog({
          id: `feeling-${Date.now()}`,
          timestamp: new Date().toISOString(),
          emotionalState: state,
          selectedFeeling: feelingToUse || null,
          aiResponse: encouragement,
          isAIResponse: true,
          lowStateCount: newLowCount,
        });
      } catch (err) {
        console.error('Encouragement generation failed, fallback:', err);
        setEncouragementText("You're doing important work. One step at a time.");
      } finally {
        setEncouragementLoading(false);
      }
    },
    [selectedFeeling, lowStateCount, lcswConfig]
  );

  /**
   * Reflection & goal update commitment
   */
  const handleCommit = useCallback(
    async (valueId: string) => {
      if (!reflectionText.trim() && !goalText.trim()) return;

      // Get userId from getCurrentUser or sessionStorage
      let userId: string | null = null;
      try {
        const user = await getCurrentUser();
        userId = user?.id || null;
      } catch (err) {
        // Fallback to sessionStorage
        userId = sessionStorage.getItem('userId') || null;
      }

      const timestamp = new Date().toISOString();
      const hasGoal = goalText.trim().length > 0;

      if (hasGoal) {
        const newGoal: Goal = {
          id: `${Date.now()}-goal`,
          valueId,
          userId: userId || undefined, // Add userId to goal
          text: goalText,
          frequency: goalFreq,
          completed: false,
          createdAt: timestamp,
          updates: [],
        };
        onUpdateGoals([newGoal, ...goals]);
      }

      const logEntry: LogEntry = {
        id: `${Date.now()}-log`,
        date: timestamp,
        valueId,
        livedIt: true,
        note: reflectionText.trim(),
        type: 'goal-update',
        mood: emotionalState,
      };
      onLog(logEntry);

      // Use adapter for security (encryption boundary validation)
      const adapter = getDatabaseAdapter();
      await adapter.saveFeelingLog({
        id: `${timestamp}-feeling`,
        timestamp,
        userId: userId || undefined,
        emotionalState: emotionalState || '',
        selectedFeeling: selectedFeeling || null,
        aiResponse: JSON.stringify({ reflection: reflectionText, selfAdvocacy: goalText }),
        isAIResponse: true,
        lowStateCount,
      });

      // Clear state
      setReflectionText('');
      setGoalText('');
      setActiveValueId(null);
    },
    [
      reflectionText,
      goalText,
      goalFreq,
      emotionalState,
      selectedFeeling,
      goals,
      onLog,
      onUpdateGoals,
      lowStateCount,
    ]
  );

  /**
   * Basic getters and setters
   */
  const resetEncouragement = useCallback(() => {
    setEncouragementText(null);
  }, []);

  return {
    // state
    activeValueId,
    emotionalState,
    selectedFeeling,
    reflectionText,
    goalText,
    goalFreq,
    encouragementText,
    encouragementLoading,
    coachInsight,
    valueMantra,
    reflectionAnalysis,
    crisisAlert,
    loading,

    // setters
    setActiveValueId,
    setEmotionalState,
    setSelectedFeeling,
    setReflectionText,
    setGoalText,
    setGoalFreq,
    setCrisisAlert,
    setEncouragementText, // Expose for setting encouragement from external sources

    // handlers
    handleEmotionalEncourage,
    handleCommit,
    saveEmotionInteraction,
    resetEncouragement,
  };
}