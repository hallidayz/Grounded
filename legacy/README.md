# Legacy Files Archive

This directory contains files that were previously in the root of the project but are no longer used in the build or execution of the app. These files have been archived here for reference purposes.

## Directory Structure

### `unused-gradle/`
Contains root-level Gradle files that are not used by the project:
- `settings.gradle.kts` - Root Gradle settings file (unused; Android uses `android/settings.gradle`)
- `gradle.properties` - Root Gradle properties (unused; Android uses `android/gradle.properties`)
- `gradle/` - Root Gradle wrapper directory (unused; Android has its own in `android/gradle/`)
- `gradlew` - Root Gradle wrapper script (unused; Android has its own)
- `gradlew.bat` - Root Gradle wrapper script for Windows (unused; Android has its own)

**Reason for archiving**: The project uses Capacitor for Android builds, which manages its own Gradle configuration in the `android/` directory. These root-level Gradle files were likely created by a Gradle init task but are not referenced by any build scripts.

### `unused-app/`
Contains an unused Java application directory:
- `app/` - Complete Gradle-based Java application project

**Reason for archiving**: This appears to be a leftover Gradle init project. The actual Android app is built using Capacitor and located in `android/app/`. This directory was never integrated into the build process.

### `unused-config/`
Contains unused configuration and script files:
- `metadata.json` - Configuration file that is not referenced in any build scripts or code
- `unregister-sw.js` - Service worker unregistration script (unused; unregistration is handled inline in `index.html`)

**Reason for archiving**: These files are not referenced anywhere in the codebase. The service worker unregistration functionality is implemented directly in the HTML file, making the separate script file unnecessary.

## Notes

- These files are preserved for historical reference and can be safely deleted if needed
- The project build process does not depend on any of these files
- If you need to restore any of these files, they can be moved back to their original locations

## Archive Date
Archived: 2024 (during project cleanup)

