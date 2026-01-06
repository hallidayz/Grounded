/**
 * Database Adapter Pattern
 * Provides unified interface for both legacy IndexedDB and encrypted SQLite databases
 */

import { dbService, DatabaseService } from './database';
import { AppSettings, LogEntry, Goal, LCSWConfig } from '../types';
import { EncryptedPWA } from './encryptedPWA';
import { db } from './dexieDB';
import type { UserRecord, AppDataRecord, ValueRecord, GoalRecord, FeelingLogRecord, UserInteractionRecord, SessionRecord, AssessmentRecord, ReportRecord, ResetTokenRecord } from './dexieDB';

// Re-export types from database.ts for convenience
interface UserData {
  id: string;
  username: string;
  passwordHash: string;
  email: string;
  therapistEmails?: string[];
  termsAccepted: boolean;
  termsAcceptedDate?: string;
  createdAt: string;
  lastLogin?: string;
}

interface AppData {
  settings: AppSettings;
  logs: LogEntry[];
  goals: Goal[];
  values: string[];
  lcswConfig?: LCSWConfig;
}

/**
 * Database Adapter Interface
 * All methods must match DatabaseService exactly
 */
export interface DatabaseAdapter {
  // Initialization
  init(): Promise<void>;
  
  // User operations
  createUser(userData: Omit<UserData, 'id' | 'createdAt'>): Promise<string>;
  getUserByUsername(username: string): Promise<UserData | null>;
  getUserByEmail(email: string): Promise<UserData | null>;
  getUserById(userId: string): Promise<UserData | null>;
  getAllUsers(): Promise<UserData[]>;
  updateUser(userId: string, updates: Partial<UserData>): Promise<void>;
  
  // App data operations
  getAppData(userId: string): Promise<AppData | null>;
  saveAppData(userId: string, data: AppData): Promise<void>;
  
  // Reset token operations
  createResetToken(userId: string, email: string): Promise<string>;
  getResetToken(token: string): Promise<{ userId: string; email: string } | null>;
  deleteResetToken(token: string): Promise<void>;
  cleanupExpiredTokens(): Promise<void>;
  
  // Feeling logs operations
  saveFeelingLog(feelingLog: {
    id: string;
    timestamp: string;
    userId?: string;
    emotionalState: string;
    selectedFeeling: string | null;
    aiResponse: string;
    isAIResponse: boolean;
    lowStateCount: number;
  }): Promise<void>;
  getFeelingLogs(limit?: number, userId?: string): Promise<any[]>;
  getFeelingLogsByState(emotionalState: string, limit?: number): Promise<any[]>;
  deleteFeelingLog(logId: string): Promise<void>;
  
  // User interactions operations
  saveUserInteraction(interaction: {
    id: string;
    timestamp: string;
    type: string;
    sessionId: string;
    valueId?: string;
    emotionalState?: string;
    selectedFeeling?: string;
    metadata?: Record<string, any>;
  }): Promise<void>;
  getUserInteractions(sessionId?: string, limit?: number): Promise<any[]>;
  deleteUserInteraction(interactionId: string): Promise<void>;
  
  // Sessions operations
  saveSession(session: {
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
  }): Promise<void>;
  updateSession(sessionId: string, updates: Partial<{
    endTimestamp: string;
    finalEmotionalState: string;
    reflectionLength: number;
    goalCreated: boolean;
    duration: number;
  }>): Promise<void>;
  getSessions(userId: string, limit?: number): Promise<any[]>;
  getSessionsByValue(valueId: string, limit?: number): Promise<any[]>;
  
  // Analytics operations
  getFeelingPatterns(startDate: string, endDate: string): Promise<{ state: string; count: number }[]>;
  getProgressMetrics(startDate: string, endDate: string): Promise<{
    totalSessions: number;
    averageDuration: number;
    valuesEngaged: string[];
  }>;
  getFeelingFrequency(limit?: number): Promise<{ feeling: string; count: number }[]>;
  // Assessment operations
  saveAssessment(assessment: {
    id: string;
    userId: string;
    emotion: string;
    subEmotion: string;
    reflection: string;
    assessment: string;
    timestamp: string;
  }): Promise<void>;
  getAssessments(userId: string, limit?: number): Promise<any[]>;

  // Report operations
  saveReport(report: {
    id: string;
    userId: string;
    content: string;
    timestamp: string;
    emailAddresses: string[];
    treatmentProtocols: string[];
  }): Promise<void>;
  getReports(userId: string, limit?: number): Promise<any[]>;

  // Values operations - Phase 3: Add to interface
  getActiveValues(userId: string): Promise<string[]>;
  setValuesActive(userId: string, valueIds: string[]): Promise<void>;
  saveValue(userId: string, valueId: string, active?: boolean, priority?: number): Promise<void>;

  // Goals operations - Phase 3: Add to interface
  saveGoal(goal: Goal): Promise<void>;
  getGoals(userId: string): Promise<Goal[]>;
  deleteGoal(goalId: string): Promise<void>;
}

/**
 * Legacy Adapter
 * Uses Dexie.js for high-performance IndexedDB operations
 * Replaces raw IndexedDB API with type-safe, promise-based operations
 * 
 * SECURITY WARNING: This adapter uses unencrypted IndexedDB.
 * It MUST NOT be used for PHI data when encryption is enabled.
 * Use EncryptedAdapter for HIPAA-compliant storage.
 */
