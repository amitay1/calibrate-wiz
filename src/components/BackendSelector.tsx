import { useState, useEffect } from 'react';
import { useElectronBackend } from '@/hooks/useElectron';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Cloud, HardDrive, Settings2, Wifi, WifiOff, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { BackendConfig } from '@/types/electron';

interface BackendSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBackendChange?: (config: BackendConfig) => void;
}

export function BackendSelector({ open, onOpenChange, onBackendChange }: BackendSelectorProps) {
  const {
    isElectron,
    backendConfig,
    loading,
    detecting,
    detectBackend,
    setBackend,
    autoDetectAndSet,
  } = useElectronBackend();

  const [selectedMode, setSelectedMode] = useState<'auto' | 'cloud' | 'local' | 'custom'>('auto');
  const [customUrl, setCustomUrl] = useState('');
  const [customKey, setCustomKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; error?: string } | null>(null);

  // Initialize with current config
  useEffect(() => {
    if (backendConfig) {
      setSelectedMode(backendConfig.mode as any);
      if (backendConfig.mode === 'custom') {
        setCustomUrl(backendConfig.url);
        setCustomKey(backendConfig.key);
      }
    }
  }, [backendConfig]);

  const handleAutoDetect = async () => {
    const detected = await autoDetectAndSet();
    if (detected) {
      toast({
        title: 'Backend Detected',
        description: `Connected to ${detected.mode} backend`,
      });
      onBackendChange?.(detected);
    } else {
      toast({
        title: 'Detection Failed',
        description: 'No backend available. Running in offline mode.',
        variant: 'destructive',
      });
    }
  };

  const handleTestConnection = async () => {
    if (!customUrl || !customKey) {
      setTestResult({ success: false, error: 'Please enter URL and API key' });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch(`${customUrl}/rest/v1/`, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000),
        headers: {
          'apikey': customKey,
        },
      });

      setTestResult({
        success: response.ok,
        error: response.ok ? undefined : `Connection failed: ${response.status}`,
      });
    } catch (error: any) {
      setTestResult({
        success: false,
        error: error.message || 'Connection failed',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleApply = async () => {
    let config: BackendConfig;

    if (selectedMode === 'auto') {
      await handleAutoDetect();
      onOpenChange(false);
      return;
    }

    if (selectedMode === 'custom') {
      if (!customUrl || !customKey) {
        toast({
          title: 'Invalid Configuration',
          description: 'Please enter URL and API key',
          variant: 'destructive',
        });
        return;
      }

      config = {
        mode: 'custom',
        url: customUrl,
        key: customKey,
        isConnected: testResult?.success || false,
      };
    } else {
      // Local or Cloud
      const detected = await detectBackend();
      if (!detected || detected.mode !== selectedMode) {
        toast({
          title: 'Backend Not Available',
          description: `${selectedMode} backend is not available`,
          variant: 'destructive',
        });
        return;
      }

      config = detected;
    }

    const success = await setBackend(config);
    
    if (success) {
      toast({
        title: 'Backend Updated',
        description: `Switched to ${config.mode} backend`,
      });
      onBackendChange?.(config);
      onOpenChange(false);
    } else {
      toast({
        title: 'Update Failed',
        description: 'Failed to update backend configuration',
        variant: 'destructive',
      });
    }
  };

  if (!isElectron) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Backend Configuration</DialogTitle>
          <DialogDescription>
            Choose where your data will be stored and synced
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Current Status */}
            {backendConfig && (
              <Alert>
                <AlertDescription className="flex items-center gap-2">
                  {backendConfig.isConnected ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Connected to {backendConfig.mode} backend</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-destructive" />
                      <span>Offline mode</span>
                    </>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Backend Mode Selection */}
            <RadioGroup value={selectedMode} onValueChange={(value: any) => setSelectedMode(value)}>
              <div className="space-y-3">
                {/* Auto Detect */}
                <div className="flex items-center space-x-2 rounded-lg border p-4 hover:bg-accent cursor-pointer">
                  <RadioGroupItem value="auto" id="auto" />
                  <Label htmlFor="auto" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Wifi className="h-4 w-4" />
                      <span className="font-semibold">Auto-Detect</span>
                      <Badge variant="secondary" className="ml-auto">Recommended</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Automatically detect and connect to available backend
                    </p>
                  </Label>
                </div>

                {/* Cloud Backend */}
                <div className="flex items-center space-x-2 rounded-lg border p-4 hover:bg-accent cursor-pointer">
                  <RadioGroupItem value="cloud" id="cloud" />
                  <Label htmlFor="cloud" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Cloud className="h-4 w-4" />
                      <span className="font-semibold">Cloud Backend</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Use cloud storage (requires internet)
                    </p>
                  </Label>
                </div>

                {/* Local Backend */}
                <div className="flex items-center space-x-2 rounded-lg border p-4 hover:bg-accent cursor-pointer">
                  <RadioGroupItem value="local" id="local" />
                  <Label htmlFor="local" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4" />
                      <span className="font-semibold">Local Backend</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Use local server (air-gapped environments)
                    </p>
                  </Label>
                </div>

                {/* Custom Backend */}
                <div className="flex items-center space-x-2 rounded-lg border p-4 hover:bg-accent cursor-pointer">
                  <RadioGroupItem value="custom" id="custom" />
                  <Label htmlFor="custom" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Settings2 className="h-4 w-4" />
                      <span className="font-semibold">Custom URL</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Connect to factory-specific backend
                    </p>
                  </Label>
                </div>
              </div>
            </RadioGroup>

            {/* Custom Backend Configuration */}
            {selectedMode === 'custom' && (
              <div className="space-y-4 rounded-lg border p-4 bg-muted/50">
                <div className="space-y-2">
                  <Label htmlFor="custom-url">Backend URL</Label>
                  <Input
                    id="custom-url"
                    placeholder="http://factory-server:8000"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom-key">API Key</Label>
                  <Input
                    id="custom-key"
                    type="password"
                    placeholder="your-api-key"
                    value={customKey}
                    onChange={(e) => setCustomKey(e.target.value)}
                  />
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestConnection}
                  disabled={testing || !customUrl || !customKey}
                  className="w-full"
                >
                  {testing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    'Test Connection'
                  )}
                </Button>

                {testResult && (
                  <Alert variant={testResult.success ? 'default' : 'destructive'}>
                    <AlertDescription className="flex items-center gap-2">
                      {testResult.success ? (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Connection successful
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4" />
                          {testResult.error}
                        </>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={loading || detecting}>
            {detecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Detecting...
              </>
            ) : (
              'Apply'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
