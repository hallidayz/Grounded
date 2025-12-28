#!/bin/bash
# Create a 512x512 PWA icon from the 192x192 icon using sips

if [ -f "pwa-192x192.png" ]; then
  # Check if it's a valid image
  if file pwa-192x192.png | grep -q "image"; then
    echo "Creating 512x512 icon from 192x192..."
    sips -z 512 512 pwa-192x192.png --out pwa-512x512.png
    if [ -f "pwa-512x512.png" ]; then
      echo "✅ Created pwa-512x512.png"
      exit 0
    fi
  fi
fi

# If we can't resize, create a simple colored square icon
echo "Creating new 512x512 icon..."
python3 << 'PYTHON'
from PIL import Image, ImageDraw, ImageFont
import os

# Create 512x512 image
img = Image.new('RGB', (512, 512), color='#02295b')
draw = ImageDraw.Draw(img)

# Draw a simple "G" or logo
try:
    # Try to use a font
    font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 200)
except:
    font = ImageFont.load_default()

# Draw text "G" in center
text = "G"
bbox = draw.textbbox((0, 0), text, font=font)
text_width = bbox[2] - bbox[0]
text_height = bbox[3] - bbox[1]
position = ((512 - text_width) // 2, (512 - text_height) // 2 - 50)
draw.text(position, text, fill='#fda700', font=font)

img.save('pwa-512x512.png')
print("✅ Created pwa-512x512.png")
PYTHON

if [ -f "pwa-512x512.png" ]; then
  echo "✅ Icon created successfully"
else
  echo "❌ Failed to create icon. Please use create-icons.html in a browser."
fi
