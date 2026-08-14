const CACHE_NAME = 'beastmode-cache-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('[Service Worker] Non-fatal cache pre-fetch error:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event (Network first, safe fallback)
self.addEventListener('fetch', (event) => {
  // Only cache GET requests
  if (event.request.method !== 'GET') return;
  
  const url = event.request.url;

  // Skip API requests and Vite dev server requests
  if (
    url.includes('/api/') || 
    url.includes('/@vite/') || 
    url.includes('/@fs/') || 
    url.includes('/node_modules/') ||
    url.includes('?t=') ||
    url.includes('.hot-update.')
  ) {
    return;
  }

  // Handle standard resources
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Only cache valid 200 responses
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        // If navigating to an HTML page and offline, serve cached root
        if (event.request.mode === 'navigate') {
          return (await caches.match('/index.html')) || (await caches.match('/'));
        }
        return new Response('Network Error / Offline', { status: 503, statusText: 'Offline' });
      })
  );
});

// Push Event - Handles server-pushed notifications
self.addEventListener('push', (event) => {
  let data = {
    title: 'BeastMode AI 🏋️‍♂️',
    body: 'حان وقت تدريبك اليومي! جهز نفسك لبناء عضلاتك.',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: 'workout-reminder',
    url: '/'
  };

  if (event.data) {
    try {
      data = Object.assign(data, event.data.json());
    } catch (e) {
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/favicon.svg',
      badge: data.badge || '/favicon.svg',
      tag: data.tag || 'workout-reminder',
      data: { url: data.url || '/' },
      vibrate: [200, 100, 200],
      actions: [
        { action: 'open_plan', title: 'افتح الجدول ⚡' },
        { action: 'dismiss', title: 'لاحقاً' }
      ]
    })
  );
});

// Notification Click Event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
