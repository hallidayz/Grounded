#!/bin/bash
# Grounded PWA Launcher for Mac/Linux
# This script tries multiple methods to start the server

PORT=${1:-8000}
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DIST_DIR="$SCRIPT_DIR/dist"

if [ ! -d "$DIST_DIR" ]; then
  echo "❌ Error: dist/ folder not found."
  echo "   Make sure you are in the Grounded-Install folder."
  exit 1
fi

echo ""
echo "🚀 Starting Grounded PWA..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Method 1: Try Node.js server (best - includes AI model support)
if command -v node &> /dev/null; then
  echo "✅ Using Node.js server (AI models will work)"
  cd "$SCRIPT_DIR"
  node launcher.js \$PORT
  exit 0
fi

# Method 2: Try npx serve (if Node.js is installed)
if command -v npx &> /dev/null; then
  echo "⚠️  Using npx serve (AI models may not work)"
  echo "   For full AI support, install Node.js and use: node launcher.js"
  cd "$DIST_DIR"
  npx -y serve -p \$PORT --cors
  exit 0
fi

# Method 3: Try Python 3
if command -v python3 &> /dev/null; then
  echo "⚠️  Using Python server (AI models will NOT work)"
  echo "   Install Node.js for full AI support: https://nodejs.org"
  cd "$DIST_DIR"
  python3 -m http.server \$PORT
  exit 0
fi

# Method 4: Try Python 2
if command -v python &> /dev/null; then
  echo "⚠️  Using Python server (AI models will NOT work)"
  echo "   Install Node.js for full AI support: https://nodejs.org"
  cd "$DIST_DIR"
  python -m SimpleHTTPServer \$PORT 2>/dev/null || python -m http.server \$PORT
  exit 0
fi

# Method 5: Try PHP
if command -v php &> /dev/null; then
  echo "⚠️  Using PHP server (AI models will NOT work)"
  echo "   Install Node.js for full AI support: https://nodejs.org"
  cd "$DIST_DIR"
  php -S localhost:\$PORT
  exit 0
fi

echo "❌ No server found. Please install one of:"
echo "   1. Node.js (recommended): https://nodejs.org"
echo "   2. Python: https://www.python.org"
echo "   3. PHP: https://www.php.net"
exit 1
