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
// The corrupted pattern appears as: from './vendor-!~{007}~.js'
console.log('🔍 Searching for corrupted import patterns...\n');
console.log(`📄 Checking file: ${transformersFile}`);
console.log(`📦 Found ${chunkMap.size} chunk types: ${Array.from(chunkMap.keys()).join(', ')}\n`);

// Debug: Check if corrupted pattern exists at all
const debugPattern = /!~\{[^}]+\}~/;
if (debugPattern.test(content)) {
  console.log('⚠️  Found corrupted pattern marker (!~{...}~) in file');
  // Show a sample of where it appears
  const sampleMatch = content.match(/from\s*['"]\.\/[^'"]*!~\{[^}]+\}~[^'"]*['"]/);
  if (sampleMatch) {
    console.log(`   Sample match: ${sampleMatch[0].substring(0, 80)}...`);
  }
} else {
  console.log('✅ No corrupted pattern markers found');
}
console.log('');

// First, try to find and fix all corrupted patterns using a more comprehensive approach
chunkMap.forEach((fileName, chunkName) => {
  // Pattern 1: from './chunkname-!~{hash}~.js' (with space and single quote)
  const pattern1 = new RegExp(`from\\s+['"]\\./${chunkName}-!~\\{[^}]+\\}~[^'"]*\\.js['"]`, 'g');
  // Pattern 2: from'./chunkname-!~{hash}~.js' (minified, no space)
  const pattern2 = new RegExp(`from['"]\\./${chunkName}-!~\\{[^}]+\\}~[^'"]*\\.js['"]`, 'g');
  // Pattern 3: from "./chunkname-!~{hash}~.js" (with double quote)
  const pattern3 = new RegExp(`from\\s+["']\\./${chunkName}-!~\\{[^}]+\\}~[^"']*\\.js["']`, 'g');
  // Pattern 4: More flexible - any from statement with corrupted path
  const pattern4 = new RegExp(`from\\s*['"]\\./${chunkName}-!~\\{[^}]+\\}~[^'"]*\\.js['"]`, 'g');
  
  const patterns = [
    { regex: pattern1, name: 'pattern1 (space + single quote)' },
    { regex: pattern2, name: 'pattern2 (minified)' },
    { regex: pattern3, name: 'pattern3 (double quote)' },
    { regex: pattern4, name: 'pattern4 (flexible)' }
  ];
  
  patterns.forEach(({ regex, name }) => {
    // Use matchAll for better matching
    const matches = [...content.matchAll(regex)];
    if (matches.length > 0) {
      matches.forEach(match => {
        const fullMatch = match[0];
        // Determine if original had spaces
        const hasSpaces = fullMatch.includes(' from ');
        const quoteChar = fullMatch.match(/['"]/)?.[0] || "'";
        const fixedImport = hasSpaces 
          ? `from ${quoteChar}./${fileName}${quoteChar}`
          : `from${quoteChar}./${fileName}${quoteChar}`;
        content = content.replace(fullMatch, fixedImport);
        fixed = true;
        console.log(`✅ Fixed corrupted import (${name}): ${fullMatch.trim()} → ${fixedImport}`);
      });
    }
  });
});

// Also search for any remaining corrupted patterns more broadly
// This catches any pattern we might have missed
const broadPattern = /from\s*['"]\.\/[^'"]*!~\{[^}]+\}~[^'"]*\.js['"]/g;
const allMatches = [...content.matchAll(broadPattern)];
if (allMatches.length > 0) {
  console.log(`🔍 Found ${allMatches.length} corrupted import(s) via broad search\n`);
  allMatches.forEach(match => {
    const fullMatch = match[0];
    // Extract chunk name from corrupted path (e.g., vendor-!~{007}~.js -> vendor)
    const chunkNameMatch = fullMatch.match(/([a-z-]+)-!~/);
    if (chunkNameMatch) {
      const chunkName = chunkNameMatch[1];
      const correctFileName = chunkMap.get(chunkName);
      if (correctFileName) {
        const hasSpaces = fullMatch.includes(' from ');
        const quoteChar = fullMatch.match(/['"]/)?.[0] || "'";
        const fixedImport = hasSpaces 
          ? `from ${quoteChar}./${correctFileName}${quoteChar}`
          : `from${quoteChar}./${correctFileName}${quoteChar}`;
        content = content.replace(fullMatch, fixedImport);
        fixed = true;
        console.log(`✅ Fixed corrupted import (broad search): ${fullMatch.trim()} → ${fixedImport}`);
      } else {
        console.log(`⚠️  Found corrupted import but couldn't resolve chunk name "${chunkName}": ${fullMatch.trim()}`);
        console.log(`   Available chunks: ${Array.from(chunkMap.keys()).join(', ')}`);
      }
    } else {
      console.log(`⚠️  Found corrupted import but couldn't extract chunk name: ${fullMatch.trim()}`);
    }
  });
}

if (fixed) {
  fs.writeFileSync(transformersPath, content, 'utf-8');
  console.log(`\n✅ Fixed transformers chunk: ${transformersFile}`);
} else {
  console.log('✅ No corrupted imports found. Transformers chunk is already correct.');
}

console.log('');

