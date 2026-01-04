import React, { useState, useEffect } from 'react';
import { EmotionalState, EMOTIONAL_STATES, getEmotionalState } from '../services/emotionalStates';
import { GoalFrequency, ValueItem, LCSWConfig } from '../types';
import SkeletonLoader from './SkeletonLoader';
import StatusIndicator, { StatusType } from './StatusIndicator';
import MarkdownRenderer from './MarkdownRenderer';

import EmotionPicker from './EmotionPicker';

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
  getReflectionPlaceholder: (freq: GoalFrequency, subFeeling?: string | null) => string;
  onTriggerReflectionAnalysis: () => void;
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
  onTriggerReflectionAnalysis,
}) => {
  // State for AI insights visibility
  const [showAiInsights, setShowAiInsights] = useState(false);
  
  // Processing state for save button
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingTime, setProcessingTime] = useState(0);

  // Auto-expand insights when new analysis arrives
  useEffect(() => {
    if (reflectionAnalysis && !analyzingReflection) {
      setShowAiInsights(true);
    }
  }, [reflectionAnalysis, analyzingReflection]);

  // Handle save with processing feedback
  const handleCommit = () => {
    if (loading || isProcessing) return;
    
    setIsProcessing(true);
    setProcessingTime(0);
    
    // Start timer
    const timer = setInterval(() => {
      setProcessingTime(prev => prev + 1);
    }, 1000);
    
    // Call original onCommit
    // Wrap in try/catch if onCommit was async, but it's passed as void function
    // We assume parent component handles the async/loading state update
    // If parent updates 'loading' prop to true, our local state is redundant but harmless
    // If parent completes immediately, our local state needs reset via effect or timeout
    
    onCommit();
    
    // Safety cleanup if parent doesn't unmount or update loading
    // ideally relying on 'loading' prop from parent is better, but user asked for local feedback
  };

  // Reset processing state when loading prop changes
  useEffect(() => {
    if (!loading && isProcessing) {
      setIsProcessing(false);
    } else if (loading && !isProcessing) {
      setIsProcessing(true);
    }
  }, [loading]);

  // Timer effect for processing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isProcessing) {
      interval = setInterval(() => {
        setProcessingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isProcessing]);

  return (
    <div className="mt-4 sm:mt-6 space-y-4 sm:space-y-6 animate-pop border-t border-border-soft dark:border-dark-border/30 pt-4 sm:pt-5">
      {/* Emotional State Bar - 8 States */}
      <div className="space-y-3">
        <label className="text-xs sm:text-sm font-black text-text-primary/50 dark:text-white/50 uppercase tracking-widest block px-1">
          How are you feeling right now?
        </label>
        
        <EmotionPicker 
          selected={emotionalState === 'neutral' ? null : emotionalState}
          onSelect={(state) => {
            onEmotionalStateChange(state);
            onShowFeelingsListToggle();
          }}
        />
        
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
                            /* PREV: hover:border-yellow-warm/50 */
                            : 'border-border-soft dark:border-dark-border/30 bg-bg-secondary dark:bg-dark-bg-primary/50 text-text-primary dark:text-white hover:border-brand/50 dark:hover:border-brand-light/50'
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
                    /* PREV: bg-yellow-warm/10 ... border-yellow-warm/30 */
                    <div className="mt-4 p-3 bg-brand/5 dark:bg-brand/10 rounded-xl border border-brand/20 dark:border-brand/30">
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
            /* PREV: bg-yellow-warm/10 ... border-yellow-warm/30 */
            <div className="mt-2 p-2 sm:p-3 bg-brand/5 dark:bg-brand/10 rounded-lg border border-brand/20 dark:border-brand/30">
              <p className="text-xs sm:text-sm text-text-primary dark:text-white">
                <span className="font-bold">Feeling:</span> {selectedFeeling} ({currentStateConfig.shortLabel})
              </p>
            </div>
          );
        })()}
      </div>

      <div className="bg-navy-primary dark:bg-navy-primary rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-md border border-navy-primary/20 dark:border-dark-border/50 relative overflow-hidden group">
        {/* PREV: text-yellow-warm/80 */}
        <p className="text-xs sm:text-sm font-black text-brand/80 dark:text-brand-light/80 uppercase tracking-widest mb-1.5">Focus Lens</p>
        {loading ? (
          <div className="space-y-1.5">
            {/* PREV: bg-yellow-warm/30 */}
            <SkeletonLoader width="75%" height="0.625rem" className="bg-brand/10 dark:bg-brand/20" />
            <SkeletonLoader width="50%" height="0.625rem" className="bg-brand/10 dark:bg-brand/20" />
          </div>
        ) : (
          <p className="text-white dark:text-white font-medium italic text-xs sm:text-sm leading-relaxed relative z-10">{coachInsight}</p>
        )}
        {/* PREV: text-yellow-warm/60 */}
        <div className="absolute bottom-2 right-3 sm:right-4 text-xs sm:text-sm font-black text-brand/60 dark:text-brand-light/60 uppercase opacity-60">{valueMantra}</div>
      </div>

      {/* Selected Feeling Heading */}
      {selectedFeeling && (() => {
        const stateConfig = getEmotionalState(emotionalState);
        if (!stateConfig) return null;
        return (
          /* PREV: bg-yellow-warm/10 ... border-yellow-warm/30 ... text-yellow-warm */
          <div className="bg-brand/5 dark:bg-brand/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 border-2 border-brand/20 dark:border-brand/30">
            <h3 className="text-base sm:text-lg font-black text-text-primary dark:text-white flex items-center gap-2">
              <span className="text-xl sm:text-2xl">{stateConfig.emoji}</span>
              <span className="capitalize">{selectedFeeling}</span>
              <span className="text-brand dark:text-brand-light">—</span>
              <span className="text-text-primary/70 dark:text-white/70">{stateConfig.shortLabel}</span>
            </h3>
          </div>
        );
      })()}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <label className="text-xs sm:text-sm font-black text-text-primary/50 dark:text-white/50 uppercase tracking-widest">1. Deep Reflection</label>
            {/* PREV: text-yellow-warm */}
            <span className="text-xs sm:text-sm font-bold text-brand dark:text-brand-light uppercase tracking-widest">Systemic Focus</span>
          </div>
          <textarea 
            value={reflectionText}
            onChange={(e) => onReflectionTextChange(e.target.value)}
            placeholder={getReflectionPlaceholder(goalFreq, selectedFeeling)}
            /* PREV: focus:ring-yellow-warm/30 */
            className="w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-bg-secondary dark:bg-dark-bg-primary/50 border-none focus:ring-2 focus:ring-brand/30 dark:focus:ring-brand-light/30 outline-none text-text-primary dark:text-white min-h-[140px] sm:min-h-[160px] resize-none text-sm sm:text-base leading-relaxed shadow-inner"
          />
          <button
            onClick={async () => {
              // Save the reflection first, then analyze
              if (reflectionText.trim()) {
                // Trigger analysis - it will save as part of the analysis flow
                // The analysis function saves the reflection to the database
                onTriggerReflectionAnalysis();
              }
            }}
            disabled={analyzingReflection || !reflectionText.trim()}
            /* PREV: bg-yellow-warm text-text-primary */
            className="w-full py-2 sm:py-2.5 bg-brand dark:bg-brand-light text-white dark:text-navy-dark rounded-lg sm:rounded-xl font-black uppercase tracking-widest text-xs sm:text-sm shadow-sm hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {analyzingReflection ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : '💾 Save'}
          </button>
          {analyzingReflection && (
            /* PREV: text-yellow-warm */
            <div className="text-xs sm:text-sm text-brand dark:text-brand-light font-bold uppercase tracking-widest animate-pulse">
              Analyzing reflection...
            </div>
          )}
          {/* AI Insights Section - Collapsible */}
          {reflectionAnalysis && (
            <div className="bg-white/50 dark:bg-dark-bg-secondary/30 rounded-xl p-4 border border-brand/10 dark:border-brand-light/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">🧠</span>
                  <h3 className="font-bold text-navy-primary dark:text-brand-light text-sm uppercase tracking-wide">
                    AI Insights
                  </h3>
                </div>
                <div className="flex items-center space-x-3">
                  <StatusIndicator
                    status={
                      analyzingReflection
                        ? 'processing'
                        : reflectionAnalysis
                        ? 'complete'
                        : 'not-done'
                    }
                    size="sm"
                  />
                  <button
                    onClick={() => setShowAiInsights(!showAiInsights)}
                    className="text-xs font-bold text-brand dark:text-brand-light hover:underline uppercase tracking-wide"
                  >
                    {showAiInsights ? 'Hide Insights' : 'Show Insights'}
                  </button>
                </div>
              </div>

              {showAiInsights && (
                <div className="animate-fade-in text-sm sm:text-base text-text-primary dark:text-white leading-relaxed mt-3 pt-3 border-t border-brand/5 dark:border-brand-light/5">
                  <div className="flex justify-end mb-2">
                    <button
                      onClick={onTriggerReflectionAnalysis}
                      disabled={analyzingReflection || !reflectionText.trim() || !emotionalState || emotionalState === 'mixed' || !selectedFeeling}
                      className="text-xs sm:text-sm font-black text-brand dark:text-brand-light uppercase tracking-widest hover:underline disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
                      title="Refresh analysis"
                    >
                      {analyzingReflection ? (
                        <>
                          <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        '🔄 Refresh'
                      )}
                    </button>
                  </div>
                  {(() => {
                    let analysisText: string;
                    if (typeof reflectionAnalysis === 'string') {
                      analysisText = reflectionAnalysis;
                    } else if (reflectionAnalysis && typeof reflectionAnalysis === 'object') {
                      const analysis = reflectionAnalysis as any;
                      analysisText = `## Core Themes\n${(analysis.coreThemes || []).map((t: string) => `- ${t}`).join('\n')}\n\n## The 'LCSW Lens'\n${analysis.lcswLens || ''}\n\n## Reflective Inquiry\n${(analysis.reflectiveInquiry || []).map((q: string) => `- ${q}`).join('\n')}\n\n## Session Prep\n${analysis.sessionPrep || ''}`;
                    } else {
                      analysisText = '';
                    }
                    
                    return (
                      <div className="whitespace-pre-wrap leading-relaxed">
                        <MarkdownRenderer>{analysisText}</MarkdownRenderer>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <label className="text-xs sm:text-sm font-black text-text-primary/50 dark:text-white/50 uppercase tracking-widest">2. Self-Advocacy Aim</label>
            <div className="flex items-center gap-2">
              {/* PREV: text-yellow-warm */}
              <button onClick={onSuggestGoal} disabled={aiGoalLoading} className="text-xs sm:text-sm font-black text-brand dark:text-brand-light uppercase tracking-widest hover:underline disabled:opacity-50 flex items-center gap-1.5">
                {aiGoalLoading ? (
                  <>
                    <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Suggesting...
                  </>
                ) : (
                  '✨ Suggest'
                )}
              </button>
              <StatusIndicator
                status={
                  aiGoalLoading
                    ? 'processing'
                    : goalText
                    ? 'complete'
                    : 'not-done'
                }
                size="sm"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex gap-1">
              {(['daily', 'weekly', 'monthly'] as GoalFrequency[]).map(f => (
                /* PREV: bg-yellow-warm */
                <button key={f} onClick={() => onGoalFreqChange(f)} className={`flex-1 py-1 rounded-lg text-xs sm:text-sm font-black uppercase tracking-widest transition-all ${goalFreq === f ? 'bg-brand dark:bg-brand-light text-white dark:text-navy-dark shadow-sm' : 'bg-bg-secondary dark:bg-dark-bg-primary/50 text-text-primary/40 dark:text-white/40'}`}>{f}</button>
              ))}
            </div>
            <textarea 
              value={goalText}
              onChange={(e) => onGoalTextChange(e.target.value)}
              placeholder="Define one tool or boundary to implement next."
              /* PREV: focus:ring-yellow-warm/30 */
              className="w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-bg-secondary dark:bg-dark-bg-primary/50 border-none focus:ring-2 focus:ring-brand/30 dark:focus:ring-brand-light/30 outline-none text-text-primary dark:text-white min-h-[160px] sm:min-h-[180px] resize-y text-sm sm:text-base leading-relaxed shadow-inner"
              style={{ minHeight: '160px' }}
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleCommit}
        disabled={!reflectionText.trim() && !goalText.trim() || loading || isProcessing}
        /* PREV: bg-yellow-warm text-text-primary */
        className={`w-full py-3 sm:py-4 bg-brand dark:bg-brand-light text-white dark:text-navy-dark rounded-xl sm:rounded-2xl font-black uppercase tracking-[0.2em] shadow-lg hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-20 text-xs sm:text-sm ${isProcessing ? 'cursor-not-allowed' : ''}`}
      >
        {isProcessing ? `Processing (${processingTime}s)...` : 'Archive & Commit'}
      </button>
    </div>
  );
};

export default ReflectionForm;

