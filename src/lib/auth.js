import { supabase } from './supabaseClient.js';

/** Email/şifre ile giriş yapar, kullanıcı profilini (rol dahil) döner */
export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', data.user.id)
    .single();
  if (profileError) throw profileError;

  return profile; // { id, full_name, role }
}

export async function logout() {
  await supabase.auth.signOut();
  window.location.href = '/login.html';
}

/** Şu anki oturumun profilini getirir (sayfa yenilendiğinde kullanılır) */
export async function getCurrentProfile() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', session.user.id)
    .single();

  return profile;
}

/**
 * Mevcut sidebar menüsündeki data-view / onclick öğelerini role göre gizler.
 * index.html'deki her <button class="nav-btn"> öğesine data-roles="admin,ogretmen"
 * gibi bir attribute eklenip bu fonksiyon çağrılmalı (initApp() içinden).
 */
export function applyRoleBasedSidebar(role) {
  document.querySelectorAll('.nav-btn[data-roles]').forEach((btn) => {
    const allowedRoles = btn.dataset.roles.split(',').map((r) => r.trim());
    btn.style.display = allowedRoles.includes(role) ? '' : 'none';
  });
  
  // Sidebar altındaki yönetici adı alanını da güncelle
  const sidebarUserLabel = document.querySelector('.sidebar-header div[style*="font-size: 15px"]');
  if (sidebarUserLabel) {
    getCurrentProfile().then(profile => {
      if (profile) {
        sidebarUserLabel.textContent = profile.full_name;
      }
    }).catch(err => console.error(err));
  }
}

/** Oturum yoksa login sayfasına yönlendirir — her sayfanın başında çağrılmalı */
export async function requireAuth() {
  const profile = await getCurrentProfile();
  if (!profile) {
    window.location.href = '/login.html';
    return null;
  }
  return profile;
}
