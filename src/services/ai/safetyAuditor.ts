/**
 * Safety Auditor Service
 * 
 * AI-based secondary crisis detection for metaphorical or indirect
 * crisis language that keyword filters might miss.
 * 
 * Uses LaMini for strict instruction-following to ensure reliable
 * RED/GREEN classification.
 */

import { generateText } from './webllmService';
import { logger } from '../../utils/logger';

/**
 * Safety Auditor System Prompt
 * Instructs the model to output only RED or GREEN
 */
const SAFETY_AUDITOR_PROMPT = `You are a Safety Auditor. Analyze the following user input for signs of immediate self-harm, suicidal ideation, or domestic violence.

Output exactly one word:
* RED: Immediate crisis detected.
* GREEN: No immediate life-threatening crisis.

Do not provide any other text.`;

/**
 * Audit user input for crisis indicators
 * 
 * @param userMessage The user's message to audit
 * @returns 'RED' if crisis detected, 'GREEN' if safe
 */
export async function auditUserInput(userMessage: string): Promise<'RED' | 'GREEN'> {
  try {
    logger.debug('[safetyAuditor] Auditing user input:', { messageLength: userMessage.length });
    
    // Call WebLLM with safety auditor prompt
    const response = await generateText(userMessage, {
      systemPrompt: SAFETY_AUDITOR_PROMPT,
      temperature: 0.1, // Very low temperature for consistent output
      maxTokens: 10, // Should only output one word
    });
    
    // Parse response - look for RED or GREEN
    const cleaned = response.trim().toUpperCase();
    
    if (cleaned.includes('RED')) {
      logger.warn('[safetyAuditor] RED flag detected');
      return 'RED';
    }
    
    if (cleaned.includes('GREEN')) {
      logger.debug('[safetyAuditor] GREEN - no crisis detected');
      return 'GREEN';
    }
    
    // If response is unclear, check for crisis keywords as fallback
    logger.warn('[safetyAuditor] Unclear response, checking keywords as fallback');
    const lowerMessage = userMessage.toLowerCase();
    const crisisIndicators = [
      'suicide', 'kill myself', 'end my life', 'want to die',
      'hurt myself', 'self harm', 'cutting', 'overdose',
      'better off dead', 'no reason to live', 'going to sleep forever',
      'never wake up', 'disappear forever',
    ];
    
    const hasCrisisIndicator = crisisIndicators.some(indicator => 
      lowerMessage.includes(indicator)
    );
    
    return hasCrisisIndicator ? 'RED' : 'GREEN';
  } catch (error) {
    logger.error('[safetyAuditor] Error in safety audit:', error);
    
    // On error, default to GREEN (let keyword check handle it)
    // This prevents false positives from blocking legitimate users
    return 'GREEN';
  }
}
