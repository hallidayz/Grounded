/**
 * Test Setup
 * Global test configuration and mocks
 */

// Polyfill TextEncoder/TextDecoder for Node.js test environment
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

// Polyfill structuredClone for Node.js < 17
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (obj: any) => {
    return JSON.parse(JSON.stringify(obj));
  };
}
if (typeof window !== 'undefined' && typeof (window as any).structuredClone === 'undefined') {
  (window as any).structuredClone = global.structuredClone;
}

// Use Node.js crypto for Web Crypto API in tests - MUST be before other imports
import { webcrypto } from 'node:crypto';
// Ensure crypto is available globally
(global as any).crypto = webcrypto;
if (typeof window !== 'undefined') {
  (window as any).crypto = webcrypto;
}
// Also ensure it's available as a global
Object.defineProperty(global, 'crypto', {
  value: webcrypto,
  writable: true,
  configurable: true,
});

// Mock IndexedDB for tests
import 'fake-indexeddb/auto';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock OPFS (Origin Private File System) for tests
const opfsStore = new Map<string, ArrayBuffer>();

// Ensure window exists (jsdom should provide this)
if (typeof global !== 'undefined') {
  // Make sure window is available
  if (typeof (global as any).window === 'undefined') {
    (global as any).window = global;
  }
}

// Mock navigator.storage.getDirectory() for OPFS
const mockGetDirectory = async () => {
  return {
    getFileHandle: async (name: string, options?: { create?: boolean }) => {
      const create = options?.create ?? false;
      
      if (!opfsStore.has(name) && !create) {
        throw new Error('File not found');
      }
      
      if (!opfsStore.has(name) && create) {
        opfsStore.set(name, new ArrayBuffer(0));
      }
      
      return {
        getFile: async () => {
          const data = opfsStore.get(name);
          if (!data) {
            throw new Error('File not found');
          }
          return {
            arrayBuffer: async () => data,
          } as File;
        },
        createWritable: async () => {
          return {
            write: async (data: ArrayBuffer) => {
              opfsStore.set(name, data);
            },
            close: async () => {
              // No-op
            },
          };
        },
      };
    },
  };
};

// Set up OPFS mocks
if (typeof window !== 'undefined') {
  if (!(window as any).navigator) {
    (window as any).navigator = {};
  }
  
  if (!(window as any).navigator.storage) {
    (window as any).navigator.storage = {
      getDirectory: mockGetDirectory,
    };
  }
  
  // Mock FileSystemHandle for OPFS detection
  if (!(window as any).FileSystemHandle) {
    (window as any).FileSystemHandle = class FileSystemHandle {
      // Mock class for OPFS detection
    };
  }
}

// Also set up on global for Node.js environment
if (typeof global !== 'undefined') {
  if (!(global as any).window) {
    (global as any).window = global;
  }
  if (!(global as any).navigator) {
    (global as any).navigator = {
      storage: {
        getDirectory: mockGetDirectory,
      },
    };
  }
  if (!(global as any).FileSystemHandle) {
    (global as any).FileSystemHandle = class FileSystemHandle {
      // Mock class for OPFS detection
    };
  }
}

