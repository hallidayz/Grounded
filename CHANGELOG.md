# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.13.5] - 2026-01-03

### Fixed

- disable PWA plugin to unblock vercel build| (2c9e4f6)

### Other

- Refactor release-validator.js to improve release validation logic by encapsulating functionality in a validateRelease function. Enhance error handling for version format and commit message validation, ensuring compliance with semantic versioning and conventional commit standards.| (695f340)

- Implement service worker registration in index.html and disable VitePWA plugin in vite.config.ts to streamline PWA setup.| (64d4ec6)

- Update README.txt to reflect new generation timestamp for package documentation.| (e3bdbe5)

- Refactor error handling in build-installers.js by removing type annotation from catch block, improving code clarity and consistency.| (0e4524d)

- Update database.ts to include new methods for managing feelingLogs, improving data handling and retrieval efficiency.| (9d595fd)

- Increment dbVersion in database.ts to 6 to ensure creation of feelingLogs store, enhancing database structure for future updates.| (90c587d)

- Add @babel/plugin-bugfix-firefox-class-in-computed-class-key to devDependencies in package.json and package-lock.json. Update tailwind.config.js to include additional content paths for components, hooks, services, App.tsx, and main.tsx to enhance Tailwind CSS utility class detection.| (25a6306)

- Enhance ONNX plugin logic in fixOnnxPlugin.ts to prevent duplicate declarations by checking for existing imports and variable declarations. This update ensures that ONNX is only initialized if it hasn't been imported or declared, improving stability and preventing identifier errors.| (032bc58)

- Refactor code for improved readability and consistency across multiple files. Adjust formatting in App.tsx, vite.config.ts, Dashboard.tsx, ReflectionForm.tsx, useDashboard.ts, build-installers.js, fix-sw-registration.js, release-validator.js, database.ts, and models.ts to enhance maintainability and ensure uniformity in code style.| (9d0a64f)

- Update quantized ONNX model file for distilbert-base-uncased-finetuned-sst-2-english| (2ff9b64)

- Configure Git LFS for large model files and PWA zip| (31be988)

- Add dexie as a dependency in package.json and package-lock.json to enhance database management capabilities.| (eec1e86)

- Refactor .gitignore to streamline ignored files, add coverage and build directories, and enhance environment variable handling. Update jest.config.js to improve test matching patterns and coverage collection. Modify tailwind.config.js to refine content paths and enhance color theme definitions. Update vite.config.ts to include new ONNX fix plugin, adjust asset inclusion, and optimize dependency handling. Revamp build-installers.js and release-validator.js scripts for improved installer building and release validation processes, ensuring better error handling and logging.| (aea3fb7)

- Add depcheck to package.json and package-lock.json for unused dependency detection| (ce34bae)

- Enhance ONNX initialization in vite.config.ts by implementing multiple assignment methods to ensure ONNX is always available, even before imports complete. Introduce a lazy evaluation function for destructuring ONNX properties, addressing critical issues related to undefined errors and improving overall stability.| (90b8325)

- Refactor ONNX initialization in vite.config.ts to enhance stability and prevent undefined errors. Ensure ONNX is initialized at the top of the file and implement comprehensive safeguards for destructuring ONNX properties. Adjust import handling to guarantee ONNX is available before any code execution, addressing critical issues related to variable initialization order and destructuring patterns.| (3c828b9)

- Refactor ONNX initialization in vite.config.ts to enhance stability and prevent undefined errors. Ensure ONNX is declared and initialized at the top of the file, with added safeguards for destructuring ONNX properties. Adjust import handling to guarantee ONNX is available before any code execution, addressing critical issues related to variable initialization order.| (f3e5380)

- Refactor ONNX initialization in vite.config.ts to ensure proper assignment and prevent undefined errors. Move ONNX declaration to the top of the file and adjust import handling to guarantee ONNX is available before any code execution. This change enhances module stability and addresses critical issues related to destructuring ONNX properties.| (927081b)

