/**
 * Authentication Service
 * Handles user authentication, password hashing, and session management
 * Uses separate authStore for credentials (always unencrypted, accessible before database unlock)
 */

import { authStore } from './authStore';
import { dbService } from './database';
import { getDatabaseAdapter } from './databaseAdapter';
import { EncryptedPWA } from './encryptedPWA';
import { isTauri } from './platform';

// Hash password using Web Crypto API
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Verify password
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

export interface RegisterData {
  username: string;
  password: string;
  email: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  userId?: string;
  error?: string;
}

// Register new user
export async function registerUser(data: RegisterData): Promise<AuthResult> {
  try {
    // Initialize auth store (separate, always unencrypted)
    try {
      await authStore.init();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Auth store initialization error:', error);
      
      if (errorMessage.includes('IndexedDB is not available')) {
        return { success: false, error: 'Your browser does not support local storage. Please use a modern browser like Chrome, Firefox, or Safari.' };
      }
      
      if (errorMessage.includes('quota') || errorMessage.includes('QuotaExceeded')) {
        return { success: false, error: 'Storage quota exceeded. Please clear some browser data and try again.' };
      }
      
      if (errorMessage.includes('blocked') || errorMessage.includes('Blocked')) {
        return { success: false, error: 'Database access is blocked. Please check your browser settings and allow local storage for this site.' };
      }
      
      return { success: false, error: 'Unable to access local storage. Please refresh the page and try again.' };
    }

    // Validate inputs
    if (!data.username || data.username.length < 3) {
      return { success: false, error: 'Username must be at least 3 characters' };
    }
    if (!data.password || data.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return { success: false, error: 'Please enter a valid email address' };
    }

    // Check if username already exists (in auth store)
    let existingUser;
    try {
      existingUser = await authStore.getUserByUsername(data.username);
    } catch (error) {
      console.error('Error checking username:', error);
      return { success: false, error: 'Database error. Please try again.' };
    }
    if (existingUser) {
      return { success: false, error: 'Username already exists' };
    }

    // Check if email already exists (in auth store)
    let existingEmail;
    try {
      existingEmail = await authStore.getUserByEmail(data.email);
    } catch (error) {
      console.error('Error checking email:', error);
      return { success: false, error: 'Database error. Please try again.' };
    }
    if (existingEmail) {
      return { success: false, error: 'Email already registered' };
    }

    // Hash password
    let passwordHash;
    try {
      passwordHash = await hashPassword(data.password);
    } catch (error) {
      console.error('Error hashing password:', error);
      return { success: false, error: 'Password encryption failed. Please try again.' };
    }

    // Create user in auth store (separate, unencrypted)
    let userId;
    try {
      userId = await authStore.createUser({
        username: data.username,
        passwordHash,
        email: data.email,
        termsAccepted: false,
      });
      
      // Auto-login: Store session immediately after creation
      sessionStorage.setItem('userId', userId);
      sessionStorage.setItem('username', data.username);
      try {
        localStorage.setItem('userId', userId);
        localStorage.setItem('username', data.username);
      } catch (error) {
        console.warn('Could not store userId in localStorage:', error);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('ConstraintError') || errorMessage.includes('already exists')) {
        return { success: false, error: 'Username or email already exists' };
      }
      return { success: false, error: 'Failed to create account. Please try again.' };
    }

    // If encryption is enabled, also create user in encrypted database
    // This will happen after first login when database is unlocked
    // For now, just store in auth store

    return { success: true, userId };
  } catch (error) {
    console.error('Registration error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Registration failed: ${errorMessage}. Please try again.` };
  }
}

// Login user
// This authenticates against the separate auth store (always accessible)
// After successful authentication, the same password is used to unlock the encrypted database
export async function loginUser(data: LoginData): Promise<AuthResult> {
  try {
    if (!data.username || !data.password) {
      return { success: false, error: 'Please enter username and password' };
    }

    // Initialize auth store (separate, always unencrypted)
    try {
      await authStore.init();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Auth store initialization error during login:', error);
      
      if (errorMessage.includes('IndexedDB is not available')) {
        return { success: false, error: 'Your browser does not support local storage. Please use a modern browser.' };
      }
      
      if (errorMessage.includes('blocked') || errorMessage.includes('Blocked')) {
        return { success: false, error: 'Database access is blocked. Please check your browser settings.' };
      }
      
      return { success: false, error: 'Unable to access local storage. Please refresh the page and try again.' };
    }

    // Authenticate against auth store (separate, unencrypted)
    const user = await authStore.getUserByUsername(data.username);
    if (!user) {
      return { success: false, error: 'Invalid username or password' };
    }

    const isValid = await verifyPassword(data.password, user.passwordHash);
    if (!isValid) {
      return { success: false, error: 'Invalid username or password' };
    }

    // Update last login in auth store
    await authStore.updateUser(user.id, {
      lastLogin: new Date().toISOString(),
    });

    // Store session in both sessionStorage (for current session) and localStorage (for persistence)
    sessionStorage.setItem('userId', user.id);
    sessionStorage.setItem('username', user.username);
    // Also store in localStorage so it persists across cache/history clears
    try {
      localStorage.setItem('userId', user.id);
      localStorage.setItem('username', user.username);
    } catch (error) {
      console.warn('Could not store userId in localStorage:', error);
      // Continue anyway - sessionStorage will work for current session
    }

    // Note: Database unlock happens separately in useAuth.login() using the same password
    // This ensures authentication happens first, then database unlock

    return { success: true, userId: user.id };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Login failed. Please try again.' };
  }
}

// Logout user
export function logoutUser(): void {
  sessionStorage.removeItem('userId');
  sessionStorage.removeItem('username');
  // Also clear from localStorage on explicit logout
  localStorage.removeItem('userId');
  localStorage.removeItem('username');
}

// Get current user
// Always uses auth store (separate, unencrypted) for user data
// Falls back to localStorage if sessionStorage is empty (e.g., after cache clear)
export async function getCurrentUser() {
  // Try sessionStorage first (current session)
  let userId = sessionStorage.getItem('userId');
  
  // If sessionStorage is empty, try localStorage (persisted across cache clears)
  if (!userId) {
    userId = localStorage.getItem('userId');
    // If found in localStorage, restore to sessionStorage for current session
    if (userId) {
      const username = localStorage.getItem('username');
      sessionStorage.setItem('userId', userId);
      if (username) {
        sessionStorage.setItem('username', username);
      }
    }
  }
  
  // If still no userId, try to find any existing user in the database (fallback)
  if (!userId) {
    try {
      // Get all users from auth store and use the most recent one
      const allUsers = await authStore.getAllUsers();
      if (allUsers && allUsers.length > 0) {
        // Sort by lastLogin or createdAt to get most recent
        const sortedUsers = allUsers.sort((a, b) => {
          const aTime = a.lastLogin ? new Date(a.lastLogin).getTime() : new Date(a.createdAt).getTime();
          const bTime = b.lastLogin ? new Date(b.lastLogin).getTime() : new Date(b.createdAt).getTime();
          return bTime - aTime;
        });
        userId = sortedUsers[0].id;
        // Restore to both storages
        sessionStorage.setItem('userId', userId);
        sessionStorage.setItem('username', sortedUsers[0].username);
        try {
          localStorage.setItem('userId', userId);
          localStorage.setItem('username', sortedUsers[0].username);
        } catch (error) {
          console.warn('Could not store userId in localStorage:', error);
        }
      }
    } catch (error) {
      console.error('Error finding existing user:', error);
    }
  }
  
  if (!userId) return null;
  return await authStore.getUserById(userId);
}

// Check if user is logged in
// Checks both sessionStorage and localStorage (for persistence across cache clears)
export function isLoggedIn(): boolean {
  // Check sessionStorage first (current session)
  if (sessionStorage.getItem('userId')) {
    return true;
  }
  // Fall back to localStorage (persisted across cache clears)
  try {
    return !!localStorage.getItem('userId');
  } catch (error) {
    // localStorage might be disabled or full
    return false;
  }
}

// Request password reset
// Uses auth store (separate, unencrypted) for password reset
export async function requestPasswordReset(email: string): Promise<{ success: boolean; resetLink?: string; error?: string }> {
  try {
    // Initialize auth store
    try {
      await authStore.init();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Auth store initialization error during password reset:', error);
      
      if (errorMessage.includes('IndexedDB is not available')) {
        return { 
          success: false, 
          error: 'Your browser does not support local storage. Please use a modern browser.' 
        };
      }
      
      if (errorMessage.includes('quota') || errorMessage.includes('QuotaExceeded')) {
        return { 
          success: false, 
          error: 'Storage quota exceeded. Please clear some browser data and try again.' 
        };
      }
      
      return { 
        success: false, 
        error: 'Unable to access local storage. Please refresh the page and try again.' 
      };
    }

    const user = await authStore.getUserByEmail(email);
    if (!user) {
      // Don't reveal if email exists for security - return success but no link
      return { success: true };
    }

    if (!user.id) {
      throw new Error('User ID is missing');
    }

    const token = await authStore.createResetToken(user.id, email);
    
    if (!token) {
      throw new Error('Failed to create reset token');
    }
    
    // Generate reset link (in a real app, this would be sent via email)
    // For local-only app, we'll generate a data URL that can be copied
    // Use tauri://localhost for Tauri apps, regular origin for web
    // Use proper Tauri detection method consistent with rest of codebase
    const isTauriEnv = isTauri();
    const origin = isTauriEnv ? 'tauri://localhost' : (typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
    const pathname = typeof window !== 'undefined' && window.location.pathname ? window.location.pathname : '/';
    const resetLink = `${origin}${pathname}#reset/${token}`;
    
    if (!resetLink || !resetLink.includes('#reset/')) {
      throw new Error(`Invalid reset link generated: ${resetLink}`);
    }
    
    return { success: true, resetLink };
  } catch (error) {
    console.error('Password reset error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: `Failed to generate reset link: ${errorMessage}` };
  }
}

// Reset password with token
// Updates password in auth store, and if encryption is enabled, re-encrypts database with new password
export async function resetPasswordWithToken(token: string, newPassword: string): Promise<AuthResult> {
  try {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    // Initialize auth store
    await authStore.init();

    const tokenData = await authStore.getResetToken(token);
    if (!tokenData) {
      return { success: false, error: 'Invalid or expired reset token' };
    }

    const passwordHash = await hashPassword(newPassword);
    
    // Update password in auth store
    await authStore.updateUser(tokenData.userId, { passwordHash });
    await authStore.deleteResetToken(token);

    // If encryption is enabled, we need to re-encrypt the database with the new password
    // This requires the old password, which we don't have in a reset flow
    // So we'll need to handle this differently - for now, just update auth store
    // The user will need to unlock the database with the new password on next login
    const encryptionEnabled = localStorage.getItem('encryption_enabled') === 'true';
    if (encryptionEnabled) {
      // Note: Database re-encryption with new password requires the old password
      // In a password reset scenario, we can't re-encrypt automatically
      // The database will need to be unlocked with the new password on next login
      // If the old password is lost, the encrypted data cannot be recovered
      console.warn('Password reset with encryption enabled - database will need to be unlocked with new password');
    }

    return { success: true, userId: tokenData.userId };
  } catch (error) {
    console.error('Password reset error:', error);
    return { success: false, error: 'Failed to reset password' };
  }
}

// Change password (when user is logged in and knows current password)
// Updates both auth store and re-encrypts database with new password
export async function changePassword(userId: string, currentPassword: string, newPassword: string): Promise<AuthResult> {
  try {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    // Initialize auth store
    await authStore.init();

    // Verify current password
    const user = await authStore.getUserById(userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const isValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isValid) {
      return { success: false, error: 'Current password is incorrect' };
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password in auth store
    await authStore.updateUser(userId, { passwordHash: newPasswordHash });

    // If encryption is enabled, re-encrypt database with new password
    const encryptionEnabled = localStorage.getItem('encryption_enabled') === 'true';
    if (encryptionEnabled) {
      try {
        // Get encrypted database instance
        const encryptedDb = EncryptedPWA.getInstance();
        if (encryptedDb) {
          // Re-encrypt database with new password
          // This requires the current password to decrypt, then new password to encrypt
          await encryptedDb.changePassword(currentPassword, newPassword);
        }
      } catch (error) {
        console.error('Error re-encrypting database with new password:', error);
        // Password is updated in auth store, but database re-encryption failed
        // User will need to unlock with new password on next login
        return { success: false, error: 'Password updated, but failed to update database encryption. Please unlock with new password on next login.' };
      }
    }

    return { success: true, userId };
  } catch (error) {
    console.error('Password change error:', error);
    return { success: false, error: 'Failed to change password' };
  }
}

// Accept terms
// Updates auth store (separate, unencrypted)
export async function acceptTerms(userId: string): Promise<void> {
  await authStore.init();
  await authStore.updateUser(userId, {
    termsAccepted: true,
    termsAcceptedDate: new Date().toISOString(),
  });
}

