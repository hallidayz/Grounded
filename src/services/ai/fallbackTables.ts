import { EmotionalState } from '../emotionalStates';
import { GoalFrequency } from '../types';

/**
 * Fallback response tables for when AI models are unavailable.
 * These tables match AI response structures exactly to ensure seamless UX.
 */

export interface EmotionalEncouragementFallback {
  [emotionalState: string]: {
    [subEmotion: string]: {
      message: string; // 30-60 words, matches EmotionalEncouragementResponse
      acknowledgeFeeling: string;
      actionableStep?: string;
    };
    default: {
      message: string;
      acknowledgeFeeling: string;
      actionableStep?: string;
    };
  };
  default: {
    message: string;
    acknowledgeFeeling: string;
    actionableStep?: string;
  };
}

export interface FocusLensFallback {
  [emotionalState: string]: {
    [valueCategory: string]: string; // Focus lens text
    default: string;
  };
  default: string;
}

export interface ReflectionAnalysisFallback {
  [emotionalState: string]: {
    coreThemes: string[];
    lcswLens: string;
    reflectiveInquiry: string[];
    sessionPrep: string;
  };
  default: {
    coreThemes: string[];
    lcswLens: string;
    reflectiveInquiry: string[];
    sessionPrep: string;
  };
}

export interface GoalSuggestionFallback {
  [valueCategory: string]: {
    [frequency: string]: {
      description: string;
      whatThisHelpsWith: string;
      howToMeasureProgress: string[];
      inferenceAnalysis: string;
      lcsmInferences: {
        encouragement: string;
        guidance: string;
      };
    };
  };
  default: {
    description: string;
    whatThisHelpsWith: string;
    howToMeasureProgress: string[];
    inferenceAnalysis: string;
    lcsmInferences: {
      encouragement: string;
      guidance: string;
    };
  };
}

