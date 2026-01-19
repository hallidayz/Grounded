/**
 * Master Router / Triage Service
 * 
 * Analyzes user's initial "brain dump" and routes to the appropriate
 * psychological framework (System Prompt) based on their needs.
 * 
 * Uses LaMini for strict instruction-following to ensure accurate categorization.
 */

import { SystemPromptType } from './systemPrompts';
import { generateText } from './webllmService';
import { logger } from '../../utils/logger';

export type TriageCategory = 
  | 'CRITIC'
  | 'OVERWHELM'
  | 'BELIEF'
  | 'IMPOSTOR'
  | 'LONELY'
  | 'MAINTENANCE';

export interface RouterResponse {
  category: TriageCategory;
  handover: string;
  framework: SystemPromptType;
}

/**
 * Master Router System Prompt
 * Instructs the model to categorize user input into one of 6 lanes
 */
const ROUTER_SYSTEM_PROMPT = `You are the Triage Director for a mental wellness app. Your only job is to analyze the user's opening statement and categorize it into one of six specific 'Lanes.'

The Categories:
1. CRITIC: User is being mean to themselves, feeling shame, or self-loathing.
2. OVERWHELM: User is panicking, highly stressed, or emotionally flooded.
3. BELIEF: User feels 'stuck,' uses 'always/never' language, or feels they can't change.
4. IMPOSTOR: User feels like a fraud, lucky, or undeserving of success.
5. LONELY: User feels isolated, disconnected, or misunderstood by others.
6. MAINTENANCE: User feels okay but wants to stay positive or practice gratitude.

Your Output Format: You must only output the CATEGORY NAME and a 1-sentence 'Handover' note that bridges the gap.

Example: User: 'I'm terrified I'm going to get fired because I have no idea what I'm doing.' Output: IMPOSTOR | The user is struggling with competence anxiety and needs a success audit.`;

/**
 * Map Triage Categories to System Prompt Types
 */
const CATEGORY_TO_FRAMEWORK: Record<TriageCategory, SystemPromptType> = {
  'CRITIC': 'inner-critic-translator',
  'OVERWHELM': 'emotional-regulation-coach',
  'BELIEF': 'limiting-belief-reframer',
  'IMPOSTOR': 'impostor-syndrome-reframer',
  'LONELY': 'loneliness-reframer',
  'MAINTENANCE': 'gratitude-journal-coach',
};

/**
 * Parse router response from AI
 * Expected format: "CATEGORY | Handover note"
 */
function parseRouterResponse(response: string): RouterResponse | null {
  try {
    // Clean the response
    const cleaned = response.trim();
    
    // Look for the pipe separator
    const parts = cleaned.split('|').map(p => p.trim());
    
    if (parts.length < 2) {
      // Try alternative formats
      const categoryMatch = cleaned.match(/^(CRITIC|OVERWHELM|BELIEF|IMPOSTOR|LONELY|MAINTENANCE)/i);
      if (categoryMatch) {
        const category = categoryMatch[1].toUpperCase() as TriageCategory;
        const handover = cleaned.replace(categoryMatch[0], '').trim();
        return {
          category,
          handover: handover || 'Routing to appropriate support framework.',
          framework: CATEGORY_TO_FRAMEWORK[category],
        };
      }
      return null;
    }
    
    const category = parts[0].toUpperCase() as TriageCategory;
    const handover = parts.slice(1).join('|').trim();
    
    // Validate category
    if (!CATEGORY_TO_FRAMEWORK[category]) {
      logger.warn('[triageRouter] Invalid category received:', category);
      return null;
    }
    
    return {
      category,
      handover: handover || 'Routing to appropriate support framework.',
      framework: CATEGORY_TO_FRAMEWORK[category],
    };
  } catch (error) {
    logger.error('[triageRouter] Error parsing router response:', error);
    return null;
  }
}

/**
 * Fallback keyword-based routing
 * Used when AI routing fails
 */
