import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { EMOTIONAL_STATES, EmotionalState } from '../services/emotionalStates';
import { hapticFeedback } from '../utils/animations';

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
      
      {/* 8 states in 4x2 grid on mobile, 4 cols tablet, 8 cols desktop */}
      <div className={`grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-3 transition-opacity duration-200 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
        {EMOTIONAL_STATES.map((emotion, index) => {
          const isSelected = selected === emotion.state;
          
          return (
            <motion.button
              key={emotion.state}
              onClick={() => handleSelect(emotion.state)}
              disabled={disabled}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`
                flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl
                transition-all duration-200
                min-h-[88px] min-w-[88px] sm:min-h-[100px] sm:min-w-[100px]
                ${isSelected 
                  ? 'ring-4 ring-navy-primary dark:ring-yellow-warm shadow-lg scale-105' 
                  : 'shadow-sm hover:shadow-md'
                }
                ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
                bg-white dark:bg-dark-bg-secondary
                border-2 ${isSelected 
                  ? 'border-navy-primary dark:border-yellow-warm' 
                  : 'border-border-soft dark:border-dark-border'
                }
              `}
            >
              <div 
                className="w-full h-10 sm:h-12 rounded-lg mb-2 transition-all"
                style={{
                  backgroundColor: emotion.color,
                  boxShadow: isSelected 
                    ? `0 0 0 2px ${emotion.color}, 0 2px 4px rgba(0,0,0,0.1)` 
                    : 'none'
                }}
              />
              <span className="text-2xl sm:text-3xl mb-1">{emotion.emoji}</span>
              <span className={`
                text-xs sm:text-sm font-semibold text-center leading-tight
                ${isSelected 
                  ? 'text-navy-primary dark:text-yellow-warm' 
                  : 'text-text-primary dark:text-white/70'
                }
              `}>
                {emotion.shortLabel}
              </span>
            </motion.button>
          );
        })}
      </div>
      
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

