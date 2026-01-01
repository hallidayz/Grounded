# Grounded - On-Device Therapy Integration App

**Grounded by AC MiNDS** - Version 1.12.27

Privacy-first therapy integration app for values-based reflection and mental health support.

A privacy-first values-based reflection app designed to support clients working with Licensed Clinical Social Workers (LCSW). All AI processing happens **entirely on your device** - no data ever leaves your device.

## Key Features

- **On-Device AI**: Fast-loading dual-model architecture for complete privacy
  - **Model A**: Mental state tracker (mood/anxiety/depression assessment)
  - **Model B**: Counseling coach (structured guidance and homework support)
  - **Smart Loading**: Models download immediately on app launch, ready when you need them
  - **Persistent Caching**: Models cached in browser for instant subsequent launches
- **LCSW Integration**: Configure treatment protocols, safety phrases, and emergency contacts
- **Crisis Detection**: Automatic detection of crisis indicators with appropriate routing
- **Local-Only Storage**: All data stored locally in your browser
- **Value-Based Reflection**: Track progress on your core values between therapy sessions
- **Progress Tracking**: Real-time progress bar shows AI model download status
- **Debug Logging**: Built-in diagnostic tools for troubleshooting

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

2. Download AI models (first time only, or when models are updated):
   ```bash
   npm run download:models
   ```
   **Note**: Model files are large (~2GB total) and are not committed to the repository. They're downloaded during build or manually via this command.

3. Run the app:
   ```bash
   npm run dev
   ```
   
   **Port Conflicts?** If port 3000 is already in use:
   - **Option 1 (macOS/Linux):** Use `npm run dev:kill` to automatically kill the process on port 3000
   - **Option 2:** Use `npm run dev:port` to run on port 3001 instead
   - **Option 3:** The server will automatically try the next available port (3001, 3002, etc.) and display it in the terminal

3. The app will automatically open in your browser. If not, navigate to the URL shown in the terminal (usually `http://localhost:3000`)

**Note**: AI models begin downloading immediately when the app starts, even before you log in or accept terms. This ensures they're ready when you need them. The download progress is shown in the loading screen. Models are cached in your browser's IndexedDB for instant loading on subsequent launches.

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

## AI Model Information

The app uses quantized transformer models that run efficiently in the browser:

### Model Loading Strategy
- **Immediate Download**: Models start downloading as soon as the app initializes
- **Background Loading**: Downloads continue while you read terms or log in
- **Terms Acceptance Trigger**: Model loading is prioritized when you accept terms
- **Smart Caching**: Models cached in browser IndexedDB for instant subsequent launches
- **Progress Tracking**: Real-time progress bar shows download status

### Model Architecture
- Models downloaded from HuggingFace on first use
- Quantized for smaller file sizes and faster loading
- Cached locally for offline use
- Designed for mobile and desktop browsers
- Similar architecture to MoPHES framework
- Automatic fallback to rule-based responses if models fail to load

### Model Selection
The app uses publicly available models:
- **DistilBERT**: Fast text classification for mood tracking (~67MB)
- **TinyLlama**: Balanced text generation for healthcare/psychology (~637MB, default)

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
- Windows: `src-tauri/target/release/bundle/msi/Grounded_1.12.26_x64_en-US.msi`
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
```bash
npm run rebuild:icons
```

This will generate all required icons from `public/ac-minds-logo.png`:
- PWA icons (192x192, 512x512, apple-touch-icon)
- Favicon
- Tauri desktop icons (32x32, 128x128, icon.ico, icon.icns)

Or use online tools:
- https://realfavicongenerator.net/
- https://www.pwabuilder.com/imageGenerator

## Installation

### For End Users

Choose your platform:
- **macOS**: Download `Grounded.dmg` and drag to Applications
- **Windows**: Download `Grounded_1.12.26_x64_en-US.msi` and run installer
- **Android**: Download `app-release.apk` and enable "Install unknown apps"
- **iOS**: Install via App Store, TestFlight, or enterprise distribution
- **PWA**: Install from web browser (Chrome, Edge, Safari) - works on all platforms

See `INSTALLATION_GUIDE.md` for detailed step-by-step instructions.

### For Developers

See `PREREQUISITES.md` for build requirements and `QUICK_START.md` for development setup.

## Usage

1. **First Launch**: Create an account or log in
2. **Accept Terms**: Read and accept the terms and conditions
3. **Select Values**: Choose up to 10 core values and rank them
4. **Daily Reflection**: Use the Dashboard to reflect on your progress
5. **Track Goals**: Set and track micro-goals aligned with your values
6. **Generate Reports**: Create clinical-style summaries (SOAP/DAP) for therapy sessions

See the in-app Help screen (click the ? icon) for detailed navigation instructions.

## Support

- **Email**: ac.minds.ai@gmail.com
- **Debug Log**: Available in Help screen for troubleshooting
- **Version**: 1.12.26

## License

**Apache License 2.0**

Copyright 2025 AC MiNDS

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at:

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
