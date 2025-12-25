# Prerequisites for Building Grounded

Before building native installers, you need to install the required tools for your target platform.

## 🖥️ Desktop Builds (macOS, Windows, Linux)

### Required: Rust

Tauri uses Rust to build native desktop applications. You must install Rust before building desktop installers.

#### Install Rust

**macOS/Linux:**
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

After installation:
1. Restart your terminal
2. Verify installation: `cargo --version`
3. You should see something like: `cargo 1.xx.x (xxxxx xxxx-xx-xx)`

**Windows:**
1. Download and run: https://rustup.rs/
2. Follow the installation wizard
3. Restart your terminal/command prompt
4. Verify: `cargo --version`

#### Additional Requirements

**macOS:**
- Xcode Command Line Tools (usually installed automatically)
- If not: `xcode-select --install`

**Windows:**
- Microsoft Visual C++ Build Tools
- Download: https://visualstudio.microsoft.com/visual-cpp-build-tools/

**Linux:**
- System dependencies (varies by distribution):
  ```bash
  # Debian/Ubuntu
  sudo apt-get install libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev
  ```

## 📱 Android Builds

### Required: Android Studio

1. **Download Android Studio**: https://developer.android.com/studio
2. **Install Android SDK**:
   - Open Android Studio
   - Go to Tools → SDK Manager
   - Install Android SDK Platform 33 (or latest)
   - Install Android SDK Build-Tools

3. **Set Environment Variables**:

   **macOS/Linux** (add to `~/.zshrc` or `~/.bash_profile`):
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   ```

   **Windows** (add to System Environment Variables):
   - `ANDROID_HOME`: `C:\Users\YourName\AppData\Local\Android\Sdk`
   - Add to PATH: `%ANDROID_HOME%\platform-tools`

4. **Install Java JDK**:
   - Android Studio includes JDK, or install separately
   - Verify: `java -version`

5. **Reload terminal**:
   ```bash
   source ~/.zshrc  # or source ~/.bash_profile
   ```

6. **Verify setup**:
   ```bash
   echo $ANDROID_HOME  # Should show path to Android SDK
   adb version         # Should show Android Debug Bridge version
   ```

## 🍎 iOS Builds (macOS Only)

### Required:
- **Mac computer** (required)
- **Xcode** from App Store
- **CocoaPods**: `sudo gem install cocoapods`
- **Apple Developer Account** ($99/year) for distribution

## ✅ Quick Check

Run these commands to verify your setup:

```bash
# Check Rust
cargo --version

# Check Node.js
node --version

# Check npm
npm --version

# Check Android (if building Android)
echo $ANDROID_HOME
adb version
```

## 🚀 After Installation

Once prerequisites are installed:

1. **Restart your terminal**
2. **Verify installations** (commands above)
3. **Build installers**:
   ```bash
   npm run build:installers
   ```

## 📚 Alternative: PWA Build (No Prerequisites)

If you don't want to install Rust/Android Studio, you can build the PWA version instead:

```bash
npm run build:pwa
```

This creates a web-based version that users can install via their browser (no native installers needed).

## ❓ Troubleshooting

### Rust Installation Issues

**"command not found: cargo"**
- Make sure you restarted your terminal after installation
- Check if Rust is in PATH: `echo $PATH | grep cargo`
- Try: `source $HOME/.cargo/env`

**Build fails with Rust errors**
- Update Rust: `rustup update`
- Check Rust version: `rustc --version` (should be 1.70+)

### Android Installation Issues

**"ANDROID_HOME not set"**
- Make sure you added the environment variables
- Restart terminal after adding
- Check: `echo $ANDROID_HOME`

**"Java not found"**
- Install JDK or use the one bundled with Android Studio
- Set JAVA_HOME if needed

**"Gradle build fails"**
- Make sure Android SDK is properly installed
- Check Android Studio → SDK Manager for missing components

## 📧 Need Help?

If you're stuck:
- Email: **ac.minds.ai@gmail.com**
- Include your operating system and error messages

---

**Next Step**: Once prerequisites are installed, run `npm run build:installers` to create installers!

