export interface CrisisContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  available: '24h' | 'daytime' | 'evening' | '不确定';
  notes?: string;
}

export interface UserAgreement {
  agreedToTerms: boolean;
  agreedAt?: Date;
  version: string;
}

export const DEFAULT_CONTACTS: CrisisContact[] = [
  {
    id: '1',
    name: '988 Suicide & Crisis Lifeline',
    phone: '988',
    relationship: 'Crisis Line',
    available: '24h',
    notes: 'Call or text 988 (US)',
  },
  {
    id: '2',
    name: 'Crisis Text Line',
    phone: '741741',
    relationship: 'Crisis Line',
    available: '24h',
    notes: 'Text HOME to 741741',
  },
];

export const TERMS_VERSION = '1.0.0';

export const TERMS_OF_SERVICE = `
# Terms of Service

Last updated: January 2026

## Agreement to Terms

By accessing or using the AC Minds app, you agree to be bound by these Terms of Service and all applicable laws and regulations.

## Use of the App

AC Minds is a mental health support tool designed to provide grounding exercises and emotional check-ins. It is not a replacement for professional mental health care.

## AI and Data

- AI responses are generated locally on your device
- Your conversation history is stored only on your device
- We do not collect, store, or transmit your personal data
- The AI model runs entirely on your device (TinyLlama-1.1B)

## Emergency Notice

If you are experiencing a mental health crisis, please call or text 988 (US) immediately. AC Minds is not designed for emergency response.

## Limitation of Liability

AC Minds is provided "as is" without warranties of any kind. Use at your own discretion.

## Changes to Terms

We may update these terms as the app evolves. Continued use constitutes acceptance of updated terms.

## Contact

Questions about these terms? Contact support@acminds.app
`;

export const PRIVACY_POLICY = `
# Privacy Policy

Last updated: January 2026

## Data Collection

AC Minds collects NO personal data. Everything stays on your device.

## What We Don't Collect

- No chat history transmission
- No location tracking
- No user accounts
- No analytics
- No third-party data sharing

## Local Storage

Your conversation history and preferences are stored only in your browser's local storage.

## AI Processing

All AI processing happens locally using WebLLM. Your conversations are never sent to external servers.

## Your Rights

- Delete all data: Use the Clear Data option in Settings
- Export data: Not available (data stays local)
- Request data deletion: Not applicable (no data on servers)

## Children

AC Minds is not designed for use by children under 13.

## Changes

This policy may be updated. Continued use constitutes acceptance.
`;

export function hasAgreedToTerms(): boolean {
  const agreement = localStorage.getItem('acminds_terms_agreement');
  if (!agreement) return false;
  try {
    const parsed = JSON.parse(agreement);
    return parsed.agreed === true && parsed.version === TERMS_VERSION;
  } catch {
    return false;
  }
}

export function agreeToTerms(): void {
  const agreement = {
    agreed: true,
    agreedAt: new Date().toISOString(),
    version: TERMS_VERSION,
  };
  localStorage.setItem('acminds_terms_agreement', JSON.stringify(agreement));
}

export function getCrisisContacts(): CrisisContact[] {
  const saved = localStorage.getItem('acminds_crisis_contacts');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return DEFAULT_CONTACTS;
    }
  }
  return DEFAULT_CONTACTS;
}

export function saveCrisisContact(contact: CrisisContact): void {
  const contacts = getCrisisContacts();
  const existingIndex = contacts.findIndex(c => c.id === contact.id);
  if (existingIndex >= 0) {
    contacts[existingIndex] = contact;
  } else {
    contacts.push(contact);
  }
  localStorage.setItem('acminds_crisis_contacts', JSON.stringify(contacts));
}

export function deleteCrisisContact(id: string): void {
  const contacts = getCrisisContacts().filter(c => c.id !== id);
  localStorage.setItem('acminds_crisis_contacts', JSON.stringify(contacts));
}

export function clearAllData(): void {
  localStorage.removeItem('grounded_moments');
  localStorage.removeItem('acminds_terms_agreement');
  localStorage.removeItem('acminds_crisis_contacts');
  localStorage.removeItem('theme');
  localStorage.removeItem('user_stats');
  localStorage.removeItem('grounded_value_selections');
}

/**
 * Track session completion for analytics
 * Stores completion stats locally (privacy-first: no external transmission)
 */
export interface UserStats {
  [sessionKey: string]: number | string | undefined; // Count of completions per session
  totalCompletions?: number;
  lastSession?: string;
  lastSessionTime?: string;
}

export function trackCompletion(sessionKey: string): void {
  try {
    const statsStr = localStorage.getItem('user_stats');
    const stats: UserStats = statsStr ? JSON.parse(statsStr) : {};
    
    // Increment completion count for this session
    const currentSessionCount = typeof stats[sessionKey] === 'number' ? stats[sessionKey] : 0;
    stats[sessionKey] = currentSessionCount + 1;

    const currentTotal = typeof stats.totalCompletions === 'number' ? stats.totalCompletions : 0;
    stats.totalCompletions = currentTotal + 1;

    stats.lastSession = sessionKey;
    stats.lastSessionTime = new Date().toISOString();
    
    localStorage.setItem('user_stats', JSON.stringify(stats));
  } catch (error) {
    console.warn('[Settings] Failed to track session completion:', error);
  }
}

export function getUserStats(): UserStats {
  try {
    const statsStr = localStorage.getItem('user_stats');
    return statsStr ? JSON.parse(statsStr) : {};
  } catch {
    return {};
  }
}
