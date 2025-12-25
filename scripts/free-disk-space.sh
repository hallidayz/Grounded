#!/bin/bash

# Disk Space Cleanup Script
# This script helps free up disk space by cleaning caches and temporary files

set -e

echo "🧹 Freeing up disk space..."
echo ""

# Function to get size of directory
get_size() {
    if [ -d "$1" ]; then
        du -sh "$1" 2>/dev/null | cut -f1 || echo "0"
    else
        echo "0"
    fi
}

# Clean Gradle cache
echo "📦 Cleaning Gradle cache..."
if [ -d ~/.gradle ]; then
    SIZE_BEFORE=$(get_size ~/.gradle)
    rm -rf ~/.gradle/caches/* 2>/dev/null || true
    rm -rf ~/.gradle/daemon/* 2>/dev/null || true
    SIZE_AFTER=$(get_size ~/.gradle)
    echo "   Before: $SIZE_BEFORE → After: $SIZE_AFTER"
fi

# Clean Homebrew cache
echo "🍺 Cleaning Homebrew cache..."
if command -v brew &> /dev/null; then
    brew cleanup --prune=all 2>/dev/null || true
    rm -rf ~/Library/Caches/Homebrew/downloads/* 2>/dev/null || true
    echo "   Homebrew cache cleaned"
fi

# Clean Xcode DerivedData
echo "🔨 Cleaning Xcode DerivedData..."
if [ -d ~/Library/Developer/Xcode/DerivedData ]; then
    SIZE_BEFORE=$(get_size ~/Library/Developer/Xcode/DerivedData)
    rm -rf ~/Library/Developer/Xcode/DerivedData/* 2>/dev/null || true
    SIZE_AFTER=$(get_size ~/Library/Developer/Xcode/DerivedData)
    echo "   Before: $SIZE_BEFORE → After: $SIZE_AFTER"
fi

# Clean npm cache
echo "📦 Cleaning npm cache..."
if command -v npm &> /dev/null; then
    npm cache clean --force 2>/dev/null || true
    echo "   npm cache cleaned"
fi

# Clean Rust build artifacts (if not needed)
echo "🦀 Checking Rust build artifacts..."
if [ -d ~/.cargo ]; then
    SIZE_BEFORE=$(get_size ~/.cargo)
    cargo clean 2>/dev/null || true
    SIZE_AFTER=$(get_size ~/.cargo)
    echo "   Before: $SIZE_BEFORE → After: $SIZE_AFTER"
fi

# Clean system caches (be careful with this)
echo "🗑️  Cleaning system caches..."
if [ -d ~/Library/Caches ]; then
    # Clean common cache directories
    rm -rf ~/Library/Caches/com.apple.Safari/* 2>/dev/null || true
    rm -rf ~/Library/Caches/Google/* 2>/dev/null || true
    rm -rf ~/Library/Caches/com.microsoft.* 2>/dev/null || true
    echo "   System caches cleaned"
fi

# Clean Trash
echo "🗑️  Emptying Trash..."
if [ -d ~/.Trash ]; then
    SIZE_BEFORE=$(get_size ~/.Trash)
    rm -rf ~/.Trash/* 2>/dev/null || true
    SIZE_AFTER=$(get_size ~/.Trash)
    echo "   Before: $SIZE_BEFORE → After: $SIZE_AFTER"
fi

# Check disk space
echo ""
echo "💾 Current disk space:"
df -h / | tail -1

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "If you still need more space, consider:"
echo "  - Emptying Downloads folder"
echo "  - Removing old applications"
echo "  - Using macOS Storage Management (Apple menu → About This Mac → Storage)"

