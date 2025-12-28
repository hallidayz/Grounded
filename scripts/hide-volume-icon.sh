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

# Mount the DMG
TEMP_MOUNT=$(mktemp -d)
hdiutil attach "$DMG_PATH" -mountpoint "$TEMP_MOUNT" -quiet

if [ $? -ne 0 ]; then
  echo "Error: Failed to mount DMG"
  exit 1
fi

# Function to hide a file if it exists
hide_file() {
  local file_path="$1"
  local file_name="$2"
  
  if [ -f "$file_path" ] || [ -d "$file_path" ]; then
    # Set the invisible flag using SetFile (part of Xcode Command Line Tools)
    if command -v SetFile &> /dev/null; then
      SetFile -a V "$file_path" 2>/dev/null
      echo "✅ Hidden $file_name"
    else
      # Alternative: use chflags (built-in macOS command)
      chflags hidden "$file_path" 2>/dev/null
      echo "✅ Hidden $file_name (using chflags)"
    fi
    return 0
  else
    return 1
  fi
}

# List of files/directories that should be hidden
# These are standard macOS system files that shouldn't be visible to users
FILES_TO_HIDE=(
  ".VolumeIcon.icns:Volume icon (DMG volume icon)"
  ".DS_Store:Finder metadata"
  ".apdisk:Network folder information"
  ".fseventsd:File system events"
  ".Spotlight-V100:Spotlight index"
  ".Trashes:Trash folder"
  ".TemporaryItems:Temporary items"
)

HIDDEN_COUNT=0

# Hide each file/directory if it exists
for file_info in "${FILES_TO_HIDE[@]}"; do
  IFS=':' read -r file_name file_desc <<< "$file_info"
  file_path="$TEMP_MOUNT/$file_name"
  
  if hide_file "$file_path" "$file_name ($file_desc)"; then
    ((HIDDEN_COUNT++))
  fi
done

# Also hide any files starting with ._ (resource fork files created by macOS)
# These are created when copying files between volumes
find "$TEMP_MOUNT" -name "._*" -type f 2>/dev/null | while read -r file; do
  if hide_file "$file" "$(basename "$file") (resource fork)"; then
    ((HIDDEN_COUNT++))
  fi
done

# Convert DMG to read-write format, hide files, then convert back
# This ensures the hidden attribute is properly saved
echo "📝 Converting DMG to read-write format to save hidden attributes..."

# Create a temporary read-write DMG
TEMP_DMG="${DMG_PATH}.rw.dmg"
hdiutil convert "$DMG_PATH" -format UDRW -o "$TEMP_DMG" -quiet

if [ $? -ne 0 ]; then
  echo "⚠️  Could not convert DMG to read-write format, trying direct method..."
  # Fallback: just unmount and hope the attributes stick
  hdiutil detach "$TEMP_MOUNT" -quiet
  if [ $HIDDEN_COUNT -gt 0 ]; then
    echo "✅ Hidden $HIDDEN_COUNT system file(s) in DMG (may need rebuild)"
  else
    echo "ℹ️  No system files found to hide (this is normal)"
  fi
  exit 0
fi

# Unmount the original
hdiutil detach "$TEMP_MOUNT" -quiet 2>/dev/null || true

# Mount the read-write DMG
TEMP_MOUNT_RW=$(mktemp -d)
hdiutil attach "$TEMP_DMG" -mountpoint "$TEMP_MOUNT_RW" -quiet -nobrowse

if [ $? -ne 0 ]; then
  echo "⚠️  Could not mount read-write DMG, using original"
  rm -f "$TEMP_DMG"
  exit 1
fi

# Hide files in the read-write DMG
HIDDEN_COUNT=0
for file_info in "${FILES_TO_HIDE[@]}"; do
  IFS=':' read -r file_name file_desc <<< "$file_info"
  file_path="$TEMP_MOUNT_RW/$file_name"
  
  if hide_file "$file_path" "$file_name ($file_desc)"; then
    ((HIDDEN_COUNT++))
  fi
done

# Hide resource fork files
find "$TEMP_MOUNT_RW" -name "._*" -type f 2>/dev/null | while read -r file; do
  if hide_file "$file" "$(basename "$file") (resource fork)"; then
    ((HIDDEN_COUNT++))
  fi
done

# Unmount the read-write DMG
hdiutil detach "$TEMP_MOUNT_RW" -quiet

# Convert back to compressed read-only format
echo "📦 Converting DMG back to compressed format..."
hdiutil convert "$TEMP_DMG" -format UDZO -o "$DMG_PATH" -quiet

if [ $? -eq 0 ]; then
  rm -f "$TEMP_DMG"
  if [ $HIDDEN_COUNT -gt 0 ]; then
    echo "✅ Hidden $HIDDEN_COUNT system file(s) in DMG and rebuilt"
  else
    echo "ℹ️  No system files found to hide (this is normal)"
  fi
else
  echo "⚠️  Could not convert DMG back, keeping read-write version"
  mv "$TEMP_DMG" "$DMG_PATH"
  if [ $HIDDEN_COUNT -gt 0 ]; then
    echo "✅ Hidden $HIDDEN_COUNT system file(s) in DMG"
  fi
fi

