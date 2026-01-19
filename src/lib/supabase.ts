import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
