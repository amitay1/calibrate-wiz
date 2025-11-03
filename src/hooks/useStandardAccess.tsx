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
    const checkAccess = async () => {
      try {
        setIsLoading(true);
        
        // Get the current session to ensure we have a valid token
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.error('No active session');
          setHasAccess(false);
          setIsLoading(false);
          return;
        }
        
        const { data, error } = await supabase.functions.invoke('validate-standard-access', {
          body: { standardCode },
        });

        if (error) {
          console.error('Error checking standard access:', error);
          setHasAccess(false);
          return;
        }

        setHasAccess(data.hasAccess);
        setAccessType(data.accessType);
        setExpiryDate(data.expiryDate);
        setExpired(data.expired || false);
      } catch (error) {
        console.error('Error in useStandardAccess:', error);
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [standardCode]);

  return { hasAccess, isLoading, accessType, expiryDate, expired };
};
