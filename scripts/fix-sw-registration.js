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
if (content.includes('/manifest.js')) {
  console.log('✅ Registration script is already correct.');
  process.exit(0);
}

// Fix the registration script to point to manifest.js instead of manifest.webmanifest
// Handle both single and double quotes, and various spacing
let fixedContent = content.replace(
  /navigator\.serviceWorker\.register\(['"]\/manifest\.webmanifest['"]/g,
  "navigator.serviceWorker.register('/manifest.js'"
);

// Also handle minified versions
fixedContent = fixedContent.replace(
  /register\(['"]\/manifest\.webmanifest['"]/g,
  "register('/manifest.js'"
);

if (content === fixedContent) {
  console.log('⚠️  Could not find pattern to fix. Registration script may already be correct or in a different format.');
  console.log('Current content:', content);
  process.exit(0);
}

// Write the fixed content
fs.writeFileSync(registerSWPath, fixedContent, 'utf8');
console.log('✅ Fixed ServiceWorker registration script!');
console.log('   Changed: /manifest.webmanifest → /manifest.js\n');