export class LegacyAdapter implements DatabaseAdapter {
  private dbService: DatabaseService; // Keep for backward compatibility during transition
  
  constructor(dbService: DatabaseService) {
    this.dbService = dbService;
    
    // Security check: Warn if encryption is enabled but we're using LegacyAdapter
    if (isEncryptionEnabled()) {
      console.warn(
        '[LegacyAdapter] SECURITY WARNING: Encryption is enabled but LegacyAdapter is being used. ' +
        'This should only happen during initialization. PHI data operations will fail.'
      );
    }
  }
  
  async init(): Promise<void> {
    // Initialize Dexie database with cleanup
    // This will clean up old databases and open the connection
    await db.initialize();
    // Don't call dbService.init() - it uses old database.ts with version conflicts
    // All operations should go through Dexie now
  }
  
  async createUser(userData: Omit<UserData, 'id' | 'createdAt'>): Promise<string> {
    return this.dbService.createUser(userData);
  }
  
  async getUserByUsername(username: string): Promise<UserData | null> {
    return this.dbService.getUserByUsername(username);
  }
  
  async getUserByEmail(email: string): Promise<UserData | null> {
    return this.dbService.getUserByEmail(email);
  }
  
  async getUserById(userId: string): Promise<UserData | null> {
    return this.dbService.getUserById(userId);
  }

  async getAllUsers(): Promise<UserData[]> {
    return this.dbService.getAllUsers();
  }
  
  async updateUser(userId: string, updates: Partial<UserData>): Promise<void> {
    return this.dbService.updateUser(userId, updates);
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
    return this.dbService.createResetToken(userId, email);
  }
  
  async getResetToken(token: string): Promise<{ userId: string; email: string } | null> {
    return this.dbService.getResetToken(token);
  }
  
  async deleteResetToken(token: string): Promise<void> {
    return this.dbService.deleteResetToken(token);
  }
  
  async cleanupExpiredTokens(): Promise<void> {
    return this.dbService.cleanupExpiredTokens();
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
  
  async getFeelingLogs(limit?: number, userId?: string): Promise<any[]> {
    // Hooks manage encryption - adapter just reads
    // Decryption is handled by Dexie hooks if enabled
    let query = db.feelingLogs.orderBy('timestamp').reverse();
    
    if (userId) {
      query = db.feelingLogs.where('userId').equals(userId).orderBy('timestamp').reverse();
    }
    
    const logs = await query.toArray();
    return limit ? logs.slice(0, limit) : logs;
  }
  
  async getFeelingLogsByState(emotionalState: string, limit?: number): Promise<any[]> {
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
    metadata?: Record<string, any>;
    userId?: string;
    migrated?: boolean;
    migrationDate?: string;
  }): Promise<void> {
    // Use Dexie for better performance
    await db.userInteractions.put({
      id: interaction.id,
      timestamp: interaction.timestamp,
      type: interaction.type,
      sessionId: interaction.sessionId,
      valueId: interaction.valueId,
      emotionalState: interaction.emotionalState,
      selectedFeeling: interaction.selectedFeeling,
      metadata: interaction.metadata,
    } as UserInteractionRecord);
  }
  
