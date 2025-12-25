#!/bin/bash

# Setup Java for Android Builds
# This script helps configure Java 21 for Android builds

set -e

echo "☕ Setting up Java for Android builds..."
echo ""

# Check for Java 21
JAVA_21_HOME=$(/usr/libexec/java_home -v 21 2>/dev/null || echo "")

if [ -n "$JAVA_21_HOME" ]; then
    echo "✅ Java 21 found at: $JAVA_21_HOME"
    echo ""
    echo "To use Java 21 for Android builds, run:"
    echo "  export JAVA_HOME=$JAVA_21_HOME"
    echo "  npm run build:android"
    echo ""
    echo "Or add to your ~/.zshrc:"
    echo "  export JAVA_HOME=$JAVA_21_HOME"
else
    echo "❌ Java 21 not found"
    echo ""
    echo "Java 25 is installed, but Gradle 8.14.3 requires Java 21 or earlier."
    echo ""
    echo "Install Java 21:"
    echo "  brew install --cask temurin@21"
    echo ""
    echo "After installation, restart terminal and run this script again."
fi

# List all Java versions
echo "📋 Available Java versions:"
/usr/libexec/java_home -V 2>&1 | grep -E "Java|jdk" || echo "  (none found)"

