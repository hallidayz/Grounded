import path from 'path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import Tauri from 'vite-plugin-tauri';
import { readFileSync, rmSync, existsSync } from 'fs';

import { fixOnnxPlugin } from './plugins/fixOnnxPlugin'; // Import the new ONNX fix plugin

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
          rmSync(modelsPath, { recursive: true, true: true });
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
    react({
      jsxRuntime: 'automatic',
      fastRefresh: true,
    }),
    fixOnnxPlugin(), // Add the new ONNX fix plugin
    ...(isTauriBuild ? [Tauri()] : []),
    excludeModelsPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      // Ensure all needed assets are included
      includeAssets: ['favicon.svg', 'robots.txt', 'apple-touch-icon.png', 'mask-icon.svg'],
      filename: 'manifest.js', 
      strategies: 'generateSW',
      injectRegister: 'script', // Changed from 'auto' to 'script' to simplify injection
      manifest: {
        name: 'Grounded',
        short_name: 'Grounded',
        theme_color: '#4F46E5',
        background_color: '#F9FAFB',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png', purpose: 'apple touch icon' },
          { src: '/icons/mask-icon.svg', sizes: 'any', purpose: 'maskable' },
        ],
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
        enabled: false
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // Alias @ to src directory
    },
    dedupe: ['react', 'react-dom']
  },
  optimizeDeps: {
    exclude: ['@xenova/transformers', '@tauri-apps/plugin-store', '@tauri-apps/plugin-notification'],
    include: ['react', 'react-dom', 'dexie', 'dexie-react-hooks'], // Add Dexie to include
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
    target: 'es2020',
    cssCodeSplit: true, 
    rollupOptions: {
      external: isTauriBuild ? [] : [
        '@tauri-apps/api/core',
        '@tauri-apps/api/cli',
        '@tauri-apps/plugin-store',
        '@tauri-apps/plugin-notification'
      ],
      onwarn(warning, warn) {
        if (warning.code === 'EVAL' && warning.id?.includes('onnxruntime-web')) return;
        if (warning.code === 'UNRESOLVED_IMPORT' && 
          (warning.id?.includes('@tauri-apps/api/core') ||
            warning.id?.includes('@tauri-apps/api/cli') ||
            warning.id?.includes('@tauri-apps/plugin-store') ||
            warning.id?.includes('@tauri-apps/plugin-notification'))) return;
        if (warning.code === 'CIRCULAR_DEPENDENCY' && warning.id?.includes('@xenova/transformers')) return;
        warn(warning);
      },
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // Put ONNX Runtime and related deps in vendor FIRST (must load before transformers)
            if (id.includes('onnxruntime-web') || id.includes('onnxruntime') || id.includes('dexie') || id.includes('dexie-react-hooks')) {
              return 'vendor'; // Added dexie and dexie-react-hooks to vendor
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