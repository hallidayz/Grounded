import path from 'path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import Tauri from 'vite-plugin-tauri';
import { readFileSync, rmSync, existsSync } from 'fs';

import { fixOnnxPlugin } from './plugins/fixOnnxPlugin'; // Import the new ONNX fix plugin

// Only load Tauri plugin when building for Tauri
const isTauriBuild = process.env.TAURI_PLATFORM !== undefined;

// Custom plugin to intercept Tauri imports and return mock code
// This works even if filesystem aliases fail or resolve logic is tricky
const mockTauriPlugin = () => ({
  name: "mock-tauri-api",
  enforce: "pre",
  resolveId(id: string) {
    // Catch ANY import starting with @tauri-apps/api or plugin
    if (id.startsWith("@tauri-apps/")) {
      console.log('Mocking Tauri import:', id);
      return "virtual:mock-tauri";
    }
  },
  load(id: string) {
    if (id === "virtual:mock-tauri") {
      return `
        export const invoke = () => Promise.reject("Tauri API not available in browser");
        export const convertFileSrc = (src) => src;
        export const listen = () => Promise.resolve({ unlisten: () => {} });
        export const fetch = () => Promise.reject("Native fetch not supported");
        // Store mock
        export class Store {
          constructor() {}
          get = () => Promise.reject("Store not available");
          set = () => Promise.reject("Store not available");
          save = () => Promise.reject("Store not available");
          load = () => Promise.reject("Store not available");
          delete = () => Promise.reject("Store not available");
          clear = () => Promise.reject("Store not available");
          keys = () => Promise.resolve([]);
          values = () => Promise.resolve([]);
          entries = () => Promise.resolve([]);
        }
        // Notification mock
        export const sendNotification = () => {};
        export const requestPermission = () => Promise.resolve('denied');
        export const isPermissionGranted = () => Promise.resolve(false);
        // Deep link mock
        export const onOpenUrl = () => {};
        export const getCurrent = () => Promise.resolve(null);
        
        export default { invoke, convertFileSrc, listen, fetch, Store, sendNotification, requestPermission, isPermissionGranted, onOpenUrl, getCurrent };
      `;
    }
  },
});

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

// Plugin to prevent minification of transformers chunk (fixes initialization errors)
const noMinifyTransformersPlugin = () => {
  return {
    name: 'no-minify-transformers',
    config: () => ({
      build: {
        minify: false // Disable global minification to fix transformers issue
        // We could try to be more selective, but this is the safest fix for now
      }
    })
  };
};

// Read the app version
const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));
const appVersion = packageJson.version;

export default defineConfig({
  base: '/',
  esbuild: {
    keepNames: true, // Preserves variable names like "cu" and fixes the init error
    supported: {
      'function-name': false // Prevent esbuild from generating __name helper (fixes onmessage error in workers)
    }
  },
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(appVersion),
    'process.env.USE_WEBGPU': 'false',
    'process.env.USE_WASM': 'true',
    '__IS_TAURI_BUILD__': JSON.stringify(isTauriBuild)
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
    // Only use the mock plugin if we are NOT in Tauri
    !isTauriBuild && mockTauriPlugin(),
    // fixOnnxPlugin(), // Temporarily disabled to debug initialization error
    noMinifyTransformersPlugin(), // Disable minification to prevent transformers initialization errors
    ...(isTauriBuild ? [Tauri()] : []),
    excludeModelsPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
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
    exclude: [
      '@xenova/transformers', 
      'onnxruntime-web', 
      'onnxruntime', 
      '@tauri-apps/plugin-store', 
      '@tauri-apps/plugin-notification'
    ],
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
    minify: false, // Explicitly disable minification to fix transformers initialization (ortWeb_min)
    target: 'es2020',
    cssCodeSplit: true, 
    rollupOptions: {
      external: isTauriBuild ? [] : [
        // '@tauri-apps/api/core', // Do not externalize, let code handling deal with it
        // '@tauri-apps/api/cli',
        // '@tauri-apps/plugin-store',
        // '@tauri-apps/plugin-notification'
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
        // Explicit file naming to avoid Rollup placeholder errors (!~{007}~)
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
        
        manualChunks: (id) => {
          // Keep critical chunking logic but simplify if necessary
          if (id.includes('node_modules')) {
            // Put ONNX Runtime in its own chunk to prevent initialization errors
            if (id.includes('onnxruntime-web') || id.includes('onnxruntime')) {
              return 'onnx'; 
            }
            // Put transformers in its own chunk (loads after vendor)
            if (id.includes('@xenova/transformers')) {
              return 'transformers';
            }
            if (id.includes('dexie') || id.includes('dexie-react-hooks')) {
              return 'db-vendor';
            }
            if (id.includes('react') || id.includes('react-dom')) return 'react-vendor';
            if (id.includes('framer-motion')) return 'animations';
            
            // Allow other modules to be chunked automatically by Rollup/Vite
            // Returning 'vendor' for everything else can sometimes cause circular deps if not careful
            // But we'll keep it for now as it was working before the placeholders appeared
            return 'vendor';
          }
          if (id.includes('services/ai/')) return 'ai-services';
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false
  }
});