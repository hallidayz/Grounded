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
      console.error('Global AI Worker Error:', err);
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
export async function generateText(prompt: string, modelName: string): Promise<string | CrisisResponse> {
  return runAIWorker(prompt, 'text2text-generation', modelName);
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