function fallbackKeywordRouting(userMessage: string): SystemPromptType {
  const lowerMessage = userMessage.toLowerCase();
  
  // Inner Critic indicators
  if (lowerMessage.match(/\b(hate myself|self-critical|self-loathing|shame|worthless|disgusting|terrible person)\b/)) {
    return 'inner-critic-translator';
  }
  
  // Overwhelm indicators
  if (lowerMessage.match(/\b(overwhelmed|panicking|stressed|anxious|can't breathe|flooded|chaotic|scattered)\b/)) {
    return 'emotional-regulation-coach';
  }
  
  // Limiting Belief indicators
  if (lowerMessage.match(/\b(always|never|can't change|stuck|impossible|will never|always fail)\b/)) {
    return 'limiting-belief-reframer';
  }
  
  // Impostor indicators
  if (lowerMessage.match(/\b(fraud|impostor|lucky|don't deserve|fake|pretending|not qualified)\b/)) {
    return 'impostor-syndrome-reframer';
  }
  
  // Loneliness indicators
  if (lowerMessage.match(/\b(lonely|isolated|alone|disconnected|no one understands|misunderstood|no friends)\b/)) {
    return 'loneliness-reframer';
  }
  
  // Maintenance/Gratitude indicators
  if (lowerMessage.match(/\b(grateful|gratitude|appreciate|good day|feeling good|positive|practice)\b/)) {
    return 'gratitude-journal-coach';
  }
  
  // Default to Emotional Regulation (safest fallback)
  return 'emotional-regulation-coach';
}

/**
 * Route user input to appropriate psychological framework
 * 
 * @param userMessage The user's initial "brain dump"
 * @returns RouterResponse with category, handover note, and framework
 */
export async function routeUserInput(userMessage: string): Promise<RouterResponse> {
  try {
    logger.debug('[triageRouter] Routing user input:', { messageLength: userMessage.length });
    
    // Build prompt for router
    const routerPrompt = `User: ${userMessage}`;
    
    // Call WebLLM with router system prompt
    const response = await generateText(routerPrompt, {
      systemPrompt: ROUTER_SYSTEM_PROMPT,
      temperature: 0.3, // Low temperature for more consistent categorization
      maxTokens: 128, // Short response expected
    });
    
    // Parse the response
    const parsed = parseRouterResponse(response);
    
    if (parsed) {
      logger.info('[triageRouter] Successfully routed to:', parsed.framework);
      return parsed;
    }
    
    // Fallback to keyword-based routing
    logger.warn('[triageRouter] AI routing failed, using keyword fallback');
    const fallbackFramework = fallbackKeywordRouting(userMessage);
    
    return {
      category: getCategoryFromFramework(fallbackFramework),
      handover: 'Routing to appropriate support framework based on your message.',
      framework: fallbackFramework,
    };
  } catch (error) {
    logger.error('[triageRouter] Error in routing:', error);
    
    // Fallback to keyword-based routing on error
    const fallbackFramework = fallbackKeywordRouting(userMessage);
    return {
      category: getCategoryFromFramework(fallbackFramework),
      handover: 'Routing to appropriate support framework.',
      framework: fallbackFramework,
    };
  }
}

/**
 * Get category from framework (reverse lookup)
 */
function getCategoryFromFramework(framework: SystemPromptType): TriageCategory {
  const entries = Object.entries(CATEGORY_TO_FRAMEWORK) as [TriageCategory, SystemPromptType][];
  const found = entries.find(([_, f]) => f === framework);
  return found ? found[0] : 'OVERWHELM'; // Default to OVERWHELM
}

/**
 * Get display name for category
 */
export function getCategoryDisplayName(category: TriageCategory): string {
  const names: Record<TriageCategory, string> = {
    'CRITIC': 'Inner Critic',
    'OVERWHELM': 'Emotional Regulation',
    'BELIEF': 'Limiting Beliefs',
    'IMPOSTOR': 'Impostor Syndrome',
    'LONELY': 'Loneliness',
    'MAINTENANCE': 'Gratitude Practice',
  };
  return names[category] || category;
}
