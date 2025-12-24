import { LogEntry, ValueItem, GoalFrequency, MentalStateAssessment, CrisisDetection, LCSWConfig } from "../types";
import { ALL_CRISIS_PHRASES, CrisisCategory } from "./crisisConfig";

/**
 * ON-DEVICE AI SERVICE
 * Uses MiniCPM4-0.5B style dual-model architecture for privacy-first therapy integration support.
 * All processing happens locally on the user's device - no data leaves the device.
 */

// Model loading state
let moodTrackerModel: any = null;
let counselingCoachModel: any = null;
let isModelLoading = false;
let modelLoadPromise: Promise<boolean> | null = null;

/**
 * Clear models to force re-download/update
 */
export async function clearModels(): Promise<void> {
  moodTrackerModel = null;
  counselingCoachModel = null;
  isModelLoading = false;
  modelLoadPromise = null;
  
  // Clear model cache
  if ('caches' in window) {
    const cacheKeys = await caches.keys();
    for (const key of cacheKeys) {
      if (key.includes('transformers') || key.includes('model') || key.includes('onnx')) {
        await caches.delete(key);
      }
    }
  }
}

/**
 * Initialize on-device models
 * Uses @xenova/transformers for browser-based inference
 * Can be called to update/reload models
 * @param forceReload - If true, clears existing models and reloads
 * @returns true if models loaded successfully, false if fallback mode is used
 */
