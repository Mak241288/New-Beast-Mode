import { useEffect, useRef, useState } from 'react';

/**
 * Keeps the mobile/desktop screen awake during active gym workouts
 * using the standard Screen Wake Lock API, with automatic re-acquisition
 * when the user switches back to the browser tab.
 */
export function useWakeLock(enabled: boolean): { isActive: boolean; isSupported: boolean } {
  const sentinelRef = useRef<WakeLockSentinel | null>(null);
  const [isActive, setIsActive] = useState(false);

  const isSupported =
    typeof navigator !== 'undefined' &&
    'wakeLock' in navigator &&
    typeof navigator.wakeLock?.request === 'function';

  useEffect(() => {
    if (!isSupported || !enabled) {
      if (sentinelRef.current && !sentinelRef.current.released) {
        sentinelRef.current.release().catch(() => {});
        sentinelRef.current = null;
      }
      setIsActive(false);
      return;
    }

    let cancelled = false;

    const acquire = async () => {
      try {
        if (!navigator.wakeLock || document.visibilityState !== 'visible') return;
        const sentinel = await navigator.wakeLock.request('screen');
        if (cancelled) {
          await sentinel.release().catch(() => {});
          return;
        }
        sentinelRef.current = sentinel;
        setIsActive(true);
        sentinel.addEventListener('release', () => {
          if (!cancelled) setIsActive(false);
        });
      } catch {
        if (!cancelled) setIsActive(false);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enabled) {
        acquire();
      }
    };

    acquire();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (sentinelRef.current && !sentinelRef.current.released) {
        sentinelRef.current.release().catch(() => {});
        sentinelRef.current = null;
      }
      setIsActive(false);
    };
  }, [enabled, isSupported]);

  return { isActive, isSupported };
}
