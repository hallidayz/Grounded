/**
 * Legacy Adapter
 * 
 * Uses Dexie.js for high-performance IndexedDB operations.
 * Replaces raw IndexedDB API with type-safe, promise-based operations.
 * 
 * PRIVACY-FIRST: All database operations are local-only.
 * NO data is ever sent to external servers or cloud services.
 * 
 * NOTE: Encryption is handled at the Dexie hook level when encryption is enabled.
 * All data operations go through this adapter, which uses the unified groundedDB.
 */

import { Goal, FeelingLog, UserInteraction, Session, Assessment, CounselorReport } from '../../types';
import { 
  db,
  createUser as dexieCreateUser,
  getUserByUsername as dexieGetUserByUsername,
  getUserByEmail as dexieGetUserByEmail,
  getUserById as dexieGetUserById,
  getAllUsers as dexieGetAllUsers,
  updateUser as dexieUpdateUser,
  createResetToken as dexieCreateResetToken,
  getResetToken as dexieGetResetToken,
  deleteResetToken as dexieDeleteResetToken,
  cleanupExpiredTokens as dexieCleanupExpiredTokens,
  getFeelingPatterns as dexieGetFeelingPatterns,
  getProgressMetrics as dexieGetProgressMetrics,
  getFeelingFrequency as dexieGetFeelingFrequency,
} from '../dexieDB';
import type { 
  UserRecord, 
  AppDataRecord, 
  ValueRecord, 
  GoalRecord, 
  FeelingLogRecord, 
  UserInteractionRecord, 
  SessionRecord, 
  AssessmentRecord, 
  ReportRecord 
} from '../dexieDB';
import type { DatabaseAdapter, UserData, AppData } from './types';

/**
 * Check if encryption is enabled
 * Encryption is handled at the Dexie hook level, not at the adapter level
 */
function isEncryptionEnabled(): boolean {
  try {
    return localStorage.getItem('encryption_enabled') === 'true';
  } catch (error) {
    console.error('[LegacyAdapter] Error checking encryption status:', error);
    return false;
  }
}

// Global initialization guard to prevent race conditions
let initializationPromise: Promise<void> | null = null;
let isInitialized = false;

export class LegacyAdapter implements DatabaseAdapter {
  constructor() {
    // Security check: Warn if encryption is enabled but we're using LegacyAdapter
    if (isEncryptionEnabled()) {
      console.warn(
        '[LegacyAdapter] SECURITY WARNING: Encryption is enabled but LegacyAdapter is being used. ' +
        'This should only happen during initialization. PHI data operations will fail.'
      );
    }
  }
  
  async init(): Promise<void> {
    // Singleton pattern: only initialize once, reuse promise if already initializing
    if (isInitialized) {
      return;
    }
    
    if (initializationPromise) {
      return initializationPromise;
    }
    
    initializationPromise = (async () => {
      try {
        // Initialize Dexie database with cleanup
        // This will clean up old databases and open the connection
        await db.initialize();
        isInitialized = true;
      } catch (error) {
        initializationPromise = null; // Reset on error to allow retry
        throw error;
      }
    })();
    
    return initializationPromise;
  }
  
  async createUser(userData: Omit<UserData, 'id' | 'createdAt'>): Promise<string> {
    return dexieCreateUser(userData);
  }
  
  async getUserByUsername(username: string): Promise<UserData | null> {
    return dexieGetUserByUsername(username);
  }
  
  async getUserByEmail(email: string): Promise<UserData | null> {
    return dexieGetUserByEmail(email);
  }
  
  async getUserById(userId: string): Promise<UserData | null> {
    return dexieGetUserById(userId);
  }

  async getAllUsers(): Promise<UserData[]> {
    return dexieGetAllUsers();
  }
  
  async updateUser(userId: string, updates: Partial<UserData>): Promise<void> {
    return dexieUpdateUser(userId, updates);
  }
  
  async getAppData(userId: string): Promise<AppData | null> {
    // Use Dexie for better performance
    const appData = await db.appData.get(userId);
    return appData?.data || null;
  }
  
  async saveAppData(userId: string, data: AppData): Promise<void> {
    // Use Dexie for better performance
    await db.appData.put({
      userId,
      data,
    } as AppDataRecord);
  }
  
  async createResetToken(userId: string, email: string): Promise<string> {
    return dexieCreateResetToken(userId, email);
  }
  
  async getResetToken(token: string): Promise<{ userId: string; email: string } | null> {
    return dexieGetResetToken(token);
  }
  
  async deleteResetToken(token: string): Promise<void> {
    return dexieDeleteResetToken(token);
  }
  