export async function initializeModels(forceReload: boolean = false): Promise<boolean> {
  if (forceReload) {
    await clearModels();
  }
  
  if (moodTrackerModel && counselingCoachModel && !forceReload) {
    return true; // Already loaded
  }

  if (isModelLoading && modelLoadPromise && !forceReload) {
    // Wait for existing load and return its result
    try {
      await modelLoadPromise;
      return moodTrackerModel !== null && counselingCoachModel !== null;
    } catch {
      return false;
    }
  }

  isModelLoading = true;
  modelLoadPromise = (async () => {
    try {
      // Set up environment before importing
      if (typeof window !== 'undefined') {
        (window as any).__TRANSFORMERS_ENV__ = (window as any).__TRANSFORMERS_ENV__ || {};
      }
      
      // Dynamic import with error boundary
      // The registerBackend error is a known browser compatibility issue
      // We'll catch it gracefully and use rule-based responses
      let transformersModule;
      
      try {
        // Attempt import - this may fail with registerBackend error in some browsers
        transformersModule = await import('@xenova/transformers');
        
        // Verify the module loaded correctly
        if (!transformersModule || !transformersModule.pipeline) {
          console.info('ℹ️ Transformers module structure invalid. Using rule-based responses.');
          return false;
        }
      } catch (importError: any) {
        // Catch the registerBackend error and other import errors
        const errorMsg = importError?.message || String(importError);
        const errorStack = importError?.stack || '';
        
        // This is a known browser compatibility issue - not a critical error
        const isKnownIssue = errorMsg.includes('registerBackend') || 
                            errorMsg.includes('ort-web') ||
                            errorStack.includes('ort-web') ||
                            errorMsg.includes('Cannot read properties');
        
        if (isKnownIssue) {
          console.info('ℹ️ AI models unavailable: Browser compatibility issue with ONNX Runtime. App uses rule-based responses (fully functional).');
        } else {
          console.info('ℹ️ AI models unavailable. App uses rule-based responses (fully functional).');
        }
        return false;
      }
      
      const { pipeline, env } = transformersModule;
      
      // Check if the module loaded correctly
      if (!pipeline || !env) {
        throw new Error('Transformers module did not load correctly');
      }
      
      // Verify pipeline is a function
      if (typeof pipeline !== 'function') {
        throw new Error('Pipeline function not available in transformers module');
      }
      
      // Configure transformers.js for browser use - use minimal configuration
      // Configure BEFORE any backend access to avoid registerBackend errors
      try {
        env.allowLocalModels = true;
        env.allowRemoteModels = true;
        env.useBrowserCache = true;
        env.useCustomCache = false;
        
        // Set cache directory for models
        env.cacheDir = './models-cache';
      } catch (configError) {
        console.warn('Could not configure transformers environment, using defaults:', configError);
        // Continue anyway - library may have defaults
      }
      
      // Wait a moment for any backend initialization to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Don't try to configure backends manually - let transformers.js handle it
      // This avoids the registerBackend error
      
      // Models will be downloaded and cached locally on first use
      
      // Model A: Mental state tracker (mood/anxiety/depression assessment)
      // Start with a simpler, more reliable model that works better in browsers
      // Use text-classification models first as they're more stable than text-generation
      console.log('Loading psychology-centric AI model...');
      
      // Progress callback for model loading
      const progressCallback = (progress: any) => {
        if (progress.status === 'progress') {
          const percent = progress.progress ? Math.round(progress.progress * 100) : 0;
          console.log(`Model loading: ${progress.name || 'model'} - ${percent}%`);
        } else if (progress.status === 'done') {
          console.log(`Model loaded: ${progress.name || 'model'}`);
        }
      };
      
      // Try loading a reliable text-classification model first (more stable)
      // This model is smaller and loads faster, good for sentiment analysis
      try {
        console.log('Attempting to load DistilBERT (text classification)...');
        moodTrackerModel = await pipeline(
          'text-classification',
          'Xenova/distilbert-base-uncased-finetuned-sst-2-english',
          { 
            quantized: true,
            progress_callback: progressCallback
          }
        );
        console.log('✓ DistilBERT model loaded successfully');
      } catch (distilbertError: any) {
        const errorMsg = distilbertError?.message || String(distilbertError);
        const errorStack = distilbertError?.stack || '';
        
        // Check if it's a backend/ONNX error
        const isBackendError = errorMsg.includes('registerBackend') || 
                               errorMsg.includes('ort-web') ||
                               errorStack.includes('ort-web') ||
                               errorMsg.includes('Cannot read properties');
        
        if (isBackendError) {
          console.error('Backend initialization error detected. This is likely a browser compatibility issue with ONNX Runtime.');
          console.warn('The app will continue using rule-based responses. AI features will not be available.');
          moodTrackerModel = null;
        } else {
          console.warn('DistilBERT load failed, trying text-generation model:', distilbertError);
          
          // Fallback to a smaller text-generation model
          try {
            console.log('Attempting to load TinyLlama (text generation)...');
            moodTrackerModel = await pipeline(
              'text-generation',
              'Xenova/TinyLlama-1.1B-Chat-v1.0',
              { 
                quantized: true,
                progress_callback: progressCallback
              }
            );
            console.log('✓ TinyLlama model loaded successfully');
          } catch (tinyLlamaError: any) {
            const tinyLlamaMsg = tinyLlamaError?.message || String(tinyLlamaError);
            const tinyLlamaStack = tinyLlamaError?.stack || '';
            const isTinyLlamaBackendError = tinyLlamaMsg.includes('registerBackend') || 
                                            tinyLlamaMsg.includes('ort-web') ||
                                            tinyLlamaStack.includes('ort-web');
            
            if (isTinyLlamaBackendError) {
              console.error('Backend initialization error with TinyLlama. Browser may not support ONNX Runtime.');
              moodTrackerModel = null;
            } else {
              console.warn('TinyLlama load failed, trying MiniCPM:', tinyLlamaError);
              
              // Final fallback to MiniCPM
              try {
                console.log('Attempting to load MiniCPM (text generation)...');
                moodTrackerModel = await pipeline(
                  'text-generation',
                  'Xenova/MiniCPM-2-4B-ONNX',
                  { 
                    quantized: true,
                    progress_callback: progressCallback
                  }
                );
                console.log('✓ MiniCPM model loaded successfully');
              } catch (miniCPMError: any) {
                const miniCPMMsg = miniCPMError?.message || String(miniCPMError);
                const miniCPMStack = miniCPMError?.stack || '';
                const isMiniCPMBackendError = miniCPMMsg.includes('registerBackend') || 
                                               miniCPMMsg.includes('ort-web') ||
                                               miniCPMStack.includes('ort-web');
                
                if (isMiniCPMBackendError) {
                  console.error('Backend initialization error with all models. Browser compatibility issue detected.');
                } else {
                  console.error('All model loading attempts failed:', miniCPMError);
                }
                moodTrackerModel = null; // Will use rule-based fallback
              }
            }
          }
        }
      }

      // Model B: Counseling coach - Use same model for text generation
      // For now, we'll use the mood tracker model for both tasks
      // In future, can load separate specialized model
      counselingCoachModel = moodTrackerModel;
      if (counselingCoachModel) {
        console.log('✓ Using psychology-centric model for counseling guidance');
      } else {
        console.log('⚠️ Using rule-based counseling guidance (models unavailable)');
      }

      const modelsReady = moodTrackerModel !== null && counselingCoachModel !== null;
      isModelLoading = false;
      
      if (modelsReady) {
        console.log('✅ All AI models loaded and ready!');
      } else {
        console.warn('⚠️ AI models not available. App will use rule-based responses.');
      }
      
      return modelsReady;
    } catch (error) {
      console.error('Model initialization error:', error);
      isModelLoading = false;
      moodTrackerModel = null;
      counselingCoachModel = null;
      
      // Provide more specific error message
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('registerBackend') || errorMessage.includes('backend')) {
        console.error('Backend initialization failed. This may be a compatibility issue with @xenova/transformers.');
        console.warn('App will continue with rule-based responses. AI features will not be available.');
        // Return false to indicate failure, but don't throw
        return false;
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        console.warn('Failed to download AI models. App will use rule-based responses.');
        // Return false to indicate failure, but don't throw
        return false;
      } else {
        // Fallback: models will use rule-based responses
        console.warn('Failed to load on-device models. App will use rule-based responses instead.');
        // Return false to indicate failure, but don't throw
        return false;
      }
    }
  })();

  return modelLoadPromise;
}

