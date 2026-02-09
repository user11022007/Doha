const CACHE_NAME = 'my-dottie-birthday-v1';

// Files we want available offline
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './music.mp3'
];

// ─────────────────────────────────────────────
// INSTALL — cache essential assets
// ─────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('💖 My Dottie cache opened');
      return Promise.all(
        urlsToCache.map(url =>
          fetch(url, { cache: 'reload' })
            .then(response => {
              if (response.ok) {
                return cache.put(url, response);
              }
            })
            .catch(() => {
              // Optional assets (music/icons) may fail — that's OK
              console.warn(`Skipped caching: ${url}`);
            })
        )
      );
    })
  );
  self.skipWaiting();
});

// ─────────────────────────────────────────────
// FETCH — cache-first, network fallback
// ─────────────────────────────────────────────
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request)
        .then(response => {
          // Only cache valid same-origin responses
          if (
            response &&
            response.status === 200 &&
            response.type === 'basic'
          ) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Offline fallback for navigation
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
    })
  );
});
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) {
            console.log('🧹 Removing old cache:', name);
            return caches.delete(name);
          }
        })
      )
    )
  );
  self.clients.claim();
});
