import { pipeline, env } from '@xenova/transformers';

// Force remote models to prevent 404s on Vercel
env.allowLocalModels = false;
env.useBrowserCache = true;

// Cache for multiple models (prevents "wrong model" errors)
const modelCache: Record<string, any> = {};

self.onmessage = async (event) => {
  const { id, text, task, modelName } = event.data;
  
  // Create a unique key for the model + task combination
  const modelKey = `${task || 'default'}-${modelName || 'default'}`;

  try {
    if (!modelCache[modelKey]) {
      console.log(`[AIWorker] Initializing model: ${modelName} for task: ${task}...`);
      modelCache[modelKey] = await pipeline(task || 'feature-extraction', modelName || 'Xenova/distilbert-base-uncased');
      console.log(`[AIWorker] Model ${modelName} initialized.`);
    }

    // Run inference
    const output = await modelCache[modelKey](text);
    
    // Send back success with ID
    self.postMessage({ id, output });
  } catch (error: any) {
    console.error('[AIWorker] Inference error:', error);
    // Send back error with ID
    self.postMessage({ 
      id, 
      error: `Inference failed: ${error.message || error}` 
    });
  }
};
