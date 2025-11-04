import { supabase } from '@/integrations/supabase/client';
import { indexedDbService } from './indexedDbService';
import { toast } from '@/hooks/use-toast';

class SyncManager {
  private isSyncing = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private onlineListener: (() => void) | null = null;

  async initialize(): Promise<void> {
    await indexedDbService.init();
    
    // Initial sync when app loads
    if (navigator.onLine) {
      await this.syncToSupabase();
      await this.syncFromSupabase();
    }

    // Setup online event listener
    this.onlineListener = async () => {
      console.log('Connection restored, syncing...');
      await this.syncToSupabase();
      await this.syncFromSupabase();
      toast({
        title: 'Connection Restored',
        description: 'Your data has been synced.',
      });
    };
    
    window.addEventListener('online', this.onlineListener);

    // Periodic sync every 5 minutes when online
    this.syncInterval = setInterval(async () => {
      if (navigator.onLine) {
        await this.syncToSupabase();
        await this.syncFromSupabase();
      }
    }, 5 * 60 * 1000);
  }

  async syncToSupabase(): Promise<void> {
    if (this.isSyncing || !navigator.onLine) return;

    this.isSyncing = true;
    try {
      const pendingOps = await indexedDbService.getPendingOperations();
      
      for (const op of pendingOps) {
        try {
          switch (op.type) {
            case 'create':
            case 'update':
              const { error: upsertError } = await supabase
                .from('technique_sheets')
                .upsert({
                  id: op.sheetId,
                  sheet_name: op.data.sheet_name,
                  data: op.data.data,
                  user_id: op.userId,
                  tenant_id: op.tenantId,
                  updated_at: new Date().toISOString(),
                });

              if (upsertError) throw upsertError;
              
              await indexedDbService.markSheetAsSynced(op.sheetId);
              await indexedDbService.clearPendingOperation(op.id!);
              break;

            case 'delete':
              const { error: deleteError } = await supabase
                .from('technique_sheets')
                .delete()
                .eq('id', op.sheetId);

              if (deleteError) throw deleteError;
              
              await indexedDbService.clearPendingOperation(op.id!);
              break;
          }
        } catch (error) {
          console.error('Failed to sync operation:', op, error);
          // Continue with next operation
        }
      }

      // Mark all unsynced sheets as synced if successfully saved
      const unsyncedSheets = await indexedDbService.getUnsyncedSheets();
      for (const sheet of unsyncedSheets) {
        if (!sheet.deleted) {
          await indexedDbService.markSheetAsSynced(sheet.id);
        }
      }

      console.log('Sync to Supabase completed');
    } finally {
      this.isSyncing = false;
    }
  }

  async syncFromSupabase(): Promise<void> {
    if (!navigator.onLine) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's profile with tenant info
      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

      if (!profile?.tenant_id) return;

      const { data: sheets, error } = await supabase
        .from('technique_sheets')
        .select('*')
        .eq('user_id', user.id)
        .eq('tenant_id', profile.tenant_id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      if (sheets) {
        await indexedDbService.syncFromSupabase(sheets);
        console.log('Sync from Supabase completed');
      }
    } catch (error) {
      console.error('Failed to sync from Supabase:', error);
    }
  }

  async forceSyncNow(): Promise<void> {
    if (!navigator.onLine) {
      toast({
        title: 'Offline',
        description: 'Cannot sync while offline.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Syncing...',
      description: 'Synchronizing your data.',
    });

    await this.syncToSupabase();
    await this.syncFromSupabase();

    toast({
      title: 'Sync Complete',
      description: 'Your data is up to date.',
    });
  }

  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    
    if (this.onlineListener) {
      window.removeEventListener('online', this.onlineListener);
      this.onlineListener = null;
    }
  }
}

export const syncManager = new SyncManager();
