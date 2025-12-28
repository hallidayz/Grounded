#!/bin/bash

# Hide system and volume icon files in DMG
# These files are used by macOS but should be hidden from users

DMG_PATH="$1"

if [ -z "$DMG_PATH" ]; then
  echo "Usage: $0 <path-to-dmg>"
  exit 1
fi

if [ ! -f "$DMG_PATH" ]; then
  echo "Error: DMG file not found: $DMG_PATH"
  exit 1
fi

# Check if DMG is mounted and unmount it if necessary
MOUNTED_VOLUME=$(hdiutil info | grep -A 5 "$DMG_PATH" | grep "/Volumes/" | awk '{print $3}' | head -1)
if [ -n "$MOUNTED_VOLUME" ]; then
  echo "📝 Unmounting already-mounted DMG at $MOUNTED_VOLUME..."
  hdiutil detach "$MOUNTED_VOLUME" -force -quiet 2>/dev/null || hdiutil detach "$MOUNTED_VOLUME" -quiet
  sleep 1
fi

echo "🔧 Removing system files from DMG..."

# Method: Convert DMG to read-write, hide files, rebuild DMG
# This is the most reliable way to ensure hidden attributes persist

echo "📝 Step 1: Converting DMG to read-write format..."

# Create a temporary read-write DMG
TEMP_DMG="${DMG_PATH}.rw.dmg"
# Remove old temp file if it exists
rm -f "$TEMP_DMG"

# Convert with error capture
CONVERT_OUTPUT=$(hdiutil convert "$DMG_PATH" -format UDRW -o "$TEMP_DMG" 2>&1)
CONVERT_EXIT=$?

if [ $CONVERT_EXIT -ne 0 ] || [ ! -f "$TEMP_DMG" ]; then
  echo "❌ Error: Could not convert DMG to read-write format"
  echo "   Exit code: $CONVERT_EXIT"
  echo "   Output: $CONVERT_OUTPUT"
  echo "💡 The DMG may be mounted or locked. Try unmounting it first."
  exit 1
fi

# Mount the read-write DMG
echo "📝 Step 2: Mounting read-write DMG..."
TEMP_MOUNT_RW=$(mktemp -d)
if ! hdiutil attach "$TEMP_DMG" -mountpoint "$TEMP_MOUNT_RW" -quiet -nobrowse -noautoopen; then
  echo "❌ Error: Could not mount read-write DMG"
  rm -f "$TEMP_DMG"
  exit 1
fi

# Wait a moment for mount to settle
sleep 1

# List of files/directories that should be hidden
FILES_TO_HIDE=(
  ".VolumeIcon.icns"
  ".DS_Store"
  ".apdisk"
  ".fseventsd"
  ".Spotlight-V100"
  ".Trashes"
  ".TemporaryItems"
)

# Hide or remove files in the read-write DMG
echo "📝 Step 3: Removing/hiding system files..."
HIDDEN_COUNT=0
REMOVED_COUNT=0

for file_name in "${FILES_TO_HIDE[@]}"; do
  file_path="$TEMP_MOUNT_RW/$file_name"
  
  if [ -e "$file_path" ]; then
    # For .VolumeIcon.icns, we can remove it entirely - it's only for the volume icon
    # The DMG will work fine without it (just won't have a custom volume icon)
    if [ "$file_name" = ".VolumeIcon.icns" ]; then
      rm -f "$file_path"
      echo "✅ Removed $file_name (not required for DMG functionality)"
      ((REMOVED_COUNT++))
    else
      # For other system files, hide them (they may be needed)
      # Use SetFile if available (most reliable)
      if command -v SetFile &> /dev/null; then
        SetFile -a V "$file_path" 2>/dev/null
      fi
      # Also use chflags as backup
      chflags hidden "$file_path" 2>/dev/null
      # Set extended attribute (FinderInfo) to mark as invisible
      xattr -w com.apple.FinderInfo "0000000000000000040000000000000000000000000000000000000000000000" "$file_path" 2>/dev/null
      
      echo "✅ Hidden $file_name"
      ((HIDDEN_COUNT++))
    fi
  fi
done

# Hide resource fork files
find "$TEMP_MOUNT_RW" -name "._*" -type f 2>/dev/null | while read -r file; do
  if command -v SetFile &> /dev/null; then
    SetFile -a V "$file" 2>/dev/null
  fi
  chflags hidden "$file" 2>/dev/null
done

# Force sync to ensure changes are written to disk
sync

