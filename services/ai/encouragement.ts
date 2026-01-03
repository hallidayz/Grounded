/**
 * ENCOURAGEMENT & GUIDANCE GENERATION
 * 
 * Provides personalized encouragement, counseling guidance, and goal suggestions.
 * Supports therapy integration with value-based reflection and emotional support.
 */

import { ValueItem, GoalFrequency, LCSWConfig, ReflectionAnalysisResponse, GoalSuggestionResponse, EmotionalEncouragementResponse, CounselingGuidanceResponse, EmotionalState } from "../../types";
import { initializeModels, getCounselingCoachModel, getIsModelLoading } from "./models";
import { detectCrisis, getCrisisResponse } from "./crisis";
import { generateCacheKey, getCachedResponse, setCachedResponse, shouldInvalidateCache } from "./cache";
import { emotionalEncouragementFallbacks, focusLensFallbacks, reflectionAnalysisFallbacks, goalSuggestionFallbacks, getFallbackResponse } from "./fallbackTables";

/**
 * Generates Focus Lens guidance using AI first, with a rule-based fallback.
 * This is a core AI feature to guide user reflection.
 */
export async function generateFocusLens(
  emotionalState: EmotionalState,
  value: ValueItem,
  lcswConfig?: LCSWConfig,
  context?: {
    recentReflections?: string;
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  }
): Promise<string> {
  const protocols = lcswConfig?.protocols || [];
  
  const cacheKey = generateCacheKey(
    `${emotionalState}|${value.id}|${context?.recentReflections?.substring(0, 50) || ''}`,
    emotionalState,
    undefined,
    undefined,
    protocols
  );

  const cached = await getCachedResponse(cacheKey);
  if (cached?.focusLens) {
    console.log('✅ Using cached Focus Lens');
    return cached.focusLens;
  }

  let counselingCoachModel = getCounselingCoachModel();
  if (!counselingCoachModel) {
    const isModelLoading = getIsModelLoading();
    if (isModelLoading) {
      // Wait up to 2 seconds for model to load (non-blocking)
      const maxWaitTime = 2000;
      const startTime = Date.now();
      while (!counselingCoachModel && (Date.now() - startTime) < maxWaitTime) {
        await new Promise(resolve => setTimeout(resolve, 200));
        counselingCoachModel = getCounselingCoachModel();
      }
    } else {
      try {
        await initializeModels();
        counselingCoachModel = getCounselingCoachModel();
      } catch (error) {
        console.warn('Model initialization failed for Focus Lens');
      }
    }
  }

  const protocolContext = protocols.length > 0 
    ? `The user is working with an LCSW using ${protocols.join(', ')} protocols.`
    : 'The user is working with a licensed clinical social worker.';
  
  const reflectionContext = context?.recentReflections 
    ? ` Recent reflections: "${context.recentReflections.substring(0, 200)}".` 
    : '';

  const prompt = `Generate a concise, empathetic "Focus Lens" message (2-3 sentences) for a user.

Context: User is currently feeling ${emotionalState}. They are reflecting on the value: "${value.name}" (${value.description}).${reflectionContext}
${protocolContext}

Your Focus Lens should:
- Acknowledge their emotional state.
- Connect to their chosen value.
- Offer a gentle perspective or question to guide their reflection.
- Avoid giving direct advice or therapeutic interventions.

Return ONLY the Focus Lens text.`;

  if (counselingCoachModel) {
    try {
      console.log('🤖 Calling AI model for Focus Lens...');
      const result = await counselingCoachModel(prompt, {
        max_new_tokens: 100,
        temperature: 0.7,
        do_sample: true,
        top_p: 0.9
      });

      const generatedText = result[0]?.generated_text || '';
      const extracted = generatedText.replace(prompt, '').trim();
      if (extracted && extracted.length > 20) {
        await setCachedResponse(cacheKey, { focusLens: extracted });
        return extracted;
      }
    } catch (error) {
      console.warn('AI Focus Lens generation failed:', error);
      // Fall through to fallback
    }
  }

  // Rule-based fallback
  const fallback = getFallbackResponse(
    focusLensFallbacks,
    { emotionalState, valueCategory: value.category },
    focusLensFallbacks.default
  );
  console.log('ℹ️ Using rule-based Focus Lens fallback.');
  
  // Log rule-based usage
  try {
    const { dbService } = await import('../database');
    const userId = sessionStorage.getItem('userId') || 'anonymous';
    await dbService.saveRuleBasedUsage({
      id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      operationType: 'focusLens',
      emotionalState,
      valueCategory: value.category,
      fallbackKey: `${emotionalState}-${value.category}`,
      fallbackResponse: JSON.stringify({ focusLens: fallback }),
      context: {
        timeOfDay: context?.timeOfDay,
        recentJournalText: context?.recentReflections?.substring(0, 200)
      },
      aiUnavailableReason: counselingCoachModel ? 'error' : 'notLoaded',
      userId
    });
  } catch (logError) {
    console.warn('Failed to log rule-based usage:', logError);
  }
  
  await setCachedResponse(cacheKey, { focusLens: fallback });
  return fallback;
}

