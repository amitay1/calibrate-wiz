const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getAppPath: (name) => ipcRenderer.invoke('get-app-path', name),
  
  // Platform info
  platform: process.platform,
  isElectron: true,
  
  // File system
  saveFileDialog: (options) => ipcRenderer.invoke('save-file-dialog', options),
  openFileDialog: (options) => ipcRenderer.invoke('open-file-dialog', options),
  writeFile: (filePath, data) => ipcRenderer.invoke('write-file', filePath, data),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  
  // Printing
  printPDF: (options) => ipcRenderer.invoke('print-pdf', options),
  
  // Storage
  store: {
    get: (key) => ipcRenderer.invoke('store-get', key),
    set: (key, value) => ipcRenderer.invoke('store-set', key, value),
    delete: (key) => ipcRenderer.invoke('store-delete', key),
  },
  
  // Backend
  getBackendConfig: () => ipcRenderer.invoke('get-backend-config'),
  setBackendConfig: (config) => ipcRenderer.invoke('set-backend-config', config),
  detectBackend: () => ipcRenderer.invoke('detect-backend'),
  
  // Device Communication
  device: {
    listPorts: () => ipcRenderer.invoke('device:list-ports'),
    connect: (options) => ipcRenderer.invoke('device:connect', options),
    disconnect: () => ipcRenderer.invoke('device:disconnect'),
    getStatus: () => ipcRenderer.invoke('device:status'),
    sendCommand: (command) => ipcRenderer.invoke('device:send-command', command),
    requestData: (dataType) => ipcRenderer.invoke('device:request-data', dataType),
    onData: (callback) => {
      ipcRenderer.on('device:data', callback);
    },
  },
  
  // Window Management
  window: {
    openSheet: (sheetId, sheetName) => ipcRenderer.invoke('window:open-sheet', sheetId, sheetName),
    closeSheet: (sheetId) => ipcRenderer.invoke('window:close-sheet', sheetId),
    focusSheet: (sheetId) => ipcRenderer.invoke('window:focus-sheet', sheetId),
    getAllSheets: () => ipcRenderer.invoke('window:get-all-sheets'),
    broadcast: (channel, ...args) => ipcRenderer.invoke('window:broadcast', channel, ...args),
    sendToSheet: (sheetId, channel, ...args) => ipcRenderer.invoke('window:send-to-sheet', sheetId, channel, ...args),
    onSheetDataUpdated: (callback) => ipcRenderer.on('sheet-data-updated', callback),
    onSheetWindowClosed: (callback) => ipcRenderer.on('sheet-window-closed', callback),
    notifySheetDataChanged: (sheetId, data) => ipcRenderer.send('sheet-data-changed', sheetId, data),
  },
  
  // Updates
  onUpdateAvailable: (callback) => {
    ipcRenderer.on('update-available', callback);
  },
  onUpdateDownloaded: (callback) => {
    ipcRenderer.on('update-downloaded', callback);
  },
  restartApp: () => ipcRenderer.send('restart-app'),
  
  // Clean up listeners
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  },
});

// Global type declaration for TypeScript
window.electronAPI = {
  getAppVersion: () => Promise.resolve(''),
  getAppPath: (name) => Promise.resolve(''),
  platform: process.platform,
  isElectron: true,
  saveFileDialog: (options) => Promise.resolve({ canceled: false, filePath: '' }),
  openFileDialog: (options) => Promise.resolve({ canceled: false, filePaths: [] }),
  writeFile: (filePath, data) => Promise.resolve({ success: true }),
  readFile: (filePath) => Promise.resolve({ success: true, data: null }),
  printPDF: (options) => Promise.resolve({ success: true, data: null }),
  store: {
    get: (key) => Promise.resolve(null),
    set: (key, value) => Promise.resolve(true),
    delete: (key) => Promise.resolve(true),
  },
  getBackendConfig: () => Promise.resolve(null),
  setBackendConfig: (config) => Promise.resolve(true),
  detectBackend: () => Promise.resolve({ mode: 'auto' }),
  device: {
    listPorts: () => Promise.resolve({ success: true, ports: [] }),
    connect: (options) => Promise.resolve({ success: true }),
    disconnect: () => Promise.resolve({ success: true }),
    getStatus: () => Promise.resolve({ success: true, connected: false }),
    sendCommand: (command) => Promise.resolve({ success: true }),
    requestData: (dataType) => Promise.resolve({ success: true }),
    onData: (callback) => {},
  },
  onUpdateAvailable: (callback) => {},
  onUpdateDownloaded: (callback) => {},
  restartApp: () => {},
  removeAllListeners: (channel) => {},
};