  async cleanupExpiredTokens(): Promise<void> {
    return dexieCleanupExpiredTokens();
  }
  
  async saveFeelingLog(feelingLog: {
    id: string;
    timestamp: string;
    userId?: string;
    emotionalState: string;
    selectedFeeling: string | null;
    aiResponse: string;
    isAIResponse: boolean;
    lowStateCount: number;
    migrated?: boolean;
    migrationDate?: string;
  }): Promise<void> {
    // Hooks manage encryption - adapter just saves
    // Encryption is handled by Dexie hooks if enabled
    await db.feelingLogs.put({
      id: feelingLog.id,
      timestamp: feelingLog.timestamp,
      userId: feelingLog.userId,
      emotion: feelingLog.emotionalState,
      subEmotion: feelingLog.selectedFeeling,
      aiResponse: feelingLog.aiResponse,
      isAIResponse: feelingLog.isAIResponse,
      lowStateCount: feelingLog.lowStateCount,
      emotionalState: feelingLog.emotionalState,
      selectedFeeling: feelingLog.selectedFeeling,
    } as FeelingLogRecord);
  }
  
  async getFeelingLogs(limit?: number, userId?: string): Promise<FeelingLog[]> {
    // Hooks manage encryption - adapter just reads
    // Decryption is handled by Dexie hooks if enabled
    let query = db.feelingLogs.orderBy('timestamp').reverse();
    
    if (userId) {
      query = db.feelingLogs.where('userId').equals(userId).orderBy('timestamp').reverse();
    }
    
    const logs = await query.toArray();
    return limit ? logs.slice(0, limit) : logs;
  }
  
  async getFeelingLogsByState(emotionalState: string, limit?: number): Promise<FeelingLog[]> {
    // Hooks manage encryption - adapter just reads
    let query = db.feelingLogs.where('emotionalState').equals(emotionalState).orderBy('timestamp').reverse();
    const logs = await query.toArray();
    return limit ? logs.slice(0, limit) : logs;
  }
  
  async deleteFeelingLog(logId: string): Promise<void> {
    // Hooks manage encryption - adapter just deletes
    await db.feelingLogs.delete(logId);
  }
  
  async saveUserInteraction(interaction: {
    id: string;
    timestamp: string;
    type: string;
    sessionId: string;
    valueId?: string;
    emotionalState?: string;
    selectedFeeling?: string;
    metadata?: Record<string, unknown>;
    userId?: string;
    migrated?: boolean;
    migrationDate?: string;
  }): Promise<void> {
    // Use Dexie for better performance
    // If userId is not provided, try to get it from the session
    let userId = interaction.userId;
    if (!userId && interaction.sessionId) {
      try {
        const session = await db.sessions.get(interaction.sessionId);
        if (session) {
          userId = session.userId;
        }
      } catch (err) {
        console.warn('[LegacyAdapter] Could not get userId from session:', err);
      }
    }
    
    await db.userInteractions.put({
      id: interaction.id,
      timestamp: interaction.timestamp,
      type: interaction.type,
      sessionId: interaction.sessionId,
      userId: userId,
      valueId: interaction.valueId,
      emotionalState: interaction.emotionalState,
      selectedFeeling: interaction.selectedFeeling,
      metadata: interaction.metadata,
    } as UserInteractionRecord);
  }
  
  async getUserInteractions(sessionId?: string, limit?: number): Promise<UserInteraction[]> {
    // Hooks manage encryption - adapter just reads
    let query = db.userInteractions.orderBy('timestamp').reverse();
    
    if (sessionId) {
      query = db.userInteractions.where('sessionId').equals(sessionId).orderBy('timestamp').reverse();
    }
    
    const interactions = await query.toArray();
    return limit ? interactions.slice(0, limit) : interactions;
  }
  
  async deleteUserInteraction(interactionId: string): Promise<void> {
    // Hooks manage encryption - adapter just deletes
    await db.userInteractions.delete(interactionId);
  }
  
  async saveSession(session: {
    id: string;
    userId: string;
    startTimestamp: string;
    endTimestamp?: string;
    valueId: string;
    initialEmotionalState?: string;
    finalEmotionalState?: string;
    selectedFeeling?: string;
    reflectionLength?: number;
    goalCreated: boolean;
    duration?: number;
  }): Promise<void> {
    // Hooks manage encryption - adapter just saves
    await db.sessions.put({
      id: session.id,
      userId: session.userId,
      startTimestamp: session.startTimestamp,
      endTimestamp: session.endTimestamp,
      valueId: session.valueId,
      initialEmotionalState: session.initialEmotionalState,
      finalEmotionalState: session.finalEmotionalState,
      selectedFeeling: session.selectedFeeling,
      reflectionLength: session.reflectionLength,
      goalCreated: session.goalCreated,
      duration: session.duration,
    } as SessionRecord);
  }
  
