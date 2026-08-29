import { idbStore } from './idbStore';

/**
 * BeastMode Multi-Tier Instant Cache Store (RAM + IndexedDB + LocalStorage)
 * - Tier 1: 0ms Instant In-Memory RAM Cache
 * - Tier 2: Unlimited Non-Blocking IndexedDB for Heavy Datasets (e.g. Exercise Catalog)
 * - Tier 3: Lightweight LocalStorage with Auto-Quota Protection & Eviction
 */

const CACHE_PREFIX = 'beast_cache_';
const LARGE_KEYS = new Set(['library_tree_flat', 'exercises_flat', 'exercise_catalog']);

// In-Memory RAM Cache for 0ms synchronous access
const ramCache = new Map<string, { data: any; timestamp: number }>();

// Purge legacy oversized keys from localStorage on startup to restore 5MB quota
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem(CACHE_PREFIX + 'library_tree_flat');
    localStorage.removeItem(CACHE_PREFIX + 'exercises_flat');
    localStorage.removeItem(CACHE_PREFIX + 'exercise_catalog');
  } catch {}
}

export const cacheStore = {
  get<T>(key: string): T | null {
    // 1. Check ultra-fast in-memory RAM cache first
    const inRam = ramCache.get(key);
    if (inRam !== undefined) {
      return inRam.data as T;
    }

    // 2. Large keys are never in localStorage
    if (LARGE_KEYS.has(key)) {
      return null;
    }

    // 3. Check LocalStorage for lightweight keys
    try {
      const raw = localStorage.getItem(CACHE_PREFIX + key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      ramCache.set(key, { data: parsed.data, timestamp: parsed.timestamp || Date.now() });
      return parsed.data as T;
    } catch {
      return null;
    }
  },

  set<T>(key: string, data: T): void {
    // 1. Always update in-memory RAM cache for 0ms access
    ramCache.set(key, { data, timestamp: Date.now() });

    // 2. Route large items (e.g. 4,200+ exercise catalog) to IndexedDB
    if (LARGE_KEYS.has(key)) {
      idbStore.set(key, data).catch(() => {});
      return;
    }

    // 3. Lightweight items go to LocalStorage with quota protection
    try {
      const payload = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(payload));
    } catch (err: any) {
      console.warn(`[CacheStore] Quota handling triggered on key "${key}", performing smart cleanup...`);
      cacheStore.pruneStaleStorage();

      // Retry once after pruning
      try {
        const payload = { data, timestamp: Date.now() };
        localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(payload));
      } catch (retryErr) {
        console.warn(`[CacheStore] Retained in memory only for "${key}":`, retryErr);
      }
    }
  },

  remove(key: string): void {
    ramCache.delete(key);
    if (LARGE_KEYS.has(key)) {
      idbStore.del(key).catch(() => {});
    }
    try {
      localStorage.removeItem(CACHE_PREFIX + key);
    } catch {}
  },

  clearAll(): void {
    ramCache.clear();
    idbStore.clear().catch(() => {});
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith(CACHE_PREFIX) || k.startsWith('recovery_log_'))) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch {}
  },

  /**
   * Smart Eviction: Frees up localStorage quota by removing obsolete or non-critical cache items
   */
  pruneStaleStorage(): void {
    try {
      const candidateKeys: Array<{ key: string; timestamp: number }> = [];

      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k) continue;

        // Immediately remove any accidental large keys
        if (k.includes('library_tree') || k.includes('exercises_flat')) {
          localStorage.removeItem(k);
          continue;
        }

        if (k.startsWith(CACHE_PREFIX)) {
          try {
            const raw = localStorage.getItem(k);
            if (raw) {
              const parsed = JSON.parse(raw);
              candidateKeys.push({ key: k, timestamp: parsed.timestamp || 0 });
            }
          } catch {
            localStorage.removeItem(k);
          }
        }
      }

      // Sort oldest to newest and remove the oldest 30% of cache items
      candidateKeys.sort((a, b) => a.timestamp - b.timestamp);
      const itemsToEvict = Math.ceil(candidateKeys.length * 0.3);
      for (let j = 0; j < itemsToEvict; j++) {
        if (candidateKeys[j] && !candidateKeys[j].key.includes('active_plan')) {
          localStorage.removeItem(candidateKeys[j].key);
        }
      }
    } catch (e) {
      console.warn('[CacheStore] Error during prune:', e);
    }
  },

  /**
   * Stale-While-Revalidate Execution
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
