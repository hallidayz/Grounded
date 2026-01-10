import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { EMOTIONAL_STATES } from '../services/emotionalStates';
import { useData } from '../contexts/DataContext';

interface AIResponseBubbleProps {
  message: string;
  emotion?: string;
  feeling?: string; // The selected feeling word (e.g., "tired", "anxious")
  feelingEmoji?: string; // The emoji for the emotional state
  onActionClick?: (action: 'reflection' | 'values' | 'resources') => void;
  onMoodChange?: (emotion: string, feeling: string) => void; // Callback for mood loop changes
  encouragement?: string | null; // Encouragement text to display
  encouragementLoading?: boolean; // Whether encouragement is loading
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
    'hopeful': '🌱', 'curious': '🤔', 'calm': '🌿', 'engaged': '🎯', 'content': '😊', 'grateful': '🙏',
    // Energized
    'joyful': '😄', 'excited': '🎉', 'proud': '🦁', 'elated': '🎊', 'enthusiastic': '🔥', 'vibrant': '🌈'
};

const AIResponseBubble: React.FC<AIResponseBubbleProps> = ({ 
  message, 
  emotion, 
  feeling, 
  feelingEmoji, 
  onActionClick,
  onMoodChange,
  encouragement,
  encouragementLoading
}) => {
  const { handleMoodLoopEntry } = useData();
  const [isVisible, setIsVisible] = useState(false);
  
  // Refs for swipe/drag handling
  const bubbleRef = useRef<HTMLDivElement>(null);
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
  
  // Handle swipe/drag for mood selection (works for both touch and mouse)
  useEffect(() => {
    const bubble = bubbleRef.current;
    if (!bubble || !onMoodChange) return;

    const changeMood = (deltaX: number) => {
      // Swipe threshold: 50px
      if (Math.abs(deltaX) > 50) {
        if (selectionLevel === 'primary' || selectionLevel === 'none') {
          // Navigate primary emotions
          let newIndex = currentPrimaryIndex;
          if (currentPrimaryIndex < 0) {
            // Start from first emotion
            newIndex = deltaX > 0 ? EMOTIONAL_STATES.length - 1 : 0;
          } else {
            if (deltaX > 0) {
              newIndex = currentPrimaryIndex > 0 ? currentPrimaryIndex - 1 : EMOTIONAL_STATES.length - 1;
            } else {
              newIndex = currentPrimaryIndex < EMOTIONAL_STATES.length - 1 ? currentPrimaryIndex + 1 : 0;
            }
          }
          setCurrentPrimaryIndex(newIndex);
          setCurrentSubIndex(0); // Reset sub to first when changing primary
          setSelectionLevel('primary');
        } else {
          // Navigate sub-emotions within current primary
          if (currentPrimaryIndex < 0) return;
          const feelings = EMOTIONAL_STATES[currentPrimaryIndex].feelings;
          let newIndex = currentSubIndex;
          if (deltaX > 0) {
            newIndex = currentSubIndex > 0 ? currentSubIndex - 1 : feelings.length - 1;
          } else {
            newIndex = currentSubIndex < feelings.length - 1 ? currentSubIndex + 1 : 0;
          }
          setCurrentSubIndex(newIndex);
          
          // Save the selected sub-emotion
          const selectedFeeling = feelings[newIndex];
          onMoodChange?.(EMOTIONAL_STATES[currentPrimaryIndex].state, selectedFeeling);
          handleMoodLoopEntry(EMOTIONAL_STATES[currentPrimaryIndex].state, selectedFeeling).catch((error) => {
            console.error('[AIResponseBubble] Error saving mood entry:', error);
          });
        }
      }
    };

    // Touch event handlers
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartX.current = touch.clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartX.current) return;
      
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartX.current;
      changeMood(deltaX);
      touchStartX.current = 0;
    };

    // Mouse event handlers for desktop
    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      mouseStartX.current = e.clientX;
      e.preventDefault();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      e.preventDefault();
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!isDragging.current) return;
      isDragging.current = false;
      
      const deltaX = e.clientX - mouseStartX.current;
      changeMood(deltaX);
      mouseStartX.current = 0;
    };

    // Add event listeners
    bubble.addEventListener('touchstart', handleTouchStart, { passive: true });
    bubble.addEventListener('touchend', handleTouchEnd, { passive: true });
    bubble.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      bubble.removeEventListener('touchstart', handleTouchStart);
      bubble.removeEventListener('touchend', handleTouchEnd);
      bubble.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [selectionLevel, currentPrimaryIndex, currentSubIndex, onMoodChange, handleMoodLoopEntry]);

  useEffect(() => {
    // Fade-in animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleActionClick = useCallback((action: 'reflection' | 'values' | 'resources') => {
    onActionClick?.(action);
  }, [onActionClick]);

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
    onMoodChange?.(currentPrimary.state, selectedFeeling);
    handleMoodLoopEntry(currentPrimary.state, selectedFeeling).catch((error) => {
      console.error('[AIResponseBubble] Error saving mood entry:', error);
    });
  };

  // Get current sub-emotion
  const currentSubFeeling = currentPrimary ? (currentPrimary.feelings[currentSubIndex] || currentPrimary.feelings[0]) : null;
  const subFeelingEmoji = currentSubFeeling ? (FEELING_EMOJIS[currentSubFeeling] || '') : '';
  
  // Show swipe hint if onMoodChange is provided
  const showSwipeHint = onMoodChange;

  return (
    <motion.div
      ref={bubbleRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="bg-navy-light/10 dark:bg-dark-bg-secondary rounded-3xl p-6 space-y-4 relative"
    >
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
          {selectionLevel === 'primary' && (
            <motion.span 
              className="text-navy-primary dark:text-yellow-warm text-2xl sm:text-3xl font-bold"
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
          {selectionLevel === 'none' && (
            <motion.span 
              className="text-navy-primary dark:text-yellow-warm text-2xl sm:text-3xl font-bold"
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
          {currentPrimaryIndex >= 0 ? (
            <>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-navy-primary dark:bg-yellow-warm rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white dark:text-navy-dark text-lg sm:text-xl">{currentPrimary.emoji}</span>
              </div>
              <span className="text-base sm:text-lg font-semibold text-navy-primary dark:text-yellow-warm capitalize">
                {currentPrimary.shortLabel}
              </span>
            </>
          ) : (
            <>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-bg-secondary dark:bg-dark-bg-secondary rounded-full flex items-center justify-center flex-shrink-0 border-2 border-dashed border-navy-primary/50 dark:border-yellow-warm/50">
                <span className="text-text-secondary dark:text-white/50 text-lg sm:text-xl">?</span>
              </div>
              <span className="text-base sm:text-lg font-semibold text-text-secondary dark:text-white/70">
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
                className="text-navy-primary dark:text-yellow-warm text-2xl sm:text-3xl font-bold"
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
              <span className="text-lg sm:text-xl">{subFeelingEmoji}</span>
            )}
            <span className="text-sm sm:text-base text-text-secondary dark:text-white/70 capitalize">
              {currentSubFeeling}
            </span>
          </div>
        </div>
      )}
      
      <p className="text-text-primary dark:text-white leading-relaxed">
        {message}
      </p>

      {onActionClick && (
        <div className="space-y-2 pt-2">
          <p className="text-sm text-text-secondary dark:text-white/70">
            Would you like to:
          </p>
          <div className="space-y-2">
            <button
              onClick={() => handleActionClick('reflection')}
              className="w-full bg-white dark:bg-dark-bg-tertiary text-text-primary dark:text-white rounded-xl p-4 text-left font-medium shadow-sm hover:shadow-md transition-all active:scale-98"
            >
              📝 Write a reflection
            </button>
            <button
              onClick={() => handleActionClick('values')}
              className="w-full bg-white dark:bg-dark-bg-tertiary text-text-primary dark:text-white rounded-xl p-4 text-left font-medium shadow-sm hover:shadow-md transition-all active:scale-98"
            >
              🎯 See your values
            </button>
            <button
              onClick={() => handleActionClick('resources')}
              className="w-full bg-white dark:bg-dark-bg-tertiary text-text-primary dark:text-white rounded-xl p-4 text-left font-medium shadow-sm hover:shadow-md transition-all active:scale-98"
            >
              📞 View resources
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default React.memo(AIResponseBubble);
