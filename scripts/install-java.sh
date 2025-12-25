#!/bin/bash

# Java Installation Script for macOS
# This script will prompt for your password to install Java via Homebrew

set -e

echo "🍺 Installing Java JDK (Temurin) via Homebrew..."
echo "   This will prompt for your password to install system packages."
echo ""

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "❌ Homebrew is not installed."
    echo "   Install it first: /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    exit 1
fi

# Install Java
echo "📦 Installing Temurin JDK..."
brew install --cask temurin

# Verify installation
echo ""
echo "✅ Java installation complete!"
echo ""
echo "Verifying installation..."
if java -version 2>&1 | head -1; then
    echo ""
    echo "✅ Java is now installed and ready to use!"
    echo ""
    echo "You can now run:"
    echo "  npm run build:android"
    echo "  npm run build:all"
else
    echo ""
    echo "⚠️  Java was installed but may not be in your PATH."
    echo "   Please restart your terminal and try again."
fi

