# Phase 2 Complete - Backend Selector UI & Hybrid Sync ✅

## מה נוצר?

### 1. Hooks חדשים (`src/hooks/useElectron.ts`)

**4 hooks מקיפים:**

- **`useElectron()`** - זיהוי אם האפליקציה רצה ב-Electron
  ```typescript
  const { isElectron, electronAPI, platform } = useElectron();
  ```

- **`useElectronBackend()`** - ניהול backend configuration
  ```typescript
  const { 
    backendConfig, 
    detectBackend, 
    setBackend, 
    autoDetectAndSet 
  } = useElectronBackend();
  ```

- **`useElectronFiles()`** - פעולות קבצים (save/open/print)
  ```typescript
  const { saveFile, openFile, printPDF } = useElectronFiles();
  
  // שמירת קובץ
  const path = await saveFile(pdfData, {
    defaultPath: 'technique-sheet.pdf',
    filters: [{ name: 'PDF', extensions: ['pdf'] }]
  });
  ```

- **`useElectronStore()`** - אחסון מקומי (electron-store)
  ```typescript
  const { value, setValue } = useElectronStore('myKey', defaultValue);
  ```

---

### 2. Backend Selector Component (`src/components/BackendSelector.tsx`)

**UI מלא לבחירת Backend:**

![Backend Selector Features]
- ✅ **Auto-Detect** (מומלץ) - מזהה אוטומטית את ה-backend הזמין
- ☁️ **Cloud Backend** - חיבור לענן (דורש אינטרנט)
- 🏠 **Local Backend** - שרת מקומי (air-gapped)
- ⚙️ **Custom URL** - חיבור לשרת ספציפי במפעל

**תכונות:**
- בדיקת חיבור אוטומטית
- Test Connection לbackends מותאמים אישית
- אינדיקטור סטטוס (מחובר/מנותק)
- שמירת הגדרות ב-Electron Store

---

### 3. Backend Status Indicator (`src/components/BackendStatusIndicator.tsx`)

**Badge דינמי בממשק:**
- מציג את סוג ה-backend הפעיל (Cloud/Local/Custom/Offline)
- אינדיקטור חזותי (✅/❌)
- כפתור Sync מהיר
- לחיצה פותחת את ה-Backend Selector

**דוגמה:**
```
[☁️ Cloud Backend ✅] [🔄]
```

---

### 4. Hybrid Sync Manager (שדרוג `src/services/syncManager.ts`)

**4 מצבי Sync:**

1. **`cloud-only`** - רק cloud (ברירת מחדל)
2. **`local-only`** - רק local backend
3. **`bidirectional`** - Local ↔ Cloud (Auto mode)
4. **`offline`** - אין חיבור, עובד עם IndexedDB בלבד

**תכונות חדשות:**
- **Multi-backend support** - יכול לעבוד עם כמה backends בו-זמנית
- **Conflict resolution** - timestamp-based (האחרון מנצח)
- **Bidirectional sync** - מסנכרן בין Local ו-Cloud
- **Smart detection** - מזהה אוטומטית backends זמינים

**שימוש:**
```typescript
import { syncManager } from '@/services/syncManager';

// Initialize with backend config
await syncManager.initialize(backendConfig);

// Get sync mode
const mode = syncManager.getSyncMode(); // 'cloud-only' | 'local-only' | 'bidirectional' | 'offline'

// Force bidirectional sync
await syncManager.syncBidirectional();

// Get last sync time
const lastSync = syncManager.getLastSyncTime();
```

---

### 5. Enhanced Offline Indicator (`src/components/OfflineIndicator.tsx`)

**זיהוי אוטומטי:**
- **Electron**: מציג `BackendStatusIndicator` עם backend פעיל
- **Web**: מציג Online/Offline פשוט

---

## איך זה עובד?

### תרחיש 1: Factory עם אינטרנט מלא
```
Desktop App → Auto-Detect → Cloud Backend ✅
- Real-time sync
- Shared data across sites
- Automatic updates
```

### תרחיש 2: Factory Air-Gapped (ללא אינטרנט)
```
Desktop App → Auto-Detect → Local Backend ✅
- Local Supabase (Docker)
- Zero internet dependency
- Manual USB sync (future feature)
```

### תרחיש 3: Factory היברידי
```
Desktop App → Bidirectional Mode
├─ Local Backend (primary)
└─ Cloud Backend (sync when online)
   - Works offline with local
   - Auto-syncs to cloud when connected
   - Conflict resolution (timestamp-based)
```

### תרחיש 4: Custom Factory Server
```
Desktop App → Custom URL
- Internal company server
- LAN-based collaboration
- No external internet
```

---

## דוגמאות שימוש

### דוגמה 1: שימוש ב-Backend Selector בקומפוננטה

```typescript
import { useState } from 'react';
import { BackendSelector } from '@/components/BackendSelector';
import { Button } from '@/components/ui/button';

function MyComponent() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        Change Backend
      </Button>
      
      <BackendSelector
        open={open}
        onOpenChange={setOpen}
        onBackendChange={(config) => {
          console.log('Backend changed:', config);
        }}
      />
    </>
  );
}
```

### דוגמה 2: שימוש ב-File Operations

