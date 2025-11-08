# Build Assets for Electron

This directory contains assets for building the Electron desktop application.

## Icons

- **icon-512.png** - Main application icon (512x512)
  - Will be converted to .ico (Windows) and .icns (macOS) during build
  
## Installer Graphics

- **installerHeader.png** - Windows installer header banner
- **installerSidebar.png** - Windows installer sidebar image  
- **dmg-background.png** - macOS DMG background image

## Converting Icons

The build process will automatically convert `icon-512.png` to the required formats:

### Manual conversion (if needed):

**Windows (.ico):**
```bash
# Using ImageMagick:
convert icon-512.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico

# Online: https://cloudconvert.com/png-to-ico
```

**macOS (.icns):**
```bash
# Using iconutil (macOS only):
mkdir icon.iconset
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

# Online: https://cloudconvert.com/png-to-icns
```

**Linux (multiple sizes):**
```bash
mkdir -p icons
convert icon-512.png -resize 16x16 icons/16x16.png
convert icon-512.png -resize 32x32 icons/32x32.png
convert icon-512.png -resize 48x48 icons/48x48.png
convert icon-512.png -resize 64x64 icons/64x64.png
convert icon-512.png -resize 128x128 icons/128x128.png
convert icon-512.png -resize 256x256 icons/256x256.png
convert icon-512.png -resize 512x512 icons/512x512.png
```

## Electron Builder Auto-Conversion

`electron-builder` will automatically handle icon conversion if you provide:
- Windows: `build/icon.ico` OR `build/icon.png` (will auto-convert)
- macOS: `build/icon.icns` OR `build/icon.png` (will auto-convert)
- Linux: `build/icons/` directory with multiple sizes

The current setup uses `icon-512.png` which will be auto-converted during the build process.
