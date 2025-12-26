/**
 * AI MODEL LOADING & MANAGEMENT
 * 
 * Handles loading and initialization of on-device AI models.
 * Uses @xenova/transformers for browser-based inference.
 * 
 * Model Selection:
 * - 'tinyllama' (default): Best for healthcare/psychology - balanced quality and performance
 * - 'distilbert': Fast classification, good for mood assessment
 * - 'minicpm': Higher quality, larger model for complex analysis
 */

import { checkBrowserCompatibility, CompatibilityReport, getCompatibilitySummary } from './browserCompatibility';
import { setModelLoadingProgress, setProgressSuccess, setProgressError } from '../progressTracker';
import { AIModelType } from '../types';

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
    path: 'Xenova/distilbert-base-uncased-finetuned-sst-2-english',
    task: 'text-classification',
    description: 'Fast sentiment analysis and mood classification',
    size: '~67MB'
  },
  tinyllama: {
    name: 'TinyLlama',
    path: 'Xenova/TinyLlama-1.1B-Chat-v1.0',
    task: 'text-generation',
    description: 'Best for healthcare/psychology - balanced quality and performance',
    size: '~637MB'
  },
  minicpm: {
    name: 'MiniCPM',
    path: 'Xenova/MiniCPM-2-4B-ONNX',
    task: 'text-generation',
    description: 'Higher quality for complex analysis and detailed reports',
    size: '~1.5GB'
  }
};

// Default model: TinyLlama (best for healthcare/psychology)
const DEFAULT_MODEL: AIModelType = 'tinyllama';

