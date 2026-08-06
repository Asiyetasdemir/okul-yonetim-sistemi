import { supabase, isSupabaseConfigured } from './supabaseClient.js';

const DEMO_PROFILE_KEY = 'edu_demo_profile';

/**
 * DEMO MODU (Supabase yapılandırılmamışken):
 * E-posta adresindeki anahtar kelimeye göre rol atar.
 */
function demoLogin(email) {
  const lower = (email || '').toLowerCase();
  let role = 'admin';
  let full_name = 'Demo Yönetici';

  if (lower.includes('veli')) {
    role = 'veli';
    full_name = 'Demo Veli';
  } else if (lower.includes('ogretmen') || lower.includes('öğretmen')) {
    role = 'ogretmen';
    full_name = 'Demo Öğretmen';
  } else if (lower.includes('ogrenci') || lower.includes('öğrenci')) {
    role = 'ogrenci';
    full_name = 'Demo Öğrenci';
  }

  const profile = { id: `demo-${role}`, full_name, role };
  localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(profile));
  return profile;
}

export async function login(email, password) {
  if (!isSupabaseConfigured) {
    return demoLogin(email);
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', data.user.id)
    .single();
  if (profileError) throw profileError;

  return profile;
}

export async function logout() {
  if (!isSupabaseConfigured) {
    localStorage.removeItem(DEMO_PROFILE_KEY);
    window.location.href = '/login.html';
    return;
  }
  await supabase.auth.signOut();
  window.location.href = '/login.html';
}

export async function getCurrentProfile() {
  if (!isSupabaseConfigured) {
    const saved = localStorage.getItem(DEMO_PROFILE_KEY);
    return saved ? JSON.parse(saved) : null;
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', session.user.id)
    .single();

  return profile;
}

export function applyRoleBasedSidebar(role) {
  document.querySelectorAll('.nav-btn[data-roles]').forEach((btn) => {
    const allowedRoles = btn.dataset.roles.split(',').map((r) => r.trim());
    btn.style.display = allowedRoles.includes(role) ? '' : 'none';
  });

  const sidebarUserLabel = document.querySelector('.sidebar-header div[style*="font-size: 15px"]');
  if (sidebarUserLabel) {
    getCurrentProfile().then(profile => {
      if (profile) {
        sidebarUserLabel.textContent = profile.full_name;
      }
    }).catch(err => console.error(err));
  }
}

export async function requireAuth() {
  const profile = await getCurrentProfile();
  if (!profile) {
    window.location.href = '/login.html';
    return null;
  }
  return profile;
}
