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
  onUpdateAvailable: (callback) => {},
  onUpdateDownloaded: (callback) => {},
  restartApp: () => {},
  removeAllListeners: (channel) => {},
};
