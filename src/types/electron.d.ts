export interface ElectronAPI {
  // App info
  getAppVersion: () => Promise<string>;
  getAppPath: (name: 'home' | 'appData' | 'userData' | 'temp' | 'exe' | 'desktop' | 'documents' | 'downloads') => Promise<string>;
  
  // Platform info
  platform: NodeJS.Platform;
  isElectron: boolean;
  
  // File system
  saveFileDialog: (options: {
    title?: string;
    defaultPath?: string;
    buttonLabel?: string;
    filters?: Array<{ name: string; extensions: string[] }>;
  }) => Promise<{ canceled: boolean; filePath?: string }>;
  
  openFileDialog: (options: {
    title?: string;
    defaultPath?: string;
    buttonLabel?: string;
    filters?: Array<{ name: string; extensions: string[] }>;
    properties?: Array<'openFile' | 'openDirectory' | 'multiSelections'>;
  }) => Promise<{ canceled: boolean; filePaths: string[] }>;
  
  writeFile: (filePath: string, data: Buffer | string) => Promise<{ success: boolean; error?: string }>;
  readFile: (filePath: string) => Promise<{ success: boolean; data?: Buffer; error?: string }>;
  
  // Printing
  printPDF: (options: {
    url: string;
    settings?: {
      marginsType?: number;
      pageSize?: string;
      printBackground?: boolean;
      printSelectionOnly?: boolean;
      landscape?: boolean;
    };
  }) => Promise<{ success: boolean; data?: Buffer; error?: string }>;
  
  // Storage (electron-store)
  store: {
    get: (key: string) => Promise<any>;
    set: (key: string, value: any) => Promise<boolean>;
    delete: (key: string) => Promise<boolean>;
  };
  
  // Backend
  getBackendConfig: () => Promise<BackendConfig | null>;
  setBackendConfig: (config: BackendConfig) => Promise<boolean>;
  detectBackend: () => Promise<BackendDetectionResult>;
  
  // Updates
  onUpdateAvailable: (callback: () => void) => void;
  onUpdateDownloaded: (callback: () => void) => void;
  restartApp: () => void;
  
  // Clean up
  removeAllListeners: (channel: string) => void;
}

export interface BackendConfig {
  mode: 'auto' | 'cloud' | 'local' | 'custom' | 'offline';
  url: string;
  key: string;
  isConnected: boolean;
}

export interface BackendDetectionResult {
  mode: 'cloud' | 'local' | 'offline';
  url: string;
  key: string;
  isConnected: boolean;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
