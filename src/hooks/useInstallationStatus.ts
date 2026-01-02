// src/hooks/useInstallationStatus.ts
import { useEffect, useState, useCallback } from 'react';

// Extend the Window interface to include BeforeInstallPromptEvent
declare global {
  interface WindowEventMap {
    'beforeinstallprompt': BeforeInstallPromptEvent;
  }
}

  interface BeforeInstallPromptEvent extends Event {
    readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed',
    platform: string
  }>;
    prompt(): Promise<void>;
}

export function useInstallationStatus() {
  const [installed, setInstalled] = useState(false);
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const beforeInstallHandler = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    };

    const installedHandler = () => {
      setInstalled(true);
      setPromptEvent(null); // Clear prompt event after installation
    };

    window.addEventListener('beforeinstallprompt', beforeInstallHandler as EventListener);
    window.addEventListener('appinstalled', installedHandler);

    // Initial check if the app is already installed (though 'appinstalled' event usually handles this)
    // This is a heuristic and might not be perfectly reliable across all browsers/platforms
    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true) {
      setInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstallHandler as EventListener);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!promptEvent) {
      console.warn('No install prompt event available.');
      return;
    }
    promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === 'accepted') {
      console.log('PWA installation accepted.');
      setInstalled(true);
    } else {
      console.log('PWA installation dismissed.');
    }
    setPromptEvent(null); // Clear the event after it's used
  }, [promptEvent]); // promptEvent is a dependency

  return { installed, promptEvent, promptInstall };
}
