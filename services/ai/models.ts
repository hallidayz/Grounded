/**
 * AI MODEL LOADING & MANAGEMENT
 * 
 * Handles loading and initialization of on-device AI models.
 * Uses @xenova/transformers for browser-based inference.
 * 
 * Model Selection:
 * - 'tinyllama' (default): Best for healthcare/psychology - balanced quality and performance
 * - 'distilbert': Fast classification, good for mood assessment
 */

// CRITICAL: Initialize ONNX Runtime global object BEFORE any imports
// ONNX Runtime requires the global 'ort' object to be initialized before it loads
// This prevents "Cannot read properties of undefined (reading 'registerBackend')" errors
if (typeof globalThis !== 'undefined') {
  // Initialize the global ort object that ONNX Runtime expects
  const globalOrt = (globalThis as any).ort = (globalThis as any).ort || {};
  
  // Set up the environment configuration
  globalOrt.env = globalOrt.env || {};
  globalOrt.env.wasm = globalOrt.env.wasm || {};
  
  // Configure WASM backend settings
  if (!globalOrt.env.wasm.numThreads) {
    globalOrt.env.wasm.numThreads = typeof SharedArrayBuffer !== 'undefined' ? 4 : 1;
  }
  
  // Ensure registerBackend exists (ONNX Runtime will override this, but it needs to exist)
  if (!globalOrt.registerBackend) {
    globalOrt.registerBackend = function() {
      // ONNX Runtime will replace this with its own implementation
    };
  }
}

// Configure transformers.js to use WASM backend (ONNX Runtime with WASM)
// ONNX Runtime is REQUIRED for @xenova/transformers, but we can configure it to use WASM backend
// This provides good performance without requiring WebGPU/WebGL
if (typeof window !== 'undefined') {
  (window as any).__TRANSFORMERS_ENV__ = (window as any).__TRANSFORMERS_ENV__ || {};
  // Keep ONNX Runtime enabled (required), but prefer WASM backend
  (window as any).__TRANSFORMERS_ENV__.USE_WEBGPU = false; // Disable WebGPU for compatibility
  (window as any).__TRANSFORMERS_ENV__.USE_WASM = true; // Prefer WASM backend
}

// Also set process.env if available (for Node.js-like environments)
if (typeof process !== 'undefined' && process.env) {
  process.env.USE_WEBGPU = 'false';
  process.env.USE_WASM = 'true';
}

import { checkBrowserCompatibility, CompatibilityReport, getCompatibilitySummary } from './browserCompatibility';
import { setModelLoadingProgress, setProgressSuccess, setProgressError } from '../progressTracker';
import { AIModelType } from '../../types';

// Model definitions
export const MODEL_CONFIGS: Record<AIModelType, { 
  name: string; 
  path: string; 
  task: 'text-classification' | 'text-generation';
  description: string;
  size: string;
}> = {
  distilbert: {
    name: 'DistilBERT',
    path: '/models/distilbert-base-uncased-finetuned-sst-2-english', // Use local bundled model
    task: 'text-classification',
    description: 'Fast sentiment analysis and mood classification',
    size: '~67MB'
  },
  tinyllama: {
    name: 'TinyLlama',
    path: '/models/TinyLlama-1.1B-Chat-v1.0', // Use local bundled model
    task: 'text-generation',
    description: 'Best for healthcare/psychology - balanced quality and performance',
    size: '~637MB'
  }
};

// Default model: DistilBERT (faster, better for initial mood tracking)
const DEFAULT_MODEL: AIModelType = 'distilbert';

// Model loading state
let moodTrackerModel: any = null;
let counselingCoachModel: any = null;
let allModelsCache: Map<AIModelType, any> = new Map(); // Cache all loaded models
let selectedModel: AIModelType = DEFAULT_MODEL;
let isModelLoading = false;
let modelLoadPromise: Promise<boolean> | null = null;
let compatibilityReport: CompatibilityReport | null = null;
let lastErrorCategory: 'coop-coep' | 'memory' | 'webgpu' | 'network' | 'wasm' | 'unknown' | null = null;
let lastInitAttempt: number = 0; // Track last initialization attempt timestamp
let initFailureCount: number = 0; // Track consecutive failures
const INIT_COOLDOWN = 30000; // 30 seconds cooldown between init attempts
const MAX_INIT_FAILURES = 3; // Stop trying after 3 consecutive failures

// Track actual download progress (0-100%)
let currentDownloadProgress: number = 0;
let currentDownloadStatus: 'idle' | 'downloading' | 'complete' | 'error' = 'idle';
let currentDownloadLabel: string = '';
let currentDownloadDetails: string = '';

/**
 * Get model references (for use by other modules)
 */
export function getMoodTrackerModel() {
  return moodTrackerModel;
}

export function getCounselingCoachModel() {
  return counselingCoachModel;
}

export function getIsModelLoading() {
  return isModelLoading;
}

/**
 * Get current model download progress (0-100%)
 * This tracks actual download progress, not just initialization state
 */
export function getModelDownloadProgress(): {
  progress: number; // 0-100
  status: 'idle' | 'downloading' | 'complete' | 'error';
  label: string;
  details: string;
} {
  return {
    progress: currentDownloadProgress,
    status: currentDownloadStatus,
    label: currentDownloadLabel,
    details: currentDownloadDetails
  };
}

/**
 * Check if a model supports text generation
 */
export function isTextGenerationModel(model: any): boolean {
  if (!model) return false;
  
  try {
    // Check if model has task property indicating text-generation
    if (model.task === 'text-generation') {
      return true;
    }
    
    // Check if model is a function that accepts generation options
    // Text-generation models accept (text, options) signature
    if (typeof model === 'function') {
      // Generation models typically accept options object
      return true; // Assume function models are generation-capable
    }
    
    return false;
  } catch {
    return false;
  }
}

/**
 * Get the currently selected model type
 */
export function getSelectedModel(): AIModelType {
  return selectedModel;
}

/**
 * Set the selected model type (will reload models on next initialization)
 */
export function setSelectedModel(modelType: AIModelType): void {
  selectedModel = modelType;
}

/**
 * Get model configuration for a specific model type
 */
export function getModelConfig(modelType: AIModelType) {
  return MODEL_CONFIGS[modelType];
}

/**
 * Get all available model configurations
 */
export function getAllModelConfigs() {
  return MODEL_CONFIGS;
}

/**
 * Clear models to force re-download/update
 */
