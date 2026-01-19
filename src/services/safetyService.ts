// src/services/safetyService.ts

import { auditUserInput } from './ai/safetyAuditor';
import { logger } from '../utils/logger';

export interface CrisisResource {
  name: string;
  // Structured contact info for creating tel: and sms: links
  contact: {
    type: 'phone' | 'text';
    number: string;
    displayText: string; // e.g., "Call or text 988"
  };
  url: string;
}

export interface CrisisResponse {
  isCrisis: true;
  message: string;
  resources: CrisisResource[];
  isDomesticViolence?: boolean; // Flag for domestic violence scenarios
}

// A list of high-risk keywords and phrases. Use regex for broader matching.
// IMPORTANT: This list should be reviewed and expanded by a mental health professional.
const crisisKeywords: RegExp = new RegExp(
  [
    'kill myself', 'k\\.m\\.s', 'suicide', 'suicidal', 'want to die',
    'end my life', 'self harm', 'self-harm', 'cutting', 'hopeless',
    'no reason to live', 'can\'t go on', 'better off dead'
  ].join('|'),
  'i' // Case-insensitive
);

// Domestic violence keywords
const domesticViolenceKeywords: RegExp = new RegExp(
  [
    'hitting me', 'scared to go home', 'domestic violence', 'abuse',
    'being controlled', 'afraid of my partner', 'partner hurts me',
    'can\'t leave', 'trapped in relationship', 'fear for my safety'
  ].join('|'),
  'i'
);

// Substance crisis keywords
const substanceCrisisKeywords: RegExp = new RegExp(
  [
    'overdose', 'took too many', 'blackout', 'too much alcohol',
    'too many pills', 'mixing drugs', 'can\'t stop using'
  ].join('|'),
  'i'
);

/**
 * Multi-layer crisis detection
 * Level 1: Hardcoded keyword check
 * Level 2: AI Safety Auditor (for metaphorical language)
 * 
 * @param text The user's input text.
 * @returns A CrisisResponse object or null.
 */
export async function checkForCrisisKeywords(text: string): Promise<CrisisResponse | null> {
  // Level 1: Hardcoded keyword check
  const lowerText = text.toLowerCase();
  
  // Check for domestic violence
  if (domesticViolenceKeywords.test(lowerText)) {
    logger.warn('[safetyService] Domestic violence detected');
    return {
      isCrisis: true,
      isDomesticViolence: true,
      message: "I'm glad you reached out. Everyone deserves to feel safe at home. If you are in danger or being controlled, help is available. This conversation is private and confidential.",
      resources: [
        {
          name: 'National Domestic Violence Hotline',
          contact: {
            type: 'phone',
            number: '18007997233',
            displayText: 'Call 1-800-799-SAFE (7233)',
          },
          url: 'https://www.thehotline.org/',
        },
        {
          name: 'Crisis Text Line',
          contact: {
            type: 'text',
            number: '741741',
            displayText: 'Text HOME to 741741',
          },
          url: 'https://www.crisistextline.org/',
        },
      ],
    };
  }
  
  // Check for substance crisis
  if (substanceCrisisKeywords.test(lowerText)) {
    logger.warn('[safetyService] Substance crisis detected');
    return {
      isCrisis: true,
      message: "It sounds like you're dealing with a substance-related crisis. Please know that help is available immediately. Your safety is the priority.",
      resources: [
        {
          name: '911 Emergency',
          contact: {
            type: 'phone',
            number: '911',
            displayText: 'Call 911',
          },
          url: '',
        },
        {
          name: 'SAMHSA National Helpline',
          contact: {
            type: 'phone',
            number: '18006624357',
            displayText: 'Call 1-800-662-HELP (4357)',
          },
          url: 'https://www.samhsa.gov/find-help/national-helpline',
        },
      ],
    };
  }
  
  // Check for general crisis keywords
  if (crisisKeywords.test(lowerText)) {
    logger.warn('[safetyService] Crisis keywords detected');
    return {
      isCrisis: true,
      message: "It sounds like you are going through a difficult time. Please know that help is available, and you are not alone. It's important to talk to someone who can support you right now.",
      resources: [
        {
          name: 'Crisis Text Line',
          contact: {
            type: 'text',
            number: '741741',
            displayText: 'Text HOME to 741741',
          },
          url: 'https://www.crisistextline.org/',
        },
        {
          name: 'National Suicide Prevention Lifeline',
          contact: {
            type: 'phone',
            number: '988',
            displayText: 'Call or text 988',
          },
          url: 'https://988lifeline.org/',
        },
      ],
    };
  }
  
  // Level 2: AI Safety Auditor (for metaphorical language)
  // Only run if keyword check passed (to avoid unnecessary AI calls)
  try {
    const auditResult = await auditUserInput(text);
    if (auditResult === 'RED') {
      logger.warn('[safetyService] Safety Auditor flagged RED');
      return {
        isCrisis: true,
        message: "I'm glad you reached out. Based on what you've shared, I want to make sure you get the support you deserve. Please reach out to one of these 24/7 confidential resources where a real person can walk with you through this.",
        resources: [
          {
            name: 'Crisis Text Line',
            contact: {
              type: 'text',
              number: '741741',
              displayText: 'Text HOME to 741741',
            },
            url: 'https://www.crisistextline.org/',
          },
          {
            name: 'National Suicide Prevention Lifeline',
            contact: {
              type: 'phone',
              number: '988',
              displayText: 'Call or text 988',
            },
            url: 'https://988lifeline.org/',
          },
        ],
      };
    }
  } catch (error) {
    logger.error('[safetyService] Error in Safety Auditor:', error);
    // If Safety Auditor fails, rely on keyword check only
  }
  
  return null;
}

