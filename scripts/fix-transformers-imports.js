#!/usr/bin/env node
/**
 * Post-build script to fix corrupted import paths in transformers chunk
 * Replaces corrupted patterns like vendor-!~{007}~.js with actual chunk filenames
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, '..', 'dist');
const assetsDir = path.join(distDir, 'assets');

console.log('🔧 Fixing corrupted import paths in transformers chunk...\n');

if (!fs.existsSync(assetsDir)) {
  console.log('⚠️  assets directory not found. Skipping fix.');
  process.exit(0);
}

// Find all chunk files
const chunkFiles = fs.readdirSync(assetsDir).filter(file => file.endsWith('.js'));

// Build a map of chunk names to filenames
const chunkMap = new Map();
chunkFiles.forEach(file => {
  // Extract chunk name from filename (e.g., vendor-CSiwmspU.js -> vendor)
  const match = file.match(/^([a-z-]+)-[^-]+\.js$/);
  if (match) {
    const chunkName = match[1];
    if (!chunkMap.has(chunkName)) {
      chunkMap.set(chunkName, file);
    }
  }
});

// Find transformers chunk
const transformersFile = chunkFiles.find(file => file.includes('transformers'));
if (!transformersFile) {
  console.log('⚠️  Transformers chunk not found. Skipping fix.');
  process.exit(0);
}

const transformersPath = path.join(assetsDir, transformersFile);
let content = fs.readFileSync(transformersPath, 'utf-8');
let fixed = false;

// Fix corrupted import patterns
// Pattern: vendor-!~{007}~.js or similar corrupted patterns
const corruptedPattern = /from\s+['"]\.\/[^'"]*!~\{[^}]+\}~[^'"]*['"]/g;
const matches = content.match(corruptedPattern);

if (matches) {
  matches.forEach(match => {
    // Determine which chunk this should be based on context
    const vendorFileName = chunkMap.get('vendor');
    if (vendorFileName && match.includes('vendor')) {
      const fixedImport = `from './${vendorFileName}'`;
      content = content.replace(match, fixedImport);
      fixed = true;
      console.log(`✅ Fixed corrupted import: ${match.trim()} → ${fixedImport}`);
    }
  });
}

// Also fix any other corrupted patterns
chunkMap.forEach((fileName, chunkName) => {
  // Pattern: chunkname-!~{hash}~.js
  const pattern = new RegExp(`['"]\\./[^'"]*${chunkName}-!~\\{[^}]+\\}~[^'"]*['"]`, 'g');
  if (pattern.test(content)) {
    content = content.replace(pattern, `'./${fileName}'`);
    fixed = true;
    console.log(`✅ Fixed ${chunkName} import path`);
  }
});

if (fixed) {
  fs.writeFileSync(transformersPath, content, 'utf-8');
  console.log(`\n✅ Fixed transformers chunk: ${transformersFile}`);
} else {
  console.log('✅ No corrupted imports found. Transformers chunk is already correct.');
}

console.log('');

