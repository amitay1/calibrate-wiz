import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Check if Supabase is configured
export const isSupabaseConfigured = !!(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

// Create a safe client that won't throw if env vars are missing
export const supabase = isSupabaseConfigured
  ? createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        storage: localStorage,
        persistSession: true,
        autoRefreshToken: true,
      }
    })
  : null;

// Helper to check if operations are available
export const canUseSupabase = () => {
  if (!isSupabaseConfigured) {
    console.warn('Supabase is not configured. Backend features are unavailable.');
    return false;
  }
  return true;
};
