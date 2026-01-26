# Privacy-First Guarantee

## Overview

**Grounded is a privacy-first application. ALL databases and user data remain on-device. NO data is ever sent to external servers or cloud services.**

## On-Device Storage

### Primary Database: `groundedDB` (IndexedDB)
- **Location**: Browser's local IndexedDB storage
- **Contents**: All user data, accounts, logs, values, goals, sessions, assessments, reports
- **Access**: Local-only, never transmitted
- **Encryption**: Optional AES-GCM encryption (keys derived from user password, never stored)

### Storage Locations (All On-Device)

1. **IndexedDB: `groundedDB`**
   - User accounts (`users` table)
   - App data (`appData` table)
   - Value selections (`values` table)
   - Goals (`goals` table)
   - Feeling logs (`feelingLogs` table) - PHI data
   - Sessions (`sessions` table) - PHI data
   - Assessments (`assessments` table) - PHI data
   - Reports (`reports` table) - PHI data
   - User interactions (`userInteractions` table)
   - Reset tokens (`resetTokens` table)
   - Metadata (`metadata` table)
   - Rule-based usage logs (`ruleBasedUsageLogs` table)

2. **localStorage**
   - App settings (theme, preferences)
   - Encryption salt (for encrypted mode)
   - Session markers (userId, username)
   - User backups (safety net for recovery)
   - Migration flags

3. **sessionStorage**
   - Current session data
   - Encryption password (in-memory only, cleared on logout)
   - Temporary UI state

## What Never Leaves Your Device

✅ **User accounts** - Stored locally in IndexedDB
✅ **Passwords** - Hashed and stored locally (never transmitted)
✅ **Selected values** - Stored locally in IndexedDB
✅ **Feeling logs** - Stored locally in IndexedDB (PHI data)
✅ **Sessions** - Stored locally in IndexedDB (PHI data)
✅ **Assessments** - Stored locally in IndexedDB (PHI data)
✅ **Reports** - Stored locally in IndexedDB (PHI data)
✅ **Goals** - Stored locally in IndexedDB
✅ **Settings** - Stored locally in localStorage
✅ **Encryption keys** - Derived from passwords, never stored or transmitted

## What Is Downloaded (Not User Data)

⚠️ **AI Models** - Downloaded from HuggingFace (public models, not user data)
- Models are public, open-source transformer models
- No user data is included in model downloads
- Models are cached locally in IndexedDB after first download
- Models run entirely on-device - no data sent to HuggingFace

## Disabled Features

### Cloud Sync (DISABLED)
- **Status**: Permanently disabled
- **Reason**: Privacy-first architecture
- **Functions**: `syncToCloud()`, `restoreFromCloud()`, `startAutoSync()` are all no-ops
- **Result**: No data is ever uploaded to external servers

### External Analytics (NONE)
- No Google Analytics
- No Mixpanel
- No Amplitude
- No telemetry
- No usage tracking that sends data externally

## Optional Features (User-Controlled)

### Ntfy Notifications (OPTIONAL)
- **Status**: Optional, user-controlled
- **What is sent**: Only notification text (e.g., "Reminder: Check in with your values")
- **What is NOT sent**: No user data, no PHI, no database content
- **Privacy**: Topics are private by default, users should use random topic names
- **Default**: Disabled unless user explicitly enables it

## Encryption

When encryption is enabled:
- **Algorithm**: AES-256-GCM (FIPS 140-2 compliant)
- **Key Derivation**: PBKDF2 with 100,000 iterations
- **Key Storage**: Keys are derived from user password, never stored
- **Encryption Location**: On-device, before storing in IndexedDB
- **Decryption Location**: On-device, after reading from IndexedDB

## Data Export/Import

- **Export**: Creates local JSON file (stays on-device)
- **Import**: Reads from local JSON file (stays on-device)
- **Purpose**: Local backup/restore, cross-browser portability
- **No Transmission**: Export/import never sends data to external servers

## Password Reset

- **Method**: Local token generation
- **Transmission**: None - reset link is generated locally
- **Email**: No email is sent (privacy-first)
- **Token Storage**: Stored locally in IndexedDB
- **Reset Link**: Local URL with token (e.g., `app://reset/token123`)

## Verification

To verify privacy:
1. Open browser DevTools → Network tab
2. Use the app normally
3. Check network requests - you should see:
   - ✅ AI model downloads (first time only, from HuggingFace)
   - ✅ No POST requests with user data
   - ✅ No cloud sync requests
   - ✅ No analytics requests

## Code Guarantees

All database operations are explicitly marked with privacy comments:
- `src/services/dexieDB.ts` - "PRIVACY-FIRST: All data remains on-device"
- `src/services/authStore.ts` - "PRIVACY-FIRST: All user accounts stored locally"
- `src/services/databaseAdapter.ts` - "PRIVACY-FIRST: All database operations are local-only"

Cloud sync functions are disabled:
- `syncToCloud()` - Returns immediately, no-op
- `restoreFromCloud()` - Returns false, no-op
- `startAutoSync()` - Logs message, no-op
- `SYNC_ENABLED` - Always false

## Summary

**100% of user data remains on-device.**
- All databases are local (IndexedDB)
- All operations are local-only
- No cloud sync or external transmission
- Encryption is optional and handled locally
- AI models run entirely on-device
- No analytics or telemetry

This is a true privacy-first application.