// Emotional Encouragement Fallback Table
export const emotionalEncouragementFallbacks: EmotionalEncouragementFallback = {
  drained: {
    exhausted: {
      message: "Feeling exhausted is completely valid. Your body and mind are telling you something important. Rest isn't weakness—it's necessary for recovery. Consider what small act of self-care you can do right now, even if it's just five minutes of quiet.",
      acknowledgeFeeling: "I hear that you're feeling exhausted.",
      actionableStep: "Take five minutes to sit quietly or do something gentle that brings you comfort."
    },
    depleted: {
      message: "When you feel depleted, it's a sign you've been giving a lot. Your energy is a finite resource, and it's okay to need time to recharge. What's one small thing you can do to restore yourself, even slightly?",
      acknowledgeFeeling: "I understand you're feeling depleted.",
      actionableStep: "Identify one small act of restoration you can do today."
    },
    default: {
      message: "Feeling drained is your body's way of saying you need rest. It's okay to slow down and take care of yourself. What's one small thing that would help you feel a bit more restored?",
      acknowledgeFeeling: "I hear that you're feeling drained.",
      actionableStep: "Choose one small act of self-care you can do right now."
    }
  },
  heavy: {
    burdened: {
      message: "Carrying a heavy burden is exhausting, and you don't have to carry it alone. Your feelings are valid, and it's okay to ask for support. What's one thing that feels lighter when you share it with someone you trust?",
      acknowledgeFeeling: "I understand you're feeling burdened.",
      actionableStep: "Consider sharing your burden with someone supportive."
    },
    weighed_down: {
      message: "When you feel weighed down, it can be hard to see a way forward. Remember that feelings are temporary, even when they don't feel that way. What's one small step you can take to lighten the load, even just a little?",
      acknowledgeFeeling: "I hear that you're feeling weighed down.",
      actionableStep: "Identify one small action that might help lighten your load."
    },
    default: {
      message: "Heavy feelings are difficult to carry, and you don't have to carry them alone. It's okay to feel this way, and it's also okay to seek support. What would help you feel even slightly lighter?",
      acknowledgeFeeling: "I understand you're feeling heavy.",
      actionableStep: "Consider what support or action might help lighten your load."
    }
  },
  overwhelmed: {
    flooded: {
      message: "When you feel flooded, everything can seem too much at once. It's okay to step back and take things one moment at a time. What's one thing you can focus on right now, just for this moment?",
      acknowledgeFeeling: "I hear that you're feeling flooded.",
      actionableStep: "Focus on just one thing in this moment."
    },
    swamped: {
      message: "Feeling swamped means you're dealing with a lot. It's okay to feel this way, and it's also okay to prioritize. What's the most important thing you need to address right now?",
      acknowledgeFeeling: "I understand you're feeling swamped.",
      actionableStep: "Identify the most important priority right now."
    },
    default: {
      message: "Overwhelm is your body's way of saying there's too much happening at once. It's okay to slow down and focus on one thing at a time. What's one small step you can take right now?",
      acknowledgeFeeling: "I hear that you're feeling overwhelmed.",
      actionableStep: "Choose one small action to focus on."
    }
  },
  calm: {
    peaceful: {
      message: "Feeling peaceful is a gift. This is a moment to appreciate and savor. How can you extend this sense of calm into the rest of your day?",
      acknowledgeFeeling: "I'm glad you're feeling peaceful.",
      actionableStep: "Consider how to carry this peace forward."
    },
    centered: {
      message: "When you feel centered, you're in a good place to make decisions and take action. This is a powerful state. What would you like to focus on while you're feeling this way?",
      acknowledgeFeeling: "I hear that you're feeling centered.",
      actionableStep: "Use this centered feeling to focus on what matters."
    },
    default: {
      message: "Calm is a valuable state. It's a good time to reflect, plan, or simply be present. What feels most important to you right now?",
      acknowledgeFeeling: "I'm glad you're feeling calm.",
      actionableStep: "Use this calm to focus on what matters to you."
    }
  },
  hopeful: {
    optimistic: {
      message: "Feeling optimistic is wonderful. This positive energy can fuel your actions and decisions. What would you like to channel this optimism toward?",
      acknowledgeFeeling: "I'm glad you're feeling optimistic.",
      actionableStep: "Channel this optimism into action."
    },
    encouraged: {
      message: "When you feel encouraged, you're in a great position to move forward. This feeling can help you take steps toward your goals. What feels possible right now?",
      acknowledgeFeeling: "I hear that you're feeling encouraged.",
      actionableStep: "Use this encouragement to take a step forward."
    },
    default: {
      message: "Hope is a powerful feeling. It can help you see possibilities and take action. What feels possible or important to you right now?",
      acknowledgeFeeling: "I'm glad you're feeling hopeful.",
      actionableStep: "Use this hope to identify what feels possible."
    }
  },
  positive: {
    uplifted: {
      message: "Feeling uplifted is wonderful. This positive energy can help you accomplish things and connect with others. How can you use this feeling to move forward?",
      acknowledgeFeeling: "I'm glad you're feeling uplifted.",
      actionableStep: "Use this positive energy to take action."
    },
    energized: {
      message: "When you feel energized, you have the momentum to make things happen. This is a great time to take action on things that matter to you. What would you like to focus on?",
      acknowledgeFeeling: "I hear that you're feeling energized.",
      actionableStep: "Channel this energy into something meaningful."
    },
    default: {
      message: "Positive feelings are valuable. They can help you connect, create, and move forward. What feels important or possible to you right now?",
      acknowledgeFeeling: "I'm glad you're feeling positive.",
      actionableStep: "Use this positive feeling to take action."
    }
  },
  energized: {
    motivated: {
      message: "Feeling motivated is powerful. This drive can help you accomplish things that matter to you. What would you like to channel this motivation toward?",
      acknowledgeFeeling: "I hear that you're feeling motivated.",
      actionableStep: "Use this motivation to take action on what matters."
    },
    invigorated: {
      message: "When you feel invigorated, you have energy to spare. This is a great time to tackle challenges or pursue goals. What feels most important to focus on?",
      acknowledgeFeeling: "I'm glad you're feeling invigorated.",
      actionableStep: "Channel this energy into something meaningful."
    },
    default: {
      message: "Energy is a valuable resource. When you feel energized, you can accomplish a lot. What would you like to focus this energy on?",
      acknowledgeFeeling: "I hear that you're feeling energized.",
      actionableStep: "Use this energy to take action on what matters."
    }
  },
  mixed: {
    default: {
      message: "Mixed feelings are completely normal. It's okay to feel multiple things at once. What's one thing that feels clear or important to you right now?",
      acknowledgeFeeling: "I understand you're feeling mixed emotions.",
      actionableStep: "Identify one thing that feels clear or important."
    }
  },
  default: {
    message: "Your feelings are valid, and it's okay to feel whatever you're feeling. What's one small thing you can do to take care of yourself right now?",
    acknowledgeFeeling: "I hear you.",
    actionableStep: "Choose one small act of self-care."
  }
};

