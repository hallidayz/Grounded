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
  let iosReady = false;
  let xcodeInstalled = false;
  
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
  
  // Check for iOS/Xcode prerequisites
  try {
    execSync('xcodebuild -version', { stdio: 'ignore' });
    xcodeInstalled = true;
  } catch {
    xcodeInstalled = false;
  }
  
  // Check if iOS project exists
  const iosDir = join(process.cwd(), 'ios');
  if (existsSync(iosDir)) {
    iosReady = true;
  }
  
  return { rustInstalled, androidReady, javaInstalled, iosReady, xcodeInstalled };
}

function main() {
  log('\n🚀 Building Grounded Installers\n', 'bright');
  
  const platforms = process.argv.slice(2);
  const buildAll = platforms.length === 0;
  
  // Check prerequisites
  const { rustInstalled, androidReady, javaInstalled, iosReady, xcodeInstalled } = checkPrerequisites();
  
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
  
  // Build iOS (requires manual Xcode steps for final distribution)
  if (buildAll || platforms.includes('ios') || platforms.includes('all')) {
    log('\n🍎 Building iOS App...', 'blue');
    
    if (process.platform !== 'darwin') {
      log('\n❌ iOS builds require macOS. Skipping iOS build.', 'red');
      log('   iOS builds can only be done on a Mac with Xcode installed.', 'yellow');
    } else if (!xcodeInstalled) {
      log('\n❌ Xcode not found. iOS builds require Xcode.', 'red');
      log('   Install Xcode from the App Store:', 'yellow');
      log('   https://apps.apple.com/us/app/xcode/id497799835', 'yellow');
      log('   After installation, run: sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer', 'yellow');
      log('   Then run: sudo xcodebuild -license accept', 'yellow');
    } else {
      // Check if iOS project exists, if not, create it
      const iosDir = join(process.cwd(), 'ios');
      if (!existsSync(iosDir)) {
        log('\n📱 Setting up iOS project (first time)...', 'blue');
        log('   This will create the iOS project structure.', 'yellow');
        
        // Check if @capacitor/ios is installed
        try {
          require.resolve('@capacitor/ios');
        } catch {
          log('\n⚠️  @capacitor/ios not found. Installing...', 'yellow');
          if (!exec('npm install @capacitor/ios')) {
            log('\n❌ Failed to install @capacitor/ios', 'red');
            log('   Install manually: npm install @capacitor/ios', 'yellow');
          }
        }
        
        if (exec('npx cap add ios')) {
          log('✅ iOS project created!', 'green');
        } else {
          log('\n❌ Failed to create iOS project', 'red');
          log('   Try manually: npx cap add ios', 'yellow');
        }
      }
      
      // Build and sync iOS
      if (exec('npm run build:ios')) {
        log('\n✅ iOS build sync complete!', 'green');
        log('\n📝 Next Steps for iOS Distribution:', 'blue');
        log('   1. Open Xcode: npx cap open ios', 'yellow');
        log('   2. Select your development team in Xcode', 'yellow');
        log('   3. Product → Archive', 'yellow');
        log('   4. Distribute App → App Store Connect or Ad Hoc', 'yellow');
        log('   5. Export IPA file for distribution', 'yellow');
        log('\n   Note: iOS distribution requires Apple Developer account ($99/year)', 'yellow');
        log('   For TestFlight: Upload to App Store Connect', 'yellow');
        log('   For Enterprise: Use Ad Hoc or Enterprise distribution', 'yellow');
        
        // Check if there's an archive or IPA file
        const iosArchiveDir = join(iosDir, 'App', 'build', 'Release-iphoneos');
        const ipaFiles = findFiles(iosDir, /\.ipa$/);
        
        if (ipaFiles.length > 0) {
          const ipaFile = ipaFiles[0];
          const dest = join(outputDir, basename(ipaFile));
          copyFileSync(ipaFile, dest);
          log(`\n   📦 iOS IPA: ${basename(dest)}`, 'green');
        } else {
          log('\n   ⚠️  No IPA file found. Build IPA in Xcode (Product → Archive → Distribute)', 'yellow');
        }
      } else {
        log('\n⚠️  iOS build sync failed. Check error messages above.', 'yellow');
        log('   Common issues:', 'yellow');
        log('   - CocoaPods not installed: sudo gem install cocoapods', 'yellow');
        log('   - Xcode not properly configured', 'yellow');
        log('   - Missing iOS dependencies', 'yellow');
      }
    }
  }
  
  // Copy installation guides
  const guides = [
    'INSTALLATION_GUIDE.md',
    'QUICK_INSTALL_GUIDE.md',
    'PREREQUISITES.md',
    'README.md',
    'USAGE_GUIDE.md'
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
    f.endsWith('.dmg') || f.endsWith('.msi') || f.endsWith('.AppImage') || f.endsWith('.apk') || f.endsWith('.ipa')
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

