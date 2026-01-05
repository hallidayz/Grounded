/**
 * NTFY.SH PUSH NOTIFICATION SERVICE
 * 
 * Secure, on-device push notifications using ntfy.sh
 * - Open-source, self-hostable push system
 * - Publish to a topic via HTTP
 * - Receive notifications on Android, iOS, or desktop
 * - Generous free public instance (https://ntfy.sh)
 * - No per-message charge
 * 
 * Security: Topics are private by default. Users should use a random topic name.
 * All data remains on-device; only notification text is sent to ntfy.sh.
 */

export interface NtfyConfig {
  topic: string;
  server?: string; // Defaults to https://ntfy.sh
}

/**
 * Send push notification via ntfy.sh
 * @param message - Notification message text
 * @param title - Notification title (optional)
 * @param config - Ntfy configuration (topic and optional server)
 * @returns Promise<boolean> - Success status
 */
export async function sendNtfyNotification(
  message: string,
  title: string = 'Grounded',
  config: NtfyConfig
): Promise<boolean> {
  try {
    const server = config.server || 'https://ntfy.sh';
    const topic = config.topic.trim();
    
    if (!topic) {
      console.error('Ntfy topic is required');
      return false;
    }

    // Validate topic name (alphanumeric, dashes, underscores only)
    if (!/^[a-zA-Z0-9_-]+$/.test(topic)) {
      console.error('Invalid ntfy topic name. Use only letters, numbers, dashes, and underscores.');
      return false;
    }

    const url = `${server}/${topic}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'Title': title,
        'Priority': 'default',
        'Tags': 'bell,sparkles'
      },
      body: message
    });

    if (!response.ok) {
      console.error('Ntfy notification failed:', response.status, response.statusText);
      return false;
    }

    console.log('Ntfy notification sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending ntfy notification:', error);
    return false;
  }
}

/**
 * Generate a random topic name for privacy
 * Users can use this or create their own
 */
export function generateRandomTopic(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let topic = 'grounded-';
  for (let i = 0; i < 12; i++) {
    topic += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return topic;
}

/**
 * Validate ntfy topic name
 */
export function isValidTopic(topic: string): boolean {
  if (!topic || topic.length < 1 || topic.length > 64) {
    return false;
  }
  return /^[a-zA-Z0-9_-]+$/.test(topic);
}