  async updateSession(sessionId: string, updates: Partial<{
    endTimestamp: string;
    finalEmotionalState: string;
    reflectionLength: number;
    goalCreated: boolean;
    duration: number;
  }>): Promise<void> {
    // Use Dexie for better performance
    await db.sessions.update(sessionId, updates);
  }
  
  async getSessions(userId: string, limit?: number): Promise<Session[]> {
    // Hooks manage encryption - adapter just reads
    let query = db.sessions.where('userId').equals(userId).orderBy('startTimestamp').reverse();
    const sessions = await query.toArray();
    return limit ? sessions.slice(0, limit) : sessions;
  }
  
  async getSessionsByValue(valueId: string, limit?: number): Promise<Session[]> {
    // Hooks manage encryption - adapter just reads
    let query = db.sessions.where('valueId').equals(valueId).orderBy('startTimestamp').reverse();
    const sessions = await query.toArray();
    return limit ? sessions.slice(0, limit) : sessions;
  }
  
  async getFeelingPatterns(startDate: string, endDate: string): Promise<{ state: string; count: number }[]> {
    return dexieGetFeelingPatterns(startDate, endDate);
  }
  
  async getProgressMetrics(startDate: string, endDate: string): Promise<{
    totalSessions: number;
    averageDuration: number;
    valuesEngaged: string[];
  }> {
    return dexieGetProgressMetrics(startDate, endDate);
  }
  
  async getFeelingFrequency(limit?: number): Promise<{ feeling: string; count: number }[]> {
    return dexieGetFeelingFrequency(limit);
  }

  async saveAssessment(assessment: Assessment): Promise<void> {
    // Use Dexie for better performance
    await db.assessments.put({
      id: assessment.id,
      userId: assessment.userId,
      emotion: assessment.emotion,
      subEmotion: assessment.subEmotion,
      reflection: assessment.reflection,
      assessment: assessment.assessment,
      timestamp: assessment.timestamp,
    } as AssessmentRecord);
  }

  async getAssessments(userId: string, limit?: number): Promise<Assessment[]> {
    // Hooks manage encryption - adapter just reads
    let query = db.assessments.where('userId').equals(userId).orderBy('timestamp').reverse();
    const assessments = await query.toArray();
    return limit ? assessments.slice(0, limit) : assessments;
  }

  async saveReport(report: CounselorReport): Promise<void> {
    // Use Dexie for better performance
    await db.reports.put({
      id: report.id,
      userId: report.userId,
      content: report.content,
      timestamp: report.timestamp,
      emailAddresses: report.emailAddresses,
      treatmentProtocols: report.treatmentProtocols,
    } as ReportRecord);
  }

  async getReports(userId: string, limit?: number): Promise<CounselorReport[]> {
    // Hooks manage encryption - adapter just reads
    let query = db.reports.where('userId').equals(userId).orderBy('timestamp').reverse();
    const reports = await query.toArray();
    return limit ? reports.slice(0, limit) : reports;
  }

  // Values operations
  async getActiveValues(userId: string): Promise<string[]> {
    // Validate userId before querying
    if (!userId || typeof userId !== 'string') {
      console.warn('[LegacyAdapter] Invalid userId for getActiveValues:', userId);
      return [];
    }
    
    try {
      // Use filter approach directly - more reliable than compound index query
      // Compound index queries can fail with invalid key errors, especially with boolean values
      const allValues = await db.values.where('userId').equals(userId).toArray();
      const values = allValues
        .filter(v => v.active === true || v.active === 1) // Handle both boolean and numeric active flags
        .sort((a, b) => (a.priority || 0) - (b.priority || 0));
      
      return values.map(v => v.valueId);
    } catch (error) {
      console.error('[LegacyAdapter] Error getting active values:', error);
      return [];
    }
  }

