/**
 * ENCOURAGEMENT & GUIDANCE GENERATION
 * 
 * Provides personalized encouragement, counseling guidance, and goal suggestions.
 * Supports therapy integration with value-based reflection and emotional support.
 */

import { ValueItem, GoalFrequency, LCSWConfig } from "../types";
import { initializeModels, getCounselingCoachModel, getIsModelLoading } from "./models";
import { detectCrisis, getCrisisResponse } from "./crisis";

/**
 * Fallback guidance generator (used when models aren't available)
 */
function generateFallbackGuidance(value: ValueItem, mood: string, reflection: string): string {
  const moodContext = {
    '🌱': 'growth and adaptation',
    '🔥': 'momentum and action',
    '✨': 'alignment and flow',
    '🧗': 'challenge and resilience'
  }[mood] || 'your journey';

  return `Your focus on ${value.name} during this time of ${moodContext} shows self-awareness. Consider how this reflection connects to what you've discussed with your LCSW. What small step can you take today that aligns with your treatment plan?`;
}

/**
 * Fallback reflection analysis using rule-based approach
 */
function generateFallbackReflectionAnalysis(
  reflection: string,
  frequency: GoalFrequency,
  lcswConfig?: LCSWConfig
): string {
  const lowerReflection = reflection.toLowerCase();
  
  // Detect themes
  const themes: string[] = [];
  if (lowerReflection.includes('anxious') || lowerReflection.includes('worried') || lowerReflection.includes('stress')) {
    themes.push('Anxiety/Stress');
  }
  if (lowerReflection.includes('sad') || lowerReflection.includes('down') || lowerReflection.includes('depressed')) {
    themes.push('Mood/Low Energy');
  }
  if (lowerReflection.includes('work') || lowerReflection.includes('job') || lowerReflection.includes('colleague')) {
    themes.push('Work Environment');
  }
  if (lowerReflection.includes('family') || lowerReflection.includes('relationship') || lowerReflection.includes('friend')) {
    themes.push('Interpersonal Relationships');
  }
  if (lowerReflection.includes('sleep') || lowerReflection.includes('tired') || lowerReflection.includes('exhausted')) {
    themes.push('Physical Well-being');
  }
  if (themes.length === 0) {
    themes.push('Self-Reflection', 'Personal Growth');
  }

  // Environment connections
  let environmentNote = '';
  if (lowerReflection.includes('work') || lowerReflection.includes('office')) {
    environmentNote = 'Your work environment appears to be influencing your mental state. Notice how your physical space and work relationships impact your internal experience.';
  } else if (lowerReflection.includes('home') || lowerReflection.includes('house')) {
    environmentNote = 'Your home environment seems significant in this reflection. Consider how your physical space and home relationships affect your well-being.';
  } else {
    environmentNote = 'Consider how your environment—whether work, home, or social spaces—connects to what you\'re experiencing internally.';
  }

  // Generate questions
  const questions = [
    `What specific coping mechanism did you use (or could you use) in response to what you observed?`,
    `How might advocating for yourself in this situation look different than what you've done before?`
  ];

  // Session prep
  const frequencyLabel = frequency === 'quarterly' ? 'monthly' : frequency;
  const sessionPrep = themes.length > 0 
    ? `Bring the theme of "${themes[0]}" to your next session. Consider discussing how your environment and coping strategies are working (or not working) for you right now.`
    : `Focus on discussing your reflection about ${frequencyLabel} patterns with your therapist. Consider what you want to explore more deeply.`;

  return `## Core Themes
${themes.slice(0, 3).map(t => `- ${t}`).join('\n')}

## The 'LCSW Lens'
${environmentNote}

## Reflective Inquiry
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

## Session Prep
${sessionPrep}`;
}

/**
 * Analyze reflection with LCSW-focused lens
 * Provides: Core Themes, LCSW Lens, Reflective Inquiry, Session Prep
 */
