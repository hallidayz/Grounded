/**
 * Post-build script to fix ServiceWorker registration
 * Fixes the registration script to point to the correct ServiceWorker file
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, '..', 'dist');
const registerSWPath = path.join(distDir, 'registerSW.js');

console.log('🔧 Fixing ServiceWorker registration script...\n');

if (!fs.existsSync(registerSWPath)) {
  console.log('⚠️  registerSW.js not found. Skipping fix.');
  process.exit(0);
}

// Read the current registration script
let content = fs.readFileSync(registerSWPath, 'utf8');

// Check if it's already correct
if (content.includes('/manifest.js') && !content.includes('/manifest.json') && !content.includes('/manifest.webmanifest')) {
  console.log('✅ Registration script is already correct.');
  process.exit(0);
}

let fixedContent = content;
let changes = [];

// Fix the registration script to point to manifest.js instead of manifest.webmanifest or manifest.json
// Handle both single and double quotes, and various spacing

// Fix manifest.webmanifest references
const webmanifestPattern = /navigator\.serviceWorker\.register\(['"]\/manifest\.webmanifest['"]/g;
if (webmanifestPattern.test(fixedContent)) {
  fixedContent = fixedContent.replace(webmanifestPattern, "navigator.serviceWorker.register('/manifest.js'");
  changes.push('/manifest.webmanifest → /manifest.js');
}

// Fix manifest.json references (CRITICAL - this is the current issue)
const jsonPattern = /navigator\.serviceWorker\.register\(['"]\/manifest\.json['"]/g;
if (jsonPattern.test(fixedContent)) {
  fixedContent = fixedContent.replace(jsonPattern, "navigator.serviceWorker.register('/manifest.js'");
  changes.push('/manifest.json → /manifest.js');
}

// Also handle minified versions - manifest.webmanifest
const minifiedWebmanifestPattern = /register\(['"]\/manifest\.webmanifest['"]/g;
if (minifiedWebmanifestPattern.test(fixedContent)) {
  fixedContent = fixedContent.replace(minifiedWebmanifestPattern, "register('/manifest.js'");
  if (!changes.includes('/manifest.webmanifest → /manifest.js')) {
    changes.push('/manifest.webmanifest → /manifest.js');
  }
}

// Also handle minified versions - manifest.json
const minifiedJsonPattern = /register\(['"]\/manifest\.json['"]/g;
if (minifiedJsonPattern.test(fixedContent)) {
  fixedContent = fixedContent.replace(minifiedJsonPattern, "register('/manifest.js'");
  if (!changes.includes('/manifest.json → /manifest.js')) {
    changes.push('/manifest.json → /manifest.js');
  }
}

if (content === fixedContent) {
  console.log('⚠️  Could not find pattern to fix. Registration script may already be correct or in a different format.');
  console.log('Current content preview:', content.substring(0, 500));
  process.exit(0);
}

// Write the fixed content
fs.writeFileSync(registerSWPath, fixedContent, 'utf8');
console.log('✅ Fixed ServiceWorker registration script!');
if (changes.length > 0) {
  changes.forEach(change => console.log(`   Changed: ${change}`));
}
console.log('');

