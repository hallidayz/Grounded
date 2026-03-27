/**
 * Energy Check-in Tracking Service
 * 
 * Tracks all energy check-in interactions for future analytics and wellness progress visualization.
 * Uses sessionStorage for now (can be migrated to IndexedDB later if needed).
 */

type EnergyLevel = 'low' | 'medium' | 'high';

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
 * Internal helper to log an event
 */
async function logEvent(action: string, metadata: any): Promise<void> {
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
        action,
        ...metadata,
      }),
    });
  } catch (error) {
    // Convert underscore to space for more readable error messages
    const actionName = action.replace(/_/g, ' ');
    console.error(`[EnergyTracking] Error logging ${actionName}:`, error);
  }
}

/**
 * Log energy level selection
 */
export async function logEnergySelection(energyLevel: EnergyLevel): Promise<void> {
  await logEvent('energy_selection', { energyLevel });
}

/**
 * Log technique selection
 */
export async function logTechniqueSelection(
  energyLevel: EnergyLevel,
  techniqueId: string,
  techniqueName: string
): Promise<void> {
  await logEvent('technique_selection', {
    energyLevel,
    techniqueId,
    techniqueName,
  });
}

/**
 * Log technique start
 */
export async function logTechniqueStart(
  energyLevel: EnergyLevel,
  techniqueId: string,
  techniqueName: string
): Promise<void> {
  await logEvent('technique_start', {
    energyLevel,
    techniqueId,
    techniqueName,
  });
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
  await logEvent('technique_complete', {
    energyLevel,
    techniqueId,
    techniqueName,
    duration,
    completionStatus,
  });
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
  await logEvent('technique_repeat', {
    energyLevel,
    techniqueId,
    techniqueName,
    repeatCount,
  });
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
  await logEvent('technique_done', {
    energyLevel,
    techniqueId,
    techniqueName,
    totalSessionDuration,
  });

  // Clear session ID after done
  clearSessionId();
}

/**
 * Log technique-specific interactions (e.g., color found, evidence added)
 */
export async function logTechniqueInteraction(
  techniqueId: string,
  interactionType: string,
  data?: Record<string, any>
): Promise<void> {
  await logEvent('technique_interaction', {
    techniqueId,
    interactionType,
    ...data,
  });
}