export async function analyzeReflection(
  reflection: string,
  frequency: GoalFrequency,
  lcswConfig?: LCSWConfig
): Promise<string> {
  try {
    // Check for crisis first
    const crisisCheck = detectCrisis(reflection, lcswConfig);
    if (crisisCheck.isCrisis) {
      return getCrisisResponse(crisisCheck, lcswConfig);
    }

    if (!reflection.trim()) {
      return 'Please enter your reflection to receive analysis.';
    }

    const protocols = lcswConfig?.protocols || [];
    const protocolContext = protocols.length > 0 
      ? `The user is working with an LCSW using ${protocols.join(', ')} protocols.`
      : 'The user is working with a licensed clinical social worker.';

    const frequencyLabel = frequency === 'quarterly' ? 'monthly' : frequency;
    const prompt = `I am providing a deep reflection of my ${frequencyLabel} below under the heading [Observation].

Acting as a supportive and insightful reflective partner, please analyze my notes and provide the following:

**Core Themes**: Identify 2–3 recurring emotional or situational themes you notice in my reflection.

**The 'LCSW Lens'**: Note any connections between my environment (work, relationships, physical space) and my internal mental state. Focus on social work pillars: environment, coping mechanisms, and self-advocacy.

**Reflective Inquiry**: Ask me 2 'growth-oriented' questions that challenge me to look deeper into a specific part of my observation.

**Session Prep**: Summarize one key takeaway or 'priority topic' I should consider bringing to my next therapy session to ensure I'm making the most of my time.

${protocolContext}

[Observation]
${reflection}

Format your response clearly with these four sections. Be supportive, insightful, and focused on helping me prepare for meaningful work in my next therapy session.`;

    // Use rule-based analysis since text-generation models are disabled
    return generateFallbackReflectionAnalysis(reflection, frequency, lcswConfig);
  } catch (error) {
    console.error('Reflection analysis error:', error);
    return generateFallbackReflectionAnalysis(reflection, frequency, lcswConfig);
  }
}

/**
 * Model B: Counseling Coach
 * Provides structured guidance, homework reminders, and psychoeducation
 * Aligned with LCSW treatment plans, not replacing them
 */
export async function generateCounselingGuidance(
  value: ValueItem,
  mood: string,
  reflection: string,
  lcswConfig?: LCSWConfig
): Promise<string> {
  try {
    // Check for crisis first
    const crisisCheck = detectCrisis(reflection, lcswConfig);
    if (crisisCheck.isCrisis) {
      return getCrisisResponse(crisisCheck, lcswConfig);
    }

    // Ensure models are loaded - wait if they're currently loading
    let counselingCoachModel = getCounselingCoachModel();
    const isModelLoading = getIsModelLoading();
    
    if (!counselingCoachModel) {
      if (isModelLoading) {
        // Wait for current load to complete (up to 30 seconds)
        const maxWaitTime = 30000;
        const startTime = Date.now();
        while (!counselingCoachModel && (Date.now() - startTime) < maxWaitTime) {
          await new Promise(resolve => setTimeout(resolve, 500));
          counselingCoachModel = getCounselingCoachModel();
        }
      } else {
        // Start loading if not already loading
        await initializeModels();
        counselingCoachModel = getCounselingCoachModel();
      }
    }

    // Build prompt aligned with LCSW integration role
    const protocols = lcswConfig?.protocols || [];
    const protocolContext = protocols.length > 0 
      ? `The user is working with an LCSW using ${protocols.join(', ')} protocols.`
      : 'The user is working with a licensed clinical social worker.';

    const prompt = `You are a supportive therapy integration assistant helping a client between sessions with their LCSW.

${protocolContext}

Your role is to:
- Help the client remember and practice what was discussed in therapy
- Provide structured reflection prompts aligned with their treatment plan
- Offer psychoeducation and coping skills (NOT diagnoses or crisis handling)
- Support value-based living and goal achievement

The client is focusing on the value: "${value.name}" (${value.description}).
Their current mood indicator: ${mood}
Their reflection: "${reflection}"

Provide a brief, warm, and structured response (2-3 sentences) that:
1. Validates their experience
2. Connects to their value
3. Suggests a small, actionable step they can take before their next session

Remember: You are supporting therapy integration, not providing therapy. Keep responses educational and supportive.`;

    // Generate response using the counseling coach model
    let response = "Your commitment to reflecting on your values is a meaningful step in your journey.";
    
    if (counselingCoachModel) {
      try {
        const result = await counselingCoachModel(prompt, {
          max_new_tokens: 150,
          temperature: 0.7,
          do_sample: true,
          top_p: 0.9
        });

        const generatedText = result[0]?.generated_text || '';
        // Extract just the assistant's response (remove the prompt)
        const extracted = generatedText.replace(prompt, '').trim();
        if (extracted) {
          response = extracted;
        }
      } catch (error) {
        console.warn('Counseling coach inference failed:', error);
        // If error suggests model type mismatch, try to reload
        if (error instanceof Error && (
          error.message.includes('not a function') ||
          error.message.includes('Cannot read') ||
          error.message.includes('is not a function')
        )) {
          console.warn('Possible model type mismatch, attempting reload...');
          await initializeModels(true); // Force reload
          const reloadedModel = getCounselingCoachModel();
          if (reloadedModel) {
            try {
              const retryResult = await reloadedModel(prompt, {
                max_new_tokens: 150,
                temperature: 0.7,
                do_sample: true,
                top_p: 0.9
              });
              const retryText = retryResult[0]?.generated_text || '';
              const retryExtracted = retryText.replace(prompt, '').trim();
              if (retryExtracted) {
                response = retryExtracted;
              }
            } catch (retryError) {
              console.warn('Retry inference failed:', retryError);
            }
          }
        }
        // Use fallback response if all attempts fail
      }
    }
    
    // Fallback: Generate rule-based response if model unavailable
    if (response === "Your commitment to reflecting on your values is a meaningful step in your journey.") {
      response = generateFallbackGuidance(value, mood, reflection);
    }
    
    return response;
  } catch (error) {
    console.error('Counseling guidance error:', error);
    // Fallback response
    return `Your focus on ${value.name} shows self-awareness. Consider discussing this reflection with your therapist in your next session.`;
  }
}

