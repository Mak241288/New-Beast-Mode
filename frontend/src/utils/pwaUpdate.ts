/**
 * BeastMode PWA Auto-Update & ServiceWorker Manager
 * Ensures zero stale-cache issues, automatic client claims, and seamless updates.
 */

let isRefreshing = false;

export function registerAutoUpdateServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  // Bypass on local development to avoid conflicting with Vite HMR
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const reg of registrations) {
        reg.unregister();
      }
    });
    return;
  }

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('[PWA] Service Worker registered with scope:', registration.scope);

      // 1. If an updated worker is already waiting, tell it to skip waiting immediately
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }

      // 2. Listen for newly discovered Service Worker versions
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[PWA] New version discovered! Activating immediately...');
            newWorker.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      });

      // 3. Check for deployment updates periodically & on tab focus
      setInterval(() => {
        registration.update().catch(() => {});
      }, 60 * 1000); // Check every 60 seconds

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          registration.update().catch(() => {});
        }
      });
    } catch (err) {
      console.warn('[PWA] ServiceWorker registration skipped:', err);
    }
  });

  // 4. Auto-refresh page once new ServiceWorker takes control
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (isRefreshing) return;
    isRefreshing = true;
    console.log('[PWA] ServiceWorker updated. Reloading app to apply latest version...');
    window.location.reload();
  });
}
