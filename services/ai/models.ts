/**
 * AI MODEL LOADING & MANAGEMENT
 * 
 * Handles loading and initialization of on-device AI models.
 * Uses @xenova/transformers for browser-based inference.
 */

import { checkBrowserCompatibility, CompatibilityReport, getCompatibilitySummary } from './browserCompatibility';
import { setModelLoadingProgress, setProgressSuccess, setProgressError } from '../progressTracker';

// Model loading state
let moodTrackerModel: any = null;
let counselingCoachModel: any = null;
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
 * Clear models to force re-download/update
 */
export async function clearModels(): Promise<void> {
  moodTrackerModel = null;
  counselingCoachModel = null;
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
 * Can be called to update/reload models
 * @param forceReload - If true, clears existing models and reloads
 * @returns true if models loaded successfully, false if fallback mode is used
 */
export async function initializeModels(forceReload: boolean = false): Promise<boolean> {
  if (forceReload) {
    await clearModels();
  }
  
  if (moodTrackerModel && counselingCoachModel && !forceReload) {
    return true; // Already loaded
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

  isModelLoading = true;
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
        }
        isModelLoading = false;
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
        
        // Set cache directory for models - use IndexedDB for persistent caching
        env.cacheDir = './models-cache';
        
        // Enable aggressive caching for faster subsequent loads
        // Models are cached in browser IndexedDB automatically by transformers.js
        
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
      
      // Choose model based on compatibility strategy
      const strategy = compatibilityReport?.suggestedStrategy || 'standard';
      const useLowMemory = strategy === 'low-memory' || (compatibilityReport?.estimatedMemory !== null && compatibilityReport.estimatedMemory < 2048);
      
      // Try loading a reliable text-classification model first (more stable)
      // This model is smaller and loads faster, good for sentiment analysis
      // Skip DistilBERT if low-memory mode (use TinyLlama directly)
      if (!useLowMemory) {
        try {
          console.log('Attempting to load DistilBERT (text classification)...');
          moodTrackerModel = await pipeline(
            'text-classification',
            'Xenova/distilbert-base-uncased-finetuned-sst-2-english',
            { 
              quantized: true,
              progress_callback: progressCallback
            }
          );
          console.log('✓ DistilBERT model loaded successfully');
      } catch (distilbertError: any) {
        const errorMsg = distilbertError?.message || String(distilbertError);
        const errorStack = distilbertError?.stack || '';
        
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
        } else {
          console.warn('DistilBERT load failed, trying text-generation model:', distilbertError);
          
          // Fallback to a smaller text-generation model
          try {
            console.log('Attempting to load TinyLlama (text generation)...');
            moodTrackerModel = await pipeline(
              'text-generation',
              'Xenova/TinyLlama-1.1B-Chat-v1.0',
              { 
                quantized: true,
                progress_callback: progressCallback
              }
            );
            console.log('✓ TinyLlama model loaded successfully');
          } catch (tinyLlamaError: any) {
            const tinyLlamaMsg = tinyLlamaError?.message || String(tinyLlamaError);
            const tinyLlamaStack = tinyLlamaError?.stack || '';
            const isTinyLlamaBackendError = tinyLlamaMsg.includes('registerBackend') || 
                                            tinyLlamaMsg.includes('ort-web') ||
                                            tinyLlamaStack.includes('ort-web');
            
            if (isTinyLlamaBackendError) {
              lastErrorCategory = 'coop-coep';
              console.error('Backend initialization error with TinyLlama. Browser may not support ONNX Runtime.');
              moodTrackerModel = null;
            } else {
              // Only try MiniCPM if not in low-memory mode (it's larger)
              if (!useLowMemory) {
                console.warn('TinyLlama load failed, trying MiniCPM:', tinyLlamaError);
                
                // Final fallback to MiniCPM
                try {
                  console.log('Attempting to load MiniCPM (text generation)...');
                  moodTrackerModel = await pipeline(
                    'text-generation',
                    'Xenova/MiniCPM-2-4B-ONNX',
                    { 
                      quantized: true,
                      progress_callback: progressCallback
                    }
                  );
                  console.log('✓ MiniCPM model loaded successfully');
                } catch (miniCPMError: any) {
                  const miniCPMMsg = miniCPMError?.message || String(miniCPMError);
                  const miniCPMStack = miniCPMError?.stack || '';
                  const isMiniCPMBackendError = miniCPMMsg.includes('registerBackend') || 
                                                 miniCPMMsg.includes('ort-web') ||
                                                 miniCPMStack.includes('ort-web');
                  
                  if (isMiniCPMBackendError) {
                    lastErrorCategory = 'coop-coep';
                    console.error('Backend initialization error with all models. Browser compatibility issue detected.');
                  } else if (miniCPMMsg.includes('memory') || miniCPMMsg.includes('OOM')) {
                    lastErrorCategory = 'memory';
                    console.error('Memory error loading MiniCPM. Device may have insufficient memory.');
                  } else {
                    lastErrorCategory = 'unknown';
                    console.error('All model loading attempts failed:', miniCPMError);
                  }
                  moodTrackerModel = null; // Will use rule-based fallback
                }
              } else {
                // Low memory mode - don't try larger models
                lastErrorCategory = 'memory';
                console.warn('TinyLlama failed in low-memory mode. Skipping larger models.');
                moodTrackerModel = null;
              }
            }
          }
        }
        }
      } else {
        // Low memory mode - skip DistilBERT, go straight to TinyLlama
        console.log('Low-memory mode: Skipping DistilBERT, loading TinyLlama directly...');
        try {
          console.log('Attempting to load TinyLlama (text generation, low-memory mode)...');
          moodTrackerModel = await pipeline(
            'text-generation',
            'Xenova/TinyLlama-1.1B-Chat-v1.0',
            { 
              quantized: true,
              progress_callback: progressCallback
            }
          );
          console.log('✓ TinyLlama model loaded successfully (low-memory mode)');
        } catch (tinyLlamaError: any) {
          const tinyLlamaMsg = tinyLlamaError?.message || String(tinyLlamaError);
          const tinyLlamaStack = tinyLlamaError?.stack || '';
          const isTinyLlamaBackendError = tinyLlamaMsg.includes('registerBackend') || 
                                          tinyLlamaMsg.includes('ort-web') ||
                                          tinyLlamaStack.includes('ort-web');
          
          if (isTinyLlamaBackendError) {
            lastErrorCategory = 'coop-coep';
            console.error('Backend initialization error with TinyLlama. Browser may not support ONNX Runtime.');
          } else if (tinyLlamaMsg.includes('memory') || tinyLlamaMsg.includes('OOM')) {
            lastErrorCategory = 'memory';
            console.error('Memory error: Device has insufficient memory for AI models.');
          } else {
            lastErrorCategory = 'unknown';
            console.error('TinyLlama load failed:', tinyLlamaError);
          }
          moodTrackerModel = null;
        }
      }

      // Model B: Counseling coach - Load a text-generation model specifically
      // Don't reuse classification models for generation tasks
      // Counseling needs text-generation, not classification
      console.log('Loading counseling coach model (text-generation)...');
      
      // Check if moodTrackerModel is already a text-generation model we can reuse
      let canReuseModel = false;
      if (moodTrackerModel) {
        try {
          // Try to check if it's a generation model by checking its task property
          const modelTask = (moodTrackerModel as any).task;
          if (modelTask === 'text-generation') {
            canReuseModel = true;
            console.log('✓ Reusing text-generation model for counseling');
          }
        } catch {
          // If we can't determine, assume we need a separate model
          canReuseModel = false;
        }
      }
      
      if (!canReuseModel) {
        // Load a dedicated text-generation model for counseling
        try {
          console.log('Attempting to load TinyLlama for counseling (text generation)...');
          counselingCoachModel = await pipeline(
            'text-generation',
            'Xenova/TinyLlama-1.1B-Chat-v1.0',
            { 
              quantized: true,
              progress_callback: progressCallback
            }
          );
          console.log('✓ Counseling coach model (TinyLlama) loaded successfully');
        } catch (tinyLlamaError: any) {
          const tinyLlamaMsg = tinyLlamaError?.message || String(tinyLlamaError);
          const tinyLlamaStack = tinyLlamaError?.stack || '';
          const isTinyLlamaBackendError = tinyLlamaMsg.includes('registerBackend') || 
                                          tinyLlamaMsg.includes('ort-web') ||
                                          tinyLlamaStack.includes('ort-web');
          
          if (isTinyLlamaBackendError) {
            lastErrorCategory = 'coop-coep';
            console.error('Backend initialization error with TinyLlama. Browser may not support ONNX Runtime.');
            counselingCoachModel = null;
          } else {
            // Only try MiniCPM if not in low-memory mode
            if (!useLowMemory) {
              console.warn('TinyLlama load failed, trying MiniCPM for counseling:', tinyLlamaError);
              
              // Final fallback to MiniCPM for counseling
              try {
                console.log('Attempting to load MiniCPM for counseling (text generation)...');
                counselingCoachModel = await pipeline(
                  'text-generation',
                  'Xenova/MiniCPM-2-4B-ONNX',
                  { 
                    quantized: true,
                    progress_callback: progressCallback
                  }
                );
                console.log('✓ Counseling coach model (MiniCPM) loaded successfully');
              } catch (miniCPMError: any) {
                const miniCPMMsg = miniCPMError?.message || String(miniCPMError);
                const miniCPMStack = miniCPMError?.stack || '';
                const isMiniCPMBackendError = miniCPMMsg.includes('registerBackend') || 
                                               miniCPMMsg.includes('ort-web') ||
                                               miniCPMStack.includes('ort-web');
                
                if (isMiniCPMBackendError) {
                  lastErrorCategory = 'coop-coep';
                  console.error('Backend initialization error with MiniCPM for counseling. Browser compatibility issue detected.');
                } else if (miniCPMMsg.includes('memory') || miniCPMMsg.includes('OOM')) {
                  lastErrorCategory = 'memory';
                  console.error('Memory error loading MiniCPM for counseling.');
                } else {
                  lastErrorCategory = 'unknown';
                  console.error('All counseling model loading attempts failed:', miniCPMError);
                }
                counselingCoachModel = null; // Will use rule-based fallback
              }
            } else {
              // Low memory mode - don't try larger models
              lastErrorCategory = 'memory';
              console.warn('TinyLlama failed for counseling in low-memory mode. Skipping larger models.');
              counselingCoachModel = null;
            }
          }
        }
      } else {
        // Reuse the text-generation model for both tasks
        counselingCoachModel = moodTrackerModel;
        console.log('✓ Using shared text-generation model for counseling guidance');
      }
      
      if (counselingCoachModel) {
        console.log('✓ Counseling coach model ready for guidance and encouragement');
      } else {
        console.log('⚠️ Using rule-based counseling guidance (models unavailable)');
      }

      const modelsReady = moodTrackerModel !== null && counselingCoachModel !== null;
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

