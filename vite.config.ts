import path from 'path';
import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import Tauri from 'vite-plugin-tauri';
import { readFileSync, writeFileSync } from 'fs';
import { rmSync } from 'fs';

// Only load Tauri plugin when building for Tauri (when TAURI_PLATFORM is set)
const isTauriBuild = process.env.TAURI_PLATFORM !== undefined;

// Plugin to exclude model files from web builds (models download at runtime)
const excludeModelsPlugin = (): Plugin => {
  return {
    name: 'exclude-models',
    closeBundle() {
      // Only exclude models for web builds, not Tauri builds (Tauri needs bundled models)
      if (!isTauriBuild) {
        const modelsPath = path.resolve(__dirname, 'dist/models');
        try {
          rmSync(modelsPath, { recursive: true, force: true });
          console.log('✅ Excluded model files from build output (models download at runtime)');
        } catch (error) {
          // Models directory might not exist, which is fine
          if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
            console.warn('⚠️ Could not remove models directory:', error);
          }
        }
      }
    }
  };
};

// Plugin to prevent minification of transformers chunk
// This fixes "Cannot access 'X' before initialization" errors
const noMinifyTransformersPlugin = (): Plugin => {
  const transformersChunks = new Map<string, string>();
  
  return {
    name: 'no-minify-transformers',
    enforce: 'post',
    renderChunk(code, chunk) {
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/7d9ee931-8dee-46f8-918b-e417134eb58f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'vite.config.ts:42',message:'renderChunk entry',data:{chunkName:chunk.name,chunkFileName:chunk.fileName,hasTransformers:chunk.name === 'transformers' || chunk.moduleIds.some(id => id.includes('@xenova/transformers')),moduleIdsCount:chunk.moduleIds?.length || 0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      // Store unminified code BEFORE minification happens
      if (chunk.name === 'transformers' || 
          chunk.moduleIds.some(id => id.includes('@xenova/transformers'))) {
        const key = chunk.fileName || chunk.name || String(Date.now());
        
        // #region agent log
        fetch('http://127.0.0.1:7245/ingest/7d9ee931-8dee-46f8-918b-e417134eb58f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'vite.config.ts:47',message:'Storing transformers chunk',data:{storageKey:key,codeLength:code.length,existingKeys:Array.from(transformersChunks.keys()),mapSize:transformersChunks.size},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        
        transformersChunks.set(key, code);
        console.log('📦 Stored unminified transformers chunk for post-processing');
        
        // #region agent log
        fetch('http://127.0.0.1:7245/ingest/7d9ee931-8dee-46f8-918b-e417134eb58f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'vite.config.ts:51',message:'After storing chunk',data:{mapSize:transformersChunks.size,allKeys:Array.from(transformersChunks.keys())},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
      }
      return null; // Let minification proceed normally
    },
    writeBundle(options, bundle) {
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/7d9ee931-8dee-46f8-918b-e417134eb58f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'vite.config.ts:56',message:'writeBundle entry',data:{storedChunksCount:transformersChunks.size,storedKeys:Array.from(transformersChunks.keys()),bundleFileCount:Object.keys(bundle).length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      // AFTER minification, restore unminified code
      if (transformersChunks.size === 0) return;
      
      const distDir = options.dir || 'dist';
      
      let matchingFilesCount = 0;
      
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/7d9ee931-8dee-46f8-918b-e417134eb58f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'vite.config.ts:70',message:'writeBundle processing',data:{storedChunksCount:transformersChunks.size,storedKeys:Array.from(transformersChunks.keys()),bundleFileCount:Object.keys(bundle).length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      
      for (const [bundleFileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'chunk' && 
            (bundleFileName.includes('transformers') || 
             chunk.moduleIds?.some((id: string) => id.includes('@xenova/transformers')))) {
          matchingFilesCount++;
          
          // #region agent log
          fetch('http://127.0.0.1:7245/ingest/7d9ee931-8dee-46f8-918b-e417134eb58f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'vite.config.ts:78',message:'Found matching bundle file',data:{bundleFileName,chunkName:chunk.name,storedKeys:Array.from(transformersChunks.keys()),matchingFilesCount},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
          
          // Match stored chunk to bundle file
          // Try to match by chunk name first, then use first available if no exact match
          let storedCode: string | undefined;
          
          // If chunk has a name, try to find matching stored chunk
          if (chunk.name === 'transformers') {
            // Find stored chunk that matches this transformers chunk
            // Since bundle file names have hashes, we match by chunk name
            storedCode = Array.from(transformersChunks.values()).find((code, idx) => {
              const key = Array.from(transformersChunks.keys())[idx];
              // Match if stored key or chunk name indicates transformers
              return key.includes('transformers') || chunk.name === 'transformers';
            });
          }
          
          // Fallback: use first stored chunk if no exact match found
          if (!storedCode && transformersChunks.size > 0) {
            storedCode = Array.from(transformersChunks.values())[0];
          }
          
          // #region agent log
          fetch('http://127.0.0.1:7245/ingest/7d9ee931-8dee-46f8-918b-e417134eb58f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'vite.config.ts:95',message:'Before writing file',data:{bundleFileName,storedCodeLength:storedCode?.length || 0,storedKeys:Array.from(transformersChunks.keys()),allStoredLengths:Array.from(transformersChunks.values()).map(c => c.length),usingFallback:!storedCode && transformersChunks.size > 0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
          
          if (storedCode) {
            const filePath = path.join(distDir, bundleFileName);
            try {
              console.log(`⚠️ Restoring unminified transformers chunk: ${bundleFileName}`);
              writeFileSync(filePath, storedCode, 'utf-8');
              console.log(`✅ Restored unminified transformers chunk (${(storedCode.length / 1024).toFixed(1)}KB)`);
              
              // #region agent log
              fetch('http://127.0.0.1:7245/ingest/7d9ee931-8dee-46f8-918b-e417134eb58f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'vite.config.ts:103',message:'File written successfully',data:{bundleFileName,writtenLength:storedCode.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
              // #endregion
            } catch (error) {
              console.warn(`Could not restore transformers chunk ${bundleFileName}:`, error);
              
              // #region agent log
              fetch('http://127.0.0.1:7245/ingest/7d9ee931-8dee-46f8-918b-e417134eb58f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'vite.config.ts:108',message:'File write failed',data:{bundleFileName,error:error instanceof Error ? error.message : String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
              // #endregion
            }
          }
        }
      }
      
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/7d9ee931-8dee-46f8-918b-e417134eb58f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'vite.config.ts:90',message:'writeBundle complete',data:{matchingFilesCount,storedChunksCount:transformersChunks.size,storedKeys:Array.from(transformersChunks.keys())},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
    }
  };
};


// Read app version from package.json
const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));
const appVersion = packageJson.version;

// Note: ONNX Runtime is now required and should load normally
// The stub plugin is removed - ONNX Runtime will use WASM backend automatically

export default defineConfig({
  define: {
    // Inject app version at build time
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(appVersion),
    // Configure ONNX Runtime to use WASM backend (better browser compatibility)
    'process.env.USE_WEBGPU': 'false',
    'process.env.USE_WASM': 'true',
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: false, // Automatically try next available port if 3000 is in use
    open: '/', // Explicitly open the root path
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
    watch: {
      // Ignore Rust build artifacts to prevent "too many open files" error
      ignored: [
        '**/src-tauri/target/**',
        '**/node_modules/**',
        '**/.git/**'
      ]
    },
    fs: {
      // Restrict file system access to prevent scanning Rust docs (53k+ files)
      strict: false,
      allow: [
        path.resolve(__dirname)
      ],
      deny: [
        path.resolve(__dirname, 'src-tauri/target')
      ]
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
    // Exclude models from web builds (they download at runtime)
    excludeModelsPlugin(),
    // Prevent minification of transformers to avoid initialization errors
    noMinifyTransformersPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg', 'pwa-192x192.png', 'pwa-512x512.png'],
      filename: 'manifest.webmanifest', // Explicitly set manifest filename
      strategies: 'generateSW', // Use generateSW strategy (default)
      injectRegister: 'auto', // Auto-inject registration script
      // Ensure PWA installability requirements are met
      minifyManifest: true,
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
        categories: ['health', 'lifestyle', 'medical'],
        shortcuts: [
          {
            name: 'New Log Entry',
            short_name: 'New Log',
            description: 'Create a new reflection log entry',
            url: '/?action=new-log',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'View Reports',
            short_name: 'Reports',
            description: 'View clinical reports and summaries',
            url: '/?view=report',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          }
        ],
        prefer_related_applications: false
      },
      workbox: {
        // Remove models from precaching - they'll use runtime caching instead
        // This prevents quota errors during service worker installation
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,json,webmanifest}'],
        // Reduce to safe limit - models use runtime caching, not precaching
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB - safe for all browsers
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        // Add error handling for cache operations
        navigateFallback: null, // Disable navigation fallback to prevent cache errors
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/], // Don't fallback for API routes or files
        // Handle cache errors gracefully
        mode: 'production',
        sourcemap: false,
        runtimeCaching: [
          // Note: Google Fonts are loaded directly in index.html and should not be cached by service worker
          // to avoid CORS and cache storage errors. The browser will handle font caching naturally.
          {
            urlPattern: /^https:\/\/esm\.sh\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'esm-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
                purgeOnQuotaError: true // Auto-purge on quota exceeded
              }
            }
          },
          {
            // Cache HuggingFace model downloads for offline AI processing
            urlPattern: /^https:\/\/.*huggingface\.co\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'huggingface-models-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year - models don't change often
                purgeOnQuotaError: true // Auto-purge oldest entries on quota exceeded
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Cache CDN model files (onnx, bin, json, etc.)
            // Models download in background after login - not precached to avoid quota issues
            urlPattern: /\.(onnx|bin|safetensors|json|txt)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'ai-models-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                purgeOnQuotaError: true // Auto-purge oldest entries on quota exceeded
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: false, // Disable PWA in dev mode to avoid service worker conflicts
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
    dedupe: ['react', 'react-dom'] // Ensure single React instance
  },
  // Optimize for on-device AI model loading
  optimizeDeps: {
    exclude: [
      '@xenova/transformers', // Exclude from pre-bundling - it's loaded dynamically
      '@tauri-apps/plugin-store',
      '@tauri-apps/plugin-notification'
    ],
    include: ['react', 'react-dom'],
    // Limit dependency scanning to specific entry points to avoid scanning Rust target
    entries: [
      'index.html',
      'src/**/*.{ts,tsx,js,jsx}'
    ],
    esbuildOptions: {
      // Ensure React is treated as external during optimization
      jsx: 'automatic'
    }
  },
  // Configure how modules are resolved and loaded
  // Note: ssr.noExternal is not needed for client-side apps
  build: {
    commonjsOptions: {
      // Transformers uses CommonJS internally - ensure proper transformation
      include: [/node_modules/],
      transformMixedEsModules: true
    },
    // Use esbuild minification - it handles transformers better than terser
    // We'll use a plugin to post-process transformers chunk if needed
    minify: 'esbuild',
    rollupOptions: {
      // Externalize Tauri plugins for web builds (they're only available in Tauri)
      external: isTauriBuild ? [] : [
        '@tauri-apps/plugin-store',
        '@tauri-apps/plugin-notification'
      ],
      plugins: [
        // Plugin to prevent minification issues with transformers
        {
          name: 'fix-transformers-minification',
          renderChunk(code, chunk) {
            // If this is the transformers chunk and it has initialization errors,
            // we need to ensure proper initialization order
            if (chunk.name === 'transformers' || 
                chunk.moduleIds.some(id => id.includes('@xenova/transformers'))) {
              // Check if code has potential initialization issues
              // If minification created problems, we'd need to fix them here
              // For now, just return the code as-is (minification already happened)
              return null; // Let default processing continue
            }
            return null;
          }
        }
      ],
      onwarn(warning, warn) {
        // Suppress eval warnings from third-party libraries (onnxruntime-web)
        // These are safe as they're from trusted dependencies
        if (warning.code === 'EVAL' && warning.id?.includes('onnxruntime-web')) {
          return;
        }
        // Suppress warnings about Tauri plugins in web builds
        if (warning.code === 'UNRESOLVED_IMPORT' && 
            (warning.source?.includes('@tauri-apps/plugin-store') || 
             warning.source?.includes('@tauri-apps/plugin-notification'))) {
          return;
        }
        // Suppress circular dependency warnings for transformers (it has internal circular deps)
        if (warning.code === 'CIRCULAR_DEPENDENCY' && warning.id?.includes('@xenova/transformers')) {
          return;
        }
        warn(warning);
      },
      output: {
        manualChunks: (id) => {
          // Tauri-optimized chunk splitting
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            // Put transformers in its own chunk to avoid minification issues
            // This prevents "Cannot access 'e' before initialization" errors
            if (id.includes('@xenova/transformers')) {
              return 'transformers';
            }
            if (id.includes('framer-motion')) {
              return 'animations';
            }
            return 'vendor';
          }
          // Split services for better code splitting
          if (id.includes('services/ai/')) {
            return 'ai-services';
          }
        },
        // Configure chunk file names
        chunkFileNames: (chunkInfo) => {
          // Don't minify transformers chunk name - helps with debugging
          if (chunkInfo.name === 'transformers') {
            return 'assets/transformers-[hash].js';
          }
          return 'assets/[name]-[hash].js';
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    // Tauri-specific build optimizations
    target: 'esnext',
    // Disable sourcemaps for all production builds to prevent 404 errors and reduce bundle size
    // Source maps are only useful for debugging and shouldn't be in production
    sourcemap: false
  }
});
