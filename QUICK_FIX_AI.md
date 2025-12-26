# Quick Fix: Get AI Working Now

## The Problem
AI models require **SharedArrayBuffer**, which only works with HTTP/HTTPS servers that send COOP/COEP headers.

## The Solution (2 Steps)

### Step 1: Build the App
```bash
npm run build
```

This downloads and bundles AI models (~50-100MB).

### Step 2: Run with HTTP Server (Required for AI)
```bash
npm run serve
```

Then open: **http://localhost:8000**

**That's it!** AI will work because the server sends the required headers.

## Why This Works
- ✅ HTTP server sends COOP/COEP headers
- ✅ SharedArrayBuffer becomes available
- ✅ AI models can load and run
- ✅ Models are bundled (no download wait)

## What Doesn't Work
- ❌ Opening `dist/index.html` directly (file:// protocol)
- ❌ Tauri desktop app (tauri://localhost protocol)
- ❌ Server without COOP/COEP headers

## For Production Deployment
Configure your web server to send these headers (see `SERVER_CONFIG.md`):
```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

## Models Are Bundled
Models are downloaded during build and included in the app. No runtime download needed!

