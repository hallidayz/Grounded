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
  
  // Refs for swipe/drag handling
  const bubbleRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const mouseStartX = useRef<number>(0);
  const isDragging = useRef<boolean>(false);
  
  // Track selection level: 'primary' or 'sub'
  const [selectionLevel, setSelectionLevel] = useState<'primary' | 'sub'>('primary');
  
  // Track current primary emotion and sub-emotion indices
  const [currentPrimaryIndex, setCurrentPrimaryIndex] = useState(0);
  const [currentSubIndex, setCurrentSubIndex] = useState(0);
  
  // Get current primary emotion config
  const currentPrimary = EMOTIONAL_STATES[currentPrimaryIndex] || EMOTIONAL_STATES[0];
  
  // Find initial indices
  useEffect(() => {
    if (emotion) {
      const primaryIndex = EMOTIONAL_STATES.findIndex(e => e.state === emotion);
      if (primaryIndex >= 0) {
        setCurrentPrimaryIndex(primaryIndex);
        if (feeling) {
          const subIndex = EMOTIONAL_STATES[primaryIndex].feelings.findIndex(f => f === feeling);
          if (subIndex >= 0) {
            setCurrentSubIndex(subIndex);
            setSelectionLevel('sub'); // If both are provided, show sub level
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
        if (selectionLevel === 'primary') {
          // Navigate primary emotions
          let newIndex = currentPrimaryIndex;
          if (deltaX > 0) {
            newIndex = currentPrimaryIndex > 0 ? currentPrimaryIndex - 1 : EMOTIONAL_STATES.length - 1;
          } else {
            newIndex = currentPrimaryIndex < EMOTIONAL_STATES.length - 1 ? currentPrimaryIndex + 1 : 0;
          }
          setCurrentPrimaryIndex(newIndex);
          setCurrentSubIndex(0); // Reset sub to first when changing primary
        } else {
          // Navigate sub-emotions within current primary
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
    setSelectionLevel('primary');
  };

  const handleSubClick = () => {
    setSelectionLevel('sub');
    // When clicking sub, save it immediately
    const selectedFeeling = currentPrimary.feelings[currentSubIndex];
    onMoodChange?.(currentPrimary.state, selectedFeeling);
    handleMoodLoopEntry(currentPrimary.state, selectedFeeling).catch((error) => {
      console.error('[AIResponseBubble] Error saving mood entry:', error);
    });
  };

  // Get current sub-emotion
  const currentSubFeeling = currentPrimary.feelings[currentSubIndex] || currentPrimary.feelings[0];
  
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
      {showSwipeHint && (
        <div className="absolute top-2 right-2 text-xs text-text-secondary dark:text-white/50">
          ← Swipe or drag to change →
        </div>
      )}
      
      {/* Primary Emotion Line */}
      <div 
        className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={handlePrimaryClick}
      >
        <div className="flex items-center space-x-2">
          {selectionLevel === 'primary' && (
            <span className="text-navy-primary dark:text-yellow-warm text-lg">→</span>
          )}
          <div className="w-8 h-8 bg-navy-primary dark:bg-yellow-warm rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white dark:text-navy-dark text-sm">{currentPrimary.emoji}</span>
          </div>
          <span className="text-sm font-semibold text-navy-primary dark:text-yellow-warm capitalize">
            {currentPrimary.shortLabel}
          </span>
        </div>
      </div>
      
      {/* Sub-Emotion Line */}
      <div 
        className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity ml-6"
        onClick={handleSubClick}
      >
        <div className="flex items-center space-x-2">
          {selectionLevel === 'sub' && (
            <span className="text-navy-primary dark:text-yellow-warm text-lg">→</span>
          )}
          <span className="text-sm text-text-secondary dark:text-white/70 capitalize">
            {currentSubFeeling}
          </span>
        </div>
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

