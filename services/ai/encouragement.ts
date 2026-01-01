/**
 * ENCOURAGEMENT & GUIDANCE GENERATION
 * 
 * Provides personalized encouragement, counseling guidance, and goal suggestions.
 * Supports therapy integration with value-based reflection and emotional support.
 */

import { ValueItem, GoalFrequency, LCSWConfig, ReflectionAnalysisResponse, GoalSuggestionResponse, EmotionalEncouragementResponse, CounselingGuidanceResponse } from "../../types";
import { initializeModels, getCounselingCoachModel, getIsModelLoading } from "./models";
import { detectCrisis, getCrisisResponse } from "./crisis";
import { generateCacheKey, getCachedResponse, setCachedResponse, shouldInvalidateCache } from "./cache";

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
 * Format JSON reflection analysis to markdown (temporary for backward compatibility)
 */
function formatReflectionAnalysisJSON(json: ReflectionAnalysisResponse): string {
  return `## Core Themes
${json.coreThemes.map(t => `- ${t}`).join('\n')}

## The 'LCSW Lens'
${json.lcswLens}

## Reflective Inquiry
${json.reflectiveInquiry.map((q, i) => `${i + 1}. ${q}`).join('\n')}

## Session Prep
${json.sessionPrep}`;
}

/**
 * Format JSON goal suggestion to markdown (temporary for backward compatibility)
 */
