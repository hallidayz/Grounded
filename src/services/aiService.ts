/**
 * AI SERVICE - MAIN EXPORT
 * 
 * This file re-exports all AI functionality from the modular structure.
 * Maintains backward compatibility with existing imports.
 * 
 * The AI service has been split into:
 * - ai/models.ts - Model loading and management
 * - ai/crisis.ts - Crisis detection and response
 * - ai/reports.ts - Clinical report generation
 * - ai/encouragement.ts - Encouragement and guidance generation
 */

import { checkForCrisisKeywords, CrisisResponse } from './safetyService';
import { logger } from '../utils/logger';

interface AIWorkerResponse {
  id: string;
  output?: any;
  error?: string;
}

let globalWorker: Worker | null = null;
const pendingRequests = new Map<string, { resolve: Function, reject: Function }>();

// Simple in-memory cache for common responses (TTL 5 mins)
const responseCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;

function getWorker(): Worker {
  if (!globalWorker) {
    globalWorker = new Worker(new URL('../workers/aiWorker.ts', import.meta.url), { type: 'module' });
    
    globalWorker.onmessage = (e) => {
      const { id, output, error } = e.data as AIWorkerResponse;
      const request = pendingRequests.get(id);
      
      if (request) {
        if (error) request.reject(new Error(error));
        else request.resolve(output);
        pendingRequests.delete(id);
      }
    };
    
    globalWorker.onerror = (err) => {
      logger.error('[aiService] Global AI Worker Error (deprecated - using WebLLM now):', err);
      // Worker is deprecated in favor of WebLLM, but kept for backward compatibility
    };
  }
  return globalWorker;
}

export function runAIWorker(
  inputText: string, 
  task: string = 'text2text-generation', 
  modelName?: string, 
  generationConfig?: any
): Promise<any | CrisisResponse> {
  
  // --- SAFETY INTERCEPTOR ---
  // Check for crisis keywords FIRST.
  const crisisResponse = checkForCrisisKeywords(inputText);
  if (crisisResponse) {
    // If a crisis is detected, DO NOT proceed to the AI worker.
    // Immediately return the hardcoded safety response.
    console.warn('Crisis keyword detected. Bypassing AI and returning safety response.');
    return Promise.resolve(crisisResponse); 
  }
  // --- END OF SAFETY INTERCEPTOR ---

  // Check cache first
  const cacheKey = `${task}-${modelName}-${inputText}-${JSON.stringify(generationConfig)}`;
  const cached = responseCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    console.log('[AIService] Returning cached response');
    return Promise.resolve(cached.data);
  }

  const id = crypto.randomUUID();
  const worker = getWorker();
  
  return new Promise((resolve, reject) => {
    pendingRequests.set(id, { 
      resolve: (data: any) => {
        // Cache successful response
        responseCache.set(cacheKey, { data, timestamp: Date.now() });
        resolve(data);
      }, 
      reject 
    });
    worker.postMessage({ id, text: inputText, task, modelName, generationConfig });
  });
}

// Re-export generateText for backward compatibility
// Updated to use WebLLM (TinyLlama) for better mobile performance
export async function generateText(prompt: string, modelName?: string): Promise<string | CrisisResponse> {
  // Check for crisis keywords FIRST (safety interceptor)
  const crisisResponse = checkForCrisisKeywords(prompt);
  if (crisisResponse) {
    logger.warn('[aiService] Crisis keyword detected. Bypassing AI and returning safety response.');
    return Promise.resolve(crisisResponse);
  }

  // Check cache first
  const cacheKey = `text-generation-${modelName || 'default'}-${prompt}`;
  const cached = responseCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    logger.debug('[aiService] Returning cached response');
    return Promise.resolve(cached.data);
  }

  try {
    // Use WebLLM service for generation
    const { generateText: webllmGenerate } = await import('./ai/webllmService');
    
    // System prompt for mental health support
    const systemPrompt = 'You are a compassionate mental health support assistant. Be brief, supportive, and validating. Keep responses under 50 words.';
    
    const response = await webllmGenerate(prompt, {
      systemPrompt,
      temperature: 0.7,
      maxTokens: 256,
    });

    // Cache successful response
    responseCache.set(cacheKey, { data: response, timestamp: Date.now() });
    
    return response;
  } catch (error) {
    logger.error('[aiService] Error generating text with WebLLM:', error);
    
    // Return a helpful fallback message instead of using the old worker
    // The old worker uses transformers which we've replaced with WebLLM
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.warn('[aiService] WebLLM unavailable, returning fallback response');
    
    // Return a supportive fallback message
    return 'I understand you\'re going through something difficult. Your feelings are valid. Please take care of yourself.';
  }
}

// Re-export model functions
export {
  clearModels,
  initializeModels,
  preloadModels,
  preloadModelsContinuously,
  areModelsLoaded,
  getModelStatus,
  getCompatibilityReport,
  // Model selection functions
  getSelectedModel,
  setSelectedModel,
  getModelConfig,
  getAllModelConfigs,
  // Internal helper functions (for advanced use cases)
  getMoodTrackerModel,
  getCounselingCoachModel,
  getIsModelLoading,
  isTextGenerationModel
} from './ai/models';

// Re-export compatibility functions
export {
  checkBrowserCompatibility,
  getCompatibilitySummary
} from './ai/browserCompatibility';

// Re-export crisis functions
export {
  detectCrisis,
  getCrisisResponse
} from './ai/crisis';

// Re-export report functions
export {
  assessMentalState,
  generateHumanReports,
  generateFallbackReport
} from './ai/reports';

// Re-export encouragement functions
export {
  generateEncouragement,
  generateEmotionalEncouragement,
  generateCounselingGuidance,
  generateValueMantra,
  suggestGoal,
  analyzeReflection,
  generateFocusLens
} from './ai/encouragement';

// Re-export specialized counseling functions
export {
  startCounselingSession,
  continueCounselingSession,
  recommendSystemPrompt,
  type CounselingSession,
} from './ai/specializedCounseling';

// Re-export system prompts
export {
  SYSTEM_PROMPTS,
  getSystemPrompt,
  getAllSystemPrompts,
  getSystemPromptByName,
  formatPromptForLLM,
  type SystemPromptType,
  type SystemPromptConfig,
} from './ai/systemPrompts';
