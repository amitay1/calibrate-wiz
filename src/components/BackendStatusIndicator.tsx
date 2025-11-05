import { useElectronBackend } from '@/hooks/useElectron';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Cloud, 
  HardDrive, 
  Settings2, 
  WifiOff, 
  CheckCircle2, 
  XCircle,
  RefreshCw 
} from 'lucide-react';
import { syncManager } from '@/services/syncManager';
import { useState } from 'react';
import { BackendSelector } from './BackendSelector';
import { toast } from '@/hooks/use-toast';

export function BackendStatusIndicator() {
  const { isElectron, backendConfig, loading, refresh } = useElectronBackend();
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);

  if (!isElectron || loading) {
    return null;
  }

  const getIcon = () => {
    if (!backendConfig || !backendConfig.isConnected) {
      return <WifiOff className="h-3 w-3" />;
    }

    switch (backendConfig.mode) {
      case 'cloud':
        return <Cloud className="h-3 w-3" />;
      case 'local':
        return <HardDrive className="h-3 w-3" />;
      case 'custom':
        return <Settings2 className="h-3 w-3" />;
      default:
        return <Cloud className="h-3 w-3" />;
    }
  };

  const getVariant = () => {
    if (!backendConfig || !backendConfig.isConnected) {
      return 'destructive';
    }
    return 'default';
  };

  const getLabel = () => {
    if (!backendConfig) {
      return 'No Backend';
    }

    if (!backendConfig.isConnected) {
      return 'Offline';
    }

    const mode = backendConfig.mode.charAt(0).toUpperCase() + backendConfig.mode.slice(1);
    return `${mode} Backend`;
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncManager.forceSyncNow();
      toast({
        title: 'Sync Complete',
        description: 'Your data is up to date.',
      });
    } catch (error) {
      toast({
        title: 'Sync Failed',
        description: 'Failed to sync data.',
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleBackendChange = async () => {
    await refresh();
    // Reinitialize sync manager with new backend
    if (backendConfig) {
      await syncManager.initialize(backendConfig);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Badge 
          variant={getVariant() as any}
          className="flex items-center gap-2 px-3 py-1 cursor-pointer hover:opacity-80"
          onClick={() => setSelectorOpen(true)}
        >
          {getIcon()}
          <span className="text-xs">{getLabel()}</span>
          {backendConfig?.isConnected ? (
            <CheckCircle2 className="h-3 w-3 text-green-500" />
          ) : (
            <XCircle className="h-3 w-3" />
          )}
        </Badge>

        {backendConfig?.isConnected && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSync}
            disabled={syncing}
            className="h-7 px-2"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </div>

      <BackendSelector
        open={selectorOpen}
        onOpenChange={setSelectorOpen}
        onBackendChange={handleBackendChange}
      />
    </>
  );
}
