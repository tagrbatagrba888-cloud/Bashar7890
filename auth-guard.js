/* =====================================================
   auth-guard.js — الحماية والصلاحيات
   BORSA CLUP
   ★ يقرأ من sessionStorage + localStorage
===================================================== */

(function () {

  /* ========== الصفحة الحالية ========== */
  const path = window.location.pathname.split('/').pop().toLowerCase() || '';
  const current = path || 'index.html';

  /* =====================================================
     1) الصفحات العامة (بدون تسجيل دخول)
  ===================================================== */
  const PUBLIC_PAGES = [
    'login.html',
    'daam.html',
    'register.html',
    ''
  ];

  if (PUBLIC_PAGES.includes(current)) {
    return; // ✅ مسموح بدون فحص
  }

  /* =====================================================
     2) فحص الجلسة (في الاثنين)
  ===================================================== */
  const userName = sessionStorage.getItem('borsa_admin') 
                || localStorage.getItem('borsa_admin');

  const userType = (
    sessionStorage.getItem('borsa_admin_type') 
    || localStorage.getItem('borsa_admin_type') 
    || ''
  ).toLowerCase();

  if (!userName) {
    // ❌ مفيش جلسة → login
    window.location.replace('login.html');
    return;
  }

  /* =====================================================
     3) ✅ مزامنة بين الاثنين (عشان ما يحصلش تعارض)
  ===================================================== */
  if (!sessionStorage.getItem('borsa_admin') && localStorage.getItem('borsa_admin')) {
    // لو موجود في localStorage بس → انقله لـ sessionStorage
    const keys = ['borsa_admin', 'borsa_admin_id', 'borsa_admin_type', 'borsa_admin_email', 'borsa_admin_role'];
    keys.forEach(k => {
      const v = localStorage.getItem(k);
      if (v) sessionStorage.setItem(k, v);
    });
  }

  /* =====================================================
     4) منع الرجوع للخلف
  ===================================================== */
  window.history.pushState(null, '', window.location.href);
  window.addEventListener('popstate', function () {
    window.history.pushState(null, '', window.location.href);
  });

  /* =====================================================
     5) منع Backspace من الرجوع
  ===================================================== */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Backspace'
        && e.target.tagName !== 'INPUT'
        && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  });

})();