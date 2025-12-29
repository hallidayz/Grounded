/**
 * Test Fixtures
 * Helper functions and test data for database operations
 */

import { dbService } from '../services/database';
import { openDB, IDBPDatabase } from 'idb';

export interface TestUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
}

export interface TestAppData {
  settings: Record<string, any>;
  logs: any[];
  goals: any[];
  values: any[];
}

/**
 * Initialize test database with sample data
 */
export async function initializeTestDatabase(): Promise<void> {
  try {
    await dbService.init();
  } catch (error) {
    console.warn('Database initialization failed:', error);
    // Continue anyway - some tests can work without full initialization
  }
}

/**
 * Create a test user in the database
 */
export async function createTestUser(
  username: string = 'testuser',
  email: string = 'test@example.com'
): Promise<TestUser | null> {
  try {
    const db = await openDB('groundedDB', 4);
    const tx = db.transaction('users', 'readwrite');
    const store = tx.objectStore('users');
    
    const user: TestUser = {
      id: `test-${Date.now()}`,
      username,
      email,
      passwordHash: 'test-hash'
    };
    
    await store.put(user);
    await tx.done;
    await db.close();
    
    return user;
  } catch (error) {
    console.warn('Could not create test user:', error);
    return null;
  }
}

/**
 * Create test app data
 */
export async function createTestAppData(userId: string): Promise<void> {
  try {
    const db = await openDB('groundedDB', 4);
    const tx = db.transaction('appData', 'readwrite');
    const store = tx.objectStore('appData');
    
    const appData: TestAppData = {
      settings: { reminders: { enabled: true } },
      logs: [],
      goals: [],
      values: []
    };
    
    await store.put({ userId, data: appData });
    await tx.done;
    await db.close();
  } catch (error) {
    console.warn('Could not create test app data:', error);
  }
}

/**
 * Create a test feeling log
 */
export async function createTestFeelingLog(userId?: string): Promise<void> {
  try {
    const db = await openDB('groundedDB', 4);
    const tx = db.transaction('feelingLogs', 'readwrite');
    const store = tx.objectStore('feelingLogs');
    
    const log = {
      id: `test-log-${Date.now()}`,
      userId: userId || 'test-user',
      timestamp: new Date().toISOString(),
      emotionalState: 'calm',
      selectedFeeling: 'peaceful',
      reflectionText: 'Test reflection',
      aiResponse: 'Test AI response',
      isAIResponse: true,
      lowStateCount: 0
    };
    
    await store.put(log);
    await tx.done;
    await db.close();
  } catch (error) {
    console.warn('Could not create test feeling log:', error);
  }
}

/**
 * Clean up test database
 */
export async function cleanupTestDatabase(): Promise<void> {
  try {
    // Clear all object stores
    const db = await openDB('groundedDB', 4);
    const tx = db.transaction(['users', 'appData', 'feelingLogs', 'goals', 'sessions', 'userInteractions'], 'readwrite');
    
    await Promise.all([
      tx.objectStore('users').clear(),
      tx.objectStore('appData').clear(),
      tx.objectStore('feelingLogs').clear(),
      tx.objectStore('goals').clear(),
      tx.objectStore('sessions').clear(),
      tx.objectStore('userInteractions').clear()
    ]);
    
    await tx.done;
    await db.close();
  } catch (error) {
    // Ignore cleanup errors
    console.warn('Cleanup warning:', error);
  }
}

/**
 * Wait for database to be ready
 */
export async function waitForDatabase(maxWait: number = 5000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < maxWait) {
    try {
      const db = await openDB('groundedDB', 4);
      await db.close();
      return true;
    } catch (error) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  return false;
}

