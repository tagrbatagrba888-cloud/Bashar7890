/* =====================================================
   auth-guard.js — حماية مبسطة
   BORSA CLUP
===================================================== */

(function () {
  const path = window.location.pathname.split('/').pop().toLowerCase() || '';
  const current = path || 'index.html';

  /* ========== الصفحات العامة (بدون تسجيل) ========== */
  const PUBLIC_PAGES = [
    'login.html',
    'daam.html',
    'register.html',
    ''
  ];

  if (PUBLIC_PAGES.includes(current)) {
    return; // ✅ مسموح بدون فحص
  }

  /* ========== فحص الجلسة ========== */
  const userName = sessionStorage.getItem('borsa_admin');

  if (!userName) {
    // ❌ مفيش جلسة → روح لـ login
    window.location.replace('login.html');
    return;
  }

  /* =====================================================
     ✅ أي مستخدم مسجّل يقدر يفتح أي صفحة
     (حتى لو كانت خاصة بالأدمن — يمكنك تعديلها)
  ===================================================== */

  /* ========== منع الرجوع للخلف ========== */
  window.history.pushState(null, '', window.location.href);
  window.addEventListener('popstate', function () {
    window.history.pushState(null, '', window.location.href);
  });

  /* ========== منع Backspace من الرجوع ========== */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Backspace'
        && e.target.tagName !== 'INPUT'
        && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  });

})();