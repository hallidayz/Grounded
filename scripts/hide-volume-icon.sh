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

echo "🔧 Hiding system files in DMG..."

# Method: Convert DMG to read-write, hide files, rebuild DMG
# This is the most reliable way to ensure hidden attributes persist

echo "📝 Step 1: Converting DMG to read-write format..."

# Create a temporary read-write DMG
TEMP_DMG="${DMG_PATH}.rw.dmg"
if ! hdiutil convert "$DMG_PATH" -format UDRW -o "$TEMP_DMG" -quiet; then
  echo "❌ Error: Could not convert DMG to read-write format"
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

# Unmount the read-write DMG
echo "📝 Step 4: Unmounting read-write DMG..."
hdiutil detach "$TEMP_MOUNT_RW" -force -quiet 2>/dev/null || hdiutil detach "$TEMP_MOUNT_RW" -quiet

# Wait for unmount to complete
sleep 1

# Convert back to compressed read-only format
echo "📝 Step 5: Converting back to compressed format..."
if hdiutil convert "$TEMP_DMG" -format UDZO -o "${DMG_PATH}.new" -quiet; then
  # Replace original with new DMG
  mv "${DMG_PATH}.new" "$DMG_PATH"
  rm -f "$TEMP_DMG"
  
  if [ $REMOVED_COUNT -gt 0 ] || [ $HIDDEN_COUNT -gt 0 ]; then
    if [ $REMOVED_COUNT -gt 0 ]; then
      echo "✅ Removed $REMOVED_COUNT system file(s) from DMG (.VolumeIcon.icns removed)"
    fi
    if [ $HIDDEN_COUNT -gt 0 ]; then
      echo "✅ Hidden $HIDDEN_COUNT system file(s) in DMG"
    fi
    echo "✅ DMG rebuilt - .VolumeIcon.icns removed (DMG will work fine without it)"
  else
    echo "ℹ️  No system files found to remove/hide (this is normal)"
  fi
else
  echo "❌ Error: Could not convert DMG back to compressed format"
  echo "⚠️  Keeping read-write version at: $TEMP_DMG"
  exit 1
fi
