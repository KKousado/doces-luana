import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://unzzrlcminkudoolooer.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuenpybGNtaW5rdWRvb2xvb2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzMDk4MzgsImV4cCI6MjEwNjg4NTgzOH0.zx-nnqUDFzGGdY7kHLXtBcFKCkVjWOR355p8a76FRz8';

export const isSupabaseConfigured = Boolean(
  supabaseAnonKey && supabaseAnonKey.trim() !== '' && supabaseAnonKey !== 'sua_chave_anonima_publica_aqui'
);

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
