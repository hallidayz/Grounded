/**
 * Database Adapter Types
 * 
 * Shared types and interfaces for database adapters.
 */

import { AppSettings, LogEntry, Goal, LCSWConfig, FeelingLog, UserInteraction, Session, Assessment, CounselorReport } from '../../types';

/**
 * User data structure
 */
export interface UserData {
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

/**
 * App data structure
 */
export interface AppData {
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
  getFeelingLogs(limit?: number, userId?: string): Promise<FeelingLog[]>;
  getFirstFeelingLog(userId?: string): Promise<FeelingLog | null>;
  getFeelingLogsByState(emotionalState: string, limit?: number): Promise<FeelingLog[]>;
  deleteFeelingLog(logId: string): Promise<void>;
  
  // User interactions operations
  saveUserInteraction(interaction: {
    id: string;
    timestamp: string;
    type: string;
    sessionId: string;
    userId?: string;
    valueId?: string;
    emotionalState?: string;
    selectedFeeling?: string;
    metadata?: Record<string, unknown>;
  }): Promise<void>;
  getUserInteractions(sessionId?: string, limit?: number): Promise<UserInteraction[]>;
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
  getSessions(userId: string, limit?: number): Promise<Session[]>;
  getSessionsByValue(valueId: string, limit?: number): Promise<Session[]>;
  
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
  getAssessments(userId: string, limit?: number): Promise<Assessment[]>;

  // Report operations
  saveReport(report: {
    id: string;
    userId: string;
    content: string;
    timestamp: string;
    emailAddresses: string[];
    treatmentProtocols: string[];
  }): Promise<void>;
  getReports(userId: string, limit?: number): Promise<CounselorReport[]>;

  // Values operations
  getActiveValues(userId: string): Promise<string[]>;
  setValuesActive(userId: string, valueIds: string[]): Promise<void>;
  saveValue(userId: string, valueId: string, active?: boolean, priority?: number): Promise<void>;

  // Goals operations
  saveGoal(goal: Goal): Promise<void>;
  getGoals(userId: string): Promise<Goal[]>;
  deleteGoal(goalId: string): Promise<void>;
  
  // Data management operations
  clearAllData(userId: string): Promise<void>;
}
