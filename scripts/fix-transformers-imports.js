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

// Find transformers chunk - also check all JS files for corrupted imports
const transformersFile = chunkFiles.find(file => file.includes('transformers'));
if (!transformersFile) {
  console.log('⚠️  Transformers chunk not found. Skipping fix.');
  process.exit(0);
}

// Check ALL JS files for corrupted imports, not just transformers
const filesToCheck = chunkFiles.filter(file => file.endsWith('.js'));
console.log(`📋 Checking ${filesToCheck.length} JavaScript files for corrupted imports...\n`);

let totalFixed = 0;

// Process each file
filesToCheck.forEach(file => {
  const filePath = path.join(assetsDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  let fileFixed = false;
  
  console.log(`📄 Checking: ${file}`);
  
  // Debug: Check if corrupted pattern exists at all - USE MULTIPLE PATTERNS
  const debugPattern1 = /!~\{[^}]+\}~/;
  const debugPattern2 = /vendor-!~/;
  const hasCorruption = debugPattern1.test(content) || debugPattern2.test(content);
  
  if (hasCorruption) {
    console.log(`   ⚠️  Found corrupted pattern marker in ${file}`);
    // Show a sample of where it appears - try multiple patterns
    let sampleMatches = content.match(/from\s*['"]\.\/[^'"]*!~\{[^}]+\}~[^'"]*['"]/g);
    if (!sampleMatches || sampleMatches.length === 0) {
      // Try without the 'from' requirement
      sampleMatches = content.match(/['"]\.\/[^'"]*!~\{[^}]+\}~[^'"]*['"]/g);
    }
    if (!sampleMatches || sampleMatches.length === 0) {
      // Try even simpler - just find the corruption marker with context
      const contextMatches = content.match(/.{0,50}!~\{[^}]+\}~.{0,50}/g);
      if (contextMatches) {
        console.log(`   Found corruption markers with context:`);
        contextMatches.slice(0, 3).forEach((match, idx) => {
          console.log(`     ${idx + 1}. ...${match}...`);
        });
      }
    } else {
      console.log(`   Found ${sampleMatches.length} corrupted import(s):`);
      sampleMatches.slice(0, 3).forEach((match, idx) => {
        console.log(`     ${idx + 1}. ${match.substring(0, 100)}${match.length > 100 ? '...' : ''}`);
      });
    }
  }

  // First, try to find and fix all corrupted patterns using a more comprehensive approach
  chunkMap.forEach((fileName, chunkName) => {
  // Pattern 1: from './chunkname-!~{hash}~.js' (with space and single quote) - EXACT MATCH
  const pattern1 = new RegExp(`from\\s+['"]\\./${chunkName}-!~\\{[^}]+\\}~\\.js['"]`, 'g');
  // Pattern 2: from'./chunkname-!~{hash}~.js' (minified, no space)
  const pattern2 = new RegExp(`from['"]\\./${chunkName}-!~\\{[^}]+\\}~\\.js['"]`, 'g');
  // Pattern 3: from "./chunkname-!~{hash}~.js" (with double quote)
  const pattern3 = new RegExp(`from\\s+["']\\./${chunkName}-!~\\{[^}]+\\}~\\.js["']`, 'g');
  // Pattern 4: More flexible - any from statement with corrupted path (allows extra chars)
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
        // Use split/join to replace ALL instances, not just first
        content = content.split(fullMatch).join(fixedImport);
        fileFixed = true;
        console.log(`   ✅ Fixed corrupted import (${name}): ${fullMatch.trim()} → ${fixedImport}`);
      });
    }
  });
});

  // Also search for any remaining corrupted patterns more broadly
  // This catches any pattern we might have missed - USE SIMPLER PATTERN
  const broadPattern = /from\s*['"]\.\/[^'"]*!~\{[^}]+\}~[^'"]*\.js['"]/g;
  let allMatches = [...content.matchAll(broadPattern)];
  
  // If no matches, try even simpler pattern - just look for the corruption marker
  if (allMatches.length === 0 && hasCorruption) {
    console.log(`   🔍 Trying alternative pattern matching...`);
    // Try matching just the corrupted filename part - be VERY flexible
    const altPatterns = [
      /(['"]\.\/[^'"]*)([a-z-]+)-!~\{[^}]+\}~\.js(['"])/g,  // Standard
      /(from\s*['"]\.\/[^'"]*)([a-z-]+)-!~\{[^}]+\}~\.js(['"])/g,  // With 'from'
      /([a-z-]+)-!~\{[^}]+\}~\.js/g,  // Just the filename part
    ];
    
    for (const altPattern of altPatterns) {
      allMatches = [...content.matchAll(altPattern)];
      if (allMatches.length > 0) {
        console.log(`   Found ${allMatches.length} match(es) with alternative pattern`);
        break;
      }
    }
    
    // Last resort: direct string replacement if we find the pattern
    if (allMatches.length === 0) {
      // Try to find and replace using string search
      chunkMap.forEach((fileName, chunkName) => {
        const searchStr = `${chunkName}-!~{`;
        if (content.includes(searchStr)) {
          console.log(`   🔧 Found corruption via string search for ${chunkName}`);
          // Find the full corrupted path
          const regex = new RegExp(`${chunkName}-!~\\{[^}]+\\}~\\.js`, 'g');
          const matches = content.match(regex);
          if (matches) {
            matches.forEach(corruptedPath => {
              const quoteMatch = content.match(new RegExp(`(['"])\\./${corruptedPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\1`));
              if (quoteMatch) {
                const fullPath = quoteMatch[0];
                const quoteChar = quoteMatch[1];
                const fixedPath = `${quoteChar}./${fileName}${quoteChar}`;
                content = content.replace(fullPath, fixedPath);
                fileFixed = true;
                console.log(`   ✅ Fixed via string search: ${fullPath} → ${fixedPath}`);
              }
            });
          }
        }
      });
    }
  }
  
  if (allMatches.length > 0) {
    console.log(`   🔍 Found ${allMatches.length} corrupted import(s) via broad search`);
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
          // Use replace with string replacement to ensure we get all instances
          content = content.split(fullMatch).join(fixedImport);
          fileFixed = true;
          console.log(`   ✅ Fixed corrupted import (broad search): ${fullMatch.trim()} → ${fixedImport}`);
        } else {
          console.log(`   ⚠️  Found corrupted import but couldn't resolve chunk name "${chunkName}": ${fullMatch.trim()}`);
          console.log(`      Available chunks: ${Array.from(chunkMap.keys()).join(', ')}`);
        }
      } else {
        console.log(`   ⚠️  Found corrupted import but couldn't extract chunk name: ${fullMatch.trim()}`);
      }
    });
  }

  // FINAL FALLBACK: If we detected corruption but didn't fix it, try brute force replacement
  if (!fileFixed && hasCorruption) {
    console.log(`   🔧 Attempting brute force fix...`);
    chunkMap.forEach((fileName, chunkName) => {
      // Try to find ANY occurrence of the corrupted pattern and replace it
      const corruptedPattern = new RegExp(`${chunkName}-!~\\{[^}]+\\}~\\.js`, 'g');
      if (corruptedPattern.test(content)) {
        // Replace all occurrences of the corrupted filename with the correct one
        content = content.replace(corruptedPattern, fileName);
        fileFixed = true;
        console.log(`   ✅ Fixed via brute force: replaced ${chunkName}-!~{...}~.js with ${fileName}`);
      }
    });
  }

  if (fileFixed) {
    fs.writeFileSync(filePath, content, 'utf-8');
    totalFixed++;
    console.log(`   ✅ Fixed ${file}\n`);
  } else if (hasCorruption) {
    console.log(`   ⚠️  Found corruption markers but couldn't fix ${file}\n`);
    console.log(`   ⚠️  This file may need manual inspection!\n`);
  } else {
    console.log(`   ✅ No corrupted imports in ${file}\n`);
  }
});

if (totalFixed > 0) {
  console.log(`\n✅ Fixed corrupted imports in ${totalFixed} file(s)`);
} else {
  console.log('\n✅ No corrupted imports found in any files.');
}

console.log('');

