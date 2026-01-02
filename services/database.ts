/**
 * Local Secure Database Service
 * Uses IndexedDB for secure, structured local storage
 * 
 * Database Name: groundedDB
 * - Simple, descriptive name that identifies this app
 * - Protected with metadata validation to ensure it's created by this app
 * - Validated across all platforms (PWA, iOS, Android, macOS)
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

interface DatabaseMetadata {
  appName: string;
  appId: string;
  platform: string;
  version: string;
  createdAt: string;
  lastValidated: string;
}

class DatabaseService {
  // Database name: groundedDB - simple and descriptive
  private dbName = 'groundedDB';
  private dbVersion = 5; // Incremented to add ruleBasedUsageLogs store
  private db: IDBDatabase | null = null;
  private oldDbName = 'com.acminds.grounded.therapy.db'; // Old database name for migration detection
  
  // App identification for database validation
  private readonly APP_ID = 'com.acminds.grounded';
  private readonly APP_NAME = 'Grounded';
  
  // Performance optimization: Cache validation and old database check results
  private metadataValidated: boolean = false;
  private oldDatabaseCheckCache: boolean | null = null;
  private metadataCache: DatabaseMetadata | null = null;
  
  /**
   * Check if old database exists and needs migration
   * Optimized: Uses cached result and faster detection method
   */
  async checkForOldDatabase(): Promise<boolean> {
    // Return cached result if available
    if (this.oldDatabaseCheckCache !== null) {
      return this.oldDatabaseCheckCache;
    }

    if (typeof indexedDB === 'undefined') {
      this.oldDatabaseCheckCache = false;
      return false;
    }

    try {
      // Fast path: Try to open old database directly (faster than listing all databases)
      const result = await new Promise<boolean>((resolve) => {
        const request = indexedDB.open(this.oldDbName);
        const timeout = setTimeout(() => {
          resolve(false); // Timeout after 100ms - assume no old database
        }, 100);
        
        request.onsuccess = () => {
          clearTimeout(timeout);
          request.result.close();
          resolve(true);
        };
        request.onerror = () => {
          clearTimeout(timeout);
          resolve(false);
        };
      });
      
      this.oldDatabaseCheckCache = result;
      return result;
    } catch (error) {
      console.warn('Error checking for old database:', error);
      this.oldDatabaseCheckCache = false;
      return false;
    }
  }

  /**
   * Delete old database if it exists
   */
  async deleteOldDatabase(): Promise<void> {
    try {
      if ('databases' in indexedDB) {
        const databases = await (indexedDB as any).databases();
        const oldDb = databases.find((db: any) => db.name === this.oldDbName);
        if (oldDb) {
          await new Promise<void>((resolve, reject) => {
            const deleteRequest = indexedDB.deleteDatabase(this.oldDbName);
            deleteRequest.onsuccess = () => resolve();
            deleteRequest.onerror = () => reject(deleteRequest.error);
            deleteRequest.onblocked = () => {
              console.warn('Old database deletion blocked - another tab may have it open');
              // Wait a bit and try to resolve anyway
              setTimeout(() => resolve(), 1000);
            };
          });
          console.log('✅ Old database deleted successfully');
        }
      }
    } catch (error) {
      console.warn('Error deleting old database:', error);
      // Don't throw - continue with new database creation
    }
  }

  /**
   * Validate that database was created by this app
   * Optimized: Only validates once per session, uses cached metadata
   */
  private async validateDatabase(): Promise<boolean> {
    // Skip validation if already validated in this session
    if (this.metadataValidated) {
      return true;
    }

    if (!this.db) {
      return false;
    }

    try {
      // Use cached metadata if available
      let metadata = this.metadataCache;
      if (!metadata) {
        metadata = await this.getMetadata();
        this.metadataCache = metadata;
      }

      if (!metadata) {
        // No metadata means it's a new database - create it lazily (don't block)
        // Defer metadata creation to avoid blocking initialization
        this.setMetadata().catch(err => {
          console.warn('Failed to set metadata (non-critical):', err);
        });
        this.metadataValidated = true; // Trust new database
        return true;
      }

      // Validate metadata
      const isValid = 
        metadata.appId === this.APP_ID &&
        metadata.appName === this.APP_NAME;
      
      if (!isValid) {
        console.error('Database validation failed - metadata mismatch');
        return false;
      }

      // Mark as validated - skip future validations this session
      this.metadataValidated = true;
      
      // Update last validated timestamp (non-blocking)
      this.updateMetadataValidation().catch(err => {
        console.warn('Failed to update metadata validation timestamp (non-critical):', err);
      });
      
      return true;
    } catch (error) {
      console.error('Error validating database:', error);
      return false;
    }
  }

  /**
   * Get database metadata
   * Optimized: Returns cached metadata if available
   */
  private async getMetadata(): Promise<DatabaseMetadata | null> {
    // Return cached metadata if available
    if (this.metadataCache !== null) {
      return this.metadataCache;
    }

    if (!this.db) {
      return null;
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(['metadata'], 'readonly');
        const store = transaction.objectStore('metadata');
        const request = store.get('app_metadata');

        request.onsuccess = () => {
          const result = request.result || null;
          this.metadataCache = result; // Cache the result
          resolve(result);
        };
        request.onerror = () => {
          resolve(null); // No metadata yet - this is OK for new databases
        };
      } catch (error) {
        resolve(null);
      }
    });
  }

  /**
   * Set database metadata
   */
  private async setMetadata(): Promise<void> {
    if (!this.db) {
      return;
    }

    // Check if metadata store exists before trying to access it
    if (!this.db.objectStoreNames.contains('metadata')) {
      console.warn('Metadata object store does not exist - database may need upgrade');
      return; // Silently fail - metadata is non-critical
    }

    const platform = this.detectPlatform();
    const metadata: DatabaseMetadata = {
      appName: this.APP_NAME,
      appId: this.APP_ID,
      platform,
      version: '1.0.0', // Will be updated from package.json if needed
      createdAt: new Date().toISOString(),
      lastValidated: new Date().toISOString(),
    };

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction(['metadata'], 'readwrite');
        const store = transaction.objectStore('metadata');
        const request = store.put({ id: 'app_metadata', ...metadata });

        request.onsuccess = () => resolve();
        request.onerror = () => {
          // Silently fail - metadata is non-critical
          console.warn('Failed to set metadata (non-critical):', request.error);
          resolve(); // Resolve instead of reject to prevent blocking
        };
      } catch (error) {
        // Silently fail - metadata is non-critical
        console.warn('Failed to set metadata (non-critical):', error);
        resolve(); // Resolve instead of reject to prevent blocking
      }
    });
  }

  /**
   * Update metadata validation timestamp
   */
  private async updateMetadataValidation(): Promise<void> {
    if (!this.db || !this.db.objectStoreNames.contains('metadata')) {
      return; // Silently fail - metadata is non-critical
    }
    
    const metadata = await this.getMetadata();
    if (metadata) {
      try {
        metadata.lastValidated = new Date().toISOString();
        const transaction = this.db!.transaction(['metadata'], 'readwrite');
        const store = transaction.objectStore('metadata');
        store.put({ id: 'app_metadata', ...metadata });
      } catch (error) {
        // Silently fail - metadata is non-critical
        console.warn('Failed to update metadata validation (non-critical):', error);
      }
    }
  }

  /**
   * Detect current platform
   */
  private detectPlatform(): string {
    if (typeof window === 'undefined') {
      return 'unknown';
    }

    // Check for Tauri (desktop)
    if (typeof window !== 'undefined' && '__TAURI__' in window) {
      return 'desktop';
    }

    // Check for Capacitor (mobile)
    if (typeof window !== 'undefined' && (window as any).Capacitor) {
      const platform = (window as any).Capacitor.getPlatform();
      return platform || 'mobile';
    }

    // Check user agent for mobile
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    if (/android/i.test(userAgent)) {
      return 'android';
    }
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      return 'ios';
    }

    // Default to web/PWA
    return 'pwa';
  }

  async init(): Promise<void> {
    // If database is already initialized and connected, return immediately
    if (this.db) {
      return Promise.resolve();
    }

    // Optimized: Only retry on actual "backing store" errors, not on first attempt
    // Most databases will open successfully on first try
    const maxRetries = 2; // Reduced from 3 to 2 for faster failure
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        await new Promise<void>((resolve, reject) => {
          this.initDatabase(resolve, reject);
        });
        return; // Success
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const errorMessage = lastError.message;
        
        // If it's a backing store error, wait and retry
        if (errorMessage.includes('backing store') || errorMessage.includes('Internal error')) {
          if (attempt < maxRetries - 1) {
            console.warn(`Database initialization attempt ${attempt + 1} failed, retrying...`);
            // Reduced wait time: 500ms, 1000ms instead of 1000ms, 2000ms, 3000ms
            await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
            continue;
          }
        }
        // For other errors or final attempt, throw immediately (no retry)
        throw lastError;
      }
    }
    
    throw lastError || new Error('Database initialization failed after retries');
  }

  private initDatabase(resolve: () => void, reject: (error: Error) => void): void {
      // Check if IndexedDB is available
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB is not available in this browser'));
        return;
      }

      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        const error = request.error || new Error('Unknown database error');
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Database open error:', error);
        
        // Handle specific IndexedDB errors with better messages
        if (errorMessage.includes('backing store') || errorMessage.includes('Internal error')) {
          // This usually means database is corrupted or storage is blocked
          reject(new Error('Database storage error. Please try refreshing the page or clearing browser data.'));
        } else if (errorMessage.includes('QuotaExceeded') || errorMessage.includes('quota')) {
          reject(new Error('Storage quota exceeded. Please clear some browser data and try again.'));
        } else if (errorMessage.includes('blocked') || errorMessage.includes('Blocked')) {
          reject(new Error('Database access is blocked. Please check your browser settings and allow local storage.'));
        } else {
          reject(error);
        }
      };
      
      request.onsuccess = async () => {
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
            // Clear caches when connection closes
            this.metadataValidated = false;
            this.metadataCache = null;
          };
          
          // Validate database after connection (non-blocking for subsequent calls)
          // Only validate if not already validated this session
          if (!this.metadataValidated) {
            const isValid = await this.validateDatabase();
            if (!isValid) {
              reject(new Error('Database validation failed - database may be corrupted or from another app'));
              return;
            }
          }
          
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

        // Metadata store - validates database belongs to this app
        // Protects against corruption and ensures database integrity
        if (!db.objectStoreNames.contains('metadata')) {
          const metadataStore = db.createObjectStore('metadata', { keyPath: 'id' });
          metadataStore.createIndex('appId', 'appId', { unique: false });
          metadataStore.createIndex('platform', 'platform', { unique: false });
        }

        // Rule-based usage logs store - tracks when rule-based fallbacks are used
        if (!db.objectStoreNames.contains('ruleBasedUsageLogs')) {
          const ruleBasedLogStore = db.createObjectStore('ruleBasedUsageLogs', { keyPath: 'id' });
          ruleBasedLogStore.createIndex('timestamp', 'timestamp', { unique: false });
          ruleBasedLogStore.createIndex('type', 'type', { unique: false });
        }
        
        request.onblocked = () => {
          console.warn('Database upgrade blocked - another tab may have the database open');
          // Don't reject - the upgrade will complete when the other tab closes
          // The onsuccess handler will still fire
        };
      };
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
    
    // Check if appData store exists
    if (!db.objectStoreNames.contains('appData')) {
      // Store doesn't exist - return null
      return null;
    }
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(['appData'], 'readonly');
        const store = transaction.objectStore('appData');
        const request = store.get(userId);

        request.onsuccess = () => {
          const result = request.result;
          resolve(result ? result.data : null);
        };
        request.onerror = () => {
          // Silently fail - return null if store access fails
          console.warn('Failed to get app data (non-critical):', request.error);
          resolve(null);
        };
      } catch (error) {
        // Silently fail - return null if store access fails
        console.warn('Failed to get app data (non-critical):', error);
        resolve(null);
      }
    });
  }

  async saveAppData(userId: string, data: AppData): Promise<void> {
    const db = await this.ensureDB();
    
    // Check if appData store exists
    if (!db.objectStoreNames.contains('appData')) {
      // Store doesn't exist - silently fail (non-critical)
      console.warn('App data store not available - data will not be saved');
      return;
    }
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(['appData'], 'readwrite');
        const store = transaction.objectStore('appData');
        const request = store.put({ userId, data });

        request.onsuccess = () => resolve();
        request.onerror = () => {
          // Silently fail - saving is non-critical
          console.warn('Failed to save app data (non-critical):', request.error);
          resolve(); // Resolve instead of reject to prevent blocking
        };
      } catch (error) {
        // Silently fail - saving is non-critical
        console.warn('Failed to save app data (non-critical):', error);
        resolve(); // Resolve instead of reject to prevent blocking
      }
    });
  }

  // Reset token operations
  async createResetToken(userId: string, email: string): Promise<string> {
    const db = await this.ensureDB();
    
    // Check if resetTokens store exists
    if (!db.objectStoreNames.contains('resetTokens')) {
      throw new Error('Reset tokens store not available - database may need upgrade');
    }
    
    const token = this.generateUUID();
    const expires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    return new Promise((resolve, reject) => {
      try {
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
      } catch (error) {
        console.error('Failed to create reset token:', error);
        reject(error);
      }
    });
  }

  async getResetToken(token: string): Promise<{ userId: string; email: string } | null> {
    const db = await this.ensureDB();
    
    // Check if resetTokens store exists
    if (!db.objectStoreNames.contains('resetTokens')) {
      // Store doesn't exist - no token to get
      return null;
    }
    
    return new Promise((resolve, reject) => {
      try {
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
        request.onerror = () => {
          // Silently fail - return null if store access fails
          console.warn('Failed to get reset token (non-critical):', request.error);
          resolve(null);
        };
      } catch (error) {
        // Silently fail - return null if store access fails
        console.warn('Failed to get reset token (non-critical):', error);
        resolve(null);
      }
    });
  }

  async deleteResetToken(token: string): Promise<void> {
    const db = await this.ensureDB();
    
    // Check if resetTokens store exists
    if (!db.objectStoreNames.contains('resetTokens')) {
      // Store doesn't exist - nothing to delete, silently return
      return;
    }
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(['resetTokens'], 'readwrite');
        const store = transaction.objectStore('resetTokens');
        const request = store.delete(token);

        request.onsuccess = () => resolve();
        request.onerror = () => {
          // Silently fail - deletion is non-critical
          console.warn('Failed to delete reset token (non-critical):', request.error);
          resolve(); // Resolve instead of reject to prevent blocking
        };
      } catch (error) {
        // Silently fail - deletion is non-critical
        console.warn('Failed to delete reset token (non-critical):', error);
        resolve(); // Resolve instead of reject to prevent blocking
      }
    });
  }

  // Cleanup expired tokens
  async cleanupExpiredTokens(): Promise<void> {
    const db = await this.ensureDB();
    
    // Check if resetTokens store exists before trying to access it
    if (!db.objectStoreNames.contains('resetTokens')) {
      // Store doesn't exist - nothing to clean up, silently return
      return;
    }
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(['resetTokens'], 'readwrite');
        const store = transaction.objectStore('resetTokens');
        
        // Check if index exists
        if (!store.indexNames.contains('expires')) {
          // Index doesn't exist - nothing to clean up, silently return
          resolve();
          return;
        }
        
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
        request.onerror = () => {
          // Silently fail - cleanup is non-critical
          console.warn('Failed to cleanup expired tokens (non-critical):', request.error);
          resolve(); // Resolve instead of reject to prevent blocking
        };
      } catch (error) {
        // Silently fail - cleanup is non-critical
        console.warn('Failed to cleanup expired tokens (non-critical):', error);
        resolve(); // Resolve instead of reject to prevent blocking
      }
    });
  }

  // Feeling logs operations - for behavioral tracking and AI context
  async saveFeelingLog(feelingLog: any): Promise<void> {
    const db = await this.ensureDB();
    
    // Ensure object store exists
    if (!db.objectStoreNames.contains('feelingLogs')) {
      console.warn('feelingLogs object store does not exist');
      return Promise.resolve();
    }
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(['feelingLogs'], 'readwrite');
        const store = transaction.objectStore('feelingLogs');
        
        // Normalize the log entry - support both old and new schema
        const normalizedLog: any = {
          id: feelingLog.id,
          timestamp: feelingLog.timestamp,
          // New schema fields
          emotion: feelingLog.emotion || feelingLog.emotionalState || '',
          subEmotion: feelingLog.subEmotion !== undefined ? feelingLog.subEmotion : (feelingLog.selectedFeeling || null),
          jsonIn: feelingLog.jsonIn || '',
          jsonOut: feelingLog.jsonOut || '',
          focusLens: feelingLog.focusLens || '',
          reflection: feelingLog.reflection || '',
          selfAdvocacy: feelingLog.selfAdvocacy || '',
          frequency: feelingLog.frequency || 'daily',
          jsonAssessment: feelingLog.jsonAssessment || '',
          // Legacy fields for backward compatibility
          emotionalState: feelingLog.emotionalState || feelingLog.emotion || '',
          selectedFeeling: feelingLog.selectedFeeling !== undefined ? feelingLog.selectedFeeling : (feelingLog.subEmotion || null),
          aiResponse: feelingLog.aiResponse || feelingLog.jsonOut || '',
          isAIResponse: feelingLog.isAIResponse !== undefined ? feelingLog.isAIResponse : true,
          lowStateCount: feelingLog.lowStateCount || 0,
        };
        
        const request = store.put(normalizedLog); // Use put instead of add to allow updates

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      } catch (error) {
        console.error('Error saving feeling log:', error);
        resolve(); // Fail silently for non-critical operations
      }
    });
  }

  async saveRuleBasedUsage(log: any): Promise<void> {
    const db = await this.ensureDB();
    
    // Ensure object store exists
    if (!db.objectStoreNames.contains('ruleBasedUsageLogs')) {
      console.warn('ruleBasedUsageLogs object store does not exist - skipping save (non-critical)');
      return Promise.resolve();
    }
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(['ruleBasedUsageLogs'], 'readwrite');
        const store = transaction.objectStore('ruleBasedUsageLogs');
        const request = store.add(log);

        request.onsuccess = () => resolve();
        request.onerror = () => {
          console.error('Failed to save rule-based usage log:', request.error);
          resolve(); // Fail silently for non-critical logging
        };
      } catch (error) {
        console.error('Error saving rule-based usage log:', error);
        resolve(); // Fail silently
      }
    });
  }

  async getRuleBasedUsageLogs(limit?: number, days?: number): Promise<any[]> {
    const db = await this.ensureDB();
    
    if (!db.objectStoreNames.contains('ruleBasedUsageLogs')) {
      return Promise.resolve([]);
    }
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(['ruleBasedUsageLogs'], 'readonly');
        const store = transaction.objectStore('ruleBasedUsageLogs');
        const index = store.index('timestamp');
        
        let range: IDBKeyRange | null = null;
        if (days) {
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - days);
          range = IDBKeyRange.lowerBound(cutoffDate.toISOString());
        }
        
        const request = range ? index.getAll(range) : index.getAll();
        
        request.onsuccess = () => {
          let results = request.result || [];
          if (limit) {
            results = results.slice(0, limit);
          }
          resolve(results);
        };
        request.onerror = () => reject(request.error);
      } catch (error) {
        console.error('Error getting rule-based usage logs:', error);
        resolve([]); // Return empty array on error
      }
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

