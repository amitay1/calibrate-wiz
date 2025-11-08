import { supabase } from '@/integrations/supabase/client';

export interface CreateTenantData {
  name: string;
  subdomain: string;
  custom_domain?: string;
  settings?: any;
}

export const tenantService = {
  // Create new tenant
  async createTenant(
    data: CreateTenantData
  ): Promise<{ success: boolean; error?: string; tenant?: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data: tenant, error } = await supabase
        .from('tenants')
        .insert({
          name: data.name,
          subdomain: data.subdomain,
          custom_domain: data.custom_domain,
          settings: data.settings || {},
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, tenant };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Update tenant
  async updateTenant(
    tenantId: string,
    updates: Partial<CreateTenantData>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { error } = await supabase
        .from('tenants')
        .update(updates)
        .eq('id', tenantId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Get all tenants (admin only)
  async getAllTenants(): Promise<{ success: boolean; tenants?: any[]; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, tenants: data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Get tenant users
  async getTenantUsers(tenantId: string): Promise<{ success: boolean; users?: any[]; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('tenant_id', tenantId);

      if (error) throw error;
      return { success: true, users: data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};
