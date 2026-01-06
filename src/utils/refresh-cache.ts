// refresh-cache.ts
export function watchServiceWorkerVersion(scope = '/') {
  if (!('serviceWorker' in navigator)) return;

  const log = (...args: any[]) => console.debug('[refresh-cache]', ...args);

  const forceReload = () => {
    log('Detected updated service worker. Reloading PWA…');
    window.location.reload();
  };

  navigator.serviceWorker.register('/sw.js', { scope }).then((registration) => {
    log('Service worker registered.', registration.scope);

    if (registration.waiting) {
      // A new SW is waiting to activate—refresh immediately.
      forceReload();
      return;
    }

    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (
          newWorker.state === 'installed' &&
          navigator.serviceWorker.controller
        ) {
          // A newer version has been installed while this page still has an old controller.
          newWorker.postMessage({ type: 'SKIP_WAITING' });
        }
      });
    });
  }).catch((error) => {
    console.error('[refresh-cache] Registration failed:', error);
  });

  // When the new worker takes control of the page, reload silently.
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    log('Service worker controller changed. Triggering reload.');
    forceReload();
  });
}

