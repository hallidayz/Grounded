/**
 * useLocalLLM Hook
 * 
 * React hook for using WebLLM (LaMini) for on-device AI inference.
 * Optimized for mobile performance with efficient model size.
 * 
 * Uses @mlc-ai/web-llm for fast, local LLM inference without server calls.
 * Primary model: LaMini-Flan-T5-783M or LaMini-Llama-738M
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '../utils/logger';

export interface LLMState {
  isReady: boolean;
  isLoading: boolean;
  isGenerating: boolean;
  progress: number;
  error: string | null;
}

export interface LLMConfig {
  modelName?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

// Default model: LaMini-Flan-T5-783M (primary) or LaMini-Llama-738M (alternative)
// Note: WebLLM model names may need to match MLC model library format
// The service will try multiple model name formats automatically
const DEFAULT_MODEL = 'LaMini-Flan-T5-783M-q4f16_1'; // Service will try alternatives if this fails
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 256;

// Global model instance (shared across hook instances)
let globalModel: any = null;
let modelLoadPromise: Promise<any> | null = null;
let modelLoadState: 'idle' | 'loading' | 'ready' | 'error' = 'idle';

export function useLocalLLM(config: LLMConfig = {}) {
  const {
    modelName = DEFAULT_MODEL,
    temperature = DEFAULT_TEMPERATURE,
    maxTokens = DEFAULT_MAX_TOKENS,
    systemPrompt = 'You are a compassionate mental health support assistant. Be brief, supportive, and validating.',
  } = config;

  const [state, setState] = useState<LLMState>({
    isReady: false,
    isLoading: modelLoadState === 'loading',
    isGenerating: false,
    progress: 0,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize model
  useEffect(() => {
    let isMounted = true;

    const initializeModel = async () => {
      // If model is already ready, update state
      if (modelLoadState === 'ready' && globalModel) {
        if (isMounted) {
          setState(prev => ({
            ...prev,
            isReady: true,
            isLoading: false,
            error: null,
          }));
        }
        return;
      }

      // If model is already loading, wait for it
      if (modelLoadState === 'loading' && modelLoadPromise) {
        try {
          await modelLoadPromise;
          if (isMounted && modelLoadState === 'ready') {
            setState(prev => ({
              ...prev,
              isReady: true,
              isLoading: false,
              error: null,
            }));
          }
        } catch (error) {
          if (isMounted) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            setState(prev => ({
              ...prev,
              isReady: false,
              isLoading: false,
              error: errorMsg,
            }));
          }
        }
        return;
      }

      // Start loading model
      if (modelLoadState === 'idle' || modelLoadState === 'error') {
        modelLoadState = 'loading';
        if (isMounted) {
          setState(prev => ({
            ...prev,
            isLoading: true,
            progress: 0,
            error: null,
          }));
        }

        modelLoadPromise = (async () => {
          try {
            logger.info('[useLocalLLM] Loading WebLLM model:', modelName);
            
            // Dynamic import to avoid loading in SSR
            const { LLM } = await import('@mlc-ai/web-llm');
            
            // Create model instance
            const model = new LLM({
              model: modelName,
              initProgressCallback: (report: any) => {
                if (isMounted) {
                  const progress = report.progress || 0;
                  setState(prev => ({
                    ...prev,
                    progress: Math.min(100, progress * 100),
                  }));
                  logger.debug('[useLocalLLM] Load progress:', progress);
                }
              },
            });

            // Initialize the model
            await model.load();
            
            globalModel = model;
            modelLoadState = 'ready';
            
            logger.info('[useLocalLLM] Model loaded successfully');
            
            if (isMounted) {
              setState(prev => ({
                ...prev,
                isReady: true,
                isLoading: false,
                progress: 100,
                error: null,
              }));
            }
            
            return model;
          } catch (error) {
            modelLoadState = 'error';
            const errorMsg = error instanceof Error ? error.message : String(error);
            logger.error('[useLocalLLM] Model load error:', errorMsg);
            
            if (isMounted) {
              setState(prev => ({
                ...prev,
                isReady: false,
                isLoading: false,
                error: errorMsg,
              }));
            }
            
            throw error;
          }
        })();
      }
    };

    initializeModel();

    return () => {
      isMounted = false;
    };
  }, [modelName]);

  // Generate text
  const generate = useCallback(async (prompt: string, options?: {
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
  }): Promise<string> => {
    if (!globalModel || modelLoadState !== 'ready') {
      throw new Error('Model is not ready. Please wait for initialization.');
    }

    // Cancel any ongoing generation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setState(prev => ({
      ...prev,
      isGenerating: true,
      error: null,
    }));

    try {
      const finalSystemPrompt = options?.systemPrompt || systemPrompt;
      const finalTemperature = options?.temperature ?? temperature;
      const finalMaxTokens = options?.maxTokens ?? maxTokens;

      // Combine system prompt with user prompt
      const fullPrompt = finalSystemPrompt 
        ? `${finalSystemPrompt}\n\nUser: ${prompt}\n\nAssistant:`
        : prompt;

      logger.debug('[useLocalLLM] Generating with prompt length:', fullPrompt.length);

      // Generate response
      const response = await globalModel.generate(
        fullPrompt,
        {
          temperature: finalTemperature,
          max_gen_len: finalMaxTokens,
        },
        abortControllerRef.current.signal
      );

      setState(prev => ({
        ...prev,
        isGenerating: false,
      }));

      return response;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        logger.info('[useLocalLLM] Generation aborted');
        setState(prev => ({
          ...prev,
          isGenerating: false,
        }));
        throw error;
      }

      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error('[useLocalLLM] Generation error:', errorMsg);
      
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: errorMsg,
      }));

      throw error;
    }
  }, [systemPrompt, temperature, maxTokens]);

  // Abort current generation
  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setState(prev => ({
        ...prev,
        isGenerating: false,
      }));
    }
  }, []);

  return {
    ...state,
    generate,
    abort,
  };
}
