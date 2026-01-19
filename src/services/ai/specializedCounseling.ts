/**
  * Specialized Counseling Service
  * 
  * Uses system prompts to provide evidence-based, framework-driven mental health support.
  * Replaces generic AI advice with specialized psychological interventions.
  */

import { SystemPromptType, getSystemPrompt } from './systemPrompts';
import { generateText as webllmGenerate, isModelReady } from './webllmService';
import { checkForCrisisKeywords, CrisisResponse } from '../safetyService';
import { routeUserInput } from './triageRouter';
import { loadLastSessionToken, formatSessionContextForPrompt, saveSessionAndGenerateToken } from './sessionMemory';
import { logger } from '../../utils/logger';

export interface CounselingSession {
  promptType: SystemPromptType;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  context?: {
    location?: string;
    emotionalState?: string;
    additionalInfo?: string;
  };
}

/**
 * Start a new specialized counseling session
 */
export async function startCounselingSession(
  promptType: SystemPromptType,
  initialMessage: string,
  context?: CounselingSession['context']
): Promise<string | CrisisResponse> {
  // Check for crisis keywords FIRST (now async)
  const crisisResponse = await checkForCrisisKeywords(initialMessage);
  if (crisisResponse) {
    logger.warn('[specializedCounseling] Crisis detected, returning safety response');
    return crisisResponse;
  }

  try {
    const systemPromptConfig = getSystemPrompt(promptType);

    logger.debug('[specializedCounseling] Starting session:', {
      promptType,
      messageLength: initialMessage.length,
      hasContext: !!context,
    });

    // Check if AI model is ready before attempting to generate
    if (!isModelReady()) {
      logger.warn('[specializedCounseling] AI model not ready, returning fallback response');
      return `Thank you for sharing. I hear that you're going through "${initialMessage.substring(0, 50)}..."\n\n` +
        `The AI assistant is still loading. In the meantime, here are some suggestions:\n\n` +
        `• Take a few deep breaths\n` +
        `• Consider writing down your thoughts in a journal\n` +
        `• Reach out to a trusted friend or family member\n` +
        `• If you're in crisis, please call 988 (Suicide & Crisis Lifeline)\n\n` +
        `The AI will be ready to help you more specifically shortly.`;
    }

    // Build context string if provided
    let contextString = '';
    if (context) {
      if (context.location) {
        contextString += `\n\nContext: I am currently at ${context.location}.`;
      }
      if (context.emotionalState) {
        contextString += `\n\nCurrent emotional state: ${context.emotionalState}.`;
      }
      if (context.additionalInfo) {
        contextString += `\n\nAdditional context: ${context.additionalInfo}.`;
      }
    }

    // Use system prompt from config, with user message
    const userPrompt = `${initialMessage}${contextString}`;

    const response = await webllmGenerate(userPrompt, {
      systemPrompt: systemPromptConfig.systemPrompt,
      temperature: 0.7,
      maxTokens: 512, // Allow longer responses for therapeutic dialogue
    });

    return response;
  } catch (error) {
    logger.error('[specializedCounseling] Error in session:', error);
    throw error;
  }
}

/**
 * Continue an existing counseling session
 */
export async function continueCounselingSession(
  session: CounselingSession,
  userMessage: string
): Promise<string | CrisisResponse> {
  // Check for crisis keywords (now async)
  const crisisResponse = await checkForCrisisKeywords(userMessage);
  if (crisisResponse) {
    logger.warn('[specializedCounseling] Crisis detected in continuation');
    return crisisResponse;
  }

  try {
    // Build conversation history
    const conversationHistory = session.messages
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n\n');

    const systemPromptConfig = getSystemPrompt(session.promptType);
    
    // Build context string if provided
    let contextString = '';
    if (session.context) {
      if (session.context.location) {
        contextString += `\n\nContext: I am currently at ${session.context.location}.`;
      }
      if (session.context.emotionalState) {
        contextString += `\n\nCurrent emotional state: ${session.context.emotionalState}.`;
      }
      if (session.context.additionalInfo) {
        contextString += `\n\nAdditional context: ${session.context.additionalInfo}.`;
      }
    }

    // Combine conversation history with new message
    const userPrompt = `${conversationHistory}\n\nUser: ${userMessage}${contextString}`;

    logger.debug('[specializedCounseling] Continuing session:', {
      promptType: session.promptType,
      messageCount: session.messages.length,
      newMessageLength: userMessage.length,
    });

    const response = await webllmGenerate(userPrompt, {
      systemPrompt: systemPromptConfig.systemPrompt,
      temperature: 0.7,
      maxTokens: 512,
    });

    return response;
  } catch (error) {
    logger.error('[specializedCounseling] Error continuing session:', error);
    throw error;
  }
}

