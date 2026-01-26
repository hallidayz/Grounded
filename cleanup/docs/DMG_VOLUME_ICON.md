# DMG Hidden Files Explained

## What Hidden Files Are Created?

macOS DMG installers may contain several hidden system files that should be hidden from users but are necessary for proper functionality.

## Common Hidden Files in DMG Installers

### .VolumeIcon.icns

**Purpose:**
- **Volume Icon**: Sets the custom icon for the mounted DMG volume (the icon you see on the desktop)
- **Optional**: This file is NOT required for DMG functionality
- **Removal**: We remove this file entirely - the DMG works perfectly without it
- **Result**: The DMG will use the default disk icon instead of a custom icon

### .DS_Store

**Purpose:**
- **Finder Metadata**: Stores folder view settings, icon positions, and background preferences
- **Automatic Creation**: Created by Finder when viewing folders
- **Should be Hidden**: Users don't need to see this system file

### .apdisk

**Purpose:**
- **Network Information**: Stores information about mounted network folders
- **Rare in DMGs**: Usually only appears in network-mounted volumes
- **Should be Hidden**: System file that users don't need to see

### ._* (Resource Fork Files)

**Purpose:**
- **Resource Forks**: macOS creates these when copying files between volumes
- **Metadata Storage**: Contains extended attributes and resource fork data
- **Should be Hidden**: System files that clutter the view

### Other System Files

- **.fseventsd**: File system events database
- **.Spotlight-V100**: Spotlight search index
- **.Trashes**: Trash folder metadata
- **.TemporaryItems**: Temporary files directory

### How It Works

1. **Tauri automatically creates** `.VolumeIcon.icns` when building DMG installers
2. **macOS reads** this file when the DMG is mounted
3. **The file should be hidden** from users (invisible in Finder)
4. **The icon is applied** to the DMG volume automatically

## Why Is It Visible?

If you can see `.VolumeIcon.icns` in the DMG window, it means:

1. **The file wasn't properly hidden** during DMG creation
2. **Tauri may not be setting the invisible flag** automatically
3. **The file needs to be marked as hidden** using macOS file attributes

## Solution

The `scripts/hide-volume-icon.sh` script automatically removes or hides system files after DMG creation:

```bash
# The script:
# 1. Converts DMG to read-write format
# 2. Mounts the read-write DMG
# 3. Removes .VolumeIcon.icns entirely (not needed for DMG functionality)
# 4. Hides other system files (.DS_Store, etc.)
# 5. Converts back to compressed format
# 6. DMG works perfectly without .VolumeIcon.icns
```

**Files Automatically Handled:**
- `.VolumeIcon.icns` - **REMOVED** (not required, DMG works fine without it)
- `.DS_Store` - Hidden (Finder metadata)
- `.apdisk` - Hidden (Network folder info)
- `._*` - Hidden (Resource fork files)
- Other macOS system files - Hidden

## Technical Details

### File Attributes

macOS uses file attributes to hide files:
- **`SetFile -a V`**: Sets the invisible attribute (requires Xcode Command Line Tools)
- **`chflags hidden`**: Alternative method using built-in macOS command

### Tauri Behavior

- Tauri automatically creates `.VolumeIcon.icns` from your app icon
- The file is placed in the root of the DMG
- Tauri should hide it, but sometimes the flag isn't set correctly

### Best Practices

1. **Remove the file** - It's not required for DMG functionality
2. **Simpler solution** - Removing is more reliable than hiding
3. **Use the script** - The `hide-volume-icon.sh` script automatically removes it
4. **Result** - DMG works perfectly, just uses default disk icon instead

## Verification

To verify the file is hidden:

1. Open the DMG
2. Press `Cmd + Shift + .` (period) to show hidden files
3. You should see `.VolumeIcon.icns` when hidden files are shown
4. With hidden files hidden, it should not appear

## Summary

- ✅ **Normal**: System files are created automatically by macOS/Tauri
- ✅ **Expected**: These files are used for proper DMG functionality
- ✅ **Should be hidden**: Users shouldn't see system files in the DMG window
- ✅ **Automated**: The build script now hides all system files automatically

**Important Notes:**

1. **.VolumeIcon.icns is optional** - We remove it entirely (DMG works fine without it)
2. **Other system files are hidden** - They may be needed, so we hide them instead of removing
3. **Removal is simpler** - More reliable than trying to hide the file
4. **Windows/Linux installers** - Don't have these files (macOS-specific)

**Result:** The DMG installer window will be clean, showing only the app and Applications folder. The DMG will use the default disk icon instead of a custom icon, which is perfectly acceptable and doesn't affect functionality.

