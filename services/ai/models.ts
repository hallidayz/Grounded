/**
 * AI MODEL LOADING & MANAGEMENT
 * 
 * Handles loading and initialization of on-device AI models.
 * Uses @xenova/transformers for browser-based inference.
 */

// Model loading state
let moodTrackerModel: any = null;
let counselingCoachModel: any = null;
let isModelLoading = false;
let modelLoadPromise: Promise<boolean> | null = null;

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
        
        // This is a known browser compatibility issue - not a critical error
        const isKnownIssue = errorMsg.includes('registerBackend') || 
                            errorMsg.includes('ort-web') ||
                            errorStack.includes('ort-web') ||
                            errorMsg.includes('Cannot read properties');
        
        if (isKnownIssue) {
          console.info('ℹ️ AI models unavailable: Browser compatibility issue with ONNX Runtime. App uses rule-based responses (fully functional).');
        } else {
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
      
      // Configure transformers.js for browser use - use minimal configuration
      // Configure BEFORE any backend access to avoid registerBackend errors
      try {
        env.allowLocalModels = true;
        env.allowRemoteModels = true;
        env.useBrowserCache = true;
        env.useCustomCache = false;
        
        // Set cache directory for models
        env.cacheDir = './models-cache';
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
      const progressCallback = (progress: any) => {
        if (progress.status === 'progress') {
          const percent = progress.progress ? Math.round(progress.progress * 100) : 0;
          console.log(`Model loading: ${progress.name || 'model'} - ${percent}%`);
        } else if (progress.status === 'done') {
          console.log(`Model loaded: ${progress.name || 'model'}`);
        }
      };
      
      // Try loading a reliable text-classification model first (more stable)
      // This model is smaller and loads faster, good for sentiment analysis
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
          console.error('Backend initialization error detected. This is likely a browser compatibility issue with ONNX Runtime.');
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
              console.error('Backend initialization error with TinyLlama. Browser may not support ONNX Runtime.');
              moodTrackerModel = null;
            } else {
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
                  console.error('Backend initialization error with all models. Browser compatibility issue detected.');
                } else {
                  console.error('All model loading attempts failed:', miniCPMError);
                }
                moodTrackerModel = null; // Will use rule-based fallback
              }
            }
          }
        }
      }

      // Model B: Counseling coach - Use same model for text generation
      // For now, we'll use the mood tracker model for both tasks
      // In future, can load separate specialized model
      counselingCoachModel = moodTrackerModel;
      if (counselingCoachModel) {
        console.log('✓ Using psychology-centric model for counseling guidance');
      } else {
        console.log('⚠️ Using rule-based counseling guidance (models unavailable)');
      }

      const modelsReady = moodTrackerModel !== null && counselingCoachModel !== null;
      isModelLoading = false;
      
      if (modelsReady) {
        console.log('✅ All AI models loaded and ready!');
      } else {
        console.warn('⚠️ AI models not available. App will use rule-based responses.');
      }
      
      return modelsReady;
    } catch (error) {
      console.error('Model initialization error:', error);
      isModelLoading = false;
      moodTrackerModel = null;
      counselingCoachModel = null;
      
      // Provide more specific error message
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('registerBackend') || errorMessage.includes('backend')) {
        console.error('Backend initialization failed. This may be a compatibility issue with @xenova/transformers.');
        console.warn('App will continue with rule-based responses. AI features will not be available.');
        // Return false to indicate failure, but don't throw
        return false;
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        console.warn('Failed to download AI models. App will use rule-based responses.');
        // Return false to indicate failure, but don't throw
        return false;
      } else {
        // Fallback: models will use rule-based responses
        console.warn('Failed to load on-device models. App will use rule-based responses instead.');
        // Return false to indicate failure, but don't throw
        return false;
      }
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
    // Try to load models with retries
    let attempts = 0;
    const maxAttempts = 4;
    
    while (attempts < maxAttempts) {
      attempts++;
      console.log(`🚀 Starting AI model preload in background (attempt ${attempts}/${maxAttempts})...`);
      
      const loaded = await initializeModels();
      if (loaded) {
        console.log('✅ Background model preload successful!');
        return true;
      }
      
      if (attempts < maxAttempts) {
        // Wait before retrying (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempts - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    console.log('⚠️ Model preload completed but models not available. Will use rule-based fallbacks.');
    return false;
  } catch (error) {
    console.warn('Model preload error (non-critical):', error);
    return false;
  }
}

/**
 * Check if models are currently loaded
 */
export function areModelsLoaded(): boolean {
  return moodTrackerModel !== null && counselingCoachModel !== null;
}

/**
 * Get current model status
 */
export function getModelStatus(): { loaded: boolean; loading: boolean } {
  return {
    loaded: areModelsLoaded(),
    loading: isModelLoading
  };
}

