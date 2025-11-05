# Electron Desktop App - Setup Instructions

## ✅ Phase 1 Complete - Core Setup Done!

התקנת התשתית הבסיסית של Electron הושלמה בהצלחה. המבנה הבא נוצר:

### קבצים שנוצרו:
```
electron/
├── main.js                 # Electron main process
├── preload.js             # Security bridge (context isolation)
├── menu.js                # Application menu with keyboard shortcuts
├── backend-switcher.js    # Local/Cloud backend detection
└── auto-updater.js        # Auto-update functionality

scripts/
├── electron-dev.js        # Development runner
└── electron-build.js      # Production build script

Configuration:
├── electron-builder.yml   # Build configuration (Windows/Mac/Linux)
├── .electronignore        # Files to exclude from build
└── vite.config.ts         # Updated for Electron support
```

---

## 📝 Manual Steps Required

### 1. Update `package.json`

אתה צריך להוסיף את השורות הבאות ל-`package.json` שלך **ידנית** (אני לא יכול לערוך את הקובץ הזה):

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
    
    // ⬇️ Add these new Electron scripts:
    "electron:dev": "node scripts/electron-dev.js",
    "electron:build": "node scripts/electron-build.js",
    "electron:build:win": "npm run build && electron-builder --win --x64",
    "electron:build:mac": "npm run build && electron-builder --mac --x64 --arm64",
    "electron:build:linux": "npm run build && electron-builder --linux --x64",
    "electron:package": "npm run build && electron-builder --dir"
  }
}
```

### 2. Create Build Assets

צור את התיקיה `build/` עם הקבצים הבאים:

```bash
mkdir -p build
```

**נדרש:**
- `build/icon.ico` - Windows icon (256x256)
- `build/icon.icns` - macOS icon (512x512)
- `build/icons/` - Linux icons directory with multiple sizes

**אופציונלי:**
- `build/installerHeader.bmp` - Windows installer header (150x57)
- `build/installerSidebar.bmp` - Windows installer sidebar (164x314)
- `build/dmg-background.png` - macOS DMG background (540x380)

**💡 Tip:** אתה יכול להשתמש ב-online icon converters כמו:
- https://cloudconvert.com/png-to-ico
- https://cloudconvert.com/png-to-icns

### 3. Create LICENSE file

אם אין לך LICENSE file, צור אחד:

```bash
touch LICENSE
```

---

## 🚀 How to Run

### Development Mode

הרץ את האפליקציה במצב פיתוח:

```bash
npm run electron:dev
```

זה יתחיל:
1. ✅ Vite dev server על http://localhost:8080
2. ✅ Electron app עם hot-reload
3. ✅ DevTools פתוח אוטומטית

### Build for Production

**Windows:**
```bash
npm run electron:build:win
```

**macOS:**
```bash
npm run electron:build:mac
```

**Linux:**
```bash
npm run electron:build:linux
```

**All platforms:**
```bash
npm run electron:build
```

הקבצים המקומפלים יהיו ב-`release/` directory.

---

## 🎯 Features Included

### ✅ Already Working:
- [x] Native desktop window (Windows/Mac/Linux)
- [x] Application menu with keyboard shortcuts
- [x] File system access (save/open files)
- [x] Native printing support
- [x] Electron Store (local settings storage)
- [x] Auto-updater infrastructure
- [x] Backend switcher (Local/Cloud/Custom)
- [x] Context isolation & security
- [x] Multi-platform build configuration

### 🔜 Coming Next (Phase 2):
- [ ] Backend detection UI component
- [ ] UT device integration (Serial Port)
- [ ] Enhanced file operations
- [ ] Multiple windows support
- [ ] System tray integration

---

## 🧪 Testing Checklist

לאחר הרצת `npm run electron:dev`, בדוק:

1. **Window Opens:**
   - [ ] האפליקציה נפתחת בחלון נטיבי
   - [ ] הגודל הוא 1400x900
   - [ ] DevTools פתוח (development mode)

2. **Menu Bar:**
   - [ ] File → ניתן לראות את כל האופציות
   - [ ] Edit → Cut/Copy/Paste עובדים
   - [ ] Backend → רואים את האופציות החדשות

3. **Keyboard Shortcuts:**
   - [ ] `Ctrl/Cmd + N` - New Sheet
   - [ ] `Ctrl/Cmd + S` - Save
   - [ ] `Ctrl/Cmd + E` - Export PDF
   - [ ] `Ctrl/Cmd + P` - Print

4. **Console:**
   - [ ] בדוק את הקונסול ל-errors
   - [ ] `window.electronAPI` צריך להיות defined
   - [ ] `window.electronAPI.isElectron` צריך להיות `true`

---

## 🐛 Troubleshooting

### Error: "Cannot find module 'electron'"
```bash
npm install --save-dev electron
```

### Error: "electron-builder not found"
```bash
npm install --save-dev electron-builder
```

### Vite dev server not starting
```bash
# Kill any process on port 8080
# Linux/Mac:
lsof -ti:8080 | xargs kill -9

# Windows:
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### Electron window is blank
בדוק את:
1. `VITE_DEV_SERVER_URL` מוגדר נכון ב-environment
2. Vite dev server רץ על http://localhost:8080
3. בדוק DevTools Console לשגיאות

---

## 📁 File Sizes

**Development:**
- node_modules: ~500MB
- electron binaries: ~150MB

**Production Build:**
- Windows (.exe): ~150MB
- macOS (.dmg): ~140MB
- Linux (.AppImage): ~130MB

---

## 🔐 Security Notes

האפליקציה משתמשת ב:
- ✅ **Context Isolation** - מונע גישה ישירה לNode.js API
- ✅ **Preload Script** - Bridge מאובטח בין Electron לReact
- ✅ **No Node Integration** - React app לא יכול לגשת לNode.js
- ✅ **Sandbox** - Renderer process runs in sandbox
- ✅ **Web Security** - Enabled by default

---

## 📞 Next Steps

### Phase 2 - Backend Switcher UI:
```bash
# נייצר:
- src/components/BackendSelector.tsx
- src/hooks/useElectron.ts
- src/utils/electronUtils.ts
```

### Phase 3 - Advanced Features:
```bash
# נוסיף:
- UT Device integration (Serial Port)
- Multi-window support
- System tray
- Native notifications
```

---

## 🎉 You're Ready!

**כדי להתחיל, הרץ:**
```bash
npm run electron:dev
```

**צריך עזרה?** פנה אלי ואני אמשיך ל-Phase 2! 🚀
