# Grounded Installation Guide

**Grounded by AC MiNDS** - Version 1.13.1

Privacy-first therapy integration app for values-based reflection and mental health support.

Welcome! This guide will help you install Grounded on your device.

---

## 🌐 PWA Installation (Works on All Devices)

**🚀 Fully Automated - Just Extract & Double-Click!**

Grounded is installed as a Progressive Web App (PWA). Everything is automated - no commands, no uploads, no configuration needed!

### Quick Start (Super Easy!)

1. **Extract** the `Grounded-PWA.zip` file to any folder
2. **Double-click** `START.sh` (Mac/Linux) or `START.bat` (Windows)
3. **That's it!** Everything happens automatically:
   - ✅ Server starts automatically
   - ✅ Browser opens automatically
   - ✅ App loads automatically
   - ✅ QR code shown for mobile devices

### For Desktop Users (Windows, Mac, Linux)

**Just double-click `START.sh` or `START.bat`**

- Server starts automatically on your computer
- Browser opens automatically showing the app
- Click the install icon (➕) in your browser's address bar
- Click "Install" to add to your desktop/applications
- Done! App icon appears and works offline

**No commands, no configuration, no uploads needed!**

### For Mobile Users (Android & iPhone)

**Super Easy Method:**

1. Extract the ZIP file on your **computer** (not your phone)
2. Double-click `START.sh` or `START.bat` on your computer
3. Server starts automatically and shows a **QR code** in the terminal
4. **Make sure your phone is on the same WiFi network** as your computer
5. **Scan the QR code** with your phone's camera
6. App opens on your phone automatically
7. Tap "Install" or "Add to Home Screen" in your browser
8. Done! App icon appears on your home screen

**That's it!** No uploads to Vercel/Netlify, no server configuration, no commands needed.

### What Gets Installed

When you install the PWA:
- ✅ App icon appears on your home screen/desktop
- ✅ Opens in standalone mode (no browser UI)
- ✅ Works completely offline after first load
- ✅ AI models included (no download needed!)
- ✅ Automatic updates when online
- ✅ All data stored locally on your device

### Installation Steps by Platform

**Chrome/Edge (Windows, Mac, Android):**
1. After double-clicking START.sh/START.bat, browser opens automatically
2. Look for the install icon (➕) in the address bar
3. Click **"Install"** or **"Add to Home Screen"**
4. Confirm installation
5. App icon appears in your applications/apps menu

**Safari (iOS/macOS):**
1. After scanning QR code (mobile) or opening in Safari (desktop)
2. Tap the **Share** button (square with arrow)
3. Scroll down and tap **"Add to Home Screen"** (iOS) or **"Add to Dock"** (macOS)
4. Tap **"Add"** in the top right
5. App icon appears on your home screen/Dock

**Firefox:**
1. After opening the app
2. Click the menu (three lines) → **"Install"**
3. Confirm installation
4. App appears in your applications menu

### Benefits of PWA Installation

- ✅ **Works on all platforms** - Windows, Mac, Linux, Android, iPhone/iPad
- ✅ **Fully automated** - No commands, no uploads, no configuration
- ✅ **Works offline** - After first load, works without internet
- ✅ **App-like experience** - No browser UI, feels like a native app
- ✅ **Automatic updates** - Updates when you're online
- ✅ **No app store required** - Install directly from browser
- ✅ **AI models included** - No download wait, instant loading
- ✅ **Privacy-first** - All data stored locally on your device

### Requirements

**For the Auto-Launcher:**
- **Node.js** (free, https://nodejs.org) - The launcher checks automatically and shows install link if missing
- **Same WiFi network** (for mobile QR code access)

**For the App:**
- Modern browser (Chrome, Edge, Safari, Firefox)
- That's it! No other requirements.

### Troubleshooting PWA Installation

**"Node.js not found" error:**
- Install Node.js from https://nodejs.org (free, takes 2 minutes)
- Then double-click START.sh/START.bat again

**Browser doesn't open automatically:**
- Manually open your browser
- Visit: `http://localhost:8000`
- The app will load

**Mobile QR code doesn't work:**
- Make sure phone and computer are on the same WiFi network
- Check firewall settings on your computer
- Try typing the URL manually shown in terminal
- The terminal shows both the QR code URL and the direct URL

**Install button doesn't appear:**
- Make sure you're using Chrome, Edge, Safari, or Firefox
- Try refreshing the page
- Check browser console for errors (F12 → Console)
- Some browsers require the app to be visited a few times before showing install prompt

**Port 8000 already in use:**
- Close any other applications using port 8000
- Or edit START.sh/START.bat to use a different port (advanced)

**Can't access from mobile device:**
- Make sure both devices are on the same WiFi network
- Check your computer's firewall isn't blocking connections
- Try using the computer's IP address directly: `http://[your-ip]:8000`

---

## ❓ Troubleshooting

### General Issues

**App won't load:**
- Make sure the server is running (you should see it in terminal)
- Check that you're visiting `http://localhost:8000` (not `https://`)
- Try refreshing the page

**AI models don't work:**
- Make sure you're accessing via `http://localhost:8000` (not `file://`)
- Check browser console (F12) for errors
- Models are bundled in the package - they should load automatically

**App icon doesn't appear after installation:**
- On mobile: Check your home screen - it may be on a different page
- On desktop: Check your applications menu or Start menu
- Try uninstalling and reinstalling the PWA

**Data not saving:**
- Make sure you're using the installed PWA (not just the browser tab)
- Check browser storage settings (some browsers block local storage)
- Try clearing browser cache and reinstalling

---

## 🔒 Security & Privacy

- All data is stored **locally on your device**
- No data is sent to external servers
- All AI processing happens **on your device**
- No account required for basic use
- AI models included in package (no external downloads)
- Works completely offline after first load

---

## 📧 Need Help?

If you encounter any issues during installation:
- Email: **ac.minds.ai@gmail.com**
- Include your operating system and error message (if any)
- Check the troubleshooting section above first

---

## ✅ Verification

After installation, verify everything works:
1. Open the Grounded app (from home screen/desktop icon)
2. You should see the login/registration screen
3. Create an account or log in
4. Accept the terms and conditions
5. AI models load instantly (bundled in package - no download needed!)
6. Once models are loaded, the app should work without errors

**Congratulations!** You're ready to start using Grounded. 🎉

### First Launch Notes

- **AI Models**: Models are bundled in the package, so they load instantly - no download wait!
- **Offline Use**: Once loaded, the app works completely offline
- **If Models Fail to Load**: The app will continue to work with rule-based responses. AI features will be unavailable, but core functionality remains.
- **Updates**: The app will automatically check for updates when you're online and connected to the server

---

## 📱 Platform-Specific Notes

### Android
- Use Chrome or Edge for best experience
- Install prompt appears automatically after a few seconds
- App works offline after installation

### iPhone/iPad
- **Must use Safari** - Chrome and other browsers cannot install PWAs on iOS
- Tap Share button → "Add to Home Screen"
- App works offline after installation

### Desktop (Windows/Mac/Linux)
- Works in Chrome, Edge, Firefox, or Safari
- Install icon appears in address bar
- App opens in standalone window (no browser UI)
- Can be pinned to taskbar/Dock

---

**That's it!** The PWA installation method works on all platforms and requires no technical knowledge. Just extract, double-click, and install! 🚀
