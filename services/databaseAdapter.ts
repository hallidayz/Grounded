/**
 * Database Adapter Pattern
 * Provides unified interface for both legacy IndexedDB and encrypted SQLite databases
 */

import { dbService, DatabaseService } from './database';
import { AppSettings, LogEntry, Goal, LCSWConfig } from '../types';
import { EncryptedPWA } from './encryptedPWA';

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
}

/**
 * Legacy Adapter
 * Wraps existing DatabaseService - preserves all existing functionality
 */
export class LegacyAdapter implements DatabaseAdapter {
  private dbService: DatabaseService;
  
  constructor(dbService: DatabaseService) {
    this.dbService = dbService;
  }
  
  async init(): Promise<void> {
    return this.dbService.init();
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
    return this.dbService.getAppData(userId);
  }
  
  async saveAppData(userId: string, data: AppData): Promise<void> {
    return this.dbService.saveAppData(userId, data);
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
    migrated?: boolean; // Added for migration tracking
    migrationDate?: string; // Added for migration tracking
  }): Promise<void> {
    return this.dbService.saveFeelingLog(feelingLog);
  }
  
  async getFeelingLogs(limit?: number, userId?: string): Promise<any[]> {
    return this.dbService.getFeelingLogs(limit, userId);
  }
  
  async getFeelingLogsByState(emotionalState: string, limit?: number): Promise<any[]> {
    return this.dbService.getFeelingLogsByState(emotionalState, limit);
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
    userId?: string; // Ensure userId is passed through
    migrated?: boolean;
    migrationDate?: string;
  }): Promise<void> {
    return this.dbService.saveUserInteraction(interaction);
  }
  
  async getUserInteractions(sessionId?: string, limit?: number): Promise<any[]> {
    return this.dbService.getUserInteractions(sessionId, limit);
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
    return this.dbService.saveSession(session);
  }
  
  async updateSession(sessionId: string, updates: Partial<{
    endTimestamp: string;
    finalEmotionalState: string;
    reflectionLength: number;
    goalCreated: boolean;
    duration: number;
  }>): Promise<void> {
    return this.dbService.updateSession(sessionId, updates);
  }
  
  async getSessions(userId: string, limit?: number): Promise<any[]> {
    return this.dbService.getSessions(userId, limit);
  }
  
  async getSessionsByValue(valueId: string, limit?: number): Promise<any[]> {
    return this.dbService.getSessionsByValue(valueId, limit);
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
    return this.dbService.saveAssessment(assessment);
  }

  async getAssessments(userId: string, limit?: number): Promise<any[]> {
    return this.dbService.getAssessments(userId, limit);
  }

  async saveReport(report: any): Promise<void> {
    return this.dbService.saveReport(report);
  }

  async getReports(userId: string, limit?: number): Promise<any[]> {
    return this.dbService.getReports(userId, limit);
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
}

/**
 * Factory function to get the appropriate adapter
 */
export function getDatabaseAdapter(): DatabaseAdapter {
  // Check if encryption is enabled
  const encryptionEnabled = localStorage.getItem('encryption_enabled') === 'true';
  
  if (encryptionEnabled) {
    const encryptedDb = EncryptedPWA.getInstance();
    if (!encryptedDb) {
      // Fallback to legacy if encrypted DB not initialized
      console.warn('Encrypted database not initialized, falling back to legacy');
      return new LegacyAdapter(dbService);
    }
    return new EncryptedAdapter(encryptedDb);
  }
  // Default to legacy adapter
  return new LegacyAdapter(dbService);
}

