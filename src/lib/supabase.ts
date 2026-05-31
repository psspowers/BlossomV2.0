import { createClient } from '@supabase/supabase-js';
import { Preferences } from '@capacitor/preferences';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('[Supabase] Missing environment variables — auth features will be unavailable.');
}

// Native Capacitor storage adapter — writes auth tokens into iOS NSUserDefaults
// via @capacitor/preferences so sessions survive app updates and background cleans.
const nativeStorageAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const { value } = await Preferences.get({ key });
      return value;
    } catch (e) {
      console.error('[Supabase Auth] Native storage read failed:', e);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await Preferences.set({ key, value });
    } catch (e) {
      console.error('[Supabase Auth] Native storage write failed:', e);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await Preferences.remove({ key });
    } catch (e) {
      console.error('[Supabase Auth] Native storage delete failed:', e);
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: nativeStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storageKey: 'blossom-auth-token',
    flowType: 'pkce',
  },
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
