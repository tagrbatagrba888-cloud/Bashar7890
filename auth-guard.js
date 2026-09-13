/* auth-guard.js — حماية الصفحات + فحص الصلاحيات */

(function () {
  const path = window.location.pathname.split('/').pop().toLowerCase();
  const current = path || 'index.html';

  // الصفحات العامة (بدون تسجيل)
  const PUBLIC_PAGES = ['login.html', 'register.html', ''];
  if (PUBLIC_PAGES.includes(current)) return;

  const adminName = sessionStorage.getItem('borsa_admin');
  const adminType = (sessionStorage.getItem('borsa_admin_type') || '').toLowerCase();

  let adminPerms = [];
  try {
    adminPerms = JSON.parse(sessionStorage.getItem('borsa_admin_perms') || '[]');
    if (!Array.isArray(adminPerms)) adminPerms = [];
  } catch { adminPerms = []; }

  const isSuperAdmin = (adminType === 'admin');

  // الصفحات المتاحة لأي مشرف مسجل
  const ANY_ADMIN_PAGES = [
    'index.html',
    'settings.html',
    'community.html',
    'chatt.html',
    'ashom.html',
    'tawseat.html',
    'admin.html',
    'user.html'
  ];

  // لو مفيش جلسة → login
  if (!adminName) {
    window.location.replace('login.html');
    return;
  }

  // المشرف الأساسي: كل الصفحات
  if (isSuperAdmin) {
    // منع الرجوع
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', function () {
      window.history.pushState(null, '', window.location.href);
    });
    return;
  }

  // مشرف عادي: حسب الصلاحيات
  if (ANY_ADMIN_PAGES.includes(current)) {
    // الصفحات الأساسية → متاحة للجميع
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', function () {
      window.history.pushState(null, '', window.location.href);
    });
    return;
  }

  // لو الصفحة مش مسموح بها → index
  if (!adminPerms.map(p => p.toLowerCase()).includes(current)) {
    alert('لا تملك صلاحية الوصول إلى هذه الصفحة');
    window.location.replace('index.html');
    return;
  }

  // منع الرجوع
  window.history.pushState(null, '', window.location.href);
  window.addEventListener('popstate', function () {
    window.history.pushState(null, '', window.location.href);
  });
})();