import React from 'react';
import { EmotionalState, EMOTIONAL_STATES, getEmotionalState } from '../services/emotionalStates';
import { GoalFrequency, ValueItem, LCSWConfig } from '../types';

interface ReflectionFormProps {
  value: ValueItem;
  emotionalState: EmotionalState;
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
  lcswConfig?: LCSWConfig;
  onEmotionalStateChange: (state: EmotionalState) => void;
  onShowFeelingsListToggle: () => void;
  onSelectedFeelingChange: (feeling: string) => void;
  onReflectionTextChange: (text: string) => void;
  onGoalTextChange: (text: string) => void;
  onGoalFreqChange: (freq: GoalFrequency) => void;
  onSuggestGoal: () => void;
  onCommit: () => void;
  getReflectionPlaceholder: (freq: GoalFrequency) => string;
}

const ReflectionForm: React.FC<ReflectionFormProps> = ({
  value,
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
  lcswConfig,
  onEmotionalStateChange,
  onShowFeelingsListToggle,
  onSelectedFeelingChange,
  onReflectionTextChange,
  onGoalTextChange,
  onGoalFreqChange,
  onSuggestGoal,
  onCommit,
  getReflectionPlaceholder,
}) => {
  return (
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
                  onEmotionalStateChange(stateConfig.state);
                  onShowFeelingsListToggle();
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
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/60 backdrop-blur-sm" onClick={onShowFeelingsListToggle}>
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
                      onClick={onShowFeelingsListToggle}
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
                          onSelectedFeelingChange(feeling);
                          onShowFeelingsListToggle();
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
          <div className="space-y-1.5">
            <SkeletonLoader width="75%" height="0.625rem" className="bg-yellow-warm/30" />
            <SkeletonLoader width="50%" height="0.625rem" className="bg-yellow-warm/30" />
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
            onChange={(e) => onReflectionTextChange(e.target.value)}
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
            <button onClick={onSuggestGoal} disabled={aiGoalLoading} className="text-[8px] font-black text-yellow-warm uppercase tracking-widest hover:underline disabled:opacity-50">
              {aiGoalLoading ? 'Suggesting...' : '✨ Suggest'}
            </button>
          </div>
          <div className="space-y-1.5">
            <div className="flex gap-1">
              {(['daily', 'weekly', 'monthly'] as GoalFrequency[]).map(f => (
                <button key={f} onClick={() => onGoalFreqChange(f)} className={`flex-1 py-1 rounded-lg text-[7px] font-black uppercase tracking-widest transition-all ${goalFreq === f ? 'bg-yellow-warm text-text-primary shadow-sm' : 'bg-bg-secondary dark:bg-dark-bg-primary/50 text-text-primary/40 dark:text-white/40'}`}>{f}</button>
              ))}
            </div>
            <textarea 
              value={goalText}
              onChange={(e) => onGoalTextChange(e.target.value)}
              placeholder="Define one tool or boundary to implement next."
              className="w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-bg-secondary dark:bg-dark-bg-primary/50 border-none focus:ring-2 focus:ring-yellow-warm/30 outline-none text-text-primary dark:text-white min-h-[100px] sm:min-h-[120px] resize-none text-[10px] sm:text-[11px] leading-relaxed shadow-inner"
            />
          </div>
        </div>
      </div>

      <button
        onClick={onCommit}
        disabled={!reflectionText.trim() && !goalText.trim()}
        className="w-full py-3 sm:py-4 bg-yellow-warm text-text-primary rounded-xl sm:rounded-2xl font-black uppercase tracking-[0.2em] shadow-lg hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-20 text-[9px] sm:text-[10px]"
      >
        Archive & Commit
      </button>
    </div>
  );
};

export default ReflectionForm;

