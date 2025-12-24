# Grounded - Installation Guide

**Grounded by AC MiNDS** - Privacy-first therapy integration app

## 🎯 Choose Your Installation Method

Grounded can be installed in two ways:

1. **Native Installers (Recommended)** - Double-click to install, just like any other app
2. **Progressive Web App (PWA)** - Install via browser

---

## ✅ Method 1: Native Installers (Easiest - Recommended)

If you received installer files (`.dmg`, `.exe`, or `.apk`), use this method. It's the simplest!

### 🖥️ Desktop (Mac/Windows)

**For Mac (DMG file):**
1. Double-click the `.dmg` file
2. Drag "Grounded" to your Applications folder
3. Open Applications and launch Grounded
4. Done! The app is installed.

**For Windows (EXE file):**
1. Double-click the `.exe` file
2. Follow the installation wizard
3. Click "Install" when prompted
4. Launch Grounded from your Start menu
5. Done! The app is installed.

### 📱 Android (APK file)

1. Transfer the `.apk` file to your Android device (via email, USB, or cloud storage)
2. On your Android device, open Settings → Security
3. Enable "Install from unknown sources" or "Allow from this source"
4. Tap the `.apk` file to install
5. Tap "Install" when prompted
6. Launch Grounded from your app drawer
7. Done! The app is installed.

**That's it!** No browser setup, no technical knowledge needed. Just double-click and install.

---

## 📱 Method 2: Progressive Web App (PWA)

If you don't have installer files, you can install via your browser. This requires a few more steps.

---

## 🤖 Android Installation

### Method 1: Chrome Browser (Recommended)

1. **Open the app** in Chrome browser on your Android device
   - Navigate to the app URL (provided via email or link)
   - Or scan a QR code if provided

2. **Wait for install prompt**
   - Chrome will show a banner at the bottom: "Add Grounded to Home screen"
   - Tap **"Add"** or **"Install"**

3. **Manual installation** (if prompt doesn't appear):
   - Tap the **menu icon** (three dots) in Chrome
   - Select **"Add to Home screen"** or **"Install app"**
   - Tap **"Add"** or **"Install"**

4. **Launch the app**
   - Find the Grounded icon on your home screen
   - Tap to open (it will run like a native app)

### Method 2: Other Android Browsers

- **Samsung Internet**: Menu → Add page to → Home screen
- **Firefox**: Menu → Install
- **Edge**: Menu → Apps → Install this site as an app

---

## 🍎 iOS Installation (iPhone/iPad)

### Safari Browser (Required for iOS)

1. **Open the app** in Safari browser
   - **Important**: Must use Safari, not Chrome or other browsers
   - Navigate to the app URL

2. **Add to Home Screen**:
   - Tap the **Share button** (square with arrow) at the bottom
   - Scroll down and tap **"Add to Home Screen"**
   - Edit the name if desired (default: "Grounded")
   - Tap **"Add"** in the top right

3. **Launch the app**:
   - Find the Grounded icon on your home screen
   - Tap to open (it will run in standalone mode)

### iOS Notes:
- The app works offline after first load
- Data is stored locally on your device
- No App Store download required
- Works on iOS 11.3 and later

---

## 💻 Desktop Installation

### Chrome/Edge (Windows, Mac, Linux)

1. **Open the app** in Chrome or Edge browser
2. Look for the **install icon** in the address bar (usually a "+" or download icon)
3. Click **"Install"** when prompted
4. The app will open in its own window

### Firefox

1. Open the app in Firefox
2. Click the **menu** (three lines) → **More Tools** → **Install Site as App**

---

## ✅ Verification

After installation, verify it's working:

1. **Check for standalone mode**:
   - App should open without browser address bar
   - Should have its own icon on home screen/desktop

2. **Test offline functionality**:
   - Turn off Wi-Fi/mobile data
   - App should still work (after initial load)

3. **Check data storage**:
   - Create a test entry
   - Close and reopen app
   - Data should persist

---

## 🔄 Updating the App

The app **automatically updates** when you have an internet connection:
- Open the installed app
- It will check for updates in the background
- New version loads automatically (no manual update needed)

To force an update:
- **Android**: Uninstall and reinstall, or clear app data
- **iOS**: Delete from home screen and re-add

---

## 🛠️ Troubleshooting

### App won't install

**Android:**
- Make sure you're using Chrome browser
- Check that JavaScript is enabled
- Try clearing browser cache
- Ensure you have storage space available

**iOS:**
- Must use Safari (not Chrome or other browsers)
- iOS 11.3 or later required
- Check Safari settings → Allow websites to add to Home Screen

### App won't work offline

- Make sure you've opened the app at least once while online
- Check that service worker is enabled in browser settings
- Try clearing browser cache and reinstalling

### Data not saving

- Check browser storage permissions
- Ensure you're not in private/incognito mode
- Check available storage space on device

---

## 📧 Getting the App

The app is distributed as a **zip file** containing:
- `dist/` folder with all app files
- This installation guide
- A simple web server script (optional)

### Quick Start (For Developers)

1. Extract the zip file
2. Serve the `dist/` folder using any web server:
   ```bash
   # Python
   cd dist
   python -m http.server 8000
   
   # Node.js
   npx serve dist
   
   # PHP
   php -S localhost:8000 -t dist
   ```
3. Open `http://localhost:8000` in a browser
4. Follow installation instructions above

### Production Deployment

For production, upload the `dist/` folder contents to:
- Any web hosting service (Netlify, Vercel, GitHub Pages, etc.)
- Your own web server
- A CDN

**Important**: The app must be served over **HTTPS** (or localhost) for PWA features to work.

---

## 🔒 Privacy & Security

- All data is stored **locally on your device**
- No data is sent to external servers
- Works completely offline after initial load
- No account or login required for basic functionality
- All AI processing happens on your device

---

## 📞 Support

If you encounter issues:
1. Check this guide's troubleshooting section
2. Ensure your browser is up to date
3. Try clearing browser cache
4. Reinstall the app if needed

---

**Version**: 1.0.0  
**Last Updated**: 2024

