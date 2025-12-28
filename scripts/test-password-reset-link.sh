#!/bin/bash

# Test script for password reset deep link functionality
# This script tests the tauri://localhost/#reset/token deep link

echo "🧪 Testing Password Reset Deep Link"
echo "===================================="
echo ""

# Test token
TEST_TOKEN="test-reset-token-12345"
DEEP_LINK="tauri://localhost/#reset/${TEST_TOKEN}"

echo "📋 Test Configuration:"
echo "  - Deep Link: ${DEEP_LINK}"
echo "  - Expected Behavior: App should open and show password reset form"
echo ""

# Check if we're on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 macOS detected - Using 'open' command"
    echo ""
    echo "⚠️  IMPORTANT: Make sure the Tauri app is running first!"
    echo "   Run: npm run dev:tauri"
    echo ""
    read -p "Press Enter when the app is running, or Ctrl+C to cancel..."
    echo ""
    echo "🔗 Opening deep link: ${DEEP_LINK}"
    open "${DEEP_LINK}"
    echo ""
    echo "✅ Deep link sent!"
    echo ""
    echo "📝 What to check:"
    echo "   1. App should receive the deep link"
    echo "   2. Login screen should show password reset form"
    echo "   3. Reset token should be: ${TEST_TOKEN}"
    echo "   4. Check browser console for any errors"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "🐧 Linux detected - Using 'xdg-open' command"
    echo ""
    echo "⚠️  IMPORTANT: Make sure the Tauri app is running first!"
    echo "   Run: npm run dev:tauri"
    echo ""
    read -p "Press Enter when the app is running, or Ctrl+C to cancel..."
    echo ""
    echo "🔗 Opening deep link: ${DEEP_LINK}"
    xdg-open "${DEEP_LINK}"
    echo ""
    echo "✅ Deep link sent!"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    echo "🪟 Windows detected - Using 'start' command"
    echo ""
    echo "⚠️  IMPORTANT: Make sure the Tauri app is running first!"
    echo "   Run: npm run dev:tauri"
    echo ""
    read -p "Press Enter when the app is running, or Ctrl+C to cancel..."
    echo ""
    echo "🔗 Opening deep link: ${DEEP_LINK}"
    start "${DEEP_LINK}"
    echo ""
    echo "✅ Deep link sent!"
else
    echo "❌ Unsupported OS: $OSTYPE"
    echo "   Please manually test by opening: ${DEEP_LINK}"
    exit 1
fi

echo ""
echo "✨ Test complete!"
echo ""
echo "📊 Expected Results:"
echo "   ✅ App receives deep link"
echo "   ✅ Login screen shows password reset form"
echo "   ✅ Reset token is correctly parsed"
echo "   ✅ No console errors"
echo ""

