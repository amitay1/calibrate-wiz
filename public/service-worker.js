const CACHE_NAME = 'scan-master-v3';
const STATIC_CACHE = 'scan-master-static-v3';
const DYNAMIC_CACHE = 'scan-master-dynamic-v3';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Network-first strategy for API calls
  if (url.pathname.includes('/api/') || url.pathname.includes('supabase')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          return response;
        })
        .catch(() => {
          return new Response(
            JSON.stringify({ error: 'Offline', offline: true }),
            {
              headers: { 'Content-Type': 'application/json' },
              status: 503,
            }
          );
        })
    );
    return;
  }

  // Cache-first strategy for static assets
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then((response) => {
          // Clone the response
          const responseToCache = response.clone();

          // Cache successful responses
          if (response && response.status === 200) {
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }

          return response;
        })
        .catch(() => {
          // Return offline page for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== CACHE_NAME &&
            cacheName !== STATIC_CACHE &&
            cacheName !== DYNAMIC_CACHE
          ) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Background sync for pending operations
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-technique-sheets') {
    event.waitUntil(syncTechniqueSheets());
  }
});

async function syncTechniqueSheets() {
  // This will be triggered by the sync manager
  console.log('Background sync triggered');
}
