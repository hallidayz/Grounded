/**
 * Energy Check-in Tracking Service
 * 
 * Tracks all energy check-in interactions for future analytics and wellness progress visualization.
 * Uses the existing userInteractions table with type-specific metadata.
 */

type EnergyLevel = 'low' | 'medium' | 'high';
type TrackingAction = 'energy_selection' | 'technique_selection' | 'technique_start' | 'technique_complete' | 'technique_repeat' | 'technique_done';

interface EnergyTrackingData {
  energyLevel?: EnergyLevel;
  techniqueId?: string;
  techniqueName?: string;
  duration?: number; // in seconds
  completionStatus?: 'completed' | 'skipped' | 'interrupted';
  repeatCount?: number;
  totalSessionDuration?: number;
  [key: string]: any; // For additional metadata
}

// Generate a simple UUID
function generateId(): string {
  return `energy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
    // Try to import and use getCurrentUser if available
    const { getCurrentUser } = await import('./authService');
    const user = await getCurrentUser();
    return user?.id || sessionStorage.getItem('userId') || 'anonymous';
  } catch {
    return sessionStorage.getItem('userId') || 'anonymous';
  }
}

// Get database adapter
async function getAdapter() {
  try {
    // Try to import and use getDatabaseAdapter if available
    const { getDatabaseAdapter } = await import('./databaseAdapter');
    return getDatabaseAdapter();
  } catch {
    // Fallback: return null if adapter not available
    console.warn('[EnergyTracking] Database adapter not available');
    return null;
  }
}

/**
 * Log energy level selection
 */
export async function logEnergySelection(energyLevel: EnergyLevel): Promise<void> {
  try {
    const adapter = await getAdapter();
    if (!adapter) return;

    const userId = await getUserId();
    const sessionId = getSessionId();
    const timestamp = new Date().toISOString();

    await adapter.saveUserInteraction({
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
  techniqueName: string,
  duration: number
): Promise<void> {
  try {
    const adapter = await getAdapter();
    if (!adapter) return;

    const userId = await getUserId();
    const sessionId = getSessionId();
    const timestamp = new Date().toISOString();

    await adapter.saveUserInteraction({
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
        duration,
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
    const adapter = await getAdapter();
    if (!adapter) return;

    const userId = await getUserId();
    const sessionId = getSessionId();
    const timestamp = new Date().toISOString();

    await adapter.saveUserInteraction({
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
    const adapter = await getAdapter();
    if (!adapter) return;

    const userId = await getUserId();
    const sessionId = getSessionId();
    const timestamp = new Date().toISOString();

    await adapter.saveUserInteraction({
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
    const adapter = await getAdapter();
    if (!adapter) return;

    const userId = await getUserId();
    const sessionId = getSessionId();
    const timestamp = new Date().toISOString();

    await adapter.saveUserInteraction({
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
    const adapter = await getAdapter();
    if (!adapter) return;

    const userId = await getUserId();
    const sessionId = getSessionId();
    const timestamp = new Date().toISOString();

    await adapter.saveUserInteraction({
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
    const adapter = await getAdapter();
    if (!adapter) return;

    const userId = await getUserId();
    const sessionId = getSessionId();
    const timestamp = new Date().toISOString();

    await adapter.saveUserInteraction({
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
