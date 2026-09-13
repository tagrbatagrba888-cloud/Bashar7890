/* logout.js — تسجيل خروج آمن (للمشرف والمستخدم) */

function logout() {
  try {
    // امسح كل بيانات الجلسة
    sessionStorage.removeItem('borsa_admin');
    sessionStorage.removeItem('borsa_admin_id');
    sessionStorage.removeItem('borsa_admin_type');
    sessionStorage.removeItem('borsa_admin_perms');
    sessionStorage.removeItem('borsa_admin_role');
    sessionStorage.removeItem('borsa_admin_email');
    sessionStorage.removeItem('borsa_user');
    sessionStorage.clear();
  } catch (e) {
    console.warn('logout error:', e);
  }

  // حوّل لصفحة الدخول
  window.location.replace('login.html');
}

// اجعلها متاحة بشكل عام (global)
window.logout = logout;