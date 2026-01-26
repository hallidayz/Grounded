# Grounded App - Persistence Diagnostic Report

**Generated**: 2026-01-06  
**App Version**: 1.13.5  
**Database Version**: 8 (groundedDB)

## Executive Summary

The Grounded app currently uses a hybrid persistence approach:
- **Primary Storage**: IndexedDB (raw API, not Dexie) via `DatabaseService`
- **Encrypted Storage**: SQLite via `EncryptedPWA` (for HIPAA compliance)
- **Session Management**: sessionStorage for userId/username
- **Configuration**: localStorage for app settings, flags, and encryption salt

**Key Finding**: No legacy localStorage keys (`groundedAppData`, `groundedUser`, `groundedSession`) were found. The app has already migrated to IndexedDB, but uses raw IndexedDB API instead of Dexie.js (which is installed but unused).

---

## 1. Storage Mechanisms

### 1.1 IndexedDB (Primary Storage)

**Database Name**: `groundedDB`  
**Version**: 8  
**Location**: `src/services/database.ts`  
**API**: Raw IndexedDB API (not using Dexie.js, despite it being installed)

**Object Stores** (12 total):
1. `users` - User accounts (keyPath: `id`)
2. `appData` - User app data (keyPath: `userId`)
3. `values` - Value selections with history (keyPath: `id`, autoIncrement)
4. `goals` - User goals (keyPath: `id`)
5. `feelingLogs` - Emotional state logs (keyPath: `id`)
6. `userInteractions` - User interaction tracking (keyPath: `id`)
7. `sessions` - Reflection sessions (keyPath: `id`)
8. `assessments` - AI assessments (keyPath: `id`)
9. `reports` - Generated reports (keyPath: `id`)
10. `resetTokens` - Password reset tokens (keyPath: `token`)
11. `metadata` - App metadata (keyPath: `id`)
12. `ruleBasedUsageLogs` - Rule-based system logs (keyPath: `id`)

**Indexes**:
- `values`: `userId`, `valueId`, `active`, `createdAt`, `[userId+active]` (compound)
- `goals`: `userId`, `valueId`, `completed`, `createdAt`
- `feelingLogs`: `timestamp`, `emotionalState`, `userId`
- `userInteractions`: `timestamp`, `sessionId`, `type`
- `sessions`: `startTimestamp`, `valueId`, `userId`
- `assessments`: `userId`, `timestamp`
- `reports`: `userId`, `timestamp`
- `resetTokens`: `userId`, `expires`
- `metadata`: `appId`, `platform`
- `ruleBasedUsageLogs`: `timestamp`, `type`

### 1.2 SQLite (Encrypted Storage)

**Database Name**: `grounded_encrypted.db`  
**Location**: `src/services/encryptedPWA.ts`  
**Purpose**: HIPAA-compliant encrypted storage  
**Storage Backend**: OPFS (Origin Private File System) or IndexedDB fallback

**Tables**:
- `users_encrypted`
- `app_data_encrypted`
- `feeling_logs_encrypted`
- `user_interactions_encrypted`
- `sessions_encrypted`
- `assessments_encrypted`
- `reports_encrypted`
- `reset_tokens_encrypted`
- `metadata_encrypted`
- `rule_based_usage_logs_encrypted`

**Missing**: `values_encrypted` table (needs to be added per Phase 2)

### 1.3 localStorage Usage

**93 instances found** across the codebase. Key patterns:

**User Session**:
- `userId` - Current user ID
- `username` - Current username
- `encryption_enabled` - Encryption mode flag

**App Configuration**:
- `theme` - UI theme preference (light/dark)
- `pwa-install-dismissed` - PWA install prompt dismissal
- `migration_prompt_dismissed` - Migration screen dismissal
- `old_db_migration_dismissed` - Old database migration flag

**Encryption**:
- `grounded_encryption_salt` - Encryption salt (critical, must be preserved)

**Migration Flags**:
- `values_goals_migration_complete` - Values/goals table migration
- `legacy_migration_completed` - Legacy data migration
- `legacy_migration_date` - Migration timestamp
- `legacyDataBackup` - Legacy data backup

**AI Model Cache**:
- Model version keys (e.g., `model_version_TinyLlama-1.1B-Chat-v1.0`)
- AI response cache keys

**App Lifecycle**:
- `app_init_started` - Initialization tracking
- `app_init_complete` - Initialization completion
- `selectedValueId` - Dashboard selected value

**Update Management**:
- `app_version` - Current app version
- `install_date` - Installation date
- `last_update` - Last update timestamp

