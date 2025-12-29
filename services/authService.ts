/**
 * Authentication Service
 * Handles user authentication, password hashing, and session management
 */

import { dbService } from './database';
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
    // Ensure database is available - use ensureDB which handles already-initialized case
    try {
      // Check if database is already initialized by trying to access it
      // ensureDB will initialize if needed, or use existing connection
      await dbService.getUserByUsername('__check__').catch(() => {
        // Expected to fail for non-existent user, but ensures DB is accessible
      });
    } catch (dbError) {
      // If database access fails, try to initialize
      const errorMessage = dbError instanceof Error ? dbError.message : String(dbError);
      console.error('Database access error during registration:', dbError);
      
      // Check for specific IndexedDB errors
      if (errorMessage.includes('IndexedDB is not available')) {
        return { success: false, error: 'Your browser does not support local storage. Please use a modern browser like Chrome, Firefox, or Safari.' };
      }
      
      if (errorMessage.includes('quota') || errorMessage.includes('QuotaExceeded')) {
        return { success: false, error: 'Storage quota exceeded. Please clear some browser data and try again.' };
      }
      
      // Try to initialize database
      try {
        await dbService.init();
      } catch (initError) {
        console.error('Database initialization failed:', initError);
        const initErrorMessage = initError instanceof Error ? initError.message : String(initError);
        
        if (initErrorMessage.includes('IndexedDB is not available')) {
          return { success: false, error: 'Your browser does not support local storage. Please use a modern browser.' };
        }
        
        if (initErrorMessage.includes('blocked') || initErrorMessage.includes('Blocked')) {
          return { success: false, error: 'Database access is blocked. Please check your browser settings and allow local storage for this site.' };
        }
        
        return { success: false, error: 'Unable to access local storage. Please refresh the page and try again.' };
      }
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

    // Check if username already exists
    let existingUser;
    try {
      existingUser = await dbService.getUserByUsername(data.username);
    } catch (error) {
      console.error('Error checking username:', error);
      return { success: false, error: 'Database error. Please try again.' };
    }
    if (existingUser) {
      return { success: false, error: 'Username already exists' };
    }

    // Check if email already exists
    let existingEmail;
    try {
      existingEmail = await dbService.getUserByEmail(data.email);
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

    // Create user
    let userId;
    try {
      userId = await dbService.createUser({
        username: data.username,
        passwordHash,
        email: data.email,
        termsAccepted: false,
      });
    } catch (error) {
      console.error('Error creating user:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('ConstraintError') || errorMessage.includes('already exists')) {
        return { success: false, error: 'Username or email already exists' };
      }
      return { success: false, error: 'Failed to create account. Please try again.' };
    }

    return { success: true, userId };
  } catch (error) {
    console.error('Registration error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: `Registration failed: ${errorMessage}. Please try again.` };
  }
}

// Login user
export async function loginUser(data: LoginData): Promise<AuthResult> {
  try {
    if (!data.username || !data.password) {
      return { success: false, error: 'Please enter username and password' };
    }

    // Ensure database is available before attempting login
    try {
      // Try to access database - this will initialize if needed
      await dbService.getUserByUsername('__check__').catch(() => {
        // Expected to fail for non-existent user, but ensures DB is accessible
      });
    } catch (dbError) {
      const errorMessage = dbError instanceof Error ? dbError.message : String(dbError);
      console.error('Database access error during login:', dbError);
      
      // Try to initialize database
      try {
        await dbService.init();
      } catch (initError) {
        console.error('Database initialization failed during login:', initError);
        const initErrorMessage = initError instanceof Error ? initError.message : String(initError);
        
        if (initErrorMessage.includes('IndexedDB is not available')) {
          return { success: false, error: 'Your browser does not support local storage. Please use a modern browser.' };
        }
        
        if (initErrorMessage.includes('blocked') || initErrorMessage.includes('Blocked')) {
          return { success: false, error: 'Database access is blocked. Please check your browser settings.' };
        }
        
        return { success: false, error: 'Unable to access local storage. Please refresh the page and try again.' };
      }
    }

    const user = await dbService.getUserByUsername(data.username);
    if (!user) {
      return { success: false, error: 'Invalid username or password' };
    }

    const isValid = await verifyPassword(data.password, user.passwordHash);
    if (!isValid) {
      return { success: false, error: 'Invalid username or password' };
    }

    // Update last login
    await dbService.updateUser(user.id, {
      lastLogin: new Date().toISOString(),
    });

    // Store session
    sessionStorage.setItem('userId', user.id);
    sessionStorage.setItem('username', user.username);

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
}

// Get current user
export async function getCurrentUser() {
  const userId = sessionStorage.getItem('userId');
  if (!userId) return null;
  return await dbService.getUserById(userId);
}

// Check if user is logged in
export function isLoggedIn(): boolean {
  return !!sessionStorage.getItem('userId');
}

// Request password reset
export async function requestPasswordReset(email: string): Promise<{ success: boolean; resetLink?: string; error?: string }> {
  try {
    // Ensure database is initialized and accessible
    try {
      // Test database access first
      await dbService.getUserByEmail('__test__').catch(() => {
        // Expected to fail for non-existent email, but ensures DB is accessible
      });
    } catch (dbError) {
      const errorMessage = dbError instanceof Error ? dbError.message : String(dbError);
      console.error('Database access error during password reset:', dbError);
      
      // Check for specific errors
      if (errorMessage.includes('backing store') || errorMessage.includes('Internal error')) {
        return { 
          success: false, 
          error: 'Database storage error. Please refresh the page and try again. If the problem persists, try clearing your browser data.' 
        };
      }
      
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
      
      // Try to initialize database
      try {
        await dbService.init();
      } catch (initError) {
        console.error('Database initialization failed during password reset:', initError);
        const initErrorMessage = initError instanceof Error ? initError.message : String(initError);
        
        if (initErrorMessage.includes('backing store') || initErrorMessage.includes('Internal error')) {
          return { 
            success: false, 
            error: 'Database storage error. Please refresh the page. If the problem persists, try clearing your browser data or using a different browser.' 
          };
        }
        
        if (initErrorMessage.includes('IndexedDB is not available')) {
          return { 
            success: false, 
            error: 'Your browser does not support local storage. Please use a modern browser.' 
          };
        }
        
        return { 
          success: false, 
          error: 'Unable to access local storage. Please refresh the page and try again.' 
        };
      }
    }

    const user = await dbService.getUserByEmail(email);
    if (!user) {
      // Don't reveal if email exists for security - return success but no link
      return { success: true };
    }

    if (!user.id) {
      throw new Error('User ID is missing');
    }

    const token = await dbService.createResetToken(user.id, email);
    
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
export async function resetPasswordWithToken(token: string, newPassword: string): Promise<AuthResult> {
  try {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    const tokenData = await dbService.getResetToken(token);
    if (!tokenData) {
      return { success: false, error: 'Invalid or expired reset token' };
    }

    const passwordHash = await hashPassword(newPassword);
    await dbService.updateUser(tokenData.userId, { passwordHash });
    await dbService.deleteResetToken(token);

    return { success: true, userId: tokenData.userId };
  } catch (error) {
    console.error('Password reset error:', error);
    return { success: false, error: 'Failed to reset password' };
  }
}

// Accept terms
export async function acceptTerms(userId: string): Promise<void> {
  await dbService.updateUser(userId, {
    termsAccepted: true,
    termsAcceptedDate: new Date().toISOString(),
  });
}

