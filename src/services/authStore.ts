/**
 * Authentication Store
 * 
 * PRIVACY-FIRST: All user accounts stored locally in IndexedDB.
 * NO user data is ever sent to external servers.
 * 
 * Now uses groundedDB.users instead of separate groundedAuthDB
 * This consolidates all data into a single on-device database
 */

import { db } from './dexieDB';
import type { UserRecord } from './dexieDB';
import { migrateAuthToDexie } from './migrateAuthToDexie';

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
  private initPromise: Promise<void> | null = null;
  private migrationRun = false;

  /**
   * Initialize the authentication store
   * Runs migration from groundedAuthDB on first init
   */
  async init(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      // Ensure groundedDB is open
      await db.open();

      // Run migration once on first init
      if (!this.migrationRun) {
        this.migrationRun = true;
        try {
          const result = await migrateAuthToDexie();
          if (result.success && result.migrated > 0) {
            console.log(`[AuthStore] Migrated ${result.migrated} user(s) from groundedAuthDB`);
          }
        } catch (error) {
          console.error('[AuthStore] Migration error (non-fatal):', error);
          // Continue even if migration fails
        }
        }

      // Verify database has users
      try {
        const userCount = await db.users.count();
        console.log(`[AuthStore] Database initialized. User count: ${userCount}`);
        
        // If no users and localStorage has backups, try recovery
        if (userCount === 0 && typeof localStorage !== 'undefined') {
          await this.recoverFromLocalStorage();
        }
      } catch (error) {
        console.error('[AuthStore] Error during verification:', error);
        }
    })();

    return this.initPromise;
  }

  /**
   * Recover users from localStorage backups
   */
  private async recoverFromLocalStorage(): Promise<void> {
    try {
      const recoveredUsers: AuthUserData[] = [];
      
      // Get latest user marker
      const latestUserBackup = localStorage.getItem('auth_latest_user');
      if (latestUserBackup) {
        try {
          const latestUser = JSON.parse(latestUserBackup) as AuthUserData;
          if (latestUser?.id && latestUser?.username) {
            recoveredUsers.push(latestUser);
            console.log('[AuthStore] Found latest user backup:', { userId: latestUser.id, username: latestUser.username });
          }
        } catch (e) {
          console.warn('[AuthStore] Failed to parse latest user backup:', e);
        }
      }
      
      // Get all user backups
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('auth_user_backup_')) {
          keys.push(key);
        }
      }
      
      for (const key of keys) {
        try {
          const backup = localStorage.getItem(key);
          if (backup) {
            const user = JSON.parse(backup) as AuthUserData;
            if (user?.id && user?.username && !recoveredUsers.find(u => u.id === user.id)) {
              recoveredUsers.push(user);
            }
          }
        } catch (e) {
          console.warn('[AuthStore] Failed to parse backup:', key, e);
        }
      }
      
      // Restore to database
      if (recoveredUsers.length > 0) {
        console.log(`[AuthStore] Attempting to restore ${recoveredUsers.length} user(s) from backups...`);
        for (const user of recoveredUsers) {
          try {
            const existing = await db.users.get(user.id);
            if (!existing) {
              await db.users.add(user as UserRecord);
              console.log('[AuthStore] Restored user:', user.username);
            }
          } catch (error: any) {
            if (error?.name !== 'ConstraintError') {
              console.error('[AuthStore] Failed to restore user:', user.username, error);
            }
          }
        }
      }
    } catch (error) {
      console.error('[AuthStore] Error during localStorage recovery:', error);
    }
  }

  /**
   * Create a new user
   */
  async createUser(userData: Omit<AuthUserData, 'id' | 'createdAt'>): Promise<string> {
    await this.init();

    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const user: UserRecord = {
      ...userData,
      id,
      createdAt: new Date().toISOString()
    };

    try {
      await db.users.add(user);
      
      // Backup to localStorage
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem(`auth_user_backup_${id}`, JSON.stringify(user));
          localStorage.setItem('auth_latest_user', JSON.stringify(user));
        } catch (e) {
          console.warn('[AuthStore] Failed to backup user:', e);
        }
      }
      
      // Verify user was saved
      const saved = await db.users.get(id);
      if (!saved) {
        throw new Error('User was not saved correctly');
      }
      
      console.log('[AuthStore] User created:', { userId: id, username: userData.username });
      return id;
    } catch (error: any) {
      if (error?.name === 'ConstraintError') {
        throw new Error('Username or email already exists');
      }
      throw error;
    }
  }

  /**
   * Get user by username
   */
  async getUserByUsername(username: string): Promise<AuthUserData | null> {
    await this.init();
    return await db.users.where('username').equals(username).first() || null;
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<AuthUserData | null> {
    await this.init();
    return await db.users.where('email').equals(email).first() || null;
  }

  /**
   * Get all users
   */
  async getAllUsers(): Promise<AuthUserData[]> {
    await this.init();
    const users = await db.users.toArray();
    
    // If empty, try recovery
    if (users.length === 0) {
      await this.recoverFromLocalStorage();
      return await db.users.toArray();
    }
    
    return users;
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<AuthUserData | null> {
    await this.init();
    return await db.users.get(userId) || null;
  }

  /**
   * Update user
   */
  async updateUser(userId: string, updates: Partial<AuthUserData>): Promise<void> {
    await this.init();

    const user = await db.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const updated = { ...user, ...updates };
    await db.users.put(updated);
    
    // Update localStorage backup
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(`auth_user_backup_${userId}`, JSON.stringify(updated));
        const latest = localStorage.getItem('auth_latest_user');
        if (latest) {
          const latestUser = JSON.parse(latest) as AuthUserData;
          if (latestUser.id === userId) {
            localStorage.setItem('auth_latest_user', JSON.stringify(updated));
          }
        }
      } catch (e) {
        console.warn('[AuthStore] Failed to update backup:', e);
      }
    }
  }

  /**
   * Create reset token (uses groundedDB.resetTokens)
   */
  async createResetToken(userId: string, email: string): Promise<string> {
    await this.init();

    const token = `reset_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
    const expires = Date.now() + (24 * 60 * 60 * 1000); // 24 hours

    const tokenData = {
      token,
      userId,
      email,
      expires: new Date(expires).toISOString(),
      createdAt: new Date().toISOString()
    };

    await db.resetTokens.add(tokenData);
    return token;
  }

  /**
   * Get reset token
   */
  async getResetToken(token: string): Promise<{ userId: string; email: string } | null> {
    await this.init();
    
    const result = await db.resetTokens.get(token);
        if (!result) {
      return null;
        }

        // Check if token is expired
    const expires = new Date(result.expires).getTime();
    if (expires < Date.now()) {
      return null;
        }

    return {
          userId: result.userId,
          email: result.email
      };
  }

  /**
   * Delete reset token
   */
  async deleteResetToken(token: string): Promise<void> {
    await this.init();
    await db.resetTokens.delete(token);
  }

  /**
   * Cleanup expired tokens
   */
  async cleanupExpiredTokens(): Promise<void> {
    await this.init();
      const now = Date.now();
    const expired = await db.resetTokens
      .where('expires')
      .below(new Date(now).toISOString())
      .toArray();
    
    for (const token of expired) {
      await db.resetTokens.delete(token.token);
        }
  }
}

export const authStore = new AuthStore();

