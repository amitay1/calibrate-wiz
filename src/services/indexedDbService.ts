import { openDB, IDBPDatabase } from 'idb';
import { TechniqueSheet } from '@/types/techniqueSheet';

interface TechniqueSheetRecord {
  id: string;
  sheet_name: string;
  data: TechniqueSheet;
  user_id: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  synced: boolean;
  deleted?: boolean;
}

interface PendingOperation {
  id?: number;
  type: 'create' | 'update' | 'delete';
  sheetId: string;
  data?: any;
  timestamp: number;
  userId: string;
  tenantId: string;
}

class IndexedDbService {
  private db: IDBPDatabase | null = null;
  private dbName = 'scan-master-db';
  private dbVersion = 1;

  async init(): Promise<void> {
    if (this.db) return;

    this.db = await openDB(this.dbName, this.dbVersion, {
      upgrade(db) {
        // Technique sheets store
        if (!db.objectStoreNames.contains('technique-sheets')) {
          const sheetStore = db.createObjectStore('technique-sheets', {
            keyPath: 'id',
          });
          sheetStore.createIndex('by-sync', 'synced');
          sheetStore.createIndex('by-user', 'user_id');
          sheetStore.createIndex('by-tenant', 'tenant_id');
        }

        // Pending operations store
        if (!db.objectStoreNames.contains('pending-operations')) {
          const opStore = db.createObjectStore('pending-operations', {
            keyPath: 'id',
            autoIncrement: true,
          });
          opStore.createIndex('by-timestamp', 'timestamp');
        }
      },
    });
  }

  // Technique Sheets Operations
  async saveTechniqueSheet(sheet: TechniqueSheetRecord): Promise<void> {
    await this.init();
    await this.db!.put('technique-sheets', sheet as any);
  }

  async getTechniqueSheet(id: string): Promise<TechniqueSheetRecord | undefined> {
    await this.init();
    return await this.db!.get('technique-sheets', id) as TechniqueSheetRecord | undefined;
  }

  async getAllTechniqueSheets(userId: string, tenantId: string): Promise<any[]> {
    await this.init();
    const allSheets = await this.db!.getAll('technique-sheets');
    return (allSheets as any[]).filter(
      (sheet) =>
        sheet.user_id === userId &&
        sheet.tenant_id === tenantId &&
        !sheet.deleted
    );
  }

  async getUnsyncedSheets(): Promise<TechniqueSheetRecord[]> {
    await this.init();
    const allSheets = await this.db!.getAll('technique-sheets');
    return (allSheets as TechniqueSheetRecord[]).filter(sheet => !sheet.synced);
  }

  async markSheetAsSynced(id: string): Promise<void> {
    await this.init();
    const sheet = await this.db!.get('technique-sheets', id) as TechniqueSheetRecord | undefined;
    if (sheet) {
      sheet.synced = true;
      await this.db!.put('technique-sheets', sheet as any);
    }
  }

  async deleteTechniqueSheet(id: string): Promise<void> {
    await this.init();
    const sheet = await this.db!.get('technique-sheets', id) as TechniqueSheetRecord | undefined;
    if (sheet) {
      sheet.deleted = true;
      sheet.synced = false;
      await this.db!.put('technique-sheets', sheet as any);
    }
  }

  // Pending Operations
  async addPendingOperation(operation: Omit<PendingOperation, 'id' | 'timestamp'>): Promise<void> {
    await this.init();
    await this.db!.add('pending-operations', {
      ...operation,
      timestamp: Date.now(),
    } as any);
  }

  async getPendingOperations(): Promise<PendingOperation[]> {
    await this.init();
    const ops = await this.db!.getAllFromIndex('pending-operations', 'by-timestamp');
    return ops as PendingOperation[];
  }

  async clearPendingOperation(id: number): Promise<void> {
    await this.init();
    await this.db!.delete('pending-operations', id);
  }

  async clearAllPendingOperations(): Promise<void> {
    await this.init();
    const tx = this.db!.transaction('pending-operations', 'readwrite');
    await tx.store.clear();
    await tx.done;
  }

  // Sync all data from Supabase to IndexedDB
  async syncFromSupabase(sheets: any[]): Promise<void> {
    await this.init();
    const tx = this.db!.transaction('technique-sheets', 'readwrite');
    
    for (const sheet of sheets) {
      await tx.store.put({
        ...sheet,
        synced: true,
      });
    }
    
    await tx.done;
  }
}

export const indexedDbService = new IndexedDbService();