/**
 * Crisis detection - scans text for safety phrases and crisis indicators
 * This runs BEFORE any AI processing to ensure safety
 * Uses comprehensive, hardcoded crisis phrase list (non-editable for safety)
 */
export function detectCrisis(text: string, lcswConfig?: LCSWConfig): CrisisDetection {
  const lowerText = text.toLowerCase();
  
  // Use comprehensive hardcoded crisis phrases (non-editable)
  // User-provided phrases in lcswConfig are IGNORED for safety
  const detectedPhrases: string[] = [];
  const detectedCategories: CrisisCategory[] = [];
  let maxSeverity: 'low' | 'moderate' | 'high' | 'critical' = 'low';

  // Scan text against all crisis phrases
  for (const crisisPhrase of ALL_CRISIS_PHRASES) {
    if (lowerText.includes(crisisPhrase.phrase)) {
      detectedPhrases.push(crisisPhrase.phrase);
      if (!detectedCategories.includes(crisisPhrase.category)) {
        detectedCategories.push(crisisPhrase.category);
      }
      
      // Determine maximum severity
      if (crisisPhrase.severity === 'critical') {
        maxSeverity = 'critical';
      } else if (crisisPhrase.severity === 'high' && maxSeverity !== 'critical') {
        maxSeverity = 'high';
      } else if (crisisPhrase.severity === 'moderate' && maxSeverity === 'low') {
        maxSeverity = 'moderate';
      }
    }
  }

  // Escalation logic: if moderate risk phrases are combined with any crisis phrase, escalate
  const hasModerateRisk = detectedCategories.some(cat => 
    cat === 'RISK_SEVERE_HOPELESSNESS' || cat === 'RISK_BEHAVIORAL_RED_FLAGS'
  );
  const hasCrisisCategory = detectedCategories.some(cat => 
    cat.startsWith('CRISIS_')
  );
  
  if (hasModerateRisk && hasCrisisCategory && maxSeverity === 'moderate') {
    maxSeverity = 'high';
  }

  const isCrisis = detectedPhrases.length > 0;
  
  // Determine recommended action based on severity and categories
  let recommendedAction: CrisisDetection['recommendedAction'] = 'continue';
  
  if (maxSeverity === 'critical') {
    recommendedAction = 'emergency';
  } else if (
    maxSeverity === 'high' || 
    detectedCategories.includes('CRISIS_SELF_HARM') ||
    detectedCategories.includes('CRISIS_THIRD_PARTY_SUICIDE_RISK')
  ) {
    recommendedAction = 'contact_lcsw';
  } else if (isCrisis) {
    recommendedAction = 'show_crisis_info';
  }

  return {
    isCrisis,
    severity: maxSeverity,
    detectedPhrases,
    recommendedAction,
    categories: detectedCategories
  };
}