/**
 * Get recommended system prompt based on emotional state or situation
 */
export function recommendSystemPrompt(
  emotionalState?: string,
  situation?: string
): SystemPromptType | null {
  const state = emotionalState?.toLowerCase() || '';
  const sit = situation?.toLowerCase() || '';

  // Emotional Regulation for overwhelming states
  if (state.includes('overwhelmed') || state.includes('dysregulated') || state.includes('flooded')) {
    return 'emotional-regulation-coach';
  }

  // Loneliness for isolation
  if (state.includes('lonely') || state.includes('isolated') || sit.includes('alone')) {
    return 'loneliness-reframer';
  }

  // Inner Critic for self-criticism
  if (state.includes('self-critical') || state.includes('harsh') || sit.includes('critic')) {
    return 'inner-critic-translator';
  }

  // Impostor Syndrome for fraud feelings
  if (state.includes('fraud') || state.includes('impostor') || sit.includes('success')) {
    return 'impostor-syndrome-reframer';
  }

  // Limiting Beliefs for negative beliefs
  if (state.includes('limiting') || state.includes('belief') || sit.includes('negative thought')) {
    return 'limiting-belief-reframer';
  }

  // Gratitude for positive practice
  if (sit.includes('gratitude') || sit.includes('grateful') || sit.includes('appreciate')) {
    return 'gratitude-journal-coach';
  }

  return null;
}

/**
 * Start a counseling session with automatic triage routing
 * 
 * This function:
 * 1. Checks for crisis (keyword + Safety Auditor)
 * 2. Routes user input through Master Router to determine framework
 * 3. Loads previous session memory if available
 * 4. Starts session with appropriate system prompt
 * 
 * @param userMessage The user's initial "brain dump"
 * @param context Optional context (location, emotional state, etc.)
 * @returns Object with response and framework used
 */
export async function startCounselingSessionWithTriage(
  userMessage: string,
  context?: CounselingSession['context']
): Promise<{ response: string | CrisisResponse; framework: SystemPromptType; category?: string; handover?: string }> {
  // Level 1: Crisis check (keyword + Safety Auditor)
  const crisisResponse = await checkForCrisisKeywords(userMessage);
  if (crisisResponse) {
    logger.warn('[specializedCounseling] Crisis detected in triage, returning safety response');
    return {
      response: crisisResponse,
      framework: 'emotional-regulation-coach', // Default fallback
    };
  }

  try {
    // Level 2: Triage Router - determine appropriate framework
    logger.debug('[specializedCounseling] Routing user input through triage');
    const routerResult = await routeUserInput(userMessage);
    const framework = routerResult.framework;
    
    logger.info('[specializedCounseling] Routed to framework:', framework, 'Handover:', routerResult.handover);

    // Level 3: Load session memory if available
    let sessionContext = '';
    try {
      const { getCurrentUser } = await import('../authService');
      const user = await getCurrentUser();
      if (user?.id) {
        const lastToken = await loadLastSessionToken(user.id);
        if (lastToken && lastToken.framework === framework) {
          sessionContext = formatSessionContextForPrompt(lastToken);
          logger.debug('[specializedCounseling] Loaded session memory for continuity');
        }
      }
    } catch (error) {
      logger.warn('[specializedCounseling] Error loading session memory:', error);
      // Continue without session memory
    }

    // Level 4: Start session with determined framework
    const systemPromptConfig = getSystemPrompt(framework);
    
    // Build context string
    let contextString = sessionContext ? `\n\n${sessionContext}\n\n` : '';
    if (context) {
      if (context.location) {
        contextString += `\n\nContext: I am currently at ${context.location}.`;
      }
      if (context.emotionalState) {
        contextString += `\n\nCurrent emotional state: ${context.emotionalState}.`;
      }
      if (context.additionalInfo) {
        contextString += `\n\nAdditional context: ${context.additionalInfo}.`;
      }
    }

    const userPrompt = `${userMessage}${contextString}`;

    const response = await webllmGenerate(userPrompt, {
      systemPrompt: systemPromptConfig.systemPrompt,
      temperature: 0.7,
      maxTokens: 512,
    });

    return {
      response,
      framework,
      category: routerResult.category,
      handover: routerResult.handover,
    };
  } catch (error) {
    logger.error('[specializedCounseling] Error in triage session:', error);
    throw error;
  }
}