```typescript
import { useElectronFiles } from '@/hooks/useElectron';
import { toast } from '@/hooks/use-toast';

function ExportButton() {
  const { isElectron, saveFile } = useElectronFiles();

  const handleExport = async () => {
    if (!isElectron) {
      // Fallback for web - download via browser
      return;
    }

    try {
      const pdfBlob = await generatePDF();
      const buffer = Buffer.from(await pdfBlob.arrayBuffer());
      
      const savedPath = await saveFile(buffer, {
        defaultPath: 'technique-sheet.pdf',
        filters: [
          { name: 'PDF Files', extensions: ['pdf'] }
        ]
      });

      if (savedPath) {
        toast({
          title: 'Export Successful',
          description: `Saved to ${savedPath}`,
        });
      }
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return <Button onClick={handleExport}>Export PDF</Button>;
}
```

### דוגמה 3: שימוש ב-Electron Store

```typescript
import { useElectronStore } from '@/hooks/useElectron';

function SettingsPanel() {
  const { value: theme, setValue: setTheme } = useElectronStore<string>(
    'app-theme',
    'dark'
  );

  return (
    <select 
      value={theme} 
      onChange={(e) => setTheme(e.target.value)}
    >
      <option value="dark">Dark</option>
      <option value="light">Light</option>
    </select>
  );
}
```

---

## אינטגרציה עם קוד קיים

### OfflineIndicator מתעדכן אוטומטית:

הקומפוננטה `OfflineIndicator` כבר משתמשת ב-hooks החדשים:
- **Web mode**: מציג Online/Offline פשוט
- **Electron mode**: מציג Backend Status עם אופציות מתקדמות

### SyncManager עדיין תואם לאחור:

```typescript
// Old API still works
await syncManager.syncToSupabase();
await syncManager.syncFromSupabase();

// New API
await syncManager.initialize(backendConfig);
await syncManager.syncBidirectional();
```

---

## מצב הפרויקט

### ✅ הושלם:
- [x] Hook useElectron עם 4 variants
- [x] Backend Selector UI מלא
- [x] Backend Status Indicator
- [x] Hybrid Sync Manager
- [x] Auto-detection logic
- [x] Conflict resolution
- [x] Enhanced OfflineIndicator

### 🔜 Phase 3 - הבא בתור:
- [ ] UT Device Integration (Serial Port)
- [ ] Multi-Window Support
- [ ] Enhanced File Operations
- [ ] System Tray Integration
- [ ] Native Notifications

---

## בדיקות לביצוע

אחרי שתוסיף את ה-scripts ל-`package.json` והרץ `npm run electron:dev`:

1. **Backend Selector:**
   - [ ] לחץ על ה-badge בממשק
   - [ ] בחר "Auto-Detect"
   - [ ] בדוק שזה מזהה את ה-backend הנכון

2. **Custom Backend:**
   - [ ] בחר "Custom URL"
   - [ ] הזן URL וAPI key
   - [ ] לחץ "Test Connection"
   - [ ] בדוק שמציג הצלחה/כשלון

3. **Sync Status:**
   - [ ] צור technique sheet חדש
   - [ ] לחץ על כפתור הSync
   - [ ] בדוק ב-IndexedDB שהנתונים נשמרו

4. **Console:**
   - [ ] בדוק שאין errors
   - [ ] בדוק הודעות "Sync completed"

---

## תכונות מתקדמות שנוספו

### 1. Timestamp-Based Conflict Resolution

כשיש conflicts בין Local ו-Cloud:
```typescript
// התאריך האחרון מנצח
if (new Date(localSheet.updated_at) > new Date(cloudSheet.updated_at)) {
  use localSheet
} else {
  use cloudSheet
}
```

### 2. Smart Backend Detection

```typescript
// Tries in order:
1. Local Backend (http://localhost:8000)
2. Cloud Backend (Lovable Cloud)
3. Offline Mode (IndexedDB only)
```

### 3. Multi-Backend Sync

```typescript
// Sync to both backends simultaneously
await Promise.all([
  syncToBackend(cloudBackend),
  syncToBackend(localBackend),
]);
```

---

## טיפים למפתחים

### כיצד להוסיף backend חדש?

1. עדכן את `electron/backend-switcher.js`:
```javascript
const BACKEND_MODES = {
  AUTO: 'auto',
  CLOUD: 'cloud',
  LOCAL: 'local',
  CUSTOM: 'custom',
  MY_NEW_BACKEND: 'my_new_backend', // ← הוסף כאן
};
```

2. עדכן את `BackendSelector.tsx` עם UI חדש
3. הוסף לוגיקת detection ב-`syncManager.ts`

### כיצד להוסיף פעולת קובץ חדשה?

1. הוסף IPC handler ב-`electron/main.js`:
```javascript
ipcMain.handle('my-file-operation', async (event, ...args) => {
  // File operation logic
});
```

2. הוסף ל-`electron/preload.js`:
```javascript
myFileOperation: (...args) => ipcRenderer.invoke('my-file-operation', ...args)
```

3. הוסף type ב-`src/types/electron.d.ts`

4. השתמש ב-hook:
```typescript
const { electronAPI } = useElectron();
await electronAPI.myFileOperation(...);
```

---

## 🎉 Phase 2 הושלם!

**מה הלאה?**
- Phase 3: UT Device Integration + Advanced Features
- Phase 4: Packaging & Distribution
- Phase 5: Documentation & Training

**רוצה להמשיך?** פנה אלי ונתחיל Phase 3! 🚀