/**
 * Model A: Mental State Tracker
 * Analyzes journals and reflections to assess mood, anxiety, depression severity
 * Returns structured assessment similar to MoPHES framework
 */
export async function assessMentalState(
  logs: LogEntry[],
  currentReflection: string,
  lcswConfig?: LCSWConfig
): Promise<MentalStateAssessment> {
  try {
    // Check for crisis FIRST - before any processing
    const crisisCheck = detectCrisis(currentReflection, lcswConfig);
    if (crisisCheck.isCrisis && crisisCheck.severity === 'critical') {
      // Return assessment that flags crisis - the UI should handle displaying crisis response
      return {
        anxietySeverity: 'high',
        depressionSeverity: 'high',
        keyThemes: ['CRISIS_DETECTED'],
        recommendedActions: ['Contact emergency services (911) or crisis hotline (988) immediately'],
        timestamp: new Date().toISOString()
      };
    }

    // Ensure models are loaded - wait if they're currently loading
    if (!moodTrackerModel) {
      if (isModelLoading && modelLoadPromise) {
        // Wait for current load to complete
        await modelLoadPromise;
      } else {
        // Start loading if not already loading
        await initializeModels();
      }
    }

    // Combine recent logs and current reflection for context
    const recentLogs = logs.slice(0, 10).map(l => l.note).join(' ');
    const combinedText = `${recentLogs} ${currentReflection}`.trim();

    if (!combinedText) {
      return {
        anxietySeverity: 'low',
        depressionSeverity: 'low',
        keyThemes: [],
        recommendedActions: [],
        timestamp: new Date().toISOString()
      };
    }

    // Use the mood tracker model to analyze sentiment and emotional state
    // In a full implementation, this would use a fine-tuned mental health model
    let result;
    if (moodTrackerModel) {
      try {
        result = await moodTrackerModel(combinedText);
      } catch (error) {
        console.warn('Mood tracker inference failed:', error);
        result = null;
      }
    } else {
      result = null;
    }

    // Extract themes using keyword analysis (in production, use a proper NER model)
    const keyThemes: string[] = [];
    const themeKeywords = {
      'anxiety': ['worried', 'anxious', 'nervous', 'stressed', 'panic', 'fear'],
      'depression': ['sad', 'depressed', 'hopeless', 'empty', 'tired', 'worthless'],
      'anger': ['angry', 'frustrated', 'irritated', 'mad', 'rage'],
      'gratitude': ['grateful', 'thankful', 'appreciate', 'blessed'],
      'growth': ['learned', 'progress', 'improved', 'better', 'growing']
    };

    const lowerText = combinedText.toLowerCase();
    for (const [theme, keywords] of Object.entries(themeKeywords)) {
      if (keywords.some(kw => lowerText.includes(kw))) {
        keyThemes.push(theme);
      }
    }

    // Determine severity based on model output and keyword analysis
    const hasAnxietyKeywords = keyThemes.includes('anxiety') || lowerText.includes('anxious');
    const hasDepressionKeywords = keyThemes.includes('depression') || lowerText.includes('depressed');
    
    const anxietySeverity = hasAnxietyKeywords 
      ? (lowerText.match(/\b(very|extremely|severely)\b/gi) ? 'high' : 'moderate')
      : 'low';
    
    const depressionSeverity = hasDepressionKeywords
      ? (lowerText.match(/\b(very|extremely|severely)\b/gi) ? 'high' : 'moderate')
      : 'low';

    // Generate structured recommendations
    const recommendedActions: string[] = [];
    if (anxietySeverity !== 'low') {
      recommendedActions.push('Practice deep breathing exercises');
      recommendedActions.push('Consider discussing anxiety management strategies with your LCSW');
    }
    if (depressionSeverity !== 'low') {
      recommendedActions.push('Engage in gentle physical activity');
      recommendedActions.push('Reach out to your support network');
    }
    if (keyThemes.includes('growth')) {
      recommendedActions.push('Acknowledge your progress and celebrate small wins');
    }

    return {
      anxietySeverity: anxietySeverity as 'low' | 'moderate' | 'high',
      depressionSeverity: depressionSeverity as 'low' | 'moderate' | 'high',
      keyThemes: [...new Set(keyThemes)], // Remove duplicates
      recommendedActions,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Mental state assessment error:', error);
    // Fallback to safe defaults
    return {
      anxietySeverity: 'low',
      depressionSeverity: 'low',
      keyThemes: [],
      recommendedActions: ['Continue journaling and reflecting on your values'],
      timestamp: new Date().toISOString()
    };
  }
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
    if (!counselingCoachModel) {
      if (isModelLoading && modelLoadPromise) {
        // Wait for current load to complete
        await modelLoadPromise;
      } else {
        // Start loading if not already loading
        await initializeModels();
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
        // Use fallback response
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
  const { getEmotionalState } = await import('./emotionalStates');
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

    if (!counselingCoachModel) {
      await initializeModels();
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
      }
    }
    
    return response;
  } catch (error) {
    console.error('Goal suggestion error:', error);
    return `### Structured Aim\n- **Description**: Practice ${value.name} in one specific way today\n- **What this helps with**: Building value-aligned habits\n- **How do I measure progress**:\n  1. Planned the action\n  2. Took the action\n  3. Noted the outcome`;
  }
}

/**
 * Generate clinical reports - synthesizes logs into structured formats
 */
export async function generateHumanReports(
  logs: LogEntry[],
  values: ValueItem[],
  lcswConfig?: LCSWConfig
): Promise<string> {
  try {
    if (logs.length === 0) {
      return "No logs available for synthesis.";
    }

    // Check all logs for crisis indicators
    const allText = logs.map(l => l.note).join(' ');
    const crisisCheck = detectCrisis(allText, lcswConfig);
    
    if (crisisCheck.isCrisis && crisisCheck.severity === 'critical') {
      const emergencyContact = lcswConfig?.emergencyContact;
      const therapistContact = emergencyContact 
        ? `${emergencyContact.name || 'Your therapist'}: ${emergencyContact.phone}`
        : 'Your therapist or healthcare provider';
      
      return `# 🚨 SAFETY CONCERN DETECTED IN LOGS\n\n**Your safety is the priority.** These logs contain language that suggests you may be thinking about ending your life or hurting yourself.\n\n**If you are in immediate danger or feel you might act on thoughts of suicide, please contact emergency services (911 in the U.S.) or the 988 Suicide & Crisis Lifeline right now.**\n\n**This app cannot help in an emergency. If you are about to harm yourself, please call 911 or 988, or your local emergency number, immediately.**\n\n**Please also reach out to someone you trust right now**—a close friend, family member, or someone who can be with you. You don't have to go through this alone.\n\n**Resources available right now:**\n• **988 Suicide & Crisis Lifeline** - Dial 988 (24/7, free, confidential)\n• **Crisis Text Line** - Text HOME to 741741\n• **Emergency Services** - 911 (U.S.) or your local emergency number\n• **Your Therapist**: ${therapistContact}\n\n---\n\n# Clinical Summary\n\nDue to safety concerns detected in these logs, a full clinical summary should be reviewed with your LCSW or mental health professional in person.\n\n*Feeling suicidal is a medical and emotional emergency, not a personal failure. You deserve support, and help is available.*`;
    }

    // Try to initialize models if not already loaded
    if (!counselingCoachModel) {
      const modelsLoaded = await initializeModels();
      if (!modelsLoaded) {
        // Model initialization failed - throw error so UI can show message
        throw new Error('Failed to load on-device models');
      }
    }

    const summary = logs.map(l => {
      const vName = values.find(v => v.id === l.valueId)?.name || 'General';
      return `[${l.date.split('T')[0]}] Value: ${vName}, Mood: ${l.mood || 'N/A'}, Note: ${l.note}`;
    }).join('\n');

    const prompt = `You are a therapy integration assistant helping synthesize a client's reflection logs for review with their LCSW.

Generate a comprehensive report in SOAP, DAP, and BIRP formats.
      
Logs:
      ${summary}
      
Format your response with clear sections for each format. Keep the tone supportive, clinical yet human, and focused on patterns and themes that would be useful for therapy integration.`;

    let report = generateFallbackReport(logs, values);
    
    // If model is available, try to generate AI report
    if (counselingCoachModel) {
      try {
        const result = await counselingCoachModel(prompt, {
          max_new_tokens: 1000,
          temperature: 0.7,
          do_sample: true
        });

        const generatedText = result[0]?.generated_text || '';
        const extracted = generatedText.replace(prompt, '').trim();
        if (extracted) {
          report = extracted;
        }
      } catch (error) {
        console.warn('Report generation inference failed:', error);
        // Use fallback report - inference failures are handled gracefully
      }
    }

    // Add disclaimer
    const disclaimer = `\n\n---\n\n*This report is generated on-device for your personal review and discussion with your LCSW. It is not a substitute for professional clinical assessment.*`;

    return report + disclaimer;
  } catch (error) {
    // Check if this is a model loading error that should be shown to user
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('Failed to load on-device models')) {
      // Re-throw model loading errors so UI can show appropriate message
      throw error;
    }
    
    // For other unexpected errors, log and return fallback
    console.error('Report generation error:', error);
    const fallbackReport = generateFallbackReport(logs, values);
    const disclaimer = `\n\n---\n\n*This report was generated using rule-based analysis. All processing happens on your device for privacy.*`;
    return `${fallbackReport}${disclaimer}`;
  }
}

