const { ipcMain } = require('electron');
const windowManager = require('./window-manager');

function setupWindowIpcHandlers(mainWindow, isDev, devServerUrl) {
  windowManager.setMainWindow(mainWindow);

  // Open sheet in new window
  ipcMain.handle('window:open-sheet', async (event, sheetId, sheetName) => {
    try {
      const window = windowManager.createSheetWindow(
        sheetId,
        sheetName || 'Technique Sheet',
        isDev,
        devServerUrl
      );
      return {
        success: true,
        sheetId,
        windowId: window.id,
      };
    } catch (error) {
      console.error('Error opening sheet window:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  });

  // Close sheet window
  ipcMain.handle('window:close-sheet', async (event, sheetId) => {
    try {
      const success = windowManager.closeSheetWindow(sheetId);
      return { success };
    } catch (error) {
      console.error('Error closing sheet window:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  });

  // Focus sheet window
  ipcMain.handle('window:focus-sheet', async (event, sheetId) => {
    try {
      const success = windowManager.focusSheetWindow(sheetId);
      return { success };
    } catch (error) {
      console.error('Error focusing sheet window:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  });

  // Get all open sheet windows
  ipcMain.handle('window:get-all-sheets', async () => {
    try {
      const windows = windowManager.getAllSheetWindows();
      return {
        success: true,
        windows,
      };
    } catch (error) {
      console.error('Error getting sheet windows:', error);
      return {
        success: false,
        error: error.message,
        windows: [],
      };
    }
  });

  // Broadcast message to all windows
  ipcMain.handle('window:broadcast', async (event, channel, ...args) => {
    try {
      windowManager.broadcastToAllWindows(channel, ...args);
      return { success: true };
    } catch (error) {
      console.error('Error broadcasting message:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  });

  // Send message to specific window
  ipcMain.handle('window:send-to-sheet', async (event, sheetId, channel, ...args) => {
    try {
      const window = windowManager.getSheetWindow(sheetId);
      if (window && !window.isDestroyed()) {
        window.webContents.send(channel, ...args);
        return { success: true };
      }
      return {
        success: false,
        error: 'Window not found or destroyed',
      };
    } catch (error) {
      console.error('Error sending message to window:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  });

  // Notify sheet data changed
  ipcMain.on('sheet-data-changed', (event, sheetId, data) => {
    windowManager.broadcastToAllWindows('sheet-data-updated', sheetId, data);
  });
}

module.exports = { setupWindowIpcHandlers };