// Focus Lens Fallback Table
export const focusLensFallbacks: FocusLensFallback = {
  drained: {
    'Personal Growth': "When you're drained, focus on restoration. Small acts of self-care can help you recharge. What's one thing that helps you feel restored?",
    'Relationships': "Feeling drained can make relationships feel harder. It's okay to communicate your needs and set boundaries. How can you care for yourself while staying connected?",
    'Career': "When you're drained, work can feel overwhelming. Consider what boundaries or adjustments might help you maintain your energy. What's one small change you could make?",
    default: "When you're drained, focus on restoration and self-care. What's one small thing that helps you recharge?"
  },
  heavy: {
    'Personal Growth': "Heavy feelings can be part of growth. It's okay to feel this way, and it's also okay to seek support. What would help you feel lighter?",
    'Relationships': "Heavy feelings can affect how you connect with others. It's okay to communicate your needs and ask for support. Who can you reach out to?",
    'Career': "When you feel heavy, work can feel harder. Consider what support or adjustments might help. What's one thing that could lighten your load?",
    default: "Heavy feelings are difficult. It's okay to feel this way, and it's also okay to seek support. What would help you feel lighter?"
  },
  overwhelmed: {
    'Personal Growth': "Overwhelm can be part of growth. It's okay to slow down and focus on one thing at a time. What's the most important thing to focus on right now?",
    'Relationships': "When you're overwhelmed, relationships can feel like too much. It's okay to communicate your needs and take space. What boundaries would help?",
    'Career': "Overwhelm at work is common. Consider what priorities matter most and what can wait. What's one thing you can focus on right now?",
    default: "When you're overwhelmed, focus on one thing at a time. What's the most important thing to address right now?"
  },
  calm: {
    'Personal Growth': "Calm is a great state for reflection and planning. What would you like to focus on or work toward?",
    'Relationships': "When you feel calm, you can connect more easily with others. How can you use this feeling to strengthen your relationships?",
    'Career': "Calm can help you make clear decisions and take effective action. What would you like to focus on at work?",
    default: "Calm is valuable. Use this feeling to focus on what matters to you."
  },
  hopeful: {
    'Personal Growth': "Hope can fuel growth. What possibilities feel open to you right now?",
    'Relationships': "When you feel hopeful, you can connect more positively with others. How can you use this feeling in your relationships?",
    'Career': "Hope can help you see possibilities at work. What feels possible or important to focus on?",
    default: "Hope is powerful. Use this feeling to see possibilities and take action."
  },
  positive: {
    'Personal Growth': "Positive feelings can support growth. What would you like to focus on or work toward?",
    'Relationships': "When you feel positive, you can connect more easily with others. How can you use this feeling in your relationships?",
    'Career': "Positive feelings can help you accomplish things at work. What would you like to focus on?",
    default: "Positive feelings are valuable. Use them to take action on what matters."
  },
  energized: {
    'Personal Growth': "Energy can fuel growth. What would you like to channel this energy toward?",
    'Relationships': "When you feel energized, you can connect more actively with others. How can you use this energy in your relationships?",
    'Career': "Energy can help you accomplish things at work. What would you like to focus on?",
    default: "Energy is valuable. Use it to take action on what matters."
  },
  mixed: {
    default: "Mixed feelings are normal. Focus on what feels clear or important to you right now."
  },
  default: "Focus on what matters to you right now. What's one thing you can do to take care of yourself or move forward?"
};

