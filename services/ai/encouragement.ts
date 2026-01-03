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
    selectedFeeling?: string; // Add selected feeling/sub-emotion
  }
): Promise<string> {
  const protocols = lcswConfig?.protocols || [];
  const selectedFeeling = context?.selectedFeeling;
  
  const cacheKey = generateCacheKey(
    `${emotionalState}|${selectedFeeling || ''}|${value.id}|${context?.recentReflections?.substring(0, 50) || ''}`,
    emotionalState,
    selectedFeeling,
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

  const feelingContext = selectedFeeling 
    ? ` They specifically identify as feeling "${selectedFeeling}".`
    : '';

  const prompt = `Generate a concise, empathetic "Focus Lens" message (2-3 sentences) for a user.

Context: User is currently feeling ${emotionalState}.${feelingContext} They are reflecting on the value: "${value.name}" (${value.description}).${reflectionContext}
${protocolContext}

Your Focus Lens should:
- Acknowledge their specific emotional state (${emotionalState}${selectedFeeling ? ` and the feeling of "${selectedFeeling}"` : ''}).
- Connect to their chosen value ("${value.name}").
- Offer a gentle perspective or question to guide their reflection.
- Be personalized to their current emotional experience.
- Avoid giving direct advice or therapeutic interventions.

Return ONLY the Focus Lens text. Do not repeat instructions or include placeholders.`;

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
      let extracted = generatedText.replace(prompt, '').trim();
      
      // Remove any prompt artifacts or instruction text
      extracted = extracted.replace(/^Generate a concise.*?$/im, '').trim();
      extracted = extracted.replace(/^Return ONLY.*?$/im, '').trim();
      extracted = extracted.replace(/^Your Focus Lens should:.*?$/ims, '').trim();
      extracted = extracted.replace(/^Context:.*?$/ims, '').trim();
      
      // Validate that it's not just placeholder text
      const hasPlaceholder = /\[.*?\]|placeholder|example|template/i.test(extracted);
      const hasInstructions = /acknowledge|connect|offer|avoid|should|must/i.test(extracted) && extracted.length < 100;
      
      if (extracted && extracted.length > 20 && !hasPlaceholder && !hasInstructions) {
        await setCachedResponse(cacheKey, { focusLens: extracted });
        console.log('✅ AI-generated Focus Lens:', extracted.substring(0, 100));
        return extracted;
      } else {
        console.warn('⚠️ AI Focus Lens response invalid or contains placeholders, using fallback');
      }
    } catch (error) {
      console.warn('AI Focus Lens generation failed:', error);
      // Fall through to fallback
    }
  }

  // Rule-based fallback - include selected feeling if available
  const fallbackContext: any = { emotionalState, valueCategory: value.category };
  if (selectedFeeling) {
    fallbackContext.selectedFeeling = selectedFeeling;
  }
  const fallback = getFallbackResponse(
    focusLensFallbacks,
    fallbackContext,
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

    // AI Counselor Analysis prompt - provide therapeutic perspective
    const prompt = `You are an AI counseling assistant providing therapeutic analysis. Analyze this client reflection and provide structured counselor insights.

User Reflection: "${reflection.substring(0, 500)}"
Emotional State: ${emotionalState || 'unknown'} (${selectedFeeling || 'general'})
Goal Frequency: ${frequency}
${protocolContext}${previousContext}

Provide your counselor analysis in these sections:

REFLECTION: Summarize the client's experience in 2 sentences from a therapeutic perspective
EMOTIONS: Identify 2-3 emotions or emotional themes present in the reflection
SELF_ADVOCACY: Offer 1 gentle, reflective question to deepen the client's self-awareness
PACE_NOTE: Provide 1 sentence of therapeutic pacing advice for the client

Return ONLY the sections above with actual counselor insights. Do not include instructions or placeholders.`;

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
        console.log('🤖 Calling AI model for reflection analysis (AI Counselor Analysis)...');
        const result = await counselingCoachModel(prompt, {
          max_new_tokens: 400, // Increased for better analysis
          temperature: 0.3, // Slightly higher for more natural counselor tone
          do_sample: true,
          repetition_penalty: 1.3
        });

        const generatedText = result[0]?.generated_text || '';
        console.log('🔍 Raw AI reflection analysis response:', generatedText.substring(0, 300) + '...');
        
        // Remove prompt from beginning if present
        let extracted = generatedText.replace(prompt, '').trim();
        
        // Parse Canonical Output
        const sections: ReflectionAnalysisResponse = {
          coreThemes: [],
          lcswLens: '',
          reflectiveInquiry: [],
          sessionPrep: ''
        };

        // Extract sections using regex - be more lenient with matching
        // Try to find REFLECTION section
        const reflectionMatch = extracted.match(/REFLECTION:\s*([\s\S]*?)(?=(?:EMOTIONS:|SELF_ADVOCACY:|PACE_NOTE:|$))/i) ||
                                extracted.match(/REFLECTION[:\s]+([\s\S]*?)(?=(?:EMOTIONS|SELF_ADVOCACY|PACE_NOTE|$))/i);
        if (reflectionMatch && reflectionMatch[1]) {
          sections.lcswLens = reflectionMatch[1].trim();
          // Remove any remaining prompt artifacts
          sections.lcswLens = sections.lcswLens
            .replace(/User Reflection:.*$/im, '')
            .replace(/Mood:.*$/im, '')
            .replace(/Goal Frequency:.*$/im, '')
            .trim();
        }

        // Try to find EMOTIONS section
        const emotionsMatch = extracted.match(/EMOTIONS:\s*([\s\S]*?)(?=(?:SELF_ADVOCACY:|PACE_NOTE:|$))/i) ||
                             extracted.match(/EMOTIONS[:\s]+([\s\S]*?)(?=(?:SELF_ADVOCACY|PACE_NOTE|$))/i);
        if (emotionsMatch && emotionsMatch[1]) {
          const emotionsText = emotionsMatch[1].trim();
          sections.coreThemes = emotionsText
            .split(/[,\n]/)
            .map((line: string) => line.replace(/^-\s*/, '').replace(/^\d+\.\s*/, '').replace(/^•\s*/, '').trim())
            .filter((line: string) => 
              line.length > 2 && 
              line.length < 100 &&
              !line.toLowerCase().includes('emotion_') &&
              !line.includes('[') &&
              !line.toLowerCase().includes('list 2-3') &&
              !line.toLowerCase().includes('list emotions'));
        }

        // Try to find SELF_ADVOCACY section
        const advocacyMatch = extracted.match(/SELF_ADVOCACY:\s*([\s\S]*?)(?=(?:PACE_NOTE:|$))/i) ||
                             extracted.match(/SELF_ADVOCACY[:\s]+([\s\S]*?)(?=(?:PACE_NOTE|$))/i);
        if (advocacyMatch && advocacyMatch[1]) {
          const advocacyText = advocacyMatch[1].trim();
          // Split by newlines or keep as single question
          if (advocacyText.includes('\n')) {
            sections.reflectiveInquiry = advocacyText
              .split('\n')
              .map((line: string) => line.replace(/^-\s*/, '').replace(/^\d+\.\s*/, '').replace(/^•\s*/, '').trim())
              .filter((line: string) => 
                line.length > 5 && 
                !line.includes('[') &&
                !line.toLowerCase().includes('ask 1') &&
                !line.toLowerCase().includes('gentle question'));
          } else {
            sections.reflectiveInquiry = [advocacyText].filter(q => 
              q.length > 5 && 
              !q.includes('[') &&
              !q.toLowerCase().includes('ask 1'));
          }
        }

        // Try to find PACE_NOTE section
        const paceMatch = extracted.match(/PACE_NOTE:\s*([\s\S]*?)(?=$)/i) ||
                         extracted.match(/PACE_NOTE[:\s]+([\s\S]*?)(?=$)/i);
        if (paceMatch && paceMatch[1]) {
          sections.sessionPrep = paceMatch[1].trim();
          // Remove any remaining prompt artifacts
          sections.sessionPrep = sections.sessionPrep
            .replace(/Goal Frequency:.*$/im, '')
            .replace(/Mood:.*$/im, '')
            .replace(/User Reflection:.*$/im, '')
            .trim();
        }

        // Validate extraction - be more lenient to accept AI-generated content
        // Only reject if it's clearly placeholder text or instruction repetition
        const hasPlaceholders = 
          (sections.lcswLens.includes('[') && sections.lcswLens.includes(']')) || 
          sections.lcswLens.toLowerCase().includes('summarize the user\'s experience') ||
          (sections.sessionPrep.includes('[') && sections.sessionPrep.includes(']')) ||
          sections.sessionPrep.toLowerCase().includes('give 1 sentence of pacing') ||
          sections.coreThemes.some(t => (t.includes('[') && t.includes(']')) || t.toLowerCase().includes('list 2-3 emotions')) ||
          sections.reflectiveInquiry.some(q => (q.includes('[') && q.includes(']')) || q.toLowerCase().includes('ask 1 gentle question'));
        
        // More lenient content check - accept if we have any meaningful content
        const hasContent = 
          sections.lcswLens.length > 15 && // Reduced from 20
          (sections.coreThemes.length > 0 || sections.reflectiveInquiry.length > 0 || sections.sessionPrep.length > 10);
        
        console.log('🔍 Parsed sections:', {
          lcswLens: sections.lcswLens.substring(0, 50),
          coreThemesCount: sections.coreThemes.length,
          reflectiveInquiryCount: sections.reflectiveInquiry.length,
          sessionPrep: sections.sessionPrep.substring(0, 50),
          hasPlaceholders,
          hasContent,
          lcswLensLength: sections.lcswLens.length
        });
        
        // Accept AI-generated content even if some sections are missing, as long as we have core content
        if (!hasPlaceholders && hasContent) {
          console.log('✅ Valid AI Counselor Analysis extracted');
          await setCachedResponse(cacheKey, { reflectionAnalysis: JSON.stringify(sections) });
          return sections;
        } else if (sections.lcswLens.length > 15) {
          // If we have at least the LCSW Lens, accept it even if other sections are missing
          console.log('✅ Accepting AI analysis with LCSW Lens (some sections may be missing)');
          // Fill in missing sections with minimal content rather than rejecting
          if (sections.coreThemes.length === 0) {
            sections.coreThemes = ['Reflection on personal experience'];
          }
          if (sections.reflectiveInquiry.length === 0) {
            sections.reflectiveInquiry = ['What does this reflection reveal about your values?'];
          }
          if (sections.sessionPrep.length < 10) {
            sections.sessionPrep = 'Consider bringing this reflection to your next therapy session.';
          }
          await setCachedResponse(cacheKey, { reflectionAnalysis: JSON.stringify(sections) });
          return sections;
        } else {
          console.warn('⚠️ Failed to parse reflection analysis - placeholders detected or insufficient content');
          console.warn('Full generated text:', generatedText.substring(0, 500));
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
    
    // Schema-Only prompt format to prevent instruction repetition
    // Focus on SMART goal structure: Specific, Measurable, Achievable, Relevant, Time-bound
    const reflectionContext = reflectionAnalysis 
      ? `Reflection Analysis:\nCore Themes: ${reflectionAnalysis.coreThemes.join(', ')}\nLCSW Lens: ${reflectionAnalysis.lcswLens}\n\n`
      : '';
    
    // Ultra-minimal prompt - just show example JSON with minimal context
    // Put context first, then show the JSON structure as an example
    const prompt = `${protocolContext}
Value: ${value.name}
${feelingContext}${reflectionContext}Reflection: ${deepReflectionText.substring(0, 300)}

{
  "description": "action for ${frequency}",
  "whatThisHelpsWith": "benefit",
  "howToMeasureProgress": ["step 1", "step 2", "step 3"],
  "inferenceAnalysis": "connection to reflection",
  "lcsmInferences": {
    "encouragement": "encouragement",
    "guidance": "guidance"
  }
}`;

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
        temperature: 0.3, // Lower temperature for more focused, less repetitive output
        do_sample: true,
        repetition_penalty: 1.3 // Penalize repetition to prevent prompt text loops
      });

      const generatedText = result[0]?.generated_text || '';
      console.log('🔍 Raw AI goal response:', generatedText.substring(0, 400) + '...');
      
      // Try to find JSON anywhere in the response - don't rely on prompt removal
      // Look for JSON object patterns with proper structure (has description, whatThisHelpsWith, etc.)
      let jsonMatch = generatedText.match(/\{[^{]*"description"[^{]*"whatThisHelpsWith"[^{]*"howToMeasureProgress"[^{]*\}/s);
      
      // If that doesn't work, try a more lenient match for any JSON object
      if (!jsonMatch) {
        jsonMatch = generatedText.match(/\{[\s\S]{100,}\}/);
      }
      
      // If still no match, try to find JSON after common prompt phrases
      if (!jsonMatch) {
        const afterPrompt = generatedText.split(/Create a SMART|Return ONLY|Return valid JSON|Return only this JSON/i)[1] || generatedText;
        jsonMatch = afterPrompt.match(/\{[\s\S]{50,}\}/);
      }
      
      // Last resort: look for any JSON-like structure with description
      if (!jsonMatch) {
        jsonMatch = generatedText.match(/\{[^}]*"description"[^}]*\}/);
      }
      
      // If still no match, try to extract individual fields and reconstruct JSON
      // The model might return malformed JSON or mix prompt text with JSON
      if (!jsonMatch) {
        const descriptionMatch = generatedText.match(/"description"\s*:\s*"([^"]{15,})"/);
        const whatHelpsMatch = generatedText.match(/"whatThisHelpsWith"\s*:\s*"([^"]{10,})"/);
        const progressMatch = generatedText.match(/"howToMeasureProgress"\s*:\s*\[([^\]]+)\]/);
        
        if (descriptionMatch && whatHelpsMatch) {
          // Reconstruct JSON from extracted fields
          const progressText = progressMatch ? progressMatch[1] : '';
          const progressArray = progressText
            ? progressText.split(',').map(s => {
                const cleaned = s.trim().replace(/^["']|["']$/g, '');
                return cleaned.length > 0 ? cleaned : null;
              }).filter(s => s !== null && s.length > 3)
            : ["Track progress daily", "Note improvements", "Reflect on outcomes"];
          
          // Ensure we have at least 3 steps
          while (progressArray.length < 3) {
            progressArray.push(`Step ${progressArray.length + 1}`);
          }
          
          const reconstructed: GoalSuggestionResponse = {
            description: descriptionMatch[1],
            whatThisHelpsWith: whatHelpsMatch[1],
            howToMeasureProgress: progressArray.slice(0, 3),
            inferenceAnalysis: generatedText.match(/"inferenceAnalysis"\s*:\s*"([^"]+)"/)?.[1] || "This aim addresses themes from your reflection",
            lcsmInferences: {
              encouragement: generatedText.match(/"encouragement"\s*:\s*"([^"]+)"/)?.[1] || "You're taking meaningful steps forward",
              guidance: generatedText.match(/"guidance"\s*:\s*"([^"]+)"/)?.[1] || "Continue reflecting on your progress"
            }
          };
          
          // Validate reconstructed JSON
          if (reconstructed.description.length > 15 && 
              reconstructed.whatThisHelpsWith.length > 10 &&
              reconstructed.howToMeasureProgress.length > 0) {
            console.log('✅ Reconstructed JSON from malformed response');
            await setCachedResponse(cacheKey, { goalSuggestion: formatGoalSuggestionJSON(reconstructed) });
            return formatGoalSuggestionJSON(reconstructed);
          }
        }
      }
      
      if (jsonMatch) {
        try {
          const jsonResponse: GoalSuggestionResponse = JSON.parse(jsonMatch[0]);
          console.log('✅ Parsed JSON response:', {
            hasDescription: !!jsonResponse.description,
            descriptionLength: jsonResponse.description?.length || 0,
            hasWhatThisHelpsWith: !!jsonResponse.whatThisHelpsWith,
            hasProgressSteps: jsonResponse.howToMeasureProgress?.length > 0
          });
          
          // Validate that we got actual goal content
          // Be more lenient - only reject obvious placeholders or prompt text
          const hasValidDescription = jsonResponse.description && 
            jsonResponse.description.length > 15 && // Reduced from 20 to be more lenient
            !jsonResponse.description.includes('[Summarize') &&
            !jsonResponse.description.includes('what they\'ll do') &&
            !jsonResponse.description.includes('The client\'s purpose') &&
            !jsonResponse.description.includes('help the client remember');
          
          const hasValidWhatThisHelpsWith = jsonResponse.whatThisHelpsWith && 
            jsonResponse.whatThisHelpsWith.length > 10 &&
            !jsonResponse.whatThisHelpsWith.includes('The client\'s purpose');
          
          const hasValidProgressSteps = jsonResponse.howToMeasureProgress && 
            Array.isArray(jsonResponse.howToMeasureProgress) &&
            jsonResponse.howToMeasureProgress.length > 0 &&
            jsonResponse.howToMeasureProgress.every(step => step && step.length > 5);
          
          if (hasValidDescription && hasValidWhatThisHelpsWith && hasValidProgressSteps) {
            console.log('✅ AI-generated valid SMART goal suggestion');
            // Cache the result
            await setCachedResponse(cacheKey, { goalSuggestion: formatGoalSuggestionJSON(jsonResponse) });
            // Format JSON to markdown for backward compatibility (React will handle formatting later)
            return formatGoalSuggestionJSON(jsonResponse);
          } else {
            console.warn('⚠️ AI returned JSON but validation failed:', {
              hasValidDescription,
              hasValidWhatThisHelpsWith,
              hasValidProgressSteps,
              description: jsonResponse.description?.substring(0, 50)
            });
          }
        } catch (parseError) {
          console.warn('❌ Failed to parse JSON response:', parseError);
          console.warn('JSON match text:', jsonMatch[0].substring(0, 200));
        }
      } else {
        console.warn('⚠️ No JSON object found in response');
        console.warn('Full generated text (first 500 chars):', generatedText.substring(0, 500));
        
        // Try one more time with a very lenient match - look for any { } structure
        const lenientMatch = generatedText.match(/\{[\s\S]{30,}\}/);
        if (lenientMatch) {
          try {
            const jsonResponse: GoalSuggestionResponse = JSON.parse(lenientMatch[0]);
            console.log('✅ Parsed JSON with lenient matching');
            await setCachedResponse(cacheKey, { goalSuggestion: formatGoalSuggestionJSON(jsonResponse) });
            return formatGoalSuggestionJSON(jsonResponse);
          } catch (e) {
            console.warn('Lenient JSON parse also failed:', e);
          }
        }
      }
      
      // Use fallback if all validation fails
      console.warn('⚠️ AI model returned invalid response, using fallback');
      console.warn('Full generated text (first 500 chars):', generatedText.substring(0, 500));
      await setCachedResponse(cacheKey, { goalSuggestion: formatGoalSuggestionJSON(fallbackResponse) });
      return formatGoalSuggestionJSON(fallbackResponse);
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
              temperature: 0.3, // Lower temperature for more focused, less repetitive output
              do_sample: true,
              repetition_penalty: 1.3 // Penalize repetition to prevent prompt text loops
            });
            const retryText = retryResult[0]?.generated_text || '';
            console.log('🔍 Retry raw AI response:', retryText.substring(0, 200) + '...');
            
            // Remove the prompt from the beginning if present
            let retryExtracted = retryText.replace(prompt, '').trim();
            
            // Remove common prompt artifacts
            retryExtracted = retryExtracted.replace(/^Create a SMART.*?$/im, '').trim();
            retryExtracted = retryExtracted.replace(/^Analyze the Deep Reflection.*?$/im, '').trim();
            retryExtracted = retryExtracted.replace(/^Return ONLY valid JSON.*?$/im, '').trim();
            retryExtracted = retryExtracted.replace(/^Return valid JSON only.*?$/im, '').trim();
            
            // Check if response contains obvious prompt repetition
            const retryHasObviousPromptText = /The client's purpose is to help|help the client remember and practice therapy|provide structured reflection prompts aligned/i.test(retryExtracted);
            if (retryHasObviousPromptText) {
              console.warn('⚠️ Retry AI returned obvious prompt repetition, attempting to extract JSON after it');
              const afterPrompt = retryExtracted.split(/The client's purpose|help the client remember/i)[1] || retryExtracted;
              retryExtracted = afterPrompt.trim();
            }
            
            // Try to find JSON in the retry response
            const retryJsonMatch = retryExtracted.match(/\{[\s\S]*\}/);
            if (retryJsonMatch) {
              try {
                const retryJsonResponse: GoalSuggestionResponse = JSON.parse(retryJsonMatch[0]);
                
                // Validate with same lenient criteria
                const retryHasValidDescription = retryJsonResponse.description && 
                  retryJsonResponse.description.length > 15 &&
                  !retryJsonResponse.description.includes('[Summarize') &&
                  !retryJsonResponse.description.includes('what they\'ll do') &&
                  !retryJsonResponse.description.includes('The client\'s purpose') &&
                  !retryJsonResponse.description.includes('help the client remember');
                
                const retryHasValidWhatThisHelpsWith = retryJsonResponse.whatThisHelpsWith && 
                  retryJsonResponse.whatThisHelpsWith.length > 10 &&
                  !retryJsonResponse.whatThisHelpsWith.includes('The client\'s purpose');
                
                const retryHasValidProgressSteps = retryJsonResponse.howToMeasureProgress && 
                  Array.isArray(retryJsonResponse.howToMeasureProgress) &&
                  retryJsonResponse.howToMeasureProgress.length > 0 &&
                  retryJsonResponse.howToMeasureProgress.every(step => step && step.length > 5);
                
                if (retryHasValidDescription && retryHasValidWhatThisHelpsWith && retryHasValidProgressSteps) {
                  console.log('✅ Retry AI-generated valid SMART goal suggestion');
                  await setCachedResponse(cacheKey, { goalSuggestion: formatGoalSuggestionJSON(retryJsonResponse) });
                  return formatGoalSuggestionJSON(retryJsonResponse);
                } else {
                  console.warn('⚠️ Retry AI returned JSON but validation failed');
                }
              } catch (parseError) {
                console.warn('Failed to parse retry JSON response:', parseError);
              }
            }
            
            // If JSON parsing failed, try lenient matching
            if (retryExtracted && retryExtracted.includes('{')) {
              const retryLenientMatch = retryExtracted.match(/\{[\s\S]{20,}\}/);
              if (retryLenientMatch) {
                try {
                  const retryJsonResponse: GoalSuggestionResponse = JSON.parse(retryLenientMatch[0]);
                  console.log('✅ Parsed retry JSON with lenient matching');
                  await setCachedResponse(cacheKey, { goalSuggestion: formatGoalSuggestionJSON(retryJsonResponse) });
                  return formatGoalSuggestionJSON(retryJsonResponse);
                } catch (e) {
                  console.warn('Retry lenient JSON parse also failed');
                }
              }
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

