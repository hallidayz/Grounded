# Data Persistence Documentation

## Overview

The Grounded app uses a dual-storage architecture to support both standard and HIPAA-compliant (encrypted) storage modes. All database operations go through the `DatabaseAdapter` interface, which abstracts the underlying storage implementation.

**Current Version:** Schema v8  
**Database Name:** `groundedDB` (IndexedDB) / `grounded_encrypted.db` (SQLite)

---

## Architecture

### Storage Paths

1. **IndexedDB (LegacyAdapter)**
   - Uses Dexie.js for high-performance operations
   - Non-encrypted storage
   - Used when `encryption_enabled !== 'true'`
   - File: `src/services/dexieDB.ts`

2. **SQLite (EncryptedAdapter)**
   - Uses EncryptedPWA with AES-GCM encryption
   - HIPAA-compliant encrypted storage
   - Used when `encryption_enabled === 'true'`
   - File: `src/services/encryptedPWA.ts`

### Adapter Pattern

All database operations go through the `DatabaseAdapter` interface:
- **File:** `src/services/databaseAdapter.ts`
- **Factory:** `getDatabaseAdapter()` - Returns appropriate adapter based on encryption setting
- **Security:** Encryption boundary validation prevents PHI data from being stored in unencrypted storage

---

## Schema Reference (v8)

### 1. users
**Purpose:** User account information

**Key Path:** `id` (string)

**Indexes:**
- `username` (unique)
- `email` (unique)

**Fields:**
```typescript
{
  id: string;
  username: string;
  passwordHash: string;
  email: string;
  therapistEmails?: string[];
  termsAccepted: boolean;
  termsAcceptedDate?: string;
  createdAt: string;
  lastLogin?: string;
}
```

**SQLite Table:** `users_encrypted`

---

### 2. appData
**Purpose:** Backward compatibility - stores user app data in a single record

**Key Path:** `userId` (string)

**Fields:**
```typescript
{
  userId: string;
  data: {
    settings: AppSettings;
    logs: LogEntry[];
    goals: Goal[];
    values: string[]; // Array of value IDs
    lcswConfig?: LCSWConfig;
  };
}
```

**SQLite Table:** `app_data_encrypted`

**Note:** While values and goals are now in dedicated tables, appData is maintained for backward compatibility and quick access.

---

### 3. values
**Purpose:** Historical tracking of user value selections with priority and active status

**Key Path:** `id` (auto-increment number)

**Indexes:**
- `userId`
- `valueId`
- `active`
- `createdAt`
- `[userId+active]` (compound index)

**Fields:**
```typescript
{
  id?: number; // Auto-increment
  userId: string;
  valueId: string;
  active: boolean; // Only active values are displayed
  priority: number; // Order of selection
  createdAt: string;
  updatedAt: string;
}
```

**SQLite Table:** `values_encrypted`

**Usage:**
- Active values are displayed in the UI
- Historical values are retained for tracking changes
- Priority determines display order

---

### 4. goals
**Purpose:** User goals with progress tracking

**Key Path:** `id` (string)

**Indexes:**
- `userId`
- `valueId`
- `completed`
- `createdAt`

**Fields:**
```typescript
{
  id: string;
  userId: string;
  valueId: string;
  text: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  completed: boolean;
  createdAt: string;
  updates?: GoalUpdate[];
}
```

**SQLite Table:** `goals_encrypted`

---

### 5. feelingLogs
**Purpose:** Emotional state logs and AI-generated responses (PHI)

**Key Path:** `id` (string)

**Indexes:**
- `timestamp`
- `emotionalState`
- `userId`

**Fields:**
```typescript
{
  id: string;
  timestamp: string;
  userId?: string;
  emotion: string;
  subEmotion: string | null;
  emotionalState: string;
  selectedFeeling: string | null;
  jsonIn: string;
  jsonOut: string;
  aiResponse: string;
  isAIResponse: boolean;
  lowStateCount: number;
  // ... other fields
}
```

**SQLite Table:** `feeling_logs_encrypted`

**Security:** Contains PHI - must use EncryptedAdapter when encryption is enabled.

---

### 6. userInteractions
**Purpose:** User interaction tracking for analytics (PHI)

**Key Path:** `id` (string)

**Indexes:**
- `timestamp`
- `sessionId`
- `type`

