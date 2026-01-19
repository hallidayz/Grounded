/**
 * Dexie Database Class - Simplified for performance
 *
 * PRIVACY-FIRST: All data remains on-device in IndexedDB.
 * NO data is ever sent to external servers or cloud services.
 */

import Dexie, { Table } from 'dexie';
import { Goal, FeelingLog, Assessment, CounselorReport, Session, UserInteraction, RuleBasedUsageLog, AppSettings, LogEntry, LCSWConfig } from '../types';

// Version constant for explicit version management
export const CURRENT_DB_VERSION = 4;

// Database schema
interface UserRecord {
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

interface AppDataRecord {
  userId: string;
  data: {
    settings: AppSettings;
    logs: LogEntry[];
    goals: Goal[];
    values: string[];
    lcswConfig?: LCSWConfig;
  };
}

interface ValueRecord {
  id?: number;
  userId: string;
  valueId: string;
  active: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

interface GoalRecord extends Goal {}
interface FeelingLogRecord extends FeelingLog {}
interface UserInteractionRecord extends UserInteraction {}
interface SessionRecord extends Session {}
interface AssessmentRecord extends Assessment {}
interface ReportRecord extends CounselorReport {}
interface ResetTokenRecord {
  token: string;
  userId: string;
  email: string;
  expires: string;
  createdAt: string;
}
interface MetadataRecord {
  id: string;
  appName: string;
  appId: string;
  platform: string;
  version: string;
  createdAt: string;
  lastValidated: string;
  localStorageMigrated?: boolean;
  migrationDate?: string;
}
interface RuleBasedUsageLogRecord extends RuleBasedUsageLog {}

class GroundedDB extends Dexie {
  users!: Table<UserRecord, string>;
  appData!: Table<AppDataRecord, string>;
  values!: Table<ValueRecord, number>;
  goals!: Table<GoalRecord, string>;
  feelingLogs!: Table<FeelingLogRecord, string>;
  userInteractions!: Table<UserInteractionRecord, string>;
  sessions!: Table<SessionRecord, string>;
  assessments!: Table<AssessmentRecord, string>;
  reports!: Table<ReportRecord, string>;
  resetTokens!: Table<ResetTokenRecord, string>;
  metadata!: Table<MetadataRecord, string>;
  ruleBasedUsageLogs!: Table<RuleBasedUsageLogRecord, string>;

