import { useEffect, useState } from 'react';
import type { ElectronAPI, BackendConfig } from '@/types/electron';

/**
 * Hook to detect if app is running in Electron and provide access to Electron API
 */
export function useElectron() {
  const [isElectron, setIsElectron] = useState(false);
  const [electronAPI, setElectronAPI] = useState<ElectronAPI | null>(null);

  useEffect(() => {
    // Check if running in Electron
    const api = window.electronAPI;
    if (api && api.isElectron) {
      setIsElectron(true);
      setElectronAPI(api);
    }
  }, []);

  return {
    isElectron,
    electronAPI,
    platform: isElectron ? electronAPI?.platform : null,
  };
}

/**
 * Hook to manage backend configuration in Electron
 */
export function useElectronBackend() {
  const { isElectron, electronAPI } = useElectron();
  const [backendConfig, setBackendConfig] = useState<BackendConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [detecting, setDetecting] = useState(false);

  // Load backend config on mount
  useEffect(() => {
    if (!isElectron || !electronAPI) {
      setLoading(false);
      return;
    }

    loadBackendConfig();
  }, [isElectron, electronAPI]);

  const loadBackendConfig = async () => {
    if (!electronAPI) return;

    try {
      const config = await electronAPI.getBackendConfig();
      setBackendConfig(config);
    } catch (error) {
      console.error('Failed to load backend config:', error);
    } finally {
      setLoading(false);
    }
  };

  const detectBackend = async () => {
    if (!electronAPI) return null;

    setDetecting(true);
    try {
      const detected = await electronAPI.detectBackend();
      return detected;
    } catch (error) {
      console.error('Backend detection failed:', error);
      return null;
    } finally {
      setDetecting(false);
    }
  };

  const setBackend = async (config: BackendConfig) => {
    if (!electronAPI) return false;

    try {
      const success = await electronAPI.setBackendConfig(config);
      if (success) {
        setBackendConfig(config);
      }
      return success;
    } catch (error) {
      console.error('Failed to set backend config:', error);
      return false;
    }
  };

  const autoDetectAndSet = async () => {
    const detected = await detectBackend();
    if (detected) {
      await setBackend(detected);
    }
    return detected;
  };

  return {
    isElectron,
    backendConfig,
    loading,
    detecting,
    detectBackend,
    setBackend,
    autoDetectAndSet,
    refresh: loadBackendConfig,
  };
}

/**
 * Hook for Electron file operations
 */
export function useElectronFiles() {
  const { isElectron, electronAPI } = useElectron();

  const saveFile = async (
    data: Buffer | string,
    options: {
      defaultPath?: string;
      filters?: Array<{ name: string; extensions: string[] }>;
    } = {}
  ) => {
    if (!electronAPI) {
      throw new Error('Not running in Electron');
    }

    const result = await electronAPI.saveFileDialog({
      title: 'Save File',
      buttonLabel: 'Save',
      ...options,
    });

    if (result.canceled || !result.filePath) {
      return null;
    }

    const writeResult = await electronAPI.writeFile(result.filePath, data);
    
    if (!writeResult.success) {
      throw new Error(writeResult.error || 'Failed to save file');
    }

    return result.filePath;
  };

  const openFile = async (
    options: {
      filters?: Array<{ name: string; extensions: string[] }>;
      multiSelect?: boolean;
    } = {}
  ) => {
    if (!electronAPI) {
      throw new Error('Not running in Electron');
    }

    const result = await electronAPI.openFileDialog({
      title: 'Open File',
      buttonLabel: 'Open',
      properties: options.multiSelect ? ['openFile', 'multiSelections'] : ['openFile'],
      filters: options.filters,
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    return result.filePaths;
  };

  const printPDF = async (url: string, settings?: any) => {
    if (!electronAPI) {
      throw new Error('Not running in Electron');
    }

    const result = await electronAPI.printPDF({
      url,
      settings,
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to print PDF');
    }

    return result.data;
  };

  return {
    isElectron,
    saveFile,
    openFile,
    printPDF,
  };
}

/**
 * Hook for Electron storage (electron-store)
 */
export function useElectronStore<T = any>(key: string, defaultValue?: T) {
  const { isElectron, electronAPI } = useElectron();
  const [value, setValue] = useState<T | undefined>(defaultValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isElectron || !electronAPI) {
      setLoading(false);
      return;
    }

    loadValue();
  }, [isElectron, electronAPI, key]);

  const loadValue = async () => {
    if (!electronAPI) return;

    try {
      const stored = await electronAPI.store.get(key);
      setValue(stored !== undefined ? stored : defaultValue);
    } catch (error) {
      console.error('Failed to load from store:', error);
      setValue(defaultValue);
    } finally {
      setLoading(false);
    }
  };

  const updateValue = async (newValue: T) => {
    if (!electronAPI) return false;

    try {
      const success = await electronAPI.store.set(key, newValue);
      if (success) {
        setValue(newValue);
      }
      return success;
    } catch (error) {
      console.error('Failed to save to store:', error);
      return false;
    }
  };

  const deleteValue = async () => {
    if (!electronAPI) return false;

    try {
      const success = await electronAPI.store.delete(key);
      if (success) {
        setValue(defaultValue);
      }
      return success;
    } catch (error) {
      console.error('Failed to delete from store:', error);
      return false;
    }
  };

  return {
    value,
    loading,
    setValue: updateValue,
    deleteValue,
    refresh: loadValue,
  };
}
