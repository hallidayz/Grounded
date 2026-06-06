/**
 * Energy Check-in Tracking Service
 * 
 * Tracks all energy check-in interactions for future analytics and wellness progress visualization.
 * Uses sessionStorage for now (can be migrated to IndexedDB later if needed).
 */

type EnergyLevel = 'low' | 'medium' | 'high';

// Generate a secure UUID
export function generateId(prefix: string = 'energy'): string {
  try {
    // Use cryptographically secure randomUUID if available
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return `${prefix}_${crypto.randomUUID()}`;
    }

    // Fallback using crypto.getRandomValues if randomUUID is not available
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const buffer = new Uint8Array(16);
      crypto.getRandomValues(buffer);
      // Simple hex conversion for a secure random string
      const hex = Array.from(buffer).map(b => b.toString(16).padStart(2, '0')).join('');
      return `${prefix}_${hex}`;
    }
  } catch (e) {
    // Fallback if crypto fails
  }

  // Robust fallback using timestamp and multiple random components
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 9);
  const extraRandom = Math.random().toString(36).substring(2, 9);

  return `${prefix}_${timestamp}_${randomPart}_${extraRandom}`;
}

// Get or create session ID
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('energyCheckInSessionId');
  if (!sessionId) {
    sessionId = generateId();
    sessionStorage.setItem('energyCheckInSessionId', sessionId);
  }
  return sessionId;
}

// Clear session ID (call when done)
function clearSessionId(): void {
  sessionStorage.removeItem('energyCheckInSessionId');
}

// Get current user ID
async function getUserId(): Promise<string> {
  try {
    return sessionStorage.getItem('userId') || localStorage.getItem('userId') || 'anonymous';
  } catch {
    return 'anonymous';
  }
}

// Simple storage using sessionStorage
async function saveInteraction(data: {
  id: string;
  timestamp: string;
  type: string;
  sessionId: string;
  userId?: string;
  metadata: string;
}): Promise<void> {
  try {
    const key = `energy_interaction_${data.id}`;
    sessionStorage.setItem(key, JSON.stringify(data));
    
    // Also store in a list for retrieval
    const listKey = 'energy_interactions_list';
    const existing = sessionStorage.getItem(listKey);
    const list = existing ? JSON.parse(existing) : [];
    list.push(data.id);
    sessionStorage.setItem(listKey, JSON.stringify(list));
  } catch (error) {
    console.warn('[EnergyTracking] Failed to save interaction:', error);
  }
}

/**
 * Log energy level selection
 */
export async function logEnergySelection(energyLevel: EnergyLevel): Promise<void> {
  try {
    const userId = await getUserId();
    const sessionId = getSessionId();
    const timestamp = new Date().toISOString();

    await saveInteraction({
      id: generateId(),
      timestamp,
      type: 'energy_checkin',
      sessionId,
      userId: userId !== 'anonymous' ? userId : undefined,
      metadata: JSON.stringify({
        action: 'energy_selection',
        energyLevel,
      }),
    });
  } catch (error) {
    console.error('[EnergyTracking] Error logging energy selection:', error);
  }
}

/**
 * Log technique selection
 */
export async function logTechniqueSelection(
  energyLevel: EnergyLevel,
  techniqueId: string,
  techniqueName: string
): Promise<void> {
  try {
    const userId = await getUserId();
    const sessionId = getSessionId();
    const timestamp = new Date().toISOString();

    await saveInteraction({
      id: generateId(),
      timestamp,
      type: 'energy_checkin',
      sessionId,
      userId: userId !== 'anonymous' ? userId : undefined,
      metadata: JSON.stringify({
        action: 'technique_selection',
        energyLevel,
        techniqueId,
        techniqueName,
      }),
    });
  } catch (error) {
    console.error('[EnergyTracking] Error logging technique selection:', error);
  }
}

/**
 * Log technique start
 */
