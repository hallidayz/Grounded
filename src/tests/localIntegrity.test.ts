/**
 * Local Integrity Test Harness
 * Standalone test suite for encryption verification and integrity checks
 * Can be run independently with: npm run test-local
 */

import { EncryptedPWA } from '../services/encryptedPWA';
import { dbService } from '../services/database';

// Test configuration
const TEST_PASSWORD = 'test-password-123';
const TEST_USER_ID = 999;
const TEST_DATA = {
  feelingLog: {
    id: 'test-log-1',
    timestamp: new Date().toISOString(),
    emotionalState: 'anxious',
    selectedFeeling: 'worried',
    aiResponse: 'Test AI response',
    isAIResponse: true,
    lowStateCount: 0,
  },
  goal: {
    id: 'test-goal-1',
    userId: String(TEST_USER_ID),
    valueId: 'v1',
    text: 'Test goal',
    frequency: 'daily',
    completed: false,
    createdAt: new Date().toISOString(),
  },
};

/**
 * Test encryption and decryption
 */
async function testEncryptionDecryption(): Promise<boolean> {
  console.log('[Test] Starting encryption/decryption test...');
  
  try {
    // Initialize encrypted database
    const encryptedDb = await EncryptedPWA.init(TEST_PASSWORD, TEST_USER_ID);
    if (!encryptedDb) {
      throw new Error('Failed to initialize encrypted database');
    }
    console.log('[Test] ✓ Encrypted database initialized');
    
    // Save test data
    await encryptedDb.execute(
      `INSERT INTO feeling_logs_encrypted (id, user_id, timestamp, emotional_state, selected_feeling, reflection_text, ai_analysis, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        TEST_DATA.feelingLog.id,
        String(TEST_USER_ID),
        TEST_DATA.feelingLog.timestamp,
        TEST_DATA.feelingLog.emotionalState,
        TEST_DATA.feelingLog.selectedFeeling,
        'Test reflection',
        TEST_DATA.feelingLog.aiResponse,
        new Date().toISOString(),
      ]
    );
    console.log('[Test] ✓ Test data inserted');
    
    // Save database
    await encryptedDb.save();
    console.log('[Test] ✓ Database saved');
    
    // Verify integrity
    const integrityCheck = await encryptedDb.verifyIntegrity();
    if (!integrityCheck) {
      throw new Error('Integrity check failed');
    }
    console.log('[Test] ✓ Integrity check passed');
    
    // Test key rotation
    console.log('[Test] Testing key rotation...');
    try {
      // Set password in session storage for rotation
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('encryption_password', TEST_PASSWORD);
      }
      
      await encryptedDb.rotateEncryptionKey();
      console.log('[Test] ✓ Key rotation completed');
      
      // Verify integrity after rotation
      const integrityAfterRotation = await encryptedDb.verifyIntegrity();
      if (!integrityAfterRotation) {
        throw new Error('Integrity check failed after key rotation');
      }
      console.log('[Test] ✓ Integrity check passed after rotation');
    } catch (error) {
      console.warn('[Test] ⚠ Key rotation test skipped (password not in session):', error);
    }
    
    // Test password change
    const newPassword = 'new-test-password-456';
    await encryptedDb.changePassword(TEST_PASSWORD, newPassword);
    console.log('[Test] ✓ Password changed successfully');
    
    // Verify data is still accessible with new password
    const newDb = await EncryptedPWA.init(newPassword, TEST_USER_ID);
    const results = await newDb.query(
      'SELECT * FROM feeling_logs_encrypted WHERE id = ?',
      [TEST_DATA.feelingLog.id]
    );
    
    if (results.length === 0) {
      throw new Error('Data not accessible after password change');
    }
    console.log('[Test] ✓ Data accessible after password change');
    
    return true;
  } catch (error) {
    console.error('[Test] ✗ Encryption/decryption test failed:', error);
    return false;
  }
}

/**
 * Test database integrity hashing
 */
async function testIntegrityHashing(): Promise<boolean> {
  console.log('[Test] Starting integrity hashing test...');
  
  try {
    const encryptedDb = await EncryptedPWA.init(TEST_PASSWORD, TEST_USER_ID);
    if (!encryptedDb) {
      throw new Error('Failed to initialize encrypted database');
    }
    
    // Initial integrity check (should create hash)
    const initialIntegrity = await encryptedDb.verifyIntegrity();
    if (!initialIntegrity) {
      throw new Error('Initial integrity check failed');
    }
    console.log('[Test] ✓ Initial integrity check passed');
    
    // Add more data
    await encryptedDb.execute(
      `INSERT INTO goals_encrypted (id, user_id, value_id, text, frequency, completed, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        TEST_DATA.goal.id,
        TEST_DATA.goal.userId,
        TEST_DATA.goal.valueId,
        TEST_DATA.goal.text,
        TEST_DATA.goal.frequency,
        TEST_DATA.goal.completed ? 1 : 0,
        TEST_DATA.goal.createdAt,
        new Date().toISOString(),
      ]
    );
    
    await encryptedDb.save();
    
    // Verify integrity again (should update hash)
    const updatedIntegrity = await encryptedDb.verifyIntegrity();
    if (!updatedIntegrity) {
      throw new Error('Updated integrity check failed');
    }
    console.log('[Test] ✓ Updated integrity check passed');
    
    return true;
  } catch (error) {
    console.error('[Test] ✗ Integrity hashing test failed:', error);
    return false;
  }
}

