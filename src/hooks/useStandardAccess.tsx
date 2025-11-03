import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StandardType } from '@/types/techniqueSheet';

interface StandardAccess {
  hasAccess: boolean;
  isLoading: boolean;
  accessType: string | null;
  expiryDate: string | null;
  expired?: boolean;
}

export const useStandardAccess = (standardCode: StandardType): StandardAccess => {
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [accessType, setAccessType] = useState<string | null>(null);
  const [expiryDate, setExpiryDate] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const checkAccess = async () => {
      try {
        // Wait for auth to be ready
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (!session) {
          setHasAccess(false);
          setIsLoading(false);
          return;
        }
        
        const { data, error } = await supabase.functions.invoke('validate-standard-access', {
          body: { standardCode },
        });

        if (!isMounted) return;

        if (error) {
          console.error('Error checking standard access:', error);
          setHasAccess(false);
          setIsLoading(false);
          return;
        }

        setHasAccess(data.hasAccess);
        setAccessType(data.accessType);
        setExpiryDate(data.expiryDate);
        setExpired(data.expired || false);
        setIsLoading(false);
      } catch (error) {
        if (!isMounted) return;
        console.error('Error in useStandardAccess:', error);
        setHasAccess(false);
        setIsLoading(false);
      }
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && isMounted) {
        checkAccess();
      } else if (!session && isMounted) {
        setHasAccess(false);
        setIsLoading(false);
      }
    });

    // Initial check
    checkAccess();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [standardCode]);

  return { hasAccess, isLoading, accessType, expiryDate, expired };
};
