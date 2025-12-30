#!/usr/bin/env node

/**
 * Download AI models during build time
 * This bundles models with the app for instant loading
 */

import { createWriteStream, statSync } from 'fs';
import { mkdir, access, stat } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const modelsDir = join(rootDir, 'public', 'models');

// Models to download (using smaller, faster models)
// Note: These models will be bundled with the app for instant loading

// Alternative download sources (in order of preference)
// You can set MODEL_CDN environment variable to use a different CDN:
// - 'huggingface' (default): https://huggingface.co
// - 'cdn': https://cdn.huggingface.co (faster CDN)
// - 'custom': Set MODEL_BASE_URL environment variable for custom hosting
const CDN_SOURCE = process.env.MODEL_CDN || 'huggingface';
const CUSTOM_BASE_URL = process.env.MODEL_BASE_URL;

function getBaseUrl(modelName) {
  // If custom base URL is set, use it
  if (CUSTOM_BASE_URL) {
    return CUSTOM_BASE_URL.replace('{model}', modelName);
  }
  
  // Otherwise use HuggingFace (default or CDN)
  const domain = CDN_SOURCE === 'cdn' ? 'cdn.huggingface.co' : 'huggingface.co';
  return `https://${domain}/Xenova/${modelName}/resolve/main`;
}

const models = [
  {
    name: 'distilbert-base-uncased-finetuned-sst-2-english',
    type: 'text-classification',
    files: [
      'config.json',
      'tokenizer.json',
      'tokenizer_config.json',
      'vocab.txt',
      'onnx/model_quantized.onnx'
    ],
    get baseUrl() { return getBaseUrl(this.name); }
  },
  {
    name: 'TinyLlama-1.1B-Chat-v1.0',
    type: 'text-generation',
    files: [
      'config.json',
      'tokenizer.json',
      'tokenizer_config.json',
      'special_tokens_map.json',
      'generation_config.json',
      'onnx/model_quantized.onnx'
    ],
    get baseUrl() { return getBaseUrl(this.name); }
  }
];

// Estimated total size: ~700MB (models are quantized)
// - DistilBERT: ~67MB
// - TinyLlama: ~637MB

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    let file = null;
    let totalBytes = 0;
    
    const request = protocol.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 302 || response.statusCode === 301 || response.statusCode === 307 || response.statusCode === 308) {
        const redirectUrl = response.headers.location;
        if (!redirectUrl) {
          reject(new Error(`Redirect but no location header for ${url}`));
          return;
        }
        // Resolve relative redirects
        const fullRedirectUrl = redirectUrl.startsWith('http') 
          ? redirectUrl 
          : new URL(redirectUrl, url).href;
        return downloadFile(fullRedirectUrl, dest).then(resolve).catch(reject);
      }
      
      if (response.statusCode !== 200) {
        if (file) file.close();
        // Handle 401 Unauthorized (gated/private models)
        if (response.statusCode === 401) {
          reject(new Error(`HTTP ${response.statusCode} Unauthorized - Model may be gated/private and require authentication`));
        } else {
          reject(new Error(`Failed to download ${url}: HTTP ${response.statusCode} ${response.statusMessage}`));
        }
        return;
      }
      
      // Check content type - if it's HTML, it's probably an error page
      const contentType = response.headers['content-type'] || '';
      if (contentType.includes('text/html')) {
        if (file) file.close();
        reject(new Error(`Received HTML instead of file content for ${url} - likely an error page`));
        return;
      }
      
      file = createWriteStream(dest);
      const contentLength = parseInt(response.headers['content-length'] || '0', 10);
      
      response.on('data', (chunk) => {
        totalBytes += chunk.length;
      });
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        // Verify file was written
        try {
          const stats = statSync(dest);
          if (stats.size === 0) {
            reject(new Error(`Downloaded file is 0 bytes for ${url}`));
            return;
          }
          if (contentLength > 0 && stats.size !== contentLength) {
            console.warn(`  ⚠️  Size mismatch: expected ${contentLength} bytes, got ${stats.size} bytes`);
          }
          resolve();
        } catch (err) {
          reject(new Error(`Failed to verify downloaded file: ${err.message}`));
        }
      });
      
      file.on('error', (err) => {
        file.close();
        reject(err);
      });
    });
    
    request.on('error', (err) => {
      if (file) file.close();
      reject(err);
    });
    
    request.setTimeout(300000, () => { // 5 minute timeout
      request.destroy();
      if (file) file.close();
      reject(new Error(`Download timeout for ${url}`));
    });
  });
}