/**
 * Generate encouragement - uses counseling coach with specific prompt
 */
export async function generateEncouragement(
  value: ValueItem,
  mood: string = '✨',
  lcswConfig?: LCSWConfig
): Promise<string> {
  return generateCounselingGuidance(value, mood, '', lcswConfig);
}

/**
 * Generate encouragement based on emotional state
 * Provides personalized support and opportunities based on how the user is feeling
 */
export async function generateEmotionalEncouragement(
  emotionalState: 'drained' | 'heavy' | 'overwhelmed' | 'mixed' | 'calm' | 'hopeful' | 'positive' | 'energized',
  selectedFeeling: string | null,
  lowStateCount: number,
  lcswConfig?: LCSWConfig,
  context?: {
    recentJournalText?: string;
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
    userPatterns?: { frequentStates: string[], progress: number };
  }
): Promise<string> {
  // Import emotional states configuration
  const { getEmotionalState } = await import('../emotionalStates');
  const stateConfig = getEmotionalState(emotionalState);
  
  if (!stateConfig) {
    // Fallback if state not found
    return "You're doing important work. Keep going, one step at a time.";
  }

  const protocols = lcswConfig?.protocols || [];
  const protocolContext = protocols.length > 0 
    ? `The user is working with an LCSW using ${protocols.join(', ')} protocols.`
    : 'The user is working with a licensed clinical social worker.';

  const feelingContext = selectedFeeling ? ` They're specifically feeling ${selectedFeeling}.` : '';
  
  // Build time-of-day context
  const timeContext = context?.timeOfDay 
    ? context.timeOfDay === 'morning' 
      ? ' It is morning—a time for fresh starts and forward momentum.'
      : context.timeOfDay === 'evening' || context.timeOfDay === 'night'
      ? ' It is evening/night—a time for reflection and rest.'
      : ' It is afternoon—a time for continued engagement.'
    : '';

  // Build journal context
  const journalContext = context?.recentJournalText 
    ? ` Recent reflection: "${context.recentJournalText.substring(0, 200)}"`
    : '';

  // Build pattern context
  const patternContext = context?.userPatterns && context.userPatterns.frequentStates.length > 0
    ? ` The user has been feeling ${context.userPatterns.frequentStates.join(', ')} frequently.`
    : '';

  // Low states tracking (drained, heavy, overwhelmed)
  const isLowState = emotionalState === 'drained' || emotionalState === 'heavy' || emotionalState === 'overwhelmed';
  const isRepeated = isLowState && lowStateCount >= 3;
  const connectionPrompt = isRepeated 
    ? ' Strongly encourage them to reach out to a trusted person, their therapist, or a support line (988). Emphasize that they don\'t have to go through this alone.'
    : isLowState
    ? ' Gently suggest that connecting with someone they trust might be helpful.'
    : '';

  // Use encouragement instruction from state config
  const baseInstruction = stateConfig.encouragementPrompt.instruction;
  
  // Build dynamic prompt
  const prompt = `You are a supportive therapy integration assistant.${timeContext}${journalContext}${patternContext}

The user is feeling ${stateConfig.label.toLowerCase()}.${feelingContext}

${protocolContext}

${baseInstruction}${connectionPrompt}

Provide warm, compassionate encouragement (30-60 words, 2-3 sentences) that:
1. Acknowledges what they're experiencing
2. Helps them see possibilities and opportunities ahead
3. Offers gentle support and next steps${isRepeated ? '\n4. Strongly encourages reaching out to someone for support' : ''}

Be genuine, hopeful, and supportive. Avoid platitudes or toxic positivity.`;

  // Build fallback response based on state
  let fallbackResponse = '';
  
  if (emotionalState === 'drained') {
    fallbackResponse = `Feeling drained is real and valid. Right now might feel heavy, but there are opportunities ahead. Consider reaching out to someone you trust—you don't have to carry this alone. Small steps forward are still progress.${isRepeated ? ' Please consider reaching out to your therapist, a trusted friend, or the 988 Crisis & Suicide Lifeline. You deserve support.' : ''}`;
  } else if (emotionalState === 'heavy') {
    fallbackResponse = `Feeling heavy is understandable. These moments can feel overwhelming, but they also show your capacity to feel deeply. There are possibilities and opportunities waiting for you.${isRepeated ? ' Please consider reaching out to your therapist, a trusted friend, or a support line (988). You deserve support.' : ' Consider connecting with someone who cares about you.'}`;
  } else if (emotionalState === 'overwhelmed') {
    fallbackResponse = `Feeling overwhelmed is completely understandable when there's so much happening. Take a moment to breathe. You can break things down into smaller, manageable steps. There are opportunities ahead, and you have the capacity to navigate them.${isRepeated ? ' Consider reaching out to someone you trust for support.' : ''}`;
  } else if (emotionalState === 'mixed') {
    fallbackResponse = `Mixed feelings are completely normal and valid. This in-between space can actually be a place of growth and possibility. There are opportunities ahead, and you have the capacity to navigate them. Consider what feels most authentic to you right now.`;
  } else if (emotionalState === 'calm') {
    fallbackResponse = `It's wonderful that you're feeling calm and centered. This peaceful state is a gift—take time to appreciate it and notice what brought you here. There are opportunities to build on this sense of stability.`;
  } else if (emotionalState === 'hopeful') {
    fallbackResponse = `Feeling hopeful is a sign of resilience and possibility. This forward-looking energy is valuable—there are opportunities ahead that align with your values and goals. How can you channel this hope into meaningful action?`;
  } else if (emotionalState === 'positive') {
    fallbackResponse = `It's wonderful that you're feeling positive and grounded. This is a great time to explore opportunities and possibilities. Consider what you'd like to build on or move toward. You have momentum—how can you channel this energy in meaningful ways?`;
  } else { // energized
    fallbackResponse = `You're feeling energized and motivated—that's powerful! This is a great time to explore opportunities and take meaningful action. What possibilities are calling to you? How can you channel this energy toward what matters most to you?`;
  }

  // Try to use AI model if available
  let counselingCoachModel = getCounselingCoachModel();
  
  // If model not available, try to initialize it (with timeout)
  if (!counselingCoachModel) {
    const isModelLoading = getIsModelLoading();
    if (!isModelLoading) {
      // Try to initialize models with a timeout
      try {
        const initPromise = initializeModels();
        const timeoutPromise = new Promise<boolean>((_, reject) => 
          setTimeout(() => reject(new Error('Model initialization timeout')), 10000)
        );
        await Promise.race([initPromise, timeoutPromise]);
        counselingCoachModel = getCounselingCoachModel();
      } catch (error) {
        console.warn('Model initialization failed or timed out, using rule-based encouragement');
        // Don't wait - just use rule-based
      }
    } else {
      // Wait for current load to complete, but with shorter timeout
      // Wait up to 5 seconds for model to load (not 30)
      const maxWaitTime = 5000;
      const startTime = Date.now();
      while (!counselingCoachModel && (Date.now() - startTime) < maxWaitTime) {
        await new Promise(resolve => setTimeout(resolve, 500));
        counselingCoachModel = getCounselingCoachModel();
        // Check if loading failed
        if (!getIsModelLoading() && !counselingCoachModel) {
          // Loading completed but no model - break early
          break;
        }
      }
    }
  }
  
  if (counselingCoachModel) {
    try {
      const result = await counselingCoachModel(prompt, {
        max_new_tokens: 200,
        temperature: 0.8,
        do_sample: true,
        top_p: 0.9
      });

      const generatedText = result[0]?.generated_text || '';
      const extracted = generatedText.replace(prompt, '').trim();
      if (extracted && extracted.length > 20) {
        return extracted;
      }
    } catch (error) {
      console.warn('Emotional encouragement inference failed:', error);
      // If inference fails, check if it's because model is wrong type
      // and try to reload with correct model type
      if (error instanceof Error && (
        error.message.includes('not a function') ||
        error.message.includes('Cannot read') ||
        error.message.includes('is not a function')
      )) {
        console.warn('Model type mismatch detected, attempting to reload...');
        await initializeModels(true); // Force reload
        const reloadedModel = getCounselingCoachModel();
        if (reloadedModel) {
          try {
            const retryResult = await reloadedModel(prompt, {
              max_new_tokens: 200,
              temperature: 0.8,
              do_sample: true,
              top_p: 0.9
            });
            const retryText = retryResult[0]?.generated_text || '';
            const retryExtracted = retryText.replace(prompt, '').trim();
            if (retryExtracted && retryExtracted.length > 20) {
              return retryExtracted;
            }
          } catch (retryError) {
            console.warn('Retry inference also failed:', retryError);
          }
        }
      }
    }
  }

  // Return fallback response
  return fallbackResponse;
}

