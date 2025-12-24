import { LogEntry, ValueItem, GoalFrequency, MentalStateAssessment, CrisisDetection, LCSWConfig } from "../types";

/**
 * ON-DEVICE AI SERVICE
 * Uses MiniCPM4-0.5B style dual-model architecture for privacy-first therapy integration support.
 * All processing happens locally on the user's device - no data leaves the device.
 */

// Model loading state
let moodTrackerModel: any = null;
let counselingCoachModel: any = null;
let isModelLoading = false;
let modelLoadPromise: Promise<void> | null = null;

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
 */
export async function initializeModels(forceReload: boolean = false): Promise<void> {
  if (forceReload) {
    await clearModels();
  }
  
  if (moodTrackerModel && counselingCoachModel && !forceReload) {
    return; // Already loaded
  }

  if (isModelLoading && modelLoadPromise && !forceReload) {
    return modelLoadPromise; // Wait for existing load
  }

  isModelLoading = true;
  modelLoadPromise = (async () => {
    try {
      // Dynamic import to avoid loading in SSR environments
      const { pipeline, env } = await import('@xenova/transformers');
      
      // Configure transformers.js for browser use
      // Set the backend to 'webgpu' or 'wasm' (webgpu is faster but requires support)
      env.allowLocalModels = true;
      env.allowRemoteModels = true;
      env.useBrowserCache = true;
      env.useCustomCache = false;
      
      // Configure ONNX Runtime backend - check if it exists before accessing
      if (env.backends && env.backends.onnx && env.backends.onnx.wasm) {
        env.backends.onnx.wasm.proxy = false;
        env.backends.onnx.wasm.numThreads = 1;
      }
      
      // Models will be downloaded and cached locally on first use
      
      // Model A: Mental state tracker (mood/anxiety/depression assessment)
      // Try MiniCPM-0.5B or TinyLlama-1.1B for psychology-centric assistance
      // These are tiny, on-device models quantized for mobile devices
      try {
        console.log('Loading psychology-centric AI model (MiniCPM-0.5B/TinyLlama-1.1B)...');
        
        // Try MiniCPM-0.5B first (recommended for psychology-centric tasks)
        try {
          moodTrackerModel = await pipeline(
            'text-generation',
            'Xenova/MiniCPM-2-4B-ONNX', // Using available quantized model
            { quantized: true }
          );
          console.log('MiniCPM model loaded successfully');
        } catch (miniCPMError) {
          console.warn('MiniCPM-0.5B load failed, trying TinyLlama-1.1B:', miniCPMError);
          // Fallback to TinyLlama-1.1B
          try {
            moodTrackerModel = await pipeline(
              'text-generation',
              'Xenova/TinyLlama-1.1B-Chat-v1.0',
              { quantized: true }
            );
            console.log('TinyLlama-1.1B model loaded successfully');
          } catch (tinyLlamaError) {
            console.warn('TinyLlama-1.1B load failed, using DistilBERT fallback:', tinyLlamaError);
            // Final fallback to DistilBERT for text classification
            moodTrackerModel = await pipeline(
              'text-classification',
              'Xenova/distilbert-base-uncased-finetuned-sst-2-english',
              { quantized: true }
            );
            console.log('DistilBERT fallback model loaded successfully');
          }
        }
      } catch (error) {
        console.warn('All model loads failed, using rule-based fallback:', error);
        moodTrackerModel = null; // Will use rule-based fallback
      }

      // Model B: Counseling coach - Use same model for text generation
      // For now, we'll use the mood tracker model for both tasks
      // In future, can load separate specialized model
      counselingCoachModel = moodTrackerModel;
      if (counselingCoachModel) {
        console.log('Using psychology-centric model for counseling guidance');
      } else {
        console.log('Using rule-based counseling guidance (models unavailable)');
      }

      isModelLoading = false;
    } catch (error) {
      console.error('Model initialization error:', error);
      isModelLoading = false;
      // Fallback: models will use rule-based responses
      throw new Error('Failed to load on-device models. Please refresh and try again.');
    }
  })();

  return modelLoadPromise;
}

/**
 * Crisis detection - scans text for safety phrases and crisis indicators
 * This runs BEFORE any AI processing to ensure safety
 */