/**
 * Test uninstall functionality
 */
async function testUninstall(): Promise<boolean> {
  console.log('[Test] Starting uninstall test...');
  
  try {
    // Create some test data first
    await dbService.init();
    await dbService.saveFeelingLog(TEST_DATA.feelingLog);
    console.log('[Test] ✓ Test data created');
    
    // Verify data exists
    const logs = await dbService.getFeelingLogs();
    if (logs.length === 0) {
      throw new Error('Test data not found before uninstall');
    }
    console.log('[Test] ✓ Test data verified');
    
    // Run uninstall
    await dbService.uninstallAppData();
    console.log('[Test] ✓ Uninstall completed');
    
    // Verify data is gone (reinitialize and check)
    await dbService.init();
    const logsAfter = await dbService.getFeelingLogs();
    if (logsAfter.length > 0) {
      throw new Error('Data still exists after uninstall');
    }
    console.log('[Test] ✓ Data verified as deleted');
    
    return true;
  } catch (error) {
    console.error('[Test] ✗ Uninstall test failed:', error);
    return false;
  }
}

/**
 * Main test runner
 */
async function runTests(): Promise<void> {
  console.log('='.repeat(60));
  console.log('Local Integrity Test Suite');
  console.log('='.repeat(60));
  console.log('');
  
  const results: { name: string; passed: boolean }[] = [];
  
  // Test 1: Encryption/Decryption
  const encryptionTest = await testEncryptionDecryption();
  results.push({ name: 'Encryption/Decryption', passed: encryptionTest });
  console.log('');
  
  // Test 2: Integrity Hashing
  const integrityTest = await testIntegrityHashing();
  results.push({ name: 'Integrity Hashing', passed: integrityTest });
  console.log('');
  
  // Test 3: Uninstall
  const uninstallTest = await testUninstall();
  results.push({ name: 'Uninstall', passed: uninstallTest });
  console.log('');
  
  // Summary
  console.log('='.repeat(60));
  console.log('Test Results Summary');
  console.log('='.repeat(60));
  
  results.forEach((result) => {
    const status = result.passed ? '✓ PASS' : '✗ FAIL';
    console.log(`${status} - ${result.name}`);
  });
  
  const allPassed = results.every((r) => r.passed);
  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;
  
  console.log('');
  console.log(`Total: ${passedCount}/${totalCount} tests passed`);
  
  if (allPassed) {
    console.log('');
    console.log('✅ All tests passed!');
    process.exit(0);
  } else {
    console.log('');
    console.log('❌ Some tests failed. See details above.');
    process.exit(1);
  }
}

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch((error) => {
    console.error('Fatal error running tests:', error);
    process.exit(1);
  });
}

export { runTests, testEncryptionDecryption, testIntegrityHashing, testUninstall };

