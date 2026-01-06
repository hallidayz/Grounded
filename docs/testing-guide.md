# Integration Testing & Validation Guide

## Phase 10: Integration Testing & Validation

This guide provides comprehensive testing procedures to validate all implemented features from Phases 1-9.

---

## Pre-Testing Checklist

Before running tests, ensure:

- [ ] Development environment is set up
- [ ] Database Inspector is accessible (dev mode)
- [ ] Browser DevTools are open
- [ ] Console logging is enabled
- [ ] Test data backup is created (if needed)

---

## Test Suite 1: Database Initialization

### Test 1.1: Dexie Database Initialization

**Objective:** Verify Dexie database initializes correctly with schema v8.

**Steps:**
1. Clear browser storage (localStorage, IndexedDB)
2. Open app in development mode
3. Check browser console for initialization logs
4. Verify database is created: `groundedDB` in IndexedDB
5. Check database version is 8

**Expected Results:**
- ✅ No console errors
- ✅ Database `groundedDB` exists in IndexedDB
- ✅ Version is 8
- ✅ All 12 object stores are created

**Verification:**
```javascript
// In browser console
indexedDB.databases().then(dbs => {
  const grounded = dbs.find(db => db.name === 'groundedDB');
  console.log('Database:', grounded?.name);
  console.log('Version:', grounded?.version);
});
```

### Test 1.2: Old Database Cleanup

**Objective:** Verify old databases are cleaned up automatically.

**Steps:**
1. Manually create old database: `com.acminds.grounded.therapy.db`
2. Open app
3. Check if old database is deleted

**Expected Results:**
- ✅ Old database is automatically deleted
- ✅ Only `groundedDB` exists
- ✅ No errors in console

---

## Test Suite 2: Adapter Pattern

### Test 2.1: LegacyAdapter (IndexedDB/Dexie)

**Objective:** Verify LegacyAdapter works correctly with Dexie.

**Steps:**
1. Ensure encryption is disabled: `localStorage.setItem('encryption_enabled', 'false')`
2. Restart app
3. Perform CRUD operations:
   - Create user
   - Save values
   - Save goals
   - Save feeling logs
   - Retrieve data

**Expected Results:**
- ✅ All operations succeed
- ✅ Data persists in IndexedDB
- ✅ No encryption boundary errors
- ✅ Data retrievable after refresh

**Verification:**
```javascript
// In browser console
const adapter = getDatabaseAdapter();
console.log('Adapter type:', adapter.constructor.name); // Should be "LegacyAdapter"

// Test operations
const userId = 'test-user-123';
await adapter.saveValue(userId, 'v1', true, 0);
const values = await adapter.getActiveValues(userId);
console.log('Values:', values); // Should include 'v1'
```

### Test 2.2: EncryptedAdapter (SQLite)

**Objective:** Verify EncryptedAdapter works correctly with encrypted storage.

**Steps:**
1. Enable encryption: `localStorage.setItem('encryption_enabled', 'true')`
2. Set encryption password (if required)
3. Restart app
4. Perform CRUD operations:
   - Create user
   - Save values
   - Save goals
   - Save feeling logs (PHI)
   - Retrieve data

**Expected Results:**
- ✅ All operations succeed
- ✅ Data stored in SQLite (encrypted)
- ✅ PHI data uses EncryptedAdapter
- ✅ Encryption boundary validation works

**Verification:**
```javascript
// In browser console
const adapter = getDatabaseAdapter();
console.log('Adapter type:', adapter.constructor.name); // Should be "EncryptedAdapter"

// Test PHI operation
const feelingLog = {
  id: 'test-log-1',
  timestamp: new Date().toISOString(),
  userId: 'test-user-123',
  emotionalState: 'low',
  selectedFeeling: 'sad',
  aiResponse: 'Test response',
  isAIResponse: true,
  lowStateCount: 1
};
await adapter.saveFeelingLog(feelingLog);
console.log('PHI data saved successfully');
```

