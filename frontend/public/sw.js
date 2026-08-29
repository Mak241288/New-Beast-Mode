// BeastMode AI Service Worker — High-Performance NetworkFirst PWA Cache
const CACHE_NAME = 'beastmode-pwa-v3';
const STATIC_CACHE = 'beastmode-static-v3';

const OFFLINE_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
];

// Predefined Set of Trusted Origins for SSRF Prevention
const TRUSTED_ORIGINS = new Set([
  self.location.origin,
  'https://musclewiki.com',
  'https://www.musclewiki.com',
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
  'https://images.unsplash.com',
  'https://raw.githubusercontent.com',
  'https://cdn.jsdelivr.net',
]);

/**
 * SSRF Protection Validator: Checks if the target URL origin is trusted.
 */
function isTrustedOrigin(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }
    if (parsed.origin === self.location.origin) {
      return true;
    }
    if (TRUSTED_ORIGINS.has(parsed.origin)) {
      return true;
    }
    if (
      parsed.hostname.endsWith('.supabase.co') ||
      parsed.hostname.endsWith('.groq.com') ||
      parsed.hostname.endsWith('.onrender.com') ||
      parsed.hostname.endsWith('.vercel.app')
    ) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

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

// 4. Fetch Event with Strict Bypass for Render / Backend APIs & NetworkFirst Strategy
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const requestUrl = event.request.url;
  let url;
  try {
    url = new URL(requestUrl);
  } catch {
    event.respondWith(new Response('Invalid URL', { status: 400 }));
    return;
  }

  // Bypass /api/ backend endpoints, Render backend, Supabase, Groq, Google APIs, and Vite dev server
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname === '/api' ||
    url.hostname.includes('onrender.com') ||
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('groq.com') ||
    url.hostname.includes('googleapis.com') ||
    url.pathname.startsWith('/@vite') ||
    url.pathname.startsWith('/src/') ||
    url.pathname.startsWith('/node_modules/')
  ) {
    return;
  }

  // SSRF Protection: Validate request origin against trusted origins for cached assets
  if (!isTrustedOrigin(requestUrl)) {
    event.respondWith(new Response('Forbidden: Untrusted Origin', { status: 403 }));
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
      (async () => {
        // Validate origin before executing fetch
        if (!isTrustedOrigin(event.request.url)) {
          return new Response('Forbidden', { status: 403 });
        }

        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            const cache = await caches.open(STATIC_CACHE);
            cache.put(event.request, responseClone);
          }
          return networkResponse;
        } catch (err) {
          console.warn('[ServiceWorker] Network unavailable, serving cached HTML shell.');
          const cached = await caches.match(event.request);
          if (cached) return cached;
          return (await caches.match('/index.html')) || (await caches.match('/')) || new Response('Offline', { status: 503 });
        }
      })()
    );
    return;
  }

  // STRATEGY B: Stale-While-Revalidate for Static Assets (JS, CSS, SVGs, Fonts)
  event.respondWith(
    (async () => {
      // Validate origin before executing fetch
      if (!isTrustedOrigin(event.request.url)) {
        return new Response('Forbidden', { status: 403 });
      }

      const cachedResponse = await caches.match(event.request);
      const fetchPromise = (async () => {
        try {
          const networkResponse = await fetch(event.request);
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            const cache = await caches.open(CACHE_NAME);
            cache.put(event.request, responseClone);
          }
          return networkResponse;
        } catch {
          return cachedResponse;
        }
      })();

      return cachedResponse || (await fetchPromise);
    })()
  );
});
