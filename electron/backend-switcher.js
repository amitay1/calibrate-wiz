import { ipcMain } from 'electron';
import Store from 'electron-store';

const store = new Store();

const BACKEND_MODES = {
  AUTO: 'auto',
  CLOUD: 'cloud',
  LOCAL: 'local',
  CUSTOM: 'custom',
};

const DEFAULT_BACKENDS = {
  cloud: {
    url: process.env.VITE_SUPABASE_URL || '',
    key: process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
  },
  local: {
    url: 'http://localhost:8000',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
  },
};

async function detectBackend() {
  // Try local first
  try {
    const response = await fetch('http://localhost:8000/health', {
      method: 'GET',
      signal: AbortSignal.timeout(2000),
    });
    
    if (response.ok) {
      return {
        mode: BACKEND_MODES.LOCAL,
        url: DEFAULT_BACKENDS.local.url,
        key: DEFAULT_BACKENDS.local.key,
        isConnected: true,
      };
    }
  } catch (error) {
    console.log('Local backend not available');
  }

  // Try cloud
  try {
    const response = await fetch(`${DEFAULT_BACKENDS.cloud.url}/rest/v1/`, {
      method: 'HEAD',
      signal: AbortSignal.timeout(3000),
      headers: {
        'apikey': DEFAULT_BACKENDS.cloud.key,
      },
    });
    
    if (response.ok) {
      return {
        mode: BACKEND_MODES.CLOUD,
        url: DEFAULT_BACKENDS.cloud.url,
        key: DEFAULT_BACKENDS.cloud.key,
        isConnected: true,
      };
    }
  } catch (error) {
    console.log('Cloud backend not available');
  }

  // Offline mode
  return {
    mode: 'offline',
    url: '',
    key: '',
    isConnected: false,
  };
}

export function initBackendSwitcher(mainWindow) {
  // Get current backend config
  ipcMain.handle('get-backend-config', () => {
    const savedConfig = store.get('backendConfig');
    return savedConfig || {
      mode: BACKEND_MODES.AUTO,
      url: '',
      key: '',
      isConnected: false,
    };
  });

  // Set backend config
  ipcMain.handle('set-backend-config', (event, config) => {
    store.set('backendConfig', config);
    mainWindow.webContents.send('backend-config-changed', config);
    return true;
  });

  // Detect available backend
  ipcMain.handle('detect-backend', async () => {
    const detected = await detectBackend();
    return detected;
  });

  // Test custom backend connection
  ipcMain.handle('test-backend-connection', async (event, url, key) => {
    try {
      const response = await fetch(`${url}/rest/v1/`, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000),
        headers: {
          'apikey': key,
        },
      });
      
      return {
        success: response.ok,
        error: response.ok ? null : 'Connection failed',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  });
}

export { BACKEND_MODES, DEFAULT_BACKENDS };
