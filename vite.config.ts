import path from 'path';
import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import Tauri from 'vite-plugin-tauri';
import { readFileSync, rmSync, writeFileSync, existsSync } from 'fs';

// Only load Tauri plugin when building for Tauri
const isTauriBuild = process.env.TAURI_PLATFORM !== undefined;

// Plugin to exclude model files from web builds (models download at runtime)
const excludeModelsPlugin = () => {
  return {
    name: 'exclude-models',
    closeBundle() {
      if (!isTauriBuild && process.env.INCLUDE_MODELS !== 'true') {
        const modelsPath = path.resolve(__dirname, 'dist/models');
        try {
          rmSync(modelsPath, { recursive: true, force: true });
          console.log('✅ Excluded model files from build output (models download at runtime)');
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
            console.warn('⚠️ Could not remove models directory:', error);
          }
        }
      } else if (process.env.INCLUDE_MODELS === 'true') {
        console.log('✅ Models included in build output (for packaged distribution)');
      }
    }
  };
};

// Plugin to prevent minification of transformers chunk
// This prevents initialization errors by preserving variable names and initialization order
const noMinifyTransformersPlugin = (): Plugin => {
  let unminifiedCode: string | null = null;
  let chunkFileName: string | null = null;
  
  return {
    name: 'no-minify-transformers',
    enforce: 'post',
    renderChunk(code, chunk) {
      // Capture unminified code for transformers chunk BEFORE minification
      if (chunk.name === 'transformers') {
        unminifiedCode = code;
        return null; // Let it be minified first, we'll restore it later
      }
      return null;
    },
    generateBundle(options, bundle) {
      // Get the actual filename after minification
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'chunk' && chunk.name === 'transformers') {
          chunkFileName = fileName;
          break;
        }
      }
    },
    writeBundle(options) {
      // After files are written, replace minified transformers chunk with unminified version
      if (unminifiedCode && chunkFileName) {
        const distDir = options.dir || path.resolve(__dirname, 'dist');
        const filePath = path.join(distDir, chunkFileName);
        
        if (existsSync(filePath)) {
          // Read minified file to get correct import paths
          const minified = readFileSync(filePath, 'utf-8');
          
          // Extract ALL correct import paths from minified code
          const importMatches = [...minified.matchAll(/from\s*['"](\.\/[^'"]+)['"]/g)];
          
          if (importMatches.length > 0) {
            // Update ALL imports in unminified code to match correct paths
            let restored = unminifiedCode;
            
            // Find all imports in unminified code and replace them
            const unminifiedImports = [...unminifiedCode.matchAll(/import\s+[^;]+from\s*['"](\.\/[^'"]+)['"]/g)];
            
            unminifiedImports.forEach((unminMatch, idx) => {
              const oldPath = unminMatch[1];
              // Get the corresponding correct path from minified code
              if (idx < importMatches.length) {
                const correctPath = importMatches[idx][1];
                // Replace this specific import
                restored = restored.replace(
                  new RegExp(`from\\s*['"]${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'g'),
                  `from '${correctPath}'`
                );
              }
            });
            
            // Fix initialization order: Convert static import to dynamic import for vendor
            // This ensures vendor loads and initializes before ortWeb_min is accessed
            const vendorImportMatch = importMatches.find(m => m[1].includes('vendor'));
            if (vendorImportMatch) {
              const vendorPath = vendorImportMatch[1];
              
              // CRITICAL FIX: Initialize ONNX with placeholder BEFORE any code uses it
              // This prevents "Cannot destructure property 'env' of 'ONNX' as it is undefined" errors
              // Check if ONNX is already declared - if not, add initialization at the very top
              const hasOnnxDeclaration = /(?:var|let|const)\s+ONNX\s*[=;]/.test(restored);
              if (!hasOnnxDeclaration) {
                // Insert ONNX initialization at the absolute beginning, before any code
                // Use 'var' at top level so it's accessible throughout the module
                const onnxInit = `// CRITICAL: Initialize ONNX placeholder BEFORE any code uses it
// This prevents "Cannot destructure property 'env' of 'ONNX' as it is undefined" errors
var ONNX = { env: {} };
`;
                // Insert at the very beginning, even before 'use strict'
                restored = onnxInit + restored;
              } else {
                // ONNX is declared but might be undefined - ensure it's initialized
                // Replace any "let ONNX" or "const ONNX" declarations that don't initialize
                restored = restored.replace(
                  /(let|const)\s+ONNX\s*;/g,
                  `$1 ONNX = { env: {} };`
                );
                // Also ensure any "var ONNX" without initialization gets initialized
                if (restored.includes('var ONNX') && !restored.includes('var ONNX =')) {
                  restored = restored.replace(/var\s+ONNX\s*;/g, 'var ONNX = { env: {} };');
                }
                // Add safeguard initialization at the top as well to ensure it's set before use
                const safeguardInit = `// Safeguard: Ensure ONNX is initialized before any code uses it
if (typeof ONNX === 'undefined' || !ONNX || !ONNX.env) {
  var ONNX = { env: {} };
}
`;
                // Insert at the beginning
                if (restored.match(/^(['"]use strict['"];?\s*\n)/)) {
                  restored = restored.replace(/^(['"]use strict['"];?\s*\n)/, `$1${safeguardInit}`);
                } else {
                  restored = safeguardInit + restored;
                }
              }
              
              // Replace static import with dynamic import
              // Initialize variables immediately to avoid TDZ errors
              restored = restored.replace(
                /import\s+\{\s*v\s+as\s+ortWeb_min,\s*O\s+as\s+ONNX_WEB,\s*T\s+as\s+Template\s*\}\s+from\s*['"](\.\/[^'"]+)['"];/,
                `// Dynamic import to ensure vendor loads before accessing ortWeb_min
                // Initialize variables immediately to avoid TDZ errors
                let ortWeb_min = undefined;
                let ONNX_WEB = undefined;
                let Template = undefined;
                // Load vendor module asynchronously and update ONNX when ready
                const _vendorModule = import('${vendorPath}').then(module => {
                  ortWeb_min = module.v;
                  ONNX_WEB = module.O;
                  Template = module.T;
                  // Update ONNX with actual value from vendor module (ONNX already initialized above)
                  if (typeof ortWeb_min !== 'undefined' && ortWeb_min !== null) {
                    ONNX = ortWeb_min;
                  } else if (typeof ONNX_WEB !== 'undefined' && ONNX_WEB !== null) {
                    ONNX = ONNX_WEB;
                  }
                  return module;
                }).catch(err => {
                  console.error('Failed to load vendor module:', err);
                  // Keep placeholder ONNX if vendor fails to load
                });`
              );
              
              // Update the ONNX assignment - ONNX is already initialized above, just update it
              restored = restored.replace(
                /ONNX\s*=\s*ortWeb_min\s*\?\?\s*ONNX_WEB;/g,
                `// ONNX is initialized at module top with placeholder { env: {} }
                // It will be updated when vendor module loads via _vendorModule promise above
                // This line removed to prevent assignment before vendor loads`
              );
              
              // Also fix any other direct uses of ortWeb_min, ONNX_WEB, or Template
              // that might occur before the promise resolves
              // Wrap the entire module in a way that defers execution until vendor is ready
            }
            
            writeFileSync(filePath, restored, 'utf-8');
            const lineCount = restored.split('\n').length;
            console.log(`✅ Restored unminified transformers chunk (${lineCount} lines) with dynamic import fix`);
          } else {
            // No imports to fix, just restore unminified code
            writeFileSync(filePath, unminifiedCode, 'utf-8');
            const lineCount = unminifiedCode.split('\n').length;
            console.log(`✅ Restored unminified transformers chunk (${lineCount} lines)`);
          }
        }
      }
    }
  };
};

// Read the app version
const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));
const appVersion = packageJson.version;

