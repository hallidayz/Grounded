// src/workers/aiWorker.ts
import { pipeline, env } from '@xenova/transformers';

// Suppress ONNX Runtime warnings in worker thread
if (typeof globalThis !== 'undefined') {
  const globalOrt = (globalThis as any).ort = (globalThis as any).ort || {};
  globalOrt.env = globalOrt.env || {};
  globalOrt.env.logLevel = 'fatal'; // Suppress all ONNX Runtime warnings
}

// Wrap console.warn in worker to filter ONNX Runtime warnings
const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  const message = args.join(' ');
  const isOnnxWarning = 
    message.includes('onnxruntime') ||
    message.includes('CleanUnusedInitializersAndNodeArgs') ||
    message.includes('Removing initializer') ||
    message.includes('/decoder/block.') ||
    message.includes('graph.cc:') ||
    message.includes('aph.cc:');
  if (!isOnnxWarning) {
    originalWarn.apply(console, args);
  }
};

// Force remote models to prevent 404s on Vercel
env.allowLocalModels = false;
env.useBrowserCache = true;
env.logLevel = 'error'; // Suppress transformers.js warnings

// Cache for multiple models (prevents "wrong model" errors)
const modelCache: Record<string, any> = {};

// Response validation helper
const validateAIResponse = (response: string): boolean => {
  return response.trim().length > 10 && 
         response.includes('you') && 
         response.length <= 800; // Hard cap fallback
};

self.onmessage = async (event) => {
  const { id, text, task, modelName, generationConfig } = event.data;
  
  // Create a unique key for the model + task combination
  const modelKey = `${task || 'default'}-${modelName || 'default'}`;

  try {
    if (!modelCache[modelKey]) {
      console.log(`[AIWorker] Initializing model: ${modelName} for task: ${task}...`);
      modelCache[modelKey] = await pipeline(task || 'text2text-generation', modelName || 'Xenova/LaMini-Flan-T5-77M');
      console.log(`[AIWorker] Model ${modelName} initialized.`);
    }

    // Default optimization parameters (T5 optimized)
    const defaultConfig = {
      max_new_tokens: 100,
      temperature: 0.7,
      repetition_penalty: 1.1,
      top_p: 0.9,
      do_sample: true,
      ...generationConfig // Override with per-request config if provided
    };

    console.log(`[AIWorker] Running inference with config:`, defaultConfig);

    // Run inference
    const output = await modelCache[modelKey](text, defaultConfig);
    
    // Extract text depending on model output format
    let generatedText = '';
    if (Array.isArray(output)) {
      generatedText = output[0]?.generated_text || output[0]?.summary_text || '';
    } else if (typeof output === 'object') {
       generatedText = output.generated_text || output.summary_text || '';
    } else {
       generatedText = String(output);
    }

    // Validate response quality
    if (!validateAIResponse(generatedText)) {
       console.warn('[AIWorker] Response failed validation (length or personalization check). Sending anyway but flagged.');
       // We might want to retry or flag this, but for now we return it with a warning log
    }

    // Send back success with ID
    self.postMessage({ id, output: generatedText });
  } catch (error: any) {
    console.error('[AIWorker] Inference error:', error);
    // Send back error with ID
    self.postMessage({ 
      id, 
      error: `Inference failed: ${error.message || error}` 
    });
  }
};
