/* =====================================================
   BORSA CLUP - Service Worker
===================================================== */

const CACHE_NAME = 'borsa-clup-v2';

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

/* Fetch */
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // تجاهل الـ APIs والموارد الخارجية
  const skipDomains = [
    'firebaseio.com', 'googleapis.com', 'gstatic.com',
    'tradingview.com', 'twelvedata.com', 'clearbit.com',
    'i.ibb.co', 'fonts.googleapis.com', 'fonts.gstatic.com'
  ];
  if (skipDomains.some((d) => url.hostname.includes(d))) return;

  // ⚠️ مهم: لا تخزّن HTML — عشان التحديثات تظهر فورًا
  const isHTML = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');

  if (isHTML) {
    event.respondWith(
      fetch(req).catch(() => caches.match(req) || caches.match('./login.html'))
    );
    return;
  }

  // الأصول الثابتة: Cache First
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
        }
        return res;
      }).catch(() => cached);
    })
  );
});

/* رسائل من الصفحة */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});