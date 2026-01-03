/**
 * Jest Configuration for HIPAA Encryption Tests
 */

export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/tests/**/*.test.ts?(x)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  collectCoverageFrom: [
    'services/**/*.ts',
    'components/**/*.tsx',
    'hooks/**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  maxWorkers: '50%',
  coverageDirectory: './coverage',
  verbose: false,
};
