# Release Scripts Documentation

## Overview

This directory contains the standardized version control release module for the Grounded PWA project.

## Module Structure

### Core Modules

#### `release-manager.js`
Core release management functionality:
- **getCurrentVersion()** - Get version from package.json
- **bumpVersion(version, type)** - Increment version (patch/minor/major)
- **updateAllVersions(oldVersion, newVersion)** - Update version in all files
- **isGitClean()** - Check if git repo is clean
- **getCurrentBranch()** - Get current git branch
- **createGitTag(version, message)** - Create annotated git tag
- **getLastTag()** - Get last git tag
- **getCommitsSinceTag(tag)** - Get commits since tag

#### `changelog-generator.js`
Automated CHANGELOG generation:
- **generateChangelog(newVersion, previousVersion)** - Generate CHANGELOG.md
- Parses conventional commits
- Groups by type (feat, fix, perf, etc.)
- Formats as markdown

#### `release-validator.js`
Pre-release validation:
- **validateRelease(options)** - Run all validations
- Checks git status
- Validates version consistency
- Validates build (optional)

#### `create-release.js`
Main release orchestrator:
- Coordinates all release steps
- Handles command-line arguments
- Builds and packages release
- Generates release notes

## Usage

### Quick Commands

```bash
# Version bumping only (no build)
npm run version:patch   # 1.12.27 → 1.12.28
npm run version:minor   # 1.12.27 → 1.13.0
npm run version:major   # 1.12.27 → 2.0.0

# Full release (with build)
npm run release:patch
npm run release:minor
npm run release:major

# Utilities
npm run changelog           # Generate CHANGELOG.md
npm run validate:release    # Validate release readiness
```

### Direct Script Usage

```bash
# Release manager (imported by other scripts)
node scripts/release-manager.js

# CHANGELOG generator
node scripts/changelog-generator.js [version] [previousVersion]

# Release validator
node scripts/release-validator.js [--skip-build]

# Create release
node scripts/create-release.js [patch|minor|major] [--skip-validation] [--skip-build] [--skip-tag]
```

## File Updates

The release manager updates versions in:
- `package.json`
- `src-tauri/tauri.conf.json`
- `src-tauri/Cargo.toml`
- `services/updateManager.ts`
- `services/debugLog.ts`
- `components/FeedbackButton.tsx`
- `README.md`
- `USAGE_GUIDE.md`
- `INSTALLATION_GUIDE.md`

## Dependencies

- Node.js (ES modules)
- Git (for tagging and commit history)
- npm (for build commands)

## Integration

All modules use ES6 imports/exports and can be imported by other scripts:

```javascript
import { getCurrentVersion, bumpVersion } from './release-manager.js';
import { generateChangelog } from './changelog-generator.js';
import { validateRelease } from './release-validator.js';
```

## Error Handling

All modules include error handling:
- File operations check for existence
- Git operations handle missing repos
- Version parsing validates format
- Build validation can be skipped

## Best Practices

1. Always run `validate:release` before releasing
2. Use appropriate version type (patch/minor/major)
3. Write conventional commit messages
4. Review CHANGELOG.md before committing
5. Test the release package before publishing

## See Also

- `../RELEASE.md` - Complete release process documentation
- `../CHANGELOG.md` - Auto-generated changelog

