import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase] Missing environment variables — auth features will be unavailable.');
}

// Lazy accessor avoids touching window.localStorage at module evaluation time,
// which can crash on WKWebView before the storage layer is ready.
const getStorage = () => {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
};

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storage: getStorage(),
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
