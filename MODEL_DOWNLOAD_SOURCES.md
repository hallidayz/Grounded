# AI Model Download Sources

This document describes where AI models can be downloaded from and how to configure alternative sources.

## ⚠️ Important Note: Gated Models

Some models (like `MiniCPM-2-4B-ONNX`) may be **gated/private** and return HTTP 401 Unauthorized errors. This means:
- The model requires you to accept terms on HuggingFace
- You may need to set up HuggingFace authentication
- The download script will skip these models gracefully
- The app will still work - it will attempt to download from HuggingFace at runtime

If you encounter 401 errors, the script will continue downloading other models and provide helpful warnings.

## Available Download Sources

### 1. HuggingFace Hub (Default)
**URL**: `https://huggingface.co/Xenova/{model-name}/resolve/main/{file}`

**Usage**:
```bash
npm run download:models
# or
MODEL_CDN=huggingface npm run download:models
```

**Pros**:
- Official source, always up-to-date
- Reliable and well-maintained
- Free and open access

**Cons**:
- Can be slower depending on location
- Rate limits may apply for large downloads

### 2. HuggingFace CDN (Faster)
**URL**: `https://cdn.huggingface.co/Xenova/{model-name}/resolve/main/{file}`

**Usage**:
```bash
MODEL_CDN=cdn npm run download:models
```

**Pros**:
- Faster downloads (CDN-optimized)
- Better global distribution
- Same reliability as main Hub

**Cons**:
- Still subject to HuggingFace's infrastructure

### 3. Custom Server/CDN
**URL**: Your custom URL pattern

**Usage**:
```bash
MODEL_BASE_URL="https://your-cdn.com/models/{model}" npm run download:models
```

**Example**:
```bash
# If you host models on Cloudflare R2
MODEL_BASE_URL="https://your-bucket.r2.cloudflarestorage.com/models/{model}" npm run download:models

# If you host on AWS S3
MODEL_BASE_URL="https://your-bucket.s3.amazonaws.com/models/{model}" npm run download:models

# If you host on your own server
MODEL_BASE_URL="https://models.yourdomain.com/{model}" npm run download:models
```

**Pros**:
- Full control over hosting
- Can optimize for your region
- No rate limits
- Can use your own CDN

**Cons**:
- Requires setup and maintenance
- Storage costs
- Need to keep models updated

## Model Files Required

Each model needs these files:

### DistilBERT
- `config.json`
- `tokenizer.json`
- `tokenizer_config.json`
- `vocab.txt`
- `onnx/model_quantized.onnx`

### TinyLlama
- `config.json`
- `tokenizer.json`
- `tokenizer_config.json`
- `special_tokens_map.json`
- `generation_config.json`
- `onnx/model_quantized.onnx`

### MiniCPM
- `config.json`
- `tokenizer.json`
- `tokenizer_config.json`
- `special_tokens_map.json`
- `generation_config.json`
- `onnx/model_quantized.onnx`

## Setting Up Custom Hosting

### Option 1: Download and Upload to Your CDN

1. Download models using the script:
```bash
npm run download:models
```

2. Upload `public/models/` to your CDN/storage:
```bash
# Example: Upload to AWS S3
aws s3 sync public/models/ s3://your-bucket/models/ --public-read

# Example: Upload to Cloudflare R2
rclone copy public/models/ r2:your-bucket/models/
```

3. Set the base URL:
```bash
MODEL_BASE_URL="https://your-cdn.com/models/{model}" npm run download:models
```

### Option 2: Mirror from HuggingFace

You can set up a script to periodically mirror models from HuggingFace to your CDN:

```bash
#!/bin/bash
# mirror-models.sh

MODELS=(
  "distilbert-base-uncased-finetuned-sst-2-english"
  "TinyLlama-1.1B-Chat-v1.0"
  "MiniCPM-2-4B-ONNX"
)

for model in "${MODELS[@]}"; do
  # Download from HuggingFace
  # Upload to your CDN
  # Update your MODEL_BASE_URL
done
```

## Runtime Model Loading

At runtime, the app uses `transformers.js` which:

1. **First tries local bundled models** (from `public/models/`)
2. **Falls back to HuggingFace** if local models not found
3. **Caches in IndexedDB** for future use

To configure runtime loading to use your CDN, you'd need to modify `services/ai/models.ts` to set custom paths.

## Alternative Model Sources

### ONNX Model Zoo
Some models are available from the ONNX Model Zoo (now hosted on HuggingFace):
- https://huggingface.co/onnxmodelzoo

### Self-Converted Models
You can convert your own models to ONNX format:
```bash
optimum-cli export onnx --task text-generation --model "model-name" output_directory
```

Then host the converted models on your own server.

## Handling Gated/Private Models

If a model returns **HTTP 401 Unauthorized**, it's likely gated. Options:

### Option 1: Accept Model Terms on HuggingFace
1. Visit the model page on HuggingFace (e.g., `https://huggingface.co/Xenova/MiniCPM-2-4B-ONNX`)
2. Accept the model's terms of use
3. Try downloading again

### Option 2: Use HuggingFace Authentication Token
1. Create a HuggingFace account
2. Generate an access token at https://huggingface.co/settings/tokens
3. Set the token as an environment variable:
```bash
export HF_TOKEN="your_token_here"
# Then update the download script to use this token
```

### Option 3: Skip Gated Models
The download script will automatically skip gated models and continue with others. The app will attempt to download them at runtime if needed.

## Troubleshooting

### Download Fails from HuggingFace (401 Unauthorized)

1. **Try CDN instead**:
```bash
MODEL_CDN=cdn npm run download:models
```

2. **Check network/firewall**: Some networks block HuggingFace

3. **Use custom hosting**: Set up your own CDN mirror

### Slow Downloads

1. **Use HuggingFace CDN**:
```bash
MODEL_CDN=cdn npm run download:models
```

2. **Set up regional mirror**: Host models closer to your users

3. **Use download manager**: Download files manually and place in `public/models/`

## File Structure

Models should be organized like this:
```
public/models/
├── distilbert-base-uncased-finetuned-sst-2-english/
│   ├── config.json
│   ├── tokenizer.json
│   ├── tokenizer_config.json
│   ├── vocab.txt
│   └── model_quantized.onnx
├── TinyLlama-1.1B-Chat-v1.0/
│   ├── config.json
│   ├── tokenizer.json
│   ├── tokenizer_config.json
│   ├── special_tokens_map.json
│   ├── generation_config.json
│   └── model_quantized.onnx
└── MiniCPM-2-4B-ONNX/
    ├── config.json
    ├── tokenizer.json
    ├── tokenizer_config.json
    ├── special_tokens_map.json
    ├── generation_config.json
    └── model_quantized.onnx
```

Note: Files from `onnx/` subdirectory are saved directly in the model folder (e.g., `onnx/model_quantized.onnx` → `model_quantized.onnx`).