// Model loading state
let moodTrackerModel: any = null;
let counselingCoachModel: any = null;
let allModelsCache: Map<AIModelType, any> = new Map(); // Cache all loaded models
let selectedModel: AIModelType = DEFAULT_MODEL;
let isModelLoading = false;
let modelLoadPromise: Promise<boolean> | null = null;
let compatibilityReport: CompatibilityReport | null = null;
let lastErrorCategory: 'coop-coep' | 'memory' | 'webgpu' | 'network' | 'wasm' | 'unknown' | null = null;

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
  }
  
  // Check if we already have the selected model loaded
  if (moodTrackerModel && counselingCoachModel && selectedModel === targetModel && !forceReload) {
    return true; // Already loaded with correct model
  }

  if (isModelLoading && modelLoadPromise && !forceReload) {
    // Wait for existing load and return its result
    try {
      await modelLoadPromise;
      return moodTrackerModel !== null && counselingCoachModel !== null;
    } catch {
      return false;
    }
  }
  
  // Update selected model if override provided
  if (modelType && modelType !== selectedModel) {
    selectedModel = modelType;
  }

  isModelLoading = true;
  
  // Set a timeout to prevent infinite loading
  let loadingTimeout: NodeJS.Timeout | null = null;
  loadingTimeout = setTimeout(() => {
    if (isModelLoading) {
      console.warn('⚠️ Model loading timeout - stopping after 60 seconds');
      isModelLoading = false;
      setProgressError('Model loading timeout', 'Models took too long to load. Using rule-based responses.');
    }
  }, 60000);
  
  modelLoadPromise = (async () => {
    try {
      // Run browser compatibility check first
      compatibilityReport = checkBrowserCompatibility();
      lastErrorCategory = null;
      
      // Log compatibility summary
      const summary = getCompatibilitySummary(compatibilityReport);
      console.log(`🔍 Browser compatibility: ${summary}`);
      
      // If AI cannot be used at all (e.g., no WASM), skip initialization
      if (!compatibilityReport.canUseAI) {
        console.warn('⚠️ AI models cannot be used on this browser. Using rule-based responses.');
        if (!compatibilityReport.wasm) {
          lastErrorCategory = 'wasm';
        } else if (!compatibilityReport.sharedArrayBuffer) {
          lastErrorCategory = 'coop-coep';
          console.warn('⚠️ SharedArrayBuffer not available. Enable COOP/COEP headers or use HTTP/HTTPS server.');
        }
        isModelLoading = false;
        setProgressError('AI models unavailable', 'SharedArrayBuffer not available. Use HTTP/HTTPS server with COOP/COEP headers.');
        return false;
      }
      
      // Set up environment before importing
      if (typeof window !== 'undefined') {
        (window as any).__TRANSFORMERS_ENV__ = (window as any).__TRANSFORMERS_ENV__ || {};
      }
      
      // Dynamic import with error boundary
      // The registerBackend error is a known browser compatibility issue
      // We'll catch it gracefully and use rule-based responses
      let transformersModule;
      
      try {
        // Attempt import - this may fail with registerBackend error in some browsers
        transformersModule = await import('@xenova/transformers');
        
        // Verify the module loaded correctly
        if (!transformersModule || !transformersModule.pipeline) {
          console.info('ℹ️ Transformers module structure invalid. Using rule-based responses.');
          return false;
        }
      } catch (importError: any) {
        // Catch the registerBackend error and other import errors
        const errorMsg = importError?.message || String(importError);
        const errorStack = importError?.stack || '';
        
        // Categorize the error
        if (errorMsg.includes('registerBackend') || errorMsg.includes('ort-web') || errorStack.includes('ort-web')) {
          lastErrorCategory = 'coop-coep';
          console.info('ℹ️ AI models unavailable: ONNX Runtime backend initialization failed.');
          if (compatibilityReport && !compatibilityReport.sharedArrayBuffer) {
            console.info('ℹ️ This is likely due to missing COOP/COEP headers. See SERVER_CONFIG.md for setup instructions.');
          }
          console.info('ℹ️ App uses rule-based responses (fully functional).');
        } else if (errorMsg.includes('memory') || errorMsg.includes('OOM') || errorMsg.includes('out of memory')) {
          lastErrorCategory = 'memory';
          console.info('ℹ️ AI models unavailable: Insufficient device memory.');
          console.info('ℹ️ App uses rule-based responses (fully functional).');
        } else if (errorMsg.includes('network') || errorMsg.includes('fetch') || errorMsg.includes('Failed to fetch')) {
          lastErrorCategory = 'network';
          console.info('ℹ️ AI models unavailable: Network error during download.');
          console.info('ℹ️ App uses rule-based responses (fully functional).');
        } else {
          lastErrorCategory = 'unknown';
          console.info('ℹ️ AI models unavailable. App uses rule-based responses (fully functional).');
        }
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
      
      // Configure transformers.js for browser use based on compatibility
      // Configure BEFORE any backend access to avoid registerBackend errors
      try {
        env.allowLocalModels = true;
        env.allowRemoteModels = true;
        env.useBrowserCache = true;
        env.useCustomCache = false;
        
        // Configure model loading and storage
        // Transformers.js automatically:
        // 1. Downloads models from HuggingFace on first use
        // 2. Stores them in browser IndexedDB (when useBrowserCache = true)
        // 3. Loads from IndexedDB cache on subsequent runs (instant, no download)
        // 
        // Storage location: Browser IndexedDB (managed by transformers.js)
        // Cache key format: transformers-cache-{model-name}
        // Models persist across browser sessions automatically
        env.cacheDir = './models-cache'; // Virtual path - actual storage is IndexedDB
        env.useBrowserCache = true; // Enable IndexedDB caching
        env.allowRemoteModels = true; // Allow downloading from HuggingFace
        
        console.log('📦 Models will download from HuggingFace and cache in IndexedDB');
        
        // Configure based on compatibility report
        if (compatibilityReport) {
          // Disable WebGPU if not available
          if (!compatibilityReport.webGPU) {
            try {
              env.backends = env.backends || {};
              // Prefer CPU backend when WebGPU unavailable
              console.log('⚠️ WebGPU unavailable, using CPU backend');
            } catch (e) {
              // Ignore if backends config not available
            }
          }
          
          // Use single-threaded mode if SharedArrayBuffer unavailable
          if (!compatibilityReport.sharedArrayBuffer) {
            console.log('⚠️ SharedArrayBuffer unavailable, using single-threaded mode');
            // Note: transformers.js will automatically fall back to single-threaded
          }
        }
      } catch (configError) {
        console.warn('Could not configure transformers environment, using defaults:', configError);
        // Continue anyway - library may have defaults
      }
      
      // Wait a moment for any backend initialization to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Don't try to configure backends manually - let transformers.js handle it
      // This avoids the registerBackend error
      
      // Models will be downloaded and cached locally on first use
      
      // Model A: Mental state tracker (mood/anxiety/depression assessment)
      // Start with a simpler, more reliable model that works better in browsers
      // Use text-classification models first as they're more stable than text-generation
      console.log('Loading psychology-centric AI model...');
      
      // Progress callback for model loading
      let totalProgress = 0;
      let modelsLoaded = 0;
      const totalModels = 2; // moodTracker + counselingCoach
      
      const progressCallback = (progress: any) => {
        if (progress.status === 'progress') {
          const percent = progress.progress ? Math.round(progress.progress * 100) : 0;
          const modelProgress = Math.round((modelsLoaded / totalModels) * 100 + (percent / totalModels));
          totalProgress = Math.min(100, modelProgress);
          
          const modelName = progress.name || 'model';
          setModelLoadingProgress(
            totalProgress,
            `Loading AI models...`,
            `${modelName}: ${percent}%`
          );
          console.log(`Model loading: ${modelName} - ${percent}%`);
        } else if (progress.status === 'done') {
          modelsLoaded++;
          const modelProgress = Math.round((modelsLoaded / totalModels) * 100);
          totalProgress = Math.min(100, modelProgress);
          
          const modelName = progress.name || 'model';
          setModelLoadingProgress(
            totalProgress,
            `Loading AI models...`,
            `${modelName} loaded`
          );
          console.log(`Model loaded: ${modelName}`);
        }
      };
      
      // Load the user-selected model (default: TinyLlama for healthcare/psychology)
      const modelConfig = MODEL_CONFIGS[targetModel];
      console.log(`Loading ${modelConfig.name} (${modelConfig.description})...`);
      
      // Check memory constraints - warn if low memory and trying to load large model
      const strategy = compatibilityReport?.suggestedStrategy || 'standard';
      const useLowMemory = strategy === 'low-memory' || (compatibilityReport?.estimatedMemory !== null && compatibilityReport.estimatedMemory < 2048);
      
      if (useLowMemory && targetModel === 'minicpm') {
        console.warn('⚠️ Low memory detected. MiniCPM may not load. Consider using TinyLlama instead.');
      }
      
      // Load Model A: Mental state tracker (mood/anxiety/depression assessment)
      // For DistilBERT, use text-classification; for others, use text-generation
      try {
        console.log(`Attempting to load ${modelConfig.name} for mood tracking...`);
        moodTrackerModel = await pipeline(
          modelConfig.task,
          modelConfig.path,
          { 
            quantized: true,
            progress_callback: progressCallback
          }
        );
        console.log(`✓ ${modelConfig.name} model loaded successfully for mood tracking`);
        
        // Cache the model
        allModelsCache.set(targetModel, moodTrackerModel);
      } catch (modelError: any) {
        const errorMsg = modelError?.message || String(modelError);
        const errorStack = modelError?.stack || '';
        
        // Check if it's a backend/ONNX error
        const isBackendError = errorMsg.includes('registerBackend') || 
                               errorMsg.includes('ort-web') ||
                               errorStack.includes('ort-web') ||
                               errorMsg.includes('Cannot read properties');
        
        if (isBackendError) {
          lastErrorCategory = 'coop-coep';
          console.error('Backend initialization error detected. This is likely a browser compatibility issue with ONNX Runtime.');
          if (compatibilityReport && !compatibilityReport.sharedArrayBuffer) {
            console.warn('SharedArrayBuffer unavailable. Enable COOP/COEP headers (see SERVER_CONFIG.md).');
          }
          console.warn('The app will continue using rule-based responses. AI features will not be available.');
          moodTrackerModel = null;
        } else if (errorMsg.includes('memory') || errorMsg.includes('OOM')) {
          lastErrorCategory = 'memory';
          console.error(`Memory error loading ${modelConfig.name}. Device may have insufficient memory.`);
          moodTrackerModel = null;
        } else {
          lastErrorCategory = 'unknown';
          console.error(`Failed to load ${modelConfig.name}:`, modelError);
          moodTrackerModel = null;
        }
      }

      // Model B: Counseling coach - Use same model if it's text-generation, otherwise load TinyLlama
      console.log('Loading counseling coach model...');
      
      // Check if moodTrackerModel is a text-generation model we can reuse
      let canReuseModel = false;
      if (moodTrackerModel) {
        try {
          const modelTask = (moodTrackerModel as any).task;
          if (modelTask === 'text-generation') {
            canReuseModel = true;
            console.log(`✓ Reusing ${modelConfig.name} for counseling (text-generation model)`);
          }
        } catch {
          canReuseModel = false;
        }
      }
      
      if (!canReuseModel) {
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
            counselingCoachModel = await pipeline(
              'text-generation',
              counselingConfig.path,
              { 
                quantized: true,
                progress_callback: progressCallback
              }
            );
            console.log(`✓ ${counselingConfig.name} loaded successfully for counseling`);
            
            // Cache the model
            allModelsCache.set(counselingModelType, counselingCoachModel);
          } catch (counselingError: any) {
            const counselingMsg = counselingError?.message || String(counselingError);
            const counselingStack = counselingError?.stack || '';
            const isCounselingBackendError = counselingMsg.includes('registerBackend') || 
                                            counselingMsg.includes('ort-web') ||
                                            counselingStack.includes('ort-web');
            
            if (isCounselingBackendError) {
              lastErrorCategory = 'coop-coep';
              console.error('Backend initialization error with counseling model. Browser may not support ONNX Runtime.');
              counselingCoachModel = null;
            } else if (counselingMsg.includes('memory') || counselingMsg.includes('OOM')) {
              lastErrorCategory = 'memory';
              console.error('Memory error loading counseling model.');
              counselingCoachModel = null;
            } else {
              lastErrorCategory = 'unknown';
              console.error('Counseling model load failed:', counselingError);
              counselingCoachModel = null;
            }
          }
        }
      } else {
        // Reuse the text-generation model for both tasks
        counselingCoachModel = moodTrackerModel;
        console.log(`✓ Using ${modelConfig.name} for both mood tracking and counseling`);
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
        setProgressSuccess('AI models loaded successfully!', 'All models are ready to use');
        console.log('✅ All AI models loaded and ready!');
        console.log(`  - Mood tracker: ${moodTrackerModel ? '✓' : '✗'}`);
        console.log(`  - Counseling coach: ${counselingCoachModel ? '✓' : '✗'}`);
      } else {
        setProgressError('AI models unavailable', 'App will use rule-based responses');
        console.warn('⚠️ AI models not available. App will use rule-based responses.');
        console.warn(`  - Mood tracker: ${moodTrackerModel ? '✓ Loaded' : '✗ Failed'}`);
        console.warn(`  - Counseling coach: ${counselingCoachModel ? '✓ Loaded' : '✗ Failed'}`);
        
        // If at least one model loaded, log that partial loading is available
        if (moodTrackerModel || counselingCoachModel) {
          console.info('ℹ️ Partial model loading: Some AI features may be available.');
        } else {
          console.info('ℹ️ All models failed to load. This is likely a browser compatibility issue with ONNX Runtime.');
          console.info('ℹ️ The app will use rule-based responses which are fully functional.');
        }
      }
      
      return modelsReady;
    } catch (error) {
      if (loadingTimeout) clearTimeout(loadingTimeout);
      console.error('Model initialization error:', error);
      isModelLoading = false;
      moodTrackerModel = null;
      counselingCoachModel = null;
      setProgressError('Model loading failed', 'App will use rule-based responses');
      
      // Provide more specific error message based on category
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (!lastErrorCategory) {
        // Categorize error if not already categorized
        if (errorMessage.includes('registerBackend') || errorMessage.includes('backend') || errorMessage.includes('ort-web')) {
          lastErrorCategory = 'coop-coep';
        } else if (errorMessage.includes('memory') || errorMessage.includes('OOM') || errorMessage.includes('out of memory')) {
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
        case 'coop-coep':
          console.error('Backend initialization failed. This is likely due to missing COOP/COEP headers.');
          if (compatibilityReport && !compatibilityReport.sharedArrayBuffer) {
            console.warn('SharedArrayBuffer unavailable. See SERVER_CONFIG.md for server configuration.');
          }
          console.warn('App will continue with rule-based responses. AI features will not be available.');
          break;
        case 'memory':
          console.error('Memory error: Device has insufficient memory for AI models.');
          console.warn('App will continue with rule-based responses. AI features will not be available.');
          break;
        case 'network':
          console.warn('Failed to download AI models. Check your internet connection.');
          console.warn('App will use rule-based responses.');
          break;
        case 'wasm':
          console.error('WebAssembly not supported. AI models cannot run on this browser.');
          console.warn('App will continue with rule-based responses.');
          break;
        default:
          console.warn('Failed to load on-device models. App will use rule-based responses instead.');
      }
      
      // Return false to indicate failure, but don't throw
      return false;
    }
  })();

  return modelLoadPromise;
}

