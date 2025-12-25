# Android Build - Java Version Fix

## Problem
The Android build fails with:
```
Unsupported class file major version 69
```

This happens because **Java 25** is installed, but **Gradle 8.14.3** only supports Java 17-21.

## Solution: Install Java 21 (LTS)

Java 21 is the recommended LTS version for Android development.

### Install Java 21

Run this command in your terminal (will prompt for password):
```bash
brew install --cask temurin@21
```

### Use Java 21 for Android Builds

After installation, set JAVA_HOME before building:

```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
npm run build:android
```

### Make it Permanent

Add to your `~/.zshrc`:
```bash
# Use Java 21 for Android builds
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
```

Then reload:
```bash
source ~/.zshrc
```

## Verify

Check Java version:
```bash
java -version
# Should show: openjdk version "21.x.x"
```

## Alternative: Use Java 17

If you prefer Java 17:
```bash
brew install --cask temurin@17
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
```

## After Fix

Once Java 21 is installed and configured, the Android build should work:
```bash
npm run build:android
```

---

**Note:** Java 25 can remain installed for other projects. The `JAVA_HOME` setting only affects the current terminal session (or permanently if added to `.zshrc`).

