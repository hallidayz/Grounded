# Fixing COOP/COEP Headers for Installed PWA

## The Problem

If you installed the PWA on your Mac and see this message:
- "SharedArrayBuffer is not available"
- "Cross-origin isolation is not enabled"

This means the app was installed from a server that didn't send the required COOP/COEP headers.

## The Solution

You need to **reinstall the PWA** from a server that includes these headers. Here's how:

### Option 1: Use the Node.js Server (Recommended)

1. **Build the app** (if not already built):
   ```bash
   npm run build
   ```

2. **Start the server with headers**:
   ```bash
   npm run serve
   ```
   Or:
   ```bash
   node scripts/serve-pwa.js
   ```

3. **Open in browser**: Go to `http://localhost:8000`

4. **Uninstall the old PWA**:
   - On macOS: Open the app, then go to the menu bar → "Grounded" → "Quit"
   - Or: System Settings → Apps → Find "Grounded" → Remove

5. **Reinstall from the new server**:
   - In Safari/Chrome, go to `http://localhost:8000`
   - Click the install button in the address bar
   - Or: Safari → Share → "Add to Home Screen"

### Option 2: Use Vite Preview

1. **Build the app**:
   ```bash
   npm run build
   ```

2. **Preview with headers**:
   ```bash
   npm run preview
   ```

3. **Open**: Go to `http://localhost:8000`

4. **Uninstall and reinstall** (same as Option 1, steps 4-5)

### Option 3: Deploy to a Server with Headers

If you're deploying to a web server, configure it to send COOP/COEP headers. See `SERVER_CONFIG.md` for instructions for:
- Apache
- Nginx
- Express.js
- Netlify
- Vercel
- Cloudflare Pages
- Firebase Hosting

## Why This Happens

When you install a PWA:
1. The browser caches the app from the server
2. The browser remembers the **cross-origin isolation state** from the initial load
3. If the server didn't send COOP/COEP headers, the installed app won't have SharedArrayBuffer support

**Solution**: Reinstall from a server that sends the headers, and the browser will remember the correct state.

## Verification

After reinstalling, check the AI Diagnostics screen:
- ✅ SharedArrayBuffer should show as available
- ✅ Cross-Origin Isolation should be enabled
- ✅ AI models should load in multi-threaded mode (faster)

## Quick Test

Open browser console and run:
```javascript
console.log('SharedArrayBuffer:', typeof SharedArrayBuffer !== 'undefined');
console.log('Cross-Origin Isolated:', self.crossOriginIsolated);
```

Both should be `true` if headers are working correctly.

