import { useState, useEffect } from 'react';
import { useDeviceCommunication } from '@/hooks/useDeviceCommunication';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Usb, RefreshCw, Zap, ZapOff } from 'lucide-react';

interface DeviceConnectionProps {
  onDataReceived?: (data: any) => void;
}

export function DeviceConnection({ onDataReceived }: DeviceConnectionProps) {
  const {
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
  } = useDeviceCommunication();

  const [selectedPort, setSelectedPort] = useState<string>('');
  const [selectedDevice, setSelectedDevice] = useState<'olympus' | 'ge' | 'evident'>('olympus');
  const [baudRate, setBaudRate] = useState<number>(9600);

  // Notify parent component of new data
  useEffect(() => {
    if (latestData && onDataReceived) {
      onDataReceived(latestData);
    }
  }, [latestData, onDataReceived]);

  // Auto-scan ports on mount
  useEffect(() => {
    if (isElectron && !isConnected) {
      scanPorts();
    }
  }, [isElectron, isConnected, scanPorts]);

  const handleConnect = async () => {
    if (selectedPort) {
      await connect(selectedPort, selectedDevice, baudRate);
    }
  };

  if (!isElectron) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Device Connection</CardTitle>
          <CardDescription>
            Serial port communication is only available in the desktop application
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Usb className="h-5 w-5" />
              UT Device Connection
            </CardTitle>
            <CardDescription>
              Connect to Olympus, GE, or Evident ultrasonic testing equipment
            </CardDescription>
          </div>
          {isConnected && (
            <Badge variant="default" className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Connected
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <>
            {/* Port Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Serial Port</label>
              <div className="flex gap-2">
                <Select value={selectedPort} onValueChange={setSelectedPort}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a serial port" />
                  </SelectTrigger>
                  <SelectContent>
                    {ports.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No ports found
                      </SelectItem>
                    ) : (
                      ports.map((port) => (
                        <SelectItem key={port.path} value={port.path}>
                          {port.path} - {port.manufacturer}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={scanPorts}
                  disabled={isScanning}
                >
                  {isScanning ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Device Type Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Device Type</label>
              <Select
                value={selectedDevice}
                onValueChange={(value: any) => setSelectedDevice(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="olympus">Olympus</SelectItem>
                  <SelectItem value="ge">GE (Krautkramer)</SelectItem>
                  <SelectItem value="evident">Evident (Olympus IMS)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Baud Rate Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Baud Rate</label>
              <Select
                value={baudRate.toString()}
                onValueChange={(value) => setBaudRate(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="9600">9600</SelectItem>
                  <SelectItem value="19200">19200</SelectItem>
                  <SelectItem value="38400">38400</SelectItem>
                  <SelectItem value="57600">57600</SelectItem>
                  <SelectItem value="115200">115200</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleConnect}
              disabled={!selectedPort}
              className="w-full"
            >
              <Zap className="mr-2 h-4 w-4" />
              Connect to Device
            </Button>
          </>
        ) : (
          <>
            {/* Connected Status */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Port:</span>
                <span className="font-mono">{currentPort}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Device:</span>
                <span className="capitalize">{deviceType}</span>
              </div>
            </div>

            <Separator />

            {/* Latest Data Display */}
            {latestData && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Latest Data</h4>
                <div className="rounded-md bg-muted p-3 space-y-1 text-sm">
                  {latestData.frequency && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Frequency:</span>
                      <span className="font-mono">{latestData.frequency}</span>
                    </div>
                  )}
                  {latestData.gain !== null && latestData.gain !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gain:</span>
                      <span className="font-mono">{latestData.gain} dB</span>
                    </div>
                  )}
                  {latestData.velocity && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Velocity:</span>
                      <span className="font-mono">{latestData.velocity} m/s</span>
                    </div>
                  )}
                  {latestData.probeType && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Probe:</span>
                      <span className="font-mono">{latestData.probeType}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => requestData('all')}
                variant="outline"
                className="flex-1"
              >
                Request Data
              </Button>
              <Button
                onClick={disconnect}
                variant="destructive"
                className="flex-1"
              >
                <ZapOff className="mr-2 h-4 w-4" />
                Disconnect
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