### Test 2.3: Encryption Boundary Validation

**Objective:** Verify encryption boundary prevents PHI in unencrypted storage.

**Steps:**
1. Enable encryption: `localStorage.setItem('encryption_enabled', 'true')`
2. Try to use LegacyAdapter for PHI data
3. Check for security violation error

**Expected Results:**
- ✅ Error thrown: "SECURITY VIOLATION"
- ✅ PHI operations blocked on LegacyAdapter
- ✅ Error message explains the violation

**Verification:**
```javascript
// This should throw an error
try {
  const legacyAdapter = new LegacyAdapter(dbService);
  await legacyAdapter.saveFeelingLog({...}); // PHI data
} catch (error) {
  console.log('Expected error:', error.message); // Should contain "SECURITY VIOLATION"
}
```

---

## Test Suite 3: Data Persistence

### Test 3.1: Values Persistence

**Objective:** Verify values persist correctly in dedicated table.

**Steps:**
1. Select values in app
2. Confirm selection
3. Refresh page
4. Verify values are still selected
5. Check Database Inspector for `values` table

**Expected Results:**
- ✅ Values persist after refresh
- ✅ Values appear in `values` table (not just appData)
- ✅ Active flag is true
- ✅ Priority is preserved

**Verification:**
```javascript
// In Database Inspector or console
const db = await db.open();
const values = await db.values.where('[userId+active]').equals([userId, true]).toArray();
console.log('Active values:', values);
```

### Test 3.2: Goals Persistence

**Objective:** Verify goals persist correctly in dedicated table.

**Steps:**
1. Create a goal
2. Refresh page
3. Verify goal still exists
4. Check Database Inspector for `goals` table

**Expected Results:**
- ✅ Goals persist after refresh
- ✅ Goals appear in `goals` table
- ✅ Goal data is complete (userId, valueId, text, etc.)

### Test 3.3: Feeling Logs Persistence

**Objective:** Verify feeling logs persist correctly.

**Steps:**
1. Create a feeling log entry
2. Refresh page
3. Verify log still exists
4. Check Database Inspector for `feelingLogs` table

**Expected Results:**
- ✅ Logs persist after refresh
- ✅ userId is assigned correctly
- ✅ All log fields are preserved

---

## Test Suite 4: Migrations

### Test 4.1: localStorage → IndexedDB Migration

**Objective:** Verify localStorage data migrates to IndexedDB.

**Steps:**
1. Clear IndexedDB
2. Create legacy localStorage data:
   ```javascript
   localStorage.setItem('groundedAppData', JSON.stringify({
     values: ['v1', 'v2', 'v3'],
     goals: [{ id: 'g1', text: 'Test goal', userId: 'test-user' }],
     logs: []
   }));
   ```
3. Open app
4. Check if data migrated to IndexedDB
5. Verify localStorage migration flag is set

**Expected Results:**
- ✅ Data appears in IndexedDB
- ✅ Values in `values` table
- ✅ Goals in `goals` table
- ✅ Migration flag set: `localStorage_migration_${userId}`

**Verification:**
```javascript
// Check migration flag
const migrationKey = `localStorage_migration_${userId}`;
console.log('Migration completed:', localStorage.getItem(migrationKey) === 'true');

// Check migrated data
const adapter = getDatabaseAdapter();
const values = await adapter.getActiveValues(userId);
console.log('Migrated values:', values);
```

### Test 4.2: v7 → v8 Migration

**Objective:** Verify values/goals migrate from appData to dedicated tables.

**Steps:**
1. Create v7 database structure (appData with values/goals)
2. Open app (triggers v8 upgrade)
3. Check if values/goals migrated to dedicated tables
4. Verify migration flag is set

**Expected Results:**
- ✅ Values migrated to `values` table
- ✅ Goals migrated to `goals` table
- ✅ Migration flag set: `dexie_migration_v7_to_v8`
- ✅ Old appData.values/goals can be empty (backward compatibility)

