import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Session } from '@supabase/supabase-js';
import { supabase, canUseSupabase } from '@/integrations/supabase/safeClient';
import { toast } from 'sonner';

export function useAuth() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!canUseSupabase() || !supabase) {
      setLoading(false);
      return;
    }

    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Handle sign out or session expiry
        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          if (!session) {
            console.log('Auth event: Session lost');
            setSession(null);
            setUser(null);
            setLoading(false);
            navigate('/auth');
            return;
          }
        }

        // Validate session token
        if (session?.access_token) {
          const tokenExpiry = session.expires_at ? new Date(session.expires_at * 1000) : null;
          const now = new Date();
          
          if (tokenExpiry && tokenExpiry <= now) {
            console.log('Token expired, attempting refresh...');
            const { data: { session: newSession }, error } = await supabase.auth.refreshSession();
            
            if (error || !newSession) {
              console.error('Failed to refresh expired token:', error);
              toast.error('Session expired. Please login again.');
              await supabase.auth.signOut();
              navigate('/auth');
              return;
            }
            
            setSession(newSession);
            setUser(newSession.user);
            setLoading(false);
            return;
          }
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        setSession(null);
        setUser(null);
        setLoading(false);
        return;
      }

      // Validate session
      if (session) {
        const tokenExpiry = session.expires_at ? new Date(session.expires_at * 1000) : null;
        const now = new Date();
        
        if (tokenExpiry && tokenExpiry <= now) {
          console.log('Initial session expired, attempting refresh...');
          const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError || !newSession) {
            console.error('Failed to refresh initial session:', refreshError);
            await supabase.auth.signOut();
            setSession(null);
            setUser(null);
            setLoading(false);
            return;
          }
          
          setSession(newSession);
          setUser(newSession.user);
          setLoading(false);
          return;
        }
      }

      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const signOut = async () => {
    if (canUseSupabase() && supabase) {
      await supabase.auth.signOut();
    }
    navigate('/auth');
  };

  return { user, session, loading, signOut };
}