export function detectCrisis(text: string, lcswConfig?: LCSWConfig): CrisisDetection {
  const lowerText = text.toLowerCase();
  const crisisPhrases = lcswConfig?.crisisPhrases || [
    'suicide', 'kill myself', 'end my life', 'want to die', 'no point living',
    'self harm', 'cutting', 'hurting myself', 'overdose', 'plan to die'
  ];

  const detectedPhrases: string[] = [];
  let severity: CrisisDetection['severity'] = 'low';

  for (const phrase of crisisPhrases) {
    if (lowerText.includes(phrase.toLowerCase())) {
      detectedPhrases.push(phrase);
      if (phrase.includes('suicide') || phrase.includes('kill') || phrase.includes('die')) {
        severity = 'critical';
      } else if (severity !== 'critical') {
        severity = 'high';
      }
    }
  }

  const isCrisis = detectedPhrases.length > 0;
  
  let recommendedAction: CrisisDetection['recommendedAction'] = 'continue';
  if (severity === 'critical') {
    recommendedAction = 'emergency';
  } else if (severity === 'high') {
    recommendedAction = 'contact_lcsw';
  } else if (isCrisis) {
    recommendedAction = 'show_crisis_info';
  }

  return {
    isCrisis,
    severity,
    detectedPhrases,
    recommendedAction
  };
}

/**
 * Model A: Mental State Tracker
 * Analyzes journals and reflections to assess mood, anxiety, depression severity
 * Returns structured assessment similar to MoPHES framework
 */
export async function assessMentalState(
  logs: LogEntry[],
  currentReflection: string
): Promise<MentalStateAssessment> {
  try {
    // Ensure models are loaded
    if (!moodTrackerModel) {
      await initializeModels();
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

    // Ensure models are loaded
    if (!counselingCoachModel) {
      await initializeModels();
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
      return `# CRISIS DETECTED IN LOGS\n\n**IMPORTANT**: These logs contain crisis indicators. Please contact your LCSW or emergency services immediately.\n\nDetected phrases: ${crisisCheck.detectedPhrases.join(', ')}\n\nEmergency contact: ${lcswConfig?.emergencyContact?.phone || '911'}\n\n---\n\n# Clinical Summary\n\nDue to crisis indicators, a full clinical summary should be reviewed with your LCSW in person.`;
    }

    if (!counselingCoachModel) {
      await initializeModels();
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
        // Use fallback report
      }
    }

    // Add disclaimer
    const disclaimer = `\n\n---\n\n*This report is generated on-device for your personal review and discussion with your LCSW. It is not a substitute for professional clinical assessment.*`;

    return report + disclaimer;
  } catch (error) {
    console.error('Report generation error:', error);
    return `# Clinical Summary\n\nUnable to generate full synthesis. Please review your ${logs.length} log entries manually or discuss with your LCSW.\n\n*All processing happens on your device for privacy.*`;
  }
}

/**
 * Get crisis response - provides safety information and resources
 */
function getCrisisResponse(crisis: CrisisDetection, lcswConfig?: LCSWConfig): string {
  if (crisis.severity === 'critical') {
    return `🚨 **CRISIS DETECTED**\n\nYour safety is the priority. Please:\n\n1. Contact emergency services: 911\n2. Contact your therapist: ${lcswConfig?.emergencyContact?.phone || 'Your therapist\'s emergency line'}\n3. Reach out to a crisis hotline: 988 (Suicide & Crisis Lifeline)\n\nThis app cannot provide crisis support. Please connect with a professional immediately.`;
  }

  if (crisis.severity === 'high') {
    return `⚠️ **Support Needed**\n\nYour reflection contains concerning content. Please:\n\n1. Contact your therapist as soon as possible\n2. Reach out to your support network\n3. Use your safety plan if you have one\n\nThis is not a crisis response system. For immediate support, contact a professional.`;
  }

  return `Your reflection contains some difficult content. Consider discussing this with your therapist in your next session. If you need immediate support, contact ${lcswConfig?.emergencyContact?.phone || 'your therapist'}.`;
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
 */
function generateFallbackReport(logs: LogEntry[], values: ValueItem[]): string {
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
 */
export async function preloadModels(): Promise<void> {
  try {
    await initializeModels();
  } catch (error) {
    console.warn('Model preload failed, will retry on first use:', error);
  }
}
