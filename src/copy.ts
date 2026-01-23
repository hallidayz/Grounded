/**
 * Centralized copy library for Grounded app
 */

import type { EnergyOption, MoodType, ConversationNode } from './types';
import type { CrisisResource } from './types';
import type { SessionLibrary, AffirmationLibrary } from './types/sessions';

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

/**
 * MASTER_SESSIONS Library
 * 
 * Type-safe configuration for all CBT/Mindfulness interventions.
 * Each session includes complete phase arrays with durations and prompts.
 */
export const MASTER_SESSIONS: SessionLibrary = {
  // 10-second Circuit Breakers
  '10s-reset': {
    id: '10s-reset',
    label: 'The Reset',
    type: 'breathing',
    message: 'Just this breath. You are safe in this moment.',
    category: '10s',
    color: '#fbbf24',
    bgColor: '#fef3c7',
    phases: [
      {
        id: 'inhale-1',
        duration: 4,
        label: 'Inhale',
        prompt: 'Two quick inhales through the nose',
        instruction: 'Inhale... Inhale...',
      },
      {
        id: 'hold',
        duration: 2,
        label: 'Hold',
        prompt: 'Hold the breath briefly',
        instruction: 'Hold...',
      },
      {
        id: 'exhale',
        duration: 4,
        label: 'Exhale',
        prompt: 'One long, slow exhale through the mouth',
        instruction: 'Exhale...',
      },
    ],
  },
  '10s-anchor': {
    id: '10s-anchor',
    label: 'The Anchor',
    type: 'physical',
    message: 'Drop into your body. You are here now.',
    category: '10s',
    color: '#475569',
    bgColor: '#e2e8f0',
    phases: [
      {
        id: 'squeeze',
        duration: 3,
        label: 'Squeeze',
        prompt: 'Squeeze your shoulders to your ears. Clench your fists.',
        instruction: 'Squeeze...',
      },
      {
        id: 'release',
        duration: 7,
        label: 'Release',
        prompt: 'Drop the weight. Let your shoulders fall. Unclench your jaw.',
        instruction: 'Drop...',
      },
    ],
  },
  '10s-snap': {
    id: '10s-snap',
    label: 'The Sensory Snap',
    type: 'sensory',
    message: 'Found it? Focus on the color. You are here now.',
    category: '10s',
    color: '#8b5cf6',
    bgColor: '#ede9fe',
    phases: [
      {
        id: 'find-color',
        duration: 10,
        label: 'Find Color',
        prompt: 'Find one thing in your room that matches this exact color',
        instruction: 'Look around...',
      },
    ],
  },
  '10s-compassion': {
    id: '10s-compassion',
    label: 'The Compassionate Touch',
    type: 'physical',
    message: 'Give yourself this moment of kindness. I am here for you.',
    category: '10s',
    color: '#ec4899',
    bgColor: '#fce7f3',
    phases: [
      {
        id: 'touch',
        duration: 10,
        label: 'Touch',
        prompt: 'Place your hands over your heart. Feel the warmth and rhythm.',
        instruction: 'Hand on heart...',
      },
    ],
  },
  '10s-hum': {
    id: '10s-hum',
    label: 'The Vagus Hum',
    type: 'physical',
    message: 'Vibrate into calm. You are safe to rest.',
    category: '10s',
    color: '#8b5cf6',
    bgColor: '#ede9fe',
    phases: [
      {
        id: 'hum',
        duration: 10,
        label: 'Hum',
        prompt: 'Take one breath and hum "Mmm" until the timer hits zero to vibrate the Vagus nerve',
        instruction: 'Mmmmmmmm',
      },
    ],
  },
  
  // 2-minute Perspective Shifts
  '2min-grounding': {
    id: '2min-grounding',
    label: '5-4-3-2-1 Sensory Anchor',
    type: 'sensory',
    message: 'Your senses are your anchor to the present.',
    category: '2min',
    phases: [
      {
        id: 'see',
        duration: 40,
        label: '5 Things You See',
        prompt: 'Name 5 things you can see around you',
        instruction: 'Look around...',
        icon: '👁️',
      },
      {
        id: 'feel',
        duration: 30,
        label: '4 Things You Feel',
        prompt: 'Name 4 things you can feel (texture, temperature, pressure)',
        instruction: 'Touch something...',
        icon: '✋',
      },
      {
        id: 'hear',
        duration: 20,
        label: '3 Things You Hear',
        prompt: 'Name 3 things you can hear',
        instruction: 'Listen...',
        icon: '👂',
      },
      {
        id: 'smell',
        duration: 20,
        label: '2 Things You Smell',
        prompt: 'Name 2 things you can smell',
        instruction: 'Breathe in...',
        icon: '👃',
      },
      {
        id: 'taste',
        duration: 10,
        label: '1 Thing You Taste',
        prompt: 'Name 1 thing you can taste',
        instruction: 'Notice...',
        icon: '👄',
      },
    ],
  },
  '2min-compassion': {
    id: '2min-compassion',
    label: 'Self-Compassion Break',
    type: 'cognitive-restructuring',
    message: 'You are doing your best with a hard moment.',
    category: '2min',
    phases: [
      {
        id: 'mindfulness',
        duration: 40,
        label: 'Mindfulness',
        prompt: 'This is a moment of suffering. Acknowledge the pain without judgment.',
        instruction: 'Notice what you feel...',
      },
      {
        id: 'common-humanity',
        duration: 40,
        label: 'Common Humanity',
        prompt: 'Suffering is part of life. I am not alone in this experience.',
        instruction: 'Remember you\'re not alone...',
      },
      {
        id: 'self-kindness',
        duration: 40,
        label: 'Self-Kindness',
        prompt: 'May I be kind to myself. May I give myself the compassion I need.',
        instruction: 'Offer yourself kindness...',
      },
    ],
  },
  '2min-reality': {
    id: '2min-reality',
    label: 'Reality Check',
    type: 'cognitive-restructuring',
    message: 'Let\'s examine the evidence together.',
    category: '2min',
    phases: [
      {
        id: 'identify-thought',
        duration: 30,
        label: 'Identify Thought',
        prompt: 'What is the thought that\'s causing distress?',
        instruction: 'Name the thought...',
      },
      {
        id: 'evidence-for',
        duration: 45,
        label: 'Evidence For',
        prompt: 'What evidence supports this thought? Be honest and specific.',
        instruction: 'List evidence for...',
      },
      {
        id: 'evidence-against',
        duration: 45,
        label: 'Evidence Against',
        prompt: 'What evidence contradicts this thought? What would you tell a friend?',
        instruction: 'List evidence against...',
      },
    ],
  },
  
  // 5-minute Deep Support
  '5min-rain': {
    id: '5min-rain',
    label: 'RAIN Method',
    type: 'inquiry',
    message: 'A 5-minute guided process. Four phases: Recognize, Allow, Investigate, Nurture.',
    category: '5min',
    phases: [
      {
        id: 'recognize',
        duration: 60,
        label: 'Recognize',
        prompt: 'Label the feeling (e.g., "I am feeling anxious"). Tap bubbles for feelings you notice.',
        instruction: 'What am I feeling?',
      },
      {
        id: 'allow',
        duration: 60,
        label: 'Allow',
        prompt: 'Let the feeling exist without trying to fix it. You don\'t have to change it yet.',
        instruction: 'Let it be...',
      },
      {
        id: 'investigate',
        duration: 120,
        label: 'Investigate',
        prompt: 'Where is this in my body? What is this feeling "saying"? Tap where you feel the sensation.',
        instruction: 'Where do I feel this?',
      },
      {
        id: 'nurture',
        duration: 60,
        label: 'Nurture',
        prompt: 'The bubbles transform into warm light. Offer yourself compassion and kindness.',
        instruction: 'How can I care for myself?',
      },
    ],
  },
  '5min-safe-space': {
    id: '5min-safe-space',
    label: 'Safe Space',
    type: 'visualization',
    message: 'Create a mental sanctuary where you feel completely safe and at peace.',
    category: '5min',
    phases: [
      {
        id: 'describe-place',
        duration: 120,
        label: 'Describe Place',
        prompt: 'Visualize a safe place (beach, forest, library). What do you see? What is the temperature?',
        instruction: 'Imagine your safe place...',
      },
      {
        id: 'sensory-layering',
        duration: 120,
        label: 'Sensory Layering',
        prompt: 'Who is there that loves you? What sounds do you hear? What do you smell?',
        instruction: 'Add sensory details...',
      },
      {
        id: 'anchor',
        duration: 60,
        label: 'Anchor',
        prompt: 'Associate this feeling with a physical gesture (like touching your heart). Remember this feeling.',
        instruction: 'Create an anchor...',
      },
    ],
  },
  '5min-letter': {
    id: '5min-letter',
    label: 'Compassionate Letter',
    type: 'writing',
    message: 'Write from the perspective of a wise, compassionate friend.',
    category: '5min',
    phases: [
      {
        id: 'grounding',
        duration: 60,
        label: 'Grounding',
        prompt: 'Take 3 deep breaths. Find your center.',
        instruction: 'Breathe...',
      },
      {
        id: 'writing',
        duration: 180,
        label: 'Writing',
        prompt: 'If a friend you loved was feeling exactly this way, what would you say to them?',
        instruction: 'Write with compassion...',
      },
      {
        id: 'read-back',
        duration: 60,
        label: 'Read Back',
        prompt: 'Read these words back to yourself. They are for you, too.',
        instruction: 'Read with kindness...',
      },
    ],
  },
};

