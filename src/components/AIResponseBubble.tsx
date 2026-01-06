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
}

const AIResponseBubble: React.FC<AIResponseBubbleProps> = ({ 
  message, 
  emotion, 
  feeling, 
  feelingEmoji, 
  onActionClick,
  onMoodChange 
}) => {
  const { handleMoodLoopEntry } = useData();
  const [isVisible, setIsVisible] = useState(false);
  
  // Thumb swipe mood selection loop state (works for both touch and mouse)
  const bubbleRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const mouseStartX = useRef<number>(0);
  const isDragging = useRef<boolean>(false);
  const [currentMoodIndex, setCurrentMoodIndex] = useState(0);
  
  // Get all available moods for the loop (memoized)
  const availableMoods = React.useMemo(() => 
    EMOTIONAL_STATES.flatMap(state => 
      state.feelings.map(f => ({
        emotion: state.state,
        feeling: f,
        emoji: state.emoji,
        label: state.shortLabel
      }))
    ), []
  );
  
  // Find initial mood index
  useEffect(() => {
    if (emotion && feeling) {
      const index = availableMoods.findIndex(
        m => m.emotion === emotion && m.feeling === feeling
      );
      if (index >= 0) {
        setCurrentMoodIndex(index);
      }
    }
  }, [emotion, feeling, availableMoods]);
  
  // Handle swipe/drag for mood selection loop (works for both touch and mouse)
  useEffect(() => {
    const bubble = bubbleRef.current;
    if (!bubble || !onMoodChange) return;

    const changeMood = (deltaX: number) => {
      // Swipe threshold: 50px
      if (Math.abs(deltaX) > 50) {
        let newIndex = currentMoodIndex;
        
        if (deltaX > 0) {
          // Swipe right - previous mood
          newIndex = currentMoodIndex > 0 ? currentMoodIndex - 1 : availableMoods.length - 1;
        } else {
          // Swipe left - next mood
          newIndex = currentMoodIndex < availableMoods.length - 1 ? currentMoodIndex + 1 : 0;
        }
        
        setCurrentMoodIndex(newIndex);
        const newMood = availableMoods[newIndex];
        
        // Call the prop callback if provided
        onMoodChange?.(newMood.emotion, newMood.feeling);
        
        // Also save to database via DataContext
        handleMoodLoopEntry(newMood.emotion, newMood.feeling).catch((error) => {
          console.error('[AIResponseBubble] Error saving mood entry:', error);
        });
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
  }, [currentMoodIndex, onMoodChange, availableMoods, handleMoodLoopEntry]);

  useEffect(() => {
    // Fade-in animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleActionClick = useCallback((action: 'reflection' | 'values' | 'resources') => {
    onActionClick?.(action);
  }, [onActionClick]);

  // Use current mood from loop, or fallback to provided props
  const currentMood = availableMoods[currentMoodIndex] || { emotion: emotion || '', feeling: feeling || '', emoji: feelingEmoji || '💙', label: emotion || 'Reflection' };
  // Display primary emotion label (e.g., "Calm") instead of just the feeling word
  const displayText = currentMood.label || currentMood.emotion || emotion || 'Reflection';
  const displayEmoji = currentMood.emoji || feelingEmoji || '💙';
  
  // Show swipe hint if onMoodChange is provided
  const showSwipeHint = onMoodChange && availableMoods.length > 1;

  return (
    <motion.div
      ref={bubbleRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="bg-navy-light/10 dark:bg-dark-bg-secondary rounded-3xl p-6 space-y-4 relative"
    >
      {showSwipeHint && (
        <div className="absolute top-2 right-2 text-xs text-text-secondary dark:text-white/50">
          ← Swipe or drag to change mood →
        </div>
      )}
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-navy-primary dark:bg-yellow-warm rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white dark:text-navy-dark text-sm">{displayEmoji}</span>
        </div>
        <span className="text-sm font-semibold text-navy-primary dark:text-yellow-warm capitalize">
          {displayText}
        </span>
      </div>
      
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

