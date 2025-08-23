// public/sw.js

const VERSION = 'trx-v1';
const APP_SHELL = ['/', '/index.html', '/manifest.json'];

// Install: warm app shell
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
});

// Activate: take control + clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => (k !== VERSION ? caches.delete(k) : Promise.resolve())));
    await self.clients.claim();
  })());
});

// Fetch: 
// - navigations → network first, fallback to cached shell
// - static assets (js/css) → cache first
// - images → cache first with simple cap
// - APIs → network first (fallback to cache if you ever cache requests)
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // 1) Navigations (SPA routing)
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('/index.html'))
    );
    return;
  }

  const url = new URL(req.url);

  // 2) Static assets
  if (/\.(js|css)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(req, VERSION));
    return;
  }

  // 3) Images
  if (/\.(png|jpg|jpeg|gif|svg|webp)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(req, VERSION, 100));
    return;
  }

  // 4) APIs (your IndexedDB is the source of truth, but caching can soften outages)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(req, VERSION));
    return;
  }
});

// Helpers
async function cacheFirst(req, cacheName, max = 0) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res && res.ok) {
    await cache.put(req, res.clone());
    if (max) purge(cache, max); // best-effort
  }
  return res;
}

async function networkFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    const hit = await cache.match(req);
    if (hit) return hit;
    throw new Error('Network and cache both failed');
  }
}

async function purge(cache, max) {
  const keys = await cache.keys();
  if (keys.length > max) {
    await cache.delete(keys[0]); // naive LRU
  }
}

// Optional: support in-page "update app" button
self.addEventListener('message', (e) => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});
