import { createClient } from '@supabase/supabase-js';

const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};

// Your connected Supabase project credentials (public anon/publishable key)
const DEFAULT_SUPABASE_URL = 'https://nyodtcxarubifemowmuj.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_nsX1buplsKCvVDjAol0tVg_xt8rQe33';

const supabaseUrl = env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY || DEFAULT_SUPABASE_KEY;

// Determine if valid credentials have been supplied
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project-id') &&
  !supabaseAnonKey.includes('your-anon-key')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

if (!isSupabaseConfigured) {
  console.info(
    '%c[Student Memories]%c Supabase credentials not found or placeholder detected. Operating with interactive mock data for testing. To connect to Supabase, update .env with your project keys.',
    'color: #818cf8; font-weight: bold;',
    'color: inherit;'
  );
}
