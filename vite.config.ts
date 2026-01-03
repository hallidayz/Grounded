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
    keepNames: true // Preserves variable names like "cu" and fixes the init error
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
    // fixOnnxPlugin(), // Temporarily disabled to debug initialization error
    noMinifyTransformersPlugin(), // Disable minification to prevent transformers initialization errors
    ...(isTauriBuild ? [Tauri()] : []),
    excludeModelsPlugin(),
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   injectRegister: 'auto',
    //   strategies: 'injectManifest',
    //   srcDir: 'src',
    //   filename: 'sw.js',
    //   manifest: {
    //     name: 'Grounded',
    //     short_name: 'Grounded',
    //     theme_color: '#4F46E5',
    //     background_color: '#F9FAFB',
    //     display: 'standalone',
    //     start_url: '/',
    //     icons: [
    //       { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    //       { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    //       { src: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png', purpose: 'apple touch icon' },
    //       { src: '/icons/mask-icon.svg', sizes: 'any', purpose: 'maskable' },
    //     ],
    //   }
    // })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // Alias @ to src directory
      // Mock Tauri APIs in web builds to prevent import errors
      ...(!isTauriBuild ? {
        '@tauri-apps/api/core': path.resolve(__dirname, 'src/mocks/empty-tauri.ts'),
        '@tauri-apps/api/event': path.resolve(__dirname, 'src/mocks/empty-tauri.ts'),
        '@tauri-apps/api/fs': path.resolve(__dirname, 'src/mocks/empty-tauri.ts'),
        '@tauri-apps/api/path': path.resolve(__dirname, 'src/mocks/empty-tauri.ts'),
        '@tauri-apps/api/shell': path.resolve(__dirname, 'src/mocks/empty-tauri.ts'),
        '@tauri-apps/api/webview': path.resolve(__dirname, 'src/mocks/empty-tauri.ts'),
        '@tauri-apps/api/webviewWindow': path.resolve(__dirname, 'src/mocks/empty-tauri.ts'),
        '@tauri-apps/api/window': path.resolve(__dirname, 'src/mocks/empty-tauri.ts'),
        '@tauri-apps/api/cli': path.resolve(__dirname, 'src/mocks/empty-tauri.ts'),
        '@tauri-apps/plugin-store': path.resolve(__dirname, 'src/mocks/empty-tauri.ts'),
        '@tauri-apps/plugin-notification': path.resolve(__dirname, 'src/mocks/empty-tauri.ts'),
        '@tauri-apps/plugin-deep-link': path.resolve(__dirname, 'src/mocks/empty-tauri.ts'),
      } : {})
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
    minify: 'esbuild',
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