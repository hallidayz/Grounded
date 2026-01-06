import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { acceptTerms, logoutUser, getCurrentUser } from '../services/authService';
import { getDatabaseAdapter } from '../services/databaseAdapter';
import { AppSettings } from '../types';

export type AuthState = 'checking' | 'login' | 'terms' | 'app';

interface AuthContextType {
  authState: AuthState;
  userId: string | null;
  setAuthState: (state: AuthState) => void;
  setUserId: (id: string | null) => void;
  handleLogin: (loggedInUserId: string) => Promise<void>;
  handleAcceptTerms: () => Promise<void>;
  handleDeclineTerms: () => void;
  handleLogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  onLoginComplete?: (userId: string, appData: {
    values: string[];
    logs: any[];
    goals: any[];
    settings: AppSettings;
  }) => void;
  onLogoutComplete?: () => void;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ 
  children, 
  onLoginComplete,
  onLogoutComplete 
}) => {
  const [authState, setAuthState] = useState<AuthState>('checking');
  const [userId, setUserId] = useState<string | null>(null);

  // Initialize: Check if user is already logged in (only once on mount)
  const hasInitializedRef = React.useRef(false);
  const initializationPromiseRef = React.useRef<Promise<void> | null>(null);
  
  useEffect(() => {
    // Prevent multiple initializations
    if (hasInitializedRef.current || initializationPromiseRef.current) {
      return;
    }
    
    // Store the promise to prevent concurrent initializations
    const initPromise = (async () => {
      if (hasInitializedRef.current) return;
      hasInitializedRef.current = true;
      
      try {
        console.log('[AuthContext] Initializing auth state...');
        const user = await getCurrentUser();
        
        if (user) {
          console.log('[AuthContext] User found, checking terms...', { userId: user.id, termsAccepted: user.termsAccepted });
          setUserId(user.id);
          
          if (user.termsAccepted) {
            // User is logged in and has accepted terms - load app data
            try {
              const adapter = getDatabaseAdapter();
              await adapter.init();
              const appData = await adapter.getAppData(user.id);
              
              // Also try to load values from the values table (new structure)
              let activeValues: string[] = [];
              try {
                activeValues = await Promise.race([
                  adapter.getActiveValues(user.id),
                  new Promise<string[]>((_, reject) => setTimeout(() => reject(new Error('getActiveValues timeout')), 2000))
                ]).catch(() => []);
                console.log('[AuthContext] Active values from table:', activeValues.length);
              } catch (error) {
                console.warn('[AuthContext] Could not load values from table:', error);
              }
              
              if (appData) {
                const loadedSettings = appData.settings || { reminders: { enabled: false, frequency: 'daily', time: '09:00' } };
                if (loadedSettings.reminders && !loadedSettings.reminders.frequency) {
                  loadedSettings.reminders.frequency = 'daily';
                }
                
                // Use values from table if available, otherwise fall back to appData
                const values = activeValues.length > 0 ? activeValues : (appData.values || []);
                
                onLoginComplete?.(user.id, {
                  values: values,
                  logs: appData.logs || [],
                  goals: appData.goals || [],
                  settings: loadedSettings,
                });
              } else {
                // Even if no appData, use values from table if available
                const values = activeValues.length > 0 ? activeValues : [];
                onLoginComplete?.(user.id, {
                  values: values,
                  logs: [],
                  goals: [],
                  settings: { reminders: { enabled: false, frequency: 'daily', time: '09:00' } },
                });
              }
            } catch (error) {
              console.error('[AuthContext] Error loading app data on init:', error);
              onLoginComplete?.(user.id, {
                values: [],
                logs: [],
                goals: [],
                settings: { reminders: { enabled: false, frequency: 'daily', time: '09:00' } },
              });
            }
            
            setAuthState('app');
          } else {
            // User is logged in but hasn't accepted terms
            setAuthState('terms');
          }
        } else {
          // No user found - show login
          console.log('[AuthContext] No user found - showing login');
          setAuthState('login');
        }
      } catch (error) {
        console.error('[AuthContext] Error initializing auth:', error);
        setAuthState('login');
        hasInitializedRef.current = false; // Allow retry on error
      }
    })();
    
    initializationPromiseRef.current = initPromise;
    initPromise.finally(() => {
      initializationPromiseRef.current = null;
    });
  }, []); // Empty dependency array - only run once on mount

  const handleLogin = useCallback(async (loggedInUserId: string) => {
    try {
      console.log('[LOGIN] handleLogin called with userId:', loggedInUserId);
      setUserId(loggedInUserId);
      
      // Reset initialization flags to allow app to continue after login
      const { resetInitialization } = await import('../hooks/useAppInitialization');
      resetInitialization();
      
      const userDataPromise = getCurrentUser();
      const userDataTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('getCurrentUser timeout')), 5000);
      });
      
      const user = await Promise.race([userDataPromise, userDataTimeout]) as any;
      console.log('[LOGIN] User data loaded:', user ? 'found' : 'not found');
      
      if (user) {
        if (user.termsAccepted) {
          try {
            console.log('[LOGIN] Loading app data...');
            const adapter = getDatabaseAdapter();
            console.log('[LOGIN] Database adapter:', adapter.constructor.name);
            
            await adapter.init();
            
            const appDataPromise = adapter.getAppData(loggedInUserId);
            const appDataTimeout = new Promise((_, reject) => {
              setTimeout(() => reject(new Error('getAppData timeout')), 5000);
            });
            
            const appData = await Promise.race([appDataPromise, appDataTimeout]) as any;
            console.log('[LOGIN] App data loaded:', appData ? 'found' : 'not found');
            
            // Also try to load values from the values table (new structure)
            let activeValues: string[] = [];
            try {
              activeValues = await Promise.race([
                adapter.getActiveValues(loggedInUserId),
                new Promise<string[]>((_, reject) => setTimeout(() => reject(new Error('getActiveValues timeout')), 2000))
              ]).catch(() => []);
              console.log('[LOGIN] Active values from table:', activeValues.length);
            } catch (error) {
              console.warn('[LOGIN] Could not load values from table:', error);
            }
            
            if (appData) {
              const loadedSettings = appData.settings || { reminders: { enabled: false, frequency: 'daily', time: '09:00' } };
              if (loadedSettings.reminders && !loadedSettings.reminders.frequency) {
                loadedSettings.reminders.frequency = 'daily';
              }
              
              // Use values from table if available, otherwise fall back to appData
              const values = activeValues.length > 0 ? activeValues : (appData.values || []);
              
              onLoginComplete?.(loggedInUserId, {
                values: values,
                logs: appData.logs || [],
                goals: appData.goals || [],
                settings: loadedSettings,
              });
            } else {
              // Even if no appData, use values from table if available
              const values = activeValues.length > 0 ? activeValues : [];
              console.log('[LOGIN] No app data found - using defaults with values from table:', values.length);
              onLoginComplete?.(loggedInUserId, {
                values: values,
                logs: [],
                goals: [],
                settings: { reminders: { enabled: false, frequency: 'daily', time: '09:00' } },
              });
            }
          } catch (appDataError) {
            console.error('[LOGIN] Failed to load app data after login:', appDataError);
            onLoginComplete?.(loggedInUserId, {
              values: [],
              logs: [],
              goals: [],
              settings: { reminders: { enabled: false, frequency: 'daily', time: '09:00' } },
            });
          }
          console.log('[LOGIN] Setting authState to app');
          setAuthState('app');
        } else {
          console.log('[LOGIN] User has not accepted terms - showing terms screen');
          setAuthState('terms');
        }
      } else {
        console.error('[LOGIN] No user found after login');
        setAuthState('login');
      }
    } catch (error) {
      console.error('[LOGIN] Error in handleLogin:', error);
      setAuthState('login');
    }
  }, [onLoginComplete]);

  const handleAcceptTerms = useCallback(async () => {
    if (userId) {
      await acceptTerms(userId);
      setAuthState('app');
      
      // User has committed to using the app - ensure models are loading
      const { preloadModels } = await import('../services/aiService');
      preloadModels().catch((error) => {
        console.warn('AI model preload retry failed:', error);
      });
    }
  }, [userId]);

  const handleDeclineTerms = useCallback(() => {
    logoutUser();
    setAuthState('login');
    setUserId(null);
  }, []);

  const handleLogout = useCallback(() => {
    logoutUser();
    setAuthState('login');
    setUserId(null);
    onLogoutComplete?.();
  }, [onLogoutComplete]);

  return (
    <AuthContext.Provider
      value={{
        authState,
        userId,
        setAuthState,
        setUserId,
        handleLogin,
        handleAcceptTerms,
        handleDeclineTerms,
        handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

