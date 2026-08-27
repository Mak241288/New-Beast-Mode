import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { 
  generateUUID, 
  enqueueOfflineAction, 
  getOfflineQueue, 
  drainOfflineQueue,
  saveOfflineWorkoutState,
  getOfflineWorkoutState,
  clearOfflineWorkoutState
} from '../utils/offlineSync';
import { wakeLockManager } from '../utils/wakeLock';
import { audioCues } from '../utils/audioCues';
import { EXERCISES_CACHE_VERSION } from '../services/api';

// Polyfill localStorage & window for headless test environment
beforeAll(() => {
  if (typeof globalThis.localStorage === 'undefined') {
    let store: { [key: string]: string } = {};
    globalThis.localStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = String(value); },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { store = {}; },
      key: (_i: number) => null,
      length: 0,
    } as Storage;
  }
});

describe('QA/QC Hardening & Gym Hardware Utilities', () => {
  beforeEach(() => {
    globalThis.localStorage?.clear();
  });

  describe('1. FIFO Offline Sync Queue & UUIDs', () => {
    it('should generate valid, distinct UUID identifiers', () => {
      const id1 = generateUUID();
      const id2 = generateUUID();
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
    });

    it('should maintain strict FIFO ordering for enqueued offline actions', async () => {
      const id1 = enqueueOfflineAction('LOG_WORKOUT', { title: 'Chest Day', volumeKg: 5000 });
      const id2 = enqueueOfflineAction('COMPLETE_DAY', { dayId: 1 });
      const id3 = enqueueOfflineAction('SAVE_RECOVERY', { date: '2026-08-27', score: 85 });

      const queue = getOfflineQueue();
      expect(queue.length).toBe(3);
      expect(queue[0].id).toBe(id1);
      expect(queue[1].id).toBe(id2);
      expect(queue[2].id).toBe(id3);

      const processedIds: string[] = [];
      const drainedCount = await drainOfflineQueue(async (item) => {
        processedIds.push(item.id);
        return true;
      });

      expect(drainedCount).toBe(3);
      expect(processedIds).toEqual([id1, id2, id3]);
      expect(getOfflineQueue().length).toBe(0);
    });

    it('should persist and retrieve active offline gym workout sessions', () => {
      const session = {
        workoutId: 101,
        dayTitle: 'Hypertrophy Legs',
        completedExerciseIds: [1, 2, 3],
        timerSeconds: 1800,
        lastUpdated: new Date().toISOString(),
        weightsLogged: { '1': '100 kg', '2': '120 kg' },
      };

      saveOfflineWorkoutState(session);
      const retrieved = getOfflineWorkoutState();
      expect(retrieved).not.toBeNull();
      expect(retrieved?.workoutId).toBe(101);
      expect(retrieved?.weightsLogged['1']).toBe('100 kg');

      clearOfflineWorkoutState();
      expect(getOfflineWorkoutState()).toBeNull();
    });
  });

  describe('2. Device Hardware & Gym APIs (Safe Execution on All Platforms)', () => {
    it('should safely execute wakeLockManager methods without throwing on desktop or unsupported environments', async () => {
      const result = await wakeLockManager.requestLock();
      expect(typeof result).toBe('boolean');
      await expect(wakeLockManager.releaseLock()).resolves.toBeUndefined();
    });

    it('should trigger tactical haptics without throwing when navigator.vibrate is unavailable', () => {
      expect(() => audioCues.triggerHaptic('tick')).not.toThrow();
      expect(() => audioCues.triggerHaptic('setDone')).not.toThrow();
      expect(() => audioCues.triggerHaptic('restEnd')).not.toThrow();
      expect(() => audioCues.triggerHaptic('fanfare')).not.toThrow();
    });

    it('should toggle audio and haptics preferences persistently', () => {
      const initialMute = audioCues.getMuted();
      const newMute = audioCues.toggleMute();
      expect(newMute).toBe(!initialMute);
      expect(audioCues.getMuted()).toBe(newMute);
      // restore
      audioCues.toggleMute();
    });
  });

  describe('3. Cache Versioning System', () => {
    it('should have a defined EXERCISES_CACHE_VERSION string', () => {
      expect(typeof EXERCISES_CACHE_VERSION).toBe('string');
      expect(EXERCISES_CACHE_VERSION.length).toBeGreaterThan(0);
      expect(EXERCISES_CACHE_VERSION).toContain('bm_exercises');
    });
  });

  describe('4. Multi-Device Concurrency & Optimistic 3-Way Merge', () => {
    it('should perform optimistic set-level merging when two devices sync concurrently', async () => {
      const { mergeWorkoutSessions } = await import('../context/WorkoutSessionContext');

      const localSession: any = {
        status: 'active',
        dayData: { id: 1, title: 'Push Day' },
        activeExerciseIndex: 0,
        currentSetIndex: 1,
        startTimestamp: 1000,
        lastUpdatedTimestamp: 1500,
        setLogs: {
          0: [
            { clientSideId: 'set-1', setNumber: 1, reps: 10, weight: '80 kg', completed: true, updatedAt: '2026-08-27T10:00:00Z' },
            { clientSideId: 'set-2', setNumber: 2, reps: 10, weight: '85 kg', completed: false, updatedAt: '2026-08-27T10:01:00Z' },
          ],
        },
      };

      // Remote device finished set-2 with 90 kg at a newer timestamp
      const remoteSession: any = {
        status: 'active',
        dayData: { id: 1, title: 'Push Day' },
        activeExerciseIndex: 0,
        currentSetIndex: 2,
        startTimestamp: 1000,
        lastUpdatedTimestamp: 2000,
        setLogs: {
          0: [
            { clientSideId: 'set-1', setNumber: 1, reps: 10, weight: '80 kg', completed: true, updatedAt: '2026-08-27T10:00:00Z' },
            { clientSideId: 'set-2', setNumber: 2, reps: 10, weight: '90 kg', completed: true, updatedAt: '2026-08-27T10:03:00Z' },
            { clientSideId: 'set-3', setNumber: 3, reps: 8, weight: '95 kg', completed: false, updatedAt: '2026-08-27T10:03:30Z' },
          ],
        },
      };

      const merged = mergeWorkoutSessions(localSession, remoteSession);

      expect(merged.setLogs[0].length).toBe(3);
      // Set 2 should have remote's updated weight and completed status
      expect(merged.setLogs[0][1].weight).toBe('90 kg');
      expect(merged.setLogs[0][1].completed).toBe(true);
      // Set 3 added from remote should be preserved
      expect(merged.setLogs[0][2].weight).toBe('95 kg');
    });
  });
});
