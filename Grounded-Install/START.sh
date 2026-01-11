#!/bin/bash
# Auto-Launcher for Grounded PWA
# Just double-click this file - everything is automated!

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Check for Node.js
if ! command -v node &> /dev/null; then
  echo ""
  echo "❌ Node.js is required but not found."
  echo ""
  echo "📥 Please install Node.js:"
  echo "   Visit: https://nodejs.org"
  echo "   Download and install, then try again."
  echo ""
  read -p "Press Enter to exit..."
  exit 1
fi

# Run the auto-launcher
node launcher.js