/**
 * Nurture Affirmations Library
 * 
 * Phrases for the Nurture phase of RAIN method and other compassion-based exercises.
 */
export const NURTURE_AFFIRMATIONS: AffirmationLibrary = {
  shame: [
    'You are doing your best with a hard moment.',
    'You are worthy of compassion, especially from yourself.',
    'Mistakes don\'t define your worth.',
    'You are human, and that\'s enough.',
    'Self-compassion is not self-pity—it\'s strength.',
  ],
  anxiety: [
    'This feeling will pass.',
    'You have survived every difficult moment so far.',
    'Anxiety is information, not a verdict.',
    'You are safe in this moment.',
    'You can handle what comes next.',
  ],
  burnout: [
    'Rest is productive.',
    'You don\'t have to earn your right to rest.',
    'Your worth is not measured by productivity.',
    'Taking care of yourself is taking care of others.',
    'It\'s okay to slow down.',
  ],
  grief: [
    'Your feelings are valid.',
    'Grief is love with nowhere to go.',
    'There is no timeline for healing.',
    'It\'s okay to not be okay.',
    'You are allowed to feel this deeply.',
  ],
};

/**
 * Helper function to get a random affirmation for a category
 */
export function getNurtureAffirmation(category: keyof AffirmationLibrary): string {
  const affirmations = NURTURE_AFFIRMATIONS[category];
  return affirmations[Math.floor(Math.random() * affirmations.length)];
}
