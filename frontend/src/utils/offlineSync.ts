/**
 * Offline Gym Session Persistence & FIFO Auto-Sync Queue Manager
 * Saves active workout progress (completed sets, timer, weights) to LocalStorage
 * and auto-syncs with backend/Supabase via unique UUID-tagged queue items upon reconnection.
 */

const STORAGE_KEY = 'beastmode_active_gym_session';
const FIFO_QUEUE_KEY = 'beastmode_offline_sync_queue_v2';

export interface ActiveGymSession {
  workoutId: number | string;
  dayTitle: string;
  completedExerciseIds: (number | string)[];
  timerSeconds: number;
  lastUpdated: string;
  weightsLogged: { [exerciseId: string]: string };
}

export interface OfflineActionItem {
  id: string;
  type: 'LOG_WORKOUT' | 'COMPLETE_DAY' | 'SAVE_RECOVERY' | 'UPDATE_PROFILE' | 'SYNC_DATA';
  payload: any;
  timestamp: number;
  retryCount: number;
}

// Generate unique UUID safely on both secure/non-secure contexts
export const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {}
  }
  return 'bm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
};

// ==========================================
// 1. ACTIVE WORKOUT PERSISTENCE
// ==========================================

export const saveOfflineWorkoutState = (session: ActiveGymSession): void => {
  try {
    const payload = {
      ...session,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.error('[OfflineSync] Failed to save offline workout state:', err);
  }
};

export const getOfflineWorkoutState = (): ActiveGymSession | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ActiveGymSession;
  } catch (err) {
    console.error('[OfflineSync] Failed to read offline workout state:', err);
    return null;
  }
};

export const clearOfflineWorkoutState = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('[OfflineSync] Failed to clear offline workout state:', err);
  }
};

// ==========================================
// 2. FIFO SYNC QUEUE WITH UUID DEDUPLICATION
// ==========================================

export const getOfflineQueue = (): OfflineActionItem[] => {
  try {
    const raw = localStorage.getItem(FIFO_QUEUE_KEY);
    if (!raw) return [];
    const items = JSON.parse(raw);
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
};

export const enqueueOfflineAction = (type: OfflineActionItem['type'], payload: any): string => {
  const queue = getOfflineQueue();
  const id = generateUUID();
  const newItem: OfflineActionItem = {
    id,
    type,
    payload,
    timestamp: Date.now(),
    retryCount: 0,
  };

  queue.push(newItem);
  try {
    localStorage.setItem(FIFO_QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // Storage quota fallback: retain latest 50 items
    if (queue.length > 50) {
      const trimmed = queue.slice(-50);
      try {
        localStorage.setItem(FIFO_QUEUE_KEY, JSON.stringify(trimmed));
      } catch {}
    }
  }

  return id;
};

export const dequeueOfflineAction = (id: string): void => {
  const queue = getOfflineQueue();
  const filtered = queue.filter(item => item.id !== id);
  try {
    localStorage.setItem(FIFO_QUEUE_KEY, JSON.stringify(filtered));
  } catch {}
};

/**
 * Process and drain all pending offline items in strict FIFO order
 */
export const drainOfflineQueue = async (
  processor: (item: OfflineActionItem) => Promise<boolean>
): Promise<number> => {
  const queue = getOfflineQueue();
  if (queue.length === 0) return 0;

  let processedCount = 0;
  const remaining: OfflineActionItem[] = [];

  for (const item of queue) {
    try {
      const success = await processor(item);
      if (success) {
        processedCount++;
      } else {
        item.retryCount += 1;
        if (item.retryCount < 5) {
          remaining.push(item);
        }
      }
    } catch {
      item.retryCount += 1;
      if (item.retryCount < 5) {
        remaining.push(item);
      }
    }
  }

  try {
    localStorage.setItem(FIFO_QUEUE_KEY, JSON.stringify(remaining));
  } catch {}

  return processedCount;
};

// ==========================================
// 3. NETWORK RECONNECTION LISTENER
// ==========================================

export const initOfflineSync = (
  onReconnectedAndSync: (session: ActiveGymSession | null, queue: OfflineActionItem[]) => void
): (() => void) => {
  const handleOnline = () => {
    console.log('[OfflineSync] Network reconnected! Triggering FIFO queue drain & session sync...');
    const savedSession = getOfflineWorkoutState();
    const queue = getOfflineQueue();
    onReconnectedAndSync(savedSession, queue);
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('online', handleOnline);
  }

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', handleOnline);
    }
  };
};
