// src/utils/serviceWorker.ts
import { registerSW } from 'virtual:pwa-register';

export const setupServiceWorker = () => {
  const updateSW = registerSW({
    onNeedRefresh() {
      // Prompt user to refresh when new content is available
      if (confirm('New content available! Reload now?')) {
        updateSW(true);
      }
    },
    onOfflineReady() {
      console.log('App ready for offline use.');
    },
    onRegistered(registration) {
      console.log('Service Worker registered:', registration);
    },
    onRegisterError(error) {
      console.error('Service Worker registration error:', error);
    },
  });
};
