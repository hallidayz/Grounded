import React, { useCallback } from 'react';
import { Goal, ValueItem } from '../types';
import MarkdownRenderer from './MarkdownRenderer';

interface GoalsSectionProps {
  goals: Goal[];
  values: ValueItem[];
  onCompleteGoal: (goal: Goal) => void;
  onDeleteGoal: (goalId: string) => void;
}

const GoalsSection: React.FC<GoalsSectionProps> = ({
  goals,
  values,
  onCompleteGoal,
  onDeleteGoal,
}) => {
  const activeGoals = goals.filter(g => !g.completed);

  if (activeGoals.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 pt-4 sm:pt-6 border-t border-border-soft dark:border-dark-border/30">
      <div className="flex justify-between items-center">
        <h2 className="text-sm sm:text-base font-black text-text-primary dark:text-white tracking-tight">Active Commitments</h2>
        <p className="text-xs sm:text-sm font-black text-text-primary/50 dark:text-white/50 uppercase tracking-widest">The "Work"</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {activeGoals.map(goal => {
          const val = values.find(v => v.id === goal.valueId);
          return (
            <div key={goal.id} className="bg-white dark:bg-dark-bg-primary p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-border-soft dark:border-dark-border/30 shadow-sm relative">
              {/* PREV: bg-yellow-warm/20 ... text-yellow-warm */}
              <span className="absolute top-2 sm:top-3 right-3 sm:right-4 px-1.5 py-0.5 bg-brand/10 dark:bg-brand/20 text-brand dark:text-brand-light rounded-md text-xs font-black uppercase tracking-widest">{goal.frequency}</span>
              <div className="flex items-center gap-1.5 mb-2">
                {/* PREV: bg-yellow-warm */}
                <div className="w-1.5 h-1.5 rounded-full bg-brand dark:bg-brand-light" />
                <span className="text-xs sm:text-sm font-black text-text-primary/50 dark:text-white/50 uppercase tracking-widest">{val?.name}</span>
              </div>
              <div className="text-sm sm:text-base font-bold text-text-primary dark:text-white mb-3 sm:mb-4 leading-snug pr-12"><MarkdownRenderer>{goal.text}</MarkdownRenderer></div>
              <div className="flex gap-2">
                <button 
                  onClick={() => onCompleteGoal(goal)}
                  className="flex-1 py-2 bg-calm-sage dark:bg-calm-sage text-white rounded-lg text-xs sm:text-sm font-black uppercase tracking-widest shadow-sm hover:opacity-90"
                >
                  Done
                </button>
                <button 
                  onClick={() => onDeleteGoal(goal.id)}
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
  );
};

export default React.memo(GoalsSection);

