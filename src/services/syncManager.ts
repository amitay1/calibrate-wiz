import { supabase, canUseSupabase } from '@/integrations/supabase/safeClient';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { indexedDbService } from './indexedDbService';
import { toast } from '@/hooks/use-toast';
import type { BackendConfig } from '@/types/electron';

type SyncMode = 'cloud-only' | 'local-only' | 'bidirectional' | 'offline';

class SyncManager {
  private isSyncing = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private onlineListener: (() => void) | null = null;
  
  // Hybrid mode support
  private syncMode: SyncMode = 'cloud-only';
  private localBackend: SupabaseClient | null = null;
  private cloudBackend: SupabaseClient | null = supabase;
  private lastSyncTime: Date | null = null;

  /**
   * Initialize sync manager with backend configuration
   */
  async initialize(backendConfig?: BackendConfig): Promise<void> {
    await indexedDbService.init();
    
    // Configure backend based on Electron settings
    if (backendConfig) {
      await this.configureBackend(backendConfig);
    }
    
    // Initial sync when app loads
    if (navigator.onLine) {
      await this.syncToActiveBackend();
      await this.syncFromActiveBackend();
    }

    // Setup online event listener
    this.onlineListener = async () => {
      console.log('Connection restored, syncing...');
      await this.syncToActiveBackend();
      await this.syncFromActiveBackend();
      toast({
        title: 'Connection Restored',
        description: 'Your data has been synced.',
      });
    };
    
    window.addEventListener('online', this.onlineListener);

    // Periodic sync every 5 minutes when online
    this.syncInterval = setInterval(async () => {
      if (navigator.onLine && this.syncMode !== 'offline') {
        await this.syncToActiveBackend();
        await this.syncFromActiveBackend();
      }
    }, 5 * 60 * 1000);
  }

  /**
   * Configure backend(s) based on Electron backend selector
   */
  async configureBackend(config: BackendConfig): Promise<void> {
    if (!config.isConnected) {
      this.syncMode = 'offline';
      this.localBackend = null;
      return;
    }

    switch (config.mode) {
      case 'local':
        this.localBackend = createClient(config.url, config.key);
        this.syncMode = 'local-only';
        break;

      case 'cloud':
        this.cloudBackend = supabase;
        this.syncMode = 'cloud-only';
        this.localBackend = null;
        break;

      case 'custom':
        this.cloudBackend = createClient(config.url, config.key);
        this.syncMode = 'cloud-only';
        this.localBackend = null;
        break;

      default:
        // Auto mode - try to connect to both if available
        try {
          this.localBackend = createClient('http://localhost:8000', 'local-key');
          this.syncMode = 'bidirectional';
        } catch {
          this.syncMode = 'cloud-only';
          this.localBackend = null;
        }
    }

    console.log(`Sync mode: ${this.syncMode}`);
  }

  /**
   * Get current sync mode
   */
  getSyncMode(): SyncMode {
    return this.syncMode;
  }

  /**
   * Get last sync time
   */
  getLastSyncTime(): Date | null {
    return this.lastSyncTime;
  }

  /**
   * Sync to active backend (cloud or local)
   */
  private async syncToActiveBackend(): Promise<void> {
    if (this.syncMode === 'offline') return;

    if (this.syncMode === 'bidirectional') {
      await Promise.all([
        this.syncToBackend(this.cloudBackend),
        this.localBackend ? this.syncToBackend(this.localBackend) : Promise.resolve(),
      ]);
    } else if (this.syncMode === 'local-only' && this.localBackend) {
      await this.syncToBackend(this.localBackend);
    } else {
      await this.syncToBackend(this.cloudBackend);
    }

    this.lastSyncTime = new Date();
  }

