# DMG Hidden Files Explained

## What Hidden Files Are Created?

macOS DMG installers may contain several hidden system files that should be hidden from users but are necessary for proper functionality.

## Common Hidden Files in DMG Installers

### .VolumeIcon.icns

**Purpose:**
- **Volume Icon**: Sets the custom icon for the mounted DMG volume (the icon you see on the desktop)
- **Professional Appearance**: Makes the DMG look polished and branded
- **User Experience**: Helps users identify the installer visually

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

The `scripts/hide-volume-icon.sh` script automatically hides all system files after DMG creation:

```bash
# The script:
# 1. Mounts the DMG
# 2. Sets the invisible flag on all system files (.VolumeIcon.icns, .DS_Store, etc.)
# 3. Hides resource fork files (._*)
# 4. Unmounts the DMG
# 5. Files are now hidden but still function properly
```

**Files Automatically Hidden:**
- `.VolumeIcon.icns` - DMG volume icon
- `.DS_Store` - Finder metadata
- `.apdisk` - Network folder info
- `._*` - Resource fork files
- Other macOS system files

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

1. **Keep the file** - It's necessary for a professional DMG appearance
2. **Hide it** - Users shouldn't see it in the DMG window
3. **Use the script** - The `hide-volume-icon.sh` script ensures it's hidden

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

1. **These files are necessary** - Don't delete them, just hide them
2. **They're standard macOS features** - All professional DMG installers have them
3. **Hiding is cosmetic** - Files still function properly when hidden
4. **Windows/Linux installers** - Don't have these files (macOS-specific)

The files are **not a problem** - they're standard macOS features that make your DMG work properly and look professional!

