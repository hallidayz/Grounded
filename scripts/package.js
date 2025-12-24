/**
 * Package script to create a distributable zip file
 * Creates the smallest possible package for email distribution
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const distDir = path.join(__dirname, '..', 'dist');
const packageDir = path.join(__dirname, '..', 'package');
const packageName = 'InnerCompass-PWA';

console.log('📦 Creating PWA package...\n');

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

// Check for required icons and warn if missing
const requiredIcons = ['pwa-192x192.png', 'pwa-512x512.png', 'apple-touch-icon.png'];
const publicDir = path.join(__dirname, '..', 'public');
const missingIcons = requiredIcons.filter(icon => !fs.existsSync(path.join(publicDir, icon)));

if (missingIcons.length > 0) {
  console.log('\n⚠️  Warning: Missing icons:', missingIcons.join(', '));
  console.log('💡 Generate icons by opening public/create-icons.html in a browser');
  console.log('   Or run: npm run build again after generating icons\n');
}

// Copy installation guide
console.log('📖 Copying installation guide...');
fs.copyFileSync(
  path.join(__dirname, '..', 'INSTALLATION_GUIDE.md'),
  path.join(packageDir, 'INSTALLATION_GUIDE.md')
);

// Create a simple server script for local testing
const serverScript = `#!/bin/bash
# Simple HTTP server for testing the PWA locally
# Usage: ./serve.sh [port]

PORT=${process.argv[2] || 8000}
cd "$(dirname "$0")/dist"
echo "🌐 Serving InnerCompass on http://localhost:$PORT"
echo "📱 Open this URL on your device to install the app"
python3 -m http.server $PORT 2>/dev/null || python -m http.server $PORT 2>/dev/null || php -S localhost:$PORT || echo "Please install Python or PHP to run the server"
`;

fs.writeFileSync(path.join(packageDir, 'serve.sh'), serverScript);
fs.chmodSync(path.join(packageDir, 'serve.sh'), '755');

// Create Windows server script
const serverScriptWin = `@echo off
REM Simple HTTP server for testing the PWA locally
REM Usage: serve.bat [port]

set PORT=%1
if "%PORT%"=="" set PORT=8000

cd /d "%~dp0dist"
echo Serving InnerCompass on http://localhost:%PORT%
echo Open this URL on your device to install the app
python -m http.server %PORT% 2>nul || php -S localhost:%PORT% || echo Please install Python or PHP to run the server
pause
`;

fs.writeFileSync(path.join(packageDir, 'serve.bat'), serverScriptWin);

// Create README for the package
const packageReadme = `# InnerCompass PWA Package

This package contains the complete InnerCompass Progressive Web App, ready for distribution.

## 📁 Contents

- \`dist/\` - The built application (upload this to your web server)
- \`INSTALLATION_GUIDE.md\` - Complete installation instructions
- \`serve.sh\` / \`serve.bat\` - Simple scripts to test locally

## 🚀 Quick Start

### Option 1: Upload to Web Server
1. Upload the contents of the \`dist/\` folder to your web server
2. Ensure HTTPS is enabled (required for PWA)
3. Share the URL with users
4. Users can install following the INSTALLATION_GUIDE.md

### Option 2: Test Locally
1. Run \`./serve.sh\` (Mac/Linux) or \`serve.bat\` (Windows)
2. Open http://localhost:8000 in a browser
3. Follow installation guide for mobile devices

## 📱 Installation

See INSTALLATION_GUIDE.md for detailed instructions on installing the app on:
- Android devices
- iOS devices (iPhone/iPad)
- Desktop computers

## 📊 Package Size

The dist folder is optimized for minimal size:
- All assets are minified and compressed
- Unused code is removed
- Images are optimized

## 🔒 Security

- App must be served over HTTPS (or localhost)
- All data is stored locally on user's device
- No external API calls required

## 📞 Support

Refer to INSTALLATION_GUIDE.md for troubleshooting.

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

console.log(`\n✅ Package created successfully!`);
console.log(`📊 Package size: ${distSizeMB} MB`);
console.log(`📁 Location: ${packageDir}\n`);

// Create zip file
console.log('🗜️  Creating zip archive...');
try {
  const zipPath = path.join(__dirname, '..', `${packageName}.zip`);
  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
  }
  
  // Use zip command if available
  execSync(`cd "${path.dirname(packageDir)}" && zip -r "${path.basename(zipPath)}" "${path.basename(packageDir)}" -x "*.DS_Store" "*.git*"`, {
    stdio: 'inherit'
  });
  
  const zipSize = fs.statSync(zipPath).size;
  const zipSizeMB = (zipSize / 1024 / 1024).toFixed(2);
  
  console.log(`\n✅ Zip archive created!`);
  console.log(`📦 File: ${zipPath}`);
  console.log(`📊 Zip size: ${zipSizeMB} MB`);
  console.log(`\n📧 Ready to email!`);
} catch (error) {
  console.log('\n⚠️  Could not create zip automatically.');
  console.log('💡 Manually zip the "package" folder to create a distributable file.');
  console.log('   The package folder is ready for distribution.');
}

