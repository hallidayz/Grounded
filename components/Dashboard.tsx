
import React, { useState, useEffect, useMemo } from 'react';
import { ValueItem, LogEntry, Goal, GoalFrequency, GoalUpdate, LCSWConfig } from '../types';
import { generateEncouragement, generateValueMantra, suggestGoal, detectCrisis } from '../services/aiService';
import { shareViaEmail, generateGoalsEmail } from '../services/emailService';

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
  
  const [guideMood, setGuideMood] = useState<GoalUpdate['mood']>('✨');
  const debouncedGuideMood = useDebounce(guideMood, 500); // Debounce mood changes for 500ms
  const [reflectionText, setReflectionText] = useState('');
  const [goalText, setGoalText] = useState('');
  const [goalFreq, setGoalFreq] = useState<GoalFrequency>('daily');
  const [aiGoalLoading, setAiGoalLoading] = useState(false);
  
  const [coachInsight, setCoachInsight] = useState<string | null>(null);
  const [valueMantra, setValueMantra] = useState<string | null>(null);

  const moodDetails = {
    '🌱': { label: 'Growth', desc: 'Coping/Adapting' },
    '🔥': { label: 'Momentum', desc: 'Action/Agency' },
    '✨': { label: 'Magic', desc: 'Alignment/Flow' },
    '🧗': { label: 'Challenge', desc: 'Resilience/Grit' }
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
      setValueMantra(null);
    }
  }, [debouncedGuideMood, activeValueId, values, lcswConfig]);

  const handleSuggestGoal = async (value: ValueItem) => {
    setAiGoalLoading(true);
    try {
      // Check for crisis before suggesting goal
      const crisisCheck = detectCrisis(reflectionText, lcswConfig);
      if (crisisCheck.isCrisis && crisisCheck.recommendedAction !== 'continue') {
        setGoalText(`### Safety First\n\n⚠️ Your reflection contains concerning content. Please contact your LCSW or emergency services if needed.\n\nEmergency: ${lcswConfig?.emergencyContact?.phone || '911'}\nCrisis Line: 988`);
        setAiGoalLoading(false);
        return;
      }
      const suggestion = await suggestGoal(value, goalFreq, reflectionText, lcswConfig);
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

  const handleCommit = (valueId: string) => {
    if (!reflectionText.trim() && !goalText.trim()) return;

    // Check for crisis before committing
    const combinedText = `${reflectionText} ${goalText}`.trim();
    const crisisCheck = detectCrisis(combinedText, lcswConfig);
    
    if (crisisCheck.isCrisis && crisisCheck.severity === 'critical') {
      const crisisMessage = `🚨 CRISIS DETECTED\n\nYour entry contains crisis indicators. Please:\n\n1. Contact emergency services: 911\n2. Contact your LCSW: ${lcswConfig?.emergencyContact?.phone || 'Your LCSW\'s emergency line'}\n3. Crisis hotline: 988\n\nThis app cannot provide crisis support. Please connect with a professional immediately.`;
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
      mood: guideMood,
      type: goalText.trim() ? 'goal-update' : 'standard',
      goalText: goalText.trim() || undefined
    });

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
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-12 sm:pb-16">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-authority-navy dark:text-pure-foundation tracking-tight">Compass Engine</h2>
          <p className="text-[9px] font-black text-authority-navy/50 dark:text-pure-foundation/50 uppercase tracking-widest">Observe & Document</p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-[9px] font-black text-brand-accent uppercase tracking-widest">Active Focus</p>
          <p className="text-sm sm:text-base font-black text-authority-navy dark:text-pure-foundation leading-tight">{values.length} Core Values</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {values.map((value, index) => {
          const isActive = activeValueId === value.id;
          const isSuccess = lastLoggedId === value.id;
          const valueGoals = goals.filter(g => g.valueId === value.id && !g.completed);

          return (
            <div 
              key={value.id}
              className={`bg-white dark:bg-executive-depth rounded-xl sm:rounded-2xl border transition-all duration-300 ${isActive ? 'border-brand-accent shadow-lg dark:shadow-xl' : 'border-slate-100 dark:border-creative-depth/30 shadow-sm hover:border-brand-accent/50 dark:hover:border-brand-accent/50'} ${isSuccess ? 'border-success-forest dark:border-success-forest ring-2 ring-success-forest/20 dark:ring-success-forest/30' : ''}`}
            >
              <div className="p-3 sm:p-4 md:p-5">
                <div className="flex items-center justify-between gap-2 sm:gap-3">
                  <div className="flex items-center gap-2 sm:gap-3 flex-grow min-w-0">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-black shadow-sm flex-shrink-0 ${index === 0 ? 'bg-brand-accent text-authority-navy' : 'bg-pure-foundation dark:bg-executive-depth/50 text-authority-navy/40 dark:text-pure-foundation/40'}`}>
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm sm:text-base font-black text-authority-navy dark:text-pure-foundation tracking-tight truncate">{value.name}</h3>
                      <p className="text-[7px] font-bold text-authority-navy/50 dark:text-pure-foundation/50 uppercase tracking-widest">{value.category}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => setActiveValueId(isActive ? null : value.id)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-black text-[8px] sm:text-[9px] uppercase tracking-widest transition-all shadow-sm active:scale-95 flex-shrink-0 ${isActive ? 'bg-authority-navy dark:bg-creative-depth text-white' : 'bg-brand-accent text-authority-navy hover:opacity-90'}`}
                  >
                    <span className="hidden sm:inline">{isActive ? 'Close' : 'Check-in'}</span>
                    <span className="sm:hidden">{isActive ? '✕' : '✓'}</span>
                  </button>
                </div>

                {!isActive && valueGoals.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-creative-depth/30 flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {valueGoals.map(goal => (
                      <div key={goal.id} className="flex-shrink-0 flex items-center gap-2 bg-pure-foundation dark:bg-executive-depth/50 px-2 sm:px-3 py-1.5 rounded-lg sm:rounded-xl border border-slate-100 dark:border-creative-depth/30">
                        <p className="text-[9px] sm:text-[10px] font-bold text-authority-navy dark:text-pure-foundation max-w-[100px] sm:max-w-[120px] truncate">{goal.text}</p>
                        <button 
                          onClick={() => handleCompleteGoal(goal)}
                          className="w-5 h-5 bg-success-forest dark:bg-success-forest text-white rounded-md flex items-center justify-center shadow-sm active:scale-90 flex-shrink-0"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {isActive && (
                  <div className="mt-4 sm:mt-6 space-y-4 sm:space-y-6 animate-pop border-t border-slate-100 dark:border-creative-depth/30 pt-4 sm:pt-5">
                    <div className="flex justify-center mb-3 sm:mb-4">
                      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 w-full max-w-xs">
                        {(Object.entries(moodDetails) as [GoalUpdate['mood'], any][]).map(([m, info]) => (
                          <button 
                            key={m} 
                            onClick={() => setGuideMood(m)}
                            className={`flex flex-col items-center p-1.5 sm:p-2 rounded-lg border transition-all ${guideMood === m ? 'bg-brand-accent/20 dark:bg-brand-accent/30 border-brand-accent' : 'bg-pure-foundation dark:bg-executive-depth/50 border-transparent opacity-60'}`}
                          >
                            <span className="text-base sm:text-lg">{m}</span>
                            <span className={`text-[6px] font-black uppercase tracking-tight mt-0.5 ${guideMood === m ? 'text-brand-accent' : 'text-authority-navy/40 dark:text-pure-foundation/40'}`}>{info.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-authority-navy dark:bg-creative-depth rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-md border border-authority-navy/20 dark:border-creative-depth/50 relative overflow-hidden group">
                        <p className="text-[7px] font-black text-brand-accent/80 uppercase tracking-widest mb-1.5">Focus Lens</p>
                        {loading ? (
                          <div className="animate-pulse space-y-1.5">
                            <div className="h-2.5 bg-brand-accent/30 rounded w-3/4"></div>
                            <div className="h-2.5 bg-brand-accent/30 rounded w-1/2"></div>
                          </div>
                        ) : (
                          <p className="text-white dark:text-pure-foundation font-medium italic text-[11px] sm:text-xs leading-relaxed relative z-10">"{coachInsight}"</p>
                        )}
                        <div className="absolute bottom-2 right-3 sm:right-4 text-[7px] sm:text-[8px] font-black text-brand-accent/60 uppercase opacity-60">{valueMantra}</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                          <label className="text-[8px] font-black text-authority-navy/50 dark:text-pure-foundation/50 uppercase tracking-widest">1. Observation</label>
                          <span className="text-[8px] font-bold text-brand-accent uppercase tracking-widest">Systemic Focus</span>
                        </div>
                        <textarea 
                          value={reflectionText}
                          onChange={(e) => setReflectionText(e.target.value)}
                          placeholder={getReflectionPlaceholder(goalFreq)}
                          className="w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-pure-foundation dark:bg-executive-depth/50 border-none focus:ring-2 focus:ring-brand-accent/30 outline-none text-authority-navy dark:text-pure-foundation min-h-[140px] sm:min-h-[160px] resize-none text-[10px] sm:text-[11px] leading-relaxed shadow-inner"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                          <label className="text-[8px] font-black text-authority-navy/50 dark:text-pure-foundation/50 uppercase tracking-widest">2. Self-Advocacy Aim</label>
                          <button onClick={() => handleSuggestGoal(value)} disabled={aiGoalLoading} className="text-[8px] font-black text-brand-accent uppercase tracking-widest hover:underline disabled:opacity-50">
                            {aiGoalLoading ? 'Suggesting...' : '✨ Suggest'}
                          </button>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex gap-1">
                            {(['daily', 'weekly', 'monthly'] as GoalFrequency[]).map(f => (
                              <button key={f} onClick={() => setGoalFreq(f)} className={`flex-1 py-1 rounded-lg text-[7px] font-black uppercase tracking-widest transition-all ${goalFreq === f ? 'bg-brand-accent text-authority-navy shadow-sm' : 'bg-pure-foundation dark:bg-executive-depth/50 text-authority-navy/40 dark:text-pure-foundation/40'}`}>{f}</button>
                            ))}
                          </div>
                          <textarea 
                            value={goalText}
                            onChange={(e) => setGoalText(e.target.value)}
                            placeholder="Define one tool or boundary to implement next."
                            className="w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-pure-foundation dark:bg-executive-depth/50 border-none focus:ring-2 focus:ring-brand-accent/30 outline-none text-authority-navy dark:text-pure-foundation min-h-[100px] sm:min-h-[120px] resize-none text-[10px] sm:text-[11px] leading-relaxed shadow-inner"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCommit(value.id)}
                      disabled={!reflectionText.trim() && !goalText.trim()}
                      className="w-full py-3 sm:py-4 bg-brand-accent text-authority-navy rounded-xl sm:rounded-2xl font-black uppercase tracking-[0.2em] shadow-lg hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-20 text-[9px] sm:text-[10px]"
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
        <div className="space-y-3 pt-4 sm:pt-6 border-t border-slate-100 dark:border-creative-depth/30">
          <div className="flex justify-between items-center">
            <h2 className="text-sm sm:text-base font-black text-authority-navy dark:text-pure-foundation tracking-tight">Active Commitments</h2>
            <p className="text-[8px] font-black text-authority-navy/50 dark:text-pure-foundation/50 uppercase tracking-widest">The "Work"</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {goals.filter(g => !g.completed).map(goal => {
              const val = values.find(v => v.id === goal.valueId);
              return (
                <div key={goal.id} className="bg-white dark:bg-executive-depth p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-creative-depth/30 shadow-sm relative">
                  <span className="absolute top-2 sm:top-3 right-3 sm:right-4 px-1.5 py-0.5 bg-brand-accent/20 dark:bg-brand-accent/30 text-brand-accent rounded-md text-[6px] font-black uppercase tracking-widest">{goal.frequency}</span>
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-accent" />
                    <span className="text-[8px] font-black text-authority-navy/50 dark:text-pure-foundation/50 uppercase tracking-widest">{val?.name}</span>
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-bold text-authority-navy dark:text-pure-foundation mb-3 sm:mb-4 leading-snug pr-12">{goal.text}</div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleCompleteGoal(goal)}
                      className="flex-1 py-2 bg-success-forest dark:bg-success-forest text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm hover:opacity-90"
                    >
                      Done
                    </button>
                    <button 
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="w-8 h-8 bg-pure-foundation dark:bg-executive-depth/50 text-authority-navy/30 dark:text-pure-foundation/30 rounded-lg hover:text-red-500 dark:hover:text-red-400 flex items-center justify-center transition-colors"
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