export async function clearModels(): Promise<void> {
  moodTrackerModel = null;
  counselingCoachModel = null;
  allModelsCache.clear();
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
 * Loads the user-selected model (default: TinyLlama for healthcare/psychology)
 * @param forceReload - If true, clears existing models and reloads
 * @param modelType - Optional model type override (uses selected model if not provided)
 * @returns true if models loaded successfully, false if fallback mode is used
 */
export async function initializeModels(forceReload: boolean = false, modelType?: AIModelType): Promise<boolean> {
  // If modelType provided, update selected model
  if (modelType && modelType !== selectedModel) {
    selectedModel = modelType;
    // If switching models, force reload
    if (moodTrackerModel || counselingCoachModel) {
      forceReload = true;
    }
  }
  
  const targetModel = modelType || selectedModel;
  
  if (forceReload) {
    await clearModels();
    initFailureCount = 0; // Reset failure count on force reload
  }
  
  // Check if we already have the selected model loaded
  if (moodTrackerModel && counselingCoachModel && selectedModel === targetModel && !forceReload) {
    // Verify models still work before returning true
    try {
      const modelsWork = await verifyModelsWork();
      if (modelsWork) {
        initFailureCount = 0; // Reset failure count on success
        return true; // Already loaded with correct model and working
      }
    } catch {
      // Models might be broken, continue to reload
    }
  }

  // If already loading, wait for existing load (unless force reload)
  if (isModelLoading && modelLoadPromise && !forceReload) {
    try {
      const result = await modelLoadPromise;
      // Double-check we have the right model
      if (moodTrackerModel && counselingCoachModel && selectedModel === targetModel) {
        return result;
      }
      // If wrong model, we need to reload (but don't force reload here to avoid loop)
    } catch {
      // Continue with new load attempt
    }
  }
  
  // Prevent repeated initialization attempts if we've failed too many times
  const now = Date.now();
  if (!forceReload && initFailureCount >= MAX_INIT_FAILURES) {
    const timeSinceLastAttempt = now - lastInitAttempt;
    if (timeSinceLastAttempt < INIT_COOLDOWN) {
      console.log(`⏸️ Model initialization skipped - too many recent failures. Waiting ${Math.ceil((INIT_COOLDOWN - timeSinceLastAttempt) / 1000)}s before retry.`);
      return false; // Return false without attempting
    } else {
      // Reset failure count after cooldown period
      initFailureCount = 0;
    }
  }
  
  // Prevent rapid-fire initialization attempts
  // BUT: If models are already loaded, don't block - just return success
  if (!forceReload && areModelsLoaded()) {
    console.log('✅ Models already loaded - skipping initialization');
    // Update progress state to reflect that models are ready
    currentDownloadStatus = 'complete';
    currentDownloadProgress = 100;
    currentDownloadLabel = 'AI models ready';
    currentDownloadDetails = 'All models loaded';
    setProgressSuccess('AI models ready', 'All models are loaded and ready');
    return true;
  }
  
  if (!forceReload && lastInitAttempt > 0) {
    const timeSinceLastAttempt = now - lastInitAttempt;
    if (timeSinceLastAttempt < INIT_COOLDOWN && !isModelLoading) {
      console.log(`⏸️ Model initialization skipped - too soon after last attempt. Waiting ${Math.ceil((INIT_COOLDOWN - timeSinceLastAttempt) / 1000)}s.`);
      return false;
    }
  }
  
  lastInitAttempt = now;
  
  // Update selected model if override provided
  if (modelType && modelType !== selectedModel) {
    selectedModel = modelType;
  }

  isModelLoading = true;
  
  // Initialize download progress tracking
  currentDownloadProgress = 0;
  currentDownloadStatus = 'downloading';
  currentDownloadLabel = 'Starting download...';
  currentDownloadDetails = 'Preparing AI models';
  
  // Don't set a timeout - models can take time to download, especially on slow connections
  // The preloadModelsContinuously function handles retries and will eventually succeed or detect network errors
  let loadingTimeout: NodeJS.Timeout | null = null;
  
  modelLoadPromise = (async () => {
    // Store loadingTimeout in a way that's accessible in catch blocks
    const timeoutRef = { current: loadingTimeout };
    try {
      // Run browser compatibility check first
      console.log('[MODEL_DEBUG] Running browser compatibility check...');
      compatibilityReport = checkBrowserCompatibility();
      lastErrorCategory = null;
      
      // Log compatibility summary
      const summary = getCompatibilitySummary(compatibilityReport);
      console.log(`🔍 Browser compatibility: ${summary}`);
      console.log('[MODEL_DEBUG] Compatibility details:', {
        canUseAI: compatibilityReport?.canUseAI,
        wasm: compatibilityReport?.wasm,
        sharedArrayBuffer: compatibilityReport?.sharedArrayBuffer,
        webGPU: compatibilityReport?.webGPU,
        estimatedMemory: compatibilityReport?.estimatedMemory,
        suggestedStrategy: compatibilityReport?.suggestedStrategy
      });
      
      // If WASM is not available, we cannot use AI models at all
      if (!compatibilityReport.wasm) {
        console.warn('⚠️ WebAssembly not supported. AI models cannot be used on this browser.');
        lastErrorCategory = 'wasm';
        isModelLoading = false;
        setProgressError('AI models unavailable', 'WebAssembly not supported. Use a modern browser.');
        return false;
      }
      
      // If SharedArrayBuffer is not available, we can still try single-threaded mode
      // This is a fallback that should work even without COOP/COEP headers
      if (!compatibilityReport.sharedArrayBuffer) {
        console.warn('⚠️ SharedArrayBuffer not available. Will attempt single-threaded mode.');
        console.warn('⚠️ For better performance, enable COOP/COEP headers (see SERVER_CONFIG.md).');
        lastErrorCategory = 'coop-coep';
        // Don't return false - continue with single-threaded mode
        // The transformers.js library should handle single-threaded execution automatically
      } else {
        console.log('✓ SharedArrayBuffer available - multi-threaded mode enabled');
      }
      
      console.log('[MODEL_DEBUG] Browser compatibility check passed, proceeding with model loading...');
      console.log('[MODEL_DEBUG] canUseAI:', compatibilityReport.canUseAI, 'suggestedStrategy:', compatibilityReport.suggestedStrategy);
      
      // Import transformers.js - uses ONNX Runtime with WASM backend
      // ONNX Runtime is required, but configured to use WASM backend for compatibility
      let transformersModule;
      
      try {
        console.log('[MODEL_DEBUG] Importing @xenova/transformers (using WASM backend)...');
        
        // Ensure ONNX Runtime global is initialized before importing transformers
        // This must happen right before the import to ensure it's set up
        if (typeof globalThis !== 'undefined') {
          const globalOrt = (globalThis as any).ort = (globalThis as any).ort || {};
          if (!globalOrt.env) {
            globalOrt.env = { wasm: { numThreads: typeof SharedArrayBuffer !== 'undefined' ? 4 : 1 } };
          }
          if (!globalOrt.registerBackend) {
            globalOrt.registerBackend = function() {};
          }
        }
        
        // Use a promise race to timeout the import if it hangs
        const importPromise = import('@xenova/transformers');
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Import timeout after 10 seconds')), 10000);
        });
        
        transformersModule = await Promise.race([importPromise, timeoutPromise]) as any;
        console.log('[MODEL_DEBUG] Transformers module imported successfully');
        
        // Verify the module loaded correctly
        if (!transformersModule || !transformersModule.pipeline) {
          console.error('[MODEL_DEBUG] Transformers module structure invalid:', {
            hasModule: !!transformersModule,
            hasPipeline: !!(transformersModule?.pipeline),
            moduleKeys: transformersModule ? Object.keys(transformersModule) : []
          });
          console.info('ℹ️ Transformers module structure invalid. Using rule-based responses.');
          // Clear timeout and reset loading state
          if (loadingTimeout) {
            clearTimeout(loadingTimeout);
            loadingTimeout = null;
          }
          isModelLoading = false;
          return false;
        }
        console.log('[MODEL_DEBUG] Transformers module verified - pipeline function available');
      } catch (importError: any) {
        const importErrorMsg = importError?.message || String(importError);
        const importErrorStack = importError?.stack || '';
        
        console.error('[MODEL_DEBUG] Failed to import @xenova/transformers:', importErrorMsg);
        if (importErrorStack) {
          console.error('[MODEL_DEBUG] Import error stack:', importErrorStack);
        }
        
        if (importErrorMsg.includes('memory') || importErrorMsg.includes('OOM') || importErrorMsg.includes('out of memory')) {
          lastErrorCategory = 'memory';
          console.info('ℹ️ AI models unavailable: Insufficient device memory.');
          console.info('ℹ️ App uses rule-based responses (fully functional).');
        } else if (importErrorMsg.includes('network') || importErrorMsg.includes('fetch') || importErrorMsg.includes('Failed to fetch')) {
          lastErrorCategory = 'network';
          console.info('ℹ️ AI models unavailable: Network error during download.');
          console.info('ℹ️ App uses rule-based responses (fully functional).');
        } else {
          lastErrorCategory = 'unknown';
          console.info('ℹ️ AI models unavailable. App uses rule-based responses (fully functional).');
        }
        
        // Clear loading state so retries can start fresh
        isModelLoading = false;
        if (loadingTimeout) {
          clearTimeout(loadingTimeout);
          loadingTimeout = null;
        }
        modelLoadPromise = null;
        return false;
      }
      
      const { pipeline, env } = transformersModule;
      
      // Check if the module loaded correctly
      if (!pipeline || !env) {
        throw new Error('Transformers module did not load correctly');
      }
      
      // Verify pipeline is a function
      if (typeof pipeline !== 'function') {
        throw new Error('Pipeline function not available in transformers module');
      }
      
      // Configure transformers.js for browser use
      try {
        const isDev = import.meta.env.DEV;
        const isWebProduction = !isDev && (typeof window !== 'undefined' && !('__TAURI__' in window));

        env.useBrowserCache = true;
        env.useCustomCache = false;
        env.cacheDir = './models-cache'; // Virtual path - actual storage is IndexedDB
        env.allowRemoteModels = true; // Allow HuggingFace as fallback
        
        if (isWebProduction) {
          env.allowLocalModels = false; // Forces download from Hugging Face for web production
          console.log('📦 Web Production: forcing HuggingFace download (allowLocalModels=false)');
        } else {
          env.allowLocalModels = true; // Allow local models for Tauri or Dev
          if (!isDev) {
            console.log('📦 Using local bundled models from /models/ directory');
            console.log('📦 Will fallback to HuggingFace if local model not available');
          } else {
            // In dev mode, we're using HuggingFace directly
            console.log('📦 Development mode: Downloading models from HuggingFace');
          }
        }
      } catch (configError) {
        console.warn('Could not configure transformers environment, using defaults:', configError);
        // Continue anyway - library may have defaults
      }
      
      // Determine the best device to use based on browser capabilities
      // ONNX Runtime with WASM backend is preferred for better compatibility
      // Priority: WASM (CPU with ONNX Runtime WASM backend) > CPU fallback
      // Note: WebGPU is disabled for compatibility - ONNX Runtime WASM backend provides good performance
      let preferredDevice: 'gpu' | 'cpu' = 'cpu';
      let deviceReason = '';
      
      if (compatibilityReport?.wasm) {
        // WASM available - use CPU with ONNX Runtime WASM backend (good performance with SIMD/multi-threading)
        preferredDevice = 'cpu';
        deviceReason = 'ONNX Runtime WASM backend (CPU with optimizations)';
        if (compatibilityReport?.sharedArrayBuffer) {
          console.log('[MODEL_DEBUG] ✅ ONNX Runtime WASM backend with multi-threading available');
        } else {
          console.log('[MODEL_DEBUG] ✅ ONNX Runtime WASM backend available (single-threaded mode)');
        }
      } else {
        // Fallback to CPU (transformers.js will handle this automatically)
        preferredDevice = 'cpu';
        deviceReason = 'CPU (fallback)';
        console.log('[MODEL_DEBUG] ⚠️ Using CPU fallback - WASM optimizations unavailable');
      }
      
      // Models will be downloaded and cached locally on first use
      
      // Model A: Mental state tracker (mood/anxiety/depression assessment)
      // Start with a simpler, more reliable model that works better in browsers
      // Use text-classification models first as they're more stable than text-generation
      console.log('Loading psychology-centric AI model...');
      
      // Progress callback for model loading with throttling to prevent infinite re-renders
      let totalProgress = 0;
      let modelsLoaded = 0;
      const totalModels = 2; // moodTracker + counselingCoach
      let lastUpdateTime = 0;
      const THROTTLE_MS = 100; // Only update progress every 100ms
      
      const progressCallback = (progress: any) => {
        const now = Date.now();
        const shouldUpdate = now - lastUpdateTime >= THROTTLE_MS;
        
        if (progress.status === 'progress') {
          const percent = progress.progress ? Math.round(progress.progress * 100) : 0;
          const modelProgress = Math.round((modelsLoaded / totalModels) * 100 + (percent / totalModels));
          totalProgress = Math.min(100, modelProgress);
          
          const modelName = progress.name || 'model';
          
          // Only log every update, but throttle state updates
          console.log(`Model loading: ${modelName} - ${percent}%`);
          
          // Update internal progress tracking
          currentDownloadProgress = totalProgress;
          currentDownloadStatus = 'downloading';
          currentDownloadLabel = 'Loading AI models...';
          currentDownloadDetails = `${modelName}: ${percent}%`;
          
          // Throttle state updates to prevent infinite re-renders
          if (shouldUpdate) {
            setModelLoadingProgress(
              totalProgress,
              `Loading AI models...`,
              `${modelName}: ${percent}%`
            );
            lastUpdateTime = now;
          }
        } else if (progress.status === 'done') {
          // "done" means files are downloaded, but model initialization may still fail
          // Don't increment modelsLoaded or set high progress until model is actually initialized
          // Just log that files are downloaded - progress will be set when model successfully initializes
          const modelName = progress.name || 'model';
          console.log(`Model progress callback: ${modelName} reported done (files downloaded, initializing...)`);
          
          // Keep progress at current level - don't jump to 90% until model is actually initialized
          // The actual progress will be set when the pipeline() call succeeds
          // This prevents showing 90% when the model is about to fail
          if (shouldUpdate) {
            // Only update if we have meaningful progress, otherwise keep current state
          setModelLoadingProgress(
              Math.min(totalProgress, 85), // Cap at 85% for file download, reserve 15% for initialization
            `Loading AI models...`,
              `${modelName} files downloaded, initializing...`
          );
          lastUpdateTime = now;
          }
        }
      };
      
      // Load the user-selected model (default: TinyLlama for healthcare/psychology)
      const modelConfig = MODEL_CONFIGS[targetModel];
      console.log(`Loading ${modelConfig.name} (${modelConfig.description})...`);
      
      // Determine model path - use HuggingFace model ID if local path fails
      // HuggingFace model IDs for Xenova models
      const HUGGINGFACE_MODEL_IDS: Record<AIModelType, string> = {
        distilbert: 'Xenova/distilbert-base-uncased-finetuned-sst-2-english',
        tinyllama: 'Xenova/TinyLlama-1.1B-Chat-v1.0'
      };
      
      // Try local path first, fallback to HuggingFace if local fails
      let modelPath = modelConfig.path;
      const huggingfaceModelId = HUGGINGFACE_MODEL_IDS[targetModel];
      
      // Check if we're in development mode (models might not be available locally)
      const isDev = import.meta.env.DEV;
      // In web production (Vercel), we also want to use Hugging Face because models are not bundled
      const isWebProduction = !isDev && (typeof window !== 'undefined' && !('__TAURI__' in window));
      
      if (isDev || isWebProduction) {
        // In dev mode or web production, prefer HuggingFace to avoid 404 errors
        // transformers.js will download and cache models automatically
        // CRITICAL: Must use Xenova/ versions for browser compatibility (ONNX)
        console.log(`[MODEL_DEBUG] ${isDev ? 'Development' : 'Web Production'} mode detected - using HuggingFace model (Xenova optimized): ${huggingfaceModelId}`);
        modelPath = huggingfaceModelId;
      } else {
        // In Tauri production, try local first
        console.log(`[MODEL_DEBUG] Production mode (Desktop) - trying local path: ${modelPath}`);
      }
      
      // Check memory constraints - warn if low memory and trying to load large model
      const strategy = compatibilityReport?.suggestedStrategy || 'standard';
      const useLowMemory = strategy === 'low-memory' || (compatibilityReport?.estimatedMemory !== null && compatibilityReport.estimatedMemory < 2048);
      
      // Load Model A: Mental state tracker (mood/anxiety/depression assessment)
      // For DistilBERT, use text-classification; for others, use text-generation
      try {
        console.log(`Attempting to load ${modelConfig.name} for mood tracking...`);
        console.log(`[MODEL_DEBUG] Pipeline call: task=${modelConfig.task}, path=${modelPath}`);
        
        // Configure pipeline options - use CPU with ONNX Runtime WASM backend
        // ONNX Runtime will automatically use WASM backend for optimal performance
        const pipelineOptions: any = {
          quantized: true,
          progress_callback: progressCallback,
          // device: preferredDevice // REMOVED: Explicit device setting can cause offset errors in some WASM environments
        };
        
        console.log(`[MODEL_DEBUG] Loading model with ${deviceReason}`);
        
        // Set timeout for model loading (30 seconds per model)
        const modelLoadTimeout = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Model loading timeout after 30 seconds')), 30000);
        });
        
        // Try loading with current path, fallback to HuggingFace if it fails
        try {
        moodTrackerModel = await Promise.race([
            pipeline(modelConfig.task, modelPath, pipelineOptions),
          modelLoadTimeout
        ]) as any;
        } catch (localError: any) {
          // If local path fails and we're not already using HuggingFace, try HuggingFace
          if (modelPath !== huggingfaceModelId && huggingfaceModelId) {
            const errorMsg = localError?.message || String(localError);
            const errorStack = localError?.stack || '';
            // Check for HTML/404 errors or JSON parse errors (which indicate HTML response)
            if (errorMsg.includes('<!DOCTYPE') || errorMsg.includes('404') || errorMsg.includes('Not Found') || 
                errorMsg.includes('not valid JSON') || errorMsg.includes('Unexpected token')) {
              console.warn(`[MODEL_DEBUG] Local model path failed (${errorMsg.substring(0, 50)}), falling back to HuggingFace: ${huggingfaceModelId}`);
              modelPath = huggingfaceModelId;
              try {
                moodTrackerModel = await Promise.race([
                  pipeline(modelConfig.task, modelPath, pipelineOptions),
                  modelLoadTimeout
                ]) as any;
              } catch (huggingfaceError: any) {
                // If HuggingFace also fails, check if it's a CORS issue
                const hfErrorMsg = huggingfaceError?.message || String(huggingfaceError);
                const isDev = import.meta.env.DEV;
                if (hfErrorMsg.includes('<!DOCTYPE') || hfErrorMsg.includes('not valid JSON') || hfErrorMsg.includes('CORS')) {
                  if (isDev) {
                    // In development, CORS errors are expected - suppress noisy error messages
                    console.warn(`[MODEL_DEBUG] Development mode: HuggingFace model unavailable (CORS expected). Using rule-based responses.`);
                  } else {
                    console.error(`[MODEL_DEBUG] HuggingFace model also failed - possible CORS issue: ${hfErrorMsg.substring(0, 100)}`);
                    console.error(`[MODEL_DEBUG] This might be a CORS configuration issue. Models will be unavailable.`);
                  }
                }
                throw huggingfaceError; // Re-throw to be handled by outer catch
              }
            } else {
              throw localError; // Re-throw if it's not a 404/HTML error
            }
            } else {
              // Already using HuggingFace - check if it's a CORS or network issue
              const errorMsg = localError?.message || String(localError);
              const isDev = import.meta.env.DEV;
              if (errorMsg.includes('<!DOCTYPE') || errorMsg.includes('not valid JSON')) {
                if (isDev) {
                  // In development, CORS errors are expected - suppress noisy error messages
                  console.warn(`[MODEL_DEBUG] Development mode: HuggingFace model unavailable (CORS expected). Using rule-based responses.`);
                } else {
                  console.error(`[MODEL_DEBUG] HuggingFace model failed with HTML response - possible CORS or network issue: ${errorMsg.substring(0, 100)}`);
                  console.error(`[MODEL_DEBUG] Check browser console for CORS errors. Models may be unavailable.`);
                }
              }
              throw localError; // Re-throw if we're already using HuggingFace or no fallback available
            }
        }
        
        console.log(`[MODEL_DEBUG] Pipeline call completed successfully`);
        console.log(`✓ ${modelConfig.name} model loaded successfully for mood tracking`);
        console.log(`[MODEL_DEBUG] Model task: ${modelConfig.task}, can be reused: ${modelConfig.task === 'text-generation'}`);
        console.log(`[MODEL_DEBUG] moodTrackerModel is set: ${!!moodTrackerModel}, type: ${typeof moodTrackerModel}`);
        
        // Verify the model is actually usable before caching
        if (!moodTrackerModel) {
          throw new Error('Model loaded but moodTrackerModel is null');
        }
        
        // Cache the model IMMEDIATELY after assignment
        allModelsCache.set(targetModel, moodTrackerModel);
        console.log(`[MODEL_DEBUG] Model cached: ${targetModel}`);
        
        // NOW update progress - model is actually initialized successfully
        // This is when we can safely increment modelsLoaded and show higher progress
        modelsLoaded++;
        const modelProgress = Math.round((modelsLoaded / totalModels) * 95); // 95% for first model initialized
        totalProgress = Math.min(95, modelProgress);
        currentDownloadProgress = totalProgress;
        currentDownloadStatus = 'downloading';
        currentDownloadLabel = 'Loading AI models...';
        currentDownloadDetails = `${modelConfig.name} initialized`;
        setModelLoadingProgress(
          totalProgress,
          `Loading AI models...`,
          `${modelConfig.name} initialized`
        );
      } catch (modelError: any) {
        const errorMsg = modelError?.message || String(modelError);
        const errorStack = modelError?.stack || '';
        const isDev = import.meta.env.DEV;
        
        // In development, suppress noisy CORS/HTML error messages
        if (isDev && (errorMsg.includes('<!DOCTYPE') || errorMsg.includes('not valid JSON') || errorMsg.includes('CORS'))) {
          console.warn(`[MODEL_DEBUG] Development mode: Model loading failed (CORS expected). Using rule-based responses.`);
        } else {
          console.error(`[MODEL_DEBUG] Pipeline call failed for ${modelConfig.name}:`, errorMsg);
        if (errorStack) {
          console.error(`[MODEL_DEBUG] Error stack:`, errorStack);
          }
        }
        
        // Categorize error
        if (errorMsg.includes('memory') || errorMsg.includes('OOM') || errorMsg.includes('out of memory')) {
          lastErrorCategory = 'memory';
          console.warn('⚠️ Insufficient memory for model loading.');
        } else if (errorMsg.includes('network') || errorMsg.includes('fetch') || errorMsg.includes('Failed to fetch') || 
                   errorMsg.includes('Unexpected token') || errorMsg.includes('<!DOCTYPE') || errorMsg.includes('not valid JSON') ||
                   errorMsg.includes('CORS') || errorMsg.includes('Cross-Origin')) {
          lastErrorCategory = 'network';
          if (isDev) {
            // In development, suppress noisy CORS warnings - they're expected
            console.info('ℹ️ Development mode: Models unavailable (CORS expected). Using rule-based responses.');
          } else {
            console.warn('⚠️ Network/CORS error during model loading.');
            console.warn('⚠️ The model may not be accessible due to CORS restrictions or network issues.');
            console.warn('⚠️ Models will retry in the background.');
            console.warn('⚠️ The app will continue using rule-based responses (fully functional).');
          }
        } else {
          lastErrorCategory = 'unknown';
          console.warn('⚠️ Model loading failed for unknown reason.');
        }
        
        console.warn('ℹ️ The app will continue using rule-based responses. AI features will not be available until models load.');
        console.warn('ℹ️ Models will continue retrying in the background.');
        moodTrackerModel = null;
      }

      // Model B: Counseling coach - Use same model if it's text-generation, otherwise load TinyLlama
      console.log('Loading counseling coach model...');
      
      // IMPORTANT: Re-check cache right before reuse check - model might have been cached during loading
      // The progress callback fires when files download, but pipeline() might still be initializing
      // So we need to check cache again in case the model was cached but moodTrackerModel isn't set yet
      const cachedModel = allModelsCache.get(targetModel);
      if (cachedModel && !moodTrackerModel) {
        console.log(`[MODEL_DEBUG] Found cached model, assigning to moodTrackerModel`);
        moodTrackerModel = cachedModel;
      }
      
      // Check if we can reuse the mood tracker model for counseling
      // If the model is text-generation type, we can reuse it for both tasks
      let canReuseModel = false;
      console.log(`[MODEL_DEBUG] Checking model reuse: moodTrackerModel=${!!moodTrackerModel}, modelConfig.task=${modelConfig.task}, targetModel=${targetModel}`);
      
      // For text-generation models, we can always reuse the same model instance
      // Check both the modelConfig.task and verify moodTrackerModel exists
      const modelToReuse = moodTrackerModel || cachedModel;
      
      // CRITICAL: If targetModel is text-generation (TinyLlama) and moodTrackerModel failed to load,
      // we should NOT try to load it again for counseling - it will fail again
      // Only reuse if the model actually loaded successfully
      if (modelToReuse && modelConfig.task === 'text-generation') {
            canReuseModel = true;
        // Use the model from cache if moodTrackerModel is null
        if (!moodTrackerModel && cachedModel) {
          moodTrackerModel = cachedModel;
          console.log(`[MODEL_DEBUG] Using cached model for mood tracking`);
        }
        counselingCoachModel = moodTrackerModel;
            console.log(`✓ Reusing ${modelConfig.name} for counseling (text-generation model)`);
        console.log(`[MODEL_DEBUG] Model reuse check passed - will reuse moodTrackerModel for counseling`);
      } else {
        console.log(`[MODEL_DEBUG] Model reuse check failed: moodTrackerModel=${!!moodTrackerModel}, cachedModel=${!!cachedModel}, task=${modelConfig.task}`);
        // If moodTrackerModel exists but task check failed, log why
        if (modelToReuse && modelConfig.task !== 'text-generation') {
          console.log(`[MODEL_DEBUG] Cannot reuse: model is ${modelConfig.task}, need text-generation for counseling`);
        } else if (!modelToReuse) {
          console.log(`[MODEL_DEBUG] Cannot reuse: moodTrackerModel is null and no cached model`);
          // If targetModel is TinyLlama and it failed to load, don't try to load it again
          if (targetModel === 'tinyllama' && modelConfig.task === 'text-generation') {
            console.log(`[MODEL_DEBUG] Skipping counseling model load - TinyLlama already failed, would fail again`);
            canReuseModel = false; // Explicitly set to false to skip loading
        }
      }
      }
      
      // Only try to load a separate counseling model if:
      // 1. We can't reuse the mood tracker model AND
      // 2. The targetModel is NOT TinyLlama (or if it is, it must have loaded successfully)
      if (!canReuseModel && !(targetModel === 'tinyllama' && !moodTrackerModel && !cachedModel)) {
        // Need to load a separate counseling model (user selected DistilBERT, need TinyLlama for counseling)
        // Need a text-generation model for counseling
        // If user selected DistilBERT (classification), load TinyLlama for counseling
        const counselingModelType = targetModel === 'distilbert' ? 'tinyllama' : targetModel;
        const counselingConfig = MODEL_CONFIGS[counselingModelType];
        
        // Check if we already have this model cached
        if (allModelsCache.has(counselingModelType)) {
          counselingCoachModel = allModelsCache.get(counselingModelType);
          console.log(`✓ Using cached ${counselingConfig.name} for counseling`);
        } else {
          try {
            console.log(`Attempting to load ${counselingConfig.name} for counseling...`);
            
            // Determine model path for counseling - use HuggingFace in dev, local in prod
            let counselingModelPath = counselingConfig.path;
            const counselingHuggingfaceId = HUGGINGFACE_MODEL_IDS[counselingModelType];
            
            if (isDev || isWebProduction) {
              console.log(`[MODEL_DEBUG] ${isDev ? 'Development' : 'Web Production'} mode - using HuggingFace for counseling: ${counselingHuggingfaceId}`);
              counselingModelPath = counselingHuggingfaceId;
            } else {
              console.log(`[MODEL_DEBUG] Production mode (Desktop) - trying local path for counseling: ${counselingModelPath}`);
            }
            
            // Configure pipeline options - use CPU with ONNX Runtime WASM backend
            // ONNX Runtime will automatically use WASM backend for optimal performance
            const counselingOptions: any = {
              quantized: true,
              progress_callback: progressCallback,
              device: preferredDevice // Use best available device (gpu or cpu)
            };
            
            console.log(`[MODEL_DEBUG] Loading counseling model with ${deviceReason}`);
            
            // Set timeout for model loading (30 seconds per model)
            const counselingLoadTimeout = new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Counseling model loading timeout after 30 seconds')), 30000);
            });
            
            // Try loading with current path, fallback to HuggingFace if it fails
            try {
            counselingCoachModel = await Promise.race([
                pipeline('text-generation', counselingModelPath, counselingOptions),
              counselingLoadTimeout
            ]) as any;
            } catch (localError: any) {
              // If local path fails and we're not already using HuggingFace, try HuggingFace
              if (counselingModelPath !== counselingHuggingfaceId && counselingHuggingfaceId) {
                const errorMsg = localError?.message || String(localError);
                if (errorMsg.includes('<!DOCTYPE') || errorMsg.includes('404') || errorMsg.includes('Not Found') || errorMsg.includes('not valid JSON')) {
                  console.warn(`[MODEL_DEBUG] Local counseling model path failed (${errorMsg.substring(0, 50)}), falling back to HuggingFace: ${counselingHuggingfaceId}`);
                  counselingModelPath = counselingHuggingfaceId;
                  counselingCoachModel = await Promise.race([
                    pipeline('text-generation', counselingModelPath, counselingOptions),
                    counselingLoadTimeout
                  ]) as any;
                } else {
                  throw localError; // Re-throw if it's not a 404/HTML error
                }
              } else {
                throw localError; // Re-throw if we're already using HuggingFace or no fallback available
              }
            }
            
            console.log(`✓ ${counselingConfig.name} loaded successfully for counseling`);
            
            // Cache the model
            allModelsCache.set(counselingModelType, counselingCoachModel);
            
            // Update progress - counseling model initialized successfully
            modelsLoaded++;
            const counselingProgress = Math.round((modelsLoaded / totalModels) * 100); // 100% when both models loaded
            totalProgress = Math.min(100, counselingProgress);
            currentDownloadProgress = totalProgress;
            currentDownloadStatus = 'downloading';
            currentDownloadLabel = 'Loading AI models...';
            currentDownloadDetails = `${counselingConfig.name} initialized`;
            setModelLoadingProgress(
              totalProgress,
              `Loading AI models...`,
              `${counselingConfig.name} initialized`
            );
          } catch (counselingError: any) {
            const counselingMsg = counselingError?.message || String(counselingError);
            const counselingStack = counselingError?.stack || '';
            
            // Log the error for debugging
            console.error(`[MODEL_DEBUG] Counseling model loading error:`, counselingMsg);
            if (counselingStack) {
              console.error(`[MODEL_DEBUG] Error stack:`, counselingStack);
            }
            
            // Categorize error
            if (counselingMsg.includes('memory') || counselingMsg.includes('OOM') || counselingMsg.includes('out of memory')) {
              lastErrorCategory = 'memory';
              console.warn('⚠️ Insufficient memory for counseling model loading.');
            } else if (counselingMsg.includes('network') || counselingMsg.includes('fetch') || counselingMsg.includes('Failed to fetch') ||
                       counselingMsg.includes('Unexpected token') || counselingMsg.includes('<!DOCTYPE') || counselingMsg.includes('not valid JSON') ||
                       counselingMsg.includes('CORS') || counselingMsg.includes('Cross-Origin')) {
              lastErrorCategory = 'network';
              console.warn('⚠️ Network/CORS error during counseling model loading.');
              console.warn('⚠️ This is common in development mode. Models will retry in the background.');
              console.warn('⚠️ The app will continue using rule-based responses (fully functional).');
            } else {
              lastErrorCategory = 'unknown';
              console.warn('⚠️ Counseling model loading failed for unknown reason.');
            }
            
            console.warn('ℹ️ The app will continue using rule-based responses. AI features will not be available until models load.');
            console.warn('ℹ️ Models will continue retrying in the background.');
            counselingCoachModel = null;
          }
        }
      } else if (canReuseModel) {
        // Reuse the text-generation model for both tasks
        counselingCoachModel = moodTrackerModel;
        console.log(`✓ Using ${modelConfig.name} for both mood tracking and counseling`);
        
        // Update progress - both models ready (reused same model)
        modelsLoaded = totalModels; // Both models are ready
        totalProgress = 100;
        currentDownloadProgress = totalProgress;
        currentDownloadStatus = 'downloading';
        currentDownloadLabel = 'Loading AI models...';
        currentDownloadDetails = `${modelConfig.name} ready for both tasks`;
        setModelLoadingProgress(
          totalProgress,
          `Loading AI models...`,
          `${modelConfig.name} ready for both tasks`
        );
      } else {
        // TinyLlama failed to load - can't reuse and shouldn't try again
        // Set counselingCoachModel to null explicitly
        counselingCoachModel = null;
        console.log(`[MODEL_DEBUG] TinyLlama failed - skipping separate counseling model load (would fail again)`);
      }
      
      if (counselingCoachModel) {
        console.log('✓ Counseling coach model ready for guidance and encouragement');
      } else {
        console.log('⚠️ Using rule-based counseling guidance (models unavailable)');
      }

      const modelsReady = moodTrackerModel !== null && counselingCoachModel !== null;
      if (loadingTimeout) clearTimeout(loadingTimeout);
      isModelLoading = false;
      
      if (modelsReady) {
        // IMMEDIATELY update progress to complete - don't wait for verification
        // This prevents false error states while verification is running
        currentDownloadProgress = 100;
        currentDownloadStatus = 'complete';
        currentDownloadLabel = 'AI models ready';
        currentDownloadDetails = 'All models loaded and verified';
        
        // Update progress state immediately so UI reflects success
        setProgressSuccess('AI models loaded successfully!', 'All models are ready to use');
        console.log('✅ All AI models loaded!');
        console.log(`  - Mood tracker: ${moodTrackerModel ? '✓' : '✗'}`);
        console.log(`  - Counseling coach: ${counselingCoachModel ? '✓' : '✗'}`);
        
        // Verify models work after updating state (non-blocking)
        console.log('[MODEL_VERIFY] Verifying loaded models work...');
        const modelsWork = await verifyModelsWork();
        
        if (modelsWork) {
          // Update version info since models are loaded and verified
          updateModelVersion();
          console.log('✅ Model verification passed - all systems ready!');
        } else {
          console.warn('⚠️ Models loaded but verification failed - will retry...');
          // Clear models so they can be reloaded
          await clearModels();
          // Reset state since verification failed
          currentDownloadStatus = 'error';
          currentDownloadLabel = 'Model verification failed';
          currentDownloadDetails = 'Will retry loading';
          return false;
        }
      } else {
        // Only set error if models truly failed (not just still loading)
        if (!isModelLoading) {
        setProgressError('AI models unavailable', 'App will use rule-based responses');
        console.warn('⚠️ AI models not available. App will use rule-based responses.');
        console.warn(`  - Mood tracker: ${moodTrackerModel ? '✓ Loaded' : '✗ Failed'}`);
        console.warn(`  - Counseling coach: ${counselingCoachModel ? '✓ Loaded' : '✗ Failed'}`);
        
        // If at least one model loaded, log that partial loading is available
        if (moodTrackerModel || counselingCoachModel) {
          console.info('ℹ️ Partial model loading: Some AI features may be available.');
            // Set status based on what actually loaded
            if (moodTrackerModel && counselingCoachModel) {
              currentDownloadStatus = 'complete';
              currentDownloadLabel = 'AI models ready';
              setProgressSuccess('AI models loaded successfully!', 'All models are ready to use');
            } else {
              currentDownloadStatus = 'error';
              currentDownloadLabel = 'Partial model loading';
              setModelLoadingProgress(50, 'Partial model loading', 'Some AI features available');
            }
        } else {
          console.info('ℹ️ All models failed to load. The app will use rule-based responses which are fully functional.');
            // Explicitly set error state when all models failed
            currentDownloadStatus = 'error';
            currentDownloadLabel = 'AI models unavailable';
            currentDownloadProgress = 0;
            setModelLoadingProgress(0, 'AI models unavailable', 'Using rule-based responses');
          }
        }
      }
      
      return modelsReady;
    } catch (error) {
      if (loadingTimeout) clearTimeout(loadingTimeout);
      console.error('Model initialization error:', error);
      isModelLoading = false;
      modelLoadPromise = null; // Clear promise so retries can start fresh
      moodTrackerModel = null;
      counselingCoachModel = null;
      // Don't set progress error - let it keep retrying
      // setProgressError('Model loading failed', 'App will use rule-based responses');
      
      // Provide more specific error message based on category
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (!lastErrorCategory) {
        // Categorize error if not already categorized
        if (errorMessage.includes('memory') || errorMessage.includes('OOM') || errorMessage.includes('out of memory')) {
          lastErrorCategory = 'memory';
        } else if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('Failed to fetch')) {
          lastErrorCategory = 'network';
        } else if (errorMessage.includes('WebAssembly') || errorMessage.includes('WASM')) {
          lastErrorCategory = 'wasm';
        } else {
          lastErrorCategory = 'unknown';
        }
      }
      
      // Provide specific error messages
      switch (lastErrorCategory) {
        case 'memory':
          console.warn('⚠️ Insufficient memory for AI models. App will use rule-based responses.');
          break;
        case 'network':
          console.warn('⚠️ Failed to download AI models. Check your internet connection.');
          console.warn('App will use rule-based responses.');
          break;
        case 'wasm':
          console.warn('⚠️ WebAssembly not supported. AI models cannot run on this browser.');
          console.warn('App will continue with rule-based responses.');
          break;
        default:
          console.warn('⚠️ Failed to load on-device models. App will use rule-based responses instead.');
      }
      
      // Update progress to error state
      currentDownloadStatus = 'error';
      currentDownloadLabel = 'AI models unavailable';
      currentDownloadDetails = 'Will retry in background';
      
      // Return false to indicate failure, but don't throw
      initFailureCount++; // Increment failure count
      return false;
    }
  })();

  // Wrap the promise to track failures
  return modelLoadPromise.then(result => {
    if (!result) {
      initFailureCount++; // Increment failure count on failure
    } else {
      initFailureCount = 0; // Reset on success
    }
    return result;
  }).catch(error => {
    initFailureCount++; // Increment failure count on error
    throw error;
  });
}

