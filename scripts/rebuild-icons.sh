#!/bin/bash
# Rebuild all icons and logos from ac-minds-logo.png
# This script generates all required icon sizes from the source logo

set -e

SOURCE_LOGO="public/ac-minds-logo.png"
PUBLIC_DIR="public"
TAURI_ICONS_DIR="src-tauri/icons"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🎨 Rebuilding all icons from ac-minds-logo.png${NC}\n"

# Check if source logo exists
if [ ! -f "$SOURCE_LOGO" ]; then
    echo -e "${RED}❌ Error: Source logo not found: $SOURCE_LOGO${NC}"
    exit 1
fi

# Check if Python/PIL is available
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Error: Python3 not found. Please install Python.${NC}"
    exit 1
fi

# Check if PIL/Pillow is installed
python3 -c "from PIL import Image" 2>/dev/null || {
    echo -e "${YELLOW}⚠️  PIL/Pillow not installed. Installing...${NC}"
    pip3 install Pillow --quiet || {
        echo -e "${RED}❌ Failed to install Pillow. Please install manually: pip3 install Pillow${NC}"
        exit 1
    }
}

# Function to resize image
resize_image() {
    local input="$1"
    local output="$2"
    local width="$3"
    local height="$4"
    
    python3 << PYTHON_EOF
from PIL import Image
import sys

try:
    img = Image.open("$input")
    
    # Use high-quality resampling
    resized = img.resize(($width, $height), Image.Resampling.LANCZOS)
    
    # Save with high quality
    resized.save("$output", "PNG", optimize=True)
    print(f"✅ Created $output ($width x $height)")
except Exception as e:
    print(f"❌ Error creating $output: {e}", file=sys.stderr)
    sys.exit(1)
PYTHON_EOF
}

# Function to create ICO file with multiple sizes
create_ico() {
    local input="$1"
    local output="$2"
    
    python3 << PYTHON_EOF
from PIL import Image
import sys

try:
    # Open source image
    img = Image.open("$input")
    
    # Resize to common ICO sizes
    sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    images = []
    
    for size in sizes:
        resized = img.resize(size, Image.Resampling.LANCZOS)
        images.append(resized)
    
    # Save as ICO with multiple sizes
    images[0].save("$output", format='ICO', sizes=[(s.width, s.height) for s in images])
    print(f"✅ Created $output (multi-size ICO)")
except Exception as e:
    print(f"❌ Error creating $output: {e}", file=sys.stderr)
    sys.exit(1)
PYTHON_EOF
}

# Function to create ICNS file (macOS)
create_icns() {
    local input="$1"
    local output_dir="$2"
    local output_name="$3"
    
    # Create temporary iconset directory
    local iconset_dir="${output_dir}/${output_name}.iconset"
    rm -rf "$iconset_dir"
    mkdir -p "$iconset_dir"
    
    # Create all required sizes for ICNS
    python3 << PYTHON_EOF
from PIL import Image
import os

img = Image.open("$input")

# ICNS requires specific sizes
sizes = [
    (16, 16, "icon_16x16.png"),
    (32, 32, "icon_16x16@2x.png"),
    (32, 32, "icon_32x32.png"),
    (64, 64, "icon_32x32@2x.png"),
    (128, 128, "icon_128x128.png"),
    (256, 256, "icon_128x128@2x.png"),
    (256, 256, "icon_256x256.png"),
    (512, 512, "icon_256x256@2x.png"),
    (512, 512, "icon_512x512.png"),
    (1024, 1024, "icon_512x512@2x.png")
]

iconset_path = "$iconset_dir"
for width, height, filename in sizes:
    resized = img.resize((width, height), Image.Resampling.LANCZOS)
    resized.save(os.path.join(iconset_path, filename), "PNG", optimize=True)

print(f"✅ Created iconset in $iconset_dir")
PYTHON_EOF

    # Convert iconset to ICNS using iconutil (macOS only)
    if command -v iconutil &> /dev/null; then
        iconutil -c icns "$iconset_dir" -o "${output_dir}/${output_name}.icns" 2>/dev/null && {
            rm -rf "$iconset_dir"
            echo -e "${GREEN}✅ Created ${output_name}.icns${NC}"
        } || {
            echo -e "${YELLOW}⚠️  iconutil failed. ICNS file not created.${NC}"
            echo -e "${YELLOW}   You can manually convert using: iconutil -c icns ${iconset_dir}${NC}"
        }
    else
        echo -e "${YELLOW}⚠️  iconutil not found. ICNS file not created.${NC}"
        echo -e "${YELLOW}   Iconset created at: ${iconset_dir}${NC}"
        echo -e "${YELLOW}   Convert manually: iconutil -c icns ${iconset_dir}${NC}"
    fi
}

echo -e "${GREEN}📦 Creating PWA icons...${NC}"
resize_image "$SOURCE_LOGO" "$PUBLIC_DIR/pwa-192x192.png" 192 192
resize_image "$SOURCE_LOGO" "$PUBLIC_DIR/pwa-512x512.png" 512 512
resize_image "$SOURCE_LOGO" "$PUBLIC_DIR/apple-touch-icon.png" 180 180

echo -e "\n${GREEN}📦 Creating favicon...${NC}"
create_ico "$SOURCE_LOGO" "$PUBLIC_DIR/favicon.ico"

echo -e "\n${GREEN}📦 Creating Tauri icons...${NC}"
resize_image "$SOURCE_LOGO" "$TAURI_ICONS_DIR/32x32.png" 32 32
resize_image "$SOURCE_LOGO" "$TAURI_ICONS_DIR/128x128.png" 128 128
resize_image "$SOURCE_LOGO" "$TAURI_ICONS_DIR/128x128@2x.png" 256 256
create_ico "$SOURCE_LOGO" "$TAURI_ICONS_DIR/icon.ico"

echo -e "\n${GREEN}📦 Creating macOS ICNS...${NC}"
create_icns "$SOURCE_LOGO" "$TAURI_ICONS_DIR" "icon"

echo -e "\n${GREEN}✅ All icons rebuilt successfully!${NC}\n"
echo -e "${GREEN}📋 Generated files:${NC}"
echo -e "  ${GREEN}Public icons:${NC}"
echo -e "    • $PUBLIC_DIR/pwa-192x192.png"
echo -e "    • $PUBLIC_DIR/pwa-512x512.png"
echo -e "    • $PUBLIC_DIR/apple-touch-icon.png"
echo -e "    • $PUBLIC_DIR/favicon.ico"
echo -e "  ${GREEN}Tauri icons:${NC}"
echo -e "    • $TAURI_ICONS_DIR/32x32.png"
echo -e "    • $TAURI_ICONS_DIR/128x128.png"
echo -e "    • $TAURI_ICONS_DIR/128x128@2x.png"
echo -e "    • $TAURI_ICONS_DIR/icon.ico"
echo -e "    • $TAURI_ICONS_DIR/icon.icns"
echo -e "\n${YELLOW}💡 Next steps:${NC}"
echo -e "  1. Rebuild the app: npm run build:pwa"
echo -e "  2. Rebuild installers: npm run build:installers"
echo -e "  3. Test icons in the app and installers"

