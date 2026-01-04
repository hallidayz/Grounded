import { useState, useEffect } from 'react';
import { getDatabaseAdapter } from '../services/databaseAdapter';
import { UserData as User } from '../services/database';

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const initializeUser = async () => {
    try {
      setIsLoading(true);
      
      const db = getDatabaseAdapter();
      await db.init();

      // 1. First, try to find any existing user in the database
      const existingUsers = await db.getAllUsers();
      
      if (existingUsers.length > 0) {
        // Use the most recent user (or the first one if timestamp isn't available)
        // Sort by createdAt to get the most recent user
        const latestUser = existingUsers.reduce((latest, user) => 
          new Date(user.createdAt).getTime() > new Date(latest.createdAt).getTime() ? user : latest, 
          existingUsers[0]
        );
        
        setUser(latestUser);
      } else {
        // 2. Only create new user if none exists
        const timestamp = Date.now();
        const newUser: Omit<User, 'id' | 'createdAt'> = {
          username: `User-${timestamp}`,
          email: `user-${timestamp}@grounded.app`,
          passwordHash: '', // Placeholder for anonymous/auto-created user
          termsAccepted: false,
        };

        const userId = await db.createUser(newUser);
        const userWithId = await db.getUserById(userId);
        if (userWithId) {
          setUser(userWithId);
        }
      }
    } catch (error) {
      console.error('Error initializing user:', error);
      
      // Fallback to creating a new user in memory if there's an error
      const timestamp = Date.now();
      const fallbackUser: User = {
        id: 'fallback-id',
        username: 'New User',
        email: `user-${timestamp}@grounded.app`,
        passwordHash: '',
        termsAccepted: false,
        createdAt: new Date().toISOString(),
      };
      
      setUser(fallbackUser);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeUser();
  }, []);

  return { user, isLoading, initializeUser };
};

