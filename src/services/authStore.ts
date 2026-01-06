/**
 * Authentication Store
 * Stores user credentials in a separate, unencrypted IndexedDB database
 * This allows authentication to happen BEFORE database unlock
 * 
 * Database: groundedAuthDB (always unencrypted, even when encryption is enabled)
 */

interface AuthUserData {
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

class AuthStore {
  private dbName = 'groundedAuthDB';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  /**
   * Initialize the authentication database
   */
  async init(): Promise<void> {
    if (this.db) {
      return Promise.resolve();
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB is not available'));
        return;
      }

      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        this.initPromise = null;
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.initPromise = null;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create users store
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'id' });
          userStore.createIndex('username', 'username', { unique: true });
          userStore.createIndex('email', 'email', { unique: false });
        }

        // Create reset tokens store
        if (!db.objectStoreNames.contains('reset_tokens')) {
          const tokenStore = db.createObjectStore('reset_tokens', { keyPath: 'token' });
          tokenStore.createIndex('userId', 'userId', { unique: false });
          tokenStore.createIndex('expires', 'expires', { unique: false });
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Create a new user
   */
  async createUser(userData: Omit<AuthUserData, 'id' | 'createdAt'>): Promise<string> {
    await this.init();
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const user: AuthUserData = {
      ...userData,
      id,
      createdAt: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['users'], 'readwrite');
      const store = transaction.objectStore('users');
      const request = store.add(user);

      request.onsuccess = async () => {
        // Wait for transaction to complete before resolving
        // This ensures the user is fully committed to IndexedDB
        await new Promise(resolve => {
          transaction.oncomplete = () => {
            console.log('[AuthStore] User transaction completed:', { userId: id, username: userData.username });
            resolve(undefined);
          };
          transaction.onerror = () => {
            console.error('[AuthStore] User transaction error:', transaction.error);
            reject(transaction.error);
          };
          // Safety timeout
          setTimeout(() => resolve(undefined), 100);
        });
        resolve(id);
      };
      request.onerror = () => {
        console.error('[AuthStore] Error adding user:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get user by username
   */
  async getUserByUsername(username: string): Promise<AuthUserData | null> {
    await this.init();
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['users'], 'readonly');
      const store = transaction.objectStore('users');
      const index = store.index('username');
      const request = index.get(username);

      request.onsuccess = () => {
        resolve(request.result || null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<AuthUserData | null> {
    await this.init();
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['users'], 'readonly');
      const store = transaction.objectStore('users');
      const index = store.index('email');
      const request = index.get(email);

      request.onsuccess = () => {
        resolve(request.result || null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all users (for fallback when session is lost)
   */
  async getAllUsers(): Promise<AuthUserData[]> {
    await this.init();
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['users'], 'readonly');
      const store = transaction.objectStore('users');
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<AuthUserData | null> {
    await this.init();
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['users'], 'readonly');
      const store = transaction.objectStore('users');
      const request = store.get(userId);

      request.onsuccess = () => {
        resolve(request.result || null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Update user
   */
  async updateUser(userId: string, updates: Partial<AuthUserData>): Promise<void> {
    await this.init();
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const updated = { ...user, ...updates };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['users'], 'readwrite');
      const store = transaction.objectStore('users');
      const request = store.put(updated);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Create reset token
   */
  async createResetToken(userId: string, email: string): Promise<string> {
    await this.init();
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const token = `reset_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
    const expires = Date.now() + (24 * 60 * 60 * 1000); // 24 hours

    const tokenData = {
      token,
      userId,
      email,
      expires,
      createdAt: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['reset_tokens'], 'readwrite');
      const store = transaction.objectStore('reset_tokens');
      const request = store.add(tokenData);

      request.onsuccess = () => resolve(token);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get reset token
   */
  async getResetToken(token: string): Promise<{ userId: string; email: string } | null> {
    await this.init();
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['reset_tokens'], 'readonly');
      const store = transaction.objectStore('reset_tokens');
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

        resolve({
          userId: result.userId,
          email: result.email
        });
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete reset token
   */
  async deleteResetToken(token: string): Promise<void> {
    await this.init();
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['reset_tokens'], 'readwrite');
      const store = transaction.objectStore('reset_tokens');
      const request = store.delete(token);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Cleanup expired tokens
   */
  async cleanupExpiredTokens(): Promise<void> {
    await this.init();
    if (!this.db) {
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['reset_tokens'], 'readwrite');
      const store = transaction.objectStore('reset_tokens');
      const index = store.index('expires');
      const request = index.openCursor();
      const now = Date.now();

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          if (cursor.value.expires < now) {
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

export const authStore = new AuthStore();