**Email Scheduling**:
- `emailSchedule_{userId}` - Email schedule per user

**Note**: No `groundedAppData`, `groundedUser`, or `groundedSession` keys found. These legacy keys do not exist in the current codebase.

### 1.4 sessionStorage Usage

**30 instances found**. Used for:

**Session Management**:
- `userId` - Current session user ID
- `username` - Current session username

**App Initialization**:
- `app_init_started` - Initialization start flag
- `app_init_started_time` - Initialization start timestamp
- `app_init_complete` - Initialization completion flag

**Purpose**: Temporary session data that should not persist across browser restarts.

---

## 2. Data Flow Architecture

### 2.1 Current Data Flow

```
UI Components
    ↓
DataContext (src/contexts/DataContext.tsx)
    ↓
dbService (src/services/database.ts) [DIRECT CALLS - BYPASSES ADAPTER]
    ↓
IndexedDB (raw API)
```

**Problem**: DataContext calls `dbService` directly, bypassing the `DatabaseAdapter` interface. This breaks the adapter pattern and prevents switching between IndexedDB and SQLite transparently.

### 2.2 Data Loading Flow

```
App.tsx
    ↓
useAppInitialization (src/hooks/useAppInitialization.ts)
    ↓
getDatabaseAdapter() → LegacyAdapter or EncryptedAdapter
    ↓
Loads: appData, values, goals, logs, settings
    ↓
Passes to DataContext via initialData prop
    ↓
DataContext populates state
```

**Issue**: `useAppInitialization` uses adapter, but `DataContext` saves via direct `dbService` calls. This creates inconsistency.

### 2.3 Data Saving Flow

```
User Action (e.g., select values)
    ↓
DataContext.handleSelectionComplete()
    ↓
dbService.setValuesActive() [DIRECT CALL]
    ↓
IndexedDB
```

**Also saves to**:
- `appData.values` (for backward compatibility)
- `values` table (for historical tracking)

---

## 3. Code Paths for Data Persistence

### 3.1 User Data Loading

**Location**: `src/hooks/useAppInitialization.ts` (lines 359-410)

**Flow**:
1. Check if user is logged in (`isLoggedIn()`)
2. Get current user (`getCurrentUser()`)
3. Load app data via adapter: `adapter.getAppData(userId)`
4. Load values: `dbService.getActiveValues(userId)` **[DIRECT CALL - INCONSISTENT]**
5. Load goals: `dbService.getGoals(userId)` **[DIRECT CALL - INCONSISTENT]**
6. Pass to DataContext as `initialData`

### 3.2 User Data Saving

**Location**: `src/contexts/DataContext.tsx` (lines 120-169)

**Flow**:
1. `useEffect` watches for changes to `selectedValueIds`, `logs`, `goals`, `settings`
2. Debounced save (500ms delay)
3. Saves to `appData` via `dbService.saveAppData()` **[DIRECT CALL]**
4. Saves to `values` table via `dbService.setValuesActive()` **[DIRECT CALL]**
5. Saves to `goals` table via `dbService.saveGoal()` **[DIRECT CALL]**

### 3.3 Value Selection

**Location**: `src/contexts/DataContext.tsx` (lines 196-207)

**Flow**:
1. User confirms value selection
2. `handleSelectionComplete(ids)` called
3. Updates local state: `setSelectedValueIds(ids)`
4. Saves via `dbService.setValuesActive(userId, ids)` **[DIRECT CALL]**

### 3.4 Goal Management

**Location**: `src/contexts/DataContext.tsx` (lines 175-187)

**Flow**:
1. `handleUpdateGoals(updatedGoals)` updates local state
2. Individual saves in `useEffect` (lines 154-158) via `dbService.saveGoal()` **[DIRECT CALL]**

---

## 4. Database Adapter Pattern

### 4.1 Current Implementation

**Location**: `src/services/databaseAdapter.ts`

**Adapters**:
- `LegacyAdapter` - Wraps `DatabaseService` (IndexedDB)
- `EncryptedAdapter` - Uses `EncryptedPWA` (SQLite)

**Problem**: `DataContext` does not use the adapter pattern. It calls `dbService` directly, breaking the abstraction.

### 4.2 Missing Methods in Interface

The `DatabaseAdapter` interface is missing:
- `getActiveValues(userId: string): Promise<string[]>`
- `setValuesActive(userId: string, valueIds: string[]): Promise<void>`
- `saveValue(userId: string, valueId: string, active: boolean, priority?: number): Promise<void>`
- `saveGoal(goal: Goal): Promise<void>`
- `getGoals(userId: string): Promise<Goal[]>`
- `deleteGoal(goalId: string): Promise<void>`

