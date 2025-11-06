/**
 * IPC Handlers for Device Communication
 */

import { ipcMain } from 'electron';
import deviceService from './device-communication.js';

let mainWindow = null;

export function setupDeviceIpcHandlers(window) {
  mainWindow = window;

  // Setup device data callback to send to renderer
  deviceService.onData((data) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('device:data', data);
    }
  });

  // List available ports
  ipcMain.handle('device:list-ports', async () => {
    try {
      const ports = await deviceService.listPorts();
      return { success: true, ports };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Connect to device
  ipcMain.handle('device:connect', async (event, { port, deviceType, baudRate }) => {
    try {
      const result = await deviceService.connect(port, deviceType, baudRate);
      return { success: true, ...result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Disconnect from device
  ipcMain.handle('device:disconnect', async () => {
    try {
      await deviceService.disconnect();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Get connection status
  ipcMain.handle('device:status', async () => {
    try {
      const status = deviceService.getStatus();
      return { success: true, ...status };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Send command to device
  ipcMain.handle('device:send-command', async (event, command) => {
    try {
      await deviceService.sendCommand(command);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Request data from device
  ipcMain.handle('device:request-data', async (event, dataType) => {
    try {
      await deviceService.requestData(dataType);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
}
