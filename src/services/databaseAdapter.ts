/**
 * Database Adapter Pattern
 * 
 * @deprecated This file is deprecated. Use the new adapter structure:
 * - Import types from: `src/services/adapters/types.ts`
 * - Import adapter from: `src/services/adapters/index.ts`
 * - Import LegacyAdapter from: `src/services/adapters/LegacyAdapter.ts`
 * 
 * This file is kept for backward compatibility and will be removed in a future version.
 * 
 * PRIVACY-FIRST: All database operations are local-only.
 * NO data is ever sent to external servers or cloud services.
 */

// Re-export from new adapter structure for backward compatibility
export { 
  getDatabaseAdapter, 
  isEncryptionEnabled,
  type DatabaseAdapter,
  type UserData,
  type AppData
} from './adapters';

// Re-export LegacyAdapter for backward compatibility
export { LegacyAdapter } from './adapters/LegacyAdapter';

