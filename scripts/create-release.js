#!/usr/bin/env node
/**
 * Create Release Script
 * 
 * Builds the PWA, creates release package, generates release notes,
 * and prepares files for GitHub release and hosting
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync, copyFileSync, statSync, readdirSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { 
  getCurrentVersion, 
  bumpVersion, 
  updateAllVersions, 
  createGitTag,
  getLastTag 
} from './release-manager.js';
import { generateChangelog } from './changelog-generator.js';
import { validateRelease } from './release-validator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function exec(command, options = {}) {
  try {
    execSync(command, { stdio: 'inherit', ...options });
    return true;
  } catch (error) {
    return false;
  }
}

function getFileSize(filePath) {
  if (!existsSync(filePath)) return 0;
  const stats = statSync(filePath);
  return stats.size;
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function generateReleaseNotes(version) {
  const date = new Date().toISOString().split('T')[0];
  
  // Try to read USAGE_GUIDE.md for version info
  let features = [];
  const usageGuidePath = join(__dirname, '..', 'USAGE_GUIDE.md');
  if (existsSync(usageGuidePath)) {
    const content = readFileSync(usageGuidePath, 'utf-8');
    const versionMatch = content.match(/## Version Information[\s\S]*?Features in This Version:([\s\S]*?)(?=---|$)/);
    if (versionMatch) {
      features = versionMatch[1]
        .split('\n')
        .map(line => line.replace(/^[-*]\s*/, '').trim())
        .filter(line => line.length > 0);
    }
  }

  // Default features if not found
  if (features.length === 0) {
    features = [
      'Optimized AI model loading',
      'Enhanced progress tracking',
      'Improved debug logging',
      'Better error handling',
      'Enhanced help documentation'
    ];
  }

  const releaseNotes = `# Grounded PWA v${version}

**Release Date**: ${date}

## 🎉 What's New

${features.map(f => `- ${f}`).join('\n')}

## 📦 Installation

### Option 1: Install from Web (Recommended)
1. Visit the hosted PWA URL (see hosting instructions below)
2. Click the install button in your browser
3. Follow platform-specific installation prompts

### Option 2: Download Package
1. Download \`Grounded-PWA-v${version}.zip\` from this release
2. Extract the zip file
3. Follow instructions in \`INSTALLATION_GUIDE.md\`

## 📱 Supported Platforms

- ✅ **iOS** (iPhone/iPad) - Safari 11.3+
- ✅ **Android** - Chrome, Samsung Internet, Firefox, Edge
- ✅ **macOS** - Safari, Chrome, Edge
- ✅ **Windows** - Chrome, Edge, Firefox

## 🚀 Quick Start

1. **Install the PWA** from the hosted URL or extracted package
2. **Accept Terms** when prompted
3. **Log in** or create an account
4. **Start tracking** your values and progress

## 📚 Documentation

This release includes:
- \`INSTALLATION_GUIDE.md\` - Complete installation instructions
- \`QUICK_INSTALL_GUIDE.md\` - Quick reference guide
- \`PREREQUISITES.md\` - System requirements
- \`README.md\` - Project documentation
- \`USAGE_GUIDE.md\` - User guide

## 🔒 Privacy & Security

- ✅ All data stored locally on your device
- ✅ AI models run entirely on-device
- ✅ No external API calls (except optional notifications)
- ✅ HTTPS required for installation

## 🐛 Known Issues

None at this time. If you encounter issues, please check the debug log in the app's Help section.

## 📞 Support

- **Email**: ac.minds.ai@gmail.com
- **Version**: ${version}
- **Build Date**: ${date}

---

**Grounded by AC MiNDS** - Privacy-first therapy integration app
`;

  return releaseNotes;
}

