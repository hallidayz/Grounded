import { useState, useEffect, useRef, useCallback } from 'react';
import { ValueItem, LogEntry, Goal, GoalFrequency, LCSWConfig, FeelingLog, UserInteraction, Session } from '../types';
import { EmotionalState, getEmotionalState } from '../services/emotionalStates';
import { generateEncouragement, generateEmotionalEncouragement, generateValueMantra, suggestGoal, detectCrisis, analyzeReflection } from '../services/aiService';
import { shareViaEmail, generateGoalsEmail } from '../services/emailService';
import { useDebounce } from './useDebounce';
import { getItem, setItem, removeItem } from '../services/storage';
import { dbService } from '../services/database';
import { getCurrentUser } from '../services/authService';

export function useDashboard(
  values: ValueItem[],
  goals: Goal[],
  logs: LogEntry[],
  lcswConfig: LCSWConfig | undefined,
  onLog: (entry: LogEntry) => void,
  onUpdateGoals: (goals: Goal[]) => void
) {
  const [activeValueId, setActiveValueId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastLoggedId, setLastLoggedId] = useState<string | null>(null);
  
  const [guideMood, setGuideMood] = useState<'🌱' | '🔥' | '✨' | '🧗'>('✨');
  const [emotionalState, _setEmotionalState] = useState<EmotionalState>('mixed');
  const [selectedFeeling, _setSelectedFeeling] = useState<string | null>(null);
  const [showFeelingsList, setShowFeelingsList] = useState(false);
  const debouncedGuideMood = useDebounce(guideMood, 500);
  const [reflectionText, setReflectionText] = useState('');
  const [goalText, setGoalText] = useState('');
  const [goalFreq, setGoalFreq] = useState<GoalFrequency>('daily');
  const [aiGoalLoading, setAiGoalLoading] = useState(false);
  
  const [coachInsight, setCoachInsight] = useState<string | null>(null);
  const [valueMantra, setValueMantra] = useState<string | null>(null);
  const [reflectionAnalysis, setReflectionAnalysis] = useState<string | null>(null);
  const [analyzingReflection, setAnalyzingReflection] = useState(false);
  
  // Encourage section state
  const [encouragementText, setEncouragementText] = useState<string | null>(null);
  const [encouragementLoading, setEncouragementLoading] = useState(false);
  const [lastEncouragedState, setLastEncouragedState] = useState<string | null>(null);
  const [lowStateCount, setLowStateCount] = useState(0);
  
  const debouncedReflectionText = useDebounce(reflectionText, 2000);
  
  // Refs for scrolling to value cards
  const valueCardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  // Session tracking
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [initialEmotionalState, setInitialEmotionalState] = useState<EmotionalState | null>(null);
  const [sessionValueId, setSessionValueId] = useState<string | null>(null);
  const reflectionStartedRef = useRef(false);
  
  // Generate UUID helper
  const generateUUID = useCallback(() => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }, []);

  // Save emotion interaction to database
  const saveEmotionInteraction = useCallback(async (
    emotion: string,
    subEmotion: string,
    valueId: string
  ): Promise<void> => {
    try {
      const userId = sessionStorage.getItem('userId') || 'anonymous';
      const timestamp = new Date().toISOString();
      const logId = `feeling-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Build JSON input
      const jsonIn = JSON.stringify({
        emotion,
        subEmotion,
        valueId,
        timestamp,
        userId
      });
      
      // Get AI response (or rule-based fallback)
      let jsonOut = '';
      let focusLens = '';
      let isAIResponse = false;
      
      try {
        // Try to get AI encouragement
        const encouragement = await generateEmotionalEncouragement(
          emotion as EmotionalState,
          subEmotion,
          0, // lowStateCount - we'll track this separately
          lcswConfig,
          {
            recentJournalText: '',
            timeOfDay: (() => {
              const hour = new Date().getHours();
              if (hour < 12) return 'morning';
              if (hour < 18) return 'afternoon';
              if (hour < 22) return 'evening';
              return 'night';
            })(),
            userPatterns: {
              frequentStates: [],
              progress: 0
            }
          }
        );
        
        // Format as JSON response
        jsonOut = JSON.stringify({
          message: encouragement,
          acknowledgeFeeling: subEmotion,
          timestamp
        });
        isAIResponse = true;
        focusLens = encouragement; // Initial focus lens is the encouragement
      } catch (error) {
        console.warn('AI encouragement failed, using rule-based fallback:', error);
        // Rule-based fallback
        const fallbackMessage = `I hear that you're feeling ${subEmotion}. That's valid, and it's okay to feel this way. Take a moment to breathe and remember that feelings are temporary.`;
        jsonOut = JSON.stringify({
          message: fallbackMessage,
          acknowledgeFeeling: subEmotion,
          timestamp
        });
        isAIResponse = false;
        focusLens = fallbackMessage;
      }
      
      // Save to database
      const feelingLog: FeelingLog = {
        id: logId,
        timestamp,
        emotion,
        subEmotion,
        jsonIn,
        jsonOut,
        focusLens,
        reflection: '',
        selfAdvocacy: '',
        frequency: 'daily',
        jsonAssessment: '',
        // Legacy fields
        emotionalState: emotion as any,
        selectedFeeling: subEmotion,
        aiResponse: jsonOut,
        isAIResponse,
        lowStateCount: 0
      };
      
      await dbService.saveFeelingLog(feelingLog);
      console.log('✅ Emotion interaction saved to database');
    } catch (error) {
      console.error('Error saving emotion interaction:', error);
      // Don't throw - this is non-critical
    }
  }, [lcswConfig, generateEmotionalEncouragement]);
  
  // Save user interaction helper
  const saveInteraction = useCallback(async (type: UserInteraction['type'], metadata?: Record<string, any>) => {
    try {
      const userId = sessionStorage.getItem('userId') || 'anonymous';
      const interaction: UserInteraction = {
        id: generateUUID(),
        timestamp: new Date().toISOString(),
        type,
        sessionId: currentSessionId || 'no-session',
        valueId: activeValueId || undefined,
        emotionalState: emotionalState || undefined,
        selectedFeeling: selectedFeeling || undefined,
        metadata
      };
      await dbService.saveUserInteraction(interaction);
    } catch (error) {
      console.error('Failed to save interaction:', error);
      // Continue silently - don't break user flow
    }
  }, [currentSessionId, activeValueId, emotionalState, selectedFeeling, generateUUID]);
  
  // Wrapped setters with interaction tracking
  const setEmotionalState = useCallback((state: EmotionalState) => {
    _setEmotionalState(state);
    if (activeValueId && state !== 'mixed') {
      saveInteraction('feeling_selected', { emotionalState: state });
    }
  }, [activeValueId, saveInteraction]);
  
  const setSelectedFeeling = useCallback(async (feeling: string | null) => {
    _setSelectedFeeling(feeling);
    if (activeValueId && feeling) {
      saveInteraction('sub_feeling_selected', { selectedFeeling: feeling });
      
      // Save emotion interaction to database when both emotion and sub-emotion are selected
      if (emotionalState && emotionalState !== 'mixed' && feeling && activeValueId) {
        await saveEmotionInteraction(emotionalState, feeling, activeValueId);
      }
    }
  }, [activeValueId, saveInteraction, emotionalState]);
  
  // Start session when card opens
  const startSession = useCallback(async (valueId: string) => {
    try {
      const userId = sessionStorage.getItem('userId') || 'anonymous';
      const sessionId = generateUUID();
      const startTime = Date.now();
      
      setCurrentSessionId(sessionId);
      setSessionStartTime(startTime);
      setSessionValueId(valueId);
      setInitialEmotionalState(emotionalState);
      reflectionStartedRef.current = false;
      
      const session: Session = {
        id: sessionId,
        userId,
        startTimestamp: new Date().toISOString(),
        valueId,
        initialEmotionalState: emotionalState || undefined,
        goalCreated: false
      };
      
      await dbService.saveSession(session);
      await saveInteraction('card_opened');
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  }, [emotionalState, generateUUID, saveInteraction]);
  
  // End session when card closes or commits
  const endSession = useCallback(async (valueId: string, goalCreated: boolean = false) => {
    if (!currentSessionId || !sessionStartTime) return;
    
    try {
      const userId = sessionStorage.getItem('userId') || 'anonymous';
      const endTime = Date.now();
      const duration = Math.floor((endTime - sessionStartTime) / 1000);
      
      await dbService.updateSession(currentSessionId, {
        endTimestamp: new Date().toISOString(),
        finalEmotionalState: emotionalState || undefined,
        reflectionLength: reflectionText.trim().length || undefined,
        goalCreated,
        duration
      });
      
      await saveInteraction('card_closed', { duration, goalCreated });
      
      setCurrentSessionId(null);
      setSessionStartTime(null);
      setSessionValueId(null);
      setInitialEmotionalState(null);
      reflectionStartedRef.current = false;
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  }, [currentSessionId, sessionStartTime, emotionalState, reflectionText, saveInteraction]);

  // Track session start/end when activeValueId changes
  useEffect(() => {
    if (activeValueId) {
      // Card opened - start session
      startSession(activeValueId);
    } else if (currentSessionId) {
      // Card closed - end session
      const valueId = values.find(v => v.id === activeValueId)?.id || '';
      if (valueId) {
        endSession(valueId, false);
      }
    }
  }, [activeValueId, currentSessionId, startSession, endSession, values]);
  
  // Load/save drafts
  useEffect(() => {
    if (activeValueId) {
      Promise.all([
        getItem<string>(`draft_reflection_${activeValueId}`),
        getItem<string>(`draft_goal_${activeValueId}`)
      ]).then(([savedRef, savedGoal]) => {
        if (savedRef) setReflectionText(savedRef);
        if (savedGoal) setGoalText(savedGoal);
      }).catch(console.error);
    }
  }, [activeValueId]);

  useEffect(() => {
    if (activeValueId) {
      setItem(`draft_reflection_${activeValueId}`, reflectionText).catch(console.error);
      setItem(`draft_goal_${activeValueId}`, goalText).catch(console.error);
      
      // Track when user starts typing reflection
      if (reflectionText.trim().length > 0 && !reflectionStartedRef.current) {
        reflectionStartedRef.current = true;
        saveInteraction('reflection_started');
      }
    }
  }, [reflectionText, goalText, activeValueId, saveInteraction]);

  // Manual reflection analysis trigger
  // Builds enhanced reflection context with feeling + sub-feeling + deep reflection
  const triggerReflectionAnalysis = useCallback(async () => {
    const hasReflection = reflectionText.trim().length > 20; // Minimum 20 characters
    const hasFeeling = emotionalState && emotionalState !== 'mixed';
    const hasSubFeeling = selectedFeeling !== null;
    
    if (!hasReflection) {
      console.warn('Reflection text is too short for analysis');
      return;
    }
    
    if (!hasFeeling || !hasSubFeeling) {
      console.warn('Please select both feeling and sub-feeling before analyzing');
      return;
    }
    
    // Build enhanced reflection context with feeling information
    const stateConfig = getEmotionalState(emotionalState);
    const feelingContext = stateConfig && selectedFeeling
      ? `Emotional State: ${stateConfig.label} (${selectedFeeling})\n\n`
      : '';
    
    const enhancedReflection = feelingContext 
      ? `${feelingContext}Deep Reflection:\n${reflectionText}`
      : reflectionText;
    
    setAnalyzingReflection(true);
    try {
      const analysis = await analyzeReflection(enhancedReflection, goalFreq, lcswConfig, emotionalState, selectedFeeling);
      setReflectionAnalysis(analysis);
    } catch (error) {
      console.error('Reflection analysis error:', error);
      setReflectionAnalysis(null);
    } finally {
      setAnalyzingReflection(false);
    }
  }, [reflectionText, emotionalState, selectedFeeling, goalFreq, lcswConfig]);

  // AI Motivation Refresh - Focus Lens based on selected feeling
  // Use ref to prevent infinite loops from logs array changes
  const logsRef = useRef(logs);
  logsRef.current = logs;
  
  useEffect(() => {
    if (activeValueId) {
      const activeValue = values.find(v => v.id === activeValueId);
      if (activeValue) {
        setLoading(true);
        // Use generateEmotionalEncouragement if feeling is selected, otherwise use generateEncouragement
        // Use ref to get latest logs without causing re-renders
        const recentJournalText = logsRef.current.slice(0, 3).map(l => l.note || l.deepReflection || '').join(' ').substring(0, 500);
        const encouragementPromise = (emotionalState && selectedFeeling)
          ? generateEmotionalEncouragement(emotionalState, selectedFeeling, lowStateCount, lcswConfig, {
              recentJournalText,
              timeOfDay: (() => {
                const hour = new Date().getHours();
                if (hour < 12) return 'morning';
                if (hour < 18) return 'afternoon';
                if (hour < 22) return 'evening';
                return 'night';
              })(),
              userPatterns: {
                frequentStates: [],
                progress: 0
              }
            })
          : generateEncouragement(activeValue, debouncedGuideMood, lcswConfig);
        
        Promise.all([
          encouragementPromise,
          generateValueMantra(activeValue)
        ]).then(([insight, mantra]) => {
          setCoachInsight(insight);
          setValueMantra(mantra);
          setLoading(false);
        }).catch(error => {
          console.error("AI Motivation Error:", error);
          setCoachInsight("There was an issue connecting to the AI coach. Focusing on the present moment is a powerful step.");
          setValueMantra("Be Here Now");
          setLoading(false);
        });
      }
    } else {
      setCoachInsight(null);
    }
    // Removed 'logs' from dependencies to prevent infinite loops
    // Use logsRef.current inside the effect to access latest logs
  }, [debouncedGuideMood, activeValueId, values, lcswConfig, emotionalState, selectedFeeling, lowStateCount]);

  // Generate mantra for top value on mount
  const [topValueMantra, setTopValueMantra] = useState<string | null>(null);
  useEffect(() => {
    if (values.length > 0 && !topValueMantra) {
      const topValue = values[0];
      generateValueMantra(topValue)
        .then(mantra => setTopValueMantra(mantra))
        .catch(() => setTopValueMantra("Be Here Now"));
    }
  }, [values, topValueMantra]);

  // Scroll to value card when it opens
  useEffect(() => {
    if (activeValueId && valueCardRefs.current[activeValueId]) {
      setTimeout(() => {
        valueCardRefs.current[activeValueId]?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 100);
    }
  }, [activeValueId]);

  const getReflectionPlaceholder = useCallback((freq: GoalFrequency, subFeeling?: string | null) => {
    // Build template based on sub-feeling if provided
    const feelingTemplate = subFeeling 
      ? `I feel ${subFeeling} because...\n\nWhat specific situation, thought, or experience is connected to feeling ${subFeeling}?\n\nHow does feeling ${subFeeling} show up in my body, thoughts, or behaviors?\n\nWhat would help me navigate feeling ${subFeeling} in a way that aligns with my values?`
      : null;

    if (feelingTemplate) {
      return feelingTemplate;
    }

    // Fallback to frequency-based templates
    const daily = [
      "The Hour: Dominant mood 'flavor'? Thought, person, or sensation triggered it?",
      "The Day: When did I feel 'connected' vs 'checked out'?",
      "Daily Win: One small boundary set or self-care moment followed through?",
      "Energy Audit: What interaction drained the battery? How to recharge?"
    ].join('\n\n');

    const weekly = [
      "The Narrative: If this week was a book chapter, what would the title be?",
      "Coping Check: Which therapy tools felt like life jackets? Which felt like anchors?",
      "Social Environment: How did my body feel after leaving specific social spaces?",
      "Unfinished Business: What am I still 'chewing on' or feeling heavy about?"
    ].join('\n\n');

    const monthly = [
      "Growth Marker: What feels slightly less daunting than it did 30 days ago?",
      "Recurring Theme: What 'broken record' thought kept appearing? What is it saying?",
      "External Impact: How have systemic factors (finances, work) influenced me?",
      "Goal Alignment: Am I moving toward my treatment plan version of self?"
    ].join('\n\n');

    if (freq === 'weekly') return weekly;
    if (freq === 'monthly' || freq === 'quarterly') return monthly;
    return daily;
  }, []);

  const handleSuggestGoal = useCallback(async (value: ValueItem) => {
    setAiGoalLoading(true);
    // Track SUGGEST button click
    await saveInteraction('suggest_clicked', { hasReflection: reflectionText.trim().length > 0 });
    
    try {
      const crisisCheck = detectCrisis(reflectionText, lcswConfig);
      if (crisisCheck.isCrisis && crisisCheck.recommendedAction !== 'continue') {
        setGoalText(`### Safety First\n\n⚠️ Your reflection contains concerning content. Please contact your therapist or emergency services if needed.\n\nEmergency: ${lcswConfig?.emergencyContact?.phone || '911'}\nCrisis Line: 988`);
        setAiGoalLoading(false);
        return;
      }
      // Build context including feeling and sub-feeling - ensure deep reflection is always included
      const feelingContext = emotionalState && selectedFeeling
        ? `Emotional State: ${emotionalState}\nSelected Feeling: ${selectedFeeling}\n\n`
        : emotionalState
        ? `Emotional State: ${emotionalState}\n\n`
        : '';
      
      // Always include deep reflection if it exists
      const deepReflectionContext = reflectionText.trim() 
        ? `${feelingContext}Deep Reflection:\n${reflectionText}\n\n${reflectionAnalysis ? `Reflection Analysis:\n${reflectionAnalysis}` : ''}`
        : feelingContext + (reflectionAnalysis || '');
      
      const suggestion = await suggestGoal(value, goalFreq, deepReflectionContext, lcswConfig, emotionalState, selectedFeeling);
      setGoalText(suggestion);
    } catch (error) {
      console.error("AI Goal Error:", error);
      setGoalText("Error suggesting a goal. Try writing a small, simple one yourself!");
    } finally {
      setAiGoalLoading(false);
    }
  }, [reflectionText, reflectionAnalysis, goalFreq, emotionalState, selectedFeeling, lcswConfig, saveInteraction]);

  const handleCompleteGoal = useCallback(async (goal: Goal) => {
    const completedGoal = { ...goal, completed: true };
    onLog({
      id: Date.now().toString() + "-done",
      date: new Date().toISOString(),
      valueId: goal.valueId,
      livedIt: true,
      note: `Achieved Commitment: ${goal.text.substring(0, 40)}...`,
      type: 'goal-completion',
      goalText: goal.text
    });
    onUpdateGoals(goals.map(g => g.id === goal.id ? completedGoal : g));

    // Send email to therapist when goal is completed
    if (lcswConfig?.emergencyContact?.email) {
      const therapistEmails = [lcswConfig.emergencyContact.email];
      const emailData = generateGoalsEmail(goals.map(g => g.id === goal.id ? completedGoal : g), values, [completedGoal], true);
      await shareViaEmail(emailData, therapistEmails);
    }
  }, [goals, values, lcswConfig, onLog, onUpdateGoals]);

  const handleDeleteGoal = useCallback((goalId: string) => {
    onUpdateGoals(goals.filter(g => g.id !== goalId));
  }, [goals, onUpdateGoals]);

  const handleEmotionalEncourage = useCallback(async (state: EmotionalState) => {
    setEncouragementLoading(true);
    setLastEncouragedState(state);
    setEncouragementText(null);
    
    let newLowStateCount: number;
    if (state === 'drained' || state === 'heavy' || state === 'overwhelmed') {
      newLowStateCount = lowStateCount + 1;
      setLowStateCount(newLowStateCount);
    } else {
      newLowStateCount = 0;
      setLowStateCount(0);
    }
    
    const hour = new Date().getHours();
    const timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night' = 
      hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : hour < 22 ? 'evening' : 'night';
    
    const recentJournalText = logs
      .slice(0, 3)
      .map(log => log.note || log.deepReflection || '')
      .filter(Boolean)
      .join(' ')
      .substring(0, 500);
    
    try {
      // Get historical feeling logs for pattern analysis
      const historicalLogs = await dbService.getFeelingLogs(30); // Last 30 feeling selections
      const frequentStates = historicalLogs
        .map(log => log.emotionalState)
        .reduce((acc, state) => {
          acc[state] = (acc[state] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
      const frequentStatesList = Object.entries(frequentStates)
        .sort((a, b) => (b[1] as number) - (a[1] as number))
        .slice(0, 3)
        .map(([state]) => state);

      // Calculate progress (percentage of positive states in last 10 logs)
      const recentLogs = historicalLogs.slice(0, 10);
      const positiveStates = ['calm', 'hopeful', 'positive', 'energized'];
      const positiveCount = recentLogs.filter(log => positiveStates.includes(log.emotionalState)).length;
      const progress = recentLogs.length > 0 ? (positiveCount / recentLogs.length) * 100 : 0;

      const encouragement = await generateEmotionalEncouragement(
        state,
        selectedFeeling,
        newLowStateCount,
        lcswConfig,
        {
          recentJournalText: recentJournalText || undefined,
          timeOfDay,
          userPatterns: {
            frequentStates: frequentStatesList,
            progress: Math.round(progress)
          }
        }
      );
      setEncouragementText(encouragement);

      // Log the feeling selection with timestamp and AI response
      const feelingLog: FeelingLog = {
        id: Date.now().toString() + '-feeling',
        timestamp: new Date().toISOString(),
        emotionalState: state,
        selectedFeeling: selectedFeeling,
        aiResponse: encouragement,
        isAIResponse: true, // Will be updated if fallback is used
        lowStateCount: newLowStateCount
      };

      // Save to database for historical tracking
      try {
        await dbService.saveFeelingLog(feelingLog);
      } catch (dbError) {
        console.error('Failed to save feeling log:', dbError);
        // Continue even if logging fails
      }
    } catch (error) {
      console.error('Encouragement generation error:', error);
      const fallbackResponse = "You're doing important work. Keep going, one step at a time.";
      setEncouragementText(fallbackResponse);

      // Log the fallback response
      const feelingLog: FeelingLog = {
        id: Date.now().toString() + '-feeling',
        timestamp: new Date().toISOString(),
        emotionalState: state,
        selectedFeeling: selectedFeeling,
        aiResponse: fallbackResponse,
        isAIResponse: false, // Rule-based fallback
        lowStateCount: newLowStateCount
      };

      try {
        await dbService.saveFeelingLog(feelingLog);
      } catch (dbError) {
        console.error('Failed to save feeling log:', dbError);
      }
    } finally {
      setEncouragementLoading(false);
    }
  }, [logs, selectedFeeling, lowStateCount, lcswConfig]);

  const handleCommit = useCallback(async (valueId: string) => {
    if (!reflectionText.trim() && !goalText.trim()) return;

    const combinedText = `${reflectionText} ${goalText}`.trim();
    const crisisCheck = detectCrisis(combinedText, lcswConfig);
    
    if (crisisCheck.isCrisis && crisisCheck.severity === 'critical') {
      const crisisMessage = `🚨 CRISIS DETECTED\n\nYour entry contains crisis indicators. Please:\n\n1. Contact emergency services: 911\n2. Contact your therapist: ${lcswConfig?.emergencyContact?.phone || 'Your therapist\'s emergency line'}\n3. Crisis hotline: 988\n\nThis app cannot provide crisis support. Please connect with a professional immediately.`;
      alert(crisisMessage);
    }

    const timestamp = new Date().toISOString();
    const goalCreated = goalText.trim().length > 0;

    if (goalCreated) {
      const newGoal: Goal = {
        id: Date.now().toString() + "-goal",
        valueId,
        text: goalText,
        frequency: goalFreq,
        completed: false,
        createdAt: timestamp,
        updates: []
      };
      onUpdateGoals([newGoal, ...goals]);
      // Track goal creation
      await saveInteraction('goal_created', { goalText: goalText.substring(0, 50) });
    }

    // Track reflection committed
    await saveInteraction('reflection_committed', { 
      reflectionLength: reflectionText.trim().length,
      goalCreated 
    });

    onLog({
      id: Date.now().toString() + "-log",
      date: timestamp,
      valueId,
      livedIt: true,
      note: reflectionText.trim() || "Observed without judgment.",
      mood: guideMood,
      type: goalText.trim() ? 'goal-update' : 'standard',
      goalText: goalText.trim() || undefined,
      deepReflection: reflectionText.trim() || undefined,
      reflectionAnalysis: reflectionAnalysis || undefined,
      emotionalState: emotionalState,
      selectedFeeling: selectedFeeling || undefined
    });
    
    // End session
    await endSession(valueId, goalCreated);
    
    _setEmotionalState('mixed');
    _setSelectedFeeling(null);

    removeItem(`draft_reflection_${valueId}`).catch(console.error);
    removeItem(`draft_goal_${valueId}`).catch(console.error);

    setLastLoggedId(valueId);
    setTimeout(() => setLastLoggedId(null), 2000);
    
    setReflectionText('');
    setGoalText('');
    setCoachInsight(null);
    setValueMantra(null);
    setActiveValueId(null);
  }, [reflectionText, goalText, goalFreq, emotionalState, selectedFeeling, guideMood, reflectionAnalysis, lcswConfig, goals, onLog, onUpdateGoals, saveInteraction, endSession]);

  return {
    // State
    activeValueId,
    loading,
    lastLoggedId,
    emotionalState,
    selectedFeeling,
    showFeelingsList,
    reflectionText,
    goalText,
    goalFreq,
    aiGoalLoading,
    coachInsight,
    valueMantra,
    reflectionAnalysis,
    analyzingReflection,
    encouragementText,
    encouragementLoading,
    lastEncouragedState,
    lowStateCount,
    topValueMantra,
    valueCardRefs,
    
    // Setters
    setActiveValueId,
    setEmotionalState,
    setSelectedFeeling,
    setShowFeelingsList,
    setReflectionText,
    setGoalText,
    setGoalFreq,
    
    // Handlers
    handleSuggestGoal,
    handleCompleteGoal,
    handleDeleteGoal,
    handleEmotionalEncourage,
    handleCommit,
    getReflectionPlaceholder,
    triggerReflectionAnalysis,
    
    // Reset encouragement
    resetEncouragement: useCallback(() => {
      setEncouragementText(null);
      setLastEncouragedState(null);
    }, []),
  };
}

