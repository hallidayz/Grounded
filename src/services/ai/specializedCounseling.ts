/**
 * Specialized Counseling Service
 * 
 * Uses system prompts to provide evidence-based, framework-driven mental health support.
 * Replaces generic AI advice with specialized psychological interventions.
 */

import { SystemPromptType, getSystemPrompt } from './systemPrompts';
import { generateText as webllmGenerate } from './webllmService';
import { checkForCrisisKeywords, CrisisResponse } from '../safetyService';
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
  // Check for crisis keywords FIRST
  const crisisResponse = checkForCrisisKeywords(initialMessage);
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
  // Check for crisis keywords
  const crisisResponse = checkForCrisisKeywords(userMessage);
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
