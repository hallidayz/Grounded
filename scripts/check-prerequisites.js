#!/usr/bin/env node

/**
 * Prerequisites Check Script
 * 
 * Checks if required tools are installed before building
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkCommand(command, name) {
  try {
    execSync(command, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function checkRust() {
  const installed = checkCommand('cargo --version', 'Rust');
  if (installed) {
    try {
      const version = execSync('cargo --version', { encoding: 'utf-8' }).trim();
      log(`  ✓ Rust: ${version}`, 'green');
      return true;
    } catch {
      log(`  ✓ Rust: Installed`, 'green');
      return true;
    }
  } else {
    log(`  ✗ Rust: Not installed`, 'red');
    log(`     Install: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`, 'yellow');
    return false;
  }
}

function checkNode() {
  const installed = checkCommand('node --version', 'Node.js');
  if (installed) {
    try {
      const version = execSync('node --version', { encoding: 'utf-8' }).trim();
      log(`  ✓ Node.js: ${version}`, 'green');
      return true;
    } catch {
      return true;
    }
  } else {
    log(`  ✗ Node.js: Not installed`, 'red');
    return false;
  }
}

function checkNpm() {
  const installed = checkCommand('npm --version', 'npm');
  if (installed) {
    try {
      const version = execSync('npm --version', { encoding: 'utf-8' }).trim();
      log(`  ✓ npm: ${version}`, 'green');
      return true;
    } catch {
      return true;
    }
  } else {
    log(`  ✗ npm: Not installed`, 'red');
    return false;
  }
}

function checkJava() {
  const installed = checkCommand('java -version', 'Java');
  if (installed) {
    try {
      const version = execSync('java -version', { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).split('\n')[0];
      log(`  ✓ Java: ${version}`, 'green');
      return true;
    } catch {
      log(`  ✓ Java: Installed`, 'green');
      return true;
    }
  } else {
    log(`  ✗ Java: Not installed`, 'red');
    log(`     macOS: brew install --cask temurin`, 'yellow');
    log(`     Or download from: https://adoptium.net/`, 'yellow');
    return false;
  }
}

function checkAndroid() {
  const androidHome = process.env.ANDROID_HOME;
  const hasAdb = checkCommand('adb version', 'Android SDK');
  
  if (androidHome && existsSync(androidHome)) {
    log(`  ✓ Android SDK: ${androidHome}`, 'green');
    if (hasAdb) {
      try {
        const version = execSync('adb version', { encoding: 'utf-8' }).split('\n')[0];
        log(`  ✓ ADB: ${version}`, 'green');
      } catch {}
    }
    return true;
  } else {
    log(`  ✗ Android SDK: Not configured`, 'yellow');
    log(`     Set ANDROID_HOME environment variable`, 'yellow');
    return false;
  }
}

function main() {
  log('\n🔍 Checking Prerequisites...\n', 'bright');
  
  const checks = {
    node: checkNode(),
    npm: checkNpm(),
    rust: checkRust(),
    java: checkJava(),
    android: checkAndroid(),
  };
  
  log('\n' + '='.repeat(50), 'bright');
  
  const allBasic = checks.node && checks.npm;
  const desktopReady = allBasic && checks.rust;
  const androidReady = allBasic && checks.java && checks.android;
  
  if (desktopReady && androidReady) {
    log('\n✅ All prerequisites installed!', 'green');
    log('   You can build desktop and Android installers.\n', 'green');
    return 0;
  } else if (desktopReady) {
    log('\n✅ Desktop build ready!', 'green');
    log('   Android build requires Android Studio setup.\n', 'yellow');
    return 0;
  } else if (allBasic) {
    log('\n⚠️  Basic prerequisites installed', 'yellow');
    log('   Desktop build requires Rust.', 'yellow');
    log('   See PREREQUISITES.md for installation instructions.\n', 'yellow');
    return 1;
  } else {
    log('\n❌ Missing required prerequisites', 'red');
    log('   See PREREQUISITES.md for installation instructions.\n', 'yellow');
    return 1;
  }
}

process.exit(main());

