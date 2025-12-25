#!/bin/bash
# Create ICO file from PNG using Python (works on macOS without ImageMagick)

SOURCE="../public/ac-minds-logo.png"
OUTPUT="icon.ico"

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "Python3 not found. Please install Python or use online tool:"
    echo "https://cloudconvert.com/png-to-ico"
    exit 1
fi

# Create ICO using Python PIL/Pillow
python3 << EOF
from PIL import Image
import sys

try:
    # Open source image
    img = Image.open("$SOURCE")
    
    # Resize to common ICO sizes and save as ICO
    sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    images = []
    
    for size in sizes:
        resized = img.resize(size, Image.Resampling.LANCZOS)
        images.append(resized)
    
    # Save as ICO with multiple sizes
    images[0].save("$OUTPUT", format='ICO', sizes=[(s.width, s.height) for s in images])
    print(f"✅ Created $OUTPUT")
except ImportError:
    print("PIL/Pillow not installed. Install with: pip3 install Pillow")
    print("Or use online tool: https://cloudconvert.com/png-to-ico")
    sys.exit(1)
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
EOF

