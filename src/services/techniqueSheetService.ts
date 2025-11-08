import { supabase, canUseSupabase } from '@/integrations/supabase/safeClient';
import { TechniqueSheet } from '@/types/techniqueSheet';
import { indexedDbService } from './indexedDbService';

export interface TechniqueSheetRecord {
  id: string;
  user_id: string;
  sheet_name: string;
  standard: string | null;
  data: any; // Using any to handle Json type from Supabase
  created_at: string;
  updated_at: string;
  created_by: string | null;
  modified_by: string | null;
  status: string | null;
}

export const techniqueSheetService = {
  // Save or update a technique sheet
  async saveTechniqueSheet(
    sheetName: string,
    data: TechniqueSheet,
    sheetId?: string
  ): Promise<{ success: boolean; error?: string; id?: string }> {
    try {
      if (!canUseSupabase() || !supabase) {
        return { success: false, error: 'Backend not configured' };
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Get user's profile with tenant_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, tenant_id')
        .eq('id', user.id)
        .single();

      if (!profile?.tenant_id) {
        return { success: false, error: 'User not assigned to a tenant' };
      }

      const userName = profile?.full_name || user.email || 'Unknown';

      const sheetData = {
        id: sheetId || crypto.randomUUID(),
        sheet_name: sheetName,
        standard: data.standardName || '',
        data: data as any,
        user_id: user.id,
        tenant_id: profile.tenant_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: sheetId ? undefined : userName,
        modified_by: userName,
        synced: false,
      };

      // Save to IndexedDB first (works offline)
      await indexedDbService.saveTechniqueSheet(sheetData as any);

      // Add to pending operations queue
      await indexedDbService.addPendingOperation({
        type: sheetId ? 'update' : 'create',
        sheetId: sheetData.id,
        data: sheetData,
        userId: user.id,
        tenantId: profile.tenant_id,
      });

      // Try to sync to Supabase if online
      if (navigator.onLine) {
        try {
          if (sheetId) {
            const { error } = await supabase
              .from('technique_sheets')
              .update({
                sheet_name: sheetData.sheet_name,
                standard: sheetData.standard,
                data: sheetData.data,
                modified_by: userName,
              })
              .eq('id', sheetId)
              .eq('user_id', user.id);

            if (!error) {
              await indexedDbService.markSheetAsSynced(sheetData.id);
            }
          } else {
            const { error } = await supabase
              .from('technique_sheets')
              .insert({
                id: sheetData.id,
                user_id: sheetData.user_id,
                tenant_id: sheetData.tenant_id,
                sheet_name: sheetData.sheet_name,
                standard: sheetData.standard,
                data: sheetData.data,
                created_by: userName,
                modified_by: userName,
              });

            if (!error) {
              await indexedDbService.markSheetAsSynced(sheetData.id);
            }
          }
        } catch (syncError) {
          console.warn('Failed to sync immediately, will retry later:', syncError);
        }
      }

      return { success: true, id: sheetData.id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Load all technique sheets for current user
  async loadTechniqueSheets(): Promise<{ success: boolean; sheets?: TechniqueSheetRecord[]; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Get user's profile with tenant info
      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

      if (!profile?.tenant_id) {
        return { success: false, error: 'Could not determine user tenant' };
      }

      // Try to load from Supabase if online
      if (navigator.onLine) {
        try {
          const { data: sheets, error } = await supabase
            .from('technique_sheets')
            .select('*')
            .eq('user_id', user.id)
            .eq('tenant_id', profile.tenant_id)
            .order('updated_at', { ascending: false });

          if (!error && sheets) {
            // Update IndexedDB with fresh data
            await indexedDbService.syncFromSupabase(sheets);
            return { success: true, sheets: sheets || [] };
          }
        } catch (error) {
          console.warn('Failed to load from Supabase, using offline data:', error);
        }
      }

      // Fallback to IndexedDB (offline mode)
      const localSheets = await indexedDbService.getAllTechniqueSheets(user.id, profile.tenant_id);
      return { success: true, sheets: localSheets || [] };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Load a specific technique sheet
  async loadTechniqueSheet(sheetId: string): Promise<{ success: boolean; sheet?: TechniqueSheetRecord; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Try IndexedDB first (works offline)
      const localSheet = await indexedDbService.getTechniqueSheet(sheetId);
      
      if (localSheet && !localSheet.deleted) {
        return { success: true, sheet: localSheet as any };
      }

      // Fallback to Supabase if online
      if (navigator.onLine) {
        const { data, error } = await supabase
          .from('technique_sheets')
          .select('*')
          .eq('id', sheetId)
          .eq('user_id', user.id)
          .single();

        if (!error && data) {
          // Update IndexedDB
          await indexedDbService.saveTechniqueSheet({
            ...data,
            synced: true,
          } as any);
          return { success: true, sheet: data };
        }
      }

      return { success: false, error: 'Sheet not found' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Delete a technique sheet
  async deleteTechniqueSheet(sheetId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Get tenant info
      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

      if (!profile?.tenant_id) {
        return { success: false, error: 'Could not determine user tenant' };
      }

      // Mark as deleted in IndexedDB
      await indexedDbService.deleteTechniqueSheet(sheetId);

      // Add to pending operations
      await indexedDbService.addPendingOperation({
        type: 'delete',
        sheetId,
        userId: user.id,
        tenantId: profile.tenant_id,
      });

      // Try to delete from Supabase if online
      if (navigator.onLine) {
        try {
          const { error } = await supabase
            .from('technique_sheets')
            .delete()
            .eq('id', sheetId)
            .eq('user_id', user.id);

          if (error) {
            console.warn('Failed to delete from Supabase, will retry later:', error);
          }
        } catch (error) {
          console.warn('Failed to delete immediately, will retry later:', error);
        }
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};
