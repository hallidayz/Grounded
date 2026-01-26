# Server Configuration Guide - COOP/COEP Headers

## Overview

For optimal AI model performance, your server must send specific HTTP headers that enable **SharedArrayBuffer** support. This is required for multi-threaded ONNX Runtime execution, which significantly improves AI model performance.

## Required Headers

Your server must send these headers for all responses:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

## Why These Headers Are Required

1. **SharedArrayBuffer**: ONNX Runtime uses SharedArrayBuffer for efficient multi-threaded computation
2. **Security**: Browsers require cross-origin isolation (COOP/COEP) to enable SharedArrayBuffer
3. **Performance**: Without these headers, AI models fall back to single-threaded mode (slower)

## Configuration by Server Type

### Apache (.htaccess)

Add to your `.htaccess` file in the root directory:

```apache
<IfModule mod_headers.c>
    Header set Cross-Origin-Opener-Policy "same-origin"
    Header set Cross-Origin-Embedder-Policy "require-corp"
</IfModule>
```

**Note**: Ensure `mod_headers` is enabled:
```bash
sudo a2enmod headers
sudo systemctl restart apache2
```

### Nginx

Add to your server block in `nginx.conf` or site configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        add_header Cross-Origin-Opener-Policy "same-origin" always;
        add_header Cross-Origin-Embedder-Policy "require-corp" always;
        
        # Your other configuration...
        root /var/www/html;
        index index.html;
    }
}
```

**Note**: The `always` keyword ensures headers are sent even for error responses.

### Express.js (Node.js)

```javascript
const express = require('express');
const app = express();

// Add COOP/COEP headers to all responses
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

// Your routes...
app.use(express.static('dist'));

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### Vite Dev Server

For development, add to `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
});
```

**Note**: Restart the dev server after making this change.

### Netlify

Create `netlify.toml` in your project root:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    Cross-Origin-Opener-Policy = "same-origin"
    Cross-Origin-Embedder-Policy = "require-corp"
```

### Vercel

Create `vercel.json` in your project root:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cross-Origin-Opener-Policy",
          "value": "same-origin"
        },
        {
          "key": "Cross-Origin-Embedder-Policy",
          "value": "require-corp"
        }
      ]
    }
  ]
}
```

### Cloudflare Pages

Add to `_headers` file in your build output directory:

```
/*
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Embedder-Policy: require-corp
```

Or use Cloudflare Workers/Transform Rules to add headers.

### GitHub Pages

GitHub Pages doesn't support custom headers directly. Options:

1. **Use a reverse proxy** (Cloudflare, Netlify, etc.)
2. **Use a service worker** to add headers (limited effectiveness)
3. **Deploy to a different platform** that supports headers

### Firebase Hosting

Add to `firebase.json`:

```json
{
  "hosting": {
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "Cross-Origin-Opener-Policy",
            "value": "same-origin"
          },
          {
            "key": "Cross-Origin-Embedder-Policy",
            "value": "require-corp"
          }
        ]
      }
    ]
  }
}
```

## Testing Headers

### Browser DevTools

1. Open your app in the browser
2. Open DevTools (F12)
3. Go to **Network** tab
4. Reload the page
5. Click on any request (usually `index.html`)
6. Check **Response Headers** section
7. Verify both headers are present

### Command Line (curl)

```bash
curl -I https://your-domain.com | grep -i "cross-origin"
```

Expected output:
```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

### JavaScript Check

Open browser console and run:

```javascript
console.log('SharedArrayBuffer:', typeof SharedArrayBuffer !== 'undefined');
console.log('Cross-Origin Isolated:', self.crossOriginIsolated);
```

Both should be `true` if headers are configured correctly.

## Troubleshooting

### Headers Not Appearing

1. **Clear browser cache** - Old responses may be cached
2. **Check server logs** - Verify headers are being sent
3. **Test in incognito mode** - Eliminates cache issues
4. **Verify file location** - Config files must be in correct location

### Mixed Content Warnings

If you load resources from different origins, you may need to add `Cross-Origin-Resource-Policy: cross-origin` to those resources, or serve them from the same origin.

### Third-Party Resources

External resources (CDNs, fonts, etc.) must also send `Cross-Origin-Resource-Policy: cross-origin` header, or you must proxy them through your server.

**Example**: Google Fonts
```html
<!-- Instead of: -->
<link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet">

<!-- Use a proxy or self-host: -->
<link href="/fonts/inter.css" rel="stylesheet">
```

## Impact on App Functionality

### With Headers (Optimal)
- ✅ SharedArrayBuffer enabled
- ✅ Multi-threaded AI model execution
- ✅ Faster inference times
- ✅ Better performance on all devices

### Without Headers (Fallback)
- ⚠️ SharedArrayBuffer disabled
- ⚠️ Single-threaded AI model execution
- ⚠️ Slower inference times
- ✅ App still fully functional with rule-based responses

## Production Checklist

- [ ] Headers configured on server
- [ ] Headers verified in browser DevTools
- [ ] SharedArrayBuffer available (check console)
- [ ] Cross-origin isolation enabled (check console)
- [ ] AI models load successfully
- [ ] No mixed content warnings
- [ ] Tested on multiple browsers

## Additional Resources

- [MDN: Cross-Origin-Opener-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Opener-Policy)
- [MDN: Cross-Origin-Embedder-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Embedder-Policy)
- [MDN: SharedArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer)

## Support

If you continue to experience issues after configuring headers:
1. Check browser console for specific error messages
2. Verify headers are present in Network tab
3. Test in multiple browsers
4. Contact support: ac.minds.ai@gmail.com

