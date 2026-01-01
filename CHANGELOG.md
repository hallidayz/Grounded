# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.13.4] - 2026-01-01

### Other

- Release version 1.13.3: Remove Netlify and Vercel configuration files, update package.json to include AI model bundling in the build process, and enhance the packaging script for improved mobile installation experience.| (c1151b4)

- Release version 1.13.1: Update configurations for Vercel and Netlify, enhance SPA routing, and implement various fixes and improvements in Vite configuration and authentication handling.| (cae1dc0)

- Update Vercel build command to clean additional directories for a more thorough build process| (c219fb1)

- Update Netlify and Vercel configurations to enhance SPA routing and add CORS/COEP headers for asset support; also update release date to January 1, 2026, in documentation.| (6f07694)

- Update release date to December 31, 2025, in HOSTING_INSTRUCTIONS.md and RELEASE_NOTES.md| (ede417c)

- Add rewrite that excludes assets and files with extensions for SPA routing| (c4c9c97)

- Fix rewrites: Only rewrite HTML requests, not JS/CSS/assets| (75910b7)

- Force clean build on Vercel to prevent cached malformed filenames| (b1cb7b3)

- Add explicit Content-Type headers for JS/CSS assets and set Vite base path| (a4890cf)

- Fix rewrites to exclude files with extensions - prevents JS modules from being served as HTML| (7db664f)

- Simplify rewrites and add test page| (5c19eef)

- Add CORS headers for assets and fix loading text| (d0e08e4)

- Fix deployment: Remove Google Fonts to resolve COEP conflicts, add SPA redirects| (20264a0)

- Fix blank page: Change COEP to credentialless to allow external resources| (aed7301)

- Update release date to January 1, 2026, in HOSTING_INSTRUCTIONS.md and RELEASE_NOTES.md| (1edd7b5)

- Update package-lock.json after npm install| (0f6dc61)

- Add rewrites to Vercel configuration for SPA routing|- Introduced a rewrites section in vercel.json to route all requests to index.html, enabling proper handling of single-page application navigation. (aed2eb8)

-  (- This )

- Implement safety timeout for authentication and enhance error handling during app initialization|- Added a safety timeout to force transition to the login screen if the app is stuck in the 'checking' state for more than 20 seconds. (8aecb6d)

-  (- Intro)

-  (- Enhan)

-  (- Updat)

- Refactor noMinifyTransformersPlugin in Vite configuration to streamline logging and improve chunk handling|- Removed redundant logging fetch calls to enhance code clarity and reduce network overhead. (30d25f9)

-  (- Updat)

-  (- Adjus)

- Add noMinifyTransformersPlugin to Vite configuration to prevent minification issues|- Introduced a new plugin to handle transformers chunk, preventing initialization errors during minification. (d130632)

-  (- Enhan)

-  (- Updat)

- Refactor Vite configuration to improve minification and chunking strategy|- Switched from Terser to esbuild for minification to resolve initialization errors with transformers. (db0eb41)

-  (- Adjus)

-  (- Updat)

- Enhance Vite configuration for better handling of transformers|- Updated the Vite configuration to exclude '@xenova/transformers' from pre-bundling with a comment for clarity. (06cecd5)

-  (- Remov)

-  (- Added)

-  (- Suppr)

-  (- Adjus)

## [1.13.1] - 2026-01-01

### Other

- Update Vercel build command to clean additional directories for a more thorough build process| (c219fb1)

- Update Netlify and Vercel configurations to enhance SPA routing and add CORS/COEP headers for asset support; also update release date to January 1, 2026, in documentation.| (6f07694)

- Update release date to December 31, 2025, in HOSTING_INSTRUCTIONS.md and RELEASE_NOTES.md| (ede417c)

- Add rewrite that excludes assets and files with extensions for SPA routing| (c4c9c97)

- Fix rewrites: Only rewrite HTML requests, not JS/CSS/assets| (75910b7)

- Force clean build on Vercel to prevent cached malformed filenames| (b1cb7b3)

- Add explicit Content-Type headers for JS/CSS assets and set Vite base path| (a4890cf)

- Fix rewrites to exclude files with extensions - prevents JS modules from being served as HTML| (7db664f)

- Simplify rewrites and add test page| (5c19eef)

- Add CORS headers for assets and fix loading text| (d0e08e4)

- Fix deployment: Remove Google Fonts to resolve COEP conflicts, add SPA redirects| (20264a0)

- Fix blank page: Change COEP to credentialless to allow external resources| (aed7301)

- Update release date to January 1, 2026, in HOSTING_INSTRUCTIONS.md and RELEASE_NOTES.md| (1edd7b5)

- Update package-lock.json after npm install| (0f6dc61)

- Add rewrites to Vercel configuration for SPA routing|- Introduced a rewrites section in vercel.json to route all requests to index.html, enabling proper handling of single-page application navigation. (aed2eb8)

-  (- This )

- Implement safety timeout for authentication and enhance error handling during app initialization|- Added a safety timeout to force transition to the login screen if the app is stuck in the 'checking' state for more than 20 seconds. (8aecb6d)

-  (- Intro)

-  (- Enhan)

-  (- Updat)

- Refactor noMinifyTransformersPlugin in Vite configuration to streamline logging and improve chunk handling|- Removed redundant logging fetch calls to enhance code clarity and reduce network overhead. (30d25f9)

-  (- Updat)

-  (- Adjus)

- Add noMinifyTransformersPlugin to Vite configuration to prevent minification issues|- Introduced a new plugin to handle transformers chunk, preventing initialization errors during minification. (d130632)

-  (- Enhan)

-  (- Updat)

- Refactor Vite configuration to improve minification and chunking strategy|- Switched from Terser to esbuild for minification to resolve initialization errors with transformers. (db0eb41)

-  (- Adjus)

-  (- Updat)

- Enhance Vite configuration for better handling of transformers|- Updated the Vite configuration to exclude '@xenova/transformers' from pre-bundling with a comment for clarity. (06cecd5)

-  (- Remov)

-  (- Added)

-  (- Suppr)

-  (- Adjus)

## [1.13.0] - 2025-12-30

- No changes documented

## [1.12.28] - 2025-12-29

### Other

- Refactor release process and enhance versioning commands|- Updated package.json to introduce new versioning commands for patch, minor, and major releases, along with a changelog generator and release validator. (84f431d)

-  (- Refac)

-  (- Impro)

- Add Goals feature to App and related components|- Introduced a new GoalsUpdateView component for managing user goals, including progress updates and completion tracking. (70e9b3c)

-  (- Updat)

-  (- Enhan)

-  (- Modif)

-  (- Updat)

-  (- Impro)

- Enhance app initialization process and improve user feedback|- Integrated progress tracking during app initialization in App.tsx, providing users with real-time updates on the setup process. (da6dba7)

-  (- Imple)

-  (- Updat)

-  (- Enhan)

-  (- Adjus)

- Add reflection analysis feature to Dashboard and ReflectionForm components| (74d0eb5)

## [Unreleased]

### Added
- Standardized version control release module
- Automated CHANGELOG generation from git commits
- Pre-release validation system
- Git tagging automation
- Version bumping with patch/minor/major support

