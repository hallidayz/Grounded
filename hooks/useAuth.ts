/**
 * useAuth Hook
 * Handles authentication and session management for encrypted mode
 * Auto-logoff after 15 minutes of inactivity
 */

import { useState, useEffect, useCallback } from 'react';
import { EncryptedPWA } from '../services/encryptedPWA';

const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds
const LAST_ACTIVITY_KEY = 'encrypted_session_last_activity';
const SESSION_USER_ID_KEY = 'encrypted_session_user_id';

export interface AuthState {
  isAuthenticated: boolean;
  isUnlocking: boolean;
  error: string | null;
  userId: number | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isUnlocking: false,
    error: null,
    userId: null
  });

  // Check if encryption is enabled
  const isEncryptionEnabled = () => {
    return localStorage.getItem('encryption_enabled') === 'true';
  };

  // Check if session is still valid
  const isSessionValid = useCallback(() => {
    if (!isEncryptionEnabled()) {
      return true; // Legacy mode doesn't need authentication
    }

    const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
    if (!lastActivity) {
      return false;
    }

    const lastActivityTime = parseInt(lastActivity, 10);
    const now = Date.now();
    const timeSinceActivity = now - lastActivityTime;

    return timeSinceActivity < SESSION_TIMEOUT;
  }, []);

  // Update last activity timestamp
  const updateLastActivity = useCallback(() => {
    if (isEncryptionEnabled()) {
      localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
    }
  }, []);

  // Initialize auth state on mount
  useEffect(() => {
    if (!isEncryptionEnabled()) {
      // Legacy mode - no authentication needed
      setAuthState({
        isAuthenticated: true,
        isUnlocking: false,
        error: null,
        userId: null
      });
      return;
    }

    // Check if we have an active session
    const encryptedDb = EncryptedPWA.getInstance();
    if (encryptedDb && isSessionValid()) {
      const userId = parseInt(localStorage.getItem(SESSION_USER_ID_KEY) || '0', 10);
      setAuthState({
        isAuthenticated: true,
        isUnlocking: false,
        error: null,
        userId
      });
      updateLastActivity();
    } else {
      setAuthState({
        isAuthenticated: false,
        isUnlocking: false,
        error: null,
        userId: null
      });
    }
  }, [isSessionValid, updateLastActivity]);

  // Logout/lock - MUST be defined before useEffect that uses it
  const handleLogout = useCallback(() => {
    if (!isEncryptionEnabled()) {
      return; // Legacy mode doesn't need logout
    }

    // Clear session
    localStorage.removeItem(LAST_ACTIVITY_KEY);
    localStorage.removeItem(SESSION_USER_ID_KEY);

    // Clear encrypted database instance
    // Note: EncryptedPWA.getInstance() returns the instance, but we can't clear it directly
    // The instance will be cleared when the component unmounts or when a new one is created

    setAuthState({
      isAuthenticated: false,
      isUnlocking: false,
      error: null,
      userId: null
    });
  }, []);

  // Set up activity tracking
  useEffect(() => {
    if (!isEncryptionEnabled() || !authState.isAuthenticated) {
      return;
    }

    // Update activity on user interaction
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    const handleActivity = () => {
      updateLastActivity();
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Check session timeout periodically
    const checkInterval = setInterval(() => {
      if (!isSessionValid()) {
        // Session expired - lock the app
        handleLogout();
      }
    }, 60000); // Check every minute

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      clearInterval(checkInterval);
    };
  }, [authState.isAuthenticated, isSessionValid, updateLastActivity, handleLogout]);

  // Login/unlock with password
  const login = useCallback(async (password: string, userId: number): Promise<boolean> => {
    if (!isEncryptionEnabled()) {
      return true; // Legacy mode doesn't need password
    }

    setAuthState(prev => ({ ...prev, isUnlocking: true, error: null }));

    try {
      // Initialize encrypted database with password
      const encryptedDb = await EncryptedPWA.init(password, userId);
      
      if (encryptedDb) {
        // Store session info
        localStorage.setItem(SESSION_USER_ID_KEY, userId.toString());
        updateLastActivity();

        setAuthState({
          isAuthenticated: true,
          isUnlocking: false,
          error: null,
          userId
        });

        return true;
      }

      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to unlock database';
      setAuthState(prev => ({
        ...prev,
        isUnlocking: false,
        error: errorMessage
      }));
      return false;
    }
  }, [updateLastActivity]);

  return {
    ...authState,
    login,
    logout: handleLogout,
    updateActivity: updateLastActivity,
    isEncryptionEnabled: isEncryptionEnabled()
  };
}

