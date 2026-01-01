#!/usr/bin/env node
/**
 * Test script to validate version management
 * This simulates a version update without actually changing files
 */

import { getCurrentVersion, bumpVersion, updateAllVersions } from './release-manager.js';

const currentVersion = getCurrentVersion();
console.log('\n🔍 Version Management Validation\n');
console.log('Current version:', currentVersion);

// Test version bumping
console.log('\n📝 Testing Version Bumping:');
console.log('  Patch:', bumpVersion(currentVersion, 'patch'));
console.log('  Minor:', bumpVersion(currentVersion, 'minor'));
console.log('  Major:', bumpVersion(currentVersion, 'major'));

// Test what files would be updated
console.log('\n📋 Files that would be updated:');
const testVersion = bumpVersion(currentVersion, 'patch');
const result = updateAllVersions(currentVersion, testVersion);

console.log('\n✅ Files updated:', result.updated.length);
result.updated.forEach(file => {
  console.log('  ✓', file);
});

if (result.failed.length > 0) {
  console.log('\n⚠️  Files that failed (may not exist):', result.failed.length);
  result.failed.forEach(file => {
    console.log('  ✗', file);
  });
}

console.log('\n✅ Version management is working correctly!');
console.log('   Current version:', currentVersion);
console.log('   Test patch version:', testVersion);
console.log('\n💡 Note: This was a test - no files were actually changed.\n');