**Fields:**
```typescript
{
  id: string;
  timestamp: string;
  type: string;
  sessionId: string;
  valueId?: string;
  emotionalState?: string;
  selectedFeeling?: string;
  metadata?: Record<string, any>;
}
```

**SQLite Table:** `user_interactions_encrypted`

**Security:** Contains PHI - must use EncryptedAdapter when encryption is enabled.

---

### 7. sessions
**Purpose:** Reflection session tracking (PHI)

**Key Path:** `id` (string)

**Indexes:**
- `startTimestamp`
- `valueId`
- `userId`

**Fields:**
```typescript
{
  id: string;
  userId: string;
  startTimestamp: string;
  endTimestamp?: string;
  valueId: string;
  initialEmotionalState?: string;
  finalEmotionalState?: string;
  selectedFeeling?: string;
  reflectionLength?: number;
  goalCreated: boolean;
  duration?: number;
}
```

**SQLite Table:** `sessions_encrypted`

**Security:** Contains PHI - must use EncryptedAdapter when encryption is enabled.

---

### 8. assessments
**Purpose:** AI-generated assessments (PHI)

**Key Path:** `id` (string)

**Indexes:**
- `userId`
- `timestamp`

**Fields:**
```typescript
{
  id: string;
  userId: string;
  emotion: string;
  subEmotion: string;
  reflection: string;
  assessment: string;
  timestamp: string;
}
```

**SQLite Table:** `assessments_encrypted`

**Security:** Contains PHI - must use EncryptedAdapter when encryption is enabled.

---

### 9. reports
**Purpose:** Generated counselor reports (PHI)

**Key Path:** `id` (string)

**Indexes:**
- `userId`
- `timestamp`

**Fields:**
```typescript
{
  id: string;
  userId: string;
  content: string;
  timestamp: string;
  emailAddresses: string[];
  treatmentProtocols: string[];
}
```

**SQLite Table:** `reports_encrypted`

**Security:** Contains PHI - must use EncryptedAdapter when encryption is enabled.

---

### 10. resetTokens
**Purpose:** Password reset token management

**Key Path:** `token` (string)

**Indexes:**
- `userId`
- `expires`

**Fields:**
```typescript
{
  token: string;
  userId: string;
  email: string;
  expires: string;
  createdAt: string;
}
```

**SQLite Table:** `reset_tokens_encrypted`

**Cleanup:** Expired tokens are automatically cleaned up via `cleanupExpiredTokens()`.

---

### 11. metadata
**Purpose:** App metadata and migration tracking

**Key Path:** `id` (string, typically `'app_metadata'`)

**Indexes:**
- `appId`
- `platform`

**Fields:**
```typescript
{
  id: string;
  appName: string;
  appId: string;
  platform: string; // 'pwa', 'ios', 'android', 'desktop'
  version: string; // From package.json
  createdAt: string;
  lastValidated: string;
  localStorageMigrated?: boolean;
  migrationDate?: string;
}
```

**SQLite Table:** `metadata_encrypted`

---

### 12. ruleBasedUsageLogs
**Purpose:** Rule-based system usage tracking

**Key Path:** `id` (string)

**Indexes:**
- `timestamp`
- `type`

**Fields:**
```typescript
{
  id: string;
  timestamp: string;
  type: string;
  // ... other fields from RuleBasedUsageLog interface
}
```

**SQLite Table:** `rule_based_usage_logs_encrypted`

---

## Version History

| Version | Date | Changes | Migration |
|---------|------|---------|-----------|
| v8 | 2025-01-06 | Added `values` and `goals` dedicated tables. Moved from appData to separate tables for historical tracking. | v7→v8: Automatic migration on database open |
| v7 | Previous | Initial schema with appData containing values/goals | - |

### Migration v7 → v8

**Trigger:** Database upgrade from v7 to v8

**Process:**
1. Reads all `appData` records
2. Extracts `values` array → creates entries in `values` table
3. Extracts `goals` array → creates entries in `goals` table
4. Marks existing values as inactive, creates new active entries
5. Sets migration flag in localStorage to prevent re-migration

**Safety Features:**
- Duplicate prevention (checks migration flag)
- Transaction rollback on error
- Data validation before processing
- Warning throttling for large datasets

**Flag:** `dexie_migration_v7_to_v8` in localStorage

---

## File Locations

### Core Database Files

