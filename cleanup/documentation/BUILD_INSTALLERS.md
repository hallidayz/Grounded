# Building Installers for All Platforms

This guide explains how to build native installers for Grounded on each operating system.

## Prerequisites

**Quick Check**: Run `npm run check:prerequisites` to verify your setup!

### All Platforms
- Node.js 18+ installed
- npm installed
- Git (optional, for version control)

**See PREREQUISITES.md for detailed installation instructions.**

### macOS Builds
- macOS computer (required)
- Xcode Command Line Tools: `xcode-select --install`
- Rust (installed automatically by Tauri)

### Windows Builds
- Windows computer (required)
- Microsoft Visual C++ Build Tools
- Rust (installed automatically by Tauri)

### Linux Builds
- Linux computer (any distribution)
- System dependencies:
  ```bash
  # Debian/Ubuntu
  sudo apt-get update
  sudo apt-get install libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev

  # Fedora
  sudo dnf install webkit2gtk3-devel.x86_64 \
    openssl-devel \
    curl \
    wget \
    libappindicator \
    librsvg2-devel

  # Arch
  sudo pacman -S webkit2gtk \
    base-devel \
    curl \
    wget \
    openssl \
    appmenu-gtk-module \
    gtk3 \
    libappindicator-gtk3 \
    librsvg \
    libvips
  ```

### Android Builds
- Android Studio installed
- Android SDK (API 33 or later)
- JAVA_HOME environment variable set
- ANDROID_HOME environment variable set

### iOS Builds
- **macOS computer** (required - iOS builds can only be done on Mac)
- **Xcode** from App Store
- **CocoaPods**: `sudo gem install cocoapods`
- **Apple Developer Account** ($99/year) for App Store or TestFlight distribution
- **Xcode Command Line Tools**: `xcode-select --install` (if not already installed)

## Build Commands

### Step 1: Check Prerequisites

Before building, verify you have everything installed:

```bash
npm run check:prerequisites
```

This will show you what's installed and what's missing.

### Step 2: Build Installers

### Build All Desktop Platforms

```bash
npm run build:desktop
```

This creates installers for:
- **macOS**: `.dmg` file
- **Windows**: `.msi` file  
- **Linux**: `.AppImage` file

**Output locations:**
- macOS: `src-tauri/target/release/bundle/macos/Grounded.dmg`
- Windows: `src-tauri/target/release/bundle/msi/Grounded_0.0.0_x64_en-US.msi`
- Linux: `src-tauri/target/release/bundle/appimage/Grounded.AppImage`
- iOS: `ios/App/build/Release-iphoneos/` (after Xcode build) or `.ipa` file (after archive/distribute)

### Build macOS Only

```bash
npm run build:desktop -- --target x86_64-apple-darwin
```

Or for Apple Silicon:
```bash
npm run build:desktop -- --target aarch64-apple-darwin
```

### Build Windows Only

```bash
npm run build:desktop -- --target x86_64-pc-windows-msvc
```

### Build Linux Only

```bash
npm run build:desktop -- --target x86_64-unknown-linux-gnu
```

### Build Android APK

```bash
npm run build:android
```

**Output location:**
- `android/app/build/outputs/apk/release/app-release.apk`

### Build iOS Only

```bash
npm run build:ios
```

This syncs the web build to iOS and prepares the project for Xcode.

**Note**: iOS builds require:
- macOS computer (required)
- Xcode installed from App Store
- CocoaPods: `sudo gem install cocoapods`
- Apple Developer Account ($99/year) for distribution

**After running `build:ios`**:
1. Open in Xcode: `npx cap open ios`
2. Configure signing in Xcode (select your development team)
3. Build and archive: Product → Archive
4. Distribute: Product → Distribute App

**Quick Xcode workflow**:
```bash
npm run build:ios:xcode  # Builds and opens Xcode automatically
```

### Build All Mobile Platforms

```bash
npm run build:all:mobile
```

This builds both Android and iOS (iOS requires macOS and Xcode).

### Build Everything

```bash
npm run build:all
```

This builds:
- Desktop installers (all platforms)
- Android APK

## Build Process Details

### First Build
- **Time**: 10-20 minutes
- Downloads Rust toolchain and dependencies
- Compiles Rust code
- Builds frontend
- Creates installers

### Subsequent Builds
- **Time**: 2-5 minutes
- Only rebuilds changed files
- Much faster

## Organizing Build Outputs

After building, organize your installers:

```bash
# Create output directory
mkdir -p dist/installers

# Copy macOS installer
cp src-tauri/target/release/bundle/macos/Grounded.dmg dist/installers/

# Copy Windows installer
cp src-tauri/target/release/bundle/msi/Grounded_*.msi dist/installers/

# Copy Linux installer
cp src-tauri/target/release/bundle/appimage/Grounded.AppImage dist/installers/

# Copy Android APK
cp android/app/build/outputs/apk/release/app-release.apk dist/installers/

# Copy iOS IPA (if built in Xcode)
cp ios/App/build/Release-iphoneos/*.ipa dist/installers/ 2>/dev/null || echo "iOS IPA not found - build in Xcode first"
```

