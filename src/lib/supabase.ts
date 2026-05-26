import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storage: window.localStorage,
    storageKey: 'blossom-auth-token',
    flowType: 'pkce'
  }
});

export interface WisdomCard {
  id: string;
  title: string;
  text: string;
  source: string;
  category: 'Physical' | 'Metabolic' | 'Emotional' | 'Cycle';
  triggers: string[];
  active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}