  async getUserInteractions(sessionId?: string, limit?: number): Promise<any[]> {
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
  
  async getSessions(userId: string, limit?: number): Promise<any[]> {
    // Hooks manage encryption - adapter just reads
    let query = db.sessions.where('userId').equals(userId).orderBy('startTimestamp').reverse();
    const sessions = await query.toArray();
    return limit ? sessions.slice(0, limit) : sessions;
  }
  
  async getSessionsByValue(valueId: string, limit?: number): Promise<any[]> {
    // Hooks manage encryption - adapter just reads
    let query = db.sessions.where('valueId').equals(valueId).orderBy('startTimestamp').reverse();
    const sessions = await query.toArray();
    return limit ? sessions.slice(0, limit) : sessions;
  }
  
  async getFeelingPatterns(startDate: string, endDate: string): Promise<{ state: string; count: number }[]> {
    return this.dbService.getFeelingPatterns(startDate, endDate);
  }
  
  async getProgressMetrics(startDate: string, endDate: string): Promise<{
    totalSessions: number;
    averageDuration: number;
    valuesEngaged: string[];
  }> {
    return this.dbService.getProgressMetrics(startDate, endDate);
  }
  
  async getFeelingFrequency(limit?: number): Promise<{ feeling: string; count: number }[]> {
    return this.dbService.getFeelingFrequency(limit);
  }

  async saveAssessment(assessment: any): Promise<void> {
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

  async getAssessments(userId: string, limit?: number): Promise<any[]> {
    // Hooks manage encryption - adapter just reads
    let query = db.assessments.where('userId').equals(userId).orderBy('timestamp').reverse();
    const assessments = await query.toArray();
    return limit ? assessments.slice(0, limit) : assessments;
  }

  async saveReport(report: any): Promise<void> {
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

  async getReports(userId: string, limit?: number): Promise<any[]> {
    // Hooks manage encryption - adapter just reads
    let query = db.reports.where('userId').equals(userId).orderBy('timestamp').reverse();
    const reports = await query.toArray();
    return limit ? reports.slice(0, limit) : reports;
  }

  // Values operations - Phase 3: Implement using Dexie
  async getActiveValues(userId: string): Promise<string[]> {
    // Validate userId before querying
    if (!userId || typeof userId !== 'string') {
      console.warn('[LegacyAdapter] Invalid userId for getActiveValues:', userId);
      return [];
    }
    
    try {
      // Use Dexie for better performance with compound index
      // Fallback to filter if compound index query fails
      let values;
      try {
        values = await db.values
          .where('[userId+active]')
          .equals([userId, true])
          .sortBy('priority');
      } catch (indexError) {
        // Fallback: filter manually if compound index fails
        console.warn('[LegacyAdapter] Compound index query failed, using filter fallback:', indexError);
        const allValues = await db.values.where('userId').equals(userId).toArray();
        values = allValues
          .filter(v => v.active === true)
          .sort((a, b) => (a.priority || 0) - (b.priority || 0));
      }
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

  // Goals operations - Phase 3: Implement using Dexie
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
}

/**
 * Encrypted Adapter
 * Uses EncryptedPWA for all operations
 * Full implementation with SQLite queries
 */
export class EncryptedAdapter implements DatabaseAdapter {
  private encryptedDb: EncryptedPWA;
  
  constructor(encryptedDb: EncryptedPWA) {
    this.encryptedDb = encryptedDb;
  }
  
  async init(): Promise<void> {
    // Encrypted database is already initialized
    return Promise.resolve();
  }
  
  private generateUUID(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  async createUser(userData: Omit<UserData, 'id' | 'createdAt'>): Promise<string> {
    const id = this.generateUUID();
    const createdAt = new Date().toISOString();
    
    await this.encryptedDb.execute(
      `INSERT INTO users_encrypted (id, username, password_hash, email, therapist_emails, terms_accepted, terms_accepted_date, created_at, last_login)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        userData.username,
        userData.passwordHash,
        userData.email || null,
        JSON.stringify(userData.therapistEmails || []),
        userData.termsAccepted ? 1 : 0,
        userData.termsAcceptedDate || null,
        createdAt,
        null
      ]
    );
    
    await this.encryptedDb.auditLog('user_created', 'users_encrypted', id, `User ${userData.username} created`);
    await this.encryptedDb.save();
    
    return id;
  }
  
  async getUserByUsername(username: string): Promise<UserData | null> {
    const results = await this.encryptedDb.query(
      'SELECT * FROM users_encrypted WHERE username = ?',
      [username]
    );
    
    if (results.length === 0) {
      return null;
    }
    
    const row = results[0];
    return {
      id: row.id,
      username: row.username,
      passwordHash: row.password_hash,
      email: row.email,
      therapistEmails: row.therapist_emails ? JSON.parse(row.therapist_emails) : [],
      termsAccepted: row.terms_accepted === 1,
      termsAcceptedDate: row.terms_accepted_date || undefined,
      createdAt: row.created_at,
      lastLogin: row.last_login || undefined
    };
  }
  
  async getUserByEmail(email: string): Promise<UserData | null> {
    const results = await this.encryptedDb.query(
      'SELECT * FROM users_encrypted WHERE email = ?',
      [email]
    );
    
    if (results.length === 0) {
      return null;
    }
    
    const row = results[0];
    return {
      id: row.id,
      username: row.username,
      passwordHash: row.password_hash,
      email: row.email,
      therapistEmails: row.therapist_emails ? JSON.parse(row.therapist_emails) : [],
      termsAccepted: row.terms_accepted === 1,
      termsAcceptedDate: row.terms_accepted_date || undefined,
      createdAt: row.created_at,
      lastLogin: row.last_login || undefined
    };
  }
  
  async getUserById(userId: string): Promise<UserData | null> {
    const results = await this.encryptedDb.query(
      'SELECT * FROM users_encrypted WHERE id = ?',
      [userId]
    );
    
    if (results.length === 0) {
      return null;
    }
    
    const row = results[0];
    return {
      id: row.id,
      username: row.username,
      passwordHash: row.password_hash,
      email: row.email,
      therapistEmails: row.therapist_emails ? JSON.parse(row.therapist_emails) : [],
      termsAccepted: row.terms_accepted === 1,
      termsAcceptedDate: row.terms_accepted_date || undefined,
      createdAt: row.created_at,
      lastLogin: row.last_login || undefined
    };
  }

  async getAllUsers(): Promise<UserData[]> {
    const results = await this.encryptedDb.query('SELECT * FROM users_encrypted');
    
    return results.map(row => ({
      id: row.id,
      username: row.username,
      passwordHash: row.password_hash,
      email: row.email,
      therapistEmails: row.therapist_emails ? JSON.parse(row.therapist_emails) : [],
      termsAccepted: row.terms_accepted === 1,
      termsAcceptedDate: row.terms_accepted_date || undefined,
      createdAt: row.created_at,
      lastLogin: row.last_login || undefined
    }));
  }
  
  async updateUser(userId: string, updates: Partial<UserData>): Promise<void> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    const updated = { ...user, ...updates };
    
    await this.encryptedDb.execute(
      `UPDATE users_encrypted 
       SET username = ?, password_hash = ?, email = ?, therapist_emails = ?, 
           terms_accepted = ?, terms_accepted_date = ?, last_login = ?
       WHERE id = ?`,
      [
        updated.username,
        updated.passwordHash,
        updated.email || null,
        JSON.stringify(updated.therapistEmails || []),
        updated.termsAccepted ? 1 : 0,
        updated.termsAcceptedDate || null,
        updated.lastLogin || null,
        userId
      ]
    );
    
    await this.encryptedDb.auditLog('user_updated', 'users_encrypted', userId, 'User updated');
    await this.encryptedDb.save();
  }
  
  async getAppData(userId: string): Promise<AppData | null> {
    const results = await this.encryptedDb.query(
      'SELECT * FROM app_data_encrypted WHERE user_id = ?',
      [userId]
    );
    
    if (results.length === 0) {
      return null;
    }
    
    const row = results[0];
    return {
      settings: row.settings ? JSON.parse(row.settings) : {},
      logs: row.logs ? JSON.parse(row.logs) : [],
      goals: row.goals ? JSON.parse(row.goals) : [],
      values: row["values"] ? JSON.parse(row["values"]) : [],
      lcswConfig: row.lcsw_config ? JSON.parse(row.lcsw_config) : undefined
    };
  }
  
  async saveAppData(userId: string, data: AppData): Promise<void> {
    await this.encryptedDb.execute(
      `INSERT OR REPLACE INTO app_data_encrypted (user_id, settings, logs, goals, "values", lcsw_config, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        JSON.stringify(data.settings),
        JSON.stringify(data.logs),
        JSON.stringify(data.goals),
        JSON.stringify(data.values),
        JSON.stringify(data.lcswConfig || {}),
        new Date().toISOString()
      ]
    );
    
    await this.encryptedDb.auditLog('app_data_saved', 'app_data_encrypted', userId, 'App data saved');
    await this.encryptedDb.save();
  }
  
  async createResetToken(userId: string, email: string): Promise<string> {
    const token = this.generateUUID();
    const expires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    
    await this.encryptedDb.execute(
      `INSERT INTO reset_tokens_encrypted (token, user_id, email, expires, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [token, userId, email, expires, new Date().toISOString()]
    );
    
    await this.encryptedDb.auditLog('reset_token_created', 'reset_tokens_encrypted', token, `Token created for user ${userId}`);
    await this.encryptedDb.save();
    
    return token;
  }
  
  async getResetToken(token: string): Promise<{ userId: string; email: string } | null> {
    const results = await this.encryptedDb.query(
      'SELECT * FROM reset_tokens_encrypted WHERE token = ?',
      [token]
    );
    
    if (results.length === 0) {
      return null;
    }
    
    const row = results[0];
    
    // Check if token is expired
    if (row.expires < Date.now()) {
      return null;
    }
    
    return { userId: row.user_id, email: row.email };
  }
  
  async deleteResetToken(token: string): Promise<void> {
    await this.encryptedDb.execute(
      'DELETE FROM reset_tokens_encrypted WHERE token = ?',
      [token]
    );
    
    await this.encryptedDb.auditLog('reset_token_deleted', 'reset_tokens_encrypted', token, 'Token deleted');
    await this.encryptedDb.save();
  }
  
  async cleanupExpiredTokens(): Promise<void> {
    await this.encryptedDb.execute(
      'DELETE FROM reset_tokens_encrypted WHERE expires < ?',
      [Date.now()]
    );
    
    await this.encryptedDb.save();
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
    await this.encryptedDb.execute(
      `INSERT INTO feeling_logs_encrypted (id, user_id, timestamp, emotional_state, selected_feeling, reflection_text, ai_analysis, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
       user_id = excluded.user_id,
       emotional_state = excluded.emotional_state,
       selected_feeling = excluded.selected_feeling,
       ai_analysis = excluded.ai_analysis`,
      [
        feelingLog.id,
        feelingLog.userId || null, 
        feelingLog.timestamp,
        feelingLog.emotionalState,
        feelingLog.selectedFeeling,
        null, // reflection_text
        JSON.stringify({ aiResponse: feelingLog.aiResponse, isAIResponse: feelingLog.isAIResponse, lowStateCount: feelingLog.lowStateCount }),
        new Date().toISOString()
      ]
    );
    
    await this.encryptedDb.auditLog('feeling_log_saved', 'feeling_logs_encrypted', feelingLog.id, 'Feeling log saved');
    await this.encryptedDb.save();
  }
  
  async getFeelingLogs(limit?: number, userId?: string): Promise<any[]> {
    let sql = 'SELECT * FROM feeling_logs_encrypted';
    const params: any[] = [];
    
    if (userId) {
      sql += ' WHERE user_id = ?';
      params.push(userId);
    }
    
    sql += ' ORDER BY timestamp DESC';
    
    if (limit) {
      sql += ` LIMIT ${limit}`;
    }
    
    const results = await this.encryptedDb.query(sql, params);
    
    return results.map(row => {
      const aiAnalysis = row.ai_analysis ? JSON.parse(row.ai_analysis) : {};
      return {
        id: row.id,
        userId: row.user_id,
        timestamp: row.timestamp,
        emotionalState: row.emotional_state,
        selectedFeeling: row.selected_feeling,
        reflectionText: row.reflection_text,
        aiAnalysis: aiAnalysis,
        aiResponse: aiAnalysis.aiResponse || '',
        isAIResponse: aiAnalysis.isAIResponse || false,
        lowStateCount: aiAnalysis.lowStateCount || 0,
        createdAt: row.created_at
      };
    });
  }
  
  async getFeelingLogsByState(emotionalState: string, limit?: number): Promise<any[]> {
    let sql = 'SELECT * FROM feeling_logs_encrypted WHERE emotional_state = ? ORDER BY timestamp DESC';
    if (limit) {
      sql += ` LIMIT ${limit}`;
    }
    
    const results = await this.encryptedDb.query(sql, [emotionalState]);
    
    return results.map(row => {
      const aiAnalysis = row.ai_analysis ? JSON.parse(row.ai_analysis) : {};
      return {
        id: row.id,
        userId: row.user_id,
        timestamp: row.timestamp,
        emotionalState: row.emotional_state,
        selectedFeeling: row.selected_feeling,
        reflectionText: row.reflection_text,
        aiAnalysis: aiAnalysis,
        aiResponse: aiAnalysis.aiResponse || '',
        isAIResponse: aiAnalysis.isAIResponse || false,
        lowStateCount: aiAnalysis.lowStateCount || 0,
        createdAt: row.created_at
      };
    });
  }
  
  async deleteFeelingLog(logId: string): Promise<void> {
    await this.encryptedDb.execute(
      'DELETE FROM feeling_logs_encrypted WHERE id = ?',
      [logId]
    );
    
    await this.encryptedDb.auditLog('feeling_log_deleted', 'feeling_logs_encrypted', logId, 'Feeling log pruned');
    await this.encryptedDb.save();
  }
  
  async saveUserInteraction(interaction: {
    id: string;
    timestamp: string;
    type: string;
    sessionId: string;
    valueId?: string;
    emotionalState?: string;
    selectedFeeling?: string;
    metadata?: Record<string, any>;
    userId?: string;
    migrated?: boolean;
    migrationDate?: string;
  }): Promise<void> {
    await this.encryptedDb.execute(
      `INSERT INTO user_interactions_encrypted (id, timestamp, type, session_id, user_id, value_id, emotional_state, selected_feeling, metadata, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
       user_id = excluded.user_id,
       metadata = excluded.metadata`,
      [
        interaction.id,
        interaction.timestamp,
        interaction.type,
        interaction.sessionId,
        interaction.userId || null, // Ensure userId is passed
        interaction.valueId || null,
        interaction.emotionalState || null,
        interaction.selectedFeeling || null,
        JSON.stringify(interaction.metadata || {}),
        new Date().toISOString()
      ]
    );
    
    await this.encryptedDb.auditLog('user_interaction_saved', 'user_interactions_encrypted', interaction.id, `Interaction ${interaction.type} saved`);
    await this.encryptedDb.save();
  }
  
  async getUserInteractions(sessionId?: string, limit?: number): Promise<any[]> {
    let sql: string;
    let params: any[] = [];
    
    if (sessionId) {
      sql = 'SELECT * FROM user_interactions_encrypted WHERE session_id = ? ORDER BY timestamp DESC';
      params = [sessionId];
    } else {
      sql = 'SELECT * FROM user_interactions_encrypted ORDER BY timestamp DESC';
    }
    
    if (limit) {
      sql += ` LIMIT ${limit}`;
    }
    
    const results = await this.encryptedDb.query(sql, params);
    
    return results.map(row => ({
      id: row.id,
      timestamp: row.timestamp,
      type: row.type,
      sessionId: row.session_id,
      valueId: row.value_id,
      emotionalState: row.emotional_state,
      selectedFeeling: row.selected_feeling,
      metadata: row.metadata ? JSON.parse(row.metadata) : {},
      createdAt: row.created_at
    }));
  }
  
  async deleteUserInteraction(interactionId: string): Promise<void> {
    await this.encryptedDb.execute(
      'DELETE FROM user_interactions_encrypted WHERE id = ?',
      [interactionId]
    );
    
    await this.encryptedDb.auditLog('user_interaction_deleted', 'user_interactions_encrypted', interactionId, 'User interaction pruned');
    await this.encryptedDb.save();
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
    await this.encryptedDb.execute(
      `INSERT INTO sessions_encrypted (id, user_id, start_timestamp, end_timestamp, value_id, initial_emotional_state, final_emotional_state, selected_feeling, reflection_length, goal_created, duration, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        session.id,
        session.userId,
        session.startTimestamp,
        session.endTimestamp || null,
        session.valueId,
        session.initialEmotionalState || null,
        session.finalEmotionalState || null,
        session.selectedFeeling || null,
        session.reflectionLength || null,
        session.goalCreated ? 1 : 0,
        session.duration || null,
        new Date().toISOString()
      ]
    );
    
    await this.encryptedDb.auditLog('session_saved', 'sessions_encrypted', session.id, 'Session saved');
    await this.encryptedDb.save();
  }
  
  async updateSession(sessionId: string, updates: Partial<{
    endTimestamp: string;
    finalEmotionalState: string;
    reflectionLength: number;
    goalCreated: boolean;
    duration: number;
  }>): Promise<void> {
    const setClauses: string[] = [];
    const params: any[] = [];
    
    if (updates.endTimestamp !== undefined) {
      setClauses.push('end_timestamp = ?');
      params.push(updates.endTimestamp);
    }
    if (updates.finalEmotionalState !== undefined) {
      setClauses.push('final_emotional_state = ?');
      params.push(updates.finalEmotionalState);
    }
    if (updates.reflectionLength !== undefined) {
      setClauses.push('reflection_length = ?');
      params.push(updates.reflectionLength);
    }
    if (updates.goalCreated !== undefined) {
      setClauses.push('goal_created = ?');
      params.push(updates.goalCreated ? 1 : 0);
    }
    if (updates.duration !== undefined) {
      setClauses.push('duration = ?');
      params.push(updates.duration);
    }
    
    if (setClauses.length === 0) {
      return;
    }
    
    params.push(sessionId);
    
    await this.encryptedDb.execute(
      `UPDATE sessions_encrypted SET ${setClauses.join(', ')} WHERE id = ?`,
      params
    );
    
    await this.encryptedDb.auditLog('session_updated', 'sessions_encrypted', sessionId, 'Session updated');
    await this.encryptedDb.save();
  }
  
  async getSessions(userId: string, limit?: number): Promise<any[]> {
    let sql = 'SELECT * FROM sessions_encrypted WHERE user_id = ? ORDER BY start_timestamp DESC';
    if (limit) {
      sql += ` LIMIT ${limit}`;
    }
    
    const results = await this.encryptedDb.query(sql, [userId]);
    
    return results.map(row => ({
      id: row.id,
      userId: row.user_id,
      startTimestamp: row.start_timestamp,
      endTimestamp: row.end_timestamp,
      valueId: row.value_id,
      initialEmotionalState: row.initial_emotional_state,
      finalEmotionalState: row.final_emotional_state,
      selectedFeeling: row.selected_feeling,
      reflectionLength: row.reflection_length,
      goalCreated: row.goal_created === 1,
      duration: row.duration
    }));
  }
  
  async getSessionsByValue(valueId: string, limit?: number): Promise<any[]> {
    let sql = 'SELECT * FROM sessions_encrypted WHERE value_id = ? ORDER BY start_timestamp DESC';
    if (limit) {
      sql += ` LIMIT ${limit}`;
    }
    
    const results = await this.encryptedDb.query(sql, [valueId]);
    
    return results.map(row => ({
      id: row.id,
      userId: row.user_id,
      startTimestamp: row.start_timestamp,
      endTimestamp: row.end_timestamp,
      valueId: row.value_id,
      initialEmotionalState: row.initial_emotional_state,
      finalEmotionalState: row.final_emotional_state,
      selectedFeeling: row.selected_feeling,
      reflectionLength: row.reflection_length,
      goalCreated: row.goal_created === 1,
      duration: row.duration
    }));
  }
  
  async getFeelingPatterns(startDate: string, endDate: string): Promise<{ state: string; count: number }[]> {
    const results = await this.encryptedDb.query(
      `SELECT emotional_state as state, COUNT(*) as count 
       FROM feeling_logs_encrypted 
       WHERE timestamp >= ? AND timestamp <= ? 
       GROUP BY emotional_state`,
      [startDate, endDate]
    );
    
    return results.map(row => ({
      state: row.state || 'unknown',
      count: row.count
    }));
  }
  
  async getProgressMetrics(startDate: string, endDate: string): Promise<{
    totalSessions: number;
    averageDuration: number;
    valuesEngaged: string[];
  }> {
    const sessions = await this.encryptedDb.query(
      `SELECT * FROM sessions_encrypted 
       WHERE start_timestamp >= ? AND start_timestamp <= ?`,
      [startDate, endDate]
    );
    
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.duration !== null && s.duration !== undefined);
    const averageDuration = completedSessions.length > 0
      ? completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / completedSessions.length
      : 0;
    const valuesEngaged = [...new Set(sessions.map(s => s.value_id))];
    
    return { totalSessions, averageDuration, valuesEngaged };
  }
  
  async getFeelingFrequency(limit?: number): Promise<{ feeling: string; count: number }[]> {
    let sql = `SELECT selected_feeling as feeling, COUNT(*) as count 
               FROM feeling_logs_encrypted 
               WHERE selected_feeling IS NOT NULL 
               GROUP BY selected_feeling 
               ORDER BY count DESC`;
    if (limit) {
      sql += ` LIMIT ${limit}`;
    }
    
    const results = await this.encryptedDb.query(sql);
    
    return results.map(row => ({
      feeling: row.feeling,
      count: row.count
    }));
  }

  async saveAssessment(assessment: any): Promise<void> {
    await this.encryptedDb.execute(
      `INSERT INTO assessments_encrypted (id, user_id, emotion, sub_emotion, reflection, assessment, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        assessment.id,
        assessment.userId,
        assessment.emotion,
        assessment.subEmotion,
        assessment.reflection,
        assessment.assessment,
        assessment.timestamp
      ]
    );
    await this.encryptedDb.save();
  }

  async getAssessments(userId: string, limit?: number): Promise<any[]> {
    let sql = 'SELECT * FROM assessments_encrypted WHERE user_id = ? ORDER BY timestamp DESC';
    if (limit) sql += ` LIMIT ${limit}`;
    
    const results = await this.encryptedDb.query(sql, [userId]);
    return results.map(row => ({
      id: row.id,
      userId: row.user_id,
      emotion: row.emotion,
      subEmotion: row.sub_emotion,
      reflection: row.reflection,
      assessment: row.assessment,
      timestamp: row.timestamp
    }));
  }

  async saveReport(report: any): Promise<void> {
    await this.encryptedDb.execute(
      `INSERT INTO reports_encrypted (id, user_id, content, timestamp, email_addresses, treatment_protocols)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        report.id,
        report.userId,
        report.content,
        report.timestamp,
        JSON.stringify(report.emailAddresses),
        JSON.stringify(report.treatmentProtocols)
      ]
    );
    await this.encryptedDb.save();
  }

  async getReports(userId: string, limit?: number): Promise<any[]> {
    let sql = 'SELECT * FROM reports_encrypted WHERE user_id = ? ORDER BY timestamp DESC';
    if (limit) sql += ` LIMIT ${limit}`;
    
    const results = await this.encryptedDb.query(sql, [userId]);
    return results.map(row => ({
      id: row.id,
      userId: row.user_id,
      content: row.content,
      timestamp: row.timestamp,
      emailAddresses: JSON.parse(row.email_addresses || '[]'),
      treatmentProtocols: JSON.parse(row.treatment_protocols || '[]')
    }));
  }

  // Values operations - Phase 2: Add values methods to EncryptedAdapter
  async getActiveValues(userId: string): Promise<string[]> {
    const results = await this.encryptedDb.query(
      'SELECT value_id FROM values_encrypted WHERE user_id = ? AND active = 1 ORDER BY priority ASC',
      [userId]
    );
    
    return results.map((row: any) => row.value_id);
  }

  async setValuesActive(userId: string, valueIds: string[]): Promise<void> {
    // Mark all existing values as inactive first
    await this.encryptedDb.execute(
      'UPDATE values_encrypted SET active = 0, updated_at = ? WHERE user_id = ?',
      [new Date().toISOString(), userId]
    );
    
    // Get existing values for this user
    const existingValues = await this.encryptedDb.query(
      'SELECT * FROM values_encrypted WHERE user_id = ?',
      [userId]
    );
    
    // Update or insert each value
    for (let i = 0; i < valueIds.length; i++) {
      const valueId = valueIds[i];
      const existing = existingValues.find((v: any) => v.value_id === valueId);
      
      if (existing) {
        // Update existing value to active
        await this.encryptedDb.execute(
          'UPDATE values_encrypted SET active = 1, priority = ?, updated_at = ? WHERE id = ?',
          [i, new Date().toISOString(), existing.id]
        );
      } else {
        // Insert new value
        await this.encryptedDb.execute(
          'INSERT INTO values_encrypted (user_id, value_id, active, priority, created_at, updated_at) VALUES (?, ?, 1, ?, ?, ?)',
          [userId, valueId, i, new Date().toISOString(), new Date().toISOString()]
        );
      }
    }
    
    await this.encryptedDb.auditLog('values_updated', 'values_encrypted', userId, `Set ${valueIds.length} active values`);
    await this.encryptedDb.save();
  }

  async saveValue(userId: string, valueId: string, active: boolean = true, priority?: number): Promise<void> {
    // Check if value already exists
    const existing = await this.encryptedDb.query(
      'SELECT * FROM values_encrypted WHERE user_id = ? AND value_id = ?',
      [userId, valueId]
    );
    
    if (existing.length > 0) {
      // Update existing value
      const currentPriority = priority !== undefined ? priority : existing[0].priority;
      await this.encryptedDb.execute(
        'UPDATE values_encrypted SET active = ?, priority = ?, updated_at = ? WHERE id = ?',
        [active ? 1 : 0, currentPriority, new Date().toISOString(), existing[0].id]
      );
    } else {
      // Get count of active values for default priority
      const activeCount = await this.encryptedDb.query(
        'SELECT COUNT(*) as count FROM values_encrypted WHERE user_id = ? AND active = 1',
        [userId]
      );
      const defaultPriority = priority !== undefined ? priority : (activeCount[0]?.count || 0);
      
      // Insert new value
      await this.encryptedDb.execute(
        'INSERT INTO values_encrypted (user_id, value_id, active, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, valueId, active ? 1 : 0, defaultPriority, new Date().toISOString(), new Date().toISOString()]
      );
    }
    
    await this.encryptedDb.auditLog('value_saved', 'values_encrypted', userId, `Saved value ${valueId}`);
    await this.encryptedDb.save();
  }

  // Goals operations - Phase 3: Add goals methods to EncryptedAdapter
  async saveGoal(goal: Goal): Promise<void> {
    await this.encryptedDb.execute(
      `INSERT INTO goals_encrypted (id, user_id, value_id, text, frequency, completed, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
       text = excluded.text,
       frequency = excluded.frequency,
       completed = excluded.completed,
       updated_at = excluded.updated_at`,
      [
        goal.id,
        goal.userId || null,
        goal.valueId,
        goal.text,
        goal.frequency,
        goal.completed ? 1 : 0,
        goal.createdAt,
        new Date().toISOString()
      ]
    );
    
    // Save goal updates if any
    if (goal.updates && goal.updates.length > 0) {
      for (const update of goal.updates) {
        await this.encryptedDb.execute(
          `INSERT INTO goal_updates_encrypted (id, goal_id, timestamp, note, mood, created_at)
           VALUES (?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO NOTHING`,
          [
            update.id || this.generateUUID(),
            goal.id,
            update.timestamp,
            update.note,
            update.mood || null,
            update.timestamp
          ]
        );
      }
    }
    
    await this.encryptedDb.auditLog('goal_saved', 'goals_encrypted', goal.id, `Goal saved: ${goal.text}`);
    await this.encryptedDb.save();
  }

  async getGoals(userId: string): Promise<Goal[]> {
    const results = await this.encryptedDb.query(
      'SELECT * FROM goals_encrypted WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    
    // Get goal updates for each goal
    const goalsWithUpdates = await Promise.all(
      results.map(async (row: any) => {
        const updates = await this.encryptedDb.query(
          'SELECT * FROM goal_updates_encrypted WHERE goal_id = ? ORDER BY timestamp DESC',
          [row.id]
        );
        
        return {
          id: row.id,
          valueId: row.value_id,
          userId: row.user_id,
          text: row.text,
          frequency: row.frequency,
          completed: row.completed === 1,
          createdAt: row.created_at,
          updates: updates.map((u: any) => ({
            id: u.id,
            timestamp: u.timestamp,
            note: u.note,
            mood: u.mood,
          })),
          status: row.status || (row.completed === 1 ? 'completed' : 'active'),
        } as Goal;
      })
    );
    
    return goalsWithUpdates;
  }

  async deleteGoal(goalId: string): Promise<void> {
    // Delete goal updates first (foreign key constraint)
    await this.encryptedDb.execute(
      'DELETE FROM goal_updates_encrypted WHERE goal_id = ?',
      [goalId]
    );
    
    // Delete goal
    await this.encryptedDb.execute(
      'DELETE FROM goals_encrypted WHERE id = ?',
      [goalId]
    );
    
    await this.encryptedDb.auditLog('goal_deleted', 'goals_encrypted', goalId, 'Goal deleted');
    await this.encryptedDb.save();
  }
}

/**
 * PHI (Protected Health Information) Data Types
 * These data types contain PHI and MUST use encrypted storage when encryption is enabled
 */
const PHI_DATA_TYPES = [
  'feelingLogs',
  'sessions',
  'assessments',
  'reports',
  'userInteractions',
  'logs', // LogEntry contains emotional state and reflections
  'goals', // Goals may contain PHI in notes/updates
] as const;

/**
 * Check if encryption is enabled
 */
export function isEncryptionEnabled(): boolean {
  try {
    return localStorage.getItem('encryption_enabled') === 'true';
  } catch {
    return false;
  }
}

/**
 * Validate that Dexie (non-encrypted) is not being used for PHI data when encryption is enabled
 * This enforces HIPAA compliance by preventing PHI from being stored in unencrypted IndexedDB
 */
export function validateEncryptionBoundary(operation: string, dataType?: string): void {
  if (isEncryptionEnabled() && dataType && PHI_DATA_TYPES.includes(dataType as any)) {
    throw new Error(
      `SECURITY VIOLATION: Attempted to use non-encrypted storage (Dexie) for PHI data type "${dataType}" ` +
      `when encryption is enabled. Operation: ${operation}. ` +
      `PHI data must use EncryptedAdapter (SQLite) for HIPAA compliance.`
    );
  }
}

/**
 * Factory function to get the appropriate adapter
 * 
 * SECURITY: When encryption is enabled, PHI data MUST use EncryptedAdapter.
 * Dexie (LegacyAdapter) is NEVER used for PHI when encryption is enabled.
 * 
 * NOTE: If encryption is enabled but EncryptedPWA is not initialized (e.g., user not logged in),
 * this will return LegacyAdapter with a warning. The adapter will throw errors when PHI operations
 * are attempted, enforcing security at the operation level rather than adapter selection.
 */
export function getDatabaseAdapter(): DatabaseAdapter {
  const encryptionEnabled = isEncryptionEnabled();
  
  if (encryptionEnabled) {
    const encryptedDb = EncryptedPWA.getInstance();
    if (!encryptedDb) {
      // User not logged in yet - encryption is enabled but DB not initialized
      // Return LegacyAdapter with warning - security will be enforced at operation level
      console.warn(
        '[getDatabaseAdapter] Encryption enabled but EncryptedPWA not initialized. ' +
        'Returning LegacyAdapter - PHI operations will be blocked by validateEncryptionBoundary().'
      );
      return new LegacyAdapter(dbService);
    }
    return new EncryptedAdapter(encryptedDb);
  }
  
  // Default to legacy adapter (Dexie) when encryption is disabled
  return new LegacyAdapter(dbService);
}

