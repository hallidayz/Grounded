# Grounded PWA - Mobile-First Installation

**📱 Perfect for Android & iPhone users!**

This package contains the complete Grounded by AC MiNDS Progressive Web App.

## 🚀 Quick Start - Just Extract & Open!

1. **Extract** this ZIP file to any folder
2. **Double-click** `index.html` (or `INSTALL.html`)
3. **Follow the on-screen instructions** for your device

The launcher page will automatically:
- ✅ Detect if you're on Android, iPhone, or Desktop
- ✅ Show step-by-step installation instructions
- ✅ Open the app with one click

## 📱 For Mobile Users (Android & iPhone)

### Android:
1. Extract the ZIP file
2. Open `index.html` in Chrome
3. Tap "Open App" button
4. When the app loads, tap "Install" in the browser
5. Done! App icon appears on home screen

### iPhone/iPad:
1. Extract the ZIP file  
2. Open `index.html` in **Safari** (must use Safari!)
3. Tap "Open App in Safari" button
4. Tap Share button → "Add to Home Screen"
5. Done! App icon appears on home screen

**💡 Tip:** For mobile, you can also upload the `dist/` folder to a web server and share the URL.

## 💻 For Desktop Users

### Option 1: Upload to Web Server (Recommended)
1. Upload `dist/` folder contents to your web server
2. Visit the URL in your browser
3. Click install icon in address bar

### Option 2: Run Local Server
**Mac/Linux:**
```bash
./start.sh
```

**Windows:**
```cmd
start.bat
```

Or with Node.js:
```bash
node launcher.js
```

## 📁 What's Inside

- `index.html` / `INSTALL.html` - **Start here!** Mobile-friendly launcher
- `dist/` - The React app (upload this to a web server)
- `launcher.js` - Local server for desktop (Node.js)
- `start.sh` / `start.bat` - Desktop server launchers
- `INSTALLATION_GUIDE.md` - Detailed instructions

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

See `INSTALLATION_GUIDE.md` for detailed troubleshooting.

---
Generated: 2026-01-01T03:07:38.695Z
