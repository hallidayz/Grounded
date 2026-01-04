interface AIWorkerResponse {
  id: string;
  output?: any;
  error?: string;
}

let globalWorker: Worker | null = null;
const pendingRequests = new Map<string, { resolve: Function, reject: Function }>();

function getWorker(): Worker {
  if (!globalWorker) {
    // Initialize worker once
    globalWorker = new Worker(new URL('../workers/aiWorker.ts', import.meta.url), { type: 'module' });
    
    // Handle incoming messages and route them to the correct promise
    globalWorker.onmessage = (e) => {
      const { id, output, error } = e.data as AIWorkerResponse;
      const request = pendingRequests.get(id);
      
      if (request) {
        if (error) request.reject(new Error(error));
        else request.resolve(output);
        
        // Clean up the pending request
        pendingRequests.delete(id);
      }
    };
    
    globalWorker.onerror = (err) => {
      console.error('Global AI Worker Error:', err);
    };
  }
  return globalWorker;
}

export function runAIWorker(inputText: string, task: string = 'feature-extraction', modelName?: string): Promise<any> {
  const id = crypto.randomUUID();
  const worker = getWorker();
  
  return new Promise((resolve, reject) => {
    // Store the promise resolvers
    pendingRequests.set(id, { resolve, reject });
    
    // Send request with ID
    worker.postMessage({ id, text: inputText, task, modelName });
  });
}
