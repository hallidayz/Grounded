/**
 * ANIMATION UTILITIES
 * 
 * Emotion-based animation configurations and haptic feedback helpers.
 * Used for smooth, therapeutic UI interactions.
 */

// Emotion-based animation configs
export const emotionAnimations = {
  heavy: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: 'easeOut' }
  },
  energized: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3, ease: 'easeOut', type: 'spring' }
  },
  calm: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.8, ease: 'easeInOut' }
  }
};

// Haptic feedback helper
export const hapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if ('vibrate' in navigator) {
    const patterns = {
      light: 10,
      medium: 20,
      heavy: 30
    };
    navigator.vibrate(patterns[type]);
  }
};

