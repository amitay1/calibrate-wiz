import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase, canUseSupabase } from '@/integrations/supabase/safeClient';
import { Loader2 } from 'lucide-react';
import { useInactivityLogout } from '@/hooks/useInactivityLogout';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Only activate inactivity logout when user is authenticated
  useInactivityLogout();

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        if (!canUseSupabase() || !supabase) {
          if (isMounted) {
            setIsAuthenticated(false);
            setLoading(false);
          }
          return;
        }
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (isMounted) {
          setIsAuthenticated(!!session);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        if (isMounted) {
          setIsAuthenticated(false);
          setLoading(false);
        }
      }
    };

    checkAuth();

    if (!supabase) {
      return () => {
        isMounted = false;
      };
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (isMounted) {
        setIsAuthenticated(!!session);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};
