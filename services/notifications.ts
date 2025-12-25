/**
 * NOTIFICATIONS ABSTRACTION
 * 
 * Unified notifications interface for Tauri and browser notifications.
 * Automatically uses the appropriate notification mechanism based on platform.
 */

import { isTauri } from './platform';

/**
 * Request notification permission
 */
export async function requestPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }

  if (isTauri()) {
    // In Tauri, we can use the notification plugin
    // For now, fall back to browser notifications
    try {
      if (Notification.permission === 'default') {
        return await Notification.requestPermission();
      }
      return Notification.permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  } else {
    // Browser notifications
    if (Notification.permission === 'default') {
      return await Notification.requestPermission();
    }
    return Notification.permission;
  }
}

/**
 * Check if notifications are permitted
 */
export function hasPermission(): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  return Notification.permission === 'granted';
}

/**
 * Send a notification
 */
export async function sendNotification(
  title: string,
  options?: NotificationOptions
): Promise<void> {
  if (!hasPermission()) {
    const permission = await requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }
  }

  try {
    if (isTauri()) {
      // Use Tauri notification plugin if available
      try {
        // Use function to prevent bundler from trying to resolve this at build time
        const getTauriNotifyImport = () => '@tauri-apps/plugin-notification';
        const tauriNotifyModule = await import(getTauriNotifyImport());
        const { sendNotification: tauriNotify } = tauriNotifyModule;
        await tauriNotify({
          title,
          body: options?.body || '',
          icon: options?.icon,
        });
      } catch (error) {
        // Fallback to browser notifications
        console.warn('Tauri notification plugin not available, using browser notifications:', error);
        new Notification(title, options);
      }
    } else {
      // Browser notifications
      new Notification(title, options);
    }
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

/**
 * Notification options interface
 */
export interface NotificationOptions {
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  requireInteraction?: boolean;
  silent?: boolean;
  timestamp?: number;
  vibrate?: number[];
}

