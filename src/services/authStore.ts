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
   * CRITICAL: Never upgrades version to prevent data loss
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

      request.onsuccess = async () => {
        this.db = request.result;
        this.initPromise = null;
        
        // CRITICAL: Verify database has data after opening
        const verifyTransaction = this.db.transaction(['users'], 'readonly');
        const verifyStore = verifyTransaction.objectStore('users');
        const countRequest = verifyStore.count();
        
        await new Promise<void>((countResolve) => {
          countRequest.onsuccess = async () => {
            const userCount = countRequest.result;
            console.log(`[AuthStore] Database opened. User count: ${userCount}`);
            
            // CRITICAL: If database is empty, immediately try to restore from localStorage backups
            if (userCount === 0) {
              console.warn('[AuthStore] WARNING: Database is empty - attempting recovery from localStorage backups...');
              try {
                const recoveredUsers: AuthUserData[] = [];
                
                // First, try to get the "latest user" marker (fastest path)
                try {
                  const latestUserBackup = localStorage.getItem('auth_latest_user');
                  if (latestUserBackup) {
                    const latestUser = JSON.parse(latestUserBackup) as AuthUserData;
                    recoveredUsers.push(latestUser);
                    console.log('[AuthStore] Found latest user backup:', { userId: latestUser.id, username: latestUser.username });
                  }
                } catch (latestError) {
                  console.warn('[AuthStore] Failed to parse latest user backup:', latestError);
                }
                
                // Also check all individual user backups
                for (let i = 0; i < localStorage.length; i++) {
                  const key = localStorage.key(i);
                  if (key && key.startsWith('auth_user_backup_')) {
                    try {
                      const backup = localStorage.getItem(key);
                      if (backup) {
                        const user = JSON.parse(backup) as AuthUserData;
                        // Avoid duplicates
                        if (!recoveredUsers.find(u => u.id === user.id)) {
                          recoveredUsers.push(user);
                          console.log('[AuthStore] Found user backup:', { userId: user.id, username: user.username });
                        }
                      }
                    } catch (parseError) {
                      console.warn('[AuthStore] Failed to parse backup:', key, parseError);
                    }
                  }
                }
                
                // Restore all found users to the database
                if (recoveredUsers.length > 0) {
                  console.log(`[AuthStore] Attempting to restore ${recoveredUsers.length} user(s) from backups...`);
                  const restoreTransaction = this.db!.transaction(['users'], 'readwrite');
                  const restoreStore = restoreTransaction.objectStore('users');
                  let restoredCount = 0;
                  let restoreErrors = 0;
                  
                  for (const user of recoveredUsers) {
                    try {
                      await new Promise<void>((restoreResolve, restoreReject) => {
                        const restoreRequest = restoreStore.add(user);
                        restoreRequest.onsuccess = () => {
                          restoredCount++;
                          restoreResolve();
                        };
                        restoreRequest.onerror = () => {
                          // If user already exists (e.g., ConstraintError), that's OK
                          if (restoreRequest.error?.name === 'ConstraintError') {
                            console.log('[AuthStore] User already exists in database:', user.username);
                            restoredCount++;
                          } else {
                            console.error('[AuthStore] Failed to restore user:', user.username, restoreRequest.error);
                            restoreErrors++;
                          }
                          restoreResolve(); // Continue even on error
                        };
                      });
                    } catch (restoreError) {
                      console.error('[AuthStore] Error restoring user:', user.username, restoreError);
                      restoreErrors++;
                    }
                  }
                  
                  // Wait for transaction to complete
                  await new Promise<void>((txResolve) => {
                    restoreTransaction.oncomplete = () => {
                      console.log(`[AuthStore] Recovery complete: ${restoredCount} user(s) restored, ${restoreErrors} error(s)`);
                      txResolve();
                    };
                    restoreTransaction.onerror = () => {
                      console.error('[AuthStore] Recovery transaction error:', restoreTransaction.error);
                      txResolve(); // Continue anyway
                    };
                    // Safety timeout
                    setTimeout(() => txResolve(), 1000);
                  });
                  
                  if (restoredCount > 0) {
                    console.log(`[AuthStore] ✅ Successfully restored ${restoredCount} user(s) from localStorage backups`);
                  } else {
                    console.warn('[AuthStore] ⚠️ No users could be restored from backups');
                  }
                } else {
                  console.warn('[AuthStore] No user backups found in localStorage');
                }
              } catch (recoveryError) {
                console.error('[AuthStore] Error during recovery from localStorage:', recoveryError);
                // Continue anyway - don't block initialization
              }
            }
            
            countResolve();
          };
          countRequest.onerror = () => {
            console.error('[AuthStore] Error counting users during init:', countRequest.error);
            countResolve(); // Continue anyway
          };
        });
        
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const oldVersion = event.oldVersion;
        
        console.log(`[AuthStore] Database upgrade needed: ${oldVersion} -> ${this.dbVersion}`);
        
        // CRITICAL: If upgrading from version 0, this is a new database (OK)
        // If upgrading from version > 0, preserve existing data
        if (oldVersion > 0 && oldVersion < this.dbVersion) {
          console.warn(`[AuthStore] WARNING: Upgrading from version ${oldVersion} - data should be preserved`);
          
          // CRITICAL: Check if we have existing users before upgrading
          if (db.objectStoreNames.contains('users')) {
            const checkTransaction = db.transaction(['users'], 'readonly');
            const checkStore = checkTransaction.objectStore('users');
            const countRequest = checkStore.count();
            countRequest.onsuccess = () => {
              const userCount = countRequest.result;
              if (userCount > 0) {
                console.warn(`[AuthStore] CRITICAL: Upgrading database with ${userCount} existing user(s) - data must be preserved!`);
              }
            };
          }
        }
        
        // Create users store
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'id' });
          userStore.createIndex('username', 'username', { unique: true });
          userStore.createIndex('email', 'email', { unique: false });
          console.log('[AuthStore] Created users object store');
        } else {
          console.log('[AuthStore] Users object store already exists - preserving data');
        }

        // Create reset tokens store
        if (!db.objectStoreNames.contains('reset_tokens')) {
          const tokenStore = db.createObjectStore('reset_tokens', { keyPath: 'token' });
          tokenStore.createIndex('userId', 'userId', { unique: false });
          tokenStore.createIndex('expires', 'expires', { unique: false });
          console.log('[AuthStore] Created reset_tokens object store');
        } else {
          console.log('[AuthStore] reset_tokens object store already exists - preserving data');
        }
      };
      
      request.onblocked = () => {
        console.warn('[AuthStore] Database open blocked - another tab may have it open');
        // Don't reject - wait for it to unblock
      };
    });

    return this.initPromise;
  }

  /**
   * Create a new user
   * CRITICAL: Includes verification to ensure user is actually saved
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
        // CRITICAL: Backup user to localStorage immediately as safety net
        try {
          const backupKey = `auth_user_backup_${id}`;
          localStorage.setItem(backupKey, JSON.stringify(user));
          // Also store as "latest user" for easy recovery
          localStorage.setItem('auth_latest_user', JSON.stringify(user));
          console.log('[AuthStore] User backed up to localStorage:', { userId: id, username: userData.username });
        } catch (backupError) {
          console.warn('[AuthStore] Failed to backup user to localStorage:', backupError);
        }
        
        // Wait for transaction to complete before resolving
        // This ensures the user is fully committed to IndexedDB
        await new Promise<void>((txResolve, txReject) => {
          transaction.oncomplete = async () => {
            console.log('[AuthStore] User transaction completed:', { userId: id, username: userData.username });
            
            // CRITICAL: Verify user was actually saved by reading it back
            try {
              // Small delay to ensure IndexedDB has flushed to disk
              await new Promise(resolve => setTimeout(resolve, 50));
              
              // Verify without closing connection (faster)
              const verifyTransaction = this.db!.transaction(['users'], 'readonly');
              const verifyStore = verifyTransaction.objectStore('users');
              const verifyRequest = verifyStore.get(id);
              
              verifyRequest.onsuccess = () => {
                const savedUser = verifyRequest.result;
                if (!savedUser) {
                  console.error('[AuthStore] CRITICAL: User was added but cannot be retrieved!', { userId: id, username: userData.username });
                  // Try to restore from localStorage backup
                  try {
                    const backupKey = `auth_user_backup_${id}`;
                    const backup = localStorage.getItem(backupKey);
                    if (backup) {
                      console.log('[AuthStore] Attempting to restore user from localStorage backup...');
                      const backupUser = JSON.parse(backup);
                      // Try to re-add the user
                      const restoreTransaction = this.db!.transaction(['users'], 'readwrite');
                      const restoreStore = restoreTransaction.objectStore('users');
                      restoreStore.add(backupUser);
                      restoreTransaction.oncomplete = () => {
                        console.log('[AuthStore] User restored from backup');
                        txResolve();
                      };
                      restoreTransaction.onerror = () => {
                        console.error('[AuthStore] Failed to restore user from backup');
                        txReject(new Error('User creation verification failed and restore failed'));
                      };
                      return;
                    }
                  } catch (restoreError) {
                    console.error('[AuthStore] Error restoring from backup:', restoreError);
                  }
                  txReject(new Error('User creation verification failed - user not found after save'));
                  return;
                }
                if (savedUser.username !== userData.username) {
                  console.error('[AuthStore] CRITICAL: Username mismatch after save!', {
                    expected: userData.username,
                    found: savedUser.username
                  });
                }
                console.log('[AuthStore] User verification successful:', { userId: id, username: savedUser.username });
                txResolve();
              };
              
              verifyRequest.onerror = () => {
                console.error('[AuthStore] Error verifying user:', verifyRequest.error);
                // Don't reject - user was added, verification might be a timing issue
                txResolve();
              };
            } catch (verifyError) {
              console.error('[AuthStore] Error during user verification:', verifyError);
              // Don't reject - user was added, verification might be a timing issue
              txResolve();
            }
          };
          transaction.onerror = () => {
            console.error('[AuthStore] User transaction error:', transaction.error);
            txReject(transaction.error);
          };
          // Safety timeout - if transaction doesn't complete in 2 seconds, something is wrong
          setTimeout(() => {
            console.warn('[AuthStore] Transaction completion timeout - user may not be saved');
            txReject(new Error('Transaction timeout - user may not be saved'));
          }, 2000);
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
   * CRITICAL: Includes recovery from localStorage backup if database is empty
   */
  async getAllUsers(): Promise<AuthUserData[]> {
    await this.init();
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return new Promise(async (resolve, reject) => {
      const transaction = this.db!.transaction(['users'], 'readonly');
      const store = transaction.objectStore('users');
      const request = store.getAll();

      request.onsuccess = async () => {
        const users = request.result || [];
        
        // CRITICAL: If database is empty, try to recover from localStorage backups
        if (users.length === 0) {
          console.warn('[AuthStore] Database is empty - attempting recovery from localStorage backups...');
          try {
            const recoveredUsers: AuthUserData[] = [];
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && key.startsWith('auth_user_backup_')) {
                try {
                  const backup = localStorage.getItem(key);
                  if (backup) {
                    const user = JSON.parse(backup) as AuthUserData;
                    recoveredUsers.push(user);
                    console.log('[AuthStore] Recovered user from backup:', { userId: user.id, username: user.username });
                    
                    // Re-add to database
                    try {
                      const restoreTransaction = this.db!.transaction(['users'], 'readwrite');
                      const restoreStore = restoreTransaction.objectStore('users');
                      restoreStore.add(user);
                      await new Promise<void>((restoreResolve, restoreReject) => {
                        restoreTransaction.oncomplete = () => restoreResolve();
                        restoreTransaction.onerror = () => restoreReject(restoreTransaction.error);
                        setTimeout(() => restoreResolve(), 100); // Safety timeout
                      });
                      console.log('[AuthStore] Restored user to database:', { userId: user.id });
                    } catch (restoreError) {
                      console.error('[AuthStore] Failed to restore user to database:', restoreError);
                    }
                  }
                } catch (parseError) {
                  console.warn('[AuthStore] Failed to parse backup:', key, parseError);
                }
              }
            }
            
            if (recoveredUsers.length > 0) {
              console.log(`[AuthStore] Recovered ${recoveredUsers.length} user(s) from localStorage backups`);
              // Return recovered users
              resolve(recoveredUsers);
              return;
            }
          } catch (recoveryError) {
            console.error('[AuthStore] Error during recovery:', recoveryError);
          }
        }
        
        resolve(users);
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

      request.onsuccess = () => {
        // CRITICAL: Update localStorage backup when user is updated
        try {
          const backupKey = `auth_user_backup_${userId}`;
          localStorage.setItem(backupKey, JSON.stringify(updated));
          // Update "latest user" marker if this is the latest user
          const latestUserBackup = localStorage.getItem('auth_latest_user');
          if (latestUserBackup) {
            try {
              const latestUser = JSON.parse(latestUserBackup) as AuthUserData;
              if (latestUser.id === userId) {
                localStorage.setItem('auth_latest_user', JSON.stringify(updated));
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        } catch (backupError) {
          console.warn('[AuthStore] Failed to update user backup in localStorage:', backupError);
        }
        resolve();
      };
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

