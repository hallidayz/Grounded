// src/workers/aiWorker.ts
// Ensure ONNX is initialized globally for the worker context if transformers requires it
var ONNX = { env: {} };
if (typeof self !== 'undefined') {
  self.ONNX = self.ONNX || { env: {} };
}

import { pipeline } from '@xenova/transformers';

let modelInstance = null; // Cache the model within the worker

self.onmessage = async (event) => {
  const { text, task, modelName } = event.data; // Added modelName to allow dynamic model selection

  try {
    if (!modelInstance) {
      console.log(`[AIWorker] Initializing model: ${modelName || 'default'} for task: ${task || 'feature-extraction'}...`);
      // It's crucial that pipeline() handles ONNX initialization internally or finds it globally
      modelInstance = await pipeline(task || 'feature-extraction', modelName || 'Xenova/distilbert-base-uncased');
      console.log(`[AIWorker] Model ${modelName || 'default'} initialized.`);
    }

    const output = await modelInstance(text);
    self.postMessage({ output, timestamp: Date.now() });
  } catch (error: any) {
    console.error('[AIWorker] Inference error:', error);
    self.postMessage({
      error: `Inference failed: ${error.message || error}`,
      timestamp: Date.now(),
    });
  }
};
