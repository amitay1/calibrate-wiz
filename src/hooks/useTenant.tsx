import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  custom_domain: string | null;
  is_active: boolean;
  settings: any;
  created_at: string;
  updated_at: string;
}

export const useTenant = () => {
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTenant();
  }, []);

  const loadTenant = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      // Get user's profile with tenant info
      const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

      if (profile?.tenant_id) {
        // Fetch tenant details
        const { data: tenant } = await supabase
          .from('tenants')
          .select('*')
          .eq('id', profile.tenant_id)
          .single();

        setCurrentTenant(tenant);
      }
    } catch (error) {
      console.error('Error loading tenant:', error);
    } finally {
      setLoading(false);
    }
  };

  return { currentTenant, loading, reloadTenant: loadTenant };
};