**Verification:**
```javascript
// Check migration flag
console.log('v7→v8 migration:', localStorage.getItem('dexie_migration_v7_to_v8') === 'true');

// Check migrated data
const db = await db.open();
const values = await db.values.toArray();
const goals = await db.goals.toArray();
console.log('Migrated values count:', values.length);
console.log('Migrated goals count:', goals.length);
```

### Test 4.3: Legacy Data Migration (userId Assignment)

**Objective:** Verify legacy data without userId gets assigned userId.

**Steps:**
1. Create legacy feeling logs without userId
2. Run migration service
3. Verify logs have userId assigned
4. Check migration completion flag

**Expected Results:**
- ✅ All logs have userId
- ✅ Migration flag set: `legacy_migration_completed`
- ✅ Data accessible via adapter

---

## Test Suite 5: Data Pruning

### Test 5.1: Pruning Old Feeling Logs

**Objective:** Verify pruning removes logs older than 12 months.

**Steps:**
1. Create feeling logs with old timestamps (13+ months ago)
2. Run pruning service manually
3. Verify old logs are deleted
4. Verify recent logs remain

**Expected Results:**
- ✅ Logs older than 12 months are deleted
- ✅ Logs within 12 months remain
- ✅ No errors during pruning

**Verification:**
```javascript
// Create old log
const oldLog = {
  id: 'old-log-1',
  timestamp: new Date(Date.now() - 13 * 30 * 24 * 60 * 60 * 1000).toISOString(), // 13 months ago
  userId: 'test-user',
  emotionalState: 'low',
  // ... other fields
};
await adapter.saveFeelingLog(oldLog);

// Run pruning
import { runDataPruning } from './services/dataPruningService';
await runDataPruning();

// Verify deletion
const logs = await adapter.getFeelingLogs(undefined, 'test-user');
console.log('Logs after pruning:', logs.length); // Should not include old log
```

### Test 5.2: Scheduled Pruning

**Objective:** Verify pruning runs automatically on app initialization.

**Steps:**
1. Create old data (13+ months)
2. Restart app
3. Check if pruning ran automatically
4. Verify old data is removed

**Expected Results:**
- ✅ Pruning runs on initialization
- ✅ Old data removed automatically
- ✅ No blocking of app startup

---

## Test Suite 6: Developer Tools

### Test 6.1: Database Inspector Access

**Objective:** Verify Database Inspector is accessible in dev mode.

**Steps:**
1. Ensure development mode: `process.env.NODE_ENV === 'development'`
2. Navigate to 'dev' view: `onViewChange('dev')`
3. Verify inspector renders

**Expected Results:**
- ✅ Inspector UI renders
- ✅ All stores listed
- ✅ Record counts displayed

### Test 6.2: Database Inspector Operations

**Objective:** Verify all inspector operations work correctly.

**Steps:**
1. Open Database Inspector
2. Test each operation:
   - View store data
   - Export store
   - Export all
   - Clear store
   - Refresh

**Expected Results:**
- ✅ View shows JSON data
- ✅ Export downloads JSON file
- ✅ Clear removes data (with confirmation)
- ✅ Refresh updates counts

### Test 6.3: Production Mode Blocking

**Objective:** Verify inspector is blocked in production.

**Steps:**
1. Set production mode: `localStorage.setItem('dev_mode', 'false')`
2. Navigate to 'dev' view
3. Verify warning message

**Expected Results:**
- ✅ Warning message displayed
- ✅ Inspector UI not rendered
- ✅ No database access

---

## Test Suite 7: Performance

### Test 7.1: Bulk Operations

**Objective:** Verify bulk operations perform better than individual operations.

**Steps:**
1. Measure time for individual `put()` operations (100 records)
2. Measure time for `bulkPut()` operation (100 records)
3. Compare performance

**Expected Results:**
- ✅ `bulkPut()` is significantly faster
- ✅ Transaction overhead reduced

