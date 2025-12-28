import React, { useState } from 'react';
import { Goal, ValueItem, GoalUpdate } from '../types';
import { shareViaEmail, generateGoalsEmail } from '../services/emailService';
import { LCSWConfig } from '../types';
import StatusIndicator from './StatusIndicator';

interface GoalsUpdateViewProps {
  goals: Goal[];
  values: ValueItem[];
  lcswConfig?: LCSWConfig;
  onUpdateGoal: (goalId: string, update: GoalUpdate) => void;
  onCompleteGoal: (goal: Goal) => void;
  onDeleteGoal: (goalId: string) => void;
}

const GoalsUpdateView: React.FC<GoalsUpdateViewProps> = ({
  goals,
  values,
  lcswConfig,
  onUpdateGoal,
  onCompleteGoal,
  onDeleteGoal,
}) => {
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [updateNote, setUpdateNote] = useState('');
  const [selectedMood, setSelectedMood] = useState<'🌱' | '🔥' | '✨' | '🧗' | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const activeGoals = goals.filter(g => !g.completed);
  const selectedGoal = selectedGoalId ? goals.find(g => g.id === selectedGoalId) : null;

  const handleUpdateGoal = async () => {
    if (!selectedGoal || !updateNote.trim()) return;

    setIsSubmitting(true);
    try {
      const update: GoalUpdate = {
        id: Date.now().toString() + '-update',
        timestamp: new Date().toISOString(),
        note: updateNote.trim(),
        mood: selectedMood,
      };

      onUpdateGoal(selectedGoal.id, update);
      
      // Note: Email generation is now lazy - user must click "Share Progress" button
      // This improves performance by not generating emails on every update

      // Show success feedback
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      // Reset form
      setUpdateNote('');
      setSelectedMood(undefined);
      setSelectedGoalId(null);
    } catch (error) {
      console.error('Error updating goal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteGoal = async (goal: Goal) => {
    onCompleteGoal(goal);
    setSelectedGoalId(null);
  };

  if (activeGoals.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8 pb-24 lg:pb-12">
        <div className="bg-white dark:bg-dark-bg-primary rounded-xl sm:rounded-2xl border border-border-soft dark:border-dark-border/30 shadow-sm p-6 sm:p-8 text-center">
          <div className="text-4xl mb-4">🎯</div>
          <h2 className="text-xl sm:text-2xl font-black text-text-primary dark:text-white mb-2">
            No Active Goals
          </h2>
          <p className="text-sm sm:text-base text-text-secondary dark:text-white/70">
            You don't have any active goals to update. Create goals from your reflections to track progress.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8 pb-24 lg:pb-12">
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-text-primary dark:text-white mb-2">
            Update Goals
          </h1>
          <p className="text-text-secondary dark:text-white/70">
            Track your progress on active commitments
          </p>
        </div>

        {/* Goal Selection */}
        <div className="space-y-3">
          <h2 className="text-sm sm:text-base font-black text-text-primary dark:text-white tracking-tight">
            Select a Goal to Update
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeGoals.map(goal => {
              const val = values.find(v => v.id === goal.valueId);
              const isSelected = selectedGoalId === goal.id;
              return (
                <button
                  key={goal.id}
                  onClick={() => setSelectedGoalId(goal.id)}
                  className={`
                    bg-white dark:bg-dark-bg-primary p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all text-left relative
                    ${isSelected 
                      ? 'border-yellow-warm shadow-lg dark:shadow-xl' 
                      : 'border-border-soft dark:border-dark-border/30 shadow-sm hover:border-yellow-warm/50 dark:hover:border-yellow-warm/50'
                    }
                  `}
                >
                  <span className="absolute top-2 sm:top-3 right-3 sm:right-4 px-1.5 py-0.5 bg-yellow-warm/20 dark:bg-yellow-warm/30 text-yellow-warm rounded-md text-xs font-black uppercase tracking-widest">
                    {goal.frequency}
                  </span>
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-warm" />
                    <span className="text-xs sm:text-sm font-black text-text-primary/50 dark:text-white/50 uppercase tracking-widest">
                      {val?.name}
                    </span>
                    <StatusIndicator
                      status={
                        isSubmitting && selectedGoalId === goal.id
                          ? 'processing'
                          : goal.updates.length > 0
                          ? 'complete'
                          : 'not-done'
                      }
                      size="sm"
                    />
                  </div>
                  <p className="text-sm sm:text-base font-bold text-text-primary dark:text-white mb-2 sm:mb-3 leading-snug pr-12">
                    {goal.text}
                  </p>
                  {goal.updates.length > 0 && (
                    <p className="text-xs text-text-secondary dark:text-white/60">
                      {goal.updates.length} update{goal.updates.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Update Form */}
        {selectedGoal && (
          <div className="bg-white dark:bg-dark-bg-primary rounded-xl sm:rounded-2xl border border-border-soft dark:border-dark-border/30 shadow-sm p-4 sm:p-6 space-y-4 sm:space-y-6 animate-pop">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-black text-text-primary dark:text-white tracking-tight">
                Update Progress
              </h3>
              <button
                onClick={() => {
                  setSelectedGoalId(null);
                  setUpdateNote('');
                  setSelectedMood(undefined);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-bg-secondary dark:bg-dark-bg-primary/50 text-text-tertiary hover:text-text-primary dark:hover:text-white transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-bg-secondary dark:bg-dark-bg-primary/50 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <p className="text-sm sm:text-base font-bold text-text-primary dark:text-white mb-1">
                {selectedGoal.text}
              </p>
              <p className="text-xs sm:text-sm text-text-secondary dark:text-white/60">
                {values.find(v => v.id === selectedGoal.valueId)?.name} • {selectedGoal.frequency}
              </p>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-xs sm:text-sm font-black text-text-primary/50 dark:text-white/50 uppercase tracking-widest mb-2 px-1">
                  How's it going?
                </label>
                <textarea
                  value={updateNote}
                  onChange={(e) => setUpdateNote(e.target.value)}
                  placeholder="Share your progress, challenges, or insights..."
                  className="w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-bg-secondary dark:bg-dark-bg-primary/50 border-none focus:ring-2 focus:ring-yellow-warm/30 outline-none text-text-primary dark:text-white min-h-[100px] sm:min-h-[120px] resize-none text-sm sm:text-base leading-relaxed shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-black text-text-primary/50 dark:text-white/50 uppercase tracking-widest mb-2 px-1">
                  Current Energy (Optional)
                </label>
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                  {(['🌱', '🔥', '✨', '🧗'] as const).map(mood => (
                    <button
                      key={mood}
                      onClick={() => setSelectedMood(selectedMood === mood ? undefined : mood)}
                      className={`
                        p-2 sm:p-3 rounded-lg sm:rounded-xl border-2 transition-all active:scale-95
                        ${selectedMood === mood
                          ? 'border-yellow-warm bg-yellow-warm/20 dark:bg-yellow-warm/20 shadow-sm scale-105'
                          : 'border-border-soft dark:border-dark-border/30 hover:border-yellow-warm/50 bg-white dark:bg-dark-bg-primary'
                        }
                      `}
                    >
                      <span className="text-xl sm:text-2xl">{mood}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleUpdateGoal}
                  disabled={!updateNote.trim() || isSubmitting}
                  className="flex-1 py-2 sm:py-2.5 bg-yellow-warm text-text-primary rounded-lg sm:rounded-xl font-black uppercase tracking-widest text-xs sm:text-sm shadow-sm hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : '💾 Save Update'}
                </button>
                {lcswConfig?.emergencyContact?.email && (
                  <button
                    onClick={async () => {
                      const updatedGoals = goals.map(g => 
                        g.id === selectedGoal.id 
                          ? { ...g, updates: [...g.updates] } 
                          : g
                      );
                      const emailData = generateGoalsEmail(
                        updatedGoals,
                        values,
                        [],
                        true
                      );
                      await shareViaEmail(emailData, [lcswConfig.emergencyContact!.email!]);
                    }}
                    className="px-3 py-2 sm:py-2.5 bg-calm-sage dark:bg-calm-sage text-white rounded-lg sm:rounded-xl font-black uppercase tracking-widest text-xs sm:text-sm shadow-sm hover:opacity-90 transition-all active:scale-[0.98]"
                    title="Share progress with therapist"
                  >
                    📧 Share
                  </button>
                )}
                <button
                  onClick={() => handleCompleteGoal(selectedGoal)}
                  className="flex-1 py-2 sm:py-2.5 bg-calm-sage dark:bg-calm-sage text-white rounded-lg sm:rounded-xl font-black uppercase tracking-widest text-xs sm:text-sm shadow-sm hover:opacity-90 transition-all active:scale-[0.98]"
                >
                  ✅ Done
                </button>
                <button
                  onClick={() => onDeleteGoal(selectedGoal.id)}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-bg-secondary dark:bg-dark-bg-primary/50 text-text-primary/30 dark:text-white/30 rounded-lg hover:text-red-500 dark:hover:text-red-400 flex items-center justify-center transition-colors"
                  aria-label="Delete goal"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Success Message */}
              {showSuccess && (
                <div className="mt-4 p-3 bg-calm-sage/20 dark:bg-calm-sage/20 border border-calm-sage/30 rounded-lg animate-pop">
                  <p className="text-xs sm:text-sm font-semibold text-calm-sage dark:text-calm-sage text-center">
                    ✅ Update saved! Email sent to therapist.
                  </p>
                </div>
              )}
            </div>

            {/* Previous Updates */}
            {selectedGoal.updates.length > 0 && (
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border-soft dark:border-dark-border/30">
                <h4 className="text-xs sm:text-sm font-black text-text-primary dark:text-white mb-3 uppercase tracking-widest">
                  Previous Updates
                </h4>
                <div className="space-y-2 sm:space-y-3">
                  {selectedGoal.updates.slice().reverse().map(update => (
                    <div
                      key={update.id}
                      className="bg-bg-secondary dark:bg-dark-bg-primary/50 rounded-lg sm:rounded-xl p-3 sm:p-4"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-text-secondary dark:text-white/60">
                          {new Date(update.timestamp).toLocaleDateString()}
                        </span>
                        {update.mood && (
                          <span className="text-lg sm:text-xl">{update.mood}</span>
                        )}
                      </div>
                      <p className="text-sm sm:text-base text-text-primary dark:text-white leading-relaxed">
                        {update.note}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalsUpdateView;

