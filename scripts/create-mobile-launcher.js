#!/usr/bin/env node
/**
 * Creates mobile-first launcher HTML page
 * This opens automatically when users extract the zip
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageDir = path.join(__dirname, '..', 'package');

// Create mobile-first launcher HTML
const launcherHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Grounded - Install App</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      background: linear-gradient(135deg, #02295b 0%, #1b3448 100%);
      color: white;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    
    .container {
      max-width: 500px;
      width: 100%;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 40px 30px;
      text-align: center;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }
    
    .logo {
      width: 80px;
      height: 80px;
      margin: 0 auto 20px;
      background: white;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
      font-weight: bold;
      color: #02295b;
    }
    
    h1 {
      font-size: 28px;
      margin-bottom: 10px;
      font-weight: 600;
    }
    
    .subtitle {
      font-size: 16px;
      opacity: 0.9;
      margin-bottom: 30px;
    }
    
    .device-selector {
      display: flex;
      gap: 15px;
      margin-bottom: 30px;
      flex-wrap: wrap;
      justify-content: center;
    }
    
    .device-btn {
      flex: 1;
      min-width: 140px;
      padding: 15px 20px;
      background: rgba(255, 255, 255, 0.2);
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 12px;
      color: white;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s;
      text-decoration: none;
      display: block;
    }
    
    .device-btn:hover, .device-btn:active {
      background: rgba(255, 255, 255, 0.3);
      border-color: rgba(255, 255, 255, 0.5);
      transform: translateY(-2px);
    }
    
    .device-btn.active {
      background: rgba(255, 255, 255, 0.3);
      border-color: white;
    }
    
    .instructions {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 12px;
      padding: 25px;
      text-align: left;
      margin-top: 20px;
      display: none;
    }
    
    .instructions.active {
      display: block;
    }
    
    .instructions h2 {
      font-size: 20px;
      margin-bottom: 15px;
      text-align: center;
    }
    
    .step {
      margin-bottom: 20px;
      padding-left: 30px;
      position: relative;
    }
    
    .step-number {
      position: absolute;
      left: 0;
      top: 0;
      width: 24px;
      height: 24px;
      background: white;
      color: #02295b;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 14px;
    }
    
    .step p {
      font-size: 15px;
      line-height: 1.6;
      opacity: 0.95;
    }
    
    .step strong {
      color: #ffd700;
    }
    
    .open-app-btn {
      margin-top: 25px;
      padding: 15px 30px;
      background: white;
      color: #02295b;
      border: none;
      border-radius: 12px;
      font-size: 18px;
      font-weight: 600;
      cursor: pointer;
      width: 100%;
      transition: all 0.3s;
      text-decoration: none;
      display: inline-block;
    }
    
    .open-app-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
    
    .note {
      margin-top: 20px;
      padding: 15px;
      background: rgba(255, 215, 0, 0.2);
      border-left: 4px solid #ffd700;
      border-radius: 8px;
      font-size: 14px;
      text-align: left;
    }
    
    .qr-placeholder {
      width: 200px;
      height: 200px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      margin: 20px auto;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      opacity: 0.7;
    }
    
    @media (max-width: 480px) {
      .container {
        padding: 30px 20px;
      }
      
      h1 {
        font-size: 24px;
      }
      
      .device-btn {
        min-width: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">G</div>
    <h1>Grounded</h1>
    <p class="subtitle">Install the app on your device</p>
    
    <div class="device-selector">
      <button class="device-btn" onclick="showInstructions('android')">📱 Android</button>
      <button class="device-btn" onclick="showInstructions('ios')">🍎 iPhone/iPad</button>
      <button class="device-btn" onclick="showInstructions('desktop')">💻 Desktop</button>
    </div>
    
    <!-- Android Instructions -->
    <div id="android-instructions" class="instructions">
      <h2>📱 Install on Android</h2>
      <div class="step">
        <div class="step-number">1</div>
        <p>Tap the <strong>"Open App"</strong> button below to launch the app in your browser</p>
      </div>
      <div class="step">
        <div class="step-number">2</div>
        <p>When the app opens, look for the <strong>"Install"</strong> button or icon in your browser's address bar</p>
      </div>
      <div class="step">
        <div class="step-number">3</div>
        <p>Tap <strong>"Install"</strong> or <strong>"Add to Home Screen"</strong></p>
      </div>
      <div class="step">
        <div class="step-number">4</div>
        <p>Confirm installation. The app icon will appear on your home screen!</p>
      </div>
      <a href="dist/index.html" class="open-app-btn" id="android-open-btn">Open App →</a>
      <div class="note" id="android-server-note" style="display: none;">
        <strong>📡 Need a server?</strong> PWAs need to be served from a web server. Upload the <code>dist/</code> folder to any free hosting (Netlify, Vercel, GitHub Pages) or use a local server on your computer.
      </div>
      <div class="note">
        <strong>💡 Tip:</strong> If you don't see an install button, tap the menu (⋮) in your browser and look for "Install app" or "Add to Home Screen"
      </div>
    </div>
    
    <!-- iOS Instructions -->
    <div id="ios-instructions" class="instructions">
      <h2>🍎 Install on iPhone/iPad</h2>
      <div class="step">
        <div class="step-number">1</div>
        <p>Upload the <strong>dist/</strong> folder to a web server (see options below)</p>
      </div>
      <div class="step">
        <div class="step-number">2</div>
        <p>Open the app URL in <strong>Safari</strong> (must use Safari!)</p>
      </div>
      <div class="step">
        <div class="step-number">3</div>
        <p>Tap the <strong>Share button</strong> (square with arrow) at the bottom</p>
      </div>
      <div class="step">
        <div class="step-number">4</div>
        <p>Scroll down and tap <strong>"Add to Home Screen"</strong></p>
      </div>
      <div class="step">
        <div class="step-number">5</div>
        <p>Tap <strong>"Add"</strong>. The app icon will appear on your home screen!</p>
      </div>
      <div class="note" style="background: rgba(255, 165, 0, 0.2); border-left-color: #ff9800;">
        <strong>📤 Free Hosting Options:</strong><br>
        • <strong>Netlify Drop:</strong> Drag & drop the <code>dist/</code> folder to <a href="https://app.netlify.com/drop" target="_blank" style="color: #ffd700;">app.netlify.com/drop</a><br>
        • <strong>Vercel:</strong> Upload to <a href="https://vercel.com" target="_blank" style="color: #ffd700;">vercel.com</a><br>
        • <strong>GitHub Pages:</strong> Upload to your GitHub repository<br>
        • <strong>Your own server:</strong> Upload <code>dist/</code> contents to your web hosting
      </div>
      <div class="note">
        <strong>⚠️ Important:</strong> You must use Safari on iOS. Chrome and other browsers cannot install PWAs on iPhone/iPad. The app must be served from a web server (not a local file).
      </div>
    </div>
    
    <!-- Desktop Instructions -->
    <div id="desktop-instructions" class="instructions">
      <h2>💻 Install on Desktop</h2>
      <div class="step">
        <div class="step-number">1</div>
        <p>Tap the <strong>"Open App"</strong> button below</p>
      </div>
      <div class="step">
        <div class="step-number">2</div>
        <p>Look for the <strong>install icon (➕)</strong> in your browser's address bar</p>
      </div>
      <div class="step">
        <div class="step-number">3</div>
        <p>Click <strong>"Install"</strong> to add the app to your computer</p>
      </div>
      <a href="dist/index.html" class="open-app-btn">Open App →</a>
      <div class="note">
        <strong>💡 Works on:</strong> Chrome, Edge, Firefox (Windows/Mac/Linux)
      </div>
    </div>
    
    <div class="note" style="margin-top: 30px; border-left-color: #4CAF50;">
      <strong>✅ Already installed?</strong> The app works offline after first installation. All your data is stored securely on your device.
    </div>
  </div>
  
  <script>
    // Auto-detect device and show appropriate instructions
    function detectDevice() {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      
      if (/android/i.test(userAgent)) {
        showInstructions('android');
      } else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        showInstructions('ios');
      } else {
        // Default to desktop for other devices
        showInstructions('desktop');
      }
    }
    
    function showInstructions(device) {
      // Hide all instructions
      document.querySelectorAll('.instructions').forEach(el => {
        el.classList.remove('active');
      });
      
      // Remove active class from all buttons
      document.querySelectorAll('.device-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      
      // Show selected instructions
      const instructions = document.getElementById(device + '-instructions');
      if (instructions) {
        instructions.classList.add('active');
      }
      
      // Highlight selected button
      event?.target?.classList.add('active');
    }
    
    // Check if running from file:// protocol (local file)
    const isLocalFile = window.location.protocol === 'file:';
    
    // Auto-detect on load
    detectDevice();
    
    // Handle local file access
    if (isLocalFile) {
      // Show server note for Android
      const androidNote = document.getElementById('android-server-note');
      if (androidNote) {
        androidNote.style.display = 'block';
      }
      
      // Update iOS instructions to emphasize server requirement
      const iosInstructions = document.getElementById('ios-instructions');
      if (iosInstructions) {
        const firstStep = iosInstructions.querySelector('.step');
        if (firstStep) {
          firstStep.innerHTML = '<div class="step-number">1</div><p><strong>⚠️ Server Required:</strong> PWAs must be served from a web server. Upload the <code>dist/</code> folder to free hosting (see options below) or use a local server on your computer.</p>';
        }
      }
      
      // Update open buttons to show server requirement
      document.querySelectorAll('.open-app-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
          if (isLocalFile) {
            e.preventDefault();
            alert('For mobile devices, the app must be served from a web server.\\n\\nPlease upload the dist/ folder to a web hosting service (Netlify, Vercel, etc.) or use a local server on your computer.\\n\\nSee the instructions above for free hosting options.');
          }
        });
      });
    }
    
    // Also allow manual selection
    document.querySelectorAll('.device-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const device = this.textContent.includes('Android') ? 'android' :
                      this.textContent.includes('iPhone') ? 'ios' : 'desktop';
        showInstructions(device);
        this.classList.add('active');
      });
    });
  </script>
</body>
</html>
`;

// Write the launcher HTML
if (!fs.existsSync(packageDir)) {
  fs.mkdirSync(packageDir, { recursive: true });
}

fs.writeFileSync(path.join(packageDir, 'index.html'), launcherHTML);
fs.writeFileSync(path.join(packageDir, 'INSTALL.html'), launcherHTML); // Also as INSTALL.html for clarity

console.log('✅ Mobile-first launcher HTML created!');
console.log('   - index.html (opens automatically)');
console.log('   - INSTALL.html (backup)');
