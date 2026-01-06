import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { EMOTIONAL_STATES } from '../services/emotionalStates';

interface EmotionSelectionProps {
  emotion?: string; // Current emotion state (e.g., 'drained', 'mixed')
  feeling?: string; // Current sub-emotion/feeling (e.g., 'tired', 'uncertain')
  onEmotionChange?: (emotion: string, feeling: string) => void; // Callback when emotion/feeling changes
  showSwipeHint?: boolean; // Show swipe/drag hint
  compact?: boolean; // Compact mode for smaller spaces
}

// Map feelings to emojis for better visual feedback
const FEELING_EMOJIS: Record<string, string> = {
  // Drained
  'tired': '😴', 'empty': '🫗', 'numb': '😐', 'burned out': '🔥', 'exhausted': '😮‍💨', 'drained': '💧', 'flat': '➖', 'lifeless': '💀',
  // Heavy
  'sad': '😢', 'disappointed': '😞', 'lonely': '😔', 'discouraged': '😓', 'down': '⬇️', 'gloomy': '☁️', 'melancholy': '🌧️', 'weighed down': '⚖️',
  // Overwhelmed
  'anxious': '😰', 'stressed': '😓', 'scattered': '💨', 'pressured': '⏰', 'swamped': '🌊', 'flooded': '💦', 'chaotic': '🌀', 'unable to focus': '🎯',
  // Mixed
  'uncertain': '🤔', 'okay': '😐', 'conflicted': '⚖️', 'reflective': '🤔', 'neutral': '➖', 'ambivalent': '↔️', 'contemplative': '🧘', 'processing': '⚙️',
  // Calm
  'peaceful': '🕊️', 'centered': '🎯', 'balanced': '⚖️', 'serene': '🌊', 'grounded': '🌱', 'stable': '🏔️', 'tranquil': '🌸', 'at ease': '😌',
  // Hopeful
  'optimistic': '☀️', 'encouraged': '💪', 'motivated': '🚀', 'inspired': '✨', 'forward-looking': '👀', 'promising': '🌟', 'bright': '💡', 'upward': '📈',
  // Positive
  'hopeful': '🌱', 'curious': '🤔', 'calm': '🌿', 'engaged': '🎯', 'content': '😊', 'peaceful': '🕊️', 'optimistic': '☀️', 'grateful': '🙏',
  // Energized
  'joyful': '😄', 'excited': '🎉', 'inspired': '✨', 'proud': '🦁', 'elated': '🎊', 'enthusiastic': '🔥', 'motivated': '🚀', 'vibrant': '🌈'
};