These methods exist in `DatabaseService` but are not exposed via the adapter interface.

---

## 5. Version Management

### 5.1 Current State

- **App Version**: 1.13.5 (from `package.json`)
- **Database Version**: 8 (hardcoded in `DatabaseService.dbVersion`)
- **No Version Constant**: Version is not exported or centralized

### 5.2 Metadata Store

**Location**: `src/services/database.ts` (metadata object store)

**Current Issues**:
- `platform` field hardcoded as `"pwa"` (should use `detectPlatform()`)
- `version` field hardcoded as `"1.0.0"` (should use `import.meta.env.VITE_APP_VERSION` or `package.json.version`)

---

## 6. Migration Status

### 6.1 Completed Migrations

- ✅ Old database name migration (`com.acminds.grounded.therapy.db` → `groundedDB`)
- ✅ Values/goals table migration (from `appData` to dedicated tables)
- ✅ Legacy data backup system in place

### 6.2 Pending Migrations

- ❌ localStorage → IndexedDB (no legacy keys found, but should validate)
- ❌ Raw IndexedDB → Dexie.js (Dexie installed but unused)
- ❌ DataContext → Adapter pattern (direct `dbService` calls need to be replaced)

---

## 7. Data Persistence Gaps

### 7.1 Identified Issues

1. **Inconsistent Data Access**: `useAppInitialization` uses adapter, but `DataContext` uses direct `dbService` calls
2. **Missing Adapter Methods**: Values/goals methods not in `DatabaseAdapter` interface
3. **No Loading States**: No `isLoading` or `isHydrated` flags to prevent UI flicker
4. **No Exit Persistence**: No `beforeunload` handler to save unsaved data
5. **Version Management**: No centralized version constant
6. **Metadata Incorrect**: Platform and version fields are hardcoded

### 7.2 Data Loss Risks

- **Race Conditions**: DataContext may save empty arrays before initialization completes
- **No Backup Strategy**: No automatic backup before migrations
- **No Rollback**: No rollback mechanism if migration fails

---

## 8. Recommendations

### 8.1 Immediate Actions

1. **Phase 0**: Create localStorage migration detection (even if no keys found, validate)
2. **Phase 1**: Implement Dexie.js to replace raw IndexedDB API
3. **Phase 3**: Add missing methods to `DatabaseAdapter` interface
4. **Phase 4**: Update `DataContext` to use adapter pattern exclusively

### 8.2 Best Practices to Implement

1. **Version Management**: Export `CURRENT_DB_VERSION` constant
2. **Loading States**: Add `isLoading` and `isHydrated` to DataContext
3. **Exit Persistence**: Add `beforeunload` handler
4. **Error Handling**: Comprehensive error handling for all database operations
5. **Data Validation**: Validate data integrity after migrations

---

## 9. File Locations

### 9.1 Core Persistence Files

- `src/services/database.ts` - Raw IndexedDB service (1703 lines)
- `src/services/databaseAdapter.ts` - Adapter pattern implementation (987 lines)
- `src/services/encryptedPWA.ts` - SQLite encrypted storage (784 lines)
- `src/contexts/DataContext.tsx` - Centralized state management (238 lines)
- `src/hooks/useAppInitialization.ts` - App initialization logic (558 lines)

### 9.2 Storage Utilities

- `src/services/storage.ts` - localStorage/sessionStorage abstraction
- `src/services/authService.ts` - Authentication and user management
- `src/services/migrationService.ts` - Migration utilities
- `src/services/legacyDetection.ts` - Legacy data detection

---

## 10. Testing Checklist

- [ ] Verify all localStorage keys are documented
- [ ] Verify IndexedDB schema matches documentation
- [ ] Test data loading on app boot
- [ ] Test data saving on user actions
- [ ] Test migration from v7 → v8
- [ ] Test both IndexedDB and SQLite paths
- [ ] Verify no data loss during migrations
- [ ] Test exit persistence (beforeunload)
- [ ] Verify loading states prevent UI flicker

---

## Conclusion

The Grounded app has a solid foundation with IndexedDB and SQLite storage, but needs:
1. Migration to Dexie.js for better performance
2. Consistent use of adapter pattern throughout
3. Loading states and exit persistence for better UX
4. Centralized version management
5. Modular hooks extending DataContext

The diagnostic confirms that no legacy localStorage keys exist, so Phase 0.2 (localStorage migration) should focus on validation and detection rather than actual migration.

