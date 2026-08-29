/**
 * BeastMode High-Performance IndexedDB Storage Engine
 * Provides unlimited, non-blocking asynchronous storage for large datasets
 * (e.g. 4,200+ exercise catalog, offline assets, transformation images)
 * without hitting the strict 5MB browser localStorage quota.
 */

const DB_NAME = 'BeastModeDB';
const DB_VERSION = 1;
const STORE_NAME = 'app_store';

// Fallback in-memory map for environments where IndexedDB is unavailable or restricted
const memoryFallback = new Map<string, any>();

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.reject(new Error('IndexedDB is not available'));
  }

  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        };

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          console.warn('[IndexedDB] Open request failed, using memory fallback:', request.error);
          reject(request.error);
        };
      } catch (err) {
        reject(err);
      }
    });
  }

  return dbPromise;
}

export const idbStore = {
  /**
   * Retrieve an item from IndexedDB with graceful fallback
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const db = await getDB();
      return new Promise<T | null>((resolve) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);

        request.onsuccess = () => {
          resolve((request.result as T) ?? null);
        };

        request.onerror = () => {
          resolve(memoryFallback.get(key) ?? null);
        };
      });
    } catch {
      return (memoryFallback.get(key) as T) ?? null;
    }
  },

  /**
   * Store an item in IndexedDB (supports multi-megabyte payloads)
   */
  async set<T>(key: string, value: T): Promise<void> {
    memoryFallback.set(key, value);
    try {
      const db = await getDB();
      return new Promise<void>((resolve) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(value, key);

        request.onsuccess = () => resolve();
        request.onerror = () => {
          console.warn(`[IndexedDB] Failed saving key "${key}":`, request.error);
          resolve(); // Resolve gracefully to prevent crashing
        };
        transaction.onabort = () => resolve();
      });
    } catch (err) {
      console.warn(`[IndexedDB] Set exception for key "${key}":`, err);
    }
  },

  /**
   * Delete an item from IndexedDB
   */
  async del(key: string): Promise<void> {
    memoryFallback.delete(key);
    try {
      const db = await getDB();
      return new Promise<void>((resolve) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(key);
        request.onsuccess = () => resolve();
        request.onerror = () => resolve();
      });
    } catch {}
  },

  /**
   * Clear all items in the store
   */
  async clear(): Promise<void> {
    memoryFallback.clear();
    try {
      const db = await getDB();
      return new Promise<void>((resolve) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => resolve();
      });
    } catch {}
  }
};