const EmotionSelection: React.FC<EmotionSelectionProps> = ({ 
  emotion, 
  feeling, 
  onEmotionChange,
  showSwipeHint = true,
  compact = false
}) => {
  // Refs for swipe/drag handling
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const mouseStartX = useRef<number>(0);
  const isDragging = useRef<boolean>(false);
  
  // Track selection level: 'primary' or 'sub' or 'none' (starting state)
  const [selectionLevel, setSelectionLevel] = useState<'primary' | 'sub' | 'none'>('none');
  
  // Track current primary emotion and sub-emotion indices
  // Start with -1 to indicate no selection
  const [currentPrimaryIndex, setCurrentPrimaryIndex] = useState(-1);
  const [currentSubIndex, setCurrentSubIndex] = useState(0);
  
  // Get current primary emotion config (or null if none selected)
  const currentPrimary = currentPrimaryIndex >= 0 ? EMOTIONAL_STATES[currentPrimaryIndex] : null;
  
  // Find initial indices if emotion/feeling provided
  useEffect(() => {
    if (emotion) {
      const primaryIndex = EMOTIONAL_STATES.findIndex(e => e.state === emotion);
      if (primaryIndex >= 0) {
        setCurrentPrimaryIndex(primaryIndex);
        setSelectionLevel('primary');
        if (feeling) {
          const subIndex = EMOTIONAL_STATES[primaryIndex].feelings.findIndex(f => f === feeling);
          if (subIndex >= 0) {
            setCurrentSubIndex(subIndex);
            setSelectionLevel('sub');
          }
        }
      }
    }
  }, [emotion, feeling]);
  
  // Swipe/drag handlers for changing emotions
  const availableMoods = EMOTIONAL_STATES;
  
  useEffect(() => {
    if (!onEmotionChange) return;
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX.current - touchEndX;
      const threshold = 50;
      
      if (Math.abs(diff) > threshold) {
        if (diff > 0 && currentPrimaryIndex < availableMoods.length - 1) {
          // Swipe left - next emotion
          setCurrentPrimaryIndex(prev => {
            const next = prev + 1;
            setSelectionLevel('primary');
            return next;
          });
        } else if (diff < 0 && currentPrimaryIndex > 0) {
          // Swipe right - previous emotion
          setCurrentPrimaryIndex(prev => {
            const next = prev - 1;
            setSelectionLevel('primary');
            return next;
          });
        }
      }
    };
    
    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = false;
      mouseStartX.current = e.clientX;
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (mouseStartX.current !== 0) {
        isDragging.current = true;
      }
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      if (isDragging.current && mouseStartX.current !== 0) {
        const diff = mouseStartX.current - e.clientX;
        const threshold = 50;
        
        if (Math.abs(diff) > threshold) {
          if (diff > 0 && currentPrimaryIndex < availableMoods.length - 1) {
            // Drag left - next emotion
            setCurrentPrimaryIndex(prev => {
              const next = prev + 1;
              setSelectionLevel('primary');
              return next;
            });
          } else if (diff < 0 && currentPrimaryIndex > 0) {
            // Drag right - previous emotion
            setCurrentPrimaryIndex(prev => {
              const next = prev - 1;
              setSelectionLevel('primary');
              return next;
            });
          }
        }
      }
      mouseStartX.current = 0;
      isDragging.current = false;
    };
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener('touchstart', handleTouchStart);
      container.addEventListener('touchend', handleTouchEnd);
      container.addEventListener('mousedown', handleMouseDown);
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchend', handleTouchEnd);
        container.removeEventListener('mousedown', handleMouseDown);
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [onEmotionChange, currentPrimaryIndex, availableMoods]);
  
  // Handle quick selection clicks
  const handlePrimaryClick = () => {
    if (currentPrimaryIndex < 0) {
      // Start with first emotion if none selected
      setCurrentPrimaryIndex(0);
    }
    setSelectionLevel('primary');
  };
  
  const handleSubClick = () => {
    if (currentPrimaryIndex < 0) return;
    setSelectionLevel('sub');
    // When clicking sub, save it immediately
    const selectedFeeling = currentPrimary.feelings[currentSubIndex];
    onEmotionChange?.(currentPrimary.state, selectedFeeling);
  };
  
  // Get current sub-emotion
  const currentSubFeeling = currentPrimary ? (currentPrimary.feelings[currentSubIndex] || currentPrimary.feelings[0]) : null;
  const subFeelingEmoji = currentSubFeeling ? (FEELING_EMOJIS[currentSubFeeling] || '') : '';
  
  const sizeClass = compact ? 'w-8 h-8 sm:w-10 sm:h-10' : 'w-10 h-10 sm:w-12 sm:h-12';
  const textSizeClass = compact ? 'text-base sm:text-lg' : 'text-base sm:text-lg';
  const arrowSizeClass = compact ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl';
  
  return (
    <div ref={containerRef} className="space-y-2">
      {/* Swipe hint - left justified above arrows */}
      {showSwipeHint && (
        <div className="text-left text-xs sm:text-sm text-text-secondary dark:text-white/50 mb-2">
          ← Swipe or drag to change →
        </div>
      )}
      
      {/* Primary Emotion Line */}
      <div 
        className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={handlePrimaryClick}
      >
        <div className="flex items-center space-x-3">
          {(selectionLevel === 'primary' || selectionLevel === 'none') && (
            <motion.span 
              className={`text-navy-primary dark:text-yellow-warm ${arrowSizeClass} font-bold`}
              animate={{ 
                x: [0, 5, 0],
              }}
              transition={{ 
                repeat: Infinity,
                duration: 1.5,
                ease: "easeInOut"
              }}
            >
              →
            </motion.span>
          )}
          {currentPrimaryIndex >= 0 && currentPrimary ? (
            <>
              <div className={`${sizeClass} bg-navy-primary dark:bg-yellow-warm rounded-full flex items-center justify-center flex-shrink-0`}>
                <span className={`text-white dark:text-navy-dark ${textSizeClass}`}>{currentPrimary.emoji}</span>
              </div>
              <span className={`${textSizeClass} font-semibold text-navy-primary dark:text-yellow-warm capitalize`}>
                {currentPrimary.shortLabel}
              </span>
            </>
          ) : (
            <>
              <div className={`${sizeClass} bg-bg-secondary dark:bg-dark-bg-secondary rounded-full flex items-center justify-center flex-shrink-0 border-2 border-dashed border-navy-primary/50 dark:border-yellow-warm/50`}>
                <span className={`text-text-secondary dark:text-white/50 ${textSizeClass}`}>?</span>
              </div>
              <span className={`${textSizeClass} font-semibold text-text-secondary dark:text-white/70`}>
                Select
              </span>
            </>
          )}
        </div>
      </div>
      
      {/* Sub-Emotion Line - only show if primary is selected */}
      {currentPrimaryIndex >= 0 && currentPrimary && (
        <div 
          className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity ml-8 sm:ml-10"
          onClick={handleSubClick}
        >
          <div className="flex items-center space-x-3">
            {selectionLevel === 'sub' && (
              <motion.span 
                className={`text-navy-primary dark:text-yellow-warm ${arrowSizeClass} font-bold`}
                animate={{ 
                  x: [0, 5, 0],
                }}
                transition={{ 
                  repeat: Infinity,
                  duration: 1.5,
                  ease: "easeInOut"
                }}
              >
                →
              </motion.span>
            )}
            {subFeelingEmoji && (
              <span className={`${textSizeClass}`}>{subFeelingEmoji}</span>
            )}
            <span className={`text-sm sm:text-base text-text-secondary dark:text-white/70 capitalize`}>
              {currentSubFeeling}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(EmotionSelection);

