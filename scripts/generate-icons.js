/**
 * Generate PWA icons from a simple SVG
 * This creates the required icon sizes for PWA
 */

const fs = require('fs');
const path = require('path');

// Simple SVG icon for InnerCompass (IC logo)
const svgIcon = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="80" fill="#02295b"/>
  <text x="256" y="320" font-family="Arial, sans-serif" font-size="240" font-weight="bold" fill="#fda700" text-anchor="middle" dominant-baseline="middle">IC</text>
</svg>`;

const sizes = [192, 512, 180]; // PWA sizes + Apple touch icon

console.log('Generating PWA icons...');
console.log('Note: For production, replace these with properly designed icons.');
console.log('You can use online tools like https://realfavicongenerator.net/ or https://www.pwabuilder.com/imageGenerator');

// Create placeholder files
const publicDir = path.join(__dirname, '..', 'public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Create a simple HTML file that can be used to generate icons
const iconGeneratorHTML = `<!DOCTYPE html>
<html>
<head>
  <title>Icon Generator</title>
  <style>
    body { font-family: Arial; padding: 20px; }
    canvas { border: 1px solid #ccc; margin: 10px; }
  </style>
</head>
<body>
  <h1>InnerCompass Icon Generator</h1>
  <p>Open browser console and run the code below to generate icons:</p>
  <pre id="code"></pre>
  <div id="canvases"></div>
  <script>
    const sizes = [192, 512, 180];
    const code = \`
const sizes = [192, 512, 180];
sizes.forEach(size => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#02295b';
  ctx.fillRect(0, 0, size, size);
  
  // Rounded corners
  ctx.globalCompositeOperation = 'destination-in';
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.15);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  
  // Text
  ctx.fillStyle = '#fda700';
  ctx.font = \`bold \${size * 0.47}px Arial\`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('IC', size/2, size/2);
  
  // Download
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \`pwa-\${size}x\${size}.png\`;
    a.click();
  });
});
\`;
    document.getElementById('code').textContent = code;
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(publicDir, 'icon-generator.html'), iconGeneratorHTML);
console.log('Created icon-generator.html in public folder');
console.log('Open it in a browser to generate icons, or use an online tool.');

