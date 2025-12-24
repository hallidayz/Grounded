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
  settings: any;
  logs: any[];
  goals: any[];
  values: string[];
  lcswConfig?: any;
}

class DatabaseService {
  // Unique database name using reverse domain notation to avoid conflicts
  // Format: com.[appname].[purpose].db ensures uniqueness
  private dbName = 'com.acminds.grounded.db';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

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

  // User operations
  async createUser(userData: Omit<UserData, 'id' | 'createdAt'>): Promise<string> {
    const db = await this.ensureDB();
    const user: UserData = {
      ...userData,
      id: crypto.randomUUID(),
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
    const token = crypto.randomUUID();
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
      request.onerror = () => reject(request.error);
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
}

export const dbService = new DatabaseService();

