/**
 * Stub module for onnxruntime-web
 * Prevents ONNX Runtime from loading and causing registerBackend errors
 * Transformers.js will use WASM backend instead
 */

// Create a no-op function for registerBackend to prevent errors
const noop = () => {};

// Set up global ort object BEFORE any exports to prevent registerBackend errors
// This must happen at module load time, before onnxruntime-web tries to access it
if (typeof globalThis !== 'undefined') {
  const ort = (globalThis as any).ort = (globalThis as any).ort || {};
  ort.env = ort.env || {
    wasm: {
      numThreads: 1,
    },
  };
  // Provide registerBackend as a no-op to prevent "Cannot read properties of undefined" errors
  ort.registerBackend = ort.registerBackend || noop;
}

// Create env object
const env = {
  wasm: {
    numThreads: 1,
  },
};

// Export a minimal but complete stub that prevents registerBackend errors
export default {
  env,
  InferenceSession: class {},
  Tensor: class {},
  registerBackend: noop,
};

export const InferenceSession = class {};
export const Tensor = class {};
export { env };

// Prevent any backend registration attempts
export const registerBackend = noop;