# Verify files were removed/hidden before unmounting
if [ $REMOVED_COUNT -gt 0 ] || [ $HIDDEN_COUNT -gt 0 ]; then
  echo "📝 Verified changes:"
  if [ $REMOVED_COUNT -gt 0 ]; then
    echo "   ✅ Removed $REMOVED_COUNT file(s) (.VolumeIcon.icns removed)"
    # Verify .VolumeIcon.icns is gone
    if [ ! -e "$TEMP_MOUNT_RW/.VolumeIcon.icns" ]; then
      echo "   ✅ Confirmed: .VolumeIcon.icns is removed from mounted DMG"
    else
      echo "   ⚠️  Warning: .VolumeIcon.icns still exists (removal may have failed)"
    fi
  fi
  if [ $HIDDEN_COUNT -gt 0 ]; then
    echo "   ✅ Hidden $HIDDEN_COUNT file(s)"
  fi
fi

# Force sync to ensure all changes are written
sync
sleep 1

# Unmount the read-write DMG
echo "📝 Step 4: Unmounting read-write DMG..."
# Try multiple times to ensure clean unmount
for i in {1..3}; do
  if hdiutil detach "$TEMP_MOUNT_RW" -force -quiet 2>/dev/null; then
    break
  fi
  sleep 2
  if [ $i -eq 3 ]; then
    echo "⚠️  Warning: Could not cleanly unmount, forcing..."
    hdiutil detach "$TEMP_MOUNT_RW" -force 2>/dev/null || true
  fi
done

# Wait for unmount to complete
sleep 2

# Convert back to compressed read-only format
echo "📝 Step 5: Converting back to compressed format..."

# Get absolute paths to avoid issues
TEMP_DMG_ABS=$(cd "$(dirname "$TEMP_DMG")" && pwd)/$(basename "$TEMP_DMG")
DMG_DIR_ABS=$(cd "$(dirname "$DMG_PATH")" && pwd)
DMG_NAME=$(basename "$DMG_PATH")
DMG_PATH_ABS="$DMG_DIR_ABS/$DMG_NAME"

# Use a unique temporary filename to avoid conflicts
# Note: hdiutil convert automatically adds .dmg extension, so we specify without it
NEW_DMG_BASE="${DMG_NAME%.dmg}.$$.new"
NEW_DMG_ABS="$DMG_DIR_ABS/${NEW_DMG_BASE}.dmg"

# Remove any old temp files
rm -f "$DMG_DIR_ABS/${DMG_NAME%.dmg}.new.dmg" "$DMG_DIR_ABS/${DMG_NAME%.dmg}.*.new.dmg" 2>/dev/null

# Convert with error checking
echo "   Converting: $TEMP_DMG_ABS -> $NEW_DMG_ABS"
CONVERT_OUTPUT=$(hdiutil convert "$TEMP_DMG_ABS" -format UDZO -o "$DMG_DIR_ABS/$NEW_DMG_BASE" 2>&1)
CONVERT_EXIT=$?

if [ $CONVERT_EXIT -eq 0 ]; then
  # Wait a moment for file to be written
  sleep 1
  # Verify the new DMG was created and has reasonable size
  # hdiutil adds .dmg extension automatically
  if [ -f "$NEW_DMG_ABS" ] && [ -s "$NEW_DMG_ABS" ]; then
    echo "   ✅ New DMG created: $(ls -lh "$NEW_DMG_ABS" | awk '{print $5}')"
    # Replace original with new DMG
    rm -f "$DMG_PATH_ABS"
    mv "$NEW_DMG_ABS" "$DMG_PATH_ABS"
    rm -f "$TEMP_DMG_ABS"
    
    if [ $REMOVED_COUNT -gt 0 ] || [ $HIDDEN_COUNT -gt 0 ]; then
      if [ $REMOVED_COUNT -gt 0 ]; then
        echo "✅ Removed $REMOVED_COUNT system file(s) from DMG (.VolumeIcon.icns removed)"
      fi
      if [ $HIDDEN_COUNT -gt 0 ]; then
        echo "✅ Hidden $HIDDEN_COUNT system file(s) in DMG"
      fi
      echo "✅ DMG rebuilt successfully - .VolumeIcon.icns removed (DMG will work fine without it)"
    else
      echo "ℹ️  No system files found to remove/hide (this is normal)"
    fi
  else
    echo "❌ Error: New DMG file was not created or is empty"
    echo "   Expected: $NEW_DMG_ABS"
    echo "   File exists: $([ -f "$NEW_DMG_ABS" ] && echo 'yes' || echo 'no')"
    echo "   File size: $([ -f "$NEW_DMG_ABS" ] && ls -lh "$NEW_DMG_ABS" | awk '{print $5}' || echo 'N/A')"
    echo "   Conversion output: $CONVERT_OUTPUT"
    echo "⚠️  Original DMG unchanged. Read-write version at: $TEMP_DMG_ABS"
    exit 1
  fi
else
  echo "❌ Error: Could not convert DMG back to compressed format"
  echo "   Exit code: $CONVERT_EXIT"
  echo "   Output: $CONVERT_OUTPUT"
  echo "⚠️  Original DMG unchanged. Read-write version at: $TEMP_DMG_ABS"
  echo "💡 You may need to manually remove .VolumeIcon.icns from the mounted DMG"
  exit 1
fi
