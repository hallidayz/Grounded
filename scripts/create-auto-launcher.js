#!/usr/bin/env node
/**
 * Creates fully automated launcher that:
 * 1. Starts server automatically
 * 2. Opens browser automatically
 * 3. Shows QR code for mobile users
 * 4. No user interaction needed - just double-click!
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageDir = path.join(__dirname, '..', 'package');

// Create universal auto-launcher (Node.js - works everywhere)
const autoLauncher = `#!/usr/bin/env node
/**
 * Auto-Launcher for Grounded PWA
 * Just double-click and it works!
 * 
 * This script:
 * 1. Starts a local server automatically
 * 2. Opens your browser automatically
 * 3. Shows QR code for mobile devices
 * 4. Everything is automated!
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { exec } from 'child_process';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 8000;
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
      
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });
});

// Get local IP address for mobile access
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const localIP = getLocalIP();
const localURL = \`http://\${localIP}:\${PORT}\`;
const localhostURL = \`http://localhost:\${PORT}\`;

server.listen(PORT, () => {
  console.log('\\n' + '='.repeat(60));
  console.log('🚀 Grounded PWA - Auto-Launcher');
  console.log('='.repeat(60));
  console.log(\`\\n✅ Server started successfully!\\n\`);
  console.log('📱 For Mobile Devices:');
  console.log(\`   Scan QR code below or visit: \${localURL}\`);
  console.log('\\n💻 For Desktop:');
  console.log(\`   Opening browser automatically...\`);
  console.log(\`   Or visit: \${localhostURL}\`);
  console.log('\\n' + '='.repeat(60));
  console.log('\\n💡 Tips:');
  console.log('   • Mobile: Make sure your phone is on the same WiFi');
  console.log('   • Desktop: Browser should open automatically');
  console.log('   • Install: Look for install button in browser');
  console.log('\\n' + '='.repeat(60));
  console.log('\\nPress Ctrl+C to stop the server\\n');
  
  // Generate QR code URL
  const qrURL = \`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=\${encodeURIComponent(localURL)}\`;
  console.log('\\n📱 QR Code for Mobile:');
  console.log(qrURL);
  console.log('\\n');
  
  // Auto-open browser (desktop only)
  const platform = os.platform();
  let openCommand;
  
  if (platform === 'darwin') {
    openCommand = \`open "\${localhostURL}"\`;
  } else if (platform === 'win32') {
    openCommand = \`start "\${localhostURL}"\`;
  } else {
    openCommand = \`xdg-open "\${localhostURL}"\`;
  }
  
  // Wait a moment for server to be ready, then open browser
  setTimeout(() => {
    exec(openCommand, (error) => {
      if (error) {
        console.log(\`\\n⚠️  Could not open browser automatically.\\n   Please visit: \${localhostURL}\\n\`);
      }
    });
  }, 1000);
});
`;

// Create Mac/Linux auto-launcher (executable)
const macLinuxAutoLauncher = `#!/bin/bash
# Auto-Launcher for Grounded PWA
# Just double-click this file - everything is automated!

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Check for Node.js
if ! command -v node &> /dev/null; then
  echo ""
  echo "❌ Node.js is required but not found."
  echo ""
  echo "📥 Please install Node.js:"
  echo "   Visit: https://nodejs.org"
  echo "   Download and install, then try again."
  echo ""
  read -p "Press Enter to exit..."
  exit 1
fi

# Run the auto-launcher
node launcher.js
`;

// Create Windows auto-launcher (executable)
const windowsAutoLauncher = `@echo off
REM Auto-Launcher for Grounded PWA
REM Just double-click this file - everything is automated!

cd /d "%~dp0"

REM Check for Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo.
  echo ❌ Node.js is required but not found.
  echo.
  echo 📥 Please install Node.js:
  echo    Visit: https://nodejs.org
  echo    Download and install, then try again.
  echo.
  pause
  exit /b 1
)

REM Run the auto-launcher
node launcher.js
pause
`;

// Create package.json for launcher
const launcherPackageJson = `{
  "type": "module",
  "name": "grounded-auto-launcher",
  "version": "1.0.0",
  "description": "Auto-launcher for Grounded PWA - just double-click and it works!"
}
`;

// Write files
if (!fs.existsSync(packageDir)) {
  fs.mkdirSync(packageDir, { recursive: true });
}

// Rename launcher.js to be the auto-launcher
fs.writeFileSync(path.join(packageDir, 'launcher.js'), autoLauncher);
fs.writeFileSync(path.join(packageDir, 'START.sh'), macLinuxAutoLauncher);
fs.writeFileSync(path.join(packageDir, 'START.bat'), windowsAutoLauncher);
fs.writeFileSync(path.join(packageDir, 'package.json'), launcherPackageJson);

// Make scripts executable (Unix)
if (process.platform !== 'win32') {
  fs.chmodSync(path.join(packageDir, 'launcher.js'), '755');
  fs.chmodSync(path.join(packageDir, 'START.sh'), '755');
}

console.log('✅ Auto-launcher created!');
console.log('   - launcher.js (Node.js auto-launcher)');
console.log('   - START.sh (Mac/Linux - double-click to run)');
console.log('   - START.bat (Windows - double-click to run)');
console.log('');
console.log('💡 Users just double-click START.sh or START.bat and everything happens automatically!');

