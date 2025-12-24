/**
 * Authentication Service
 * Handles user authentication, password hashing, and session management
 */

import { dbService } from './database';

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
    const existingUser = await dbService.getUserByUsername(data.username);
    if (existingUser) {
      return { success: false, error: 'Username already exists' };
    }

    // Check if email already exists
    const existingEmail = await dbService.getUserByEmail(data.email);
    if (existingEmail) {
      return { success: false, error: 'Email already registered' };
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const userId = await dbService.createUser({
      username: data.username,
      passwordHash,
      email: data.email,
      termsAccepted: false,
    });

    return { success: true, userId };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: 'Registration failed. Please try again.' };
  }
}

// Login user
export async function loginUser(data: LoginData): Promise<AuthResult> {
  try {
    if (!data.username || !data.password) {
      return { success: false, error: 'Please enter username and password' };
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
    const user = await dbService.getUserByEmail(email);
    if (!user) {
      // Don't reveal if email exists for security
      return { success: true, resetLink: 'reset-link-placeholder' };
    }

    const token = await dbService.createResetToken(user.id, email);
    
    // Generate reset link (in a real app, this would be sent via email)
    // For local-only app, we'll generate a data URL that can be copied
    const resetLink = `${window.location.origin}${window.location.pathname}#reset/${token}`;
    
    return { success: true, resetLink };
  } catch (error) {
    console.error('Password reset error:', error);
    return { success: false, error: 'Failed to generate reset link' };
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

