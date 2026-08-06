import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** .env dosyasında gerçek Supabase bilgileri girilmiş mi? */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    '[EduMercek] Supabase bağlantısı yapılandırılmamış (.env eksik). ' +
    'Uygulama DEMO MODUNDA çalışıyor: veriler yerel (localStorage/mock) olarak tutulacak. ' +
    'Gerçek bir backend için proje köküne VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY içeren bir .env dosyası ekleyin.'
  );
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
