/**
 * Runtime Test Script
 * Tests critical app functionality without requiring full test suite
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🧪 Running Runtime Tests...\n');

const tests = [];
let passed = 0;
let failed = 0;

function test(name, fn) {
  tests.push({ name, fn });
}

function runTests() {
  console.log(`Running ${tests.length} tests...\n`);
  
  tests.forEach(({ name, fn }, index) => {
    try {
      const result = fn();
      if (result === true || result === undefined) {
        console.log(`✅ [${index + 1}/${tests.length}] ${name}`);
        passed++;
      } else {
        console.log(`❌ [${index + 1}/${tests.length}] ${name}: ${result}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ [${index + 1}/${tests.length}] ${name}: ${error.message}`);
      failed++;
    }
  });
  
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

// Test 1: Check if build output exists
test('Build output directory exists', () => {
  const distPath = path.join(rootDir, 'dist');
  return fs.existsSync(distPath);
});

// Test 2: Check if index.html exists
test('index.html exists in dist', () => {
  const indexPath = path.join(rootDir, 'dist', 'index.html');
  return fs.existsSync(indexPath);
});

// Test 3: Check if vercel.json is valid
test('vercel.json is valid JSON', () => {
  const vercelPath = path.join(rootDir, 'vercel.json');
  if (!fs.existsSync(vercelPath)) {
    return 'vercel.json not found';
  }
  try {
    const content = fs.readFileSync(vercelPath, 'utf8');
    JSON.parse(content);
    return true;
  } catch (error) {
    return `Invalid JSON: ${error.message}`;
  }
});

// Test 4: Check if COOP/COEP headers are configured
test('COOP/COEP headers configured in vercel.json', () => {
  const vercelPath = path.join(rootDir, 'vercel.json');
  if (!fs.existsSync(vercelPath)) {
    return 'vercel.json not found';
  }
  try {
    const content = fs.readFileSync(vercelPath, 'utf8');
    const config = JSON.parse(content);
    const headers = config.headers || [];
    const hasCOOP = headers.some(h => 
      h.headers?.some(header => 
        header.key === 'Cross-Origin-Opener-Policy' && 
        header.value === 'same-origin'
      )
    );
    const hasCOEP = headers.some(h => 
      h.headers?.some(header => 
        header.key === 'Cross-Origin-Embedder-Policy' && 
        header.value === 'require-corp'
      )
    );
    if (hasCOOP && hasCOEP) {
      return true;
    }
    return `Missing headers: COOP=${hasCOOP}, COEP=${hasCOEP}`;
  } catch (error) {
    return `Error reading vercel.json: ${error.message}`;
  }
});

// Test 5: Check if package.json has required scripts
test('package.json has required build scripts', () => {
  const packagePath = path.join(rootDir, 'package.json');
  if (!fs.existsSync(packagePath)) {
    return 'package.json not found';
  }
  try {
    const content = fs.readFileSync(packagePath, 'utf8');
    const pkg = JSON.parse(content);
    const scripts = pkg.scripts || {};
    const required = ['build', 'build:pwa', 'build:android'];
    const missing = required.filter(s => !scripts[s]);
    if (missing.length === 0) {
      return true;
    }
    return `Missing scripts: ${missing.join(', ')}`;
  } catch (error) {
    return `Error reading package.json: ${error.message}`;
  }
});

// Test 6: Check if capacitor.config.ts exists
test('capacitor.config.ts exists', () => {
  const capacitorPath = path.join(rootDir, 'capacitor.config.ts');
  return fs.existsSync(capacitorPath);
});

// Test 7: Check if key source files exist
test('Key source files exist', () => {
  const srcPath = path.join(rootDir, 'src');
  const keyFiles = [
    'App.tsx',
    'AppContent.tsx',
    'services/authStore.ts',
    'services/ai/browserCompatibility.ts',
    'contexts/AuthContext.tsx',
    'contexts/DataContext.tsx'
  ];
  const missing = keyFiles.filter(file => {
    const filePath = path.join(srcPath, file);
    return !fs.existsSync(filePath);
  });
  if (missing.length === 0) {
    return true;
  }
  return `Missing files: ${missing.join(', ')}`;
});

// Test 8: Check if dist has assets
test('dist directory has assets', () => {
  const distPath = path.join(rootDir, 'dist');
  if (!fs.existsSync(distPath)) {
    return 'dist directory not found';
  }
  const assetsPath = path.join(distPath, 'assets');
  if (fs.existsSync(assetsPath)) {
    const files = fs.readdirSync(assetsPath);
    if (files.length > 0) {
      return true;
    }
    return 'assets directory is empty';
  }
  return 'assets directory not found';
});

// Run all tests
runTests();
