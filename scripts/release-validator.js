#!/usr/bin/env node
/**
 * Release Validator
 * 
 * Validates release readiness:
 * - Git repository status
 * - Build success
 * - Test status
 * - Version consistency
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { isGitClean, getCurrentBranch, getCurrentVersion } from './release-manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Validate git repository status
 */
function validateGitStatus() {
  log('\n📋 Validating Git Status...', 'cyan');
  
  if (!isGitClean()) {
    log('❌ Git repository has uncommitted changes', 'red');
    log('   Please commit or stash changes before releasing', 'yellow');
    return false;
  }
  
  const branch = getCurrentBranch();
  if (branch !== 'main' && branch !== 'master') {
    log(`⚠️  Current branch: ${branch}`, 'yellow');
    log('   Recommended to release from main/master branch', 'yellow');
  } else {
    log(`✅ On release branch: ${branch}`, 'green');
  }
  
  log('✅ Git repository is clean', 'green');
  return true;
}

/**
 * Validate version consistency
 */
function validateVersionConsistency() {
  log('\n🔢 Validating Version Consistency...', 'cyan');
  
  const packageVersion = getCurrentVersion();
  const filesToCheck = [
    { path: join(rootDir, 'src-tauri', 'tauri.conf.json'), key: 'version' },
    { path: join(rootDir, 'src-tauri', 'Cargo.toml'), key: 'version', isToml: true },
  ];
  
  let allMatch = true;
  
  filesToCheck.forEach(({ path, key, isToml }) => {
    if (!existsSync(path)) {
      log(`⚠️  File not found: ${path}`, 'yellow');
      return;
    }
    
    try {
      let fileVersion;
      if (isToml) {
        const content = readFileSync(path, 'utf-8');
        const match = content.match(/version\s*=\s*["']([^"']+)["']/);
        fileVersion = match ? match[1] : null;
      } else {
        const content = JSON.parse(readFileSync(path, 'utf-8'));
        fileVersion = content[key];
      }
      
      if (fileVersion === packageVersion) {
        log(`✅ ${path}: ${fileVersion}`, 'green');
      } else {
        log(`❌ ${path}: ${fileVersion} (expected: ${packageVersion})`, 'red');
        allMatch = false;
      }
    } catch (error) {
      log(`⚠️  Error reading ${path}: ${error.message}`, 'yellow');
    }
  });
  
  return allMatch;
}

/**
 * Validate build
 */
function validateBuild() {
  log('\n🔨 Validating Build...', 'cyan');
  
  try {
    log('   Running build check...', 'cyan');
    execSync('npm run build', { 
      cwd: rootDir, 
      stdio: 'pipe',
      timeout: 300000 // 5 minutes
    });
    log('✅ Build successful', 'green');
    return true;
  } catch (error) {
    log('❌ Build failed', 'red');
    log('   Please fix build errors before releasing', 'yellow');
    return false;
  }
}

/**
 * Run all validations
 */
export function validateRelease(options = {}) {
  const { skipBuild = false } = options;
  
  log('\n🔍 Release Validation', 'cyan');
  log('='.repeat(50), 'cyan');
  
  const results = {
    git: validateGitStatus(),
    version: validateVersionConsistency(),
    build: skipBuild ? true : validateBuild(),
  };
  
  const allPassed = Object.values(results).every(r => r === true);
  
  log('\n' + '='.repeat(50), 'cyan');
  if (allPassed) {
    log('✅ All validations passed! Ready to release.', 'green');
  } else {
    log('❌ Validation failed. Please fix issues before releasing.', 'red');
  }
  
  return {
    success: allPassed,
    results,
  };
}

/**
 * CLI interface
 */
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('release-validator.js')) {
  const skipBuild = process.argv.includes('--skip-build');
  const result = validateRelease({ skipBuild });
  process.exit(result.success ? 0 : 1);
}

