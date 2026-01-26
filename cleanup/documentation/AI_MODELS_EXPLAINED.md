# AI Models: How They Actually Work

## Original Design (What Was Supposed to Happen)

### Model Loading:
1. **Source**: HuggingFace (https://huggingface.co/Xenova/...)
2. **First Run**: Downloads models from HuggingFace (~50-100MB total)
3. **Storage**: Browser IndexedDB (automatic, managed by transformers.js)
4. **Subsequent Runs**: Loads from IndexedDB cache (instant, no download)

### Storage Details:
- **Location**: Browser IndexedDB
- **Database**: Managed by `@xenova/transformers` library
- **Cache Keys**: `transformers-cache-{model-name}`
- **Persistence**: Models persist across browser sessions
- **Size**: ~50-100MB total (quantized models)

## Why It Never Worked

The original design was **correct** for loading and storage, but it **never worked** because:

### The Real Problem: SharedArrayBuffer

AI models require **SharedArrayBuffer** to run, which needs:
- ✅ HTTP/HTTPS server with COOP/COEP headers
- ❌ Does NOT work with:
  - `file://` protocol
  - `tauri://localhost` protocol (Tauri apps)
  - Servers without COOP/COEP headers

### What Happened:
1. Models tried to download from HuggingFace ✅
2. Models tried to cache in IndexedDB ✅
3. **But models couldn't RUN** because SharedArrayBuffer wasn't available ❌
4. App fell back to rule-based responses

## The Fix

### Option 1: Use HTTP Server (AI Works)
```bash
npm run build
npm run serve
# Open http://localhost:8000
```
- ✅ SharedArrayBuffer available
- ✅ Models download and cache in IndexedDB
- ✅ Models actually run
- ✅ Subsequent launches use cached models (instant)

### Option 2: Bundle Models (Faster First Load)
The download script I created will:
- Download models during build to `public/models/`
- Include them in the app bundle
- But they still need SharedArrayBuffer to run

**Note**: Bundling models doesn't solve the SharedArrayBuffer issue - it just makes first load faster.

## Current Implementation

**Load From**: HuggingFace (model names like `Xenova/distilbert-base-uncased-finetuned-sst-2-english`)

**Store In**: Browser IndexedDB (automatic, managed by transformers.js)

**Cache Location**: 
- Virtual path: `./models-cache` (just a name)
- Actual storage: Browser IndexedDB
- Database: Managed by `@xenova/transformers`
- Persistence: Automatic across sessions

## To Make AI Work Right Now

```bash
# Build the app
npm run build

# Run with HTTP server (required for SharedArrayBuffer)
npm run serve

# Open http://localhost:8000
```

**That's it!** Models will:
1. Download from HuggingFace (first time only)
2. Cache in IndexedDB automatically
3. Load instantly on subsequent runs
4. Actually work because SharedArrayBuffer is available

## Summary

- **Original design**: Correct for loading/storage
- **Problem**: SharedArrayBuffer requirement wasn't met
- **Solution**: Run via HTTP server with COOP/COEP headers
- **Storage**: IndexedDB (automatic, no configuration needed)
- **Bundling**: Optional optimization, doesn't fix SharedArrayBuffer issue

