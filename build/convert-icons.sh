#!/bin/bash

# Convert icon-512.png to all required formats
# Requires ImageMagick (install: brew install imagemagick or apt install imagemagick)

echo "🎨 Converting icons for all platforms..."

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick not installed. Install with:"
    echo "   macOS: brew install imagemagick"
    echo "   Linux: sudo apt install imagemagick"
    echo "   Windows: https://imagemagick.org/script/download.php"
    exit 1
fi

# Windows .ico
echo "🪟 Creating Windows icon..."
convert icon-512.png \
    -define icon:auto-resize=256,128,64,48,32,16 \
    icon.ico
echo "✅ icon.ico created"

# macOS .icns (requires macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 Creating macOS icon..."
    
    mkdir -p icon.iconset
    sips -z 16 16 icon-512.png --out icon.iconset/icon_16x16.png
    sips -z 32 32 icon-512.png --out icon.iconset/icon_16x16@2x.png
    sips -z 32 32 icon-512.png --out icon.iconset/icon_32x32.png
    sips -z 64 64 icon-512.png --out icon.iconset/icon_32x32@2x.png
    sips -z 128 128 icon-512.png --out icon.iconset/icon_128x128.png
    sips -z 256 256 icon-512.png --out icon.iconset/icon_128x128@2x.png
    sips -z 256 256 icon-512.png --out icon.iconset/icon_256x256.png
    sips -z 512 512 icon-512.png --out icon.iconset/icon_256x256@2x.png
    sips -z 512 512 icon-512.png --out icon.iconset/icon_512x512.png
    
    iconutil -c icns icon.iconset
    rm -rf icon.iconset
    
    echo "✅ icon.icns created"
else
    echo "⚠️  Skipping macOS .icns (requires macOS)"
fi

# Linux icons directory
echo "🐧 Creating Linux icons..."
mkdir -p icons
convert icon-512.png -resize 16x16 icons/16x16.png
convert icon-512.png -resize 32x32 icons/32x32.png
convert icon-512.png -resize 48x48 icons/48x48.png
convert icon-512.png -resize 64x64 icons/64x64.png
convert icon-512.png -resize 128x128 icons/128x128.png
convert icon-512.png -resize 256x256 icons/256x256.png
convert icon-512.png -resize 512x512 icons/512x512.png
echo "✅ Linux icons created in icons/"

echo ""
echo "🎉 All icons created successfully!"
echo "📁 Generated files:"
echo "   - icon.ico (Windows)"
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "   - icon.icns (macOS)"
fi
echo "   - icons/ directory (Linux)"
