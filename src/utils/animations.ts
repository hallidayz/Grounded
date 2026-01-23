/**
 * Reusable animation utilities for energy check-in techniques
 */

export const breathingAnimations = {
  inhale: {
    scale: 1.2,
    duration: 4,
    ease: 'easeOut' as const,
  },
  hold: {
    scale: 1.2,
    duration: 2,
    ease: 'linear' as const,
  },
  exhale: {
    scale: 0.3,
    duration: 4,
    ease: 'easeIn' as const,
  },
};

export const pulseAnimation = {
  scale: [1, 1.1, 1],
  opacity: [0.7, 1, 0.7],
  duration: 2,
  repeat: Infinity,
  ease: 'easeInOut' as const,
};

export const floatAnimation = {
  y: [0, -10, 0],
  duration: 2,
  repeat: Infinity,
  ease: 'easeInOut' as const,
};

export const glowAnimation = {
  boxShadow: [
    '0 0 10px rgba(236, 72, 153, 0.3)',
    '0 0 20px rgba(236, 72, 153, 0.5)',
    '0 0 10px rgba(236, 72, 153, 0.3)',
  ],
  duration: 2,
  repeat: Infinity,
  ease: 'easeInOut' as const,
};

export const slideDownAnimation = {
  y: [0, 'calc(100vh - 200px)'],
  duration: 7,
  ease: 'easeIn' as const,
};

export const colorFlashAnimation = {
  opacity: [0, 1, 0],
  duration: 0.3,
};

export const scaleBalanceAnimation = (balance: number) => ({
  rotate: Math.max(-15, Math.min(15, balance * 3)),
  type: 'spring' as const,
  stiffness: 100,
  damping: 10,
});
