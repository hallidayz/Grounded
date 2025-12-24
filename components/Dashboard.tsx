
import React, { useState, useEffect, useMemo } from 'react';
import { ValueItem, LogEntry, Goal, GoalFrequency, GoalUpdate, LCSWConfig } from '../types';
import { generateEncouragement, generateEmotionalEncouragement, generateValueMantra, suggestGoal, detectCrisis, analyzeReflection } from '../services/aiService';
import { shareViaEmail, generateGoalsEmail } from '../services/emailService';
import { EmotionalState, EMOTIONAL_STATES, getEmotionalState } from '../services/emotionalStates';
import EmotionSelector from './EmotionSelector';
import AIResponseBubble from './AIResponseBubble';
import MoodTrendChart from './MoodTrendChart';

// Debounce hook to prevent rapid API calls
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface DashboardProps {
  values: ValueItem[];
  onLog: (entry: LogEntry) => void;
  goals: Goal[];
  onUpdateGoals: (goals: Goal[]) => void;
  logs: LogEntry[];
  lcswConfig?: LCSWConfig;
}

const Dashboard: React.FC<DashboardProps> = ({ values, onLog, goals, onUpdateGoals, logs, lcswConfig }) => {
  const [activeValueId, setActiveValueId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastLoggedId, setLastLoggedId] = useState<string | null>(null);
  
  const [guideMood, setGuideMood] = useState<GoalUpdate['mood']>('✨'); // Keep for backward compatibility
  const [emotionalState, setEmotionalState] = useState<EmotionalState>('mixed');
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const [showFeelingsList, setShowFeelingsList] = useState(false);
  const debouncedGuideMood = useDebounce(guideMood, 500); // Debounce mood changes for 500ms
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
  const [lowStateCount, setLowStateCount] = useState(0); // Track consecutive low state selections
  
  const debouncedReflectionText = useDebounce(reflectionText, 2000); // Analyze after 2 seconds of no typing

  // Get personalized greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getTimeEmoji = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌅';
    if (hour < 18) return '☀️';
    return '🌙';
  };

  const moodDetails = {
    '🌱': { label: 'Growth', desc: 'Coping/Adapting' },
    '🔥': { label: 'Momentum', desc: 'Action/Agency' },
    '✨': { label: 'Magic', desc: 'Alignment/Flow' },
    '🧗': { label: 'Challenge', desc: 'Resilience/Grit' }
  };

  const emotionalStates = {
    drained: {
      label: 'Very Low / Drained',
      color: '#94a3b8', // Soft desaturated blue-gray
      bgColor: 'bg-bg-tertiary',
      feelings: ['tired', 'empty', 'numb', 'burned out', 'exhausted', 'drained', 'flat', 'lifeless'],
      description: 'Low energy, low arousal'
    },
    heavy: {
      label: 'Low / Heavy',
      color: '#475569', // Deeper muted blue-navy
      bgColor: 'bg-dark-bg-tertiary',
      feelings: ['sad', 'disappointed', 'lonely', 'discouraged', 'down', 'gloomy', 'melancholy', 'weighed down'],
      description: 'Deeper emotions, reflection'
    },
    mixed: {
      label: 'Medium / Mixed',
      color: '#14b8a6', // Neutral teal
      bgColor: 'bg-teal-500',
      feelings: ['uncertain', 'okay', 'conflicted', 'reflective', 'neutral', 'ambivalent', 'contemplative', 'processing'],
      description: 'In-between, balanced'
    },
    positive: {
      label: 'High / Positive',
      color: '#fbbf24', // Soft yellow-gold (muted)
      bgColor: 'bg-yellow-400',
      feelings: ['hopeful', 'curious', 'calm', 'engaged', 'content', 'peaceful', 'optimistic', 'grateful'],
      description: 'Hopeful, optimistic'
    },
    energized: {
      label: 'Very High / Energized',
      color: '#f59e0b', // Warm yellow-orange / golden yellow
      bgColor: 'bg-yellow-warm',
      feelings: ['joyful', 'excited', 'inspired', 'proud', 'elated', 'enthusiastic', 'motivated', 'vibrant'],
      description: 'High energy, enthusiasm'
    }
  };

  const getReflectionPlaceholder = (freq: GoalFrequency) => {
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
  };

  useEffect(() => {
    if (activeValueId) {
      const savedRef = localStorage.getItem(`draft_reflection_${activeValueId}`);
      const savedGoal = localStorage.getItem(`draft_goal_${activeValueId}`);
      setReflectionText(savedRef || '');
      setGoalText(savedGoal || '');
    }
  }, [activeValueId]);

  useEffect(() => {
    if (activeValueId) {
      localStorage.setItem(`draft_reflection_${activeValueId}`, reflectionText);
      localStorage.setItem(`draft_goal_${activeValueId}`, goalText);
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
      // Don't clear valueMantra when closing - keep it for Today's Focus
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

  const handleSuggestGoal = async (value: ValueItem) => {
    setAiGoalLoading(true);
    try {
      // Check for crisis before suggesting goal
      const crisisCheck = detectCrisis(reflectionText, lcswConfig);
      if (crisisCheck.isCrisis && crisisCheck.recommendedAction !== 'continue') {
        setGoalText(`### Safety First\n\n⚠️ Your reflection contains concerning content. Please contact your therapist or emergency services if needed.\n\nEmergency: ${lcswConfig?.emergencyContact?.phone || '911'}\nCrisis Line: 988`);
        setAiGoalLoading(false);
        return;
      }
      // Use deep reflection and analysis together for goal suggestion
      // This helps the user see they have options and different approaches
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
  };

  const handleCompleteGoal = async (goal: Goal) => {
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

    // Send email notification for goal completion
    if (lcswConfig?.emergencyContact?.phone || lcswConfig?.emergencyContact) {
      const emailData = generateGoalsEmail([], values, [completedGoal]);
      const therapistEmails = lcswConfig?.emergencyContact ? [] : []; // Can be extended
      await shareViaEmail(emailData, therapistEmails);
    }
  };

  const handleDeleteGoal = (goalId: string) => {
    onUpdateGoals(goals.filter(g => g.id !== goalId));
  };

  const handleEmotionalEncourage = async (state: EmotionalState) => {
    setEncouragementLoading(true);
    setLastEncouragedState(state);
    setEncouragementText(null);
    
    // Track low state selections - calculate new count first to use immediately
    // Low states: drained, heavy, overwhelmed
    let newLowStateCount: number;
    if (state === 'drained' || state === 'heavy' || state === 'overwhelmed') {
      newLowStateCount = lowStateCount + 1;
      setLowStateCount(newLowStateCount);
    } else {
      newLowStateCount = 0; // Reset if not low state
      setLowStateCount(0);
    }
    
    // Calculate time of day for context
    const hour = new Date().getHours();
    const timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night' = 
      hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : hour < 22 ? 'evening' : 'night';
    
    // Extract recent journal entries (last 2-3 logs)
    const recentJournalText = logs
      .slice(0, 3)
      .map(log => log.note || log.deepReflection || '')
      .filter(Boolean)
      .join(' ')
      .substring(0, 500);
    
    // Track user patterns (frequent states)
    const stateCounts: Record<string, number> = {};
    logs.forEach(log => {
      // Extract emotional state from logs if available
      // For now, we'll use a simple pattern
    });
    
    try {
      const encouragement = await generateEmotionalEncouragement(
        state,
        selectedFeeling,
        newLowStateCount, // Use the calculated value, not the stale state
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
  };

  const handleCommit = (valueId: string) => {
    if (!reflectionText.trim() && !goalText.trim()) return;

    // Check for crisis before committing
    const combinedText = `${reflectionText} ${goalText}`.trim();
    const crisisCheck = detectCrisis(combinedText, lcswConfig);
    
    if (crisisCheck.isCrisis && crisisCheck.severity === 'critical') {
      const crisisMessage = `🚨 CRISIS DETECTED\n\nYour entry contains crisis indicators. Please:\n\n1. Contact emergency services: 911\n2. Contact your therapist: ${lcswConfig?.emergencyContact?.phone || 'Your therapist\'s emergency line'}\n3. Crisis hotline: 988\n\nThis app cannot provide crisis support. Please connect with a professional immediately.`;
      alert(crisisMessage);
      // Still allow them to save, but show the warning
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
      mood: guideMood, // Keep for backward compatibility
      type: goalText.trim() ? 'goal-update' : 'standard',
      goalText: goalText.trim() || undefined,
      deepReflection: reflectionText.trim() || undefined,
      reflectionAnalysis: reflectionAnalysis || undefined,
      emotionalState: emotionalState, // Save 8-state emotional state
      selectedFeeling: selectedFeeling || undefined // Save selected feeling
    });
    
    // Reset emotional state after logging
    setEmotionalState('mixed');
    setSelectedFeeling(null);

    localStorage.removeItem(`draft_reflection_${valueId}`);
    localStorage.removeItem(`draft_goal_${valueId}`);

    setLastLoggedId(valueId);
    setTimeout(() => setLastLoggedId(null), 2000);
    
    setReflectionText('');
    setGoalText('');
    setCoachInsight(null);
    setValueMantra(null);
    setActiveValueId(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-20 lg:pb-12">
      {/* Personalized Greeting */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-text-primary dark:text-white">
          {getGreeting()} {getTimeEmoji()}
        </h1>
        <p className="text-text-secondary dark:text-white/70">
          How are you feeling today?
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-text-primary dark:text-white tracking-tight">Compass Engine</h2>
          <p className="text-[9px] font-black text-text-primary/50 dark:text-white/50 uppercase tracking-widest">Observe & Document</p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-[9px] font-black text-yellow-warm uppercase tracking-widest">Active Focus</p>
          <p className="text-sm sm:text-base font-black text-text-primary dark:text-white leading-tight">{values.length} Core Values</p>
        </div>
      </div>

      {/* Emotion Selector Section - Always at the top */}
      <div className="bg-white dark:bg-dark-bg-secondary rounded-xl sm:rounded-2xl border border-border-soft dark:border-dark-border shadow-sm p-4 sm:p-5">
        {!encouragementText && (
          <EmotionSelector
            onSelect={handleEmotionalEncourage}
            selected={lastEncouragedState as EmotionalState | undefined}
            disabled={encouragementLoading}
          />
        )}

        {/* Display AI encouragement message */}
        {encouragementText && (
          <div className="space-y-4">
            <AIResponseBubble
              message={encouragementText}
              emotion={lastEncouragedState || undefined}
              onActionClick={(action) => {
                if (action === 'reflection') {
                  // Open first value for reflection
                  if (values.length > 0) {
                    setActiveValueId(values[0].id);
                  }
                } else if (action === 'values') {
                  // Could navigate to values view, but for now just show values
                  // This would be handled by parent component
                }
              }}
            />
            
            {/* Safety net message for repeated low states */}
            {lowStateCount >= 3 && (lastEncouragedState === 'drained' || lastEncouragedState === 'heavy' || lastEncouragedState === 'overwhelmed') && (
              <div className="mt-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-900 dark:text-blue-200 font-medium">
                  💙 <strong>Consider reaching out:</strong> You've been feeling low several times. Your therapist ({lcswConfig?.emergencyContact?.phone || 'contact them'}), a trusted friend, or the 988 Crisis & Suicide Lifeline can provide support. You don't have to go through this alone.
                </p>
              </div>
            )}

            <button
              onClick={() => {
                setEncouragementText(null);
                setLastEncouragedState(null);
              }}
              className="w-full py-2 text-sm text-text-secondary dark:text-white/70 hover:text-text-primary dark:hover:text-white transition-colors"
            >
              Choose a different feeling
            </button>
          </div>
        )}

        {encouragementLoading && (
          <div className="text-center py-4">
            <div className="text-yellow-warm font-bold uppercase tracking-widest animate-pulse text-sm">
              Generating encouragement...
            </div>
          </div>
        )}
      </div>

      {/* Mood Trends Section */}
      {logs.length > 0 && (() => {
        // Calculate mood trends from logs (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentLogs = logs.filter(log => new Date(log.date) >= sevenDaysAgo);
        
        // Count emotional states from logs
        const stateCounts: Record<string, number> = {};
        recentLogs.forEach(log => {
          if (log.emotionalState) {
            stateCounts[log.emotionalState] = (stateCounts[log.emotionalState] || 0) + 1;
          }
        });
        
        const total = recentLogs.length || 1;
        
        // Create mood data from actual log counts
        const moodData = EMOTIONAL_STATES.map(state => {
          const count = stateCounts[state.state] || 0;
          return {
            state: state.state,
            emoji: state.emoji,
            label: state.shortLabel,
            percentage: Math.round((count / total) * 100),
            color: state.color
          };
        }).filter(mood => mood.percentage > 0).sort((a, b) => b.percentage - a.percentage).slice(0, 4); // Show top 4
        
        if (moodData.length > 0) {
          return (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-text-primary dark:text-white">
                📊 Your Week at a Glance
              </h3>
              <MoodTrendChart data={moodData} />
            </div>
          );
        }
        return null;
      })()}

      {/* Today's Focus Section */}
      {values.length > 0 && (() => {
        const topValue = values[0];
        const displayMantra = valueMantra || topValueMantra || "Be Here Now";
        return (
          <div className="bg-gradient-to-br from-yellow-warm/20 to-yellow-light/20 dark:from-yellow-warm/10 dark:to-yellow-light/10 rounded-2xl p-6 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🎯</span>
              <h3 className="text-lg font-semibold text-text-primary dark:text-white">
                Today's Focus
              </h3>
            </div>
            <p className="text-text-primary dark:text-white font-medium">
              {topValue.name}
            </p>
            <p className="text-text-secondary dark:text-white/70 italic">
              "{displayMantra}"
            </p>
          </div>
        );
      })()}

      {/* Recent Reflections Timeline */}
      {logs.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-text-primary dark:text-white">
            ✨ Recent Reflections
          </h3>
          
          <div className="space-y-2">
            {logs.slice(0, 3).map((log) => {
              const logDate = new Date(log.date);
              const dateStr = logDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              const value = values.find(v => v.id === log.valueId);
              // Get emoji from emotional state if available
              const stateConfig = log.emotionalState ? getEmotionalState(log.emotionalState) : null;
              const emoji = stateConfig ? stateConfig.emoji : '📝';
              
              return (
                <div key={log.id} className="bg-white dark:bg-dark-bg-secondary rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-text-secondary dark:text-white/70">
                      {dateStr}
                    </span>
                    <span className="text-xl">{emoji}</span>
                  </div>
                  <p className="text-text-primary dark:text-white line-clamp-2 text-sm">
                    {log.note || log.deepReflection || 'Reflection entry'}
                  </p>
                  {value && (
                    <p className="text-xs text-text-tertiary dark:text-white/50 mt-1">
                      {value.name}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {values.map((value, index) => {
          const isActive = activeValueId === value.id;
          const isSuccess = lastLoggedId === value.id;
          const valueGoals = goals.filter(g => g.valueId === value.id && !g.completed);

          return (
            <div 
              key={value.id}
              className={`bg-white dark:bg-dark-bg-primary rounded-xl sm:rounded-2xl border transition-all duration-300 ${isActive ? 'border-yellow-warm shadow-lg dark:shadow-xl' : 'border-border-soft dark:border-dark-border/30 shadow-sm hover:border-yellow-warm/50 dark:hover:border-yellow-warm/50'} ${isSuccess ? 'border-calm-sage dark:border-calm-sage ring-2 ring-calm-sage/20 dark:ring-calm-sage/30' : ''}`}
            >
              <div className="p-3 sm:p-4 md:p-5">
                <div className="flex items-center justify-between gap-2 sm:gap-3">
                  <div className="flex items-center gap-2 sm:gap-3 flex-grow min-w-0">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-black shadow-sm flex-shrink-0 ${index === 0 ? 'bg-yellow-warm text-text-primary' : 'bg-bg-secondary dark:bg-dark-bg-primary/50 text-text-primary/40 dark:text-white/40'}`}>
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm sm:text-base font-black text-text-primary dark:text-white tracking-tight truncate">{value.name}</h3>
                      <p className="text-[7px] font-bold text-text-primary/50 dark:text-white/50 uppercase tracking-widest">{value.category}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      if (isActive) {
                        // Reset emotional state when closing
                        setEmotionalState('mixed');
                        setSelectedFeeling(null);
                        setShowFeelingsList(false);
                      }
                      setActiveValueId(isActive ? null : value.id);
                    }}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-black text-[8px] sm:text-[9px] uppercase tracking-widest transition-all shadow-sm active:scale-95 flex-shrink-0 ${isActive ? 'bg-navy-primary dark:bg-navy-primary text-white' : 'bg-yellow-warm text-text-primary hover:opacity-90'}`}
                  >
                    <span className="hidden sm:inline">{isActive ? 'Close' : 'Check-in'}</span>
                    <span className="sm:hidden">{isActive ? '✕' : '✓'}</span>
                  </button>
                </div>

                {!isActive && valueGoals.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border-soft dark:border-dark-border/30 flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {valueGoals.map(goal => (
                      <div key={goal.id} className="flex-shrink-0 flex items-center gap-2 bg-bg-secondary dark:bg-dark-bg-primary/50 px-2 sm:px-3 py-1.5 rounded-lg sm:rounded-xl border border-border-soft dark:border-dark-border/30">
                        <p className="text-[9px] sm:text-[10px] font-bold text-text-primary dark:text-white max-w-[100px] sm:max-w-[120px] truncate">{goal.text}</p>
                        <button 
                          onClick={() => handleCompleteGoal(goal)}
                          className="w-5 h-5 bg-calm-sage dark:bg-calm-sage text-white rounded-md flex items-center justify-center shadow-sm active:scale-90 flex-shrink-0"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {isActive && (
                  <div className="mt-4 sm:mt-6 space-y-4 sm:space-y-6 animate-pop border-t border-border-soft dark:border-dark-border/30 pt-4 sm:pt-5">
                    {/* Emotional State Bar - 8 States */}
                    <div className="space-y-3">
                      <label className="text-[8px] font-black text-text-primary/50 dark:text-white/50 uppercase tracking-widest block px-1">
                        How are you feeling right now?
                      </label>
                      <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-1.5 sm:gap-2">
                        {EMOTIONAL_STATES.map((stateConfig) => {
                          const isSelected = emotionalState === stateConfig.state;
                          return (
                            <button
                              key={stateConfig.state}
                              onClick={() => {
                                setEmotionalState(stateConfig.state);
                                setShowFeelingsList(true);
                              }}
                              className={`flex flex-col items-center p-2 sm:p-3 rounded-lg sm:rounded-xl border-2 transition-all active:scale-95 ${
                                isSelected
                                  ? 'border-navy-primary dark:border-white shadow-md scale-105 bg-white dark:bg-dark-bg-primary'
                                  : 'border-border-soft dark:border-dark-border/30 hover:border-border-soft dark:hover:border-dark-border/50 bg-white dark:bg-dark-bg-primary'
                              }`}
                            >
                              <div 
                                className="w-full h-8 sm:h-10 rounded-md mb-1.5 sm:mb-2 transition-all"
                                style={{
                                  backgroundColor: stateConfig.color,
                                  boxShadow: isSelected ? `0 0 0 2px ${stateConfig.color}, 0 2px 4px rgba(0,0,0,0.1)` : 'none'
                                }}
                              />
                              <span className={`text-[7px] sm:text-[8px] font-black uppercase tracking-tight text-center leading-tight ${
                                isSelected
                                  ? 'text-text-primary dark:text-white'
                                  : 'text-text-primary/60 dark:text-white/60'
                              }`}>
                                {stateConfig.shortLabel}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      
                      {/* Feelings List Modal */}
                      {showFeelingsList && (() => {
                        const currentStateConfig = getEmotionalState(emotionalState);
                        if (!currentStateConfig) return null;
                        
                        return (
                          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/60 backdrop-blur-sm" onClick={() => setShowFeelingsList(false)}>
                            <div className="bg-white dark:bg-dark-bg-primary rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                              <div className="p-4 sm:p-6">
                                <div className="flex items-center justify-between mb-4">
                                  <div>
                                    <h3 className="text-lg sm:text-xl font-black text-text-primary dark:text-white">
                                      {currentStateConfig.label}
                                    </h3>
                                    <p className="text-xs text-text-primary/60 dark:text-white/60 mt-1">
                                      {currentStateConfig.reflectionPrompt}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => setShowFeelingsList(false)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-bg-secondary dark:bg-dark-bg-primary/50 text-text-tertiary hover:text-text-primary dark:hover:text-white"
                                  >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                                
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                                  {currentStateConfig.feelings.map((feeling) => (
                                    <button
                                      key={feeling}
                                      onClick={() => {
                                        setSelectedFeeling(feeling);
                                        setShowFeelingsList(false);
                                      }}
                                      className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all active:scale-95 ${
                                        selectedFeeling === feeling
                                          ? 'border-navy-primary dark:border-white font-bold text-white dark:text-text-primary'
                                          : 'border-border-soft dark:border-dark-border/30 bg-bg-secondary dark:bg-dark-bg-primary/50 text-text-primary dark:text-white hover:border-yellow-warm/50'
                                      }`}
                                      style={selectedFeeling === feeling ? {
                                        backgroundColor: currentStateConfig.color
                                      } : {}}
                                    >
                                      <span className="text-xs sm:text-sm capitalize">{feeling}</span>
                                    </button>
                                  ))}
                                </div>
                                
                                {selectedFeeling && (
                                  <div className="mt-4 p-3 bg-yellow-warm/10 dark:bg-yellow-warm/20 rounded-xl border border-yellow-warm/30">
                                    <p className="text-xs text-text-primary dark:text-white">
                                      <span className="font-bold">Selected:</span> {selectedFeeling}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                      
                      {selectedFeeling && (() => {
                        const currentStateConfig = getEmotionalState(emotionalState);
                        if (!currentStateConfig) return null;
                        return (
                          <div className="mt-2 p-2 sm:p-3 bg-yellow-warm/10 dark:bg-yellow-warm/20 rounded-lg border border-yellow-warm/30">
                            <p className="text-[9px] sm:text-[10px] text-text-primary dark:text-white">
                              <span className="font-bold">Feeling:</span> {selectedFeeling} ({currentStateConfig.shortLabel})
                            </p>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="bg-navy-primary dark:bg-navy-primary rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-md border border-navy-primary/20 dark:border-dark-border/50 relative overflow-hidden group">
                        <p className="text-[7px] font-black text-yellow-warm/80 uppercase tracking-widest mb-1.5">Focus Lens</p>
                        {loading ? (
                          <div className="animate-pulse space-y-1.5">
                            <div className="h-2.5 bg-yellow-warm/30 rounded w-3/4"></div>
                            <div className="h-2.5 bg-yellow-warm/30 rounded w-1/2"></div>
                          </div>
                        ) : (
                          <p className="text-white dark:text-white font-medium italic text-[11px] sm:text-xs leading-relaxed relative z-10">"{coachInsight}"</p>
                        )}
                        <div className="absolute bottom-2 right-3 sm:right-4 text-[7px] sm:text-[8px] font-black text-yellow-warm/60 uppercase opacity-60">{valueMantra}</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                          <label className="text-[8px] font-black text-text-primary/50 dark:text-white/50 uppercase tracking-widest">1. Deep Reflection</label>
                          <span className="text-[8px] font-bold text-yellow-warm uppercase tracking-widest">Systemic Focus</span>
                        </div>
                        <textarea 
                          value={reflectionText}
                          onChange={(e) => setReflectionText(e.target.value)}
                          placeholder={getReflectionPlaceholder(goalFreq)}
                          className="w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-bg-secondary dark:bg-dark-bg-primary/50 border-none focus:ring-2 focus:ring-yellow-warm/30 outline-none text-text-primary dark:text-white min-h-[140px] sm:min-h-[160px] resize-none text-[10px] sm:text-[11px] leading-relaxed shadow-inner"
                        />
                        {analyzingReflection && (
                          <div className="text-[8px] text-yellow-warm font-bold uppercase tracking-widest animate-pulse">
                            Analyzing reflection...
                          </div>
                        )}
                        {reflectionAnalysis && !analyzingReflection && (
                          <div className="mt-3 p-3 sm:p-4 bg-yellow-warm/10 dark:bg-yellow-warm/20 rounded-xl border border-yellow-warm/30 space-y-3">
                            <div className="text-[8px] font-black text-yellow-warm uppercase tracking-widest">Reflection Analysis</div>
                            <div className="text-[9px] sm:text-[10px] text-text-primary dark:text-white whitespace-pre-line leading-relaxed space-y-2">
                              {reflectionAnalysis.split('\n').map((line, idx) => {
                                if (line.startsWith('##')) {
                                  return <div key={idx} className="font-black text-yellow-warm mt-3 first:mt-0">{line.replace('##', '').trim()}</div>;
                                } else if (line.startsWith('-') || /^\d+\./.test(line.trim())) {
                                  return <div key={idx} className="ml-2">{line}</div>;
                                } else if (line.trim()) {
                                  return <div key={idx}>{line}</div>;
                                }
                                return <br key={idx} />;
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                          <label className="text-[8px] font-black text-text-primary/50 dark:text-white/50 uppercase tracking-widest">2. Self-Advocacy Aim</label>
                          <button onClick={() => handleSuggestGoal(value)} disabled={aiGoalLoading} className="text-[8px] font-black text-yellow-warm uppercase tracking-widest hover:underline disabled:opacity-50">
                            {aiGoalLoading ? 'Suggesting...' : '✨ Suggest'}
                          </button>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex gap-1">
                            {(['daily', 'weekly', 'monthly'] as GoalFrequency[]).map(f => (
                              <button key={f} onClick={() => setGoalFreq(f)} className={`flex-1 py-1 rounded-lg text-[7px] font-black uppercase tracking-widest transition-all ${goalFreq === f ? 'bg-yellow-warm text-text-primary shadow-sm' : 'bg-bg-secondary dark:bg-dark-bg-primary/50 text-text-primary/40 dark:text-white/40'}`}>{f}</button>
                            ))}
                          </div>
                          <textarea 
                            value={goalText}
                            onChange={(e) => setGoalText(e.target.value)}
                            placeholder="Define one tool or boundary to implement next."
                            className="w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-bg-secondary dark:bg-dark-bg-primary/50 border-none focus:ring-2 focus:ring-yellow-warm/30 outline-none text-text-primary dark:text-white min-h-[100px] sm:min-h-[120px] resize-none text-[10px] sm:text-[11px] leading-relaxed shadow-inner"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCommit(value.id)}
                      disabled={!reflectionText.trim() && !goalText.trim()}
                      className="w-full py-3 sm:py-4 bg-yellow-warm text-text-primary rounded-xl sm:rounded-2xl font-black uppercase tracking-[0.2em] shadow-lg hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-20 text-[9px] sm:text-[10px]"
                    >
                      Archive & Commit
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {goals.filter(g => !g.completed).length > 0 && (
        <div className="space-y-3 pt-4 sm:pt-6 border-t border-border-soft dark:border-dark-border/30">
          <div className="flex justify-between items-center">
            <h2 className="text-sm sm:text-base font-black text-text-primary dark:text-white tracking-tight">Active Commitments</h2>
            <p className="text-[8px] font-black text-text-primary/50 dark:text-white/50 uppercase tracking-widest">The "Work"</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {goals.filter(g => !g.completed).map(goal => {
              const val = values.find(v => v.id === goal.valueId);
              return (
                <div key={goal.id} className="bg-white dark:bg-dark-bg-primary p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-border-soft dark:border-dark-border/30 shadow-sm relative">
                  <span className="absolute top-2 sm:top-3 right-3 sm:right-4 px-1.5 py-0.5 bg-yellow-warm/20 dark:bg-yellow-warm/30 text-yellow-warm rounded-md text-[6px] font-black uppercase tracking-widest">{goal.frequency}</span>
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-warm" />
                    <span className="text-[8px] font-black text-text-primary/50 dark:text-white/50 uppercase tracking-widest">{val?.name}</span>
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-bold text-text-primary dark:text-white mb-3 sm:mb-4 leading-snug pr-12">{goal.text}</div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleCompleteGoal(goal)}
                      className="flex-1 py-2 bg-calm-sage dark:bg-calm-sage text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm hover:opacity-90"
                    >
                      Done
                    </button>
                    <button 
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="w-8 h-8 bg-bg-secondary dark:bg-dark-bg-primary/50 text-text-primary/30 dark:text-white/30 rounded-lg hover:text-red-500 dark:hover:text-red-400 flex items-center justify-center transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;