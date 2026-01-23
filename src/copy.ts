/**
 * Centralized copy library for Grounded app
 */

import type { EnergyOption, MoodType, ConversationNode } from './types';
import type { CrisisResource } from './types';

export const COPY = {
  app: {
    title: 'Grounded',
    tagline: 'Small moments, big difference',
  },

  welcome: {
    title: 'Pause.',
    subtitle: "What's moving through you?",
    placeholder: 'Take your time...',
  },

  energy: {
    title: 'How are you feeling?',
    subtitle: 'Be honest. Every bit counts.',
    options: [
      {
        energy: '10s',
        label: 'The Circuit Breaker',
        icon: '⚡',
        duration: '10s',
        description: 'Quick reset (high energy)',
        energyLevel: 'high',
        hasSubOptions: true,
      },
      {
        energy: '2min',
        label: '2 minutes',
        icon: '🌱',
        duration: '2 min',
        description: 'Grounding (medium energy)',
        energyLevel: 'medium',
      },
      {
        energy: '5min',
        label: '5 minutes',
        icon: '🌊',
        duration: '5 min',
        description: 'Body scan (low energy)',
        energyLevel: 'low',
      },
    ] as EnergyOption[],
  },

  tenSecondBreakers: [
    {
      key: '10s-reset',
      label: 'The Reset',
      icon: '✨',
      title: 'The Reset',
      instruction: 'Inhale... Inhale... Exhale...',
      subtext: 'Physiological Sigh: Two quick inhales through the nose, one long exhale through the mouth.',
      color: '#fbbf24',
      bgColor: '#fef3c7',
      visual: 'flash',
      energyLevel: 'high',
    },
    {
      key: '10s-anchor',
      label: 'The Anchor',
      icon: '⚓',
      title: 'The Anchor',
      instruction: 'Drop everything.',
      subtext: 'Muscle Drop: Drop your shoulders, unclench your jaw, release your tongue.',
      color: '#475569',
      bgColor: '#e2e8f0',
      visual: 'drop',
      energyLevel: 'high',
    },
    {
      key: '10s-compassion',
      label: 'Compassion Tap',
      icon: '💗',
      title: 'The Compassion Tap',
      instruction: 'Hand on heart.',
      subtext: 'Physical Touch: Place both hands over your heart and feel the warmth for 10 seconds.',
      color: '#ec4899',
      bgColor: '#fce7f3',
      visual: 'expand',
      energyLevel: 'medium',
    },
    {
      key: '10s-hum',
      label: 'Vagus Hum',
      icon: '〰️',
      title: 'The Vagus Hum',
      instruction: 'Mmmmmmmm',
      subtext: 'The Hum: Take one breath and hum "Mmm" until the timer hits zero to vibrate the Vagus nerve.',
      color: '#8b5cf6',
      bgColor: '#ede9fe',
      visual: 'wave',
      energyLevel: 'low',
    },
  ],

  conversation: {
    nodes: {
      welcome: {
        message: "Pause. What's moving through you?",
        placeholder: 'Take your time...',
      },
      low_energy_offer: {
        message: "That's heavy to carry. You're safe here. Want 1 slow breath with me?",
        quickReplies: ['Yes, guide me', 'No, just need space'],
      },
      low_energy_yes: {
        message: "Good. Hand on heart? In... 4... hold 4... out 8... Feel your body settling. What's 1 thing you see nearby?",
        placeholder: 'Name something you see...',
      },
      low_energy_no: {
        message: "That's okay. Here's quiet space. Tap when ready, or name 1 color you see.",
        quickReplies: ['Ready now', 'Blue'],
      },
      low_energy_grounding: {
        message: "Notice that. Now — 4 more things you can see?",
        placeholder: '4 things you see...',
      },
      low_energy_complete: {
        message: "You're doing this. Rest here as long as you need. I'm with you.",
        quickReplies: ['Thank you', 'Done for now'],
      },
      medium_swirl_offer: {
        message: "Sounds swirling — I see you. Name 1 thing you can touch right now?",
        placeholder: 'What can you touch?',
      },
      medium_swirl_response: {
        message: "Feel its texture. Good anchor. What's 1 sound nearby?",
        placeholder: 'What do you hear?',
      },
      medium_swirl_grounding: {
        message: "That grounding. 3 things you can feel? Then 2 you smell? 1 you taste?",
        placeholder: 'Continue grounding...',
      },
      medium_swirl_complete: {
        message: "Thoughts passing like clouds. You're here, steady. What feels steady right now?",
        placeholder: 'What feels steady?',
      },
      high_chaos_offer: {
        message: "You're holding so much — here's space to set it down. Safe with me. Hand on heart? In... out...",
        quickReplies: ['Breathing', "Can't focus"],
      },
      high_chaos_grounding: {
        message: "That's okay, just breathe. What's 1 safe thing under your feet? Floor? Chair? Ground?",
        placeholder: 'What supports you?',
      },
      high_chaos_visualization: {
        message: "Grounded there. Chaos doesn't own you. Picture a calm place — what do you see? Hear?",
        placeholder: 'Describe your safe place...',
      },
      high_chaos_tiny_steps: {
        message: "This feels big. Name 1 tiny step? Water? Walk? Journal? Phone a friend?",
        quickReplies: ['Water', 'Walk', 'Rest'],
      },
      high_chaos_crisis: {
        message: "Want hotlines nearby, or I can set a timer for pro help to arrive? You're not alone.",
        quickReplies: ['Show hotlines', 'Set timer'],
      },
      high_chaos_complete: {
        message: "You showed up for yourself. That's everything. Rest, or tiny step — your call.",
        quickReplies: ['Thank you', 'Done'],
      },
      panic_offer: {
        message: "I see the panic — you're safe right here with me. Hand on heart. Feet on floor. Can you press your feet down now?",
        quickReplies: ['Yes', "No, can't move"],
      },
      panic_yes: {
        message: "Perfect anchor. 1 thing you feel under your fingers?",
        placeholder: 'What do you feel?',
      },
      panic_no: {
        message: "That's alright. You're held here. Notice air on your face? Just the air. In... out...",
        quickReplies: ['Trying', 'Stay here'],
      },
      panic_breath: {
        message: "Good. 1 slow breath with me? In 3... hold 3... out 6. You're pulling through. Name 1 color you see.",
        placeholder: 'Name a color...',
      },
      panic_escalate: {
        message: "Want a 988 timer or stay in this breath space with me? You're not alone in this.",
        quickReplies: ['988 timer', 'Stay here'],
      },
      panic_complete: {
        message: "You made it through that wave. I'm still here. Want to stay in this breath or tiny step?",
        quickReplies: ['Breathe more', 'Tiny step'],
      },
      mild_offer: {
        message: "I feel that edge with you. What's the main worry showing up right now?",
        placeholder: "What's worrying you?",
      },
      mild_specific: {
        message: "That sounds heavy to carry. Can you name 1 thing that's certain right now? (Feet? Phone? Breath?)",
        placeholder: "What's certain?",
      },
      mild_general: {
        message: "The hum of anxiety. Normal to feel that. What's 1 small thing feeling steady under all this?",
        placeholder: 'What feels steady?',
      },
      mild_anchor: {
        message: "Good anchor. Let that worry float next to it. Notice which feels more solid?",
        placeholder: 'What feels solid?',
      },
      mild_complete: {
        message: "You're being with it instead of fighting it. That's real progress. What feels steadier now?",
        placeholder: 'What feels better?',
      },
      crisis_resources: {
        header: 'Resources nearby',
        resources: [
          { name: '988 Suicide & Crisis Lifeline', action: 'tel:988', description: 'Call or text 988 (US)' },
          { name: 'Crisis Text Line', action: 'sms:741741&body=HOME', description: 'Text HOME to 741741' },
        ] as CrisisResource[],
        closing: "You don't have to face this alone. These humans are ready to listen.",
      },
      session_complete: {
        message: "Thank you for being here. You've done hard work. Rest well.",
        quickReplies: ['New session', 'Done'],
      },
    },
  },

  grounding: {
    intro: {
      '10s': 'One breath. That\'s all we need.',
      '2min': 'Let\'s take a moment together.',
      '5min': 'Let\'s slow down and check in.',
    },
    breath: {
      '10s': [
        'Breathe in slowly...',
        'Breathe out...',
      ],
      '2min': [
        'Find a comfortable position.',
        'Breathe in slowly through your nose...',
        'Hold for a moment...',
        'Breathe out through your mouth...',
        'Again...',
        'Notice how your body feels.',
      ],
      '5min': [
        'Find a comfortable position, sitting or lying down.',
        'Close your eyes or soften your gaze.',
        'Take three deep breaths: in through nose, out through mouth.',
        'Notice any sensations in your body...',
        'Without judging, simply observe.',
        'If your mind wanders, gently bring it back.',
        'Take one more deep breath.',
        'Slowly open your eyes.',
      ],
    },
    reflection: {
      prompt: 'What\'s one thing that mattered today?',
      placeholder: 'Small is fine...',
    },
  },

  validation: {
    heavy: [
      'Today felt heavy. Showing up anyway matters.',
      'Getting through it counts.',
      'Sometimes just existing is enough.',
      'You\'re doing better than you think.',
      'This feeling won\'t last forever.',
      'It\'s okay to not be okay.',
    ],
    neutral: [
      'Every day is a mix. You\'re here, and that\'s something.',
      'Checking in with yourself is a form of care.',
      'Steady and present. That\'s a win.',
      'You\'re on your own timeline.',
      'Moderate is okay. You\'re still here.',
    ],
    light: [
      'That\'s wonderful. Enjoy the good moments.',
      'It\'s nice when things feel lighter.',
      'Savor this feeling.',
      'You deserve the good days too.',
    ],
    uncertain: [
      'Not knowing is okay too.',
      'Feelings don\'t always have names.',
      'You\'re still doing the work.',
      'Checking in matters, even without answers.',
    ],
  },

  completion: {
    title: 'You did it.',
    subtitle: 'Thanks for showing up for yourself.',
  },

  crisis: {
    header: 'Need urgent help now?',
    subtitle: 'These services are ready to listen:',
    resources: [
      {
        name: '988 Suicide & Crisis Lifeline',
        action: 'tel:988',
        description: 'Call or text 988 (US)',
      },
      {
        name: 'Crisis Text Line',
        action: 'sms:741741&body=HOME',
        description: 'Text HOME to 741741',
      },
    ] as CrisisResource[],
    hotlines: [
      { name: 'International Association for Suicide Prevention', url: 'https://www.iasp.info/resources/Crisis_Centres/' },
      { name: 'Befrienders Worldwide', url: 'https://befrienders.org/' },
    ],
    closing: 'You don\'t have to face this alone.',
  },

  history: {
    title: 'Your moments',
    subtitle: 'Every dot is a time you showed up.',
    empty: 'No moments yet. Your first one matters.',
  },

  tinySteps: {
    title: 'Tiny steps',
    subtitle: 'Optional suggestions for when you\'re ready:',
    actions: [
      { label: 'Drink some water', icon: '💧' },
      { label: 'Stretch for 30 seconds', icon: '🧘' },
      { label: 'Look out a window', icon: '🪟' },
      { label: 'Write down one thing', icon: '📝' },
      { label: 'Text a friend', icon: '💬' },
    ],
    dismiss: 'Maybe later',
    dismissAll: 'I\'m good for now',
  },

  energyCheckIn: {
    title: 'How is your energy right now?',
    subtext: 'Pick one that fits right now. There\'s no wrong answer.',
    levels: {
      low: {
        label: 'Low / Drained',
        description: 'Heavy, tired, hard to move.',
        cardTitle: 'Tiny step for low energy',
        duration: '≈ 10 seconds',
        subtext: 'Quick interventions to shift the nervous system or cognitive perspective.',
      },
      medium: {
        label: 'Medium / Managing',
        description: 'Getting through, not great, not awful.',
        cardTitle: '2-minute reset',
        duration: '≈ 2 minutes',
        subtext: 'Quick interventions to shift the nervous system or cognitive perspective.',
      },
      high: {
        label: 'High / Wired',
        description: 'On edge, restless, keyed up.',
        cardTitle: '5-minute deep support',
        duration: '≈ 5 minutes',
        subtext: 'Deeply restorative work for when you have the capacity to sit with your feelings.',
      },
    },
    techniques: {
      low: {
        'grounding-flash': {
          name: 'The Grounding Flash',
          type: 'Breath-Led',
          bestFor: 'Feeling "tight" or panicked',
          message: 'Just this breath. You are safe in this moment.',
        },
        'weight-drop': {
          name: 'The Weight Drop',
          type: 'Body-Led',
          bestFor: 'High irritability, clenched teeth, or "on-edge" feeling',
          message: 'Drop the weight. Let your shoulders fall.',
        },
        'sensory-snap': {
          name: 'The Sensory Snap',
          type: 'Senses-Led',
          bestFor: 'Dissociation, "spacing out," or intense rumination',
          message: 'Found it? Focus on the color. You are here now.',
        },
        'compassionate-touch': {
          name: 'The Compassionate Touch',
          type: 'Emotional-Led',
          bestFor: 'Self-loathing, shame spirals, or feeling "unraveled"',
          message: 'Give yourself this moment of kindness. I am here for you.',
        },
      },
      medium: {
        'thought-stream': {
          name: 'The Thought Stream',
          type: 'Defusion',
          bestFor: 'Overthinking or "Sticky" thoughts',
        },
        'self-compassion-break': {
          name: 'The Self-Compassion Break',
          type: 'Based on Dr. Kristin Neff\'s work',
          bestFor: 'Self-criticism or "not enough-ness"',
        },
        'reality-check': {
          name: 'The Reality Check',
          type: 'Cognitive Distortions',
          bestFor: 'Catastrophizing',
        },
      },
      high: {
        'rain-method': {
          name: 'The RAIN Method',
          type: 'Compassionate Inquiry',
          bestFor: 'De-shaming and emotional processing',
        },
        'safe-space': {
          name: 'The Safe Space',
          type: 'Imagery Rescripting',
          bestFor: 'High stress or trauma triggers',
        },
        'compassionate-letter': {
          name: 'The Compassionate Letter',
          type: 'Perspective Taking',
          bestFor: 'Intense guilt or shame',
        },
      },
    },
  },
};

export function getValidationCopy(mood: MoodType): string {
  const options = COPY.validation[mood];
  return options[Math.floor(Math.random() * options.length)];
}

export function getCompletionMessage(): { title: string; subtitle: string } {
  return COPY.completion;
}

export function getGroundingIntro(energy: string): string {
  return COPY.grounding.intro[energy as keyof typeof COPY.grounding.intro] || '';
}

export function getGroundingBreath(energy: string): string[] {
  return COPY.grounding.breath[energy as keyof typeof COPY.grounding.breath] || [];
}

export function getConversationNode(node: ConversationNode) {
  return COPY.conversation.nodes[node];
}