function formatGoalSuggestionJSON(json: GoalSuggestionResponse): string {
  return `### Structured Aim
- **Description**: ${json.description}
- **What this helps with**: ${json.whatThisHelpsWith}
- **How do I measure progress**:
${json.howToMeasureProgress.map((step, i) => `  ${i + 1}. ${step}`).join('\n')}`;
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
  lcswConfig?: LCSWConfig,
  emotionalState?: string | null,
  selectedFeeling?: string | null
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
    
    // Check cache first
    const cacheKey = generateCacheKey(
      reflection,
      emotionalState || null,
      selectedFeeling || null,
      frequency,
      protocols
    );
    
    const cached = await getCachedResponse(cacheKey);
    if (cached?.reflectionAnalysis) {
      console.log('✅ Using cached reflection analysis');
      return cached.reflectionAnalysis;
    }

    const protocolContext = protocols.length > 0 
      ? `The user is working with an LCSW using ${protocols.join(', ')} protocols.`
      : 'The user is working with a licensed clinical social worker.';

    const frequencyLabel = frequency === 'quarterly' ? 'monthly' : frequency;
    
    // Optimized JSON prompt for on-device LLM
    const prompt = `Analyze this ${frequencyLabel} reflection and return ONLY valid JSON (no markdown, no extra text):

{
  "coreThemes": ["theme1", "theme2", "theme3"],
  "lcswLens": "environment/internal state connections text",
  "reflectiveInquiry": ["question1", "question2"],
  "sessionPrep": "key takeaway text"
}

Context: ${protocolContext}

Reflection:
${reflection}

Return valid JSON only.`;

    // Try to get AI model for JSON response
    let counselingCoachModel = getCounselingCoachModel();
    if (!counselingCoachModel) {
      const isModelLoading = getIsModelLoading();
      if (isModelLoading) {
        const maxWaitTime = 10000; // Shorter timeout for analysis
        const startTime = Date.now();
        while (!counselingCoachModel && (Date.now() - startTime) < maxWaitTime) {
          await new Promise(resolve => setTimeout(resolve, 500));
          counselingCoachModel = getCounselingCoachModel();
        }
      } else {
        try {
          await initializeModels();
          counselingCoachModel = getCounselingCoachModel();
        } catch (error) {
          console.warn('Model initialization failed for reflection analysis');
        }
      }
    }

    if (counselingCoachModel) {
      try {
        console.log('🤖 Calling AI model for reflection analysis (JSON)...');
        const result = await counselingCoachModel(prompt, {
          max_new_tokens: 300,
          temperature: 0.7,
          do_sample: true
        });

        const generatedText = result[0]?.generated_text || '';
        const extracted = generatedText.replace(prompt, '').trim();
        
        // Try to parse JSON from response
        const jsonMatch = extracted.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const jsonResponse: ReflectionAnalysisResponse = JSON.parse(jsonMatch[0]);
            console.log('✅ AI-generated JSON reflection analysis received');
            // Format JSON to markdown for backward compatibility (React will handle formatting later)
            return formatReflectionAnalysisJSON(jsonResponse);
          } catch (parseError) {
            console.warn('Failed to parse JSON response, using fallback');
          }
        }
      } catch (error) {
        console.warn('AI reflection analysis failed:', error);
      }
    }
    
    // Fallback to rule-based
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
    let usedAI = false;
    
    if (counselingCoachModel) {
      try {
        console.log('🤖 Using on-device AI model for counseling guidance...');
        const startTime = performance.now();
        const result = await counselingCoachModel(prompt, {
          max_new_tokens: 150,
          temperature: 0.7,
          do_sample: true,
          top_p: 0.9
        });
        const endTime = performance.now();

        const generatedText = result[0]?.generated_text || '';
        // Extract just the assistant's response (remove the prompt)
        const extracted = generatedText.replace(prompt, '').trim();
        if (extracted && extracted.length > 20) {
          response = extracted;
          usedAI = true;
          console.log(`✅ On-device AI generated response (${Math.round(endTime - startTime)}ms)`);
        } else {
          console.warn('⚠️ AI model returned empty or too short response, using fallback');
        }
      } catch (error) {
        console.error('❌ On-device AI inference failed:', error);
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
      console.log('ℹ️ Using rule-based fallback (AI model not available or failed)');
      response = generateFallbackGuidance(value, mood, reflection);
    } else if (usedAI) {
      console.log('✅ Successfully used on-device AI for counseling guidance');
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
  
  // Check cache first
  const cacheKey = generateCacheKey(
    `${emotionalState}|${selectedFeeling}|${lowStateCount}|${context?.timeOfDay || ''}|${context?.recentJournalText?.substring(0, 50) || ''}`,
    emotionalState,
    selectedFeeling,
    'daily', // Encouragement doesn't use frequency, but cache key needs it
    protocols
  );
  
  const cached = await getCachedResponse(cacheKey);
  if (cached?.encouragement) {
    console.log('✅ Using cached encouragement');
    return cached.encouragement;
  }

  const protocolContext = protocols.length > 0 
    ? `The user is working with an LCSW using ${protocols.join(', ')} protocols.`
    : 'The user is working with a licensed clinical social worker.';

  // Make the selected feeling prominent in the prompt
  const feelingContext = selectedFeeling 
    ? ` The user has specifically selected the feeling: "${selectedFeeling}". This is the primary feeling they want support with.` 
    : '';
  
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
  
  // Build evidence-based recommendation context using historical patterns
  let evidenceContext = '';
  if (isRepeated && context?.userPatterns) {
    const { frequentStates, progress } = context.userPatterns;
    if (frequentStates.length > 0) {
      evidenceContext = ` Based on recent patterns, the user has been feeling ${frequentStates.join(', ')} frequently (${lowStateCount} consecutive times).`;
    }
    if (progress !== undefined && progress < 30) {
      evidenceContext += ` Recent progress shows ${progress}% positive states, indicating ongoing challenges.`;
    }
  }
  
  const connectionPrompt = isRepeated 
    ? ` Strongly encourage them to reach out to a trusted person, their therapist, or a support line (988). Emphasize that they don't have to go through this alone.${evidenceContext}`
    : isLowState
    ? ' Gently suggest that connecting with someone they trust might be helpful.'
    : '';

  // Use encouragement instruction from state config
  const baseInstruction = stateConfig.encouragementPrompt.instruction;
  
  // Optimized JSON prompt for on-device LLM
  const prompt = `Provide encouragement and return ONLY valid JSON (no markdown, no extra text):

{
  "message": "30-60 words, 2-3 sentences of support",
  "acknowledgeFeeling": "specific feeling acknowledgment",
  "actionableStep": "optional small step"
}

Context: User is feeling ${stateConfig.label.toLowerCase()}.${feelingContext}${timeContext}${journalContext}${patternContext}
${protocolContext}

Role: ${baseInstruction}${connectionPrompt}

Requirements:
- Acknowledge: "${selectedFeeling || stateConfig.shortLabel}"
- Honest, realistic support (30-60 words)
- See possibilities without toxic positivity
- Genuine, warm, supportive${isRepeated ? '\n- Strongly encourage reaching out for support' : ''}

Return valid JSON only.`;

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
  
  // If model not available, check if we should try to initialize it
  // Don't repeatedly try to initialize if it's already failed
  if (!counselingCoachModel) {
    const isModelLoading = getIsModelLoading();
    if (!isModelLoading) {
      // Only try to initialize if we haven't failed too many times recently
      // This prevents infinite loops when models can't load (e.g., in dev mode without models)
      try {
        const initPromise = initializeModels();
        const timeoutPromise = new Promise<boolean>((_, reject) => 
          setTimeout(() => reject(new Error('Model initialization timeout')), 5000) // Reduced timeout
        );
        await Promise.race([initPromise, timeoutPromise]);
        counselingCoachModel = getCounselingCoachModel();
      } catch (error) {
        // Silently fail - don't log repeatedly to avoid console spam
        // Models will be initialized in background by App.tsx
      }
    } else {
      // Wait for current load to complete, but with shorter timeout
      // Wait up to 3 seconds for model to load
      const maxWaitTime = 3000;
      const startTime = Date.now();
      while (!counselingCoachModel && (Date.now() - startTime) < maxWaitTime) {
        await new Promise(resolve => setTimeout(resolve, 300));
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
      
      // Try to parse JSON from response
      const jsonMatch = extracted.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const jsonResponse: EmotionalEncouragementResponse = JSON.parse(jsonMatch[0]);
          console.log('✅ AI-generated JSON encouragement received');
          // Return formatted message (React will handle full formatting later)
          const result = jsonResponse.message || fallbackResponse;
          // Cache the result
          await setCachedResponse(cacheKey, { encouragement: result });
          return result;
        } catch (parseError) {
          console.warn('Failed to parse JSON encouragement, using raw response');
        }
      }
      
      // If JSON parsing failed, use raw response if reasonable
      if (extracted && extracted.length > 20) {
        // Cache the raw response
        await setCachedResponse(cacheKey, { encouragement: extracted });
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
            
            // Try to parse JSON from retry
            const retryJsonMatch = retryExtracted.match(/\{[\s\S]*\}/);
            if (retryJsonMatch) {
              try {
                const retryJsonResponse: EmotionalEncouragementResponse = JSON.parse(retryJsonMatch[0]);
                console.log('✅ AI-generated JSON encouragement received after reload');
                const result = retryJsonResponse.message || fallbackResponse;
                // Cache the result
                await setCachedResponse(cacheKey, { encouragement: result });
                return result;
              } catch (parseError) {
                console.warn('Failed to parse retry JSON encouragement');
              }
            }
            
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
  lcswConfig?: LCSWConfig,
  emotionalState?: string | null,
  selectedFeeling?: string | null
): Promise<string> {
  try {
    // Check for crisis
    const crisisCheck = detectCrisis(reflection, lcswConfig);
    if (crisisCheck.isCrisis) {
      return `### Safety First\n- **Description**: Contact your therapist or emergency services if you're in crisis\n- **What this helps with**: Immediate support and safety\n- **How do I measure progress**:\n  1. Reached out to a professional\n  2. Followed your safety plan\n  3. Engaged with your support network`;
    }

    const protocols = lcswConfig?.protocols || [];
    
    // Check cache first
    const cacheKey = generateCacheKey(
      `${value.id}|${reflection}`,
      emotionalState || null,
      selectedFeeling || null,
      frequency,
      protocols
    );
    
    const cached = await getCachedResponse(cacheKey);
    if (cached?.goalSuggestion) {
      console.log('✅ Using cached goal suggestion');
      return cached.goalSuggestion;
    }

    let counselingCoachModel = getCounselingCoachModel();
    if (!counselingCoachModel) {
      console.log('🔄 AI model not loaded, initializing...');
      const isModelLoading = getIsModelLoading();
      if (isModelLoading) {
        // Wait for current load (up to 30 seconds)
        console.log('⏳ Waiting for model to finish loading...');
        const maxWaitTime = 30000;
        const startTime = Date.now();
        while (!counselingCoachModel && (Date.now() - startTime) < maxWaitTime) {
          await new Promise(resolve => setTimeout(resolve, 500));
          counselingCoachModel = getCounselingCoachModel();
        }
        if (counselingCoachModel) {
          console.log('✅ Model loaded successfully after wait');
        } else {
          console.warn('⚠️ Model loading timeout - will use fallback response');
        }
      } else {
        console.log('🚀 Starting model initialization...');
        try {
          const initialized = await initializeModels();
          counselingCoachModel = getCounselingCoachModel();
          if (counselingCoachModel) {
            console.log('✅ Model initialized successfully');
          } else {
            console.warn('⚠️ Model initialization completed but model is not available');
          }
        } catch (initError) {
          console.error('❌ Model initialization failed:', initError);
          counselingCoachModel = null;
        }
      }
    } else {
      console.log('✅ AI model already loaded and ready');
    }

    // Check if reflection contains deep reflection and/or analysis
    const hasDeepReflection = reflection.includes('Deep Reflection:') || reflection.trim().length > 50;
    const hasAnalysis = reflection.includes('## Core Themes') || reflection.includes('## The \'LCSW Lens\'') || reflection.includes('Reflection Analysis:');
    
    // Build feeling context for the prompt
    const feelingContext = emotionalState && selectedFeeling
      ? `The user's current emotional state is: ${emotionalState}\nTheir specific feeling is: ${selectedFeeling}\n\n`
      : emotionalState
      ? `The user's current emotional state is: ${emotionalState}\n\n`
      : selectedFeeling
      ? `The user's specific feeling is: ${selectedFeeling}\n\n`
      : '';
    
    // Optimized JSON prompt for on-device LLM
    const prompt = `Suggest a goal and return ONLY valid JSON (no markdown, no extra text):

{
  "description": "what they'll do",
  "whatThisHelpsWith": "why it matters",
  "howToMeasureProgress": ["step1", "step2", "step3"]
}

Value: "${value.name}" (${value.description})
Frequency: ${frequency}
${feelingContext}${hasDeepReflection || hasAnalysis ? `Reflection:\n${reflection}` : `Recent reflection: "${reflection}"`}

Requirements:
- Specific and achievable for ${frequency}
- Aligned with value "${value.name}"
${hasDeepReflection || hasAnalysis ? '- Directly addresses the reflection content' : ''}
- Supports growth and success

Return valid JSON only.`;

    // Default fallback response (only used if AI model is unavailable)
    const fallbackResponse = `### Structured Aim\n- **Description**: Take one small action today that aligns with ${value.name}\n- **What this helps with**: Building consistency and self-efficacy\n- **How do I measure progress**:\n  1. Identified the action\n  2. Completed the action\n  3. Reflected on the experience`;
    
    if (!counselingCoachModel) {
      console.warn('⚠️ AI model not available for goal suggestion - using fallback response');
      console.warn('Model status:', {
        modelAvailable: !!counselingCoachModel,
        isModelLoading: getIsModelLoading(),
        hasReflection: reflection.trim().length > 0,
        hasAnalysis: reflection.includes('Reflection Analysis:')
      });
      // Cache fallback
      await setCachedResponse(cacheKey, { goalSuggestion: fallbackResponse });
      return fallbackResponse;
    }
    
    // AI model is available - use it to generate JSON suggestion
    try {
      console.log('🤖 Calling AI model for goal suggestion (JSON)...');
      const result = await counselingCoachModel(prompt, {
        max_new_tokens: 200,
        temperature: 0.8,
        do_sample: true
      });

      const generatedText = result[0]?.generated_text || '';
      const extracted = generatedText.replace(prompt, '').trim();
      
      // Try to parse JSON from response
      const jsonMatch = extracted.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const jsonResponse: GoalSuggestionResponse = JSON.parse(jsonMatch[0]);
          console.log('✅ AI-generated JSON goal suggestion received');
          // Format JSON to markdown for backward compatibility (React will handle formatting later)
          return formatGoalSuggestionJSON(jsonResponse);
        } catch (parseError) {
          console.warn('Failed to parse JSON response, using fallback');
        }
      }
      
      // If JSON parsing failed, try to use raw response if it looks reasonable
      if (extracted && extracted.length > 20) {
        console.warn('⚠️ AI returned non-JSON response, using as-is');
        return extracted;
      } else {
        console.warn('⚠️ AI model returned empty or invalid response, using fallback');
        return fallbackResponse;
      }
    } catch (error) {
      console.error('❌ Goal suggestion inference failed:', error);
      
      // Try reload if model type mismatch
      if (error instanceof Error && (
        error.message.includes('not a function') ||
        error.message.includes('Cannot read')
      )) {
        console.log('🔄 Attempting to reload AI model...');
        try {
          await initializeModels(true);
          const reloadedModel = getCounselingCoachModel();
          if (reloadedModel) {
            console.log('✅ Model reloaded, retrying goal suggestion...');
            const retryResult = await reloadedModel(prompt, {
              max_new_tokens: 200,
              temperature: 0.8,
              do_sample: true
            });
              const retryText = retryResult[0]?.generated_text || '';
              const retryExtracted = retryText.replace(prompt, '').trim();
              
              // Try to parse JSON from retry
              const retryJsonMatch = retryExtracted.match(/\{[\s\S]*\}/);
              if (retryJsonMatch) {
                try {
                  const retryJsonResponse: GoalSuggestionResponse = JSON.parse(retryJsonMatch[0]);
                  console.log('✅ AI-generated JSON goal suggestion received after reload');
                  return formatGoalSuggestionJSON(retryJsonResponse);
                } catch (parseError) {
                  console.warn('Failed to parse retry JSON response');
                }
              }
              
              if (retryExtracted && retryExtracted.length > 20) {
                console.log('✅ AI-generated goal suggestion received after reload (non-JSON)');
                return retryExtracted;
              }
          }
        } catch (retryError) {
          console.error('❌ Retry goal suggestion failed:', retryError);
        }
      }
      
      // If all AI attempts fail, return fallback
      console.warn('⚠️ Using fallback goal suggestion due to AI model errors');
      // Cache fallback
      await setCachedResponse(cacheKey, { goalSuggestion: fallbackResponse });
      return fallbackResponse;
    }
  } catch (error) {
    console.error('Goal suggestion error:', error);
    const fallback = `### Structured Aim\n- **Description**: Practice ${value.name} in one specific way today\n- **What this helps with**: Building value-aligned habits\n- **How do I measure progress**:\n  1. Planned the action\n  2. Took the action\n  3. Noted the outcome`;
    // Cache fallback
    await setCachedResponse(cacheKey, { goalSuggestion: fallback }).catch(console.warn);
    return fallback;
  }
}