- **Dexie Database:** `src/services/dexieDB.ts`
  - Defines `GroundedDB` class extending Dexie
  - Schema v8 with all 12 stores
  - Migration logic in `.upgrade()` callback

- **Database Adapter:** `src/services/databaseAdapter.ts`
  - `DatabaseAdapter` interface
  - `LegacyAdapter` (Dexie implementation)
  - `EncryptedAdapter` (SQLite implementation)
  - `getDatabaseAdapter()` factory function

- **Encrypted Storage:** `src/services/encryptedPWA.ts`
  - SQLite database with AES-GCM encryption
  - HIPAA-compliant storage layer

- **Legacy Database:** `src/services/database.ts`
  - Original DatabaseService (being phased out)
  - Still used for some backward compatibility

### Supporting Files

- **Data Context:** `src/contexts/DataContext.tsx`
  - Centralized state management
  - Uses adapter pattern for persistence

- **App Initialization:** `src/hooks/useAppInitialization.ts`
  - Database initialization
  - Data loading on app boot
  - Migration orchestration

- **Data Pruning:** `src/services/dataPruningService.ts`
  - Removes old data (12 month retention)
  - Scheduled weekly pruning

- **LocalStorage Migration:** `src/services/localStorageMigration.ts`
  - Migrates legacy localStorage data to IndexedDB

- **Environment Config:** `src/constants/environment.ts`
  - Dev/Prod toggles
  - Feature flags

- **Database Inspector:** `src/components/DatabaseInspector.tsx`
  - Developer tool for inspecting and managing database stores
  - Only available in development mode
  - Accessible via 'dev' route in AppRouter

---

## Migration Strategy

### localStorage → IndexedDB Migration

**Trigger:** On app initialization if legacy keys detected

**Legacy Keys:**
- `groundedAppData`
- `groundedUser`
- `groundedSession`

**Process:**
1. Detects legacy keys in localStorage
2. Parses and validates data
3. Migrates to IndexedDB via adapter
4. Sets migration flag to prevent re-migration
5. Cleans up localStorage after successful migration

**Flag:** `localStorage_migration_${userId}` in localStorage

### IndexedDB → Dexie Migration

**Trigger:** Automatic on database open (Dexie upgrade)

**Process:**
1. Dexie detects version change
2. Runs `.upgrade()` callback
3. Migrates data from old structure to new
4. Sets migration flag

**Safety:**
- Atomic transactions (all-or-nothing)
- Rollback on error
- Duplicate prevention

---

## Browser Debugging Tips

### Chrome DevTools

#### 1. Inspect IndexedDB

1. Open DevTools (F12)
2. Go to **Application** tab
3. Expand **IndexedDB** in left sidebar
4. Click on `groundedDB`
5. Browse object stores and records

#### 2. View Database Version

```javascript
// In console
indexedDB.databases().then(dbs => {
  const grounded = dbs.find(db => db.name === 'groundedDB');
  console.log('Version:', grounded?.version);
});
```

#### 3. Export Database

```javascript
// Export all data from a store
const db = await db.open();
const data = await db.feelingLogs.toArray();
console.log(JSON.stringify(data, null, 2));
```

#### 4. Clear Database

```javascript
// Clear specific store
const db = await db.open();
await db.feelingLogs.clear();

// Or delete entire database
indexedDB.deleteDatabase('groundedDB');
```

#### 5. Monitor Database Operations

```javascript
// Add logging to adapter calls
const originalGet = adapter.getAppData;
adapter.getAppData = async function(userId) {
  console.log('[DB] getAppData called for:', userId);
  const result = await originalGet.call(this, userId);
  console.log('[DB] getAppData result:', result);
  return result;
};
```

#### 6. Database Inspector (Development Only)

The Database Inspector is a built-in developer tool that provides a UI for inspecting and managing database stores. It's only available in development mode.

**Access:**
- Navigate to the 'dev' view in the app (set `view` to 'dev' in App.tsx or use `onViewChange('dev')`)
- The inspector automatically checks if it's in development mode and shows a warning if accessed in production

**Features:**

1. **Store Overview**
   - Lists all 12 object stores
   - Shows record counts per store
   - Displays store type (IndexedDB/SQLite)
   - Error indicators for inaccessible stores

2. **Store Operations**
   - **View:** Display all records from a selected store in JSON format
   - **Export:** Download store data as a JSON file (timestamped filename)
   - **Clear:** Delete all records from a store (requires confirmation)
   - **Refresh:** Reload store information

