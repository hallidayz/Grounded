import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import Tauri from 'vite-plugin-tauri';
import { readFileSync } from 'fs';

// Only load Tauri plugin when building for Tauri (when TAURI_PLATFORM is set)
const isTauriBuild = process.env.TAURI_PLATFORM !== undefined;

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
      '@xenova/transformers',
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
  ssr: {
    noExternal: ['@xenova/transformers']
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        // Tauri-specific optimizations
        passes: 2,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      }
    },
    rollupOptions: {
      // Externalize Tauri plugins for web builds (they're only available in Tauri)
      external: isTauriBuild ? [] : [
        '@tauri-apps/plugin-store',
        '@tauri-apps/plugin-notification'
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
        warn(warning);
      },
      output: {
        manualChunks: (id) => {
          // Tauri-optimized chunk splitting
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
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
