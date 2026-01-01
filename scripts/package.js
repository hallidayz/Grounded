/**
 * Package script to create a distributable zip file
 * Creates the smallest possible package for email distribution
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, '..', 'dist');
const packageDir = path.join(__dirname, '..', 'package');
const packageName = 'Grounded-PWA';
const srcTauriDir = path.join(__dirname, '..', 'src-tauri');
const androidDir = path.join(__dirname, '..', 'android');

console.log('📦 Creating distribution package...\n');

// Check if dist folder exists
if (!fs.existsSync(distDir)) {
  console.error('❌ dist/ folder not found. Run "npm run build" first.');
  process.exit(1);
}

// Create package directory
if (fs.existsSync(packageDir)) {
  fs.rmSync(packageDir, { recursive: true, force: true });
}
fs.mkdirSync(packageDir, { recursive: true });

// Copy dist folder
console.log('📋 Copying build files...');
fs.cpSync(distDir, path.join(packageDir, 'dist'), { recursive: true });

// Copy AI models if they exist (for bundled package)
// Models are downloaded to public/models/ and need to be copied to dist/models/
const publicModelsDir = path.join(__dirname, '..', 'public', 'models');
const distModelsDir = path.join(packageDir, 'dist', 'models');

// Check if models exist in public (downloaded during build)
if (fs.existsSync(publicModelsDir)) {
  console.log('📦 Copying AI models to package...');
  fs.mkdirSync(distModelsDir, { recursive: true });
  fs.cpSync(publicModelsDir, distModelsDir, { recursive: true });
  
  // Calculate models size
  function getDirSize(dir) {
    let size = 0;
    try {
      const files = fs.readdirSync(dir, { withFileTypes: true });
      for (const file of files) {
        const filePath = path.join(dir, file.name);
        if (file.isDirectory()) {
          size += getDirSize(filePath);
        } else {
          size += fs.statSync(filePath).size;
        }
      }
    } catch {
      // Ignore errors
    }
    return size;
  }
  
  const modelsSize = getDirSize(distModelsDir);
  const modelsSizeMB = (modelsSize / 1024 / 1024).toFixed(2);
  console.log(`   ✅ Models included (${modelsSizeMB} MB)`);
  console.log('   💡 Models are bundled - no download needed on first use!');
  console.log('   💡 App will load models instantly from the package');
} else {
  console.log('⚠️  AI models not found in public/models/');
  console.log('   💡 Models will be downloaded from HuggingFace on first use');
  console.log('   💡 To include models: Run "npm run download:models" before "npm run build:pwa"');
}

// Check for required icons and warn if missing
const requiredIcons = ['pwa-192x192.png', 'pwa-512x512.png', 'apple-touch-icon.png'];
const publicDir = path.join(__dirname, '..', 'public');
const missingIcons = requiredIcons.filter(icon => !fs.existsSync(path.join(publicDir, icon)));

if (missingIcons.length > 0) {
  console.log('\n⚠️  Warning: Missing icons:', missingIcons.join(', '));
  console.log('💡 Generate icons by running: npm run rebuild:icons');
  console.log('   Or run: npm run build again after generating icons\n');
}

// Copy installation guide
console.log('📖 Copying installation guide...');
fs.copyFileSync(
  path.join(__dirname, '..', 'INSTALLATION_GUIDE.md'),
  path.join(packageDir, 'INSTALLATION_GUIDE.md')
);

// Copy additional documentation
console.log('📖 Copying additional documentation...');
const additionalDocs = ['PREREQUISITES.md', 'README.md', 'USAGE_GUIDE.md'];
additionalDocs.forEach(docName => {
  const docPath = path.join(__dirname, '..', docName);
  if (fs.existsSync(docPath)) {
    fs.copyFileSync(docPath, path.join(packageDir, docName));
    console.log(`   ✓ Copied ${docName}`);
  } else {
    console.log(`   ⚠️  ${docName} not found, skipping...`);
  }
});

// Create mobile-first HTML launcher (opens automatically)
console.log('📱 Creating mobile-first launcher...');
const createMobileLauncher = path.join(__dirname, 'create-mobile-launcher.js');
if (fs.existsSync(createMobileLauncher)) {
  execSync(`node "${createMobileLauncher}"`, { stdio: 'inherit' });
} else {
  console.log('⚠️  create-mobile-launcher.js not found, skipping...');
}

// Create cross-platform launchers (for desktop users who want to run server)
console.log('📦 Creating cross-platform server launchers...');
const createLauncherScript = path.join(__dirname, 'create-launcher.js');
if (fs.existsSync(createLauncherScript)) {
  execSync(`node "${createLauncherScript}"`, { stdio: 'inherit' });
} else {
  console.log('⚠️  create-launcher.js not found, skipping...');
}

// Create README for the package
const packageReadme = `# Grounded PWA - Mobile-First Installation

**📱 Perfect for Android & iPhone users!**

This package contains the complete Grounded by AC MiNDS Progressive Web App.

## 🚀 Quick Start - Just Extract & Open!

1. **Extract** this ZIP file to any folder
2. **Double-click** \`index.html\` (or \`INSTALL.html\`)
3. **Follow the on-screen instructions** for your device

The launcher page will automatically:
- ✅ Detect if you're on Android, iPhone, or Desktop
- ✅ Show step-by-step installation instructions
- ✅ Open the app with one click

## 📱 For Mobile Users (Android & iPhone)

### Android:
1. Extract the ZIP file
2. Open \`index.html\` in Chrome
3. Tap "Open App" button
4. When the app loads, tap "Install" in the browser
5. Done! App icon appears on home screen

### iPhone/iPad:
1. Extract the ZIP file  
2. Open \`index.html\` in **Safari** (must use Safari!)
3. Tap "Open App in Safari" button
4. Tap Share button → "Add to Home Screen"
5. Done! App icon appears on home screen

**💡 Tip:** For mobile, you can also upload the \`dist/\` folder to a web server and share the URL.

## 💻 For Desktop Users

### Option 1: Upload to Web Server (Recommended)
1. Upload \`dist/\` folder contents to your web server
2. Visit the URL in your browser
3. Click install icon in address bar

### Option 2: Run Local Server
**Mac/Linux:**
\`\`\`bash
./start.sh
\`\`\`

**Windows:**
\`\`\`cmd
start.bat
\`\`\`

Or with Node.js:
\`\`\`bash
node launcher.js
\`\`\`

## 📁 What's Inside

- \`index.html\` / \`INSTALL.html\` - **Start here!** Mobile-friendly launcher
- \`dist/\` - The React app (upload this to a web server)
- \`launcher.js\` - Local server for desktop (Node.js)
- \`start.sh\` / \`start.bat\` - Desktop server launchers
- \`INSTALLATION_GUIDE.md\` - Detailed instructions

## ✅ Installation Success

After installation:
- **Mobile**: App icon appears on home screen
- **Desktop**: App appears in applications menu
- **All devices**: App works offline after first load
- **AI Models**: Load instantly (bundled in package - no download needed!)

## 🤖 AI Models Included

This package includes AI models bundled directly:
- ✅ **Instant loading** - No wait time for model downloads
- ✅ **Offline capable** - Models work without internet
- ✅ **Faster startup** - Models ready immediately
- ✅ **No HuggingFace download** - Everything included in the package

**Note**: If models aren't included, the app will download them from HuggingFace on first use.

## 🔒 Security & Privacy

- ✅ All data stored on your device (private & secure)
- ✅ No external servers required
- ✅ Works completely offline
- ✅ HTTPS required for installation (or localhost)
- ✅ AI models run entirely in your browser

## 📞 Need Help?

See \`INSTALLATION_GUIDE.md\` for detailed troubleshooting.

---
Generated: ${new Date().toISOString()}
`;

fs.writeFileSync(path.join(packageDir, 'README.txt'), packageReadme);

// Calculate sizes
function getSize(dir) {
  let size = 0;
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const filePath = path.join(dir, file.name);
    if (file.isDirectory()) {
      size += getSize(filePath);
    } else {
      size += fs.statSync(filePath).size;
    }
  }
  return size;
}

const distSize = getSize(path.join(packageDir, 'dist'));
const distSizeMB = (distSize / 1024 / 1024).toFixed(2);

// Check if models were included
const modelsIncluded = fs.existsSync(path.join(packageDir, 'dist', 'models'));
if (modelsIncluded) {
  const modelsSize = getSize(path.join(packageDir, 'dist', 'models'));
  const modelsSizeMB = (modelsSize / 1024 / 1024).toFixed(2);
  console.log(`\n✅ Package created successfully!`);
  console.log(`📊 App size: ${distSizeMB} MB`);
  console.log(`🤖 AI Models: ${modelsSizeMB} MB (bundled - no download needed!)`);
  console.log(`📦 Total size: ${((distSize + modelsSize) / 1024 / 1024).toFixed(2)} MB`);
  console.log(`📁 Location: ${packageDir}\n`);
} else {
  console.log(`\n✅ Package created successfully!`);
  console.log(`📊 Package size: ${distSizeMB} MB`);
  console.log(`⚠️  AI models not included - will download on first use`);
  console.log(`📁 Location: ${packageDir}\n`);
}

// Check for native installers
console.log('🔍 Checking for native installers...\n');

const tauriBuildDir = path.join(srcTauriDir, 'target', 'release', 'bundle');
const androidApkPath = path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
const androidDebugApkPath = path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');

let hasNativeInstallers = false;

// Check for Tauri installers (DMG/EXE)
if (fs.existsSync(tauriBuildDir)) {
  const bundleContents = fs.readdirSync(tauriBuildDir, { withFileTypes: true });
  const installers = bundleContents
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  if (installers.length > 0) {
    hasNativeInstallers = true;
    console.log('✅ Found Tauri desktop installers:');
    installers.forEach(installer => {
      const installerDir = path.join(tauriBuildDir, installer);
      const files = fs.readdirSync(installerDir);
      files.forEach(file => {
        if (file.endsWith('.dmg') || file.endsWith('.exe') || file.endsWith('.AppImage') || file.endsWith('.deb')) {
          const installerPath = path.join(installerDir, file);
          const installerSize = fs.statSync(installerPath).size;
          const installerSizeMB = (installerSize / 1024 / 1024).toFixed(2);
          console.log(`   📦 ${file} (${installerSizeMB} MB)`);
          
          // Copy to package directory
          const destPath = path.join(packageDir, 'installers', file);
          fs.mkdirSync(path.dirname(destPath), { recursive: true });
          fs.copyFileSync(installerPath, destPath);
        }
      });
    });
    console.log('');
  }
}

// Check for Android APK
if (fs.existsSync(androidApkPath)) {
  hasNativeInstallers = true;
  const apkSize = fs.statSync(androidApkPath).size;
  const apkSizeMB = (apkSize / 1024 / 1024).toFixed(2);
  console.log(`✅ Found Android APK: app-release.apk (${apkSizeMB} MB)`);
  
  const destPath = path.join(packageDir, 'installers', 'Grounded-release.apk');
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.copyFileSync(androidApkPath, destPath);
  console.log('');
} else if (fs.existsSync(androidDebugApkPath)) {
  hasNativeInstallers = true;
  const apkSize = fs.statSync(androidDebugApkPath).size;
  const apkSizeMB = (apkSize / 1024 / 1024).toFixed(2);
  console.log(`✅ Found Android Debug APK: app-debug.apk (${apkSizeMB} MB)`);
  console.log('   ⚠️  Note: This is a debug build. For production, build a release APK.');
  
  const destPath = path.join(packageDir, 'installers', 'Grounded-debug.apk');
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.copyFileSync(androidDebugApkPath, destPath);
  console.log('');
}

if (!hasNativeInstallers) {
  console.log('⚠️  No native installers found.');
  console.log('💡 To build native installers:');
  console.log('   - Desktop (DMG/EXE): npm run build:desktop');
  console.log('   - Android (APK): npm run build:android');
  console.log('');
}

// Create zip file
console.log('🗜️  Creating zip archive...');
try {
  const zipPath = path.join(__dirname, '..', `${packageName}.zip`);
  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
  }
  
  // Create a temporary folder with the desired extraction name
  const tempExtractDir = path.join(__dirname, '..', 'Grounded-Install');
  if (fs.existsSync(tempExtractDir)) {
    fs.rmSync(tempExtractDir, { recursive: true, force: true });
  }
  
  // Copy package contents to Grounded-Install folder
  console.log('📋 Preparing zip structure...');
  fs.cpSync(packageDir, tempExtractDir, { recursive: true });
  
  // Create zip from the Grounded-Install folder with maximum compression
  // This ensures the zip extracts to "Grounded-Install" folder
  // Use -9 for maximum compression, -q for quiet mode
  console.log('🗜️  Compressing with maximum compression (this may take a while)...');
  
  // Try 7z first (best compression), fallback to zip -9
  let compressionCommand;
  try {
    execSync('which 7z', { stdio: 'pipe' });
    // 7z with ultra compression (LZMA2, maximum dictionary size)
    compressionCommand = `cd "${path.dirname(tempExtractDir)}" && 7z a -tzip -mx=9 -mm=Deflate -mmt=on "${path.basename(zipPath)}" "${path.basename(tempExtractDir)}" -xr!"*.DS_Store" -xr!"*.git*"`;
    console.log('   Using 7z with ultra compression (LZMA2)...');
  } catch {
    // Fallback to zip with maximum compression
    compressionCommand = `cd "${path.dirname(tempExtractDir)}" && zip -9 -r "${path.basename(zipPath)}" "${path.basename(tempExtractDir)}" -x "*.DS_Store" "*.git*"`;
    console.log('   Using zip with maximum compression (-9)...');
  }
  
  execSync(compressionCommand, {
    stdio: 'inherit'
  });
  
  // Calculate compression ratio before cleanup
  function getTotalSize(dir) {
    let size = 0;
    try {
      const files = fs.readdirSync(dir, { withFileTypes: true });
      for (const file of files) {
        const filePath = path.join(dir, file.name);
        if (file.isDirectory()) {
          size += getTotalSize(filePath);
        } else {
          size += fs.statSync(filePath).size;
        }
      }
    } catch {
      // Ignore errors
    }
    return size;
  }
  
  const originalSize = getTotalSize(tempExtractDir);
  const originalSizeMB = (originalSize / 1024 / 1024).toFixed(2);
  
  // Clean up temporary folder
  fs.rmSync(tempExtractDir, { recursive: true, force: true });
  
  const zipSize = fs.statSync(zipPath).size;
  const zipSizeMB = (zipSize / 1024 / 1024).toFixed(2);
  const compressionRatio = ((1 - zipSize / originalSize) * 100).toFixed(1);
  
  console.log(`\n✅ Zip archive created with maximum compression!`);
  console.log(`📦 File: ${zipPath}`);
  console.log(`📊 Original size: ${originalSizeMB} MB`);
  console.log(`📊 Compressed size: ${zipSizeMB} MB`);
  console.log(`📊 Compression ratio: ${compressionRatio}%`);
  console.log(`📁 Extracts to: Grounded-Install/`);
  if (hasNativeInstallers) {
    console.log(`\n📱 Native installers included! Users can double-click to install.`);
  } else {
    console.log(`\n📧 PWA package ready to email!`);
  }
} catch (error) {
  console.log('\n⚠️  Could not create zip automatically.');
  console.log('💡 Manually zip the "package" folder to create a distributable file.');
  console.log('   Rename the folder to "Grounded-Install" before zipping.');
  console.log('   The package folder is ready for distribution.');
}