  /**
   * Sync data to specific backend
   */
  private async syncToBackend(backend: SupabaseClient): Promise<void> {
    if (this.isSyncing || !navigator.onLine) return;

    this.isSyncing = true;
    try {
      const pendingOps = await indexedDbService.getPendingOperations();
      
      for (const op of pendingOps) {
        try {
          switch (op.type) {
            case 'create':
            case 'update':
              const { error: upsertError } = await backend
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
              const { error: deleteError } = await backend
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

      console.log('Sync to backend completed');
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Legacy method - redirect to active backend
   */
  async syncToSupabase(): Promise<void> {
    return this.syncToActiveBackend();
  }

  /**
   * Sync from active backend (cloud or local)
   */
  private async syncFromActiveBackend(): Promise<void> {
    if (this.syncMode === 'offline') return;

    if (this.syncMode === 'bidirectional') {
      // For bidirectional, prioritize cloud backend but merge with local
      await this.syncFromBackend(this.cloudBackend);
      if (this.localBackend) {
        await this.syncFromBackend(this.localBackend);
      }
    } else if (this.syncMode === 'local-only' && this.localBackend) {
      await this.syncFromBackend(this.localBackend);
    } else {
      await this.syncFromBackend(this.cloudBackend);
    }

    this.lastSyncTime = new Date();
  }

  /**
   * Sync data from specific backend
   */
  private async syncFromBackend(backend: SupabaseClient): Promise<void> {
    if (!navigator.onLine) return;

    try {
      const { data: { user } } = await backend.auth.getUser();
      if (!user) return;

      // Get user's profile with tenant info
      const { data: profile } = await backend
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

      if (!profile?.tenant_id) return;

      const { data: sheets, error } = await backend
        .from('technique_sheets')
        .select('*')
        .eq('user_id', user.id)
        .eq('tenant_id', profile.tenant_id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      if (sheets) {
        await indexedDbService.syncFromSupabase(sheets);
        console.log('Sync from backend completed');
      }
    } catch (error) {
      console.error('Failed to sync from backend:', error);
    }
  }

  /**
   * Legacy method - redirect to active backend
   */
  async syncFromSupabase(): Promise<void> {
    return this.syncFromActiveBackend();
  }

  /**
   * Bidirectional sync between local and cloud backends
   */
  async syncBidirectional(): Promise<void> {
    if (!this.localBackend || this.syncMode !== 'bidirectional') {
      console.warn('Bidirectional sync not available');
      return;
    }

    try {
      // Get data from both backends
      const [cloudSheets, localSheets] = await Promise.all([
        this.getSheetsFromBackend(this.cloudBackend),
        this.getSheetsFromBackend(this.localBackend),
      ]);

      // Merge and resolve conflicts (timestamp-based, latest wins)
      const mergedSheets = this.mergeSheets(cloudSheets, localSheets);

      // Sync merged data back to both backends
      await Promise.all([
        this.pushSheetsToBackend(this.cloudBackend, mergedSheets),
        this.pushSheetsToBackend(this.localBackend, mergedSheets),
      ]);

      // Update IndexedDB
      await indexedDbService.syncFromSupabase(mergedSheets);

      console.log('Bidirectional sync completed');
      this.lastSyncTime = new Date();
    } catch (error) {
      console.error('Bidirectional sync failed:', error);
    }
  }

  /**
   * Get sheets from a backend
   */
  private async getSheetsFromBackend(backend: SupabaseClient): Promise<any[]> {
    const { data: { user } } = await backend.auth.getUser();
    if (!user) return [];

    const { data: profile } = await backend
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    if (!profile?.tenant_id) return [];

    const { data: sheets } = await backend
      .from('technique_sheets')
      .select('*')
      .eq('user_id', user.id)
      .eq('tenant_id', profile.tenant_id);

    return sheets || [];
  }

  /**
   * Push sheets to a backend
   */
  private async pushSheetsToBackend(backend: SupabaseClient, sheets: any[]): Promise<void> {
    if (sheets.length === 0) return;

    await backend
      .from('technique_sheets')
      .upsert(sheets, { onConflict: 'id' });
  }

  /**
   * Merge sheets from multiple backends (conflict resolution)
   */
  private mergeSheets(cloudSheets: any[], localSheets: any[]): any[] {
    const sheetsMap = new Map<string, any>();

    // Add cloud sheets
    cloudSheets.forEach(sheet => {
      sheetsMap.set(sheet.id, sheet);
    });

    // Add/merge local sheets (latest updated_at wins)
    localSheets.forEach(sheet => {
      const existing = sheetsMap.get(sheet.id);
      if (!existing || new Date(sheet.updated_at) > new Date(existing.updated_at)) {
        sheetsMap.set(sheet.id, sheet);
      }
    });

    return Array.from(sheetsMap.values());
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