/**
 * Preload models in the background
 * Called on app startup to prepare models for faster response times
 */
export async function preloadModels(): Promise<boolean> {
  console.log('🚀 Starting background model preload...');
  
  try {
    // Check if models are already loaded
    if (areModelsLoaded()) {
      console.log('✅ Models already loaded, skipping preload.');
      return true;
    }
    
    // Try to load models with retries
    let attempts = 0;
    const maxAttempts = 4;
    let lastError: any = null;
    
    while (attempts < maxAttempts) {
      attempts++;
      
      // Only log first and last attempts to reduce console noise
      if (attempts === 1 || attempts === maxAttempts) {
        console.log(`🚀 Starting AI model preload in background (attempt ${attempts}/${maxAttempts})...`);
      }
      
      try {
        const loaded = await initializeModels();
        if (loaded) {
          console.log('✅ Background model preload successful!');
          return true;
        }
        
        // Check what we actually have
        const moodModel = getMoodTrackerModel();
        const counselingModel = getCounselingCoachModel();
        
        if (moodModel || counselingModel) {
          console.log(`ℹ️ Partial model loading: ${moodModel ? 'Mood tracker ✓' : 'Mood tracker ✗'}, ${counselingModel ? 'Counseling coach ✓' : 'Counseling coach ✗'}`);
          // Continue trying to load the missing model
        }
      } catch (error) {
        lastError = error;
        const errorMsg = error instanceof Error ? error.message : String(error);
        if (attempts === maxAttempts) {
          console.warn(`Model preload attempt ${attempts} failed:`, errorMsg);
        }
      }
      
      if (attempts < maxAttempts) {
        // Wait before retrying (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempts - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // Final status check
    const finalMoodModel = getMoodTrackerModel();
    const finalCounselingModel = getCounselingCoachModel();
    
    if (finalMoodModel || finalCounselingModel) {
      console.log(`⚠️ Model preload completed with partial loading:`);
      console.log(`  - Mood tracker: ${finalMoodModel ? '✓' : '✗'}`);
      console.log(`  - Counseling coach: ${finalCounselingModel ? '✓' : '✗'}`);
      console.log(`  - Some AI features may be available.`);
    } else {
      console.log('⚠️ Model preload completed but models not available. Will use rule-based fallbacks.');
      if (lastError) {
        const errorMsg = lastError instanceof Error ? lastError.message : String(lastError);
        if (errorMsg.includes('registerBackend') || errorMsg.includes('ort-web')) {
          console.info('ℹ️ This appears to be a browser compatibility issue with ONNX Runtime.');
          console.info('ℹ️ The app is fully functional with rule-based responses.');
        }
      }
    }
    
    return false;
  } catch (error) {
    console.warn('Model preload error (non-critical):', error);
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
    compatibility: compatibilityReport,
    errorCategory: lastErrorCategory
  };
}

/**
 * Get compatibility report
 */
export function getCompatibilityReport(): CompatibilityReport | null {
  return compatibilityReport;
}

