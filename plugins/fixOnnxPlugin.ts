// plugins/fixOnnxPlugin.ts
import { Plugin } from 'vite';

export function fixOnnxPlugin(): Plugin {
  return {
    name: 'fix-onnx-transformers-plugin',
    enforce: 'post', // Apply after other transformations
    apply: 'build',  // Only apply during build
    transform(code, id) {
      // Target specific modules where ONNX issues are known to occur
      if (id.includes('@xenova/transformers') || id.includes('onnxruntime-web')) {
        // Check if ONNX is already imported or declared (to avoid duplicate declaration)
        const hasOnnxImport = /import\s+(?:\{[^}]*ONNX[^}]*\}|ONNX)\s+from/.test(code);
        // Check for various ONNX declarations: const/let/var ONNX =, export let/const/var ONNX, export let ONNX;
        const hasOnnxVar = /(?:export\s+)?(?:const|let|var)\s+ONNX(?:\s*[=;]|\s*$)/m.test(code);
        
        // Patch ONNX destructure references to prevent undefined errors
        // This regex targets the specific pattern 'const { env } = ONNX'
        const patchedCode = code.replace(
          /(const|let|var)\s+\{\s*env\s*\}\s*=\s*ONNX;/, // Target simple destructuring
          `$1 env = (typeof ONNX !== 'undefined' && ONNX && ONNX.env) ? ONNX.env : {};`
        );

        // Also handle more complex destructuring patterns that include 'env'
        // This catches patterns like 'const { InferenceSession, Tensor: ONNXTensor, env } = ONNX;'
        const moreRobustPatch = patchedCode.replace(
          /(const|let|var)\s*\{\s*([^}]*env[^}]*)\}\s*=\s*ONNX;/, // Target complex destructuring
          (match, keyword, props) => {
            // Create a safe fallback object that includes common destructured properties
            const fallback = `{ env: {}, InferenceSession: null, Tensor: null }`;
            return `${keyword} { ${props} } = ((typeof ONNX !== 'undefined' && ONNX) ? ONNX : ${fallback});`;
          }
        );

        // Handle cases where 'env' is destructured with renaming, e.g., 'const { env: onnx_env } = ONNX;'
        const renamedPatch = moreRobustPatch.replace(
            /(const|let|var)\s*\{\s*env\s*:\s*(\w+)\s*\}\s*=\s*ONNX;/, // Target renamed destructuring
            `$1 $2 = (typeof ONNX !== 'undefined' && ONNX && ONNX.env) ? ONNX.env : {};`
        );

        // Only inject ONNX initialization if it's not already imported or declared
        // This prevents "Identifier ONNX has already been declared" errors
        if (!hasOnnxImport && !hasOnnxVar && !renamedPatch.includes('var ONNX = { env: {} };')) {
            const finalCode = `var ONNX = { env: {} };\nif (typeof globalThis !== 'undefined') { globalThis.ONNX = globalThis.ONNX || { env: {} }; }\n` + renamedPatch;
            return { code: finalCode, map: null };
        }
        return { code: renamedPatch, map: null };
      }
      return null;
    },
  };
}
