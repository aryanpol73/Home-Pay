// HomePay Service Worker v9
// Minimal - just needs to exist and be active for PWA installability
const CACHE_NAME = 'homepay-v9';

self.addEventListener('install', function(e) {
  console.log('[SW] install');
  // Skip waiting immediately - become active right away
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  console.log('[SW] activate');
  e.waitUntil(
    // Delete old caches
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      // Take control of ALL open pages immediately
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(e) {
  // Only handle GET requests to our own origin
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith(self.location.origin)) return;

  e.respondWith(
    // Network first, cache fallback
    fetch(e.request)
      .then(function(response) {
        // Cache good responses
        if (response && response.ok) {
          var r = response.clone();
          caches.open(CACHE_NAME).then(function(c) { c.put(e.request, r); });
        }
        return response;
      })
      .catch(function() {
        // Offline fallback
        return caches.match(e.request).then(function(cached) {
          return cached || (e.request.mode === 'navigate' 
            ? caches.match('/index.html') 
            : new Response('Offline', {status: 503}));
        });
      })
  );
});