3. **Bulk Operations**
   - **Export All:** Download entire database as a single JSON file
   - **Delete Database:** Remove entire database (requires double confirmation)

4. **Safety Features**
   - Only available in development mode (`isDatabaseInspectorEnabled()`)
   - Dangerous operations require explicit confirmation
   - Shows warning if accessed in production builds

**Usage Example:**

```typescript
// In App.tsx or navigation handler
onViewChange('dev'); // Navigate to Database Inspector

// The inspector will:
// 1. Check if development mode is enabled
// 2. Load all store information
// 3. Display interactive UI for database management
```

**File Location:** `src/components/DatabaseInspector.tsx`

**Route:** Added to `AppRouter.tsx` as 'dev' view (development mode only)

### Common Issues

#### Blank Page on Load
- Check browser console for errors
- Verify database adapter initialization
- Check if encryption is enabled but EncryptedPWA not initialized

#### Data Not Persisting
- Check if `userId` is present in records
- Verify adapter is being used (not direct dbService calls)
- Check browser storage quota

#### Migration Not Running
- Check localStorage for migration flags
- Verify database version matches CURRENT_DB_VERSION
- Check console for migration errors

---

## HIPAA Compliance Notes

### Encryption Boundary

**PHI Data Types:**
- `feelingLogs` - Emotional state and reflections
- `sessions` - Reflection sessions
- `assessments` - AI assessments
- `reports` - Counselor reports
- `userInteractions` - User interaction tracking
- `logs` - LogEntry with emotional state
- `goals` - May contain PHI in notes/updates

**Enforcement:**
- `validateEncryptionBoundary()` throws error if PHI operations attempted on unencrypted storage when encryption is enabled
- Applied to both read and write operations
- Prevents accidental PHI leakage

### Audit Logs

**Encrypted Storage:**
- All operations logged via `encryptedDb.auditLog()`
- Stored in `audit_logs_encrypted` table
- Includes operation type, table, record ID, and description

**IndexedDB:**
- No audit logging (non-encrypted storage)
- Should not be used for PHI when encryption is enabled

### Data Retention

- **Feeling Logs:** 12 months retention (pruned automatically)
- **User Interactions:** 12 months retention (pruned automatically)
- **Values:** Retained indefinitely (historical tracking)
- **Goals:** Retained indefinitely (progress tracking)

---

## Performance Considerations

### Dexie Optimizations

1. **Bulk Operations**
   - Use `bulkPut()` instead of individual `put()` calls
   - Use `bulkAdd()` for new records
   - Reduces transaction overhead

2. **Indexed Queries**
   - Compound indexes: `[userId+active]` for efficient filtering
   - Use `.where()` with indexed fields
   - Sort by indexed fields when possible

3. **Transaction Management**
   - Keep transactions short
   - Batch related operations
   - Avoid long-running operations in transactions

### SQLite Optimizations

1. **Prepared Statements**
   - Reuse query templates
   - Use parameterized queries

2. **Batch Operations**
   - Use transactions for multiple operations
   - Commit after batch completes

---

## Testing & Validation

### Manual Testing

1. **Data Persistence**
   - Create data → refresh page → verify data persists
   - Test with encryption enabled and disabled

2. **Migration**
   - Clear database → set version to 7 → open app → verify migration runs
   - Check migration flag in localStorage

3. **Pruning**
   - Create old data (set timestamps to 13 months ago)
   - Run pruning → verify old data removed

### Debugging Commands

```javascript
// Check current adapter
const adapter = getDatabaseAdapter();
console.log('Adapter:', adapter.constructor.name);

// Check encryption status
console.log('Encryption enabled:', isEncryptionEnabled());

// Check database version
import { CURRENT_DB_VERSION } from './services/dexieDB';
console.log('DB Version:', CURRENT_DB_VERSION);

// Run data pruning manually
import { runDataPruning } from './services/dataPruningService';
const result = await runDataPruning();
console.log('Pruning result:', result);

// Access Database Inspector programmatically
// (Only works in development mode)
if (isDatabaseInspectorEnabled()) {
  // Navigate to dev view
  onViewChange('dev');
}
```

---

## Troubleshooting

### Issue: Database won't open

**Symptoms:** App shows blank page or initialization errors

