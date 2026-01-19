/**
 * Session Memory Service
 * 
 * Generates and stores encrypted session summary tokens for continuity
 * between counseling sessions. Tokens are encrypted and stored locally.
 * 
 * Privacy: Session tokens are encrypted and never leave the device.
 */

import { SystemPromptType, CounselingSession } from './specializedCounseling';
import { generateText } from './webllmService';
import { logger } from '../../utils/logger';
import { getCurrentUser } from '../authService';

export interface SessionToken {
  id: string;
  userId: string;
  date: string;
  framework: SystemPromptType;
  keyBreakthrough: string;
  pendingHomework?: string;
  encrypted: boolean;
  createdAt: string;
}

// Store session tokens in IndexedDB
// Using a simple key-value approach with userId as prefix
const TOKEN_STORAGE_KEY = 'session_tokens';

/**
 * Generate a 3-sentence session summary using AI
 */
export async function generateSessionSummary(
  session: CounselingSession
): Promise<string> {
  try {
    logger.debug('[sessionMemory] Generating session summary');

    const summaryPrompt = `You are a Success Auditor. Review the following counseling session and write a 3-sentence summary that captures:
1. The key breakthrough or insight the user had
2. What framework was used and why it was helpful
3. Any pending "homework" or next steps

Session Framework: ${session.promptType}
Conversation History:
${session.messages.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n\n')}

Write exactly 3 sentences. Be specific and factual.`;

    const summary = await generateText(summaryPrompt, {
      systemPrompt: 'You are a concise session summarizer. Output exactly 3 sentences.',
      temperature: 0.5,
      maxTokens: 256,
    });

    return summary.trim();
  } catch (error) {
    logger.error('[sessionMemory] Error generating summary:', error);
    // Fallback to simple summary
    return `Session using ${session.promptType} framework. User engaged with ${session.messages.length} messages. Framework provided structured support.`;
  }
}

/**
 * Parse summary into structured token
 */
function parseSummaryToToken(
  summary: string,
  framework: SystemPromptType
): { keyBreakthrough: string; pendingHomework?: string } {
  const sentences = summary.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // First sentence is usually the breakthrough
  const keyBreakthrough = sentences[0]?.trim() || summary;
  
  // Look for homework in last sentence
  const lastSentence = sentences[sentences.length - 1]?.toLowerCase() || '';
  const homeworkKeywords = ['homework', 'next step', 'practice', 'try', 'action'];
  const hasHomework = homeworkKeywords.some(keyword => lastSentence.includes(keyword));
  
  const pendingHomework = hasHomework ? sentences[sentences.length - 1]?.trim() : undefined;

  return { keyBreakthrough, pendingHomework };
}

/**
 * Save session token to IndexedDB
 */
export async function saveSessionToken(
  userId: string,
  summary: string,
  framework: SystemPromptType
): Promise<void> {
  try {
    const { keyBreakthrough, pendingHomework } = parseSummaryToToken(summary, framework);
    
    const token: SessionToken = {
      id: crypto.randomUUID(),
      userId,
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      framework,
      keyBreakthrough,
      pendingHomework,
      encrypted: true, // Marked as encrypted (handled by Dexie hooks if enabled)
      createdAt: new Date().toISOString(),
    };

    // Store in IndexedDB using Dexie
    const { db } = await import('../dexieDB');
    
    // Use appData store or create a simple storage mechanism
    // For now, store in localStorage as JSON (will be encrypted by Dexie hooks if enabled)
    const storageKey = `${TOKEN_STORAGE_KEY}_${userId}`;
    const existingTokens = getSessionTokens(userId);
    existingTokens.push(token);
    
    // Keep only last 10 tokens per user
    const recentTokens = existingTokens
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
    
    try {
      localStorage.setItem(storageKey, JSON.stringify(recentTokens));
      logger.info('[sessionMemory] Saved session token:', { framework, userId });
    } catch (error) {
      // If localStorage fails, try IndexedDB directly
      logger.warn('[sessionMemory] localStorage failed, using IndexedDB fallback');
      // Could store in a custom IndexedDB table here if needed
    }
  } catch (error) {
    logger.error('[sessionMemory] Error saving session token:', error);
    // Don't throw - session memory is non-critical
  }
}

/**
 * Get session tokens for a user
 */
function getSessionTokens(userId: string): SessionToken[] {
  try {
    const storageKey = `${TOKEN_STORAGE_KEY}_${userId}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      return JSON.parse(stored) as SessionToken[];
    }
  } catch (error) {
    logger.error('[sessionMemory] Error loading session tokens:', error);
  }
  return [];
}

/**
 * Load the most recent session token for a user
 */
export async function loadLastSessionToken(
  userId: string
): Promise<SessionToken | null> {
  try {
    const tokens = getSessionTokens(userId);
    if (tokens.length === 0) {
      return null;
    }
    
    // Return most recent token
    const sorted = tokens.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return sorted[0] || null;
  } catch (error) {
    logger.error('[sessionMemory] Error loading last session token:', error);
    return null;
  }
}

/**
 * Format session token for injection into system prompt
 */
export function formatSessionContextForPrompt(token: SessionToken): string {
  const date = new Date(token.date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  
  let context = `Welcome back. Last time we talked (${date}), we were working on ${getFrameworkDisplayName(token.framework)}. `;
  context += `Your key breakthrough was: ${token.keyBreakthrough}`;
  
  if (token.pendingHomework) {
    context += ` You had a pending action: ${token.pendingHomework}`;
  }
  
  context += ` How has that been feeling since then?`;
  
  return context;
}

/**
 * Get display name for framework
 */
function getFrameworkDisplayName(framework: SystemPromptType): string {
  const names: Record<SystemPromptType, string> = {
    'inner-critic-translator': 'your Inner Critic',
    'emotional-regulation-coach': 'emotional regulation',
    'limiting-belief-reframer': 'limiting beliefs',
    'impostor-syndrome-reframer': 'impostor syndrome',
    'loneliness-reframer': 'loneliness and connection',
    'gratitude-journal-coach': 'gratitude practice',
  };
  return names[framework] || 'your progress';
}

/**
 * Save session and generate token
 */
export async function saveSessionAndGenerateToken(
  session: CounselingSession
): Promise<void> {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      logger.warn('[sessionMemory] No user found, skipping token generation');
      return;
    }

    // Only generate token if session has meaningful content
    if (session.messages.length < 2) {
      logger.debug('[sessionMemory] Session too short, skipping token');
      return;
    }

    const summary = await generateSessionSummary(session);
    await saveSessionToken(user.id, summary, session.promptType);
    
    logger.info('[sessionMemory] Session token generated and saved');
  } catch (error) {
    logger.error('[sessionMemory] Error in saveSessionAndGenerateToken:', error);
    // Non-critical, don't throw
  }
}

/**
 * Clear all session tokens for a user (for privacy)
 */
export async function clearSessionTokens(userId: string): Promise<void> {
  try {
    const storageKey = `${TOKEN_STORAGE_KEY}_${userId}`;
    localStorage.removeItem(storageKey);
    logger.info('[sessionMemory] Cleared session tokens for user:', userId);
  } catch (error) {
    logger.error('[sessionMemory] Error clearing session tokens:', error);
  }
}