  constructor() {
    super('groundedDB');

    this.version(3).stores({
      users: 'id, username, email',
      appData: 'userId',
      values: '++id, userId, valueId, active, createdAt, [userId+active]',
      goals: 'id, userId, valueId, completed, createdAt',
      feelingLogs: 'id, timestamp, emotionalState, userId',
      userInteractions: 'id, timestamp, sessionId, type',
      sessions: 'id, startTimestamp, valueId, userId',
      assessments: 'id, userId, timestamp',
      reports: 'id, userId, timestamp',
      resetTokens: 'token, userId, expires',
      metadata: 'id, appId, platform',
      ruleBasedUsageLogs: 'id, timestamp, type',
    });

    this.version(4).stores({
      userInteractions: 'id, timestamp, sessionId, type, userId',
      ruleBasedUsageLogs: 'id, timestamp, type, userId',
    });
  }
}

// Export singleton instance
export const db = new GroundedDB();

// Helper functions for database operations
export async function createUser(userData: Omit<UserRecord, 'id' | 'createdAt'>): Promise<string> {
  const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const user: UserRecord = { ...userData, id, createdAt: new Date().toISOString() };
  await db.users.add(user);
  return id;
}

export async function getUserByUsername(username: string): Promise<UserRecord | null> {
  return await db.users.where('username').equals(username).first() || null;
}

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  return await db.users.where('email').equals(email).first() || null;
}

export async function getUserById(userId: string): Promise<UserRecord | null> {
  return await db.users.get(userId) || null;
}

export async function getAllUsers(): Promise<UserRecord[]> {
  return await db.users.toArray();
}

export async function updateUser(userId: string, updates: Partial<UserRecord>): Promise<void> {
  await db.users.update(userId, updates);
}

export async function createResetToken(userId: string, email: string): Promise<string> {
  const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const expires = Date.now() + 24 * 60 * 60 * 1000;
  await db.resetTokens.add({
    token,
    userId,
    email,
    expires: expires.toString(),
    createdAt: new Date().toISOString(),
  });
  return token;
}

export async function getResetToken(token: string): Promise<{ userId: string; email: string } | null> {
  const tokenRecord = await db.resetTokens.get(token);
  if (!tokenRecord) return null;

  const expires = parseInt(tokenRecord.expires, 10);
  if (isNaN(expires) || expires < Date.now()) return null;

  return { userId: tokenRecord.userId, email: tokenRecord.email };
}

export async function deleteResetToken(token: string): Promise<void> {
  await db.resetTokens.delete(token);
}

export async function cleanupExpiredTokens(): Promise<void> {
  const now = Date.now();
  const tokens = await db.resetTokens.toArray();
  const expiredTokens = tokens.filter(t => {
    const expires = parseInt(t.expires, 10);
    return !isNaN(expires) && expires < now;
  });

  await Promise.all(expiredTokens.map(t => db.resetTokens.delete(t.token)));
}

interface AppDataRecord {
  userId: string;
  data: {
    settings: AppSettings;
    logs: LogEntry[];
    goals: Goal[];
    values: string[];
    lcswConfig?: LCSWConfig;
  };
}

interface ValueRecord {
  id?: number; // Auto-increment
  userId: string;
  valueId: string;
  active: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

interface GoalRecord extends Goal {
  // Goal interface already has all required fields
}

interface FeelingLogRecord extends FeelingLog {
  // FeelingLog interface already has all required fields
}

interface UserInteractionRecord extends UserInteraction {
  // UserInteraction interface already has all required fields
}

interface SessionRecord extends Session {
  // Session interface already has all required fields
}

interface AssessmentRecord extends Assessment {
}

export async function getFeelingPatterns(startDate: string, endDate: string): Promise<{ state: string; count: number }[]> {
  const logs = await db.feelingLogs
    .where('timestamp')
    .between(startDate, endDate, true, true)
    .toArray();

  const patterns: Record<string, number> = {};
  logs.forEach(log => {
    const state = log.emotionalState || log.emotion || 'unknown';
    patterns[state] = (patterns[state] || 0) + 1;
  });

  return Object.entries(patterns).map(([state, count]) => ({ state, count }));
}

export async function getProgressMetrics(startDate: string, endDate: string): Promise<{
  totalSessions: number;
  averageDuration: number;
  valuesEngaged: string[];
}> {
  const sessions = await db.sessions
    .where('startTimestamp')
    .between(startDate, endDate, true, true)
    .toArray();

  const totalSessions = sessions.length;
  const completedSessions = sessions.filter(s => s.duration !== undefined && s.duration !== null);
  const averageDuration = completedSessions.length > 0
    ? completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / completedSessions.length
    : 0;
  const valuesEngaged = [...new Set(sessions.map(s => s.valueId).filter(Boolean))];

  return { totalSessions, averageDuration, valuesEngaged };
}

export async function getFeelingFrequency(limit?: number): Promise<{ feeling: string; count: number }[]> {
  const logs = await db.feelingLogs
    .orderBy('timestamp')
    .reverse()
    .toArray();

  const frequency: Record<string, number> = {};
  const logsToProcess = limit ? logs.slice(0, limit) : logs;

  logsToProcess.forEach(log => {
    const feeling = log.selectedFeeling;
    if (feeling) {
      frequency[feeling] = (frequency[feeling] || 0) + 1;
    }
  });

  return Object.entries(frequency)
    .map(([feeling, count]) => ({ feeling, count }))
    .sort((a, b) => b.count - a.count);
}
