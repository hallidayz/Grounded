import React, { useCallback } from 'react';
import { EMOTIONAL_STATES, EmotionalState } from '../services/emotionalStates';
import { hapticFeedback } from '../utils/haptics';
import EmotionPicker from './EmotionPicker';

interface EmotionSelectorProps {
  onSelect: (emotionId: EmotionalState) => void;
  selected?: EmotionalState;
  disabled?: boolean;
}

const EmotionSelector: React.FC<EmotionSelectorProps> = ({ onSelect, selected, disabled = false }) => {
  const handleSelect = useCallback((emotionId: EmotionalState) => {
    if (disabled) return;
    hapticFeedback('light');
    onSelect(emotionId);
  }, [disabled, onSelect]);

  return (
    <div className="space-y-4 relative">
      <h2 className="text-xl font-semibold text-text-primary dark:text-white">
        How are you feeling?
      </h2>
      
      <EmotionPicker 
        selected={selected || null}
        onSelect={handleSelect}
        disabled={disabled}
      />
      
      {/* Loading Overlay */}
      {disabled && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="bg-white/80 dark:bg-dark-bg-primary/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-border-soft dark:border-dark-border flex flex-col items-center gap-2">
            <svg className="animate-spin h-8 w-8 text-navy-primary dark:text-yellow-warm" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-xs font-black text-navy-primary dark:text-yellow-warm uppercase tracking-widest">Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(EmotionSelector);
