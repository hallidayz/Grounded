#!/usr/bin/env node

/**
 * Build Installers Script
 * 
 * Builds native installers for all platforms and organizes output
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, copyFileSync, readdirSync, statSync } from 'fs';
import { join, basename } from 'path';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function exec(command, options = {}) {
  try {
    execSync(command, { stdio: 'inherit', ...options });
    return true;
  } catch (error) {
    return false;
  }
}

function findFiles(dir, pattern) {
  const files = [];
  if (!existsSync(dir)) return files;
  
  const items = readdirSync(dir);
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...findFiles(fullPath, pattern));
    } else if (pattern.test(item)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function checkPrerequisites() {
  log('🔍 Checking prerequisites...', 'blue');
  
  let rustInstalled = false;
  let androidReady = false;
  let javaInstalled = false;
  
  try {
    execSync('cargo --version', { stdio: 'ignore' });
    rustInstalled = true;
  } catch {
    rustInstalled = false;
  }
  
  try {
    execSync('java -version', { stdio: 'ignore' });
    javaInstalled = true;
  } catch {
    javaInstalled = false;
  }
  
  try {
    const androidHome = process.env.ANDROID_HOME;
    if (androidHome && existsSync(androidHome)) {
      androidReady = true;
    }
  } catch {
    androidReady = false;
  }
  
  return { rustInstalled, androidReady, javaInstalled };
}

function main() {
  log('\n🚀 Building Grounded Installers\n', 'bright');
  
  const platforms = process.argv.slice(2);
  const buildAll = platforms.length === 0;
  
  // Check prerequisites
  const { rustInstalled, androidReady, javaInstalled } = checkPrerequisites();
  
  // Create output directory
  const outputDir = join(process.cwd(), 'dist', 'installers');
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }
  
  // Build desktop installers
  if (buildAll || platforms.includes('desktop') || platforms.includes('all')) {
    log('\n📦 Building Desktop Installers...', 'blue');
    log('This may take 10-20 minutes on first build...\n', 'yellow');
    
    if (!rustInstalled) {
      log('\n⚠️  Rust/Cargo not found. Tauri requires Rust to build desktop installers.', 'yellow');
      log('   Install Rust: curl --proto \'=https\' --tlsv1.2 -sSf https://sh.rustup.rs | sh', 'yellow');
      log('   Or see PREREQUISITES.md for detailed instructions', 'yellow');
      log('   Alternative: Use PWA build instead: npm run build:pwa\n', 'yellow');
    } else {
      if (exec('npm run build:desktop')) {
      log('\n✅ Desktop build complete!', 'green');
      
      // Find and copy installers
      const tauriDir = join(process.cwd(), 'src-tauri', 'target', 'release', 'bundle');
      
      // macOS DMG
      const macFiles = findFiles(join(tauriDir, 'macos'), /\.dmg$/);
      if (macFiles.length > 0) {
        const dmgFile = macFiles[0];
        const dest = join(outputDir, basename(dmgFile));
        copyFileSync(dmgFile, dest);
        log(`   📦 macOS: ${basename(dest)}`, 'green');
      }
      
      // Windows MSI
      const winFiles = findFiles(join(tauriDir, 'msi'), /\.msi$/);
      if (winFiles.length > 0) {
        const msiFile = winFiles[0];
        const dest = join(outputDir, basename(msiFile));
        copyFileSync(msiFile, dest);
        log(`   📦 Windows: ${basename(dest)}`, 'green');
      }
      
      // Linux AppImage
      const linuxFiles = findFiles(join(tauriDir, 'appimage'), /\.AppImage$/);
      if (linuxFiles.length > 0) {
        const appImageFile = linuxFiles[0];
        const dest = join(outputDir, basename(appImageFile));
        copyFileSync(appImageFile, dest);
        log(`   📦 Linux: ${basename(dest)}`, 'green');
      }
      } else {
        log('\n❌ Desktop build failed', 'red');
        log('   Check error messages above for details', 'yellow');
      }
    }
  }
  
  // Build Android APK
  if (buildAll || platforms.includes('android') || platforms.includes('all')) {
    log('\n📱 Building Android APK...', 'blue');
    
    if (!javaInstalled) {
      log('\n❌ Java JDK not found. Android builds require Java.', 'red');
      log('   Install Java:', 'yellow');
      log('   macOS: brew install --cask temurin', 'yellow');
      log('   Or download from: https://adoptium.net/', 'yellow');
      log('   After installation, restart terminal and try again\n', 'yellow');
      log('   See PREREQUISITES.md for detailed instructions\n', 'yellow');
    } else if (!androidReady) {
      log('\n⚠️  Android SDK not configured. Android build may fail.', 'yellow');
      log('   Set ANDROID_HOME environment variable', 'yellow');
      log('   See PREREQUISITES.md for setup instructions\n', 'yellow');
    }
    
    if (javaInstalled && exec('npm run build:android')) {
      log('\n✅ Android build complete!', 'green');
      
      // Find and copy APK
      const apkPath = join(process.cwd(), 'android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
      if (existsSync(apkPath)) {
        const dest = join(outputDir, 'Grounded-Android.apk');
        copyFileSync(apkPath, dest);
        log(`   📦 Android: ${basename(dest)}`, 'green');
      }
    } else if (!javaInstalled) {
      // Java error message already logged above, don't show misleading Android Studio message
      log('\n⚠️  Android build skipped due to missing Java JDK', 'yellow');
    } else {
      log('\n⚠️  Android build failed. Check error messages above for details.', 'yellow');
      log('   Common issues: Android SDK not configured or Gradle build errors', 'yellow');
    }
  }
  
  // Copy installation guides
  const guides = [
    'INSTALLATION_GUIDE.md',
    'QUICK_INSTALL_GUIDE.md'
  ];
  
  let guidesCopied = 0;
  guides.forEach(guideName => {
    const guidePath = join(process.cwd(), guideName);
    if (existsSync(guidePath)) {
      try {
        const dest = join(outputDir, guideName);
        copyFileSync(guidePath, dest);
        guidesCopied++;
      } catch (error) {
        log(`\n⚠️  Could not copy ${guideName}: ${error.message}`, 'yellow');
      }
    }
  });
  
  if (guidesCopied > 0) {
    log(`\n📄 ${guidesCopied} installation guide(s) copied`, 'green');
  } else {
    log('\n⚠️  No installation guides found to copy', 'yellow');
  }
  
  // Summary
  log('\n' + '='.repeat(50), 'bright');
  log('✅ Build Complete!', 'green');
  log('\nInstallers are located in:', 'bright');
  log(`   ${outputDir}\n`, 'blue');
  
  const files = readdirSync(outputDir).filter(f => 
    f.endsWith('.dmg') || f.endsWith('.msi') || f.endsWith('.AppImage') || f.endsWith('.apk')
  );
  
  if (files.length > 0) {
    log('Built installers:', 'bright');
    files.forEach(file => {
      log(`   • ${file}`, 'green');
    });
  }
  
  log('\n📧 Ready to distribute!', 'bright');
  log('Send users the installer file for their operating system along with INSTALLATION_GUIDE.md\n', 'yellow');
}

main();

