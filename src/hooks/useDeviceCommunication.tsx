import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { SerialPort, DeviceData, DeviceMessage } from '@/types/electron';

export function useDeviceCommunication() {
  const { toast } = useToast();
  const [ports, setPorts] = useState<SerialPort[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [deviceType, setDeviceType] = useState<string | null>(null);
  const [currentPort, setCurrentPort] = useState<string | null>(null);
  const [latestData, setLatestData] = useState<DeviceData | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Check if running in Electron
  const isElectron = typeof window !== 'undefined' && window.electronAPI && 'device' in window.electronAPI;

  // List available ports
  const scanPorts = useCallback(async () => {
    if (!isElectron || !window.electronAPI?.device) return;

    setIsScanning(true);
    try {
      const result = await window.electronAPI.device.listPorts();
      if (result.success) {
        setPorts(result.ports);
        toast({
          title: "Ports Scanned",
          description: `Found ${result.ports.length} serial port(s)`,
        });
      } else {
        toast({
          title: "Scan Failed",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to scan ports",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  }, [isElectron, toast]);

  // Connect to device
  const connect = useCallback(async (
    port: string,
    deviceTypeParam: 'olympus' | 'ge' | 'evident',
    baudRate: number = 9600
  ) => {
    if (!isElectron || !window.electronAPI?.device) return;

    try {
      const result = await window.electronAPI.device.connect({
        port,
        deviceType: deviceTypeParam,
        baudRate,
      });

      if (result.success) {
        setIsConnected(true);
        setDeviceType(result.deviceType);
        setCurrentPort(result.port);
        toast({
          title: "Connected",
          description: `Connected to ${deviceTypeParam} device on ${port}`,
        });
      } else {
        toast({
          title: "Connection Failed",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to device",
        variant: "destructive",
      });
    }
  }, [isElectron, toast]);

  // Disconnect from device
  const disconnect = useCallback(async () => {
    if (!isElectron || !window.electronAPI?.device) return;

    try {
      const result = await window.electronAPI.device.disconnect();
      if (result.success) {
        setIsConnected(false);
        setDeviceType(null);
        setCurrentPort(null);
        setLatestData(null);
        toast({
          title: "Disconnected",
          description: "Disconnected from device",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disconnect",
        variant: "destructive",
      });
    }
  }, [isElectron, toast]);

  // Request data from device
  const requestData = useCallback(async (dataType: string = 'all') => {
    if (!isElectron || !isConnected || !window.electronAPI?.device) return;

    try {
      await window.electronAPI.device.requestData(dataType);
    } catch (error) {
      console.error('Failed to request data:', error);
    }
  }, [isElectron, isConnected]);

  // Setup device data listener
  useEffect(() => {
    if (!isElectron || !window.electronAPI?.device) return;

    const handleDeviceData = (message: DeviceMessage) => {
      if (message.type === 'data' && message.data) {
        setLatestData(message.data);
      } else if (message.type === 'error') {
        toast({
          title: "Device Error",
          description: message.error,
          variant: "destructive",
        });
      }
    };

    window.electronAPI.device.onData(handleDeviceData);

    return () => {
      window.electronAPI?.removeAllListeners('device:data');
    };
  }, [isElectron, toast]);

  // Check connection status on mount
  useEffect(() => {
    if (!isElectron || !window.electronAPI?.device) return;

    const checkStatus = async () => {
      try {
        const result = await window.electronAPI.device.getStatus();
        if (result.success) {
          setIsConnected(result.connected);
          setDeviceType(result.deviceType);
          setCurrentPort(result.port);
        }
      } catch (error) {
        console.error('Failed to check device status:', error);
      }
    };

    checkStatus();
  }, [isElectron]);

  return {
    isElectron,
    ports,
    isConnected,
    deviceType,
    currentPort,
    latestData,
    isScanning,
    scanPorts,
    connect,
    disconnect,
    requestData,
  };
}
