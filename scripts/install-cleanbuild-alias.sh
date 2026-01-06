#!/bin/bash
# ================================================
# Grounded Project - Clean Rebuild Alias Installer
# Description:
#   Sets up a one-line alias `cleanbuild`
#   for completely cleaning and rebuilding
#   a Vite + React Node project.
# ================================================

set -e  # Exit on error

# --- Create alias ---
echo "Creating alias 'cleanbuild'..."

# For bash or zsh users, append alias line to shell profile
if [ -n "$ZSH_VERSION" ]; then
  PROFILE="$HOME/.zshrc"
elif [ -n "$BASH_VERSION" ]; then
  PROFILE="$HOME/.bashrc"
else
  PROFILE="$HOME/.profile"
fi

# Create profile if it doesn't exist
if [ ! -f "$PROFILE" ]; then
  touch "$PROFILE"
  echo "Created $PROFILE"
fi

# Define the alias line
ALIAS_CMD="alias cleanbuild='rm -rf node_modules package-lock.json .vite dist && npm install && npm run dev'"

# Prevent duplicate entries (improved check)
if grep -q "alias cleanbuild=" "$PROFILE" 2>/dev/null; then
  echo "⚠️  Alias 'cleanbuild' already exists in $PROFILE"
  echo "   Skipping duplicate entry."
  ALIAS_EXISTS=true
else
  echo "$ALIAS_CMD" >> "$PROFILE"
  echo "✅ Alias 'cleanbuild' added to $PROFILE"
  ALIAS_EXISTS=false
fi

# Reload profile automatically in the current session (with error handling)
if [ "$ALIAS_EXISTS" = "false" ] || [ -z "$ALIAS_EXISTS" ]; then
  if [ -f "$PROFILE" ]; then
    # Source in a subshell to avoid breaking current session if profile has errors
    (source "$PROFILE" 2>/dev/null) || {
      echo "⚠️  Warning: Could not source $PROFILE (may have syntax errors)"
      echo "   The alias will be available in new terminal sessions."
    }
  fi
fi

echo ""
echo "✅ Alias 'cleanbuild' added to $PROFILE"
echo ""
echo "You can now type: cleanbuild"
echo "to perform a full cache wipe, reinstall, and start the dev server."
echo ""
echo "Alias details:"
echo "rm -rf node_modules package-lock.json .vite dist && npm install && npm run dev"
echo ""
echo "💡 Note: If the alias doesn't work immediately, open a new terminal or run:"
echo "   source $PROFILE"
echo ""
echo "Done!"
# ================================================

