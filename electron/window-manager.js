import { BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class WindowManager {
  constructor() {
    this.windows = new Map(); // sheetId -> BrowserWindow
    this.mainWindow = null;
  }

  setMainWindow(window) {
    this.mainWindow = window;
  }

  createSheetWindow(sheetId, sheetName, isDev, devServerUrl) {
    // Check if window already exists
    if (this.windows.has(sheetId)) {
      const existingWindow = this.windows.get(sheetId);
      if (!existingWindow.isDestroyed()) {
        existingWindow.focus();
        return existingWindow;
      } else {
        this.windows.delete(sheetId);
      }
    }

    const sheetWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      title: `${sheetName} - Scan Master`,
      icon: path.join(__dirname, '../public/favicon.ico'),
      webPreferences: {
        preload: path.join(__dirname, 'preload.cjs'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
        webSecurity: true,
        additionalArguments: [`--sheet-id=${sheetId}`]
      },
      backgroundColor: '#1a1a1a',
      show: false,
    });

    // Load the app with sheet ID in URL
    if (isDev) {
      sheetWindow.loadURL(`${devServerUrl}?sheet=${sheetId}&mode=window`);
      sheetWindow.webContents.openDevTools();
    } else {
      sheetWindow.loadFile(path.join(__dirname, '../dist/index.html'), {
        query: { sheet: sheetId, mode: 'window' }
      });
    }

    // Show when ready
    sheetWindow.once('ready-to-show', () => {
      sheetWindow.show();
    });

    // Handle window closed
    sheetWindow.on('closed', () => {
      this.windows.delete(sheetId);
      // Notify main window
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send('sheet-window-closed', sheetId);
      }
    });

    // Handle sheet data updates
    sheetWindow.webContents.on('ipc-message', (event, channel, ...args) => {
      if (channel === 'sheet-data-changed') {
        this.broadcastToOtherWindows(sheetId, 'sheet-data-updated', ...args);
      }
    });

    this.windows.set(sheetId, sheetWindow);
    return sheetWindow;
  }

  closeSheetWindow(sheetId) {
    const window = this.windows.get(sheetId);
    if (window && !window.isDestroyed()) {
      window.close();
      return true;
    }
    return false;
  }

  getSheetWindow(sheetId) {
    return this.windows.get(sheetId);
  }

  getAllSheetWindows() {
    return Array.from(this.windows.entries()).map(([sheetId, window]) => ({
      sheetId,
      isDestroyed: window.isDestroyed(),
      isFocused: window.isFocused(),
    }));
  }

  focusSheetWindow(sheetId) {
    const window = this.windows.get(sheetId);
    if (window && !window.isDestroyed()) {
      window.focus();
      return true;
    }
    return false;
  }

  broadcastToOtherWindows(excludeSheetId, channel, ...args) {
    // Broadcast to main window
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(channel, ...args);
    }

    // Broadcast to other sheet windows
    for (const [sheetId, window] of this.windows.entries()) {
      if (sheetId !== excludeSheetId && !window.isDestroyed()) {
        window.webContents.send(channel, ...args);
      }
    }
  }

  broadcastToAllWindows(channel, ...args) {
    // Broadcast to main window
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(channel, ...args);
    }

    // Broadcast to all sheet windows
    for (const window of this.windows.values()) {
      if (!window.isDestroyed()) {
        window.webContents.send(channel, ...args);
      }
    }
  }

  closeAllSheetWindows() {
    for (const window of this.windows.values()) {
      if (!window.isDestroyed()) {
        window.close();
      }
    }
    this.windows.clear();
  }
}

export default new WindowManager();