export default defineConfig({
  base: '/',
  esbuild: {
    keepNames: true // Preserves variable names like "cu" and fixes the init error
  },
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(appVersion),
    'process.env.USE_WEBGPU': 'false',
    'process.env.USE_WASM': 'true'
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: false,
    open: '/',
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
    watch: {
      ignored: ['**/src-tauri/target/**', '**/node_modules/**', '**/.git/**']
    },
    fs: {
      strict: false,
      allow: [path.resolve(__dirname)],
      deny: [path.resolve(__dirname, 'src-tauri/target')]
    }
  },
  preview: {
    port: 8000,
    host: '0.0.0.0',
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  plugins: [
    react(),
    ...(isTauriBuild ? [Tauri()] : []),
    excludeModelsPlugin(),
    // Prevent minification of transformers chunk to avoid initialization errors
    noMinifyTransformersPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
      filename: 'manifest.json',
      strategies: 'generateSW',
      injectRegister: 'auto',
      manifest: {
        name: 'Grounded by AC MiNDS',
        short_name: 'Grounded',
        description: 'Privacy-first therapy integration app for values-based reflection and mental health support',
        theme_color: '#02295b',
        background_color: '#f6f7f9',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        dir: 'ltr',
        lang: 'en',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
            purpose: 'any'
          }
        ],
        shortcuts: [
          {
            name: 'Dashboard',
            short_name: 'Dashboard',
            description: 'View your dashboard',
            url: '/?view=dashboard',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'View Reports',
            short_name: 'Reports',
            description: 'View clinical reports and summaries',
            url: '/?view=report',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,json,webmanifest}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/esm\.sh\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'esm-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7,
                purgeOnQuotaError: true
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*huggingface\.co\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'huggingface-models-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 365,
                purgeOnQuotaError: true
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\.(onnx|bin|safetensors|json|txt)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'ai-models-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 365,
                purgeOnQuotaError: true
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: false,
        type: 'module'
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    },
    dedupe: ['react', 'react-dom']
  },
  optimizeDeps: {
    exclude: ['@xenova/transformers', '@tauri-apps/plugin-store', '@tauri-apps/plugin-notification'],
    include: ['react', 'react-dom'],
    entries: [
      'index.html',
      'src/**/*.{ts,tsx,js,jsx}'
    ],
    esbuildOptions: {
      jsx: 'automatic'
    }
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    },
    minify: 'esbuild',
    target: 'esnext',
    rollupOptions: {
      external: isTauriBuild ? [] : [
        '@tauri-apps/plugin-store',
        '@tauri-apps/plugin-notification'
      ],
      onwarn(warning, warn) {
        if (warning.code === 'EVAL' && warning.id?.includes('onnxruntime-web')) return;
        if (warning.code === 'UNRESOLVED_IMPORT' &&
          (warning.id?.includes('@tauri-apps/plugin-store') ||
            warning.id?.includes('@tauri-apps/plugin-notification'))) return;
        if (warning.code === 'CIRCULAR_DEPENDENCY' && warning.id?.includes('@xenova/transformers')) return;
        warn(warning);
      },
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Put ONNX Runtime and related deps in vendor FIRST (must load before transformers)
            if (id.includes('onnxruntime-web') || id.includes('onnxruntime')) {
              return 'vendor';
            }
            // Put transformers in its own chunk (loads after vendor)
            if (id.includes('@xenova/transformers')) {
              return 'transformers';
            }
            if (id.includes('react') || id.includes('react-dom')) return 'react-vendor';
            if (id.includes('framer-motion')) return 'animations';
            return 'vendor';
          }
          if (id.includes('services/ai/')) return 'ai-services';
        },
        chunkFileNames: (chunkInfo) =>
          chunkInfo.name === 'transformers'
            ? 'assets/transformers-[hash].js'
            : 'assets/[name]-[hash].js'
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false
  }
});
