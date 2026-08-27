/**
 * BeastMode PWA ServiceWorker Manager
 * Ensures reliable caching, offline performance, and elegant user-controlled updates via skipWaiting.
 */

let waitingServiceWorker: ServiceWorker | null = null;

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

      // Check if a worker is already waiting
      if (registration.waiting) {
        waitingServiceWorker = registration.waiting;
        window.dispatchEvent(new CustomEvent('beast_pwa_update_available'));
      }

      // Listen for updates in the background
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            waitingServiceWorker = newWorker;
            console.log('[PWA] New version ready! Dispatching update notification event.');
            window.dispatchEvent(new CustomEvent('beast_pwa_update_available'));
          }
        });
      });
    } catch (err) {
      console.warn('[PWA] ServiceWorker registration skipped:', err);
    }
  });

  // Smooth controller change handler
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('[PWA] ServiceWorker controller updated.');
  });
}

/**
 * Triggers skipWaiting on the waiting service worker and smoothly refreshes the app.
 */
export function triggerPwaUpdate() {
  if (waitingServiceWorker) {
    waitingServiceWorker.postMessage({ type: 'SKIP_WAITING' });
    setTimeout(() => {
      window.location.reload();
    }, 300);
    return;
  }

  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg?.waiting) {
        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      setTimeout(() => {
        window.location.reload();
      }, 300);
    });
  }
}

