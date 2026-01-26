# Grounded - Distribution Package

**Grounded by AC MiNDS** - Privacy-first therapy integration app

## 📦 What's Included

This package contains native installers for Grounded on different operating systems:

- **Grounded.dmg** - macOS installer
- **Grounded_0.0.0_x64_en-US.msi** - Windows installer
- **Grounded.AppImage** - Linux installer
- **Grounded-Android.apk** - Android installer
- **INSTALLATION_GUIDE.md** - Complete installation instructions
- **QUICK_INSTALL_GUIDE.md** - Quick reference guide

## 📧 How to Distribute

### Option 1: Send Individual Installers

Send users only the installer for their operating system:

- **Mac users**: Send `Grounded.dmg` + `QUICK_INSTALL_GUIDE.md`
- **Windows users**: Send `Grounded_0.0.0_x64_en-US.msi` + `QUICK_INSTALL_GUIDE.md`
- **Linux users**: Send `Grounded.AppImage` + `QUICK_INSTALL_GUIDE.md`
- **Android users**: Send `Grounded-Android.apk` + `QUICK_INSTALL_GUIDE.md`

### Option 2: Send Complete Package

Send the entire `dist/installers/` folder as a zip file. Users can:
1. Extract the zip
2. Find their operating system's installer
3. Follow the installation guide

## 📝 Email Template

Use this template when sending installers:

```
Subject: Grounded App - Installation Files

Hi [Name],

I've attached the Grounded app installer for your device.

Please follow these simple steps:

1. Download the attached file
2. Open the QUICK_INSTALL_GUIDE.md file for your device type
3. Follow the 3-4 step installation process
4. Launch the app and create your account

The app is completely private - all data stays on your device.

If you have any questions or run into issues, please email me or contact:
ac.minds.ai@gmail.com

Best regards,
[Your Name]
```

## ✅ Pre-Distribution Checklist

Before sending installers:

- [ ] All installers built successfully
- [ ] Installers tested on each platform
- [ ] Installation guides included
- [ ] File sizes are reasonable (check for bloat)
- [ ] Version numbers are correct
- [ ] No sensitive information in files

## 🔒 Security Notes

- Installers are unsigned (users may see security warnings)
- This is normal for apps not from official app stores
- Users may need to allow installation from "unknown sources"
- All warnings are safe to bypass for this app

## 📱 Platform-Specific Notes

### macOS
- Users may need to allow installation in System Settings
- First launch may show security warning (normal)

### Windows
- Windows Defender may flag the installer
- Users need to click "More info" → "Run anyway"

### Linux
- Users need to make AppImage executable
- May need to install `libfuse2` on some distributions

### Android
- Users must enable "Install unknown apps"
- APK is not signed (may show warning)

## 🆘 Support

If users encounter issues:
1. Refer them to `INSTALLATION_GUIDE.md` (troubleshooting section)
2. Have them email: ac.minds.ai@gmail.com
3. Include their operating system and error message

## 📊 File Sizes (Approximate)

- macOS DMG: ~50-100 MB
- Windows MSI: ~50-100 MB
- Linux AppImage: ~50-100 MB
- Android APK: ~30-50 MB

## 🎯 Quick Start for Users

**Tell users to:**
1. Download the installer for their device
2. Open `QUICK_INSTALL_GUIDE.md`
3. Follow the 3-4 steps
4. Launch and enjoy!

**That's it!** No technical knowledge required.

---

**Questions?** Email: ac.minds.ai@gmail.com