/**
 * Generate value mantra - short, memorable phrase
 */
export async function generateValueMantra(value: ValueItem): Promise<string> {
  // Simple rule-based mantras for on-device use
  const mantras: Record<string, string> = {
    'Integrity': 'Truth guides me',
    'Family': 'Love connects us',
    'Creativity': 'Ideas flow freely',
    'Health': 'Body and mind unite',
    'Freedom': 'I choose my path',
    'Justice': 'Fairness for all',
    'Kindness': 'Compassion in action',
    'Learning': 'Growth through curiosity',
    'Nature': 'Earth sustains me',
    'Peace': 'Calm within',
    'Respect': 'Dignity for all',
    'Service': 'Help others rise',
    'Spirituality': 'Connection beyond self',
    'Success': 'Progress over perfection',
    'Wealth': 'Abundance flows',
    'Wisdom': 'Insight guides',
    'Authenticity': 'Be true to self',
    'Compassion': 'Kindness in action',
    'Humor': 'Joy lightens the load',
    'Leadership': 'Guide with heart',
    'Resilience': 'Bounce back stronger',
    'Responsibility': 'Own my choices',
    'Courage': 'Face fears bravely',
    'Humility': 'Learn from all',
    'Loyalty': 'Stand by others',
    'Community': 'Together we thrive',
    'Artistry': 'Create with soul',
    'Curiosity': 'Wonder opens doors',
    'Balance': 'Harmony in motion',
    'Sustainability': 'Care for tomorrow',
    'Open-Mindedness': 'Embrace new views',
    'Impact': 'Make a difference',
    'Adventure': 'Explore boldly'
  };

  return mantras[value.name] || `Honor ${value.name} today`;
}