**Solutions:**
1. Check browser console for errors
2. Verify Dexie version compatibility
3. Clear database and reinitialize: `indexedDB.deleteDatabase('groundedDB')`
4. Check if migration is stuck (check localStorage flags)

### Issue: Data not saving

**Symptoms:** Changes lost on refresh

**Solutions:**
1. Verify `userId` is present in records
2. Check if adapter is being used (not direct dbService)
3. Verify `hasLoadedInitialDataRef` flag in DataContext
4. Check browser storage quota

### Issue: Migration not running

**Symptoms:** Old data structure still in use

**Solutions:**
1. Clear migration flags in localStorage
2. Verify database version matches CURRENT_DB_VERSION
3. Check console for migration errors
4. Manually trigger migration by deleting database

### Issue: Encryption boundary errors

**Symptoms:** "SECURITY VIOLATION" errors in console

**Solutions:**
1. Verify encryption is enabled: `localStorage.getItem('encryption_enabled')`
2. Ensure EncryptedPWA is initialized before adapter operations
3. Check that PHI operations use EncryptedAdapter
4. Review `validateEncryptionBoundary()` calls

---

## Best Practices

1. **Always use adapter pattern**
   - Never call `dbService` directly
   - Use `getDatabaseAdapter()` to get adapter instance

2. **Handle errors gracefully**
   - Database operations can fail (quota, permissions)
   - Always wrap in try/catch
   - Provide user feedback on errors

3. **Respect encryption boundaries**
   - PHI data must use EncryptedAdapter when encryption enabled
   - Validation is enforced at operation level

4. **Use bulk operations**
   - Prefer `bulkPut()` over individual `put()` calls
   - Reduces transaction overhead

5. **Monitor storage quota**
   - IndexedDB has size limits
   - Prune old data regularly
   - Handle quota errors gracefully

---

## Developer Tools

### Database Inspector

The Database Inspector is a comprehensive developer tool for inspecting and managing the database during development. It provides a user-friendly interface for:

- **Inspecting Stores:** View all object stores and their record counts
- **Viewing Data:** Browse records from any store in JSON format
- **Exporting Data:** Download individual stores or entire database as JSON
- **Clearing Data:** Remove records from stores (with confirmation)
- **Database Management:** Delete entire database (with double confirmation)

**Access:**
- Only available in development mode
- Navigate to 'dev' view: `onViewChange('dev')`
- Automatically disabled in production builds

**Security:**
- All dangerous operations require explicit confirmation
- Automatically checks `isDatabaseInspectorEnabled()` before rendering
- Shows warning message if accessed in production

**File:** `src/components/DatabaseInspector.tsx`

**Route:** `src/routes/AppRouter.tsx` (dev view, development only)

---

## Hook Usage Examples

The app provides modular hooks that extend `DataContext` for easier data management. All hooks automatically handle persistence and state synchronization.

### Importing Hooks

```typescript
import { 
  usePersistence, 
  useGoals, 
  useValues, 
  useSession, 
  useLogs 
} from '../hooks';
```

### usePersistence Hook

Provides data persistence utilities and loading state management.

**Example: Manual Save Before Navigation**

```typescript
import { usePersistence } from '../hooks';

function MyComponent() {
  const { persist, isHydrating, saveValues } = usePersistence();
  
  // Show loading screen during hydration
  if (isHydrating) {
    return <LoadingScreen />;
  }
  
  const handleNavigation = async () => {
    // Manually save before navigating away
    await persist();
    navigate('/next-page');
  };
  
  // Save only values
  const handleSaveValues = async () => {
    await saveValues();
  };
  
  return (
    <div>
      <button onClick={handleNavigation}>Navigate</button>
      <button onClick={handleSaveValues}>Save Values</button>
    </div>
  );
}
```

**API:**
- `persist()` - Save all data to database
- `isHydrating` - Boolean indicating if data is being loaded
- `saveValues()` - Save only values
- `saveLogs()` - Save only logs
- `saveGoals()` - Save only goals
- `saveSettings()` - Save only settings

---

### useValues Hook

Provides value selection and management utilities.

**Example: Value Selection Component**

