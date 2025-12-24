# Grounded - On-Device Therapy Integration App

**Grounded by AC MiNDS** - Privacy-first therapy integration app for values-based reflection and mental health support.

A privacy-first values-based reflection app designed to support clients working with Licensed Clinical Social Workers (LCSW). All AI processing happens **entirely on your device** - no data ever leaves your device.

## Key Features

- **On-Device AI**: Uses MiniCPM4-0.5B style dual-model architecture for complete privacy
  - **Model A**: Mental state tracker (mood/anxiety/depression assessment)
  - **Model B**: Counseling coach (structured guidance and homework support)
- **LCSW Integration**: Configure treatment protocols, safety phrases, and emergency contacts
- **Crisis Detection**: Automatic detection of crisis indicators with appropriate routing
- **Local-Only Storage**: All data stored locally in your browser
- **Value-Based Reflection**: Track progress on your core values between therapy sessions

## Architecture

This app implements a **MoPHES-style dual-model architecture**:
- Models run entirely in the browser using `@xenova/transformers`
- No API keys or cloud services required
- All processing happens locally for maximum privacy
- Fallback to rule-based responses if models fail to load

## Run Locally

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the app:
   ```bash
   npm run dev
   ```
   
   **Port Conflicts?** If port 3000 is already in use:
   - **Option 1 (macOS/Linux):** Use `npm run dev:kill` to automatically kill the process on port 3000
   - **Option 2:** Use `npm run dev:port` to run on port 3001 instead
   - **Option 3:** The server will automatically try the next available port (3001, 3002, etc.) and display it in the terminal

3. The app will automatically open in your browser. If not, navigate to the URL shown in the terminal (usually `http://localhost:3000`)

**Note**: On first run, AI models will be downloaded and cached locally. This may take a few minutes depending on your connection speed. Subsequent runs will use the cached models.

## LCSW Configuration

Configure the app to align with your therapy work:

1. Click the settings icon (⚙️) in the header
2. Set your treatment protocols (CBT, DBT, ACT, EMDR, etc.)
3. Add crisis detection phrases
4. Configure emergency contact information
5. Add custom homework prompts/worksheets

## Privacy & Security

- **100% On-Device Processing**: All AI inference happens in your browser
- **No Data Transmission**: Nothing is sent to external servers
- **Local Storage Only**: Data stored in browser localStorage
- **Crisis Safety**: Automatic detection routes sensitive content appropriately

## Clinical Disclaimer

This app is designed to **support therapy integration**, not replace it:
- Helps clients remember and practice what was discussed in sessions
- Provides structured reflection prompts
- Offers psychoeducation and coping skills
- **Does NOT** provide diagnoses, medication advice, or crisis handling
- All clinical responsibility remains with the LCSW

## Technology Stack

- **React 19** with TypeScript
- **Vite** for build tooling
- **@xenova/transformers** for on-device AI inference
- **Tailwind CSS** for styling

## Model Information

The app uses quantized transformer models that run efficiently in the browser:
- Models are downloaded from HuggingFace on first use
- Cached locally for offline use
- Designed for mobile and desktop browsers
- Similar architecture to MiniCPM4-0.5B (MoPHES framework)

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Build and package as PWA (creates distributable zip)
npm run build:pwa

# Preview production build
npm run preview
```

## 📦 Building for Distribution

### Option 1: Native Installers (Recommended for End Users)

Build native installers that users can double-click to install:

```bash
# Build desktop installers (DMG/EXE)
npm run build:desktop

# Build Android APK
npm run build:android

# Build everything
npm run build:all
```

**Output:**
- macOS: `src-tauri/target/release/bundle/macos/Grounded.dmg`
- Windows: `src-tauri/target/release/bundle/msi/Grounded_0.0.0_x64_en-US.msi`
- Android: `android/app/build/outputs/apk/release/app-release.apk`

### Option 2: PWA Package (Web Distribution)

To create a distributable PWA package:

```bash
# Build and package
npm run build:pwa
```

This will:
1. Build the optimized production version
2. Create a `package/` folder with:
   - `dist/` - The built app (upload to web server)
   - `installers/` - Native installers (if built)
   - `INSTALLATION_GUIDE.md` - Complete installation instructions
   - `serve.sh` / `serve.bat` - Local testing scripts
3. Create `Grounded-PWA.zip` ready for email distribution

### Complete Distribution Package

```bash
# Build native installers + package everything
npm run build:all
npm run package
```

This creates a complete package with native installers for easy distribution.

### Generating Icons

Before building, generate PWA icons:
1. Open `public/create-icons.html` in a browser
2. Click "Generate Icons"
3. Icons will be downloaded automatically
4. Place them in the `public/` folder

Or use online tools:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator

## License

Private - For therapy integration support only.
