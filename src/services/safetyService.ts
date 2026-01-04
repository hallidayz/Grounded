// src/services/safetyService.ts

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

/**
 * Checks user input for crisis-related keywords.
 * If a match is found, returns a standardized crisis response object.
 * Otherwise, returns null.
 * @param text The user's input text.
 * @returns A CrisisResponse object or null.
 */
export function checkForCrisisKeywords(text: string): CrisisResponse | null {
  if (crisisKeywords.test(text)) {
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
  return null;
}