**Verification:**
```javascript
// Individual operations
const start1 = performance.now();
for (let i = 0; i < 100; i++) {
  await db.values.put({ userId: 'test', valueId: `v${i}`, active: true, priority: i, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
}
const time1 = performance.now() - start1;
console.log('Individual operations:', time1, 'ms');

// Bulk operation
const start2 = performance.now();
const records = Array.from({ length: 100 }, (_, i) => ({
  userId: 'test',
  valueId: `v${i}`,
  active: true,
  priority: i,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}));
await db.values.bulkPut(records);
const time2 = performance.now() - start2;
console.log('Bulk operation:', time2, 'ms');
console.log('Improvement:', ((time1 - time2) / time1 * 100).toFixed(1) + '%');
```

### Test 7.2: Indexed Queries

**Objective:** Verify indexed queries perform efficiently.

**Steps:**
1. Create large dataset (1000+ records)
2. Query using indexed field
3. Query using non-indexed field
4. Compare performance

**Expected Results:**
- ✅ Indexed queries are faster
- ✅ Compound indexes work correctly

---

## Test Suite 8: Error Handling

### Test 8.1: Migration Error Recovery

**Objective:** Verify migrations handle errors gracefully.

**Steps:**
1. Create corrupted data
2. Trigger migration
3. Verify error handling

**Expected Results:**
- ✅ Errors are caught and logged
- ✅ Transaction rolls back on error
- ✅ App continues to function

### Test 8.2: Adapter Initialization Errors

**Objective:** Verify adapter handles initialization errors.

**Steps:**
1. Simulate EncryptedPWA initialization failure
2. Check adapter fallback behavior
3. Verify error messages

**Expected Results:**
- ✅ Errors are handled gracefully
- ✅ Appropriate error messages
- ✅ App doesn't crash

---

## Test Suite 9: Data Integrity

### Test 9.1: Duplicate Prevention

**Objective:** Verify migrations prevent duplicate data.

**Steps:**
1. Run migration twice
2. Check for duplicate records
3. Verify migration flags prevent re-migration

**Expected Results:**
- ✅ No duplicate records
- ✅ Migration flags prevent re-migration
- ✅ Data integrity maintained

### Test 9.2: Transaction Atomicity

**Objective:** Verify transactions are atomic (all-or-nothing).

**Steps:**
1. Create transaction that will fail partway through
2. Verify rollback occurs
3. Check data state

**Expected Results:**
- ✅ Transaction rolls back on error
- ✅ No partial data commits
- ✅ Data state is consistent

---

## Test Suite 10: Integration Scenarios

### Test 10.1: Full User Journey

**Objective:** Verify complete user journey works end-to-end.

**Steps:**
1. New user signs up
2. Accepts terms
3. Selects values
4. Creates goals
5. Logs feelings
6. Views reports
7. Refreshes page
8. Verifies all data persists

**Expected Results:**
- ✅ All steps complete successfully
- ✅ Data persists throughout
- ✅ No data loss on refresh

### Test 10.2: Encryption Toggle

**Objective:** Verify switching between encrypted/non-encrypted modes.

**Steps:**
1. Start with encryption disabled
2. Create data
3. Enable encryption
4. Verify data migration
5. Create new data
6. Verify all data accessible

**Expected Results:**
- ✅ Data migrates correctly
- ✅ New data uses correct adapter
- ✅ No data loss

---

## Automated Test Scripts

### Quick Validation Script

