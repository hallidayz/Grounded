# AI Models Setup - Bundled Models for Instant Loading

## Overview

AI models are now **bundled with the app** during build, eliminating the need to download them at runtime. This provides:
- ✅ **Instant loading** - No wait time for model downloads
- ✅ **Offline capability** - Models work without internet
- ✅ **Faster startup** - Models ready immediately

## How It Works

1. **Build Time**: Models are downloaded to `public/models/` during build
2. **Runtime**: App loads models from bundled files (no HuggingFace download needed)
3. **Fallback**: If bundled models aren't available, app downloads from HuggingFace

## Building with Bundled Models

Models are automatically downloaded when you build:

```bash
# Build with bundled models
npm run build

# Or build installers (includes models)
npm run build:desktop
npm run build:android
npm run build:pwa
```

The build process will:
1. Download models to `public/models/`
2. Include them in the build output
3. Models are ready for instant loading

## Important: SharedArrayBuffer Requirement

**AI models require SharedArrayBuffer**, which needs specific server configuration:

### ✅ Works With:
- **HTTP/HTTPS server** with COOP/COEP headers (use `npm run serve`)
- **PWA installed from HTTP server** with proper headers
- **Web deployment** with COOP/COEP headers configured

### ❌ Does NOT Work With:
- **Tauri desktop app** (`tauri://localhost` protocol) - **No SharedArrayBuffer support**
- **File protocol** (`file://`) - **No SharedArrayBuffer support**
- **Server without COOP/COEP headers** - **No SharedArrayBuffer support**

## Running the App

### For Web/PWA (Recommended - AI Works):

```bash
# Build
npm run build

# Serve with COOP/COEP headers (required for AI)
npm run serve

# Open http://localhost:8000
```

### For Tauri Desktop App:

**Note**: Tauri apps use `tauri://localhost` which doesn't support SharedArrayBuffer. AI models will not work in Tauri builds.

**Options**:
1. **Use PWA instead** - Install as PWA from HTTP server (AI will work)
2. **Use rule-based responses** - App works without AI in Tauri
3. **Embed local HTTP server** - Complex, requires additional development

## Model Files

Models are stored in:
- **Source**: `public/models/` (downloaded during build)
- **Build**: `dist/models/` (included in build output)
- **Size**: ~50-100MB total (quantized models)

## Troubleshooting

### Models Not Loading?

1. **Check SharedArrayBuffer**:
   - Open browser console
   - Run: `typeof SharedArrayBuffer !== 'undefined'`
   - Should return `"function"`, not `"undefined"`

2. **Check COOP/COEP Headers**:
   - Open DevTools → Network tab
   - Check response headers for:
     - `Cross-Origin-Opener-Policy: same-origin`
     - `Cross-Origin-Embedder-Policy: require-corp`

3. **Use HTTP Server**:
   - Don't open `file://` directly
   - Use `npm run serve` or deploy to a server

### Models Downloading Instead of Using Bundled?

- Check that `public/models/` contains model files
- Verify build included models in `dist/models/`
- Check browser console for model loading messages

## Manual Model Download

If you need to download models manually:

```bash
npm run download:models
```

This downloads models to `public/models/` without building.

## AI Interaction Lifecycle (User Workflow)

The application follows a specific "scaffolding" sequence designed to mirror a therapeutic session, moving from broad emotional support to specific actionable outcomes.

### 1. Emotional Check-in (The "Hello")
*   **Trigger**: User taps an emotion (e.g., "Heavy", "Energized").
*   **AI Action**: `generateEmotionalEncouragement`
*   **Output**: A brief, validating message (e.g., "It's okay to feel this way. Take a moment to breathe.") to acknowledge the user's state.

### 2. Focus Lens (The "Context")
*   **Trigger**: User selects a Core Value (e.g., "Integrity", "Health").
*   **AI Action**: `generateFocusLens`
*   **Output**: A contextual prompt connecting their current mood to the chosen value (e.g., "How does [Value] look when you are feeling [Mood]?").

### 3. Deep Reflection (The "Work")
*   **Trigger**: User types their reflection and clicks **Save** (or the AI analyzes automatically on Commit).
*   **AI Action**: `analyzeReflection` (Using "Schema-Only" prompt)
*   **Output**: A structured analysis providing:
    *   **Core Themes**: Key topics identified.
    *   **LCSW Lens**: A therapeutic perspective.
    *   **Reflective Inquiry**: A question to deepen thinking.
    *   **Session Prep**: What to bring to therapy.

### 4. Self-Advocacy Aim (The "Plan")
*   **Trigger**: User clicks **"Suggest"** on the Goal card.
*   **AI Action**: `suggestGoal` (Contextualized by `generateCounselingGuidance`)
*   **Output**: A specific, measurable micro-goal (The "Aim") derived directly from their reflection and analysis.

### 5. Clinical Reporting (The "Synthesis")
*   **Trigger**: User clicks **"Generate Report"** in the Reports tab.
*   **AI Action**: `generateHumanReports`
*   **Output**: A comprehensive summary (SOAP, DAP, BIRP formats) aggregating all the individual reflections and goals into a clinical narrative for the therapist.
