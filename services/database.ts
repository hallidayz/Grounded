/**
 * Local Secure Database Service
 * Uses IndexedDB for secure, structured local storage
 * 
 * Database Naming Convention:
 * - Uses reverse domain notation (com.acminds.grounded.db)
 * - Ensures uniqueness and prevents conflicts with other applications
 * - Follows web standards for IndexedDB naming
 * - Object stores are scoped to this database, so they don't need global uniqueness
 */

import { AppSettings, LogEntry, Goal, LCSWConfig } from '../types';

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

class DatabaseService {
  // Unique database name using reverse domain notation to avoid conflicts
  // Format: com.[company].[appname].[purpose].db ensures uniqueness
  // This ensures no conflicts with other apps like AiNotes or InnerCompass
  private dbName = 'com.acminds.grounded.therapy.db';
  private dbVersion = 3; // Incremented to add userInteractions and sessions stores
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if IndexedDB is available
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB is not available in this browser'));
        return;
      }

      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        const error = request.error || new Error('Unknown database error');
        console.error('Database open error:', error);
        reject(error);
      };
      
      request.onsuccess = () => {
        try {
          this.db = request.result;
          
          // Verify database is actually accessible
          if (!this.db) {
            reject(new Error('Database connection is null'));
            return;
          }
          
          // Set up error handlers for the database connection
          this.db.onerror = (event) => {
            console.error('Database error:', event);
          };
          
          this.db.onclose = () => {
            console.warn('Database connection closed');
            this.db = null;
          };
          
          resolve();
        } catch (error) {
          console.error('Error setting up database:', error);
          reject(error);
        }
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Handle upgrade errors
        if (!db) {
          reject(new Error('Database upgrade failed - database is null'));
          return;
        }

        // Object stores are scoped to this database, so names don't need global uniqueness
        // They only need to be unique within this database instance

        // Users store - stores user account information
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'id' });
          userStore.createIndex('username', 'username', { unique: true });
          userStore.createIndex('email', 'email', { unique: true });
        }

        // App data store - stores application data per user (settings, logs, goals, etc.)
        if (!db.objectStoreNames.contains('appData')) {
          const appDataStore = db.createObjectStore('appData', { keyPath: 'userId' });
          appDataStore.createIndex('userId', 'userId', { unique: true });
        }

        // Reset tokens store - stores password reset tokens with expiration
        if (!db.objectStoreNames.contains('resetTokens')) {
          const resetStore = db.createObjectStore('resetTokens', { keyPath: 'token' });
          resetStore.createIndex('userId', 'userId', { unique: false });
          resetStore.createIndex('expires', 'expires', { unique: false });
        }

        // Feeling logs store - stores historical feeling selections and AI responses for behavioral tracking
        if (!db.objectStoreNames.contains('feelingLogs')) {
          const feelingLogStore = db.createObjectStore('feelingLogs', { keyPath: 'id' });
          feelingLogStore.createIndex('timestamp', 'timestamp', { unique: false });
          feelingLogStore.createIndex('emotionalState', 'emotionalState', { unique: false });
        }

        // User interactions store - tracks all user interactions for analytics
        if (!db.objectStoreNames.contains('userInteractions')) {
          const interactionStore = db.createObjectStore('userInteractions', { keyPath: 'id' });
          interactionStore.createIndex('timestamp', 'timestamp', { unique: false });
          interactionStore.createIndex('sessionId', 'sessionId', { unique: false });
          interactionStore.createIndex('type', 'type', { unique: false });
        }

        // Sessions store - tracks check-in sessions for analytics
        if (!db.objectStoreNames.contains('sessions')) {
          const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' });
          sessionStore.createIndex('startTimestamp', 'startTimestamp', { unique: false });
          sessionStore.createIndex('valueId', 'valueId', { unique: false });
          sessionStore.createIndex('userId', 'userId', { unique: false });
        }
      };
    });
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    if (!this.db) {
      throw new Error('Database initialization failed');
    }
    return this.db;
  }

  // Generate a UUID with fallback for environments without crypto.randomUUID
  private generateUUID(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback UUID v4 generator
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // User operations
  async createUser(userData: Omit<UserData, 'id' | 'createdAt'>): Promise<string> {
    const db = await this.ensureDB();
    const user: UserData = {
      ...userData,
      id: this.generateUUID(),
      createdAt: new Date().toISOString(),
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['users'], 'readwrite');
      const store = transaction.objectStore('users');
      const request = store.add(user);

      request.onsuccess = () => resolve(user.id);
      request.onerror = () => reject(request.error);
    });
  }

  async getUserByUsername(username: string): Promise<UserData | null> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['users'], 'readonly');
      const store = transaction.objectStore('users');
      const index = store.index('username');
      const request = index.get(username);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getUserByEmail(email: string): Promise<UserData | null> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['users'], 'readonly');
      const store = transaction.objectStore('users');
      const index = store.index('email');
      const request = index.get(email);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getUserById(userId: string): Promise<UserData | null> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['users'], 'readonly');
      const store = transaction.objectStore('users');
      const request = store.get(userId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async updateUser(userId: string, updates: Partial<UserData>): Promise<void> {
    const db = await this.ensureDB();
    return new Promise(async (resolve, reject) => {
      const user = await this.getUserById(userId);
      if (!user) {
        reject(new Error('User not found'));
        return;
      }

      const transaction = db.transaction(['users'], 'readwrite');
      const store = transaction.objectStore('users');
      const updatedUser = { ...user, ...updates };
      const request = store.put(updatedUser);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // App data operations
  async getAppData(userId: string): Promise<AppData | null> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['appData'], 'readonly');
      const store = transaction.objectStore('appData');
      const request = store.get(userId);

      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.data : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async saveAppData(userId: string, data: AppData): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['appData'], 'readwrite');
      const store = transaction.objectStore('appData');
      const request = store.put({ userId, data });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Reset token operations
  async createResetToken(userId: string, email: string): Promise<string> {
    const db = await this.ensureDB();
    const token = this.generateUUID();
    const expires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['resetTokens'], 'readwrite');
      const store = transaction.objectStore('resetTokens');
      const request = store.add({
        token,
        userId,
        email,
        expires,
        createdAt: new Date().toISOString(),
      });

      request.onsuccess = () => resolve(token);
      request.onerror = (event) => {
        const error = (event.target as IDBRequest).error;
        console.error('Failed to create reset token:', error);
        reject(error || new Error('Failed to create reset token in database'));
      };
    });
  }

  async getResetToken(token: string): Promise<{ userId: string; email: string } | null> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['resetTokens'], 'readonly');
      const store = transaction.objectStore('resetTokens');
      const request = store.get(token);

      request.onsuccess = () => {
        const result = request.result;
        if (!result) {
          resolve(null);
          return;
        }

        // Check if token is expired
        if (result.expires < Date.now()) {
          resolve(null);
          return;
        }

        resolve({ userId: result.userId, email: result.email });
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteResetToken(token: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['resetTokens'], 'readwrite');
      const store = transaction.objectStore('resetTokens');
      const request = store.delete(token);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Cleanup expired tokens
  async cleanupExpiredTokens(): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['resetTokens'], 'readwrite');
      const store = transaction.objectStore('resetTokens');
      const index = store.index('expires');
      const request = index.openCursor();

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          if (cursor.value.expires < Date.now()) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Feeling logs operations - for behavioral tracking and AI context
  async saveFeelingLog(feelingLog: { id: string; timestamp: string; emotionalState: string; selectedFeeling: string | null; aiResponse: string; isAIResponse: boolean; lowStateCount: number }): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['feelingLogs'], 'readwrite');
      const store = transaction.objectStore('feelingLogs');
      const request = store.add(feelingLog);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getFeelingLogs(limit?: number): Promise<any[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['feelingLogs'], 'readonly');
      const store = transaction.objectStore('feelingLogs');
      const index = store.index('timestamp');
      const request = index.openCursor(null, 'prev'); // Get most recent first

      const logs: any[] = [];
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor && (!limit || logs.length < limit)) {
          logs.push(cursor.value);
          cursor.continue();
        } else {
          resolve(logs);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getFeelingLogsByState(emotionalState: string, limit?: number): Promise<any[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['feelingLogs'], 'readonly');
      const store = transaction.objectStore('feelingLogs');
      const index = store.index('emotionalState');
      const request = index.openCursor(IDBKeyRange.only(emotionalState));

      const logs: any[] = [];
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor && (!limit || logs.length < limit)) {
          logs.push(cursor.value);
          cursor.continue();
        } else {
          resolve(logs);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // User interactions operations - for tracking user behavior
  async saveUserInteraction(interaction: { id: string; timestamp: string; type: string; sessionId: string; valueId?: string; emotionalState?: string; selectedFeeling?: string; metadata?: Record<string, any> }): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['userInteractions'], 'readwrite');
      const store = transaction.objectStore('userInteractions');
      const request = store.add(interaction);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getUserInteractions(sessionId?: string, limit?: number): Promise<any[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['userInteractions'], 'readonly');
      const store = transaction.objectStore('userInteractions');
      const index = sessionId ? store.index('sessionId') : store.index('timestamp');
      const request = sessionId 
        ? index.openCursor(IDBKeyRange.only(sessionId))
        : index.openCursor(null, 'prev'); // Get most recent first

      const interactions: any[] = [];
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor && (!limit || interactions.length < limit)) {
          interactions.push(cursor.value);
          cursor.continue();
        } else {
          resolve(interactions);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Sessions operations - for tracking check-in sessions
  async saveSession(session: { id: string; userId: string; startTimestamp: string; endTimestamp?: string; valueId: string; initialEmotionalState?: string; finalEmotionalState?: string; selectedFeeling?: string; reflectionLength?: number; goalCreated: boolean; duration?: number }): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['sessions'], 'readwrite');
      const store = transaction.objectStore('sessions');
      const request = store.add(session);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async updateSession(sessionId: string, updates: Partial<{ endTimestamp: string; finalEmotionalState: string; reflectionLength: number; goalCreated: boolean; duration: number }>): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['sessions'], 'readwrite');
      const store = transaction.objectStore('sessions');
      const request = store.get(sessionId);

      request.onsuccess = () => {
        const session = request.result;
        if (session) {
          Object.assign(session, updates);
          const updateRequest = store.put(session);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          reject(new Error('Session not found'));
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getSessions(userId: string, limit?: number): Promise<any[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['sessions'], 'readonly');
      const store = transaction.objectStore('sessions');
      const index = store.index('userId');
      const request = index.openCursor(IDBKeyRange.only(userId), 'prev'); // Get most recent first

      const sessions: any[] = [];
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor && (!limit || sessions.length < limit)) {
          sessions.push(cursor.value);
          cursor.continue();
        } else {
          resolve(sessions);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getSessionsByValue(valueId: string, limit?: number): Promise<any[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['sessions'], 'readonly');
      const store = transaction.objectStore('sessions');
      const index = store.index('valueId');
      const request = index.openCursor(IDBKeyRange.only(valueId), 'prev'); // Get most recent first

      const sessions: any[] = [];
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor && (!limit || sessions.length < limit)) {
          sessions.push(cursor.value);
          cursor.continue();
        } else {
          resolve(sessions);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Analytics helper methods for charts/graphs
  async getFeelingPatterns(startDate: string, endDate: string): Promise<{ state: string; count: number }[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['feelingLogs'], 'readonly');
      const store = transaction.objectStore('feelingLogs');
      const index = store.index('timestamp');
      const request = index.openCursor(IDBKeyRange.bound(startDate, endDate));

      const patterns: Record<string, number> = {};
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          const state = cursor.value.emotionalState;
          patterns[state] = (patterns[state] || 0) + 1;
          cursor.continue();
        } else {
          resolve(Object.entries(patterns).map(([state, count]) => ({ state, count })));
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getProgressMetrics(startDate: string, endDate: string): Promise<{ totalSessions: number; averageDuration: number; valuesEngaged: string[] }> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['sessions'], 'readonly');
      const store = transaction.objectStore('sessions');
      const index = store.index('startTimestamp');
      const request = index.openCursor(IDBKeyRange.bound(startDate, endDate));

      const sessions: any[] = [];
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          sessions.push(cursor.value);
          cursor.continue();
        } else {
          const totalSessions = sessions.length;
          const completedSessions = sessions.filter(s => s.duration !== undefined);
          const averageDuration = completedSessions.length > 0
            ? completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / completedSessions.length
            : 0;
          const valuesEngaged = [...new Set(sessions.map(s => s.valueId))];
          
          resolve({ totalSessions, averageDuration, valuesEngaged });
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getFeelingFrequency(limit?: number): Promise<{ feeling: string; count: number }[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['feelingLogs'], 'readonly');
      const store = transaction.objectStore('feelingLogs');
      const request = store.openCursor(null, 'prev'); // Get most recent first

      const frequency: Record<string, number> = {};
      let count = 0;
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor && (!limit || count < limit)) {
          const feeling = cursor.value.selectedFeeling;
          if (feeling) {
            frequency[feeling] = (frequency[feeling] || 0) + 1;
          }
          count++;
          cursor.continue();
        } else {
          resolve(Object.entries(frequency).map(([feeling, count]) => ({ feeling, count })).sort((a, b) => b.count - a.count));
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
}

export const dbService = new DatabaseService();