  async setValuesActive(userId: string, valueIds: string[]): Promise<void> {
    // Use Dexie for better performance with bulk operations
    // Get all existing values for this user
    const allUserValues = await db.values.where('userId').equals(userId).toArray();
    
    // Mark all existing as inactive
    const updates = allUserValues.map(v => ({
      ...v,
      active: false,
      updatedAt: new Date().toISOString(),
    }));
    
    // Update existing values to active if in valueIds, or keep inactive
    const existingValueIds = allUserValues.map(v => v.valueId);
    const newValueIds = valueIds.filter(id => !existingValueIds.includes(id));
    
    // Update existing values
    for (let i = 0; i < valueIds.length; i++) {
      const valueId = valueIds[i];
      const existing = allUserValues.find(v => v.valueId === valueId);
      
      if (existing) {
        await db.values.update(existing.id!, {
          active: true,
          priority: i,
          updatedAt: new Date().toISOString(),
        });
      } else {
        // Add new value
        await db.values.add({
          userId,
          valueId,
          active: true,
          priority: i,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }
    
    // Mark values not in valueIds as inactive
    const toDeactivate = allUserValues.filter(v => !valueIds.includes(v.valueId));
    for (const value of toDeactivate) {
      await db.values.update(value.id!, {
        active: false,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  async saveValue(userId: string, valueId: string, active: boolean = true, priority?: number): Promise<void> {
    // Use Dexie for better performance
    // Find existing value by filtering (no compound index for userId+valueId, so use filter)
    const allUserValues = await db.values.where('userId').equals(userId).toArray();
    const existing = allUserValues.find(v => v.valueId === valueId);
    
    if (existing) {
      // Update existing value
      await db.values.update(existing.id!, {
        active,
        priority: priority !== undefined ? priority : existing.priority,
        updatedAt: new Date().toISOString(),
      });
    } else {
      // Get count of active values for default priority
      const activeCount = await db.values
        .where('[userId+active]')
        .equals([userId, true])
        .count();
      const defaultPriority = priority !== undefined ? priority : activeCount;
      
      // Add new value
      await db.values.add({
        userId,
        valueId,
        active,
        priority: defaultPriority,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  // Goals operations
  async saveGoal(goal: Goal): Promise<void> {
    // Use Dexie for better performance
    await db.goals.put(goal as GoalRecord);
  }

  async getGoals(userId: string): Promise<Goal[]> {
    // Use Dexie for better performance
    const goals = await db.goals
      .where('userId')
      .equals(userId)
      .sortBy('createdAt');
    // Reverse to get newest first
    return goals.reverse();
  }

  async deleteGoal(goalId: string): Promise<void> {
    // Use Dexie for better performance
    await db.goals.delete(goalId);
  }

  async clearAllData(userId: string): Promise<void> {
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid userId for clearAllData');
    }
    
    try {
      // Delete all user-specific data from Dexie
      // Note: userInteractions doesn't have userId indexed, so we filter manually
      const [valuesToDelete, goalsToDelete, feelingLogsToDelete, sessionsToDelete, assessmentsToDelete, reportsToDelete] = await Promise.all([
        db.values.where('userId').equals(userId).toArray(),
        db.goals.where('userId').equals(userId).toArray(),
        db.feelingLogs.where('userId').equals(userId).toArray(),
        db.sessions.where('userId').equals(userId).toArray(),
        db.assessments.where('userId').equals(userId).toArray(),
        db.reports.where('userId').equals(userId).toArray(),
      ]);
      
      // Get userInteractions and ruleBasedUsageLogs by userId (now indexed)
      const [userInteractionsToDelete, ruleBasedUsageLogsToDelete] = await Promise.all([
        db.userInteractions.where('userId').equals(userId).toArray().catch((error) => {
          console.error('[LegacyAdapter] Error getting userInteractions:', error);
          return [];
        }),
        db.ruleBasedUsageLogs.where('userId').equals(userId).toArray().catch((error) => {
          console.error('[LegacyAdapter] Error getting ruleBasedUsageLogs:', error);
          return [];
        }),
      ]);
      
      // Delete all records that have userId indexed
      await Promise.all([
        Promise.all(valuesToDelete.map(v => db.values.delete(v.id!))),
        Promise.all(goalsToDelete.map(g => db.goals.delete(g.id))),
        Promise.all(feelingLogsToDelete.map(f => db.feelingLogs.delete(f.id))),
        Promise.all(sessionsToDelete.map(s => db.sessions.delete(s.id))),
        Promise.all(userInteractionsToDelete.map(u => db.userInteractions.delete(u.id))),
        Promise.all(assessmentsToDelete.map(a => db.assessments.delete(a.id))),
        Promise.all(reportsToDelete.map(r => db.reports.delete(r.id))),
        Promise.all(ruleBasedUsageLogsToDelete.map(r => db.ruleBasedUsageLogs.delete(r.id))),
      ]);
      
      // Clear app data
      await db.appData.where('userId').equals(userId).delete();
      
      console.log('[LegacyAdapter] Cleared all data for user:', userId);
    } catch (error) {
      console.error('[LegacyAdapter] Error clearing all data:', error);
      throw error;
    }
  }
}
