#!/usr/bin/env node
/**
 * Creates cross-platform launcher scripts for the packaged React app
 * Works on Windows, Mac, and Linux without requiring Node.js installation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageDir = path.join(__dirname, '..', 'package');

// Create universal launcher script (works on all platforms with Node.js)
const universalLauncher = `#!/usr/bin/env node
/**
 * Universal Launcher for Grounded PWA
 * Works on Windows, Mac, and Linux
 * Requires: Node.js (comes with npm)
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.argv[2] ? parseInt(process.argv[2], 10) : 8000;
const distDir = path.join(__dirname, 'dist');

if (!fs.existsSync(distDir)) {
  console.error('❌ Error: dist/ folder not found.');
  console.error('   Make sure you are in the Grounded-Install folder.');
  process.exit(1);
}

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml',
};

const server = http.createServer((req, res) => {
  // Set COOP/COEP headers (required for AI models)
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');

  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = path.join(distDir, filePath.split('?')[0]);

  if (!filePath.startsWith(distDir)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      const indexPath = path.join(distDir, 'index.html');
      fs.readFile(indexPath, (err, data) => {
        if (err) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
          return;
        }
        const ext = path.extname(indexPath);
        const contentType = MIME_TYPES[ext] || 'text/plain';
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      });
      return;
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
        return;
      }

      const ext = path.extname(filePath);
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });
});

server.listen(PORT, () => {
  console.log('\\n🌐 Grounded PWA Server');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(\`📍 Serving: \${distDir}\`);
  console.log(\`🌍 URL: http://localhost:\${PORT}\`);
  console.log('📱 Open this URL in your browser to use the app');
  console.log('\\n✅ AI models enabled (SharedArrayBuffer support)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n');
  console.log('Press Ctrl+C to stop the server\\n');
});
`;

// Create Mac/Linux launcher script
const macLinuxLauncher = `#!/bin/bash
# Grounded PWA Launcher for Mac/Linux
# This script tries multiple methods to start the server

PORT=\${1:-8000}
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DIST_DIR="$SCRIPT_DIR/dist"

if [ ! -d "$DIST_DIR" ]; then
  echo "❌ Error: dist/ folder not found."
  echo "   Make sure you are in the Grounded-Install folder."
  exit 1
fi

echo ""
echo "🚀 Starting Grounded PWA..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Method 1: Try Node.js server (best - includes AI model support)
if command -v node &> /dev/null; then
  echo "✅ Using Node.js server (AI models will work)"
  cd "$SCRIPT_DIR"
  node launcher.js \\$PORT
  exit 0
fi

# Method 2: Try npx serve (if Node.js is installed)
if command -v npx &> /dev/null; then
  echo "⚠️  Using npx serve (AI models may not work)"
  echo "   For full AI support, install Node.js and use: node launcher.js"
  cd "$DIST_DIR"
  npx -y serve -p \\$PORT --cors
  exit 0
fi

# Method 3: Try Python 3
if command -v python3 &> /dev/null; then
  echo "⚠️  Using Python server (AI models will NOT work)"
  echo "   Install Node.js for full AI support: https://nodejs.org"
  cd "$DIST_DIR"
  python3 -m http.server \\$PORT
  exit 0
fi

# Method 4: Try Python 2
if command -v python &> /dev/null; then
  echo "⚠️  Using Python server (AI models will NOT work)"
  echo "   Install Node.js for full AI support: https://nodejs.org"
  cd "$DIST_DIR"
  python -m SimpleHTTPServer \\$PORT 2>/dev/null || python -m http.server \\$PORT
  exit 0
fi

# Method 5: Try PHP
if command -v php &> /dev/null; then
  echo "⚠️  Using PHP server (AI models will NOT work)"
  echo "   Install Node.js for full AI support: https://nodejs.org"
  cd "$DIST_DIR"
  php -S localhost:\\$PORT
  exit 0
fi

echo "❌ No server found. Please install one of:"
echo "   1. Node.js (recommended): https://nodejs.org"
echo "   2. Python: https://www.python.org"
echo "   3. PHP: https://www.php.net"
exit 1
`;

// Create Windows launcher script
const windowsLauncher = `@echo off
REM Grounded PWA Launcher for Windows
REM This script tries multiple methods to start the server

setlocal
set PORT=%1
if "%PORT%"=="" set PORT=8000

set SCRIPT_DIR=%~dp0
set DIST_DIR=%SCRIPT_DIR%dist

if not exist "%DIST_DIR%" (
  echo ❌ Error: dist/ folder not found.
  echo    Make sure you are in the Grounded-Install folder.
  pause
  exit /b 1
)

echo.
echo 🚀 Starting Grounded PWA...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REM Method 1: Try Node.js server (best - includes AI model support)
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
  echo ✅ Using Node.js server (AI models will work)
  cd /d "%SCRIPT_DIR%"
  node launcher.js %PORT%
  exit /b 0
)

REM Method 2: Try npx serve (if Node.js is installed)
where npx >nul 2>&1
if %ERRORLEVEL% EQU 0 (
  echo ⚠️  Using npx serve (AI models may not work)
  echo    For full AI support, install Node.js and use: node launcher.js
  cd /d "%DIST_DIR%"
  npx -y serve -p %PORT% --cors
  exit /b 0
)

REM Method 3: Try Python
where python >nul 2>&1
if %ERRORLEVEL% EQU 0 (
  echo ⚠️  Using Python server (AI models will NOT work)
  echo    Install Node.js for full AI support: https://nodejs.org
  cd /d "%DIST_DIR%"
  python -m http.server %PORT%
  exit /b 0
)

REM Method 4: Try PHP
where php >nul 2>&1
if %ERRORLEVEL% EQU 0 (
  echo ⚠️  Using PHP server (AI models will NOT work)
  echo    Install Node.js for full AI support: https://nodejs.org
  cd /d "%DIST_DIR%"
  php -S localhost:%PORT%
  exit /b 0
)

echo ❌ No server found. Please install one of:
echo    1. Node.js (recommended): https://nodejs.org
echo    2. Python: https://www.python.org
echo    3. PHP: https://www.php.net
pause
exit /b 1
`;

// Create package.json for the launcher (so it can be run with node)
const launcherPackageJson = `{
  "type": "module",
  "name": "grounded-launcher",
  "version": "1.0.0",
  "description": "Launcher for Grounded PWA"
}
`;

// Write files
if (!fs.existsSync(packageDir)) {
  fs.mkdirSync(packageDir, { recursive: true });
}

fs.writeFileSync(path.join(packageDir, 'launcher.js'), universalLauncher);
fs.writeFileSync(path.join(packageDir, 'start.sh'), macLinuxLauncher);
fs.writeFileSync(path.join(packageDir, 'start.bat'), windowsLauncher);
fs.writeFileSync(path.join(packageDir, 'package.json'), launcherPackageJson);

// Make scripts executable (Unix)
if (process.platform !== 'win32') {
  fs.chmodSync(path.join(packageDir, 'launcher.js'), '755');
  fs.chmodSync(path.join(packageDir, 'start.sh'), '755');
}

console.log('✅ Cross-platform launchers created!');
console.log('   - launcher.js (Node.js - best for AI models)');
console.log('   - start.sh (Mac/Linux launcher)');
console.log('   - start.bat (Windows launcher)');
