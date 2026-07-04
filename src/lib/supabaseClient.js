import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase ortam değişkenleri eksik. .env dosyanızı kontrol edin.');
}

export const supabase = createClient(supabaseUrl || 'https://xxxx.supabase.co', supabaseAnonKey || 'placeholder');
