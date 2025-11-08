import { app, BrowserWindow, ipcMain, dialog, Menu } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import updaterPkg from 'electron-updater';
const { autoUpdater } = updaterPkg;
import StorePkg from 'electron-store';
const Store = StorePkg.default || StorePkg;
import { createMenu } from './menu.js';
import { initBackendSwitcher } from './backend-switcher.js';
import { setupDeviceIpcHandlers } from './device-ipc-handlers.js';
import { setupWindowIpcHandlers } from './window-ipc-handlers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const store = new Store();
let mainWindow = null;

// Development mode check
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL || 'http://localhost:8080';

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    title: 'Scan Master - Inspection Pro',
    icon: path.join(__dirname, '../public/favicon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
    backgroundColor: '#1a1a1a',
    show: false, // Don't show until ready
  });

  // Load app
  if (isDev) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    // In production, delay showing the window to allow React splash screen to display
    if (isDev) {
      mainWindow.show();
    } else {
      // Wait 5.5 seconds for the React splash screen animation to complete
      setTimeout(() => {
        mainWindow.show();
      }, 5500);
    }
  });

  // Window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Create menu
  const menu = createMenu(mainWindow);
  Menu.setApplicationMenu(menu);

  // Initialize backend switcher
  initBackendSwitcher(mainWindow);

  // Setup device communication IPC handlers
  setupDeviceIpcHandlers(mainWindow);

  // Setup window management IPC handlers
  setupWindowIpcHandlers(mainWindow, isDev, VITE_DEV_SERVER_URL);

  return mainWindow;
}

// App ready
app.whenReady().then(() => {
  createMainWindow();

  // macOS specific: re-create window when dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });

  // Check for updates (production only)
  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify();
  }
});

// Quit when all windows are closed (except macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-app-path', (event, name) => {
  return app.getPath(name);
});

ipcMain.handle('save-file-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

ipcMain.handle('open-file-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, options);
  return result;
});

ipcMain.handle('write-file', async (event, filePath, data) => {
  const { writeFile } = await import('fs/promises');
  try {
    await writeFile(filePath, data);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('read-file', async (event, filePath) => {
  const { readFile } = await import('fs/promises');
  try {
    const data = await readFile(filePath);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('print-pdf', async (event, options) => {
  try {
    const printWindow = new BrowserWindow({ show: false });
    await printWindow.loadURL(options.url);
    
    const data = await printWindow.webContents.printToPDF({
      printBackground: true,
      ...options.settings,
    });
    
    printWindow.close();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Store management
ipcMain.handle('store-get', (event, key) => {
  return store.get(key);
});

ipcMain.handle('store-set', (event, key, value) => {
  store.set(key, value);
  return true;
});

ipcMain.handle('store-delete', (event, key) => {
  store.delete(key);
  return true;
});

// Auto-updater events
autoUpdater.on('update-available', () => {
  mainWindow?.webContents.send('update-available');
});

autoUpdater.on('update-downloaded', () => {
  mainWindow?.webContents.send('update-downloaded');
});

ipcMain.on('restart-app', () => {
  autoUpdater.quitAndInstall();
});
