import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import Tauri from 'vite-plugin-tauri';

// Only load Tauri plugin when building for Tauri (when TAURI_PLATFORM is set)
const isTauriBuild = process.env.TAURI_PLATFORM !== undefined;

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: false, // Automatically try next available port if 3000 is in use
    open: '/', // Explicitly open the root path
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
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
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      filename: 'manifest.webmanifest', // Explicitly set manifest filename
      strategies: 'generateSW', // Use generateSW strategy (default)
      injectRegister: 'auto', // Auto-inject registration script
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
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,json,webmanifest}', '**/models/**/*'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10MB - for AI models
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/esm\.sh\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'esm-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 1 week
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
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year - models don't change often
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Cache CDN model files (onnx, bin, json, etc.)
            urlPattern: /\.(onnx|bin|safetensors|json|txt)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'ai-models-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
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
    exclude: ['@xenova/transformers'],
    include: ['react', 'react-dom'],
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
      onwarn(warning, warn) {
        // Suppress eval warnings from third-party libraries (onnxruntime-web)
        // These are safe as they're from trusted dependencies
        if (warning.code === 'EVAL' && warning.id?.includes('onnxruntime-web')) {
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
    sourcemap: isTauriBuild ? false : true // Disable sourcemaps for Tauri builds
  }
});
