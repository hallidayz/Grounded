#!/usr/bin/env node

/**
 * Download AI models during build time
 * This bundles models with the app for instant loading
 */

import { createWriteStream } from 'fs';
import { mkdir, access } from 'fs/promises';
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
const models = [
  {
    name: 'distilbert-base-uncased-finetuned-sst-2-english',
    type: 'text-classification',
    files: [
      'config.json',
      'tokenizer.json',
      'tokenizer_config.json',
      'vocab.txt',
      'model_quantized.onnx',
      'model_quantized.onnx.data'
    ],
    baseUrl: 'https://huggingface.co/Xenova/distilbert-base-uncased-finetuned-sst-2-english/resolve/main'
  },
  {
    name: 'TinyLlama-1.1B-Chat-v1.0',
    type: 'text-generation',
    files: [
      'config.json',
      'tokenizer.json',
      'tokenizer_config.json',
      'vocab.json',
      'merges.txt',
      'model_quantized.onnx',
      'model_quantized.onnx.data'
    ],
    baseUrl: 'https://huggingface.co/Xenova/TinyLlama-1.1B-Chat-v1.0/resolve/main'
  }
];

// Estimated total size: ~50-100MB (models are quantized)

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = createWriteStream(dest);
    
    protocol.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Follow redirect
        return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      }
      
      if (response.statusCode !== 200) {
        file.close();
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      file.close();
      reject(err);
    });
  });
}

async function fileExists(path) {
  try {
    await access(path);
    return true;
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
    const filePath = join(modelDir, file);
    const url = `${model.baseUrl}/${file}`;
    
    // Skip if already exists
    if (await fileExists(filePath)) {
      console.log(`  ✓ ${file} (already exists)`);
      skipped++;
      continue;
    }
    
    try {
      console.log(`  ⬇️  Downloading ${file}...`);
      await downloadFile(url, filePath);
      downloaded++;
      console.log(`  ✓ ${file} downloaded`);
    } catch (error) {
      console.error(`  ✗ Failed to download ${file}:`, error.message);
      // Continue with other files
    }
  }
  
  console.log(`✅ ${model.name}: ${downloaded} downloaded, ${skipped} skipped\n`);
  return { downloaded, skipped };
}

async function main() {
  console.log('🚀 Starting model download...\n');
  console.log('This will download AI models to bundle with the app.\n');
  
  // Create models directory
  await mkdir(modelsDir, { recursive: true });
  
  let totalDownloaded = 0;
  let totalSkipped = 0;
  
  for (const model of models) {
    const result = await downloadModel(model);
    totalDownloaded += result.downloaded;
    totalSkipped += result.skipped;
  }
  
  console.log(`\n✨ Complete! ${totalDownloaded} files downloaded, ${totalSkipped} files already cached.`);
  console.log(`📁 Models are in: ${modelsDir}`);
  console.log('\n💡 Models will be loaded from local files instead of downloading at runtime.');
}

main().catch((error) => {
  console.error('❌ Error downloading models:', error);
  process.exit(1);
});

