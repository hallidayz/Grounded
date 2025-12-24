# 🚀 Quick Start - Building & Distributing Grounded PWA

**Grounded by AC MiNDS** - Privacy-first therapy integration app

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Generate Icons (One-time setup)

1. Open `public/create-icons.html` in your browser
2. Click "Generate Icons"
3. Icons will download automatically
4. They're already in the right place - no need to move them

**Alternative**: Use online tools like https://realfavicongenerator.net/

## Step 3: Build & Package

```bash
npm run build:pwa
```

This creates:
- ✅ Optimized production build
- ✅ `package/` folder with everything needed
- ✅ `Grounded-PWA.zip` ready to email

## Step 4: Distribute

**Option A: Email the zip file**
- Send `Grounded-PWA.zip` to recipients
- They extract it and follow `INSTALLATION_GUIDE.md`

**Option B: Upload to web server**
- Upload contents of `package/dist/` to your web server
- Share the URL
- Users install via browser (see installation guide)

## 📱 Testing Locally

```bash
cd package
./serve.sh        # Mac/Linux
serve.bat          # Windows
```

Then open http://localhost:8000 on your device.

## 📊 Package Size

The built app is optimized for minimal size:
- Minified JavaScript
- Compressed assets
- Tree-shaking (removes unused code)
- Typically under 5MB (before AI models download)

**Note**: AI models download on first use (~50-100MB), but are cached locally.

---

**Full instructions**: See `INSTALLATION_GUIDE.md` for detailed user installation steps.

