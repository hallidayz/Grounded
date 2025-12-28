import React, { useCallback } from 'react';
import { ValueItem, Goal, GoalFrequency } from '../types';
import ReflectionForm from './ReflectionForm';

interface ValueCardProps {
  value: ValueItem;
  index: number;
  isActive: boolean;
  isSuccess: boolean;
  valueGoals: Goal[];
  emotionalState: string;
  selectedFeeling: string | null;
  showFeelingsList: boolean;
  reflectionText: string;
  goalText: string;
  goalFreq: GoalFrequency;
  reflectionAnalysis: string | null;
  analyzingReflection: boolean;
  coachInsight: string | null;
  valueMantra: string | null;
  loading: boolean;
  aiGoalLoading: boolean;
  cardRef: (el: HTMLDivElement | null) => void;
  onToggleActive: () => void;
  onEmotionalStateChange: (state: string) => void;
  onShowFeelingsListToggle: () => void;
  onSelectedFeelingChange: (feeling: string) => void;
  onReflectionTextChange: (text: string) => void;
  onGoalTextChange: (text: string) => void;
  onGoalFreqChange: (freq: GoalFrequency) => void;
  onSuggestGoal: () => void;
  onCompleteGoal: (goal: Goal) => void;
  onCommit: () => void;
  getReflectionPlaceholder: (freq: GoalFrequency, subFeeling?: string | null) => string;
  lcswConfig?: any;
}

const ValueCard: React.FC<ValueCardProps> = ({
  value,
  index,
  isActive,
  isSuccess,
  valueGoals,
  emotionalState,
  selectedFeeling,
  showFeelingsList,
  reflectionText,
  goalText,
  goalFreq,
  reflectionAnalysis,
  analyzingReflection,
  coachInsight,
  valueMantra,
  loading,
  aiGoalLoading,
  cardRef,
  onToggleActive,
  onEmotionalStateChange,
  onShowFeelingsListToggle,
  onSelectedFeelingChange,
  onReflectionTextChange,
  onGoalTextChange,
  onGoalFreqChange,
  onSuggestGoal,
  onCompleteGoal,
  onCommit,
  getReflectionPlaceholder,
  lcswConfig,
}) => {
  return (
    <div 
      ref={cardRef}
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
            onClick={onToggleActive}
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
                  onClick={() => onCompleteGoal(goal)}
                  className="w-5 h-5 bg-calm-sage dark:bg-calm-sage text-white rounded-md flex items-center justify-center shadow-sm active:scale-90 flex-shrink-0"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {isActive && (
          <ReflectionForm
            value={value}
            emotionalState={emotionalState as any}
            selectedFeeling={selectedFeeling}
            showFeelingsList={showFeelingsList}
            reflectionText={reflectionText}
            goalText={goalText}
            goalFreq={goalFreq}
            reflectionAnalysis={reflectionAnalysis}
            analyzingReflection={analyzingReflection}
            coachInsight={coachInsight}
            valueMantra={valueMantra}
            loading={loading}
            aiGoalLoading={aiGoalLoading}
            lcswConfig={lcswConfig}
            onEmotionalStateChange={onEmotionalStateChange as any}
            onShowFeelingsListToggle={onShowFeelingsListToggle}
            onSelectedFeelingChange={onSelectedFeelingChange}
            onReflectionTextChange={onReflectionTextChange}
            onGoalTextChange={onGoalTextChange}
            onGoalFreqChange={onGoalFreqChange}
            onSuggestGoal={onSuggestGoal}
            onCommit={onCommit}
            getReflectionPlaceholder={getReflectionPlaceholder}
          />
        )}
      </div>
    </div>
  );
};

export default React.memo(ValueCard);