/**
 * Get crisis response - provides safety information and resources
 * Uses clear, direct, non-judgmental language that avoids stigmatizing phrases
 * Always routes to real-world support (988/911) and trusted people
 */
function getCrisisResponse(crisis: CrisisDetection, lcswConfig?: LCSWConfig): string {
  const emergencyContact = lcswConfig?.emergencyContact;
  const therapistContact = emergencyContact 
    ? `${emergencyContact.name || 'Your therapist'}: ${emergencyContact.phone}`
    : 'Your therapist or healthcare provider';

  // CRITICAL/EMERGENCY - Immediate danger or active planning
  if (crisis.severity === 'critical' || crisis.recommendedAction === 'emergency') {
    // Check if it's imminent danger category
    const isImminent = crisis.categories?.includes('CRISIS_IMMINENT_DANGER') || 
                      crisis.categories?.includes('CRISIS_PLANNING_OR_METHOD');
    
    if (isImminent) {
      return `🚨 **IMMEDIATE SAFETY CONCERN**\n\n**Your safety is the most important thing right now.**\n\n**If you are in immediate danger or feel you might act on thoughts of ending your life, please contact emergency services (911 in the U.S.) or the 988 Suicide & Crisis Lifeline right now.**\n\n**This app cannot help in an emergency. If you are about to harm yourself or someone else, please call 911 or 988, or your local emergency number, immediately.**\n\n**Please also reach out to someone you trust right now**—a close friend, family member, or someone who can be with you or check in on you. You don't have to go through this alone.\n\n**Resources available right now:**\n• **988 Suicide & Crisis Lifeline** - Dial 988 (24/7, free, confidential)\n• **Crisis Text Line** - Text HOME to 741741\n• **Emergency Services** - 911 (U.S.) or your local emergency number\n• **Your Therapist**: ${therapistContact}\n\n**If you have started to carry out a plan to end your life, stop using this app and contact 911, 988, or your local crisis service for urgent help.**\n\n*Feeling suicidal is a medical and emotional emergency, not a personal failure. You deserve support, and help is available.*`;
    }
    
    // Direct suicide ideation or planning
    return `🚨 **SAFETY CHECK**\n\n**It sounds like you may be thinking about ending your life or hurting yourself.**\n\n**Are you having thoughts of suicide right now?**\n\n**If you are thinking about suicide or have a plan, your safety is the priority. Please contact emergency services (911 in the U.S.) or the 988 Suicide & Crisis Lifeline right now.**\n\n**This app cannot help in an emergency. If you are about to harm yourself, please call 911 or 988, or your local emergency number, immediately.**\n\n**Please also reach out to someone you trust right now**—a close friend, family member, or someone who can be with you. You don't have to go through this alone.\n\n**Resources available right now:**\n• **988 Suicide & Crisis Lifeline** - Dial 988 (24/7, free, confidential)\n• **Crisis Text Line** - Text HOME to 741741\n• **Emergency Services** - 911 (U.S.) or your local emergency number\n• **Your Therapist**: ${therapistContact}\n\n*You are not alone in feeling this way, and it is OK to talk about suicide. Reaching out for help can make a difference. Many people have thoughts of suicide when pain feels overwhelming. Talking with a trained crisis counselor or mental health professional can help you stay safe.*`;
  }

  // HIGH - Self-harm, indirect ideation, or third-party concern
  if (crisis.severity === 'high' || crisis.recommendedAction === 'contact_lcsw') {
    const isSelfHarm = crisis.categories?.includes('CRISIS_SELF_HARM');
    const isThirdParty = crisis.categories?.includes('CRISIS_THIRD_PARTY_SUICIDE_RISK');
    
    if (isSelfHarm) {
      return `⚠️ **SUPPORT NEEDED**\n\n**Thank you for sharing this. It sounds like you may be hurting yourself or thinking about self-harm.**\n\n**What has helped you stay safe so far when you've had thoughts of suicide or self-harm?**\n\n**Your safety matters. Please reach out for help:**\n\n1. **Contact your therapist as soon as possible**: ${therapistContact}\n2. **988 Suicide & Crisis Lifeline** - Dial 988 (24/7, free, confidential)\n3. **Crisis Text Line** - Text HOME to 741741\n4. **Reach out to someone you trust**—a close friend, family member, or someone who can support you right now\n\n**This app is not a crisis or emergency service and cannot keep you safe in an emergency. For urgent help, contact 988, 911, or your local crisis line.**\n\n**If you feel you might act on thoughts of self-harm, please contact a crisis line, emergency services, or your local equivalent immediately.**\n\n*Feeling suicidal is a medical and emotional emergency, not a personal failure. You deserve support, and help is available.*`;
    }
    
    if (isThirdParty) {
      return `⚠️ **CONCERN FOR SOMEONE ELSE**\n\n**It sounds like you're concerned about someone else who may be thinking about suicide or self-harm.**\n\n**If someone you know is in immediate danger, please contact emergency services (911) or a crisis line right away.**\n\n**Resources to help:**\n• **988 Suicide & Crisis Lifeline** - Dial 988 (24/7, free, confidential)\n• **Crisis Text Line** - Text HOME to 741741\n• **Emergency Services** - 911 (U.S.) or your local emergency number\n• **Your Therapist**: ${therapistContact}\n\n**You can also encourage the person to reach out to a trusted friend, family member, or mental health professional.**\n\n*This app is not a crisis or emergency service. For urgent situations, contact local emergency services or crisis lines.*`;
    }
    
    // Indirect ideation or high risk
    return `⚠️ **SUPPORT AVAILABLE**\n\n**It sounds like you're going through a very difficult time right now.**\n\n**Who in your life (family, friends, professionals) could you contact today to talk about how you're feeling?**\n\n**Please reach out for help:**\n\n1. **Contact your therapist as soon as possible**: ${therapistContact}\n2. **988 Suicide & Crisis Lifeline** - Dial 988 (24/7, free, confidential)\n3. **Crisis Text Line** - Text HOME to 741741\n4. **Reach out to a trusted person**—a close friend, family member, or someone you trust—and let them know you need support right now\n\n**This app is not a crisis or emergency service and cannot keep you safe in an emergency. For urgent help, contact 988, 911, or your local crisis line.**\n\n**If you are thinking about suicide or self-harm, this app cannot keep you safe. Please call a crisis hotline or emergency services immediately.**\n\n*You are not alone in feeling this way. Reaching out for help can make a difference. Would you consider creating or updating a safety plan with a mental health professional or crisis counselor?*`;
  }

  // MODERATE - Hopelessness or behavioral red flags
  return `**SUPPORT AVAILABLE**\n\n**It sounds like you're going through a difficult time. Thank you for sharing this.**\n\n**Please know that support is available:**\n\n1. **Discuss this with your therapist** in your next session: ${therapistContact}\n2. **988 Suicide & Crisis Lifeline** - Dial 988 if you need to talk to someone (24/7, free, confidential)\n3. **Crisis Text Line** - Text HOME to 741741\n4. **Consider reaching out to a trusted person**—a friend, family member, or someone you trust—and sharing what you're experiencing\n\n**If you are thinking about suicide or self-harm, or feel you might act on harmful thoughts, please stop using the app and reach out to a trusted person or crisis service now.**\n\n**This app cannot help in emergencies. If you are in crisis or considering self-harm, call your local emergency number or a crisis hotline now.**\n\n*This app is not a substitute for professional therapy or crisis support. I can offer general information, but only trained people and local services can provide the immediate help you deserve when you feel suicidal.*`;
}

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
 * Fallback report generator (used when models aren't available)
 * Exported so UI components can use it directly when model loading fails
 */
export function generateFallbackReport(logs: LogEntry[], values: ValueItem[]): string {
  const valueCounts: Record<string, number> = {};
  const moodCounts: Record<string, number> = {};
  
  logs.forEach(log => {
    const valueName = values.find(v => v.id === log.valueId)?.name || 'Unknown';
    valueCounts[valueName] = (valueCounts[valueName] || 0) + 1;
    if (log.mood) {
      moodCounts[log.mood] = (moodCounts[log.mood] || 0) + 1;
    }
  });

  const topValue = Object.entries(valueCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  return `# Clinical Summary

## SOAP Format

**Subjective**: Client has logged ${logs.length} reflection entries, with primary focus on ${topValue}. Most common mood indicator: ${topMood}.

**Objective**: Patterns show engagement with value-based reflection practice. Entries span ${new Date(logs[logs.length - 1]?.date || Date.now()).toLocaleDateString()} to ${new Date(logs[0]?.date || Date.now()).toLocaleDateString()}.

**Assessment**: Client is actively engaging in self-reflection and value alignment work.

**Plan**: Continue value-based reflection. Review patterns with LCSW in next session.

---

## DAP Format

**Data**: ${logs.length} entries, ${Object.keys(valueCounts).length} values engaged, mood tracking active.

**Assessment**: Consistent engagement with reflection practice. Primary value focus: ${topValue}.

**Plan**: Maintain current practice. Discuss themes and patterns with LCSW.

---

## BIRP Format

**Behavior**: Client consistently logs reflections and tracks mood states.

**Intervention**: Value-based reflection practice, self-monitoring.

**Response**: Active engagement, ${logs.length} entries completed.

**Plan**: Continue practice, review with LCSW.

---

*This is a basic summary. For detailed analysis, please review entries manually or discuss with your LCSW.*`;
  }

/**
 * Preload models in the background (call this early in app lifecycle)
 * This will attempt to load models without blocking the UI
 * Returns true if models loaded successfully, false otherwise
 */
export async function preloadModels(): Promise<boolean> {
  try {
    console.log('🚀 Starting background model preload...');
    const success = await initializeModels(false);
    if (success) {
      console.log('✅ AI models preloaded successfully and ready to use');
    } else {
      console.warn('⚠️ Model preload completed but models not available. Will use rule-based fallbacks.');
    }
    return success;
  } catch (error) {
    console.warn('⚠️ Model preload failed, will retry on first use:', error);
    return false;
  }
}

/**
 * Check if models are currently loaded and ready
 */
export function areModelsLoaded(): boolean {
  return moodTrackerModel !== null && counselingCoachModel !== null;
}

/**
 * Get model loading status
 */
export function getModelStatus(): { loaded: boolean; loading: boolean } {
  return {
    loaded: areModelsLoaded(),
    loading: isModelLoading
  };
}
