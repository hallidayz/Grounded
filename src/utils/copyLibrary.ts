/**
 * Copy Library
 *
 * Centralized copy strings for the Grounded app.
 * Plug-and-play for consistent messaging throughout the app.
 */

export const COPY = {
  // === ENERGY ENTRY ===
  energyEntry: {
    title: 'How much do you have in you right now?',
    privacyNote: 'Your moments stay on your device. Nothing leaves without your say.',
    crisisButton: 'Need urgent help now?',
    options: [
      {
        energy: '10s' as const,
        label: '10 seconds',
        description: 'Quick breath reset',
        icon: '🌬️',
        color: 'bg-green-50 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-800',
      },
      {
        energy: '2min' as const,
        label: '2 minutes',
        description: 'Breath + check-in',
        icon: '🌱',
        color: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:border-yellow-800',
      },
      {
        energy: '5min' as const,
        label: '5 minutes',
        description: 'Body scan + reflection',
        icon: '🌊',
        color: 'bg-blue-50 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800',
      },
    ],
  },

  // === VALIDATION (Post Check-in) ===
  validation: {
    heavy: [
      'Today felt heavy. Showing up anyway matters.',
      'You noticed how you feel. That\'s a real step.',
      'Heavy days are still days you showed up.',
    ],
    numb: [
      'Even numbness is a kind of showing up.',
      'You\'re here. That\'s enough for now.',
      'Numbness passes. Your presence doesn\'t.',
    ],
    foggy: [
      'Fog happens. You\'re still moving through it.',
      'You took a moment to notice. That\'s enough.',
    ],
    okay: [
      'Okay is a perfectly valid place to be.',
      'You showed up. That\'s real work today.',
    ],
    hopeful: [
      'Hope is a verb. You\'re practicing it.',
      'Your optimism is a form of courage.',
    ],
    default: [
      'No finish line here. Just practice, as often as you need.',
      'You noticed how you feel. That\'s a real step.',
      'Today was heavy. Showing up anyway matters.',
    ],
  },

  // === TINY STEPS (Opt-in) ===
  tinySteps: {
    prefix: 'If you want, you could:',
    options: [
      'Stretch your arms for 30 seconds',
      'Drink a glass of water',
      'Step outside for 1 minute',
      'Message someone you trust',
      'Write down one thing you noticed',
    ],
  },

  // === CRISIS SCREEN ===
  crisis: {
    header: 'Grounded is not emergency care or therapy.',
    subheader: 'For urgent help:',
    resources: [
      { name: '988', description: 'Suicide & Crisis Lifeline' },
      { name: '741741', description: 'Crisis Text Line - Text HOME' },
    ],
    localResources: 'Find local crisis lines',
  },

  // === HISTORY ===
  history: {
    header: (count: number) => `You\'ve come back on ${count} different moments.`,
    footer: 'That says something about your persistence.',
    empty: 'No moments recorded yet. Your first moment is waiting.',
  },

  // === PRIVACY ===
  privacy: {
    notice: 'Your moments stay on your device. Nothing leaves without your say.',
    deleteAll: 'Delete everything anytime.',
  },

  // === GROUNDING COMPLETE ===
  grounding: {
    complete: {
      '10s': 'You took a breath. That\'s real.',
      '2min': 'You noticed how you feel. That\'s a real step.',
      '5min': 'You took a moment to notice. That\'s enough for now.',
    },
    tinyStepPrompt: 'If you want, you *could*:',
  },

  // === ERROR MESSAGES ===
  errors: {
    modelLoading: 'AI is still loading. Here\'s something to try in the meantime:',
    offline: 'You\'re offline. The grounding tools still work!',
  },
};

// Helper function to get validation copy based on emotion
export function getValidationCopy(emotion: string): string {
  const emotionLower = emotion.toLowerCase();

  // Check for key emotions
  if (emotionLower.includes('heavy') || emotionLower.includes('sad')) {
    return COPY.validation.heavy[Math.floor(Math.random() * COPY.validation.heavy.length)];
  }
  if (emotionLower.includes('numb') || emotionLower.includes('empty')) {
    return COPY.validation.numb[Math.floor(Math.random() * COPY.validation.numb.length)];
  }
  if (emotionLower.includes('fog') || emotionLower.includes('mixed')) {
    return COPY.validation.foggy[Math.floor(Math.random() * COPY.validation.foggy.length)];
  }
  if (emotionLower.includes('okay') || emotionLower.includes('calm')) {
    return COPY.validation.okay[Math.floor(Math.random() * COPY.validation.okay.length)];
  }
  if (emotionLower.includes('hope') || emotionLower.includes('optimistic')) {
    return COPY.validation.hopeful[Math.floor(Math.random() * COPY.validation.hopeful.length)];
  }

  // Default fallback
  return COPY.validation.default[Math.floor(Math.random() * COPY.validation.default.length)];
}

// Helper to get completion message based on energy level
export function getCompletionMessage(energy: '10s' | '2min' | '5min'): string {
  return COPY.grounding.complete[energy];
}

export default COPY;
