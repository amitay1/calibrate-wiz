import { useState, useEffect } from 'react';
import { supabase, canUseSupabase } from '@/integrations/supabase/safeClient';

type UserRole = 'developer' | 'customer' | null;

export const useUserRole = () => {
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchRole = async () => {
      try {
        if (!canUseSupabase() || !supabase) {
          setRole(null);
          setLoading(false);
          return;
        }
        
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user || !isMounted) {
          setRole(null);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching role:', error);
          setRole(null);
        } else {
          setRole(data.role as UserRole);
        }
      } catch (error) {
        console.error('Error in useUserRole:', error);
        setRole(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchRole();

    if (!supabase) {
      return () => {
        isMounted = false;
      };
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      if (isMounted) {
        fetchRole();
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { role, loading, isDeveloper: role === 'developer' };
};