export async function logTechniqueStart(
  energyLevel: EnergyLevel,
  techniqueId: string,
  techniqueName: string
): Promise<void> {
  try {
    const userId = await getUserId();
    const sessionId = getSessionId();
    const timestamp = new Date().toISOString();

    await saveInteraction({
      id: generateId(),
      timestamp,
      type: 'energy_checkin',
      sessionId,
      userId: userId !== 'anonymous' ? userId : undefined,
      metadata: JSON.stringify({
        action: 'technique_start',
        energyLevel,
        techniqueId,
        techniqueName,
      }),
    });
  } catch (error) {
    console.error('[EnergyTracking] Error logging technique start:', error);
  }
}

/**
 * Log technique completion
 */
export async function logTechniqueComplete(
  energyLevel: EnergyLevel,
  techniqueId: string,
  techniqueName: string,
  duration: number,
  completionStatus: 'completed' | 'skipped' | 'interrupted' = 'completed'
): Promise<void> {
  try {
    const userId = await getUserId();
    const sessionId = getSessionId();
    const timestamp = new Date().toISOString();

    await saveInteraction({
      id: generateId(),
      timestamp,
      type: 'energy_checkin',
      sessionId,
      userId: userId !== 'anonymous' ? userId : undefined,
      metadata: JSON.stringify({
        action: 'technique_complete',
        energyLevel,
        techniqueId,
        techniqueName,
        duration,
        completionStatus,
      }),
    });
  } catch (error) {
    console.error('[EnergyTracking] Error logging technique completion:', error);
  }
}

/**
 * Log repeat action
 */
export async function logTechniqueRepeat(
  energyLevel: EnergyLevel,
  techniqueId: string,
  techniqueName: string,
  repeatCount: number
): Promise<void> {
  try {
    const userId = await getUserId();
    const sessionId = getSessionId();
    const timestamp = new Date().toISOString();

    await saveInteraction({
      id: generateId(),
      timestamp,
      type: 'energy_checkin',
      sessionId,
      userId: userId !== 'anonymous' ? userId : undefined,
      metadata: JSON.stringify({
        action: 'technique_repeat',
        energyLevel,
        techniqueId,
        techniqueName,
        repeatCount,
      }),
    });
  } catch (error) {
    console.error('[EnergyTracking] Error logging technique repeat:', error);
  }
}

/**
 * Log done action (end of session)
 */
export async function logTechniqueDone(
  energyLevel: EnergyLevel,
  techniqueId: string | null,
  techniqueName: string | null,
  totalSessionDuration: number
): Promise<void> {
  try {
    const userId = await getUserId();
    const sessionId = getSessionId();
    const timestamp = new Date().toISOString();

    await saveInteraction({
      id: generateId(),
      timestamp,
      type: 'energy_checkin',
      sessionId,
      userId: userId !== 'anonymous' ? userId : undefined,
      metadata: JSON.stringify({
        action: 'technique_done',
        energyLevel,
        techniqueId,
        techniqueName,
        totalSessionDuration,
      }),
    });

    // Clear session ID after done
    clearSessionId();
  } catch (error) {
    console.error('[EnergyTracking] Error logging technique done:', error);
  }
}

/**
 * Log technique-specific interactions (e.g., color found, evidence added)
 */
export async function logTechniqueInteraction(
  techniqueId: string,
  interactionType: string,
  data?: Record<string, any>
): Promise<void> {
  try {
    const userId = await getUserId();
    const sessionId = getSessionId();
    const timestamp = new Date().toISOString();

    await saveInteraction({
      id: generateId(),
      timestamp,
      type: 'energy_checkin',
      sessionId,
      userId: userId !== 'anonymous' ? userId : undefined,
      metadata: JSON.stringify({
        action: 'technique_interaction',
        techniqueId,
        interactionType,
        ...data,
      }),
    });
  } catch (error) {
    console.error('[EnergyTracking] Error logging technique interaction:', error);
  }
}
