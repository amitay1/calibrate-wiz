# Instructions to Add Electron Scripts to package.json

Since I cannot edit `package.json` directly (it's read-only), you need to add these scripts manually.

## Step 1: Open package.json

Open the `package.json` file in your editor.

## Step 2: Add/Update These Fields

Add or update the following fields in your `package.json`:

```json
{
  "name": "scan-master-inspection-pro",
  "version": "1.0.0",
  "description": "Professional Ultrasonic Inspection Technique Sheet Management",
  "main": "electron/main.js",
  "author": "Scan Master Team",
  "license": "MIT",
  
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    
    "electron:dev": "node scripts/electron-dev.js",
    "electron:build": "node scripts/electron-build.js",
    "electron:build:win": "npm run build && electron-builder --win --x64",
    "electron:build:mac": "npm run build && electron-builder --mac --x64 --arm64",
    "electron:build:linux": "npm run build && electron-builder --linux --x64",
    "electron:package": "npm run build && electron-builder --dir"
  }
}
```

## Step 3: Copy the Exact Scripts Section

**Copy this EXACT section** to your `package.json` scripts:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build", 
  "preview": "vite preview",
  "electron:dev": "node scripts/electron-dev.js",
  "electron:build": "node scripts/electron-build.js",
  "electron:build:win": "npm run build && electron-builder --win --x64",
  "electron:build:mac": "npm run build && electron-builder --mac --x64 --arm64",
  "electron:build:linux": "npm run build && electron-builder --linux --x64",
  "electron:package": "npm run build && electron-builder --dir"
}
```

## Step 4: Verify

After adding the scripts, your `package.json` should look like this:

```json
{
  "name": "scan-master-inspection-pro",
  "version": "1.0.0",
  "description": "Professional Ultrasonic Inspection Technique Sheet Management",
  "main": "electron/main.js",
  "author": "Scan Master Team", 
  "license": "MIT",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "electron:dev": "node scripts/electron-dev.js",
    "electron:build": "node scripts/electron-build.js",
    "electron:build:win": "npm run build && electron-builder --win --x64",
    "electron:build:mac": "npm run build && electron-builder --mac --x64 --arm64",
    "electron:build:linux": "npm run build && electron-builder --linux --x64",
    "electron:package": "npm run build && electron-builder --dir"
  },
  "dependencies": {
    ...existing dependencies...
  },
  "devDependencies": {
    ...existing devDependencies...
  }
}
```

## Step 5: Test

Run the following command to test:

```bash
npm run electron:dev
```

If you see the Electron window open with your React app, you're all set! ✅

---

## Why Can't I Edit package.json?

The `package.json` file is managed by the system and marked as read-only to prevent conflicts with package managers. You'll need to edit it manually using your text editor or IDE.
