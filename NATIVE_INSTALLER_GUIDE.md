# Grounded - Native Installer Guide

**Grounded by AC MiNDS** - Privacy-first therapy integration app

## 📦 Building Native Installers

Grounded can be built as native installers for easy distribution. Users simply double-click to install - no browser setup required!

---

## 🖥️ Desktop Installers (DMG/EXE)

### Prerequisites
- **Rust** (installed automatically if needed)
- **macOS**: Xcode Command Line Tools
- **Windows**: Microsoft Visual C++ Build Tools

### Build Desktop Installers

```bash
npm run build:desktop
```

This will create:
- **macOS**: `src-tauri/target/release/bundle/macos/Grounded.dmg`
- **Windows**: `src-tauri/target/release/bundle/msi/Grounded_0.0.0_x64_en-US.msi`
- **Linux**: `src-tauri/target/release/bundle/appimage/Grounded.AppImage`

### Development Mode

```bash
npm run dev:tauri
```

Runs the app in Tauri development mode with hot reload.

---

## 📱 Android Installer (APK)

### Prerequisites
- **Android Studio** installed
- **Android SDK** configured
- **JAVA_HOME** environment variable set
- **ANDROID_HOME** environment variable set

### Setup Android Environment

1. **Install Android Studio**: https://developer.android.com/studio
2. **Install Android SDK**:
   - Open Android Studio
   - Go to Tools → SDK Manager
   - Install Android SDK Platform 33 (or latest)
   - Install Android SDK Build-Tools

3. **Set Environment Variables** (add to `~/.zshrc` or `~/.bash_profile`):
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   ```

4. **Reload shell**:
   ```bash
   source ~/.zshrc  # or source ~/.bash_profile
   ```

### Build Android APK

**Release APK (for distribution):**
```bash
npm run build:android
```

**Debug APK (for testing):**
```bash
npm run build:android:debug
```

This will create:
- **Release**: `android/app/build/outputs/apk/release/app-release.apk`
- **Debug**: `android/app/build/outputs/apk/debug/app-debug.apk`

### Signing APK (Optional but Recommended)

For production distribution, you should sign your APK:

1. **Generate keystore**:
   ```bash
   keytool -genkey -v -keystore grounded-release.keystore -alias grounded -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Update `capacitor.config.ts`**:
   ```typescript
   android: {
     buildOptions: {
       keystorePath: 'path/to/grounded-release.keystore',
       keystoreAlias: 'grounded',
       keystorePassword: 'your-password',
       keystoreType: 'jks'
     }
   }
   ```

---

## 🍎 iOS Installer (IPA) - Mac Only

### Prerequisites
- **Mac computer** (required)
- **Xcode** installed
- **Apple Developer Account** ($99/year) for distribution
- **CocoaPods** installed: `sudo gem install cocoapods`

### Setup iOS

```bash
npm install @capacitor/ios
npx cap add ios
```

### Build iOS App

1. **Open in Xcode**:
   ```bash
   npx cap open ios
   ```

2. **Configure signing**:
   - Select your development team
   - Configure bundle identifier

3. **Build**:
   - Product → Archive
   - Distribute App

**Note**: iOS builds require an Apple Developer account and can only be done on macOS.

---

## 📦 Complete Build

Build all platforms at once:

```bash
npm run build:all
```

This builds:
- Desktop installers (DMG/EXE)
- Android APK

---

## 📋 Build Output Locations

After building, installers are located at:

- **Desktop (macOS)**: `src-tauri/target/release/bundle/macos/Grounded.dmg`
- **Desktop (Windows)**: `src-tauri/target/release/bundle/msi/Grounded_0.0.0_x64_en-US.msi`
- **Android (Release)**: `android/app/build/outputs/apk/release/app-release.apk`
- **Android (Debug)**: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🚀 Distribution

### Option 1: Direct Distribution
- Email the installer files directly
- Users double-click to install
- No technical knowledge required

### Option 2: Package Everything
```bash
npm run build:all
npm run package
```

This creates a `package/` folder with:
- `installers/` - All native installers
- `dist/` - Web version (PWA)
- `INSTALLATION_GUIDE.md` - User instructions

### Option 3: App Stores (Future)
- **Mac App Store**: Requires Apple Developer account + code signing
- **Microsoft Store**: Requires Microsoft Developer account
- **Google Play Store**: Requires Google Play Developer account ($25 one-time)

---

## 🔧 Troubleshooting

### Tauri Build Issues

**"Rust not found"**:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

**"Command not found: tauri"**:
```bash
npm install -g @tauri-apps/cli
# Or use: npx tauri build
```

### Android Build Issues

**"ANDROID_HOME not set"**:
- Set environment variables (see Prerequisites above)
- Restart terminal

**"Gradle build failed"**:
- Ensure Android SDK is installed
- Check `android/local.properties` exists
- Try: `cd android && ./gradlew clean`

**"SDK location not found"**:
- Create `android/local.properties`:
  ```properties
  sdk.dir=/Users/yourname/Library/Android/sdk
  ```

### General Issues

**Build takes too long**:
- First build downloads dependencies (10-20 minutes)
- Subsequent builds are faster (2-5 minutes)

**Out of memory errors**:
- Increase Node.js memory: `NODE_OPTIONS=--max-old-space-size=4096 npm run build:android`

---

## 📊 File Sizes

Expected installer sizes:
- **DMG (macOS)**: ~15-25 MB
- **EXE (Windows)**: ~20-30 MB
- **APK (Android)**: ~15-20 MB
- **Total with AI models**: ~115-150 MB (models download on first use)

---

## ✅ Verification

After building, verify installers work:

1. **Desktop**: Double-click DMG/EXE and install
2. **Android**: Transfer APK to device and install
3. **Test**: Launch app and verify functionality

---

**Need help?** Check the main README.md or INSTALLATION_GUIDE.md