## Creating Distribution Packages

### Option 1: Individual Platform Packages

Create separate zip files for each platform:

```bash
# macOS package
cd dist/installers
zip -r Grounded-macOS.zip Grounded.dmg INSTALLATION_GUIDE.md
cd ../..

# Windows package
cd dist/installers
zip -r Grounded-Windows.zip Grounded_*.msi INSTALLATION_GUIDE.md
cd ../..

# Linux package
cd dist/installers
zip -r Grounded-Linux.zip Grounded.AppImage INSTALLATION_GUIDE.md
cd ../..

# Android package
cd dist/installers
zip -r Grounded-Android.zip app-release.apk INSTALLATION_GUIDE.md
cd ../..

# iOS package (if IPA exists)
cd dist/installers
if [ -f *.ipa ]; then
  zip -r Grounded-iOS.zip *.ipa INSTALLATION_GUIDE.md
fi
cd ../..
```

### Option 2: All-in-One Package

```bash
cd dist/installers
zip -r Grounded-All-Platforms.zip *.dmg *.msi *.AppImage *.apk *.ipa INSTALLATION_GUIDE.md 2>/dev/null || \
zip -r Grounded-All-Platforms.zip *.dmg *.msi *.AppImage *.apk INSTALLATION_GUIDE.md
cd ../..
```

## Testing Installers

### macOS
1. Double-click the `.dmg` file
2. Drag app to Applications
3. Launch and verify it works
4. **✅ Desktop/Launchpad Icon**: App automatically appears in Launchpad and can be added to Dock

### Windows
1. Double-click the `.msi` file
2. Follow installation wizard
3. Launch from Start menu
4. Verify it works
5. **✅ Desktop/Start Menu Shortcut**: Automatically created - app appears in Start menu and optionally on desktop

### Linux
1. Make AppImage executable: `chmod +x Grounded.AppImage`
2. Run: `./Grounded.AppImage`
3. Verify it works

### Android
1. Transfer APK to Android device
2. Enable "Install unknown apps"
3. Install and launch
4. Verify it works
5. **✅ Home Screen Icon**: Automatically created - app appears in app drawer and can be added to home screen

### iOS
1. **For TestFlight/App Store**: Upload IPA to App Store Connect
2. **For Ad Hoc Distribution**: 
   - Install on registered devices via Xcode
   - Or distribute via Apple Configurator
3. **For Enterprise**: Use enterprise distribution method
4. Launch and verify it works
5. **✅ Home Screen Icon**: Automatically created on iOS - app appears on home screen after installation

**Note**: iOS installation requires:
- Apple Developer account ($99/year)
- Device registered in developer portal (for Ad Hoc)
- Or App Store/TestFlight approval (for public distribution)

## Code Signing (Optional but Recommended)

### macOS Code Signing
1. Get Apple Developer certificate
2. Update `src-tauri/tauri.conf.json`:
   ```json
   "macOS": {
     "signingIdentity": "Developer ID Application: Your Name"
   }
   ```

### Windows Code Signing
1. Get code signing certificate
2. Update `src-tauri/tauri.conf.json`:
   ```json
   "windows": {
     "certificateThumbprint": "your-certificate-thumbprint"
   }
   ```

## Version Management

Update version before building:

1. **package.json**: Update `version` field
2. **src-tauri/tauri.conf.json**: Update `version` field
3. **src-tauri/Cargo.toml**: Update `version` field

Then rebuild:
```bash
npm run build:desktop
```

## Troubleshooting

### Build Fails on macOS
- Ensure Xcode Command Line Tools are installed
- Run: `xcode-select --install`

### Build Fails on Windows
- Install Visual C++ Build Tools
- Restart terminal after installation

### Build Fails on Linux
- Install all required system dependencies (see Prerequisites)
- Ensure Rust is installed: `rustc --version`

### Android Build Fails
- Verify Android Studio is installed
- Check ANDROID_HOME is set: `echo $ANDROID_HOME`
- Check JAVA_HOME is set: `echo $JAVA_HOME`

## Distribution Checklist

Before distributing installers:

- [ ] Version numbers updated
- [ ] All platforms built successfully
- [ ] Installers tested on each platform
- [ ] Installation guide included
- [ ] Code signing applied (if applicable)
- [ ] Installers organized in distribution folder
- [ ] Zip packages created for easy distribution

## Quick Reference

```bash
# Build desktop installers
npm run build:desktop

# Build Android APK
npm run build:android

# Build everything
npm run build:all

# Development mode (with hot reload)
npm run dev:tauri
```

## Support

For build issues:
- Check Tauri documentation: https://tauri.app/
- Check Capacitor documentation: https://capacitorjs.com/
- Email: ac.minds.ai@gmail.com