/**
 * Fallback Focus Lens generator (used when models aren't available)
 */
function generateFallbackFocusLens(emotionalState: EmotionalState, value: ValueItem): string {
  const context = {
    emotionalState,
    valueCategory: value.category,
  };
  return getFallbackResponse(focusLensFallbacks, context, focusLensFallbacks.default);
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
  let formatted = `### Structured Aim
- **Description**: ${json.description}
- **What this helps with**: ${json.whatThisHelpsWith}
- **How do I measure progress**:
${json.howToMeasureProgress.map((step, i) => `  ${i + 1}. ${step}`).join('\n')}`;

  // Add inference analysis if available
  if (json.inferenceAnalysis) {
    formatted += `\n\n### Inference Analysis\n${json.inferenceAnalysis}`;
  }

  // Add LCSM inferences if available
  if (json.lcsmInferences) {
    formatted += `\n\n### Encouragement & Guidance\n\n**Encouragement:**\n${json.lcsmInferences.encouragement}\n\n**Guidance:**\n${json.lcsmInferences.guidance}`;
  }

  return formatted;
}

/**
 * Fallback reflection analysis using rule-based approach
 */
function generateFallbackReflectionAnalysis(
  reflection: string,
  emotionalState: EmotionalState,
  selectedFeeling: string | null,
  frequency: GoalFrequency,
  lcswConfig?: LCSWConfig,
  previousAnalysis?: ReflectionAnalysisResponse | null
): ReflectionAnalysisResponse {
  // If this is a refresh, modify the response to provide a different perspective
  const baseResponse = getFallbackResponse(
    reflectionAnalysisFallbacks,
    { emotionalState },
    reflectionAnalysisFallbacks.default
  );
  
  // If refresh, provide alternative perspective
  if (previousAnalysis) {
    return {
      ...baseResponse,
      lcswLens: `${baseResponse.lcswLens} Consider this alternative perspective: ${baseResponse.reflectiveInquiry[0] || 'What else might be important here?'}`,
      reflectiveInquiry: [
        baseResponse.reflectiveInquiry[1] || baseResponse.reflectiveInquiry[0] || 'What other aspects feel important?',
        'What would a different perspective reveal about this situation?'
      ],
      sessionPrep: `Explore alternative perspectives and what they reveal about your experience. ${baseResponse.sessionPrep}`
    };
  }
  
  return baseResponse;
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
  selectedFeeling?: string | null,
  previousAnalysis?: ReflectionAnalysisResponse | null // Added new parameter
): Promise<ReflectionAnalysisResponse> { // Changed return type to ReflectionAnalysisResponse
  try {
    // Check for crisis first
    const crisisCheck = detectCrisis(reflection, lcswConfig);
    if (crisisCheck.isCrisis) {
      // For crisis, return a structured response indicating crisis with specific guidance
      return {
        coreThemes: ["Crisis Intervention"],
        lcswLens: getCrisisResponse(crisisCheck, lcswConfig),
        reflectiveInquiry: ["What immediate support can you access?", "Who can you reach out to right now?"],
        sessionPrep: "Focus on safety planning and immediate support with your therapist.",
        isCrisis: true, // Indicate crisis
      };
    }

    if (!reflection.trim()) {
      return await generateFallbackReflectionAnalysis(
        reflection,
        emotionalState as EmotionalState,
        selectedFeeling,
        frequency,
        lcswConfig,
        previousAnalysis
      );
    }

    const protocols = lcswConfig?.protocols || [];
    
    // Check cache first - append timestamp if refreshing to bypass cache
    const cacheKey = generateCacheKey(
      reflection + (previousAnalysis ? `|refresh-${Date.now()}` : ''),
      emotionalState || null,
      selectedFeeling || null,
      frequency,
      protocols
    );
    
    const cached = await getCachedResponse(cacheKey);
    if (cached?.reflectionAnalysis) {
      console.log('✅ Using cached reflection analysis');
      return JSON.parse(cached.reflectionAnalysis); // Return parsed JSON
    }

    // Build protocol context for prompt
    const protocolContext = protocols.length > 0 
      ? `The user is working with an LCSW using ${protocols.join(', ')} protocols.`
      : 'The user is working with a licensed clinical social worker.';
    
    // Build previous analysis context if refreshing
    const previousContext = previousAnalysis
      ? `\nPrevious analysis context (user wants a fresh perspective):\nCore Themes: ${previousAnalysis.coreThemes.join(', ')}\nLCSW Lens: ${previousAnalysis.lcswLens}\n\nProvide a different perspective or deeper insight.`
      : '';

    // Optimized Prompt for LaMini-Flan-T5 (Schema-Only)
    const prompt = `User Reflection: "${reflection}"
Mood: ${emotionalState || 'unknown'} (${selectedFeeling || 'general'})
Goal Frequency: ${frequency}
${protocolContext}${previousContext}

Analyze the reflection above and output the following sections:

REFLECTION: [Summarize the user's experience in 2 sentences]
EMOTIONS: [List 2-3 emotions inferred]
SELF_ADVOCACY: [Ask 1 gentle question]
PACE_NOTE: [Give 1 sentence of pacing advice]`;

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
        console.log('🤖 Calling AI model for reflection analysis (Schema-Only v2 - Forced Update)...');
        const result = await counselingCoachModel(prompt, {
          max_new_tokens: 250,
          temperature: 0.1,
          do_sample: true,
          repetition_penalty: 1.2
        });

        const generatedText = result[0]?.generated_text || '';
        console.log('✅ AI-generated text received:', generatedText.substring(0, 100) + '...');
        
        // Parse Canonical Output
        const sections: ReflectionAnalysisResponse = {
          coreThemes: [],
          lcswLens: '',
          reflectiveInquiry: [],
          sessionPrep: ''
        };

        // Extract sections using regex
        const reflectionMatch = generatedText.match(/REFLECTION:\s*([\s\S]*?)(?=(?:EMOTIONS:|SELF_ADVOCACY:|PACE_NOTE:|$))/i);
        if (reflectionMatch) sections.lcswLens = reflectionMatch[1].trim();

        const emotionsMatch = generatedText.match(/EMOTIONS:\s*([\s\S]*?)(?=(?:SELF_ADVOCACY:|PACE_NOTE:|$))/i);
        if (emotionsMatch) {
          sections.coreThemes = emotionsMatch[1]
            .split('\n')
            .map((line: string) => line.replace(/^-\s*/, '').trim())
            .filter((line: string) => line.length > 0 && !line.toLowerCase().includes('emotion_'));
        }

        const advocacyMatch = generatedText.match(/SELF_ADVOCACY:\s*([\s\S]*?)(?=(?:PACE_NOTE:|$))/i);
        if (advocacyMatch) {
          sections.reflectiveInquiry = advocacyMatch[1]
            .split('\n')
            .map((line: string) => line.replace(/^-\s*/, '').trim())
            .filter((line: string) => line.length > 0);
        }

        const paceMatch = generatedText.match(/PACE_NOTE:\s*([\s\S]*?)(?=$)/i);
        if (paceMatch) sections.sessionPrep = paceMatch[1].trim();

        // Validate extraction - check for placeholders or empty content
        const isPlaceholder = sections.lcswLens.includes('[Summarize') || sections.lcswLens.includes('[List');
        
        if (!isPlaceholder && (sections.lcswLens || sections.coreThemes.length > 0)) {
          await setCachedResponse(cacheKey, { reflectionAnalysis: JSON.stringify(sections) });
          return sections;
        } else {
          console.warn('Failed to parse canonical response (or detected placeholders), text was:', generatedText);
        }
      } catch (error) {
        console.warn('AI reflection analysis failed:', error);
      }
    }
    
    // Fallback to rule-based using fallback tables
    return generateFallbackReflectionAnalysis(reflection, emotionalState as EmotionalState, selectedFeeling, frequency, lcswConfig, previousAnalysis);
  } catch (error) {
    console.error('Reflection analysis error:', error);
    // Ensure that even if there's an internal error, we return a structured fallback
    return await generateFallbackReflectionAnalysis(reflection, emotionalState as EmotionalState, selectedFeeling, frequency, lcswConfig, previousAnalysis);
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
  
  // Schema-Only prompt format to prevent instruction repetition
  // This format gives the model the structure without repeating instructions
  const prompt = `User feeling: ${stateConfig.label.toLowerCase()}.${feelingContext}${timeContext}${journalContext}${patternContext}
${protocolContext}

${baseInstruction}${connectionPrompt}

{
  "message": "Acknowledge ${selectedFeeling || stateConfig.shortLabel}. Provide 30-60 words of honest, realistic support. See possibilities without toxic positivity. Be genuine, warm, supportive.${isRepeated ? ' Strongly encourage reaching out for support.' : ''}",
  "acknowledgeFeeling": "${selectedFeeling || stateConfig.shortLabel}",
  "actionableStep": "optional small step"
}`;

  // Build fallback response using fallback tables
  const fallbackData = getFallbackResponse(
    emotionalEncouragementFallbacks,
    { emotionalState, subEmotion: selectedFeeling },
    emotionalEncouragementFallbacks.default
  );
  
  // Build fallback response message, adding support message if repeated low states
  let fallbackResponse = fallbackData.message;
  if (isRepeated && (emotionalState === 'drained' || emotionalState === 'heavy' || emotionalState === 'overwhelmed')) {
    fallbackResponse += ' Please consider reaching out to your therapist, a trusted friend, or the 988 Crisis & Suicide Lifeline. You deserve support.';
  }

  // PRIORITY: Try to use AI model FIRST if available
  // Check if any model is loaded (mood tracker or counseling coach)
  let counselingCoachModel = getCounselingCoachModel();
  const { getMoodTrackerModel, areModelsLoaded } = await import('./models');
  const moodTrackerModel = getMoodTrackerModel();
  
  // Use the first available model (mood tracker can also do text generation)
  if (!counselingCoachModel && moodTrackerModel) {
    console.log('✅ Using mood tracker model for Focus Lens (first available model)');
    counselingCoachModel = moodTrackerModel;
  }
  
  // If no model available, check if one is loading and wait briefly
  if (!counselingCoachModel) {
    const isModelLoading = getIsModelLoading();
    if (isModelLoading) {
      // Wait up to 2 seconds for model to load (non-blocking)
      const maxWaitTime = 2000;
      const startTime = Date.now();
      while (!counselingCoachModel && (Date.now() - startTime) < maxWaitTime) {
        await new Promise(resolve => setTimeout(resolve, 200));
        counselingCoachModel = getCounselingCoachModel();
        if (!counselingCoachModel) {
          const moodModel = getMoodTrackerModel();
          if (moodModel) {
            counselingCoachModel = moodModel;
            break;
          }
        }
        // Check if loading failed
        if (!getIsModelLoading() && !counselingCoachModel) {
          break;
        }
      }
    }
  }
  
  // If AI model is available, use it FIRST (JSON in/out)
  if (counselingCoachModel) {
    try {
      const result = await counselingCoachModel(prompt, {
        max_new_tokens: 200,
        temperature: 0.8,
        do_sample: true,
        top_p: 0.9
      });

      const generatedText = result[0]?.generated_text || '';
      
      // Remove the prompt from the beginning if present
      let extracted = generatedText.replace(prompt, '').trim();
      
      // Also remove common prompt artifacts
      extracted = extracted.replace(/^Provide encouragement and return.*?$/im, '').trim();
      extracted = extracted.replace(/^Return valid JSON only.*?$/im, '').trim();
      
      // Check if the response contains requirements text (indicates model repeated the prompt)
      const hasRequirements = /Requirements?:|Acknowledge:|Honest, realistic support|See possibilities without toxic/i.test(extracted);
      if (hasRequirements) {
        console.warn('⚠️ AI returned requirements text instead of JSON, rejecting response');
        // Try to extract JSON that might come after the requirements
        const afterRequirements = extracted.split(/Requirements?:/i)[1] || extracted;
        extracted = afterRequirements.trim();
      }
      
      // Try to parse JSON from response
      const jsonMatch = extracted.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const jsonResponse: EmotionalEncouragementResponse = JSON.parse(jsonMatch[0]);
          
          // Validate that we got actual content, not placeholders
          if (jsonResponse.message && jsonResponse.message.length > 20 && 
              !jsonResponse.message.includes('[Summarize') && 
              !jsonResponse.message.includes('[List') &&
              !jsonResponse.message.includes('30-60 words')) {
            console.log('✅ AI-generated JSON encouragement received');
            // Return formatted message (React will handle full formatting later)
            const result = jsonResponse.message || fallbackResponse;
            // Cache the result
            await setCachedResponse(cacheKey, { encouragement: result });
            return result;
          } else {
            console.warn('⚠️ AI returned placeholder or invalid message in JSON');
          }
        } catch (parseError) {
          console.warn('Failed to parse JSON encouragement:', parseError);
        }
      }
      
      // If JSON parsing failed, check if raw response looks like requirements/prompt
      if (extracted && extracted.length > 20) {
        // Reject if it looks like requirements text
        if (hasRequirements || /Requirements?:|Acknowledge:|Return valid JSON/i.test(extracted)) {
          console.warn('⚠️ Rejecting response that looks like prompt requirements');
          // Don't return this - use fallback instead
        } else {
          // Only use raw response if it doesn't look like a prompt
          console.warn('⚠️ Using raw response (JSON parsing failed but doesn\'t look like prompt)');
          // Cache the raw response
          await setCachedResponse(cacheKey, { encouragement: extracted });
          return extracted;
        }
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
            
            // Remove the prompt from the beginning if present
            let retryExtracted = retryText.replace(prompt, '').trim();
            
            // Also remove common prompt artifacts
            retryExtracted = retryExtracted.replace(/^Provide encouragement and return.*?$/im, '').trim();
            retryExtracted = retryExtracted.replace(/^Return valid JSON only.*?$/im, '').trim();
            
            // Check if the response contains requirements text
            const retryHasRequirements = /Requirements?:|Acknowledge:|Honest, realistic support|See possibilities without toxic/i.test(retryExtracted);
            if (retryHasRequirements) {
              console.warn('⚠️ Retry AI returned requirements text instead of JSON, rejecting response');
              // Try to extract JSON that might come after the requirements
              const afterRequirements = retryExtracted.split(/Requirements?:/i)[1] || retryExtracted;
              retryExtracted = afterRequirements.trim();
            }
            
            // Try to parse JSON from retry
            const retryJsonMatch = retryExtracted.match(/\{[\s\S]*\}/);
            if (retryJsonMatch) {
              try {
                const retryJsonResponse: EmotionalEncouragementResponse = JSON.parse(retryJsonMatch[0]);
                
                // Validate that we got actual content, not placeholders
                if (retryJsonResponse.message && retryJsonResponse.message.length > 20 && 
                    !retryJsonResponse.message.includes('[Summarize') && 
                    !retryJsonResponse.message.includes('[List') &&
                    !retryJsonResponse.message.includes('30-60 words')) {
                  console.log('✅ AI-generated JSON encouragement received after reload');
                  const result = retryJsonResponse.message || fallbackResponse;
                  // Cache the result
                  await setCachedResponse(cacheKey, { encouragement: result });
                  return result;
                } else {
                  console.warn('⚠️ Retry AI returned placeholder or invalid message in JSON');
                }
              } catch (parseError) {
                console.warn('Failed to parse retry JSON encouragement:', parseError);
              }
            }
            
            // If JSON parsing failed, check if raw response looks like requirements/prompt
            if (retryExtracted && retryExtracted.length > 20) {
              // Reject if it looks like requirements text
              if (retryHasRequirements || /Requirements?:|Acknowledge:|Return valid JSON/i.test(retryExtracted)) {
                console.warn('⚠️ Rejecting retry response that looks like prompt requirements');
                // Don't return this - use fallback instead
              } else {
                // Only use raw response if it doesn't look like a prompt
                console.warn('⚠️ Using raw retry response (JSON parsing failed but doesn\'t look like prompt)');
                return retryExtracted;
              }
            }
          } catch (retryError) {
            console.warn('Retry inference also failed:', retryError);
          }
        }
      }
    }
  }

  // Return rule-based fallback response immediately if AI model not available
  // This ensures the app works with rule-based responses from the start
  console.log('ℹ️ Using rule-based Focus Lens (AI model not available)');
  // Cache the fallback response
  await setCachedResponse(cacheKey, { encouragement: fallbackResponse }).catch(() => {});
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
  counselingGuidance: string = '',
  lcswConfig?: LCSWConfig,
  emotionalState?: string | null,
  selectedFeeling?: string | null,
  reflectionAnalysis?: ReflectionAnalysisResponse | null // Added reflection analysis parameter
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
    
    // Always use Deep Reflection data if available - it's critical for generating meaningful goals
    const deepReflectionText = reflection.includes('Deep Reflection:') 
      ? reflection.split('Deep Reflection:')[1]?.split('Reflection Analysis:')[0]?.trim() || reflection
      : reflection;
    
    // Build protocol context for prompt
    const protocolContext = protocols.length > 0 
      ? `The user is working with an LCSW using ${protocols.join(', ')} protocols.`
      : 'The user is working with a licensed clinical social worker.';
    
    // Optimized JSON prompt for on-device LLM with inference analysis and LCSM inferences
    const prompt = `Analyze the Deep Reflection and suggest a Self-Advocacy Aim. Return ONLY valid JSON (no markdown, no extra text):

{
  "description": "what they'll do",
  "whatThisHelpsWith": "why it matters",
  "howToMeasureProgress": ["step1", "step2", "step3"],
  "inferenceAnalysis": "analysis of how this aim addresses the reflection themes",
  "lcsmInferences": {
    "encouragement": "first LCSM inference providing encouragement based on the reflection",
    "guidance": "second LCSM inference providing guidance for their personal journey"
  }
}

${protocolContext}

Value: "${value.name}" (${value.description})
Frequency: ${frequency}
${feelingContext}${counselingGuidance ? `Counseling Guidance: ${counselingGuidance}\n\n` : ''}${reflectionAnalysis ? `Reflection Analysis:\nCore Themes: ${reflectionAnalysis.coreThemes.join(', ')}\nLCSW Lens: ${reflectionAnalysis.lcswLens}\nReflective Inquiry: ${reflectionAnalysis.reflectiveInquiry.join('; ')}\nSession Prep: ${reflectionAnalysis.sessionPrep}\n\n` : ''}Deep Reflection:
${deepReflectionText}
${hasAnalysis ? `\nReflection Analysis:\n${reflection.split('Reflection Analysis:')[1] || ''}` : ''}

Requirements:
- Specific and achievable for ${frequency}
- Aligned with value "${value.name}"
- Directly addresses the Deep Reflection content
- inferenceAnalysis: Explain how this aim connects to themes in their reflection
- lcsmInferences.encouragement: Provide encouragement recognizing their self-awareness and progress
- lcsmInferences.guidance: Offer guidance to support their personal journey and growth
- Supports growth and success

Return valid JSON only.`;

    // Default fallback response (only used if AI model is unavailable)
    const fallbackResponse: GoalSuggestionResponse = await generateFallbackGoalSuggestion(
      value, frequency, reflection, counselingGuidance, emotionalState as EmotionalState, selectedFeeling
    );
    
    if (!counselingCoachModel) {
      console.warn('⚠️ AI model not available for goal suggestion - using fallback response');
      console.warn('Model status:', {
        modelAvailable: !!counselingCoachModel,
        isModelLoading: getIsModelLoading(),
        hasReflection: reflection.trim().length > 0,
        hasAnalysis: reflection.includes('Reflection Analysis:')
      });
      // Cache fallback
      await setCachedResponse(cacheKey, { goalSuggestion: formatGoalSuggestionJSON(fallbackResponse) });
      return formatGoalSuggestionJSON(fallbackResponse);
    }
    
    // AI model is available - use it to generate JSON suggestion
    try {
      console.log('🤖 Calling AI model for goal suggestion (JSON)...');
      const result = await counselingCoachModel(prompt, {
        max_new_tokens: 400, // Increased for inference analysis and LCSM inferences
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
              max_new_tokens: 400, // Increased for inference analysis and LCSM inferences
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
      const finalFallback = await generateFallbackGoalSuggestion(value, frequency, reflection, counselingGuidance, emotionalState as EmotionalState, selectedFeeling);
      // Cache fallback
      await setCachedResponse(cacheKey, { goalSuggestion: formatGoalSuggestionJSON(finalFallback) });
      return formatGoalSuggestionJSON(finalFallback);
    }
  } catch (error) {
    console.error('Goal suggestion error:', error);
    const finalFallback = await generateFallbackGoalSuggestion(value, frequency, reflection, counselingGuidance, emotionalState as EmotionalState, selectedFeeling);
    // Cache fallback
    await setCachedResponse(cacheKey, { goalSuggestion: formatGoalSuggestionJSON(finalFallback) }).catch(console.warn);
    return formatGoalSuggestionJSON(finalFallback);
  }
}

/**
 * Fallback goal suggestion using rule-based approach
 */
function generateFallbackGoalSuggestion(
  value: ValueItem,
  frequency: GoalFrequency,
  reflection: string,
  counselingGuidance: string,
  emotionalState: EmotionalState,
  selectedFeeling: string | null
): GoalSuggestionResponse {
  // Use fallback tables for structured response
  const fallback = getFallbackResponse(
    goalSuggestionFallbacks,
    { valueCategory: value.category, frequency },
    goalSuggestionFallbacks.default
  );
  
  return {
    description: fallback.description,
    whatThisHelpsWith: fallback.whatThisHelpsWith,
    howToMeasureProgress: fallback.howToMeasureProgress,
    inferenceAnalysis: fallback.inferenceAnalysis,
    lcsmInferences: fallback.lcsmInferences
  };
}

