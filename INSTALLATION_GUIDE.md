# Grounded Installation Guide

**Grounded by AC MiNDS** - Version 1.12.26

Privacy-first therapy integration app for values-based reflection and mental health support.

Welcome! This guide will help you install Grounded on your device. Choose your operating system below.

---

## 🍎 macOS Installation

### Step 1: Download the Installer
- You should have received a file named `Grounded.dmg`
- If not, contact your therapist or download from the provided link

### Step 2: Install the App
1. **Double-click** the `Grounded.dmg` file
2. A window will open showing the Grounded app icon
3. **Drag** the Grounded app icon to your **Applications folder**
4. Wait for the copy to complete
5. **Eject** the disk image (click the eject button next to "Grounded" in Finder)

### Step 3: Open the App
1. Open **Finder**
2. Go to **Applications**
3. **Double-click** "Grounded" to launch
4. If you see a security warning:
   - Go to **System Settings** → **Privacy & Security**
   - Click **"Open Anyway"** next to the Grounded message
   - Confirm by clicking **"Open"**

### That's it! 🎉
The app is now installed and ready to use.

**✅ Installation Success Indicator**: The app will appear in your Start menu, confirming successful installation. You can also pin it to your taskbar or create a desktop shortcut for quick access.

---

## 🪟 Windows Installation

### Step 1: Download the Installer
- You should have received a file named `Grounded_1.12.26_x64_en-US.msi` or `Grounded.exe`
- If not, contact your therapist or download from the provided link

### Step 2: Install the App
1. **Double-click** the installer file
2. If Windows shows a security warning:
   - Click **"More info"**
   - Click **"Run anyway"**
3. The installation wizard will open
4. Click **"Next"** to continue
5. Choose installation location (default is fine)
6. Click **"Install"**
7. Wait for installation to complete
8. Click **"Finish"**

### Step 3: Open the App
1. Click the **Start menu** (Windows icon)
2. Type **"Grounded"**
3. Click on **Grounded** to launch

### That's it! 🎉
The app is now installed and ready to use.

**✅ Installation Success Indicator**: The app will appear in your Start menu, confirming successful installation. You can also pin it to your taskbar or create a desktop shortcut for quick access.

---

## 🐧 Linux Installation

### Option A: AppImage (Easiest - Works on Most Linux Distributions)

#### Step 1: Download
- You should have received a file named `Grounded.AppImage`
- If not, contact your therapist or download from the provided link

#### Step 2: Make it Executable
1. Open **Terminal**
2. Navigate to where you downloaded the file:
   ```bash
   cd ~/Downloads
   ```
3. Make the file executable:
   ```bash
   chmod +x Grounded.AppImage
   ```

#### Step 3: Run the App
1. **Double-click** `Grounded.AppImage` in your file manager, OR
2. Run from terminal:
   ```bash
   ./Grounded.AppImage
   ```

#### Optional: Add to Applications Menu
1. Create a desktop entry:
   ```bash
   mkdir -p ~/.local/share/applications
   ```
2. Create a file `~/.local/share/applications/grounded.desktop` with:
   ```ini
   [Desktop Entry]
   Name=Grounded
   Exec=/path/to/Grounded.AppImage
   Icon=grounded
   Type=Application
   Categories=Health;
   ```
   (Replace `/path/to/` with the actual path to your AppImage)

### Option B: DEB Package (For Debian/Ubuntu)

#### Step 1: Download
- You should have received a file named `Grounded.deb`
- If not, contact your therapist or download from the provided link

#### Step 2: Install
1. **Double-click** the `.deb` file, OR
2. Install from terminal:
   ```bash
   sudo dpkg -i Grounded.deb
   sudo apt-get install -f  # Fix any missing dependencies
   ```

#### Step 3: Open the App
- Search for "Grounded" in your applications menu
- Click to launch

**✅ Installation Success Indicator**: The app icon will appear in your applications menu, confirming successful installation.

### That's it! 🎉
The app is now installed and ready to use.

**✅ Installation Success Indicator**: The app will appear in your Start menu, confirming successful installation. You can also pin it to your taskbar or create a desktop shortcut for quick access.

---

## 📱 Android Installation

### Step 1: Enable Unknown Sources
1. Open **Settings** on your Android device
2. Go to **Security** (or **Privacy** on newer devices)
3. Find **"Install unknown apps"** or **"Unknown sources"**
4. Select your file manager or browser (Chrome, Files, etc.)
5. **Enable** "Allow from this source"

### Step 2: Download the APK
- You should have received a file named `app-release.apk`
- If not, contact your therapist or download from the provided link
- The file will download to your **Downloads** folder

### Step 3: Install the App
1. Open your **Downloads** folder (or use a file manager)
2. **Tap** on `app-release.apk`
3. If you see a security warning, tap **"Settings"** and enable **"Install unknown apps"**
4. Tap **"Install"**
5. Wait for installation to complete
6. Tap **"Open"** to launch, or find "Grounded" in your app drawer

### That's it! 🎉
The app is now installed and ready to use.

**Note**: You may see a warning about installing from unknown sources. This is normal for apps not from the Google Play Store. The app is safe to install.