```typescript
import { useValues } from '../hooks';

function ValueSelection() {
  const { 
    selectedValueIds, 
    selectedValues,
    isValueSelected,
    selectValues,
    addValue,
    removeValue,
    setPriority 
  } = useValues();
  
  const handleSelectAll = async () => {
    const allValueIds = ALL_VALUES.map(v => v.id);
    await selectValues(allValueIds);
  };
  
  const handleToggleValue = async (valueId: string) => {
    if (isValueSelected(valueId)) {
      await removeValue(valueId);
    } else {
      await addValue(valueId);
    }
  };
  
  const handleReorder = async (valueId: string, newPriority: number) => {
    await setPriority(valueId, newPriority);
  };
  
  return (
    <div>
      <h2>Selected Values ({selectedValueIds.length})</h2>
      {selectedValues.map((value, index) => (
        <div key={value.id}>
          <span>#{index + 1} {value.label}</span>
          <button onClick={() => handleToggleValue(value.id)}>
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
```

**API:**
- `selectedValueIds` - Array of selected value IDs
- `selectedValues` - Array of selected value objects
- `getValue(valueId)` - Get value by ID
- `isValueSelected(valueId)` - Check if value is selected
- `selectValues(valueIds)` - Replace selection with new values
- `addValue(valueId)` - Add value to selection
- `removeValue(valueId)` - Remove value from selection
- `setPriority(valueId, priority)` - Set value priority
- `toggleValue(valueId)` - Toggle value selection

---

### useGoals Hook

Provides goal management with CRUD operations.

**Example: Goals Management Component**

```typescript
import { useGoals } from '../hooks';
import { Goal } from '../types';

function GoalsManager() {
  const {
    goals,
    getActiveGoals,
    getCompletedGoals,
    getGoalsByValue,
    addGoal,
    updateGoal,
    deleteGoal,
    addGoalUpdate
  } = useGoals();
  
  const handleCreateGoal = async () => {
    const newGoal: Omit<Goal, 'id' | 'createdAt'> = {
      userId: 'current-user-id',
      valueId: 'v1',
      text: 'Practice mindfulness daily',
      frequency: 'daily',
      completed: false
    };
    await addGoal(newGoal);
  };
  
  const handleCompleteGoal = async (goalId: string) => {
    await updateGoal(goalId, { completed: true });
  };
  
  const handleAddProgress = async (goalId: string) => {
    await addGoalUpdate(goalId, {
      note: 'Made progress today!',
      progressDelta: 10
    });
  };
  
  const activeGoals = getActiveGoals();
  const valueGoals = getGoalsByValue('v1');
  
  return (
    <div>
      <h2>Active Goals ({activeGoals.length})</h2>
      {activeGoals.map(goal => (
        <div key={goal.id}>
          <p>{goal.text}</p>
          <button onClick={() => handleCompleteGoal(goal.id)}>
            Complete
          </button>
          <button onClick={() => handleAddProgress(goal.id)}>
            Add Progress
          </button>
        </div>
      ))}
    </div>
  );
}
```

**API:**
- `goals` - All goals from DataContext
- `getGoal(goalId)` - Get goal by ID
- `getGoalsByValue(valueId)` - Get goals for a value
- `getActiveGoals()` - Get incomplete goals
- `getCompletedGoals()` - Get completed goals
- `addGoal(goal)` - Create new goal
- `updateGoal(goalId, updates)` - Update goal
- `deleteGoal(goalId)` - Delete goal
- `addGoalUpdate(goalId, update)` - Add progress update

---

### useSession Hook

Provides session management for reflection sessions.

**Example: Session Tracking Component**

```typescript
import { useSession } from '../hooks';
import { useState } from 'react';

function ReflectionSession() {
  const {
    createSession,
    updateSession,
    endSession,
    getSessionsByValue
  } = useSession();
  
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  
  const handleStartSession = async (valueId: string) => {
    const session = await createSession({
      valueId,
      startTimestamp: new Date().toISOString(),
      initialEmotionalState: 'neutral',
      goalCreated: false
    });
    setCurrentSessionId(session.id);
  };
  
  const handleEndSession = async (finalState: string) => {
    if (currentSessionId) {
      await endSession(currentSessionId, finalState);
      setCurrentSessionId(null);
    }
  };
  
  const handleUpdateReflection = async (reflectionLength: number) => {
    if (currentSessionId) {
      await updateSession(currentSessionId, {
        reflectionLength,
        finalEmotionalState: 'reflective'
      });
    }
  };
  
  // Get all sessions for a value
  const loadValueSessions = async (valueId: string) => {
    const sessions = await getSessionsByValue(valueId, 10);
    console.log('Sessions:', sessions);
  };
  
  return (
    <div>
      <button onClick={() => handleStartSession('v1')}>
        Start Session
      </button>
      <button onClick={() => handleEndSession('calm')}>
        End Session
      </button>
    </div>
  );
}
```

