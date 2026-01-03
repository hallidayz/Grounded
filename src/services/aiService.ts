// src/services/aiService.ts
// This service will now primarily manage interaction with the AI worker.
// Existing direct pipeline calls will be refactored to use this worker interface.

export interface AIWorkerResponse {
  output?: any;
  error?: string;
  timestamp: number;
}

export function runAIWorker(inputText: string, task: string = 'feature-extraction', modelName?: string): Promise<any> {
  return new Promise((resolve, reject) => {
    // Note: The path to the worker is relative to the current module
    const worker = new Worker(new URL('../workers/aiWorker.ts', import.meta.url), { type: 'module' });

    worker.postMessage({ text: inputText, task, modelName });

    worker.onmessage = (e) => {
      worker.terminate(); // Terminate worker after message to free up resources
      const response = e.data as AIWorkerResponse;
      if (response.error) {
        return reject(new Error(response.error));
      }
      resolve(response.output);
    };

    worker.onerror = (err) => {
      worker.terminate();
      console.error('AI Worker error:', err);
      reject(new Error(`AI Worker failed: ${err.message || 'Unknown error'}`));
    };
  });
}

// Any existing functions like generateEmotionalEncouragement, generateFocusLens, etc.,
// will need to be updated to call runAIWorker.
// Example:
/*
import { runAIWorker } from './aiService';

export async function generateEmotionalEncouragement(prompt: string): Promise<string> {
  try {
    const response = await runAIWorker(prompt, 'text2text-generation', 'Xenova/LaMini-Flan-T5-77M');
    // Process response as needed
    return response.generated_text || "Thank you for sharing your emotions.";
  } catch (error) {
    console.error("Failed to get AI encouragement:", error);
    return "Sometimes, it's okay to not be okay. I'm here for you."; // Fallback
  }
}
*/