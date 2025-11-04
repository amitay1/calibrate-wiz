import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { WifiOff, Wifi, CloudOff } from 'lucide-react';
import { Button } from './ui/button';
import { syncManager } from '@/services/syncManager';

export const OfflineIndicator = () => {
  const isOnline = useOnlineStatus();

  const handleSyncNow = async () => {
    await syncManager.forceSyncNow();
  };

  if (isOnline) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Wifi className="h-4 w-4 text-green-500" />
        <span>Online</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSyncNow}
          className="h-7 px-2"
        >
          Sync Now
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm bg-amber-500/10 text-amber-500 px-3 py-1.5 rounded-md border border-amber-500/20">
      <CloudOff className="h-4 w-4" />
      <span>Working Offline - Changes will sync when connection restores</span>
    </div>
  );
};