function main() {
  log('\n🚀 Creating Grounded PWA Release\n', 'bright');
  
  const rootDir = join(__dirname, '..');
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  const versionType = args.find(arg => ['patch', 'minor', 'major'].includes(arg)) || 'patch';
  const skipValidation = args.includes('--skip-validation');
  const skipBuild = args.includes('--skip-build');
  const skipTag = args.includes('--skip-tag');
  
  // Step 0: Pre-release validation
  if (!skipValidation) {
    const validation = validateRelease({ skipBuild });
    if (!validation.success) {
      log('\n❌ Pre-release validation failed. Use --skip-validation to bypass.', 'red');
      process.exit(1);
    }
  }
  
  // Step 1: Version bumping
  log('\n📝 Step 1: Version Bumping...', 'blue');
  const oldVersion = getCurrentVersion();
  const newVersion = bumpVersion(oldVersion, versionType);
  
  log(`   Current version: ${oldVersion}`, 'cyan');
  log(`   Version type: ${versionType}`, 'cyan');
  log(`   New version: ${newVersion}`, 'cyan');
  
  const versionUpdate = updateAllVersions(oldVersion, newVersion);
  if (!versionUpdate.success) {
    log('\n⚠️  Some files failed to update, but continuing...', 'yellow');
    if (versionUpdate.failed.length > 0) {
      log(`   Failed files: ${versionUpdate.failed.map(f => basename(f)).join(', ')}`, 'yellow');
    }
  } else {
    log(`\n✅ Version updated successfully: ${oldVersion} → ${newVersion}`, 'green');
  }
  
  // Step 2: Generate CHANGELOG
  log('\n📋 Step 2: Generating CHANGELOG...', 'blue');
  try {
    const changelogResult = generateChangelog(newVersion, oldVersion);
    log(`   ✓ CHANGELOG.md updated (${changelogResult.commitsCount} commits)`, 'green');
  } catch (error) {
    log(`   ⚠️  CHANGELOG generation failed: ${error.message}`, 'yellow');
    log('   Continuing without CHANGELOG update...', 'yellow');
  }
  
  const version = newVersion; // Use new version for rest of script
  const releaseDir = join(rootDir, 'release');
  const distDir = join(rootDir, 'dist');
  const packageDir = join(rootDir, 'package');
  
  // Step 3: Build the PWA
  log('\n📦 Step 3: Building PWA...', 'blue');
  log('This may take a few minutes...\n', 'yellow');
  
  if (!exec('npm run build:pwa')) {
    log('\n❌ Build failed. Please check errors above.', 'red');
    process.exit(1);
  }
  
  log('\n✅ Build complete!', 'green');
  
  // Step 4: Create release directory
  log('\n📁 Step 4: Preparing release directory...', 'blue');
  
  if (existsSync(releaseDir)) {
    log('Cleaning existing release directory...', 'yellow');
    execSync(`rm -rf "${releaseDir}"`, { stdio: 'inherit' });
  }
  mkdirSync(releaseDir, { recursive: true });
  
  // Step 5: Copy files for release
  log('\n📋 Step 5: Copying release files...', 'blue');
  
  // Copy the zip file if it exists
  const zipFile = join(rootDir, 'Grounded-PWA.zip');
  if (existsSync(zipFile)) {
    const releaseZip = join(releaseDir, `Grounded-PWA-v${version}.zip`);
    copyFileSync(zipFile, releaseZip);
    log(`   ✓ Copied ${basename(releaseZip)}`, 'green');
  }
  
  // Copy package directory contents
  if (existsSync(packageDir)) {
    const releasePackageDir = join(releaseDir, 'package');
    execSync(`cp -r "${packageDir}" "${releasePackageDir}"`, { stdio: 'inherit' });
    log('   ✓ Copied package directory', 'green');
  }
  
  // Copy dist directory for hosting
  if (existsSync(distDir)) {
    const releaseDistDir = join(releaseDir, 'dist-for-hosting');
    execSync(`cp -r "${distDir}" "${releaseDistDir}"`, { stdio: 'inherit' });
    log('   ✓ Copied dist directory for hosting', 'green');
  }
  
  // Copy documentation
  const docs = [
    'INSTALLATION_GUIDE.md',
    'QUICK_INSTALL_GUIDE.md',
    'PREREQUISITES.md',
    'README.md',
    'USAGE_GUIDE.md'
  ];
  
  docs.forEach(doc => {
    const docPath = join(rootDir, doc);
    if (existsSync(docPath)) {
      copyFileSync(docPath, join(releaseDir, doc));
      log(`   ✓ Copied ${doc}`, 'green');
    }
  });
  
  // Step 6: Generate release notes
  log('\n📝 Step 6: Generating release notes...', 'blue');
  
  const releaseNotes = generateReleaseNotes(version);
  const releaseNotesPath = join(releaseDir, 'RELEASE_NOTES.md');
  writeFileSync(releaseNotesPath, releaseNotes);
  log(`   ✓ Created RELEASE_NOTES.md`, 'green');
  
  // Step 7: Create hosting configuration files
  log('\n⚙️  Step 7: Creating hosting configuration...', 'blue');
  
  // Netlify config
  const netlifyConfig = `[[headers]]
  for = "/*"
  [headers.values]
    Cross-Origin-Opener-Policy = "same-origin"
    Cross-Origin-Embedder-Policy = "require-corp"
`;
  writeFileSync(join(releaseDir, 'netlify.toml'), netlifyConfig);
  log('   ✓ Created netlify.toml', 'green');
  
  // Vercel config
  const vercelConfig = {
    buildCommand: 'echo "Using pre-built files"',
    outputDirectory: 'dist-for-hosting',
    headers: [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin'
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp'
          }
        ]
      }
    ]
  };
  writeFileSync(join(releaseDir, 'vercel.json'), JSON.stringify(vercelConfig, null, 2));
  log('   ✓ Created vercel.json', 'green');
  
  // Apache .htaccess
  const htaccess = `<IfModule mod_headers.c>
    Header set Cross-Origin-Opener-Policy "same-origin"
    Header set Cross-Origin-Embedder-Policy "require-corp"
</IfModule>
`;
  writeFileSync(join(releaseDir, '.htaccess'), htaccess);
  log('   ✓ Created .htaccess', 'green');
  
  // Step 8: Create hosting instructions
  log('\n📖 Step 8: Creating hosting instructions...', 'blue');
  
  const hostingInstructions = `# Hosting Instructions for Grounded PWA v${version}

## Quick Hosting Options

### Option 1: Netlify (Easiest - Recommended)

1. Go to https://netlify.com and sign up (free)
2. Drag and drop the \`dist-for-hosting\` folder to Netlify
3. Copy \`netlify.toml\` from this release to your Netlify site root
4. Your app will be live at \`your-app-name.netlify.app\`
5. Share this URL - users can install directly!

### Option 2: Vercel

1. Go to https://vercel.com and sign up (free)
2. Import your project or drag and drop \`dist-for-hosting\` folder
3. Copy \`vercel.json\` from this release to your project root
4. Deploy - your app will be live immediately
5. Share the URL for installation

### Option 3: Your Own Server (adamhalliday.com/store)

1. Upload \`dist-for-hosting\` contents to \`adamhalliday.com/store/grounded/\`
2. Copy \`.htaccess\` (for Apache) or configure Nginx headers (see SERVER_CONFIG.md)
3. Ensure HTTPS is enabled (required for PWA)
4. Test installation at \`https://adamhalliday.com/store/grounded/\`

## Required Headers

Your server MUST send these headers for AI models to work:

\`\`\`
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
\`\`\`

Configuration files are included in this release for:
- Netlify (\`netlify.toml\`)
- Vercel (\`vercel.json\`)
- Apache (\`.htaccess\`)

For other servers, see \`SERVER_CONFIG.md\` in the project root.

## Testing

After hosting, verify:
1. Visit the URL in a browser
2. Open DevTools → Network tab
3. Reload the page
4. Check that headers are present in response headers
5. Check browser console: \`console.log(self.crossOriginIsolated)\` should be \`true\`

## GitHub Release

1. Go to your GitHub repository
2. Click "Releases" → "Create a new release"
3. Tag: \`v${version}\`
4. Title: \`Grounded PWA v${version}\`
5. Description: Copy contents from \`RELEASE_NOTES.md\`
6. Attach: \`Grounded-PWA-v${version}.zip\`
7. Publish release

## Distribution Checklist

- [ ] Build completed successfully
- [ ] Release files created in \`release/\` directory
- [ ] Release notes generated
- [ ] Hosting configuration files created
- [ ] GitHub release created with zip file
- [ ] PWA hosted on Netlify/Vercel/your server
- [ ] Headers verified in browser DevTools
- [ ] Installation tested on target platforms
- [ ] Share link with users

---

**Version**: ${version}
**Release Date**: ${new Date().toISOString().split('T')[0]}
`;

  writeFileSync(join(releaseDir, 'HOSTING_INSTRUCTIONS.md'), hostingInstructions);
  log('   ✓ Created HOSTING_INSTRUCTIONS.md', 'green');
  
  // Step 7: Summary
  log('\n' + '='.repeat(60), 'bright');
  log('✅ Release Created Successfully!', 'green');
  log('\n📁 Release files are in:', 'bright');
  log(`   ${releaseDir}\n`, 'cyan');
  
  // List files
  const files = readdirSync(releaseDir);
  log('📦 Release Contents:', 'bright');
  files.forEach(file => {
    const filePath = join(releaseDir, file);
    if (existsSync(filePath)) {
      const stats = statSync(filePath);
      if (stats.isFile()) {
        const size = formatSize(stats.size);
        log(`   • ${file} (${size})`, 'green');
      } else {
        log(`   • ${file}/ (directory)`, 'green');
      }
    }
  });
  
  log('\n📋 Next Steps:', 'bright');
  if (!skipTag) {
    log('   1. Commit version changes: git add . && git commit -m "chore: bump version to ' + version + '"', 'yellow');
    log('   2. Push tag: git push origin v' + version, 'yellow');
    log('   3. Push commits: git push', 'yellow');
  }
  log('   4. Review RELEASE_NOTES.md', 'yellow');
  log('   5. Review CHANGELOG.md', 'yellow');
  log('   6. Follow HOSTING_INSTRUCTIONS.md to host the PWA', 'yellow');
  log('   7. Create GitHub release with Grounded-PWA-v' + version + '.zip', 'yellow');
  log('   8. Share the hosted URL with users\n', 'yellow');
  
  log('💡 Quick Hosting:', 'bright');
  log('   • Netlify: Drag "dist-for-hosting" folder to netlify.com', 'cyan');
  log('   • Vercel: Drag "dist-for-hosting" folder to vercel.com', 'cyan');
  log('   • Copy the appropriate config file (.toml, .json, or .htaccess)\n', 'cyan');
  
  log('🎉 Ready to share!', 'bright');
}

main();

