#!/usr/bin/env node
/**
 * Release Manager Module
 * 
 * Core release management functionality:
 * - Version bumping (patch/minor/major)
 * - File version updates
 * - Git operations
 * - Release coordination
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rootDir = join(__dirname, '..');

/**
 * Get current version from package.json
 */
export function getCurrentVersion() {
  const packageJsonPath = join(rootDir, 'package.json');
  if (!existsSync(packageJsonPath)) {
    throw new Error('package.json not found');
  }
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  return packageJson.version || '1.0.0';
}

/**
 * Bump version based on type
 */
export function bumpVersion(currentVersion, type = 'patch') {
  const parts = currentVersion.split('.');
  if (parts.length !== 3) {
    throw new Error(`Invalid version format: ${currentVersion}. Expected format: x.y.z`);
  }
  
  const major = parseInt(parts[0], 10);
  const minor = parseInt(parts[1], 10);
  const patch = parseInt(parts[2], 10);
  
  switch (type.toLowerCase()) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
    default:
      return `${major}.${minor}.${patch + 1}`;
  }
}

/**
 * Update version in JSON file
 */
function updateVersionInJsonFile(filePath, newVersion) {
  if (!existsSync(filePath)) {
    return false;
  }
  
  try {
    const content = JSON.parse(readFileSync(filePath, 'utf-8'));
    if (content.version) {
      content.version = newVersion;
    }
    if (content.appVersion) {
      content.appVersion = newVersion;
    }
    writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n', 'utf-8');
    return true;
  } catch (error) {
    console.warn(`Error updating ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Update version in TOML file
 */
function updateVersionInTomlFile(filePath, oldVersion, newVersion) {
  if (!existsSync(filePath)) {
    return false;
  }
  
  try {
    let content = readFileSync(filePath, 'utf-8');
    const escapedOldVersion = oldVersion.replace(/\./g, '\\.');
    content = content.replace(
      new RegExp(`version\\s*=\\s*["']${escapedOldVersion}["']`, 'g'),
      `version = "${newVersion}"`
    );
    writeFileSync(filePath, content, 'utf-8');
    return true;
  } catch (error) {
    console.warn(`Error updating ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Update version in text file (TypeScript, Markdown, etc.)
 */
function updateVersionInTextFile(filePath, oldVersion, newVersion) {
  if (!existsSync(filePath)) {
    return false;
  }
  
  try {
    let content = readFileSync(filePath, 'utf-8');
    const escapedOldVersion = oldVersion.replace(/\./g, '\\.');
    
    // Handle various patterns
    content = content.replace(
      new RegExp(`(CURRENT_APP_VERSION|appVersion|Version)\\s*[:=]\\s*[^'"]*["']${escapedOldVersion}["']`, 'g'),
      (match) => match.replace(oldVersion, newVersion)
    );
    
    content = content.replace(
      new RegExp(`(Version|**Version**|Current Version|**Current Version**)\\s*[:]?\\s*${escapedOldVersion}`, 'gi'),
      (match) => match.replace(oldVersion, newVersion)
    );
    
    content = content.replace(
      new RegExp(`App Version:\\s*${escapedOldVersion}`, 'g'),
      `App Version: ${newVersion}`
    );
    
    // General replacement for any remaining instances
    content = content.replace(new RegExp(escapedOldVersion, 'g'), newVersion);
    
    writeFileSync(filePath, content, 'utf-8');
    return true;
  } catch (error) {
    console.warn(`Error updating ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Update version in all files
 */
export function updateAllVersions(oldVersion, newVersion) {
  const filesUpdated = [];
  const filesFailed = [];
  
  // JSON files
  const jsonFiles = [
    join(rootDir, 'package.json'),
    join(rootDir, 'src-tauri', 'tauri.conf.json'),
  ];
  
  jsonFiles.forEach(file => {
    if (updateVersionInJsonFile(file, newVersion)) {
      filesUpdated.push(file);
    } else {
      filesFailed.push(file);
    }
  });
  
  // TOML files
  const tomlFiles = [
    join(rootDir, 'src-tauri', 'Cargo.toml'),
  ];
  
  tomlFiles.forEach(file => {
    if (updateVersionInTomlFile(file, oldVersion, newVersion)) {
      filesUpdated.push(file);
    } else {
      filesFailed.push(file);
    }
  });
  
  // Text files
  const textFiles = [
    join(rootDir, 'services', 'updateManager.ts'),
    join(rootDir, 'services', 'debugLog.ts'),
    join(rootDir, 'components', 'FeedbackButton.tsx'),
    join(rootDir, 'README.md'),
    join(rootDir, 'USAGE_GUIDE.md'),
    join(rootDir, 'INSTALLATION_GUIDE.md'),
  ];
  
  textFiles.forEach(file => {
    if (updateVersionInTextFile(file, oldVersion, newVersion)) {
      filesUpdated.push(file);
    } else {
      filesFailed.push(file);
    }
  });
  
  // Log results
  filesUpdated.forEach(file => {
    console.log(`   ✓ Updated ${basename(file)}`);
  });
  
  return {
    success: filesUpdated.length > 0,
    updated: filesUpdated,
    failed: filesFailed,
  };
}

/**
 * Check if git repository is clean
 */
export function isGitClean() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf-8', cwd: rootDir });
    return status.trim() === '';
  } catch (error) {
    return false;
  }
}

/**
 * Get current git branch
 */
export function getCurrentBranch() {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8', cwd: rootDir });
    return branch.trim();
  } catch (error) {
    return null;
  }
}

/**
 * Create git tag
 */
export function createGitTag(version, message) {
  try {
    const tagName = `v${version}`;
    execSync(`git tag -a ${tagName} -m "${message}"`, { cwd: rootDir, stdio: 'inherit' });
    return { success: true, tag: tagName };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get last git tag
 */
export function getLastTag() {
  try {
    const tag = execSync('git describe --tags --abbrev=0', { encoding: 'utf-8', cwd: rootDir });
    return tag.trim();
  } catch (error) {
    return null;
  }
}

/**
 * Get commits since last tag
 */
export function getCommitsSinceTag(tag) {
  try {
    const range = tag ? `${tag}..HEAD` : 'HEAD';
    const commits = execSync(`git log ${range} --pretty=format:"%h|%s|%b"`, { 
      encoding: 'utf-8', 
      cwd: rootDir 
    });
    return commits.trim().split('\n').filter(Boolean);
  } catch (error) {
    return [];
  }
}

