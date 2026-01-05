import React from 'react';
import { EmotionalState, EMOTIONAL_STATES } from '../services/emotionalStates';
import { motion } from 'framer-motion';

interface EmotionPickerProps {
  selected: EmotionalState | null;
  onSelect: (state: EmotionalState) => void;
  disabled?: boolean;
}

const EmotionPicker: React.FC<EmotionPickerProps> = ({ selected, onSelect, disabled = false }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3">
        {EMOTIONAL_STATES.map((stateConfig, index) => {
          const isSelected = selected === stateConfig.state;
          
          return (
            <motion.button
              key={stateConfig.state}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!disabled) onSelect(stateConfig.state);
              }}
              disabled={disabled}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`
                flex flex-col items-center justify-center p-2 sm:p-3 rounded-xl sm:rounded-2xl
                transition-all duration-200
                min-h-[80px] min-w-[80px] sm:min-h-[100px] sm:min-w-[100px]
                ${isSelected 
                  ? 'bg-white dark:bg-dark-bg-secondary shadow-md ring-2 ring-navy-primary dark:ring-white scale-105 z-10' 
                  : 'bg-white/50 dark:bg-dark-bg-secondary/50 hover:bg-white dark:hover:bg-dark-bg-secondary shadow-sm hover:shadow-md'
                }
                ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                border ${isSelected 
                  ? 'border-transparent' 
                  : 'border-border-soft dark:border-dark-border/30'
                }
              `}
            >
              <div 
                className="w-full h-8 sm:h-10 rounded-lg mb-1.5 sm:mb-2 transition-all"
                style={{
                  backgroundColor: stateConfig.color,
                  boxShadow: isSelected 
                    ? `0 0 0 2px ${stateConfig.color}, 0 2px 4px rgba(0,0,0,0.1)` 
                    : 'none'
                }}
              />
              <span className="text-2xl sm:text-3xl mb-1">{stateConfig.emoji}</span>
              <span className={`
                text-[10px] sm:text-xs font-bold uppercase tracking-tight text-center leading-tight
                ${isSelected 
                  ? 'text-text-primary dark:text-white' 
                  : 'text-text-primary/60 dark:text-white/60'
                }
              `}>
                {stateConfig.shortLabel}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default EmotionPicker;

