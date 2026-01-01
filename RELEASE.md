# Release Process Documentation

## Overview

This project uses a standardized version control release module that automates version bumping, CHANGELOG generation, git tagging, and release package creation.

## Release Workflow

### Quick Start

```bash
# Patch release (bug fixes) - 1.13.4 → 1.13.5
npm run release:patch

# Minor release (new features) - 1.13.4 → 1.14.0
npm run release:minor

# Major release (breaking changes) - 1.13.4 → 2.0.0
npm run release:major

# Create release without version bump (rebuild/repackage only)
npm run create-release -- --skip-version
```

### Available Commands

#### Version Bumping (No Build)
```bash
npm run version:patch   # Bump patch version only
npm run version:minor   # Bump minor version only
npm run version:major   # Bump major version only
```

#### Full Release (With Build)
```bash
npm run release:patch   # Patch release with full build
npm run release:minor   # Minor release with full build
npm run release:major   # Major release with full build
```

#### Utilities
```bash
npm run changelog           # Generate CHANGELOG.md from commits
npm run validate:release    # Validate release readiness
npm run create-release      # Legacy command (defaults to patch)
```

## Release Process Steps

When you run a release command, the following happens automatically:

1. **Pre-release Validation**
   - Checks git repository is clean
   - Verifies version consistency across files
   - Validates build succeeds (optional)

2. **Version Bumping**
   - Increments version based on type (patch/minor/major)
   - Updates all version references in:
     - `package.json`
     - `src-tauri/tauri.conf.json`
     - `src-tauri/Cargo.toml`
     - `services/updateManager.ts`
     - `services/debugLog.ts`
     - `components/FeedbackButton.tsx`
     - `README.md`
     - `USAGE_GUIDE.md`
     - `INSTALLATION_GUIDE.md`

3. **CHANGELOG Generation**
   - Parses git commits since last tag
   - Groups commits by type (feat, fix, perf, etc.)
   - Generates formatted CHANGELOG.md entry

4. **Build Process**
   - Downloads AI models
   - Builds PWA
   - Creates release package

5. **Release Package Creation**
   - Creates release directory
   - Copies build artifacts
   - Generates release notes
   - Creates hosting configuration files

6. **Git Tagging** (optional)
   - Creates annotated git tag (v{version})
   - Ready to push to remote

## Command Line Options

```bash
# Skip version bumping (use current version)
npm run create-release -- --skip-version

# Skip validation
npm run create-release patch --skip-validation

# Skip build (for testing)
npm run create-release patch --skip-build

# Skip git tagging
npm run create-release patch --skip-tag

# Combine options
npm run create-release minor --skip-validation --skip-build

# Rebuild release without version change
npm run create-release -- --skip-version --skip-validation
```

## Version Types

### Patch (1.13.4 → 1.13.5)
- Bug fixes
- Security patches
- Documentation updates
- Performance improvements
- **Use when**: Fixing issues without adding features

### Minor (1.13.4 → 1.14.0)
- New features
- New functionality
- API additions (backward compatible)
- **Use when**: Adding features without breaking changes

### Major (1.13.4 → 2.0.0)
- Breaking changes
- API changes that break compatibility
- Major architectural changes
- **Use when**: Making incompatible changes

## Conventional Commits

The CHANGELOG generator parses conventional commit messages:

```
feat(scope): add new feature
fix(scope): fix bug
perf(scope): performance improvement
refactor(scope): code refactoring
docs(scope): documentation update
style(scope): code style changes
test(scope): test updates
chore(scope): maintenance tasks
build(scope): build system changes
ci(scope): CI/CD changes
```

## Post-Release Steps

After running a release:

1. **Review Changes**
   ```bash
   git status
   git diff
   ```

2. **Commit Version Changes**
   ```bash
   git add .
   git commit -m "chore: bump version to {version}"
   ```

3. **Push Tag** (if created)
   ```bash
   git push origin v{version}
   ```

4. **Push Commits**
   ```bash
   git push
   ```

5. **Create GitHub Release**
   - Go to GitHub repository
   - Click "Releases" → "Create a new release"
   - Tag: `v{version}`
   - Title: `Grounded PWA v{version}`
   - Description: Copy from `CHANGELOG.md` or `RELEASE_NOTES.md`
   - Attach: `Grounded-PWA-v{version}.zip`

6. **Host PWA**
   - Follow `HOSTING_INSTRUCTIONS.md` in release directory
   - Deploy to Netlify/Vercel/your server
   - Verify headers are configured correctly

## Best Practices

1. **Always validate before release**
   - Run `npm run validate:release` first
   - Fix any issues before proceeding

2. **Use appropriate version type**
   - Patch for fixes
   - Minor for features
   - Major for breaking changes

3. **Write meaningful commit messages**
   - Use conventional commit format
   - Helps with CHANGELOG generation

4. **Review CHANGELOG before release**
   - Check `CHANGELOG.md` is accurate
   - Edit if needed before committing

5. **Test the release package**
   - Verify build works
   - Test installation
   - Check version numbers are correct

6. **Tag releases consistently**
   - Always create git tags
   - Use format: `v{version}`
   - Push tags to remote

## Troubleshooting

### Validation Fails
- **Uncommitted changes**: Commit or stash changes
- **Build fails**: Fix build errors first
- **Version mismatch**: Run `npm run validate:release` to see details

### CHANGELOG Empty
- Check if there are commits since last tag
- Verify commit messages follow conventional format
- Manually edit CHANGELOG.md if needed

### Version Not Updated
- Check file paths are correct
- Verify file permissions
- Review error messages in console

## Module Structure

```
scripts/
├── release-manager.js      # Core version management
├── changelog-generator.js  # CHANGELOG generation
├── release-validator.js   # Pre-release validation
└── create-release.js       # Main release orchestrator

CHANGELOG.md                # Auto-generated changelog
RELEASE.md                  # This file
```

## Support

For issues or questions about the release process:
- Check `RELEASE.md` (this file)
- Review script comments
- Check git history for examples

