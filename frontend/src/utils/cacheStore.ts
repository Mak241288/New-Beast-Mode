/**
 * BeastMode Instant Cache Store (SWR - Stale-While-Revalidate)
 * Provides 0ms instant data rendering with silent background synchronization.
 */

const CACHE_PREFIX = 'beast_cache_';

export const cacheStore = {
  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(CACHE_PREFIX + key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed.data as T;
    } catch {
      return null;
    }
  },

  set<T>(key: string, data: T): void {
    try {
      const payload = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(payload));
    } catch (e) {
      console.warn('[CacheStore] Storage quota exceeded, clearing stale items');
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(CACHE_PREFIX + key);
    } catch {}
  },

  clearAll(): void {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(CACHE_PREFIX)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch {}
  },

  /**
   * Stale-While-Revalidate Execution
   * Immediately delivers cached data if available, then fetches fresh data silently in background.
   */
  async swr<T>(
    key: string,
    fetcher: () => Promise<T>,
    onUpdate: (data: T, fromCache: boolean) => void
  ): Promise<T> {
    const cached = cacheStore.get<T>(key);
    if (cached !== null) {
      onUpdate(cached, true);
    }

    try {
      const fresh = await fetcher();
      cacheStore.set(key, fresh);
      onUpdate(fresh, false);
      return fresh;
    } catch (err) {
      if (cached !== null) {
        return cached;
      }
      throw err;
    }
  },
};