- Refactor ONNX initialization logic in vite.config.ts to retain static imports and prevent undefined errors. Adjust the handling of vendor module loading to ensure ONNX is properly initialized before use, eliminating the need for dynamic imports. This change enhances module stability and addresses previous issues related to variable initialization order.| (e5c38db)

- Improve ONNX initialization in vite.config.ts to prevent undefined errors. Ensure ONNX is declared and initialized correctly at the top of the module, adding safeguards to handle cases where it may be declared but not initialized. This change addresses critical issues related to destructuring ONNX properties.| (b009a76)

- Enhance legacy data detection and backup processes by implementing version handling for database access. Introduce graceful error handling for version mismatches and improve logging for database operations. Update model loading configuration to differentiate between production and development environments, ensuring appropriate logging based on the mode.| (e0713ea)

- Update reflection analysis flow to save reflections before analysis, allowing for any length of reflection text. Adjust button label in ReflectionForm for clarity. Modify safety timeout in App component from 20 seconds to 10 seconds for quicker user feedback during authentication checks. Enhance model loading progress handling in AI services to improve user experience and error logging, especially in development mode.| (ac9236e)

- Refine model installation status handling to improve progress display and user feedback. Cap progress at 95% during loading and 90% during initialization to prevent misleading completion indicators. Enhance display logic to accurately reflect model loading states and ensure consistent messaging throughout the loading process.| (ca6b145)

- Refactor model loading logic in initializeModels function to improve progress tracking and error handling. Update status management to reflect actual model loading outcomes, ensuring accurate feedback for partial and complete model availability. Enhance logging for better visibility during model initialization.| (09f4b80)

- Refactor ReflectionForm and useDashboard hook to enhance reflection analysis handling. Update ReflectionForm to support both string and object formats for reflection analysis, ensuring backward compatibility. Modify useDashboard to improve session management by tracking activeValueId changes and formatting reflection analysis for display.| (09b0e3c)

- Enhance App and Dashboard components to manage initial value ID for goals. Introduce state management for initialValueId in App, ensuring it resets when navigating away from the home view. Update Dashboard to clear active value ID after use and improve session tracking in useDashboard hook by utilizing refs to prevent infinite loops. Add focus lens generation to AI service for enhanced user experience.| (26a5ee5)

- Refine model loading logic in initializeModels function to prevent repeated loading of TinyLlama when it fails. Introduce checks to ensure counseling model is only loaded if moodTrackerModel is unavailable and TinyLlama has successfully loaded. Enhance debug logging for better tracking of model reuse decisions.| (9dd335f)

- Implement rule-based usage logging and enhance feedback submission. Introduce a new RuleBasedUsageLog interface for structured logging. Update FeedbackButton component to include an option for users to consent to sharing usage data, and log relevant usage information during AI interactions. Enhance database service with methods for saving and retrieving rule-based usage logs. Improve AI services to log usage data for focus lens and reflection analysis operations, ensuring better tracking of user interactions.| (343e034)

- Refactor useDashboard hook to improve emotional encouragement generation and fallback handling. Update database service to include a new rule-based usage logs store. Enhance AI encouragement service with improved focus lens generation and fallback mechanisms. Modify reflection analysis to incorporate previous analysis context for better insights. Update goal suggestion logic to include counseling guidance, ensuring a more structured response.| (518687a)

- Enhance App component to include AI status display and improve user navigation. Update installation status hook to provide detailed display text. Refactor ValueSelection and Dashboard components to support goal creation and initial value setting. Implement emotion interaction logging in the database for better user feedback and tracking.| (0930c0f)

- Update package dependencies and enhance DatabaseMigrationModal UI. Bump version to 1.13.4, update framer-motion to 11.18.2, and modify button labels for clarity in the migration modal.| (11d3304)

- Enhance database service error handling by implementing silent failures for non-critical metadata and app data operations. Add checks for object store existence before accessing them, ensuring smoother operation during database upgrades. Improve model loading logic in AI services to prioritize available models and reduce console spam during initialization failures.| (6c07475)

