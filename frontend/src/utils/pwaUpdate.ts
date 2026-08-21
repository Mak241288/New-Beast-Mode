/**
 * BeastMode PWA ServiceWorker Manager
 * Ensures reliable caching and offline performance without annoying auto-reloads.
 */

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

      // Listen for updates quietly in the background without forcing page reloads
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('[PWA] New version ready for next clean launch.');
          }
        });
      });
    } catch (err) {
      console.warn('[PWA] ServiceWorker registration skipped:', err);
    }
  });

  // Do NOT force window.location.reload() on controllerchange to protect active workouts & form inputs
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('[PWA] ServiceWorker controller updated in background.');
  });
}
