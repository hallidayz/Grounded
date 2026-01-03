# Hosting Instructions for Grounded PWA v1.13.5

## Quick Hosting Options

### Option 1: Netlify (Easiest - Recommended)

1. Go to https://netlify.com and sign up (free)
2. Drag and drop the `dist-for-hosting` folder to Netlify
3. Copy `netlify.toml` from this release to your Netlify site root
4. Your app will be live at `your-app-name.netlify.app`
5. Share this URL - users can install directly!

### Option 2: Vercel

1. Go to https://vercel.com and sign up (free)
2. Import your project or drag and drop `dist-for-hosting` folder
3. Copy `vercel.json` from this release to your project root
4. Deploy - your app will be live immediately
5. Share the URL for installation

### Option 3: Your Own Server (adamhalliday.com/store)

1. Upload `dist-for-hosting` contents to `adamhalliday.com/store/grounded/`
2. Copy `.htaccess` (for Apache) or configure Nginx headers (see SERVER_CONFIG.md)
3. Ensure HTTPS is enabled (required for PWA)
4. Test installation at `https://adamhalliday.com/store/grounded/`

## Required Headers

Your server MUST send these headers for AI models to work:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

Configuration files are included in this release for:
- Netlify (`netlify.toml`)
- Vercel (`vercel.json`)
- Apache (`.htaccess`)

For other servers, see `SERVER_CONFIG.md` in the project root.

## Testing

After hosting, verify:
1. Visit the URL in a browser
2. Open DevTools → Network tab
3. Reload the page
4. Check that headers are present in response headers
5. Check browser console: `console.log(self.crossOriginIsolated)` should be `true`

## GitHub Release

1. Go to your GitHub repository
2. Click "Releases" → "Create a new release"
3. Tag: `v1.13.5`
4. Title: `Grounded PWA v1.13.5`
5. Description: Copy contents from `RELEASE_NOTES.md`
6. Attach: `Grounded-PWA-v1.13.5.zip`
7. Publish release

## Distribution Checklist

- [ ] Build completed successfully
- [ ] Release files created in `release/` directory
- [ ] Release notes generated
- [ ] Hosting configuration files created
- [ ] GitHub release created with zip file
- [ ] PWA hosted on Netlify/Vercel/your server
- [ ] Headers verified in browser DevTools
- [ ] Installation tested on target platforms
- [ ] Share link with users

---

**Version**: 1.13.5
**Release Date**: 2026-01-03
