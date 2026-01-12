import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { EMOTIONAL_STATES } from '../services/emotionalStates';

interface AIResponseBubbleProps {
  message: string;
  emotion?: string;
  feeling?: string; // The selected feeling word (e.g., "tired", "anxious")
  feelingEmoji?: string; // The emoji for the emotional state
  onActionClick?: (action: 'reflection' | 'values' | 'resources') => void;
  onMoodChange?: (emotion: string, feeling: string) => void; // Callback for mood loop changes (not used for selection)
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
  encouragement,
  encouragementLoading
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Get emotion config for display (read-only)
  const emotionConfig = emotion ? EMOTIONAL_STATES.find(e => e.state === emotion) : null;
  const feelingEmojiDisplay = feeling ? (FEELING_EMOJIS[feeling] || '') : '';

  useEffect(() => {
    // Fade-in animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleActionClick = useCallback((action: 'reflection' | 'values' | 'resources') => {
    onActionClick?.(action);
  }, [onActionClick]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="bg-navy-light/10 dark:bg-dark-bg-secondary rounded-3xl p-6 space-y-4 relative"
    >
      {/* Display emotion (read-only) - only show if emotion is provided */}
      {emotionConfig && (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-navy-primary dark:bg-yellow-warm rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white dark:text-navy-dark text-lg sm:text-xl">{emotionConfig.emoji}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-semibold text-navy-primary dark:text-yellow-warm capitalize">
              {emotionConfig.shortLabel}
            </span>
            {feeling && (
              <div className="flex items-center space-x-2 mt-1">
                {feelingEmojiDisplay && (
                  <span className="text-sm">{feelingEmojiDisplay}</span>
                )}
                <span className="text-sm text-text-secondary dark:text-white/70 capitalize">
                  {feeling}
                </span>
              </div>
            )}
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