/**
 * Suggest goal - structured, achievable micro-action
 */
export async function suggestGoal(
  value: ValueItem,
  frequency: GoalFrequency,
  reflection: string = '',
  lcswConfig?: LCSWConfig
): Promise<string> {
  try {
    // Check for crisis
    const crisisCheck = detectCrisis(reflection, lcswConfig);
    if (crisisCheck.isCrisis) {
      return `### Safety First\n- **Description**: Contact your therapist or emergency services if you're in crisis\n- **What this helps with**: Immediate support and safety\n- **How do I measure progress**:\n  1. Reached out to a professional\n  2. Followed your safety plan\n  3. Engaged with your support network`;
    }

    let counselingCoachModel = getCounselingCoachModel();
    if (!counselingCoachModel) {
      const isModelLoading = getIsModelLoading();
      if (isModelLoading) {
        // Wait for current load (up to 30 seconds)
        const maxWaitTime = 30000;
        const startTime = Date.now();
        while (!counselingCoachModel && (Date.now() - startTime) < maxWaitTime) {
          await new Promise(resolve => setTimeout(resolve, 500));
          counselingCoachModel = getCounselingCoachModel();
        }
      } else {
        await initializeModels();
        counselingCoachModel = getCounselingCoachModel();
      }
    }

    // Check if reflection contains deep reflection and/or analysis
    const hasDeepReflection = reflection.includes('Deep Reflection:') || reflection.trim().length > 50;
    const hasAnalysis = reflection.includes('## Core Themes') || reflection.includes('## The \'LCSW Lens\'') || reflection.includes('Reflection Analysis:');
    
    const prompt = (hasDeepReflection || hasAnalysis)
      ? `Based on the following deep reflection and analysis, suggest a specific, achievable "commit to do" next step that helps the user see they have options and different approaches to their growth and success.

The user is focusing on the value: "${value.name}" (${value.description})
Frequency: ${frequency}

${reflection}

Acting as a supportive and insightful reflective partner, generate a "commit to do" next guidance that:
1. Directly addresses the specific themes, insights, and observations from their DEEP REFLECTION
2. Shows them they have OPTIONS and different approaches (not just one path forward)
3. Connects to their value: ${value.name}
4. Is actionable and achievable within the ${frequency} timeframe
5. Supports their therapy work and personal growth

The goal is to help them see multiple pathways and approaches, not just one solution. Show them options.

Format the response as:
### Structured Aim
- **Description**: [One specific action they can commit to do - show them this is ONE option among many]
- **What this helps with**: [Brief benefit related to their value and the reflection themes - emphasize this is one approach]
- **How do I measure progress**:
  1. [First milestone]
  2. [Second milestone]
  3. [Third milestone]

Keep it small, specific, and aligned with the insights from their deep reflection. Help them see they have choices.`
      : `Suggest a specific, achievable micro-goal for someone focusing on the value "${value.name}" (${value.description}).

Frequency: ${frequency}
Recent reflection: "${reflection}"

Format the response as:
### Structured Aim
- **Description**: [One specific action they can take]
- **What this helps with**: [Brief benefit related to their value]
- **How do I measure progress**:
  1. [First milestone]
  2. [Second milestone]
  3. [Third milestone]

Keep it small, specific, and aligned with therapy integration.`;

    let response = `### Structured Aim\n- **Description**: Take one small action today that aligns with ${value.name}\n- **What this helps with**: Building consistency and self-efficacy\n- **How do I measure progress**:\n  1. Identified the action\n  2. Completed the action\n  3. Reflected on the experience`;
    
    if (counselingCoachModel) {
      try {
        const result = await counselingCoachModel(prompt, {
          max_new_tokens: 200,
          temperature: 0.8,
          do_sample: true
        });

        const generatedText = result[0]?.generated_text || '';
        const extracted = generatedText.replace(prompt, '').trim();
        if (extracted) {
          response = extracted;
        }
      } catch (error) {
        console.warn('Goal suggestion inference failed:', error);
        // Try reload if model type mismatch
        if (error instanceof Error && (
          error.message.includes('not a function') ||
          error.message.includes('Cannot read')
        )) {
          await initializeModels(true);
          const reloadedModel = getCounselingCoachModel();
          if (reloadedModel) {
            try {
              const retryResult = await reloadedModel(prompt, {
                max_new_tokens: 200,
                temperature: 0.8,
                do_sample: true
              });
              const retryText = retryResult[0]?.generated_text || '';
              const retryExtracted = retryText.replace(prompt, '').trim();
              if (retryExtracted) {
                response = retryExtracted;
              }
            } catch (retryError) {
              console.warn('Retry goal suggestion failed:', retryError);
            }
          }
        }
      }
    }
    
    return response;
  } catch (error) {
    console.error('Goal suggestion error:', error);
    return `### Structured Aim\n- **Description**: Practice ${value.name} in one specific way today\n- **What this helps with**: Building value-aligned habits\n- **How do I measure progress**:\n  1. Planned the action\n  2. Took the action\n  3. Noted the outcome`;
  }
}

