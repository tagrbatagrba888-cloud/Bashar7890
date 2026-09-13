/* =====================================================
   sw.js — Service Worker
   BORSA CLUP
   ★ يستثني Google APIs و Firebase
===================================================== */

const CACHE_NAME = 'borsa-clup-v5';

const STATIC_ASSETS = [
  './manifest.json',
  './auth-guard.js',
  './logout.js'
];

/* Install */
self.addEventListener('install', (event) => {
  console.log('[SW] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Some assets failed', err);
      });
    }).then(() => self.skipWaiting())
  );
});

/* Activate */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate');
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

/* ★ قائمة النطاقات اللي ممنوع نتدخّل فيها ★ */
const SKIP_DOMAINS = [
  // Google APIs (أهم حاجة!)
  'apis.google.com',
  'accounts.google.com',
  'www.googleapis.com',
  'googleapis.com',
  'gstatic.com',
  'google.com',
  'googleusercontent.com',
  'firebaseapp.com',
  'firebaseio.com',
  'cloudfunctions.net',
  // خدمات خارجية
  'tradingview.com',
  'twelvedata.com',
  'clearbit.com',
  'i.ibb.co',
  'fonts.googleapis.com',
  'fonts.gstatic.com'
];

/* Fetch */
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // ★ نتجاهل غير GET
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // ★★ مهم جدًا: نتجاهل كل الطلبات الخارجية ★★
  if (SKIP_DOMAINS.some(d => url.hostname.includes(d))) {
    return; // نتركها تمر عادي بدون اعتراض
  }

  // ★ نتجاهل أي طلب مش من نفس الدومين
  if (url.origin !== self.location.origin) {
    return;
  }

  // ★ للصفحات (HTML) → Network First
  const isHTML = req.mode === 'navigate' 
              || (req.headers.get('accept') || '').includes('text/html');

  if (isHTML) {
    event.respondWith(
      fetch(req).catch(() => {
        return caches.match(req).then((cached) => {
          if (cached) return cached;
          return caches.match('./login.html').then((fallback) => {
            if (fallback) return fallback;
            return new Response('Offline', {
              status: 503,
              headers: { 'Content-Type': 'text/plain; charset=utf-8' }
            });
          });
        });
      })
    );
    return;
  }

  // ★ للأصول الثابتة → Cache First
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        // ★ نتأكد إن الاستجابة صحيحة قبل ما نخزّنها
        if (res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, clone)).catch(() => {});
        }
        return res;
      }).catch(() => {
        // ★ نرجع Response صالح دايماً
        return new Response('Not found', {
          status: 404,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      });
    })
  );
});

/* Message */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});