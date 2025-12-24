import { useState, useEffect, useRef, useCallback } from 'react';
import { ValueItem, LogEntry, Goal, GoalFrequency, LCSWConfig } from '../types';
import { EmotionalState } from '../services/emotionalStates';
import { generateEncouragement, generateEmotionalEncouragement, generateValueMantra, suggestGoal, detectCrisis, analyzeReflection } from '../services/aiService';
import { shareViaEmail, generateGoalsEmail } from '../services/emailService';
import { useDebounce } from './useDebounce';
import { getItem, setItem, removeItem } from '../services/storage';

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
  const [emotionalState, setEmotionalState] = useState<EmotionalState>('mixed');
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
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
    }
  }, [reflectionText, goalText, activeValueId]);

  // Analyze reflection when user stops typing
  useEffect(() => {
    if (debouncedReflectionText.trim() && activeValueId) {
      setAnalyzingReflection(true);
      analyzeReflection(debouncedReflectionText, goalFreq, lcswConfig)
        .then(analysis => {
          setReflectionAnalysis(analysis);
          setAnalyzingReflection(false);
        })
        .catch(error => {
          console.error('Reflection analysis error:', error);
          setReflectionAnalysis(null);
          setAnalyzingReflection(false);
        });
    } else {
      setReflectionAnalysis(null);
    }
  }, [debouncedReflectionText, goalFreq, activeValueId, lcswConfig]);

  // AI Motivation Refresh
  useEffect(() => {
    if (activeValueId) {
      const activeValue = values.find(v => v.id === activeValueId);
      if (activeValue) {
        setLoading(true);
        Promise.all([
          generateEncouragement(activeValue, debouncedGuideMood, lcswConfig),
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
  }, [debouncedGuideMood, activeValueId, values, lcswConfig]);

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

  const getReflectionPlaceholder = useCallback((freq: GoalFrequency) => {
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
    try {
      const crisisCheck = detectCrisis(reflectionText, lcswConfig);
      if (crisisCheck.isCrisis && crisisCheck.recommendedAction !== 'continue') {
        setGoalText(`### Safety First\n\n⚠️ Your reflection contains concerning content. Please contact your therapist or emergency services if needed.\n\nEmergency: ${lcswConfig?.emergencyContact?.phone || '911'}\nCrisis Line: 988`);
        setAiGoalLoading(false);
        return;
      }
      const deepReflectionContext = reflectionText.trim() 
        ? `Deep Reflection:\n${reflectionText}\n\n${reflectionAnalysis ? `Reflection Analysis:\n${reflectionAnalysis}` : ''}`
        : (reflectionAnalysis || '');
      const suggestion = await suggestGoal(value, goalFreq, deepReflectionContext, lcswConfig);
      setGoalText(suggestion);
    } catch (error) {
      console.error("AI Goal Error:", error);
      setGoalText("Error suggesting a goal. Try writing a small, simple one yourself!");
    } finally {
      setAiGoalLoading(false);
    }
  }, [reflectionText, reflectionAnalysis, goalFreq, lcswConfig]);

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

    if (lcswConfig?.emergencyContact?.phone || lcswConfig?.emergencyContact) {
      const emailData = generateGoalsEmail([], values, [completedGoal]);
      const therapistEmails = lcswConfig?.emergencyContact ? [] : [];
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
      const encouragement = await generateEmotionalEncouragement(
        state,
        selectedFeeling,
        newLowStateCount,
        lcswConfig,
        {
          recentJournalText: recentJournalText || undefined,
          timeOfDay,
          userPatterns: {
            frequentStates: [],
            progress: 0
          }
        }
      );
      setEncouragementText(encouragement);
    } catch (error) {
      console.error('Encouragement generation error:', error);
      setEncouragementText("You're doing important work. Keep going, one step at a time.");
    } finally {
      setEncouragementLoading(false);
    }
  }, [logs, selectedFeeling, lowStateCount, lcswConfig]);

  const handleCommit = useCallback((valueId: string) => {
    if (!reflectionText.trim() && !goalText.trim()) return;

    const combinedText = `${reflectionText} ${goalText}`.trim();
    const crisisCheck = detectCrisis(combinedText, lcswConfig);
    
    if (crisisCheck.isCrisis && crisisCheck.severity === 'critical') {
      const crisisMessage = `🚨 CRISIS DETECTED\n\nYour entry contains crisis indicators. Please:\n\n1. Contact emergency services: 911\n2. Contact your therapist: ${lcswConfig?.emergencyContact?.phone || 'Your therapist\'s emergency line'}\n3. Crisis hotline: 988\n\nThis app cannot provide crisis support. Please connect with a professional immediately.`;
      alert(crisisMessage);
    }

    const timestamp = new Date().toISOString();

    if (goalText.trim()) {
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
    }

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
    
    setEmotionalState('mixed');
    setSelectedFeeling(null);

    removeItem(`draft_reflection_${valueId}`).catch(console.error);
    removeItem(`draft_goal_${valueId}`).catch(console.error);

    setLastLoggedId(valueId);
    setTimeout(() => setLastLoggedId(null), 2000);
    
    setReflectionText('');
    setGoalText('');
    setCoachInsight(null);
    setValueMantra(null);
    setActiveValueId(null);
  }, [reflectionText, goalText, goalFreq, emotionalState, selectedFeeling, guideMood, reflectionAnalysis, lcswConfig, goals, onLog, onUpdateGoals]);

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
    
    // Reset encouragement
    resetEncouragement: useCallback(() => {
      setEncouragementText(null);
      setLastEncouragedState(null);
    }, []),
  };
}

