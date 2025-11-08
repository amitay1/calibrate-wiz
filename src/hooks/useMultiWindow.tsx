import { useState, useEffect, useCallback } from 'react';
import { useElectron } from './useElectron';
import type { SheetWindowInfo } from '@/types/electron';

export function useMultiWindow() {
  const { isElectron, electronAPI } = useElectron();
  const [openWindows, setOpenWindows] = useState<SheetWindowInfo[]>([]);
  const [loading, setLoading] = useState(false);

  // Get current sheet ID from URL
  const getSheetIdFromUrl = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('sheet');
  }, []);

  const isWindowMode = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('mode') === 'window';
  }, []);

  // Refresh list of open windows
  const refreshWindows = useCallback(async () => {
    if (!isElectron || !electronAPI?.window) return;

    try {
      const result = await electronAPI.window.getAllSheets();
      if (result.success) {
        setOpenWindows(result.windows);
      }
    } catch (error) {
      console.error('Error refreshing windows:', error);
    }
  }, [isElectron, electronAPI]);

  // Open sheet in new window
  const openSheetInNewWindow = useCallback(async (sheetId: string, sheetName: string) => {
    if (!isElectron || !electronAPI?.window) {
      console.warn('Multi-window support only available in Electron');
      return { success: false, error: 'Not in Electron environment' };
    }

    setLoading(true);
    try {
      const result = await electronAPI.window.openSheet(sheetId, sheetName);
      if (result.success) {
        await refreshWindows();
      }
      return result;
    } catch (error) {
      console.error('Error opening sheet window:', error);
      return { success: false, error: String(error) };
    } finally {
      setLoading(false);
    }
  }, [isElectron, electronAPI, refreshWindows]);

  // Close sheet window
  const closeSheetWindow = useCallback(async (sheetId: string) => {
    if (!isElectron || !electronAPI?.window) return { success: false };

    setLoading(true);
    try {
      const result = await electronAPI.window.closeSheet(sheetId);
      if (result.success) {
        await refreshWindows();
      }
      return result;
    } catch (error) {
      console.error('Error closing sheet window:', error);
      return { success: false, error: String(error) };
    } finally {
      setLoading(false);
    }
  }, [isElectron, electronAPI, refreshWindows]);

  // Focus sheet window
  const focusSheetWindow = useCallback(async (sheetId: string) => {
    if (!isElectron || !electronAPI?.window) return { success: false };

    try {
      return await electronAPI.window.focusSheet(sheetId);
    } catch (error) {
      console.error('Error focusing sheet window:', error);
      return { success: false, error: String(error) };
    }
  }, [isElectron, electronAPI]);

  // Broadcast to all windows
  const broadcastToAllWindows = useCallback(async (channel: string, ...args: any[]) => {
    if (!isElectron || !electronAPI?.window) return { success: false };

    try {
      return await electronAPI.window.broadcast(channel, ...args);
    } catch (error) {
      console.error('Error broadcasting:', error);
      return { success: false, error: String(error) };
    }
  }, [isElectron, electronAPI]);

  // Notify sheet data changed
  const notifySheetDataChanged = useCallback((sheetId: string, data: any) => {
    if (!isElectron || !electronAPI?.window) return;
    
    try {
      electronAPI.window.notifySheetDataChanged(sheetId, data);
    } catch (error) {
      console.error('Error notifying sheet data changed:', error);
    }
  }, [isElectron, electronAPI]);

  // Listen for sheet data updates from other windows
  useEffect(() => {
    if (!isElectron || !electronAPI?.window) return;

    const handleSheetDataUpdated = (event: any, sheetId: string, data: any) => {
      console.log('Sheet data updated from another window:', sheetId, data);
      // Trigger custom event that components can listen to
      window.dispatchEvent(new CustomEvent('sheet-data-updated', {
        detail: { sheetId, data }
      }));
    };

    const handleSheetWindowClosed = (event: any, sheetId: string) => {
      console.log('Sheet window closed:', sheetId);
      refreshWindows();
    };

    electronAPI.window.onSheetDataUpdated(handleSheetDataUpdated);
    electronAPI.window.onSheetWindowClosed(handleSheetWindowClosed);

    // Initial refresh
    refreshWindows();

    return () => {
      if (electronAPI?.removeAllListeners) {
        electronAPI.removeAllListeners('sheet-data-updated');
        electronAPI.removeAllListeners('sheet-window-closed');
      }
    };
  }, [isElectron, electronAPI, refreshWindows]);

  return {
    isElectron,
    isWindowMode: isWindowMode(),
    currentSheetId: getSheetIdFromUrl(),
    openWindows,
    loading,
    openSheetInNewWindow,
    closeSheetWindow,
    focusSheetWindow,
    broadcastToAllWindows,
    notifySheetDataChanged,
    refreshWindows,
  };
}
