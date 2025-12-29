# HIPAA Encryption Test Suite

This directory contains comprehensive tests for the HIPAA-compliant encryption implementation.

## Test Files

- **adapter.test.ts** - Tests LegacyAdapter compatibility with all dbService methods
- **conversion-flow.test.ts** - Tests complete migration flow with validation
- **encryption.test.ts** - Tests password-based encryption, unlock, and data persistence
- **functionality.test.ts** - Tests all features work in both legacy and encrypted modes
- **migration.test.ts** - Tests legacy detection, migration flow, backup/restore
- **e2e.test.ts** - Full end-to-end test suite

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test adapter.test.ts
```

## Test Coverage

The test suite covers:

1. **Adapter Compatibility** - All DatabaseAdapter methods work identically
2. **Migration Flow** - Pre-validation → Migration → Post-validation → Data integrity
3. **Encryption** - Password validation, unlock, data persistence
4. **Functionality** - All features work in both legacy and encrypted modes
5. **End-to-End** - Complete flow from legacy to encrypted mode

## Prerequisites

- Node.js 18+
- Jest and ts-jest installed
- Test database setup (handled automatically)

## Notes

- Tests use fake-indexeddb for IndexedDB mocking
- Tests use localStorage mocks for storage operations
- SQLite operations are tested with actual sql.js implementation
- All tests are designed to be run in isolation

