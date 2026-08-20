// BeastMode AI Service Worker — High-Performance NetworkFirst PWA Cache
const CACHE_NAME = 'beastmode-pwa-v2';
const STATIC_CACHE = 'beastmode-static-v2';

const OFFLINE_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
];

// 1. Immediate Install with skipWaiting
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(OFFLINE_SHELL).catch((err) => {
        console.warn('[ServiceWorker] Pre-caching offline shell fallback:', err);
      });
    })
  );
});

// 2. Activate with Immediate Clients Claim & Cache Cleanup
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) => {
        return Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME && key !== STATIC_CACHE)
            .map((key) => caches.delete(key))
        );
      }),
    ])
  );
});

// 3. Listen for direct Skip Waiting message from frontend UI
self.addEventListener('message', (event) => {
  if (event.data && (event.data.type === 'SKIP_WAITING' || event.data === 'skipWaiting')) {
    self.skipWaiting();
  }
});

// 4. Fetch Event with NetworkFirst Strategy for Navigation & HTML
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  let url;
  try {
    url = new URL(event.request.url);
  } catch {
    return;
  }

  // Only handle http and https schemes
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // SSRF Protection: Validate request URLs against allowed origins before dispatching fetch requests
  const isSameOrigin = url.origin === self.location.origin;
  const ALLOWED_TRUSTED_ORIGINS = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://images.unsplash.com',
    'https://raw.githubusercontent.com',
    'https://cdn.jsdelivr.net',
  ];
  const isAllowedOrigin = isSameOrigin || ALLOWED_TRUSTED_ORIGINS.some((origin) => {
    try {
      return url.origin === new URL(origin).origin;
    } catch {
      return false;
    }
  });

  // If destination does not match self.location.origin or trusted origins, bypass ServiceWorker
  if (!isAllowedOrigin) {
    return;
  }

  // Bypass Local Dev Server dynamic paths, Supabase, Groq/Gemini APIs
  if (
    url.pathname.startsWith('/@vite') ||
    url.pathname.startsWith('/src/') ||
    url.pathname.startsWith('/node_modules/') ||
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('groq.com') ||
    url.hostname.includes('googleapis.com')
  ) {
    return;
  }

  const isHtmlNavigation =
    event.request.mode === 'navigate' ||
    (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) ||
    url.pathname === '/' ||
    url.pathname.endsWith('.html');

  // STRATEGY A: NetworkFirst for HTML / Navigation (Solves Stale Cache completely!)
  if (isHtmlNavigation) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          console.warn('[ServiceWorker] Network unavailable, serving cached HTML shell.');
          const cached = await caches.match(event.request);
          if (cached) return cached;
          return (await caches.match('/index.html')) || (await caches.match('/'));
        })
    );
    return;
  }

  // STRATEGY B: Stale-While-Revalidate for Static Assets (JS, CSS, SVGs, Fonts)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
