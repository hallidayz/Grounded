// src/mocks/empty-tauri.ts

// Generic reject function for async Tauri APIs
const notImplemented = async () => {
  console.warn('Tauri API not available in web browser');
  return Promise.reject('Tauri API not available');
};

// Mock for @tauri-apps/api/core
export const invoke = notImplemented;
export const convertFileSrc = (path: string) => path;
export const listen = notImplemented;

// Mock for @tauri-apps/plugin-store
export class Store {
  constructor(path: string) {
    console.warn('Tauri Store not available in browser');
  }
  get = notImplemented;
  set = notImplemented;
  save = notImplemented;
  load = notImplemented;
  delete = notImplemented;
  clear = notImplemented;
  keys = async () => [];
  values = async () => [];
  entries = async () => [];
}

// Mock for @tauri-apps/plugin-notification
export const sendNotification = notImplemented;
export const requestPermission = async () => 'denied';
export const isPermissionGranted = async () => false;

// Mock for @tauri-apps/plugin-deep-link
export const onOpenUrl = notImplemented;
export const getCurrent = async () => null;

export default {
  invoke,
  convertFileSrc,
  listen,
  Store,
  sendNotification,
  requestPermission,
  isPermissionGranted,
  onOpenUrl,
  getCurrent
};