```javascript
// Run in browser console after app loads
async function quickValidation() {
  console.log('=== Quick Validation ===');
  
  // 1. Check database version
  const dbs = await indexedDB.databases();
  const grounded = dbs.find(db => db.name === 'groundedDB');
  console.log('✅ Database version:', grounded?.version, '(expected: 8)');
  
  // 2. Check adapter
  const adapter = getDatabaseAdapter();
  console.log('✅ Adapter:', adapter.constructor.name);
  
  // 3. Check encryption status
  const encryptionEnabled = isEncryptionEnabled();
  console.log('✅ Encryption:', encryptionEnabled ? 'Enabled' : 'Disabled');
  
  // 4. Check migration flags
  const v7v8Migration = localStorage.getItem('dexie_migration_v7_to_v8') === 'true';
  console.log('✅ v7→v8 Migration:', v7v8Migration ? 'Complete' : 'Pending');
  
  // 5. Test basic operations
  try {
    const testUserId = 'test-validation';
    await adapter.saveValue(testUserId, 'v1', true, 0);
    const values = await adapter.getActiveValues(testUserId);
    console.log('✅ Values operation:', values.includes('v1') ? 'Working' : 'Failed');
  } catch (error) {
    console.error('❌ Values operation failed:', error);
  }
  
  console.log('=== Validation Complete ===');
}

quickValidation();
```

---

## Test Results Template

Use this template to document test results:

```markdown
## Test Results - [Date]

### Test Suite 1: Database Initialization
- [ ] Test 1.1: Dexie Database Initialization - ✅/❌
- [ ] Test 1.2: Old Database Cleanup - ✅/❌

### Test Suite 2: Adapter Pattern
- [ ] Test 2.1: LegacyAdapter - ✅/❌
- [ ] Test 2.2: EncryptedAdapter - ✅/❌
- [ ] Test 2.3: Encryption Boundary Validation - ✅/❌

### Test Suite 3: Data Persistence
- [ ] Test 3.1: Values Persistence - ✅/❌
- [ ] Test 3.2: Goals Persistence - ✅/❌
- [ ] Test 3.3: Feeling Logs Persistence - ✅/❌

### Test Suite 4: Migrations
- [ ] Test 4.1: localStorage → IndexedDB - ✅/❌
- [ ] Test 4.2: v7 → v8 Migration - ✅/❌
- [ ] Test 4.3: Legacy Data Migration - ✅/❌

### Test Suite 5: Data Pruning
- [ ] Test 5.1: Pruning Old Feeling Logs - ✅/❌
- [ ] Test 5.2: Scheduled Pruning - ✅/❌

### Test Suite 6: Developer Tools
- [ ] Test 6.1: Database Inspector Access - ✅/❌
- [ ] Test 6.2: Database Inspector Operations - ✅/❌
- [ ] Test 6.3: Production Mode Blocking - ✅/❌

### Test Suite 7: Performance
- [ ] Test 7.1: Bulk Operations - ✅/❌
- [ ] Test 7.2: Indexed Queries - ✅/❌

### Test Suite 8: Error Handling
- [ ] Test 8.1: Migration Error Recovery - ✅/❌
- [ ] Test 8.2: Adapter Initialization Errors - ✅/❌

### Test Suite 9: Data Integrity
- [ ] Test 9.1: Duplicate Prevention - ✅/❌
- [ ] Test 9.2: Transaction Atomicity - ✅/❌

### Test Suite 10: Integration Scenarios
- [ ] Test 10.1: Full User Journey - ✅/❌
- [ ] Test 10.2: Encryption Toggle - ✅/❌

## Summary
- Total Tests: X
- Passed: Y
- Failed: Z
- Pass Rate: Y/X * 100%
```

---

## Troubleshooting Test Failures

### Common Issues

1. **Migration Not Running**
   - Clear migration flags in localStorage
   - Check database version
   - Verify migration code is executed

2. **Data Not Persisting**
   - Check userId is present
   - Verify adapter is being used
   - Check browser storage quota

3. **Performance Issues**
   - Check if bulk operations are used
   - Verify indexes are created
   - Check transaction duration

4. **Encryption Errors**
   - Verify EncryptedPWA is initialized
   - Check encryption boundary validation
   - Ensure PHI data uses EncryptedAdapter

---

## Next Steps

After completing all tests:

1. Document any failures
2. Create issues for bugs found
3. Update test results template
4. Re-run failed tests after fixes
5. Update documentation with findings

---

**Last Updated:** 2025-01-06  
**Phase:** 10 - Integration Testing & Validation