- Enhance goal suggestion response structure by adding optional fields for inference analysis and LCSM inferences. Update reflection form to improve user experience with dynamic height adjustments. Refactor model installation status logic to prioritize accurate state reporting and improve error handling during model loading.| (7c3244f)

- Enhance model installation status tracking by adding real-time progress updates and error handling. Update App component to display installation progress and status more effectively. Refactor model loading logic to prioritize HuggingFace models in development mode and improve fallback mechanisms for local model loading failures.| (3069184)

- Improve app initialization by allowing non-blocking authentication state setting for quicker user access. Update model loading logic to track download progress and status, enhancing user feedback during model installation. Refactor hooks to ensure accurate progress reporting and error handling.| (77c11cd)

- Refactor model initialization logic to prevent infinite loops and improve error handling. Introduce cooldown and failure tracking for model loading attempts, reducing console spam and enhancing stability. Update dashboard hook to utilize refs for logs, preventing unnecessary re-renders.| (d95bfcb)

- Add model installation status hook and integrate into App component for improved user feedback during model loading. Update service worker handling to ensure models are preloaded only after activation, enhancing app performance and user experience.| (64d4427)

- Enhance noMinifyTransformersPlugin to improve import path restoration by handling multiple imports and ensuring correct initialization order with dynamic imports. Update comments for clarity and maintain build integrity.| (a39d91d)

- Add noMinifyTransformersPlugin to restore unminified transformers chunk after minification, ensuring correct import paths and preventing initialization errors. Update comments for clarity and enhance build configuration.| (5bdee4f)

- Refactor vite.config.ts by removing noMinifyTransformersPlugin and simplifying the excludeModelsPlugin. Update comments for clarity and enhance build configuration for better performance and compatibility. Preserve variable names in esbuild and streamline server settings.| (2fca5f8)

- Add noMinifyTransformersPlugin to restore unminified transformers chunk with correct import paths after minification. This update ensures initialization errors are avoided and improves the build process by preserving unminified code.| (fd77792)

- Remove noMinifyTransformersPlugin to prevent import path corruption; update comments to clarify that fix-transformers-imports.js now handles corrupted imports post-build.| (d611e3c)

- Add noMinifyTransformersPlugin to prevent minification of transformers chunk, ensuring correct import paths and avoiding initialization errors. Update fix-sw-registration.js to handle multiple manifest.json reference patterns for improved compatibility.| (225ff13)

- Enhance fix-transformers-imports.js with improved pattern matching for corrupted imports, including multiple debug patterns and fallback mechanisms. Added detailed logging for alternative matching strategies and brute force fixes, ensuring comprehensive handling of import path issues.| (8a4cfdd)

- Enhance fix-transformers-imports.js to check all JavaScript files for corrupted imports, improving detection and fixing capabilities. Added detailed logging for each file processed, ensuring better debugging and reporting of fixed imports.| (7a9864c)

- Improve corrupted import handling in fix-transformers-imports.js by implementing comprehensive pattern matching and detailed logging for debugging. This update enhances the detection and fixing of various corrupted import formats, ensuring accurate restoration of import paths.| (7484f8f)

- Refactor fix-transformers-imports.js to handle multiple corrupted import patterns, including minified versions and flexible spacing, ensuring accurate restoration of import paths.| (57afe21)

- Remove noMinifyTransformersPlugin to prevent import path corruption; update fix-transformers-imports.js to handle corrupted imports more effectively.| (8e6aa46)

- Update release notes to reflect the new release date and build date for version 1.13.4, changing both from 2025-12-31 to 2026-01-01.| (8a6139e)

- Enhance build process by adding transformer import fixes to the build script and improving the no-minify transformers plugin to correctly restore unminified code with accurate import paths after minification.| (330027d)

## [1.13.4] - 2026-01-01

### Other

- Update CHANGELOG.md for version 1.13.4, documenting enhancements to Vite configuration, SPA routing improvements, and various fixes including authentication handling and deployment issues.| (d21d9b6)

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

