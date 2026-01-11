/**
 * WebLLM Service
 * 
 * Service layer for WebLLM (LaMini) integration.
 * Replaces @xenova/transformers with @mlc-ai/web-llm for better mobile performance.
 * 
 * Primary model: LaMini-Flan-T5-783M (instruction-following, optimized for counseling)
 * Alternative: LaMini-Llama-738M (if primary unavailable)
 * 
 * Note: Model names must match MLC model library format. If models don't load,
 * check @mlc-ai/web-llm documentation for correct model identifiers.
 */

import { logger } from '../../utils/logger';

// Model configuration
// Primary: LaMini-Flan-T5-783M (instruction-following, good for counseling)
// Alternative: LaMini-Llama-738M (if available in WebLLM format)
// Note: WebLLM model names may need to match MLC model library format
// Try these model names in order:
const MODEL_OPTIONS = [
  'LaMini-Flan-T5-783M-q4f16_1',  // Primary: LaMini-Flan-T5
  'LaMini-Llama-738M-q4f16_1',    // Alternative: LaMini-Llama-738M
  'MBZUAI/LaMini-Flan-T5-783M',   // HuggingFace format (if supported)
  'MBZUAI/LaMini-Llama-738M',     // HuggingFace format (if supported)
];

const DEFAULT_MODEL = MODEL_OPTIONS[0]; // Start with LaMini-Flan-T5
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 256;

// Global model instance
let globalModel: any = null;
let modelLoadPromise: Promise<any> | null = null;
let modelLoading = false;
let modelReady = false;
let modelError: string | null = null;

// Progress tracking
let loadProgress = 0;
let loadProgressCallback: ((progress: number) => void) | null = null;

/**
 * Initialize WebLLM model
 */
export async function initializeWebLLM(
  modelName: string = DEFAULT_MODEL,
  progressCallback?: (progress: number) => void
): Promise<boolean> {
  // If already ready, return true
  if (modelReady && globalModel) {
    return true;
  }

  // If already loading, wait for existing load
  if (modelLoading && modelLoadPromise) {
    try {
      await modelLoadPromise;
      return modelReady;
    } catch (error) {
      logger.error('[webllmService] Error waiting for model load:', error);
      return false;
    }
  }

  // Start loading
  modelLoading = true;
  loadProgressCallback = progressCallback || null;
  loadProgress = 0;

  modelLoadPromise = (async () => {
    // Try models in order until one works
    let lastError: Error | null = null;
    
    for (const tryModelName of MODEL_OPTIONS) {
      try {
        logger.info('[webllmService] Attempting to load WebLLM model:', tryModelName);

        // Dynamic import to avoid loading in SSR
        const { LLM } = await import('@mlc-ai/web-llm');

        // Create model instance with progress callback
        const model = new LLM({
          model: tryModelName,
          initProgressCallback: (report: any) => {
            const progress = report.progress || 0;
            loadProgress = progress * 100;
            
            if (loadProgressCallback) {
              loadProgressCallback(loadProgress);
            }
            
            logger.debug('[webllmService] Load progress:', `${Math.round(loadProgress)}%`);
          },
        });

        // Initialize the model
        await model.load();

        globalModel = model;
        modelReady = true;
        modelLoading = false;
        loadProgress = 100;

        logger.info('[webllmService] Model loaded successfully:', tryModelName);
        
        if (loadProgressCallback) {
          loadProgressCallback(100);
        }

        return model;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        logger.warn(`[webllmService] Failed to load model ${tryModelName}:`, errorMsg);
        lastError = error instanceof Error ? error : new Error(String(error));
        // Continue to next model option
        continue;
      }
    }
    
    // If all models failed, throw the last error
    modelLoading = false;
    modelReady = false;
    const finalErrorMsg = lastError?.message || 'All model loading attempts failed';
    modelError = finalErrorMsg;
    logger.error('[webllmService] All model load attempts failed. Last error:', finalErrorMsg);
    throw lastError || new Error(finalErrorMsg);
  })();

  try {
    await modelLoadPromise;
    return modelReady;
  } catch (error) {
    return false;
  }
}

/**
 * Generate text using WebLLM
 */
export async function generateText(
  prompt: string,
  options?: {
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
  }
): Promise<string> {
  if (!modelReady || !globalModel) {
    // Try to initialize if not ready
    const initialized = await initializeWebLLM();
    if (!initialized) {
      throw new Error('Model is not ready. Please wait for initialization.');
    }
  }

  try {
    const systemPrompt = options?.systemPrompt || 'You are a compassionate mental health support assistant. Be brief, supportive, and validating.';
    const temperature = options?.temperature ?? DEFAULT_TEMPERATURE;
    const maxTokens = options?.maxTokens ?? DEFAULT_MAX_TOKENS;

    // Combine system prompt with user prompt
    const fullPrompt = `${systemPrompt}\n\nUser: ${prompt}\n\nAssistant:`;

    logger.debug('[webllmService] Generating text, prompt length:', fullPrompt.length);

    // Generate response
    const response = await globalModel.generate(
      fullPrompt,
      {
        temperature,
        max_gen_len: maxTokens,
      }
    );

    logger.debug('[webllmService] Generated response length:', response.length);
    return response;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error('[webllmService] Generation error:', errorMsg);
    throw error;
  }
}

/**
 * Check if model is ready
 */
export function isModelReady(): boolean {
  return modelReady && globalModel !== null;
}

/**
 * Check if model is loading
 */
export function isModelLoading(): boolean {
  return modelLoading;
}

/**
 * Get current load progress (0-100)
 */
export function getLoadProgress(): number {
  return loadProgress;
}

/**
 * Get model status for compatibility with existing code
 */
export function getModelStatus(): {
  isReady: boolean;
  isLoading: boolean;
  progress: number;
  error: string | null;
} {
  return {
    isReady: modelReady,
    isLoading: modelLoading,
    progress: loadProgress,
    error: modelError,
  };
}

/**
 * Get model error if any
 */
export function getModelError(): string | null {
  return modelError;
}

/**
 * Clear model (for cleanup/reload)
 */
export async function clearModel(): Promise<void> {
  if (globalModel) {
    try {
      // WebLLM doesn't have an explicit cleanup method, but we can nullify the reference
      globalModel = null;
    } catch (error) {
      logger.error('[webllmService] Error clearing model:', error);
    }
  }
  
  modelReady = false;
  modelLoading = false;
  modelLoadPromise = null;
  loadProgress = 0;
  modelError = null;
  loadProgressCallback = null;
  
  logger.info('[webllmService] Model cleared');
}