async function fileExistsAndValid(path) {
  try {
    await access(path);
    // Check if file has content (not 0 bytes)
    const stats = await stat(path);
    return stats.size > 0;
  } catch {
    return false;
  }
}

async function downloadModel(model) {
  const modelDir = join(modelsDir, model.name);
  await mkdir(modelDir, { recursive: true });
  
  console.log(`📦 Downloading ${model.name}...`);
  
  let downloaded = 0;
  let skipped = 0;
  
  for (const file of model.files) {
    // Handle files in subdirectories (e.g., onnx/model_quantized.onnx -> model_quantized.onnx)
    const fileName = file.includes('/') ? file.split('/').pop() : file;
    const filePath = join(modelDir, fileName);
    const url = `${model.baseUrl}/${file}`;
    
    // Skip if already exists and has content (not 0 bytes)
    if (await fileExistsAndValid(filePath)) {
      const stats = await stat(filePath);
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      console.log(`  ✓ ${fileName} (already exists, ${sizeMB}MB)`);
      skipped++;
      continue;
    }
    
    // If file exists but is 0 bytes, delete it and re-download
    try {
      await access(filePath);
      const stats = await stat(filePath);
      if (stats.size === 0) {
        console.log(`  ⚠️  ${fileName} exists but is empty, re-downloading...`);
        const { unlink } = await import('fs/promises');
        await unlink(filePath);
      }
    } catch {
      // File doesn't exist, continue to download
    }
    
    try {
      console.log(`  ⬇️  Downloading ${fileName}...`);
      await downloadFile(url, filePath);
      const stats = await stat(filePath);
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
      downloaded++;
      console.log(`  ✓ ${fileName} downloaded (${sizeMB}MB)`);
    } catch (error) {
      const errorMsg = error.message || String(error);
      console.error(`  ✗ Failed to download ${fileName}:`, errorMsg);
      
      // If 401 error, warn about gated model
      if (errorMsg.includes('401') || errorMsg.includes('Unauthorized')) {
        console.warn(`  ⚠️  This model appears to be gated/private and may require HuggingFace authentication.`);
        console.warn(`  ⚠️  You may need to:`);
        console.warn(`     1. Accept the model's terms on HuggingFace`);
        console.warn(`     2. Set up HuggingFace authentication token`);
        console.warn(`     3. Use an alternative model that's publicly available`);
      }
      // Continue with other files
    }
  }
  
  if (downloaded === 0 && skipped === 0) {
    console.log(`⚠️  ${model.name}: All files failed to download (model may be gated/private)\n`);
  } else {
    console.log(`✅ ${model.name}: ${downloaded} downloaded, ${skipped} skipped\n`);
  }
  return { downloaded, skipped, failed: model.files.length - downloaded - skipped };
}

async function main() {
  console.log('🚀 Starting model download...\n');
  console.log('This will download AI models to bundle with the app.\n');
  
  // Show download source
  if (CUSTOM_BASE_URL) {
    console.log(`📡 Using custom download source: ${CUSTOM_BASE_URL}\n`);
  } else {
    console.log(`📡 Using download source: ${CDN_SOURCE === 'cdn' ? 'HuggingFace CDN (faster)' : 'HuggingFace Hub (default)'}\n`);
  }
  
  // Create models directory
  await mkdir(modelsDir, { recursive: true });
  
  let totalDownloaded = 0;
  let totalSkipped = 0;
  let totalFailed = 0;
  const failedModels = [];
  
  for (const model of models) {
    const result = await downloadModel(model);
    totalDownloaded += result.downloaded;
    totalSkipped += result.skipped;
    totalFailed += result.failed || 0;
    if (result.failed && result.failed === model.files.length) {
      failedModels.push(model.name);
    }
  }
  
  console.log(`\n✨ Complete! ${totalDownloaded} files downloaded, ${totalSkipped} files already cached.`);
  if (totalFailed > 0) {
    console.log(`⚠️  ${totalFailed} files failed to download.`);
    if (failedModels.length > 0) {
      console.log(`⚠️  Models that completely failed: ${failedModels.join(', ')}`);
      console.log(`⚠️  These models may be gated/private and require HuggingFace authentication.`);
      console.log(`⚠️  The app will still work - it will download these models from HuggingFace at runtime if needed.`);
    }
  }
  console.log(`📁 Models are in: ${modelsDir}`);
  console.log('\n💡 Models will be loaded from local files instead of downloading at runtime.');
  if (failedModels.length > 0) {
    console.log(`💡 Note: ${failedModels.join(' and ')} will download from HuggingFace at runtime (if available).`);
  }
}

main().catch((error) => {
  console.error('❌ Error downloading models:', error);
  process.exit(1);
});