---

## 🍎 iOS Installation (iPhone/iPad)

### Important Notes
- iOS installation requires the app to be distributed through the App Store or via TestFlight
- If you received a direct link, follow the instructions provided
- You may need to trust the developer certificate

### Option A: App Store (If Available)
1. Open the **App Store** on your iPhone/iPad
2. Search for **"Grounded"**
3. Tap **"Get"** or **"Install"**
4. Wait for installation to complete
5. Tap the app icon to launch

**✅ Installation Success Indicator**: The app icon will automatically appear on your home screen, confirming successful installation.

### Option B: TestFlight (Beta Testing)
1. Install **TestFlight** from the App Store (if not already installed)
2. Open the invitation link you received
3. Tap **"Accept"** and **"Install"**
4. Wait for installation to complete
5. Open **TestFlight** and tap **"Grounded"** to launch

### Option C: Direct Installation (Enterprise/Development)
1. Open the provided installation link on your iPhone/iPad
2. Tap **"Install"**
3. Go to **Settings** → **General** → **VPN & Device Management**
4. Find the developer certificate and tap **"Trust"**
5. Confirm by tapping **"Trust"** again
6. Return to home screen and tap the Grounded icon

### That's it! 🎉
The app is now installed and ready to use.

**✅ Installation Success Indicator**: The app will appear in your Start menu, confirming successful installation. You can also pin it to your taskbar or create a desktop shortcut for quick access.

---

## 🌐 PWA Installation (Progressive Web App)

**Works on all platforms** - Install Grounded directly from your web browser!

### Step 1: Open in Browser
1. Navigate to the Grounded app URL (provided by your therapist or organization)
2. The app will open in your browser

### Step 2: Install the PWA

**Chrome/Edge (Windows, Mac, Android):**
1. Look for the install icon (➕) in the address bar
2. Click **"Install"** or **"Add to Home Screen"**
3. Confirm installation
4. The app will appear in your applications/apps menu

**Safari (iOS/macOS):**
1. Tap the **Share** button (square with arrow)
2. Scroll down and tap **"Add to Home Screen"**
3. Tap **"Add"** in the top right
4. The app will appear on your home screen

**✅ Installation Success Indicator**: The app icon on your home screen confirms successful installation. You can tap it anytime to launch the app.

**Firefox:**
1. Click the menu (three lines) → **"Install"**
2. Confirm installation
3. The app will appear in your applications menu

### Step 3: First Launch
1. Open Grounded from your home screen/applications
2. Create an account or log in
3. Accept the terms and conditions
4. **AI models will download automatically** - you'll see a progress bar
5. Once models are loaded, you're ready to use the app!

### Benefits of PWA Installation
- ✅ Works offline after first load
- ✅ App-like experience (no browser UI)
- ✅ Automatic updates when you're online
- ✅ Cross-platform (works on all devices)
- ✅ No app store required

---

## ❓ Troubleshooting

### macOS
- **"App is damaged"** error:
  - Open **Terminal**
  - Run: `xattr -cr /Applications/Grounded.app`
  - Try opening again

- **Won't open**:
  - Go to **System Settings** → **Privacy & Security**
  - Scroll down and click **"Open Anyway"** next to Grounded

### Windows
- **"Windows protected your PC"** warning:
  - Click **"More info"**
  - Click **"Run anyway"**

- **Installation fails**:
  - Right-click the installer
  - Select **"Run as administrator"**
  - Try again

### Linux
- **"Permission denied"**:
  - Make sure you ran `chmod +x Grounded.AppImage`
  - Check file permissions: `ls -l Grounded.AppImage`

- **Won't run**:
  - Install required libraries:
    ```bash
    sudo apt-get install libfuse2  # For AppImage
    ```

### Android
- **"Install blocked"**:
  - Make sure "Unknown sources" is enabled
  - Try a different file manager

- **"App not installed"**:
  - Uninstall any previous version first
  - Make sure you have enough storage space

### iOS
- **"Untrusted Developer"**:
  - Go to **Settings** → **General** → **VPN & Device Management**
  - Trust the developer certificate

---

## 🔒 Security & Privacy

- All data is stored **locally on your device**
- No data is sent to external servers
- All AI processing happens **on your device**
- No account required for basic use

---

## 📧 Need Help?

If you encounter any issues during installation:
- Email: **ac.minds.ai@gmail.com**
- Include your operating system and error message (if any)

---

## ✅ Verification

After installation, verify everything works:
1. Open the Grounded app
2. You should see the login/registration screen
3. Create an account or log in
4. Accept the terms and conditions
5. You'll see a progress bar showing AI model download (first launch only)
6. Once models are loaded, the app should load without errors

**Congratulations!** You're ready to start using Grounded. 🎉

### First Launch Notes
- **AI Model Download**: On first launch, AI models will download automatically. This may take a few minutes depending on your internet connection. The progress bar shows download status.
- **Subsequent Launches**: Models are cached locally, so future launches are instant.
- **Offline Use**: Once models are downloaded, the app works completely offline.
- **If Models Fail to Load**: The app will continue to work with rule-based responses. AI features will be unavailable, but core functionality remains.