// Reflection Analysis Fallback Table
export const reflectionAnalysisFallbacks: ReflectionAnalysisFallback = {
  drained: {
    coreThemes: ['Exhaustion', 'Need for rest', 'Self-care'],
    lcswLens: "Feeling drained often relates to giving too much without enough restoration. Consider what boundaries or self-care practices might help you maintain your energy.",
    reflectiveInquiry: [
      "What activities or situations tend to drain your energy?",
      "What helps you feel restored or recharged?"
    ],
    sessionPrep: "Focus on identifying sources of exhaustion and strategies for restoration and self-care."
  },
  heavy: {
    coreThemes: ['Emotional weight', 'Burden', 'Need for support'],
    lcswLens: "Heavy feelings often relate to carrying too much alone. Consider what support or sharing might help lighten your load.",
    reflectiveInquiry: [
      "What feels heaviest for you right now?",
      "Who or what helps you feel supported or lighter?"
    ],
    sessionPrep: "Focus on identifying sources of heaviness and strategies for support and lightening the load."
  },
  overwhelmed: {
    coreThemes: ['Too much at once', 'Prioritization', 'Boundaries'],
    lcswLens: "Overwhelm often relates to taking on too much or not having clear priorities. Consider what boundaries or prioritization might help.",
    reflectiveInquiry: [
      "What feels most overwhelming right now?",
      "What priorities matter most, and what can wait?"
    ],
    sessionPrep: "Focus on identifying sources of overwhelm and strategies for prioritization and boundaries."
  },
  calm: {
    coreThemes: ['Peace', 'Clarity', 'Presence'],
    lcswLens: "Calm is a valuable state for reflection and planning. Consider how to use this feeling to move forward.",
    reflectiveInquiry: [
      "What feels clear or important to you right now?",
      "How can you use this calm to support your growth?"
    ],
    sessionPrep: "Focus on using this calm state for reflection, planning, or taking meaningful action."
  },
  hopeful: {
    coreThemes: ['Optimism', 'Possibility', 'Forward movement'],
    lcswLens: "Hope can fuel action and growth. Consider what possibilities feel open and what steps you might take.",
    reflectiveInquiry: [
      "What feels possible or important to you right now?",
      "What steps can you take to move toward what matters?"
    ],
    sessionPrep: "Focus on identifying possibilities and taking steps toward what matters to you."
  },
  positive: {
    coreThemes: ['Positive energy', 'Connection', 'Action'],
    lcswLens: "Positive feelings can support connection and action. Consider how to use this energy to move forward.",
    reflectiveInquiry: [
      "What feels important or possible to you right now?",
      "How can you use this positive energy to take action?"
    ],
    sessionPrep: "Focus on using this positive energy to connect, create, or take action on what matters."
  },
  energized: {
    coreThemes: ['Energy', 'Motivation', 'Action'],
    lcswLens: "Energy is a valuable resource. Consider how to channel this feeling toward what matters to you.",
    reflectiveInquiry: [
      "What would you like to focus this energy on?",
      "What steps can you take to move toward what matters?"
    ],
    sessionPrep: "Focus on channeling this energy into meaningful action or connection."
  },
  mixed: {
    coreThemes: ['Complex feelings', 'Multiple emotions', 'Clarity'],
    lcswLens: "Mixed feelings are normal and valid. Consider what feels clear or important to you right now.",
    reflectiveInquiry: [
      "What feels most clear or important to you right now?",
      "What would help you feel more clarity or direction?"
    ],
    sessionPrep: "Focus on identifying what feels clear or important and what steps might help."
  },
  default: {
    coreThemes: ['Self-awareness', 'Growth', 'Support'],
    lcswLens: "Your feelings are valid. Consider what support or action might help you move forward.",
    reflectiveInquiry: [
      "What feels most important to you right now?",
      "What would help you feel supported or move forward?"
    ],
    sessionPrep: "Focus on identifying what matters and what steps might help."
  }
};