**API:**
- `createSession(sessionData)` - Create new session
- `updateSession(sessionId, updates)` - Update session
- `getSession(sessionId)` - Get session by ID
- `getSessions(limit?)` - Get all user sessions
- `getSessionsByValue(valueId, limit?)` - Get sessions for a value
- `endSession(sessionId, finalEmotionalState?)` - End session with timestamp

---

### useLogs Hook

Provides log entry management for feeling logs and log entries.

**Example: Logs Management Component**

```typescript
import { useLogs } from '../hooks';
import { LogEntry } from '../types';

function LogsManager() {
  const {
    logs,
    getLogsByValue,
    getLogsByEmotionalState,
    getRecentLogs,
    addLog,
    updateLog,
    deleteLog,
    clearLogs
  } = useLogs();
  
  const handleAddLog = async () => {
    const newLog: Omit<LogEntry, 'id' | 'date'> = {
      valueId: 'v1',
      note: 'Feeling great today!',
      type: 'reflection',
      livedIt: true
    };
    await addLog(newLog);
  };
  
  const handleUpdateLog = async (logId: string) => {
    await updateLog(logId, {
      note: 'Updated note',
      livedIt: false
    });
  };
  
  // Get logs filtered by various criteria
  const valueLogs = getLogsByValue('v1');
  const lowStateLogs = getLogsByEmotionalState('low');
  const recentLogs = getRecentLogs(10);
  
  return (
    <div>
      <h2>Recent Logs ({recentLogs.length})</h2>
      {recentLogs.map(log => (
        <div key={log.id}>
          <p>{log.note}</p>
          <button onClick={() => handleUpdateLog(log.id)}>
            Update
          </button>
          <button onClick={() => deleteLog(log.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
```

**API:**
- `logs` - All log entries from DataContext
- `getLog(logId)` - Get log by ID
- `getLogsByValue(valueId)` - Get logs for a value
- `getLogsByEmotionalState(state)` - Get logs by emotional state
- `getRecentLogs(limit?)` - Get recent logs (newest first)
- `addLog(entry)` - Create new log entry
- `updateLog(logId, updates)` - Update log entry
- `deleteLog(logId)` - Delete log entry
- `clearLogs()` - Delete all logs

---

### Combining Multiple Hooks

Hooks can be used together in a single component:

```typescript
import { useValues, useGoals, useLogs } from '../hooks';

function Dashboard() {
  const { selectedValues, isValueSelected } = useValues();
  const { getActiveGoals, addGoal } = useGoals();
  const { getRecentLogs, addLog } = useLogs();
  
  // Use all hooks together
  const activeGoals = getActiveGoals();
  const recentLogs = getRecentLogs(5);
  
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Selected Values: {selectedValues.length}</p>
      <p>Active Goals: {activeGoals.length}</p>
      <p>Recent Logs: {recentLogs.length}</p>
    </div>
  );
}
```

### Hook File Locations

All hooks are located in `src/hooks/`:

- `src/hooks/usePersistence.ts` - Persistence utilities
- `src/hooks/useValues.ts` - Value management
- `src/hooks/useGoals.ts` - Goal management
- `src/hooks/useSession.ts` - Session management
- `src/hooks/useLogs.ts` - Log entry management
- `src/hooks/index.ts` - Central export point

**Import Pattern:**
```typescript
// Import from central index
import { usePersistence, useGoals, useValues } from '../hooks';

// Or import directly
import { usePersistence } from '../hooks/usePersistence';
```

---

## Related Documentation

- **HIPAA Policies:** `docs/hipaa-policies.md`
- **Risk Analysis:** `docs/risk-analysis.md`
- **Persistence Diagnostic:** `docs/persistence-diagnostic.md`
- **Testing Guide:** `docs/testing-guide.md` - Comprehensive integration testing procedures

---

## Version Information

**Document Version:** 1.1  
**Last Updated:** 2025-01-06  
**Schema Version:** 8  
**App Version:** 1.13.5  
**Changes:** Added Database Inspector documentation (Phase 8)

