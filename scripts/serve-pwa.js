#!/usr/bin/env node
/**
 * Simple HTTP server for serving the PWA with COOP/COEP headers
 * Required for SharedArrayBuffer support in AI models
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get port from command line or default to 8000
const PORT = process.argv[2] ? parseInt(process.argv[2], 10) : 8000;

// Determine dist directory (could be dist/ or package/dist/)
const distDir = path.join(__dirname, '..', 'dist');
const packageDistDir = path.join(__dirname, '..', 'package', 'dist');

let serveDir;
if (fs.existsSync(distDir)) {
  serveDir = distDir;
} else if (fs.existsSync(packageDistDir)) {
  serveDir = packageDistDir;
} else {
  console.error('❌ Error: dist/ folder not found.');
  console.error('   Run "npm run build" first, or navigate to the package/ folder.');
  process.exit(1);
}

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml',
};

const server = http.createServer((req, res) => {
  // Set COOP/COEP headers for all responses (required for SharedArrayBuffer)
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');

  // Parse URL
  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = path.join(serveDir, filePath.split('?')[0]); // Remove query string

  // Security: prevent directory traversal
  if (!filePath.startsWith(serveDir)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  // Check if file exists
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // File not found, try index.html (for SPA routing)
      const indexPath = path.join(serveDir, 'index.html');
      fs.readFile(indexPath, (err, data) => {
        if (err) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
          return;
        }
        const ext = path.extname(indexPath);
        const contentType = MIME_TYPES[ext] || 'text/plain';
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      });
      return;
    }

    // Read and serve file
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
        return;
      }

      const ext = path.extname(filePath);
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });
});

server.listen(PORT, () => {
  console.log('\n🌐 Grounded PWA Server');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📍 Serving: ${serveDir}`);
  console.log(`🌍 URL: http://localhost:${PORT}`);
  console.log(`📱 Open this URL to install the app`);
  console.log(`\n✅ COOP/COEP headers enabled (SharedArrayBuffer support)`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('Press Ctrl+C to stop the server\n');
});