// Goal Suggestion Fallback Table
export const goalSuggestionFallbacks: GoalSuggestionFallback = {
  'Personal Growth': {
    daily: {
      description: "Spend 10 minutes each day reflecting on your values and how you're living them.",
      whatThisHelpsWith: "This helps you stay connected to what matters and track your growth over time.",
      howToMeasureProgress: [
        "Set a daily reminder to reflect",
        "Write down one way you lived your values each day",
        "Review your reflections weekly to see patterns"
      ],
      inferenceAnalysis: "Daily reflection helps you stay connected to your values and notice patterns in how you're growing.",
      lcsmInferences: {
        encouragement: "You're taking an important step toward growth by committing to daily reflection.",
        guidance: "Start small with just 10 minutes. You can always increase the time as it becomes a habit."
      }
    },
    weekly: {
      description: "Set aside time each week to review your progress and adjust your goals.",
      whatThisHelpsWith: "This helps you stay on track and make adjustments as needed.",
      howToMeasureProgress: [
        "Schedule a weekly review time",
        "Reflect on what went well and what you'd like to change",
        "Adjust your goals based on your progress"
      ],
      inferenceAnalysis: "Weekly reviews help you stay connected to your goals and make adjustments as you grow.",
      lcsmInferences: {
        encouragement: "You're showing commitment to your growth by setting aside time for weekly review.",
        guidance: "Choose a consistent day and time for your review. This helps make it a habit."
      }
    },
    monthly: {
      description: "Take time each month to reflect on your overall progress and set new intentions.",
      whatThisHelpsWith: "This helps you see the bigger picture and make meaningful adjustments.",
      howToMeasureProgress: [
        "Schedule a monthly reflection time",
        "Review your progress over the past month",
        "Set intentions for the month ahead"
      ],
      inferenceAnalysis: "Monthly reflection helps you see patterns and make meaningful adjustments to support your growth.",
      lcsmInferences: {
        encouragement: "You're investing in your growth by committing to monthly reflection.",
        guidance: "Use this time to celebrate your progress and identify areas where you'd like to grow."
      }
    }
  },
  'Relationships': {
    daily: {
      description: "Reach out to one person each day to connect or check in.",
      whatThisHelpsWith: "This helps you maintain and strengthen your relationships.",
      howToMeasureProgress: [
        "Set a daily reminder to reach out",
        "Send a message, make a call, or spend time together",
        "Notice how these connections make you feel"
      ],
      inferenceAnalysis: "Daily connection helps you maintain and strengthen your relationships over time.",
      lcsmInferences: {
        encouragement: "You're investing in your relationships by committing to daily connection.",
        guidance: "Start small. Even a brief message or call can strengthen your connections."
      }
    },
    weekly: {
      description: "Set aside time each week to connect meaningfully with someone important to you.",
      whatThisHelpsWith: "This helps you deepen your relationships and feel more connected.",
      howToMeasureProgress: [
        "Schedule a weekly connection time",
        "Choose someone you'd like to connect with",
        "Focus on being present and listening"
      ],
      inferenceAnalysis: "Weekly meaningful connection helps you deepen your relationships and feel more supported.",
      lcsmInferences: {
        encouragement: "You're prioritizing your relationships by setting aside time for meaningful connection.",
        guidance: "Choose activities that allow for real conversation and connection, not just surface-level interaction."
      }
    },
    monthly: {
      description: "Plan a monthly activity or gathering with people who matter to you.",
      whatThisHelpsWith: "This helps you maintain your social connections and create positive memories.",
      howToMeasureProgress: [
        "Plan one monthly social activity",
        "Invite people who matter to you",
        "Reflect on how these connections make you feel"
      ],
      inferenceAnalysis: "Monthly social activities help you maintain your relationships and create positive experiences.",
      lcsmInferences: {
        encouragement: "You're investing in your relationships by planning regular social activities.",
        guidance: "Choose activities that everyone can enjoy and that allow for real connection."
      }
    }
  },
  'Career': {
    daily: {
      description: "Spend 15 minutes each day on professional development or skill-building.",
      whatThisHelpsWith: "This helps you grow in your career and feel more confident.",
      howToMeasureProgress: [
        "Set a daily reminder for professional development",
        "Choose what to focus on (learning, skill-building, networking)",
        "Track your progress over time"
      ],
      inferenceAnalysis: "Daily professional development helps you grow in your career and build confidence.",
      lcsmInferences: {
        encouragement: "You're investing in your career by committing to daily professional development.",
        guidance: "Start small with just 15 minutes. You can increase the time as it becomes a habit."
      }
    },
    weekly: {
      description: "Set aside time each week to review your career goals and progress.",
      whatThisHelpsWith: "This helps you stay on track and make adjustments as needed.",
      howToMeasureProgress: [
        "Schedule a weekly career review time",
        "Reflect on your progress and challenges",
        "Adjust your goals based on your review"
      ],
      inferenceAnalysis: "Weekly career reviews help you stay connected to your goals and make meaningful adjustments.",
      lcsmInferences: {
        encouragement: "You're showing commitment to your career by setting aside time for weekly review.",
        guidance: "Use this time to celebrate your progress and identify areas where you'd like to grow."
      }
    },
    monthly: {
      description: "Take time each month to reflect on your career direction and set new goals.",
      whatThisHelpsWith: "This helps you see the bigger picture and make strategic decisions.",
      howToMeasureProgress: [
        "Schedule a monthly career reflection time",
        "Review your progress and direction",
        "Set goals for the month ahead"
      ],
      inferenceAnalysis: "Monthly career reflection helps you see patterns and make strategic decisions about your direction.",
      lcsmInferences: {
        encouragement: "You're investing in your career by committing to monthly reflection.",
        guidance: "Use this time to assess your direction and make adjustments that align with your values."
      }
    }
  },
  default: {
    description: "Set aside time regularly to reflect on your values and how you're living them.",
    whatThisHelpsWith: "This helps you stay connected to what matters and track your progress.",
    howToMeasureProgress: [
      "Set a regular time for reflection",
      "Write down your thoughts and observations",
      "Review your reflections periodically to see patterns"
    ],
    inferenceAnalysis: "Regular reflection helps you stay connected to your values and notice patterns in your growth.",
    lcsmInferences: {
      encouragement: "You're taking an important step by committing to regular reflection.",
      guidance: "Start with a frequency that feels manageable. You can always adjust as needed."
    }
  }
};

/**
 * Get fallback response from table with fallback logic
 */
export function getFallbackResponse<T>(
  table: any,
  context: {
    emotionalState?: string;
    subEmotion?: string | null;
    valueCategory?: string;
    frequency?: GoalFrequency;
  },
  defaultResponse: T
): T {
  // Try exact match (emotion + sub-emotion + value)
  if (context.emotionalState && context.subEmotion && context.valueCategory) {
    const stateEntry = table[context.emotionalState];
    if (stateEntry && stateEntry[context.subEmotion] && stateEntry[context.subEmotion][context.valueCategory]) {
      return stateEntry[context.subEmotion][context.valueCategory];
    }
  }
  
  // Try partial match (emotion + sub-emotion)
  if (context.emotionalState && context.subEmotion) {
    const stateEntry = table[context.emotionalState];
    if (stateEntry && stateEntry[context.subEmotion] && stateEntry[context.subEmotion].default) {
      return stateEntry[context.subEmotion].default;
    }
  }
  
  // Try emotion-only match
  if (context.emotionalState) {
    const stateEntry = table[context.emotionalState];
    if (stateEntry && stateEntry.default) {
      return stateEntry.default;
    }
  }
  
  // Use default
  return defaultResponse;
}