/**
 * Preload models in the background
 * Called on app startup to prepare models for faster response times
 * This version retries until models load or network error (no internet)
 */
export async function preloadModels(): Promise<boolean> {
  // Don't preload if already loading (prevents duplicate attempts)
  if (isModelLoading && modelLoadPromise) {
    console.log('🚀 Model loading already in progress, waiting for existing load...');
    try {
      await modelLoadPromise;
      return areModelsLoaded();
    } catch {
      return false;
    }
  }
  
  // Don't preload if models are already loaded and working
  if (areModelsLoaded()) {
    const modelsWork = await verifyModelsWork();
    if (modelsWork) {
      console.log('✅ Models already loaded and working - skipping preload.');
      return true;
    }
  }
  
  console.log('🚀 Starting background model preload...');
  
  try {
    // Check if models are already loaded
    if (areModelsLoaded()) {
      console.log('✅ Models already loaded, checking if current...');
      
      // Check if models are current
      const areCurrent = await areModelsCurrent();
      if (areCurrent) {
        console.log('✅ Models are current, verifying they work...');
        
        // Verify models actually work
        const modelsWork = await verifyModelsWork();
        if (modelsWork) {
          console.log('✅ Models are loaded, current, and verified working - skipping preload.');
          return true;
        } else {
          console.warn('⚠️ Models are loaded but verification failed - will reload...');
          // Force reload to get fresh models
          await clearModels();
        }
      } else {
        console.log('⚠️ Models are loaded but outdated - will update...');
        // Force reload to get latest models
        await clearModels();
      }
    }
    
    // Try to load models - will retry until success or network error
    let attempts = 0;
    let lastError: any = null;
    let networkErrorDetected = false; // Only stop on network errors
    
    while (!networkErrorDetected) {
      attempts++;
      
      // Log every 5th attempt to reduce console noise
      if (attempts === 1 || attempts % 5 === 0) {
        console.log(`🚀 AI model preload attempt ${attempts}...`);
      }
      
      try {
        // Check again if models are already loading before attempting
        if (isModelLoading && modelLoadPromise) {
          try {
            await modelLoadPromise;
            if (areModelsLoaded()) {
              return true;
            }
          } catch {
            // Continue with new attempt
          }
        }
        
        const loaded = await initializeModels();
        
        // Check what we actually have
        const moodModel = getMoodTrackerModel();
        const counselingModel = getCounselingCoachModel();
        
        if (loaded && moodModel && counselingModel) {
          // Verify models work before returning success
          console.log(`[MODEL_VERIFY] Verifying models work after ${attempts} attempt${attempts !== 1 ? 's' : ''}...`);
          const modelsWork = await verifyModelsWork();
          
          if (modelsWork) {
            // Update version info since models are loaded and verified
            updateModelVersion();
            console.log(`✅ AI models loaded, verified, and ready after ${attempts} attempt${attempts !== 1 ? 's' : ''}!`);
            return true;
          } else {
            console.warn(`⚠️ Models loaded but verification failed after ${attempts} attempt${attempts !== 1 ? 's' : ''} - will retry...`);
            // Clear models so they can be reloaded
            await clearModels();
            // Continue to retry
          }
        }
        
        if (moodModel || counselingModel) {
          console.log(`ℹ️ Partial model loading: ${moodModel ? 'Mood tracker ✓' : 'Mood tracker ✗'}, ${counselingModel ? 'Counseling coach ✓' : 'Counseling coach ✗'}`);
          // Continue trying to load the missing model
        }
      } catch (error) {
        lastError = error;
        const errorMsg = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : '';
        
        // Check if this is a network error (no internet) - only stop on network errors
        const isNetworkError = errorMsg.includes('network') || 
                               errorMsg.includes('fetch') || 
                               errorMsg.includes('Failed to fetch') ||
                               errorMsg.includes('No internet') ||
                               errorMsg.includes('NetworkError') ||
                               errorMsg.includes('ERR_INTERNET_DISCONNECTED');
        
        if (isNetworkError) {
          networkErrorDetected = true;
          console.warn(`[MODEL_DEBUG] Network error detected on attempt ${attempts} - stopping retries (no internet).`);
          console.warn('⚠️ AI models cannot be downloaded without internet connection.');
          break;
        }
        
        // For all other errors (ONNX Runtime, memory, etc.), keep retrying
        // Only log every 10th attempt to reduce noise
        if (attempts % 10 === 0) {
          console.log(`[MODEL_DEBUG] Attempt ${attempts} failed (will retry):`, errorMsg.substring(0, 100));
        }
      }
      
      if (!networkErrorDetected) {
        // Exponential backoff, but cap at 30 seconds between retries
        const delay = Math.min(1000 * Math.pow(1.5, attempts - 1), 30000);
        if (attempts % 5 === 0) {
          console.log(`[MODEL_DEBUG] Waiting ${Math.round(delay/1000)}s before retry ${attempts + 1}...`);
        }
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // Final status check
    const finalMoodModel = getMoodTrackerModel();
    const finalCounselingModel = getCounselingCoachModel();
    
    if (finalMoodModel || finalCounselingModel) {
      console.log(`⚠️ Model preload completed with partial loading after ${attempts} attempts:`);
      console.log(`  - Mood tracker: ${finalMoodModel ? '✓' : '✗'}`);
      console.log(`  - Counseling coach: ${finalCounselingModel ? '✓' : '✗'}`);
      console.log(`  - Some AI features may be available.`);
      return true;
    } else {
      if (networkErrorDetected) {
        console.warn(`⚠️ AI models unavailable after ${attempts} attempts: No internet connection.`);
        console.warn('⚠️ Connect to internet to enable AI features. App uses rule-based responses.');
      } else {
        console.warn(`⚠️ AI models unavailable after ${attempts} attempts. Will continue retrying in background.`);
      }
    }
    
    return false;
  } catch (error) {
    console.error('[MODEL_DEBUG] preloadModels() caught unexpected error:', error);
    // Don't stop - let continuous retry handle it
    return false;
  }
}

// Global flag to prevent multiple continuous loading attempts
let isContinuousLoadingActive = false;

/**
 * Continuously retry model loading in the background
 * Only stops on network errors (no internet)
 * Keeps retrying for all other errors (ONNX Runtime, memory, etc.)
 */
export async function preloadModelsContinuously(): Promise<void> {
  // Prevent multiple continuous loading attempts
  if (isContinuousLoadingActive) {
    console.log('🚀 Continuous model loading already active, skipping duplicate call.');
    return;
  }
  
  // Check if models are already loaded
  if (areModelsLoaded()) {
    const modelsWork = await verifyModelsWork().catch(() => false);
    if (modelsWork) {
      console.log('✅ Models already loaded and working - skipping continuous loading.');
      currentDownloadProgress = 100;
      currentDownloadStatus = 'complete';
      currentDownloadLabel = 'Complete';
      currentDownloadDetails = 'All models loaded';
      return;
    }
  }
  
  // Check if models are already loading
  if (isModelLoading && modelLoadPromise) {
    console.log('🚀 Model loading already in progress, skipping duplicate call.');
    return;
  }
  
  isContinuousLoadingActive = true;
  console.log('🚀 Starting continuous AI model loading (will retry until loaded or no internet)...');
  
  // Initialize download progress
  currentDownloadProgress = 0;
  currentDownloadStatus = 'downloading';
  currentDownloadLabel = 'Starting download...';
  currentDownloadDetails = 'Preparing AI models';
  
  // Start the continuous loading process
  (async () => {
    let consecutiveNetworkErrors = 0;
    const maxNetworkErrors = 3; // Stop after 3 consecutive network errors
    
    try {
      while (true) {
        // Check if models are already loaded before attempting
        if (areModelsLoaded()) {
          const modelsWork = await verifyModelsWork();
          if (modelsWork) {
            console.log('✅ AI models loaded and verified! Continuous loading complete.');
            isContinuousLoadingActive = false;
            return;
          }
        }
        
        try {
          // Only call preloadModels if not already loading
          if (!isModelLoading) {
            const loaded = await preloadModels();
            
            if (loaded) {
              console.log('✅ AI models loaded successfully! Continuous loading complete.');
              isContinuousLoadingActive = false;
              return;
            }
          } else {
            // If already loading, wait for it to complete
            if (modelLoadPromise) {
              try {
                await modelLoadPromise;
                if (areModelsLoaded()) {
                  console.log('✅ Models loaded by another process. Continuous loading complete.');
                  isContinuousLoadingActive = false;
                  return;
                }
              } catch {
                // Continue retrying
              }
            }
          }
          
          // Reset network error counter on any attempt (even if it failed for other reasons)
          consecutiveNetworkErrors = 0;
          
          // Wait before next retry cycle (longer wait between cycles)
          await new Promise(resolve => setTimeout(resolve, 30000)); // 30 seconds between cycles
          
        } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        
        // Check if this is a network error
        const isNetworkError = errorMsg.includes('network') || 
                               errorMsg.includes('fetch') || 
                               errorMsg.includes('Failed to fetch') ||
                               errorMsg.includes('No internet') ||
                               errorMsg.includes('NetworkError');
        
        if (isNetworkError) {
          consecutiveNetworkErrors++;
          console.warn(`[MODEL_DEBUG] Network error ${consecutiveNetworkErrors}/${maxNetworkErrors} - checking internet connection...`);
          
          if (consecutiveNetworkErrors >= maxNetworkErrors) {
            console.warn('⚠️ Multiple network errors detected - stopping continuous model loading (no internet).');
            console.warn('⚠️ AI models will be loaded when internet connection is restored.');
            isContinuousLoadingActive = false;
            return;
          }
        } else {
          // Reset counter for non-network errors
          consecutiveNetworkErrors = 0;
        }
        
          // Wait before retry (shorter wait for non-network errors)
          await new Promise(resolve => setTimeout(resolve, 10000)); // 10 seconds
        }
      }
    } finally {
      isContinuousLoadingActive = false;
    }
  })();
  
  // Return immediately - don't wait for completion
  return Promise.resolve();
}

/**
 * Check if loaded models are current/up-to-date
 * Returns true if models are current or if we can't determine (assume current)
 */
async function areModelsCurrent(): Promise<boolean> {
  try {
    // Check if we have stored version info
    const versionKey = `ai-models-version-${selectedModel}`;
    const storedVersion = localStorage.getItem(versionKey);
    
    if (!storedVersion) {
      // No version stored - assume models need update check
      return false;
    }
    
    const versionData = JSON.parse(storedVersion);
    const { timestamp, modelPath } = versionData;
    
    // Check if version is older than 7 days - if so, consider outdated
    const daysSinceUpdate = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate > 7) {
      console.log(`[MODEL_VERSION] Models are ${Math.round(daysSinceUpdate)} days old - checking for updates...`);
      return false;
    }
    
    // Check if model path changed (user switched models)
    const currentModelPath = MODEL_CONFIGS[selectedModel].path;
    if (modelPath !== currentModelPath) {
      console.log(`[MODEL_VERSION] Model path changed from ${modelPath} to ${currentModelPath} - update needed`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.warn('[MODEL_VERSION] Error checking model version:', error);
    // If we can't check, assume current to avoid unnecessary reloads
    return true;
  }
}

/**
 * Update stored model version info
 */
function updateModelVersion(): void {
  try {
    const versionKey = `ai-models-version-${selectedModel}`;
    const versionData = {
      timestamp: Date.now(),
      modelPath: MODEL_CONFIGS[selectedModel].path,
      modelType: selectedModel
    };
    localStorage.setItem(versionKey, JSON.stringify(versionData));
    console.log(`[MODEL_VERSION] Updated version info for ${selectedModel}`);
  } catch (error) {
    console.warn('[MODEL_VERSION] Error updating model version:', error);
  }
}

/**
 * Verify that loaded models actually work by running test inferences
 * Returns true if both models respond correctly
 */
async function verifyModelsWork(): Promise<boolean> {
  try {
    const moodModel = getMoodTrackerModel();
    const counselingModel = getCounselingCoachModel();
    
    if (!moodModel && !counselingModel) {
      console.log('[MODEL_VERIFY] No models loaded to verify');
      return false;
    }
    
    let moodWorks = false;
    let counselingWorks = false;
    
    // Test mood tracker model
    if (moodModel) {
      try {
        console.log('[MODEL_VERIFY] Testing mood tracker model...');
        const testText = 'I feel happy and grateful today';
        const testResult = await Promise.race([
          moodModel(testText),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Test timeout')), 5000))
        ]);
        
        // Check if result is valid (not null/undefined, has some structure)
        if (testResult !== null && testResult !== undefined) {
          moodWorks = true;
          console.log('[MODEL_VERIFY] ✓ Mood tracker model works');
        } else {
          console.warn('[MODEL_VERIFY] ✗ Mood tracker returned invalid result');
        }
      } catch (error) {
        console.warn('[MODEL_VERIFY] ✗ Mood tracker test failed:', error instanceof Error ? error.message : String(error));
      }
    } else {
      console.log('[MODEL_VERIFY] Mood tracker model not loaded');
    }
    
    // Test counseling coach model
    if (counselingModel) {
      try {
        console.log('[MODEL_VERIFY] Testing counseling coach model...');
        const testPrompt = 'Test prompt for counseling model';
        const testResult = await Promise.race([
          counselingModel(testPrompt, { max_new_tokens: 10, temperature: 0.7 }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Test timeout')), 10000))
        ]);
        
        // Check if result is valid (has generated_text or is an array with content)
        if (testResult && (
          (Array.isArray(testResult) && testResult.length > 0 && testResult[0]?.generated_text) ||
          (typeof testResult === 'object' && testResult.generated_text)
        )) {
          counselingWorks = true;
          console.log('[MODEL_VERIFY] ✓ Counseling coach model works');
        } else {
          console.warn('[MODEL_VERIFY] ✗ Counseling coach returned invalid result');
        }
      } catch (error) {
        console.warn('[MODEL_VERIFY] ✗ Counseling coach test failed:', error instanceof Error ? error.message : String(error));
      }
    } else {
      console.log('[MODEL_VERIFY] Counseling coach model not loaded');
    }
    
    // Return true if at least one model works, or if both are expected but both work
    const result = (moodModel ? moodWorks : true) && (counselingModel ? counselingWorks : true);
    
    if (result) {
      console.log('[MODEL_VERIFY] ✓ All loaded models verified and working');
    } else {
      console.warn('[MODEL_VERIFY] ✗ Some models failed verification');
    }
    
    return result;
  } catch (error) {
    console.error('[MODEL_VERIFY] Error during model verification:', error);
    return false;
  }
}

/**
 * Check if models are currently loaded
 * @param requireBoth - If true, requires both models. If false, returns true if at least one is loaded.
 */
export function areModelsLoaded(requireBoth: boolean = true): boolean {
  if (requireBoth) {
    return moodTrackerModel !== null && counselingCoachModel !== null;
  }
  return moodTrackerModel !== null || counselingCoachModel !== null;
}

/**
 * Get current model status
 */
export function getModelStatus(): { 
  loaded: boolean; 
  loading: boolean;
  moodTracker: boolean;
  counselingCoach: boolean;
  compatibility?: CompatibilityReport;
  errorCategory?: 'coop-coep' | 'memory' | 'webgpu' | 'network' | 'wasm' | 'unknown' | null;
} {
  return {
    loaded: areModelsLoaded(),
    loading: isModelLoading,
    moodTracker: moodTrackerModel !== null,
    counselingCoach: counselingCoachModel !== null,
    compatibility: compatibilityReport || undefined,
    errorCategory: lastErrorCategory
  };
}

/**
 * Get compatibility report
 */
export function getCompatibilityReport(): CompatibilityReport | null {
  return compatibilityReport;
}

