# הוראות הפעלה - Electron Desktop App

## ⚠️ עדכון נדרש ב-package.json

אתה צריך לערוך ידנית את הקובץ `package.json` ולהוסיף את השורות הבאות:

### 1. הוסף את ה-scripts האלה בתוך הקטע `"scripts"`:

```json
"scripts": {
  "electron:dev": "node scripts/electron-dev.js",
  "electron:build": "node scripts/electron-build.js",
  "electron:build:win": "npm run build && electron-builder --win --x64",
  "electron:build:mac": "npm run build && electron-builder --mac --x64 --arm64",
  "electron:build:linux": "npm run build && electron-builder --linux --x64",
  "electron:package": "npm run build && electron-builder --dir"
}
```

### 2. הוסף את השדות האלה ברמה הראשית של package.json:

```json
{
  "main": "electron/main.js",
  "author": "Your Name",
  "license": "MIT",
  "private": true,
  "type": "module"
}
```

## 📋 איך לעשות זאת:

1. **פתח את הקובץ `package.json`** (הוא בשורש הפרויקט)

2. **מצא את הקטע `"scripts"`** - הוא נראה בערך ככה:
```json
"scripts": {
  "dev": "vite",
  "build": "tsc && vite build",
  ...
}
```

3. **הוסף את ה-scripts של Electron** בתוך הקטע הזה (אחרי השורות הקיימות, לפני הסוגריים)

4. **הוסף את השדות הנוספים** (`main`, `author`, `license`, `private`, `type`) ברמה הראשית של ה-JSON

## ▶️ הרצה לאחר העדכון:

```bash
# התקן את התלויות (פעם ראשונה)
npm install

# הפעל את האפליקציה כ-Desktop App
npm run electron:dev
```

## 🎯 מה אמור לקרות:

1. שרת Vite יתחיל על http://localhost:8080
2. חלון Electron ייפתח עם האפליקציה
3. DevTools יהיו זמינים (F12)
4. Hot-reload יעבוד

## 🔨 בניית גרסת הפצה:

```bash
# Windows
npm run electron:build:win

# macOS
npm run electron:build:mac

# Linux
npm run electron:build:linux
```

הקבצים ייצרו בתיקייה `release/`

## ❓ בעיות נפוצות:

### "Cannot find module 'electron'"
```bash
npm install electron electron-builder electron-store electron-updater --save-dev
```

### יציאה 8080 תפוסה
שנה את היציאה ב-`vite.config.ts` או ב-`scripts/electron-dev.js`

### מסך לבן
1. פתח DevTools (F12)
2. בדוק שגיאות בקונסול
3. ודא ש-Vite רץ על http://localhost:8080

---

**אם הכל עבד, אתה תראה את האפליקציה פועלת בחלון Desktop נטיבי!** 🎉
