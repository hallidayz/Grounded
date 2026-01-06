/**
 * Playwright E2E Test Suite for Encryption Integration
 * Tests encryption, integrity, and uninstall functionality in a real browser environment
 */

import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';
const TEST_PASSWORD = 'test-password-e2e-123';
const TEST_USER_ID = 888;

/**
 * Helper: Wait for app to be ready
 */
async function waitForAppReady(page: Page): Promise<void> {
  // Wait for main app content to load
  await page.waitForSelector('body', { state: 'visible' });
  // Wait a bit for React to hydrate
  await page.waitForTimeout(1000);
}

/**
 * Helper: Enable encryption mode
 */
async function enableEncryption(page: Page): Promise<void> {
  // Set encryption flag in localStorage
  await page.evaluate(() => {
    localStorage.setItem('encryption_enabled', 'true');
  });
}

/**
 * Helper: Initialize encrypted database
 */
async function initializeEncryptedDB(page: Page): Promise<void> {
  await page.evaluate(
    async ({ password, userId }) => {
      const { EncryptedPWA } = await import('/src/services/encryptedPWA.ts');
      await EncryptedPWA.init(password, userId);
    },
    { password: TEST_PASSWORD, userId: TEST_USER_ID }
  );
}

test.describe('Encryption Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForAppReady(page);
  });

  test('should initialize encrypted database', async ({ page }) => {
    enableEncryption(page);
    
    const isInitialized = await page.evaluate(
      async ({ password, userId }) => {
        try {
          const module = await import('/src/services/encryptedPWA.ts');
          const { EncryptedPWA } = module;
          const db = await EncryptedPWA.init(password, userId);
          if (!db) return false;
          return EncryptedPWA.getInstance() !== null;
        } catch (error) {
          console.error('Initialization error:', error);
          return false;
        }
      },
      { password: TEST_PASSWORD, userId: TEST_USER_ID }
    );

    expect(isInitialized).toBe(true);
  });

  test('should verify database integrity', async ({ page }) => {
    enableEncryption(page);
    await initializeEncryptedDB(page);

    const integrityResult = await page.evaluate(async () => {
      try {
        const module = await import('/src/services/encryptedPWA.ts');
        const { EncryptedPWA } = module;
        const db = EncryptedPWA.getInstance();
        if (!db) return false;
        return await db.verifyIntegrity();
      } catch (error) {
        console.error('Integrity check error:', error);
        return false;
      }
    });

    expect(integrityResult).toBe(true);
  });

  test('should save and retrieve encrypted data', async ({ page }) => {
    enableEncryption(page);
    await initializeEncryptedDB(page);

    const testData = {
      id: 'e2e-test-log-1',
      timestamp: new Date().toISOString(),
      emotionalState: 'happy',
      selectedFeeling: 'content',
      aiResponse: 'E2E test response',
      isAIResponse: true,
      lowStateCount: 0,
    };

    // Save data
    await page.evaluate(
      async (data) => {
        try {
          const module = await import('/src/services/encryptedPWA.ts');
          const { EncryptedPWA } = module;
          const db = EncryptedPWA.getInstance();
          if (!db) throw new Error('Database not initialized');
          
          await db.execute(
            `INSERT INTO feeling_logs_encrypted (id, user_id, timestamp, emotional_state, selected_feeling, reflection_text, ai_analysis, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              data.id,
              String(888),
              data.timestamp,
              data.emotionalState,
              data.selectedFeeling,
              'E2E test reflection',
              data.aiResponse,
              new Date().toISOString(),
            ]
          );
          await db.save();
        } catch (error) {
          console.error('Save data error:', error);
          throw error;
        }
      },
      testData
    );

    // Retrieve data
    const retrievedData = await page.evaluate(
      async (logId) => {
        try {
          const module = await import('/src/services/encryptedPWA.ts');
          const { EncryptedPWA } = module;
          const db = EncryptedPWA.getInstance();
          if (!db) return null;
          
          const results = await db.query(
            'SELECT * FROM feeling_logs_encrypted WHERE id = ?',
            [logId]
          );
          return results[0] || null;
        } catch (error) {
          console.error('Retrieve data error:', error);
          return null;
        }
      },
      testData.id
    );

    expect(retrievedData).not.toBeNull();
    expect(retrievedData.id).toBe(testData.id);
    expect(retrievedData.emotional_state).toBe(testData.emotionalState);
  });

  test('should handle key rotation', async ({ page }) => {
    enableEncryption(page);
    await initializeEncryptedDB(page);

    // Set password in session storage for rotation
    await page.evaluate((password) => {
      sessionStorage.setItem('encryption_password', password);
    }, TEST_PASSWORD);

    const rotationResult = await page.evaluate(async () => {
      try {
        const module = await import('/src/services/encryptedPWA.ts');
        const { EncryptedPWA } = module;
        const db = EncryptedPWA.getInstance();
        if (!db) return false;
        
        await db.rotateEncryptionKey();
        return true;
      } catch (error) {
        console.error('Key rotation error:', error);
        return false;
      }
    });

    expect(rotationResult).toBe(true);

    // Verify integrity after rotation
    const integrityAfterRotation = await page.evaluate(async () => {
      try {
        const module = await import('/src/services/encryptedPWA.ts');
        const { EncryptedPWA } = module;
        const db = EncryptedPWA.getInstance();
        if (!db) return false;
        return await db.verifyIntegrity();
      } catch (error) {
        console.error('Integrity check after rotation error:', error);
        return false;
      }
    });

    expect(integrityAfterRotation).toBe(true);
  });

  test('should handle password change', async ({ page }) => {
    enableEncryption(page);
    await initializeEncryptedDB(page);

    const newPassword = 'new-e2e-password-456';

    const passwordChangeResult = await page.evaluate(
      async ({ oldPassword, newPassword }) => {
        try {
          const module = await import('/src/services/encryptedPWA.ts');
          const { EncryptedPWA } = module;
          const db = EncryptedPWA.getInstance();
          if (!db) return false;
          
          await db.changePassword(oldPassword, newPassword);
          return true;
        } catch (error) {
          console.error('Password change error:', error);
          return false;
        }
      },
      { oldPassword: TEST_PASSWORD, newPassword }
    );

    expect(passwordChangeResult).toBe(true);

    // Verify data is accessible with new password
    const dataAccessible = await page.evaluate(
      async (password) => {
        try {
          const module = await import('/src/services/encryptedPWA.ts');
          const { EncryptedPWA } = module;
          const db = await EncryptedPWA.init(password, 888);
          if (!db) return false;
          
          const results = await db.query('SELECT COUNT(*) as count FROM feeling_logs_encrypted');
          return results.length > 0;
        } catch (error) {
          console.error('Data access error:', error);
          return false;
        }
      },
      newPassword
    );

    expect(dataAccessible).toBe(true);
  });
});

test.describe('Uninstall Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await waitForAppReady(page);
  });

  test('should uninstall all app data', async ({ page }) => {
    // Create some test data first
    await page.evaluate(async () => {
      try {
        const module = await import('/src/services/database.ts');
        const { dbService } = module;
        await dbService.init();
        await dbService.saveFeelingLog({
          id: 'uninstall-test-1',
          timestamp: new Date().toISOString(),
          emotionalState: 'test',
          selectedFeeling: 'test',
          aiResponse: 'test',
          isAIResponse: false,
          lowStateCount: 0,
        });
      } catch (error) {
        console.error('Create test data error:', error);
      }
    });

    // Verify data exists
    const dataBefore = await page.evaluate(async () => {
      try {
        const module = await import('/src/services/database.ts');
        const { dbService } = module;
        const logs = await dbService.getFeelingLogs();
        return logs.length;
      } catch (error) {
        console.error('Get data error:', error);
        return 0;
      }
    });

    expect(dataBefore).toBeGreaterThan(0);

    // Run uninstall
    await page.evaluate(async () => {
      try {
        const module = await import('/src/services/database.ts');
        const { dbService } = module;
        await dbService.uninstallAppData();
      } catch (error) {
        console.error('Uninstall error:', error);
      }
    });

    // Wait for uninstall to complete
    await page.waitForTimeout(2000);

    // Verify data is gone (reinitialize and check)
    const dataAfter = await page.evaluate(async () => {
      try {
        const module = await import('/src/services/database.ts');
        const { dbService } = module;
        await dbService.init();
        const logs = await dbService.getFeelingLogs();
        return logs.length;
      } catch (error) {
        console.error('Get data after uninstall error:', error);
        return 0;
      }
    });

    expect(dataAfter).toBe(0);
  });

  test('should clear localStorage and sessionStorage', async ({ page }) => {
    // Set some test data
    await page.evaluate(() => {
      localStorage.setItem('test-key', 'test-value');
      sessionStorage.setItem('test-session-key', 'test-session-value');
    });

    // Verify data exists
    const localStorageBefore = await page.evaluate(() => {
      return localStorage.getItem('test-key');
    });
    expect(localStorageBefore).toBe('test-value');

    // Run uninstall
    await page.evaluate(async () => {
      const { dbService } = await import('/src/services/database.ts');
      await dbService.uninstallAppData();
    });

    await page.waitForTimeout(2000);

    // Verify data is cleared
    const localStorageAfter = await page.evaluate(() => {
      return localStorage.getItem('test-key');
    });
    const sessionStorageAfter = await page.evaluate(() => {
      return sessionStorage.getItem('test-session-key');
    });

    expect(localStorageAfter).toBeNull();
    expect(sessionStorageAfter).toBeNull();
  });
});

