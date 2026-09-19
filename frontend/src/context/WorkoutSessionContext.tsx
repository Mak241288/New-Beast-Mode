import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { cacheStore } from '../utils/cacheStore';
import { audioCues } from '../utils/audioCues';
import { wakeLockManager } from '../utils/wakeLock';
import { generateUUID } from '../utils/offlineSync';
import { triggerHaptic } from '../utils/haptics';
import { preloadWorkoutImages } from '../utils/imagePreloader';
import { getExerciseHistoryAndSuggestion, saveExerciseCompletionRecord } from '../utils/progressiveOverload';

export type SessionStatus = 'idle' | 'active' | 'resting' | 'paused' | 'completed';

export interface SetLogItem {
  clientSideId: string; // Unique UUID per set for granular cross-device concurrency
  setNumber: number;
  reps: number | string;
  weight: number | string;
  completed: boolean;
  completedAt?: string;
  updatedAt: string; // ISO timestamp for Last-Write-Wins optimistic merge
  rpe?: number;
}

export interface WorkoutSessionState {
  status: SessionStatus;
  dayData: any | null;
  activeExerciseIndex: number;
  currentSetIndex: number;
  setLogs: { [exerciseIndex: number]: SetLogItem[] };
  // Timing
  startTimestamp: number | null;
  totalElapsedSeconds: number;
  isPaused: boolean;
  pausedAtTimestamp: number | null;
  totalPausedDurationMs: number;
  lastUpdatedTimestamp?: number;
  
  // Rest timer
  isResting: boolean;
  restTargetTimestamp: number | null;
  restTotalDuration: number;
  restRemainingSeconds: number;
  isRestPaused: boolean;
  restPausedRemainingSeconds: number;
  pendingNextExerciseIndex?: number | null;

  // UI state
  isMinimized: boolean;
  isPlayerOpen: boolean;
  showSummaryModal: boolean;
  summaryData: any | null;
}

interface WorkoutSessionContextType {
  state: WorkoutSessionState;
  startSession: (dayData: any) => void;
  finishCurrentSet: (customValues?: { reps?: string | number; weight?: string | number }) => void;
  updateSetLog: (exerciseIndex: number, setIndex: number, updates: Partial<SetLogItem>) => void;
  addNewSet: (exerciseIndex: number) => void;
  removeSet: (exerciseIndex: number, setIndex: number) => void;
  skipRest: () => void;
  addRestSeconds: (seconds: number) => void;
  togglePauseRestTimer: () => void;
  togglePauseWorkout: () => void;
  nextExercise: () => void;
  prevExercise: () => void;
  selectExercise: (index: number) => void;
  swapExercise: (exerciseIndex: number, newExercise: any) => void;
  minimizePlayer: () => void;
  maximizePlayer: () => void;
  finishWorkoutSession: () => Promise<void>;
  discardSession: () => void;
  closeSummaryModal: () => void;
  restoreSavedDraftIfExists: () => boolean;
  hasSavedDraft: boolean;
}

const STORAGE_KEY = 'beast_active_workout_session_v2';

const initialState: WorkoutSessionState = {
  status: 'idle',
  dayData: null,
  activeExerciseIndex: 0,
  currentSetIndex: 0,
  setLogs: {},
  startTimestamp: null,
  totalElapsedSeconds: 0,
  isPaused: false,
  pausedAtTimestamp: null,
  totalPausedDurationMs: 0,
  isResting: false,
  restTargetTimestamp: null,
  restTotalDuration: 60,
  restRemainingSeconds: 0,
  isRestPaused: false,
  restPausedRemainingSeconds: 0,
  pendingNextExerciseIndex: null,
  isMinimized: false,
  isPlayerOpen: false,
  showSummaryModal: false,
  summaryData: null,
};

const WorkoutSessionContext = createContext<WorkoutSessionContextType | null>(null);

// Granular Set-Level Optimistic 3-Way Merge Function (Multi-Device Concurrency)
export function mergeWorkoutSessions(
  local: WorkoutSessionState,
  remote: any
): WorkoutSessionState {
  if (!remote || !remote.dayData) return local;

  // If local is idle/completed and remote is active, load remote
  if (local.status === 'idle' || local.status === 'completed') {
    return {
      ...remote,
      isMinimized: true,
      isPlayerOpen: false,
    };
  }

  // If remote is idle or completed while local is actively training, retain local active progress
  if (remote.status === 'idle' || remote.status === 'completed') {
    return local;
  }

  // Both local and remote are active/resting/paused: Perform granular set-level optimistic 3-way merge
  const mergedSetLogs: { [exerciseIndex: number]: SetLogItem[] } = { ...local.setLogs };
  const remoteSetLogs: { [exerciseIndex: number]: SetLogItem[] } = remote.setLogs || {};

  const allExerciseIndices = new Set([
    ...Object.keys(local.setLogs).map(Number),
    ...Object.keys(remoteSetLogs).map(Number),
  ]);

  allExerciseIndices.forEach(exIdx => {
    const localSets = local.setLogs[exIdx] || [];
    const remoteSets = remoteSetLogs[exIdx] || [];

    const mergedSets: SetLogItem[] = [];
    const maxLen = Math.max(localSets.length, remoteSets.length);

    for (let sIdx = 0; sIdx < maxLen; sIdx++) {
      const localSet = localSets[sIdx];
      const remoteSet = remoteSets[sIdx];

      if (localSet && remoteSet) {
        // Compare updatedAt timestamps for last-write-wins per set
        const localTime = localSet.updatedAt ? new Date(localSet.updatedAt).getTime() : 0;
        const remoteTime = remoteSet.updatedAt ? new Date(remoteSet.updatedAt).getTime() : 0;

        if (remoteTime > localTime || (!localSet.completed && remoteSet.completed)) {
          mergedSets.push({
            ...remoteSet,
            clientSideId: remoteSet.clientSideId || localSet.clientSideId || generateUUID(),
          });
        } else {
          mergedSets.push(localSet);
        }
      } else if (localSet) {
        mergedSets.push(localSet);
      } else if (remoteSet) {
        mergedSets.push(remoteSet);
      }
    }

    mergedSetLogs[exIdx] = mergedSets;
  });

  const remoteIsNewer = (remote.lastUpdatedTimestamp || 0) > (local.lastUpdatedTimestamp || local.startTimestamp || 0);

  return {
    ...local,
    setLogs: mergedSetLogs,
    activeExerciseIndex: remoteIsNewer ? (remote.activeExerciseIndex ?? local.activeExerciseIndex) : local.activeExerciseIndex,
    currentSetIndex: remoteIsNewer ? (remote.currentSetIndex ?? local.currentSetIndex) : local.currentSetIndex,
    lastUpdatedTimestamp: Date.now(),
  };
}

export const WorkoutSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<WorkoutSessionState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && (parsed.status === 'active' || parsed.status === 'resting' || parsed.status === 'paused')) {
          return {
            ...parsed,
            isMinimized: true, // Start minimized if restoring
            isPlayerOpen: false,
          };
        }
      }
    } catch {
      // Ignore
    }
    return initialState;
  });

  const [hasSavedDraft, setHasSavedDraft] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return !!(parsed && parsed.status && parsed.status !== 'idle' && parsed.status !== 'completed');
      }
    } catch {
      // Ignore
    }
    return false;
  });

  const stateRef = useRef(state);
  stateRef.current = state;
  const cloudSyncDebounceTimerRef = useRef<any>(null);

  // Play audio beep
  const playBeep = useCallback((freq = 880, duration = 0.15) => {
    audioCues.playBeep(freq, duration);
  }, []);

  // Auto Screen Wake Lock Engine (Prevents phone/tablet screen sleep during active gym sessions)
  useEffect(() => {
    if (state.status === 'active' || state.status === 'resting' || state.status === 'paused') {
      wakeLockManager.requestLock();
    } else {
      wakeLockManager.releaseLock();
    }
  }, [state.status]);

  // Save to LocalStorage & Cloud automatically whenever relevant session state changes
  useEffect(() => {
    if (state.status === 'active' || state.status === 'resting' || state.status === 'paused') {
      try {
        const payloadWithTime = { ...state, lastUpdatedTimestamp: Date.now() };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payloadWithTime));
        cacheStore.set('active_gym_session', payloadWithTime);
        setHasSavedDraft(true);

        // Debounce cloud push and realtime broadcast to batch rapid typing in set inputs
        if (cloudSyncDebounceTimerRef.current) {
          clearTimeout(cloudSyncDebounceTimerRef.current);
        }
        cloudSyncDebounceTimerRef.current = setTimeout(() => {
          api.pushUserDataToCloud().catch(err => console.warn('[WorkoutSessionContext] Cloud push error:', err));
          api.broadcastWorkoutSetUpdate(payloadWithTime).catch(err => console.warn('[WorkoutSessionContext] Broadcast error:', err));
        }, 1000);
      } catch (err) {
        console.warn('[WorkoutSessionContext] LocalStorage quota or save error:', err);
      }
    } else if (state.status === 'idle' || state.status === 'completed') {
      try {
        if (cloudSyncDebounceTimerRef.current) {
          clearTimeout(cloudSyncDebounceTimerRef.current);
        }
        localStorage.removeItem(STORAGE_KEY);
        cacheStore.remove('active_gym_session');
        setHasSavedDraft(false);
        api.pushUserDataToCloud().catch(err => console.warn('[WorkoutSessionContext] Cloud push on idle error:', err));
      } catch (err) {
        console.warn('[WorkoutSessionContext] Storage cleanup error:', err);
      }
    }

    return () => {
      if (cloudSyncDebounceTimerRef.current) {
        clearTimeout(cloudSyncDebounceTimerRef.current);
      }
    };
  }, [state.status, state.activeExerciseIndex, state.currentSetIndex, state.setLogs, state.isPaused, state.dayData]);

  // Bulletproof Mobile Lifecycle Persistence (Incoming Phone Calls, App Switcher, Tab Freezing)
  useEffect(() => {
    const persistCurrentSessionSync = () => {
      const currentState = stateRef.current;
      if (currentState && (currentState.status === 'active' || currentState.status === 'resting' || currentState.status === 'paused')) {
        try {
          const snapshot = { ...currentState, lastUpdatedTimestamp: Date.now() };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
          cacheStore.set('active_gym_session', snapshot);
        } catch {}
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        persistCurrentSessionSync();
      } else if (document.visibilityState === 'visible') {
        // Refresh draft status from storage if background updated it
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && (parsed.status === 'active' || parsed.status === 'resting' || parsed.status === 'paused')) {
              setHasSavedDraft(true);
            }
          }
        } catch {}
      }
    };

    window.addEventListener('pagehide', persistCurrentSessionSync);
    window.addEventListener('beforeunload', persistCurrentSessionSync);
    window.addEventListener('freeze', persistCurrentSessionSync);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('pagehide', persistCurrentSessionSync);
      window.removeEventListener('beforeunload', persistCurrentSessionSync);
      window.removeEventListener('freeze', persistCurrentSessionSync);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Listen for Cross-Device Session Restore & Live Realtime Concurrency
  useEffect(() => {
    const handleCloudRestore = (event?: any) => {
      const cloudSession: any = event?.detail || cacheStore.get('active_gym_session');
      if (cloudSession && (cloudSession.status === 'active' || cloudSession.status === 'resting' || cloudSession.status === 'paused')) {
        setState(prev => mergeWorkoutSessions(prev, cloudSession));
        setHasSavedDraft(true);
      }
    };

    // Initialize Supabase realtime channel listener
    let unsubscribeRealtime: (() => void) | undefined;
    try {
      unsubscribeRealtime = api.subscribeToRealtimeSync?.();
    } catch {}

    window.addEventListener('beast_cloud_synced', handleCloudRestore);
    return () => {
      window.removeEventListener('beast_cloud_synced', handleCloudRestore);
      try {
        unsubscribeRealtime?.();
      } catch (err) {
        console.warn('[WorkoutSessionContext] Realtime cleanup error:', err);
      }
    };
  }, []);

  // Master Elapsed Time & Rest Timer Engine (Anchored to Timestamps)
  useEffect(() => {
    if (state.status === 'idle' || state.status === 'completed') return;

    const interval = setInterval(() => {
      setState(prev => {
        if (prev.status === 'idle' || prev.status === 'completed') return prev;

        let newElapsed = prev.totalElapsedSeconds;
        if (!prev.isPaused && prev.startTimestamp) {
          const now = Date.now();
          const effectiveRunningMs = now - prev.startTimestamp - prev.totalPausedDurationMs;
          newElapsed = Math.max(0, Math.floor(effectiveRunningMs / 1000));
        }

        // Rest timer computation
        let newIsResting = prev.isResting;
        let newRestRemaining = prev.restRemainingSeconds;

        if (prev.isResting && !prev.isRestPaused && prev.restTargetTimestamp) {
          const msLeft = prev.restTargetTimestamp - Date.now();
          const secondsLeft = Math.ceil(msLeft / 1000);

          if (secondsLeft <= 0) {
            newIsResting = false;
            newRestRemaining = 0;
            playBeep(980, 0.25); // Ding when rest finishes!
            triggerHaptic('restEnd');

            let newActiveExIdx = prev.activeExerciseIndex;
            let newCurSetIdx = prev.currentSetIndex;
            if (prev.pendingNextExerciseIndex !== null && prev.pendingNextExerciseIndex !== undefined) {
              newActiveExIdx = prev.pendingNextExerciseIndex;
              newCurSetIdx = 0;
            }

            return {
              ...prev,
              totalElapsedSeconds: newElapsed,
              isResting: false,
              restRemainingSeconds: 0,
              activeExerciseIndex: newActiveExIdx,
              currentSetIndex: newCurSetIdx,
              pendingNextExerciseIndex: null,
              status: prev.isPaused ? 'paused' : 'active',
            };
          } else {
            if (secondsLeft === 3) {
              triggerHaptic('warning');
            }
            newRestRemaining = secondsLeft;
          }
        }

        return {
          ...prev,
          totalElapsedSeconds: newElapsed,
          isResting: newIsResting,
          restRemainingSeconds: newRestRemaining,
          status: newIsResting ? 'resting' : (prev.isPaused ? 'paused' : 'active'),
        };
      });
    }, 500);

    return () => clearInterval(interval);
  }, [state.status, playBeep]);

  // Actions
  const startSession = useCallback((dayData: any) => {
    if (!dayData || !dayData.exercises || dayData.exercises.length === 0) {
      alert('لا توجد تمارين مضافة في هذا اليوم التدريبي.');
      return;
    }

    // 1. Gym Mode: Request screen wake lock & preload today's exercise assets
    wakeLockManager.requestLock();
    preloadWorkoutImages(dayData.exercises || []);
    triggerHaptic('success');

    // 2. Initialize set logs with smart progressive overload history
    const initialLogs: { [idx: number]: SetLogItem[] } = {};
    dayData.exercises.forEach((ex: any, idx: number) => {
      const totalSets = typeof ex.sets === 'number' ? ex.sets : parseInt(String(ex.sets || 3), 10) || 3;
      let cleanReps = String(ex.reps || '10-12').trim();
      const lowerR = cleanReps.toLowerCase();
      if (lowerR === 'chest' || lowerR === 'back' || lowerR === 'shoulders' || lowerR === 'quadriceps' || lowerR === 'biceps' || lowerR === 'triceps' || lowerR === 'abs' || lowerR === 'glutes' || lowerR === 'hamstrings' || lowerR === 'calves' || lowerR === 'صدر' || lowerR === 'ظهر') {
        cleanReps = ex.isTimed ? '45s' : '10-12';
      }
      let cleanWeight = String(ex.weight || '').trim();
      if (!cleanWeight || cleanWeight.toLowerCase() === 'weight') {
        cleanWeight = (ex.equipment_en?.toLowerCase().includes('body') || ex.weight?.toLowerCase()?.includes('body')) ? 'Bodyweight' : '15 kg';
      }

      // Auto-fetch last lifted performance from history
      const historyRecord = getExerciseHistoryAndSuggestion(ex.name || ex.name_en, cleanWeight, cleanReps);
      const assignedWeight = historyRecord.lastWeight || cleanWeight;
      const assignedReps = historyRecord.lastReps || cleanReps;

      initialLogs[idx] = Array.from({ length: totalSets }, (_, sIdx) => ({
        clientSideId: generateUUID(),
        setNumber: sIdx + 1,
        reps: assignedReps,
        weight: assignedWeight,
        completed: false,
        updatedAt: new Date().toISOString(),
      }));
    });

    const now = Date.now();
    setState({
      status: 'active',
      dayData,
      activeExerciseIndex: 0,
      currentSetIndex: 0,
      setLogs: initialLogs,
      startTimestamp: now,
      totalElapsedSeconds: 0,
      isPaused: false,
      pausedAtTimestamp: null,
      totalPausedDurationMs: 0,
      lastUpdatedTimestamp: now,
      isResting: false,
      restTargetTimestamp: null,
      restTotalDuration: 60,
      restRemainingSeconds: 0,
      isRestPaused: false,
      restPausedRemainingSeconds: 0,
      isMinimized: false,
      isPlayerOpen: true,
      showSummaryModal: false,
      summaryData: null,
    });
  }, []);

  const finishCurrentSet = useCallback((customValues?: { reps?: string | number; weight?: string | number }) => {
    // Tactile haptic feedback on set completion
    triggerHaptic('medium');

    setState(prev => {
      const exIdx = prev.activeExerciseIndex;
      const setIdx = prev.currentSetIndex;
      const currentLogs = prev.setLogs[exIdx] || [];
      const exercises = prev.dayData?.exercises || [];
      const currentEx = exercises[exIdx];
      
      const updatedSetLogs = [...currentLogs];
      const targetSet = updatedSetLogs[setIdx] || {
        clientSideId: generateUUID(),
        setNumber: setIdx + 1,
        reps: '10',
        weight: '10 kg',
        completed: false,
        updatedAt: new Date().toISOString(),
      };

      const finalWeight = customValues?.weight ?? targetSet.weight;
      const finalReps = customValues?.reps ?? targetSet.reps;

      // Persist exercise completion weight & reps for next session
      if (currentEx) {
        saveExerciseCompletionRecord(currentEx.name || currentEx.name_en, finalWeight, finalReps);
      }

      const nowIso = new Date().toISOString();
      updatedSetLogs[setIdx] = {
        ...targetSet,
        clientSideId: targetSet.clientSideId || generateUUID(),
        reps: finalReps,
        weight: finalWeight,
        completed: true,
        completedAt: nowIso,
        updatedAt: nowIso,
      };

      const newAllLogs = {
        ...prev.setLogs,
        [exIdx]: updatedSetLogs,
      };

      // Scientific Smart Rest Duration Recommender
      const getSmartRestSeconds = (ex: any): number => {
        if (ex?.restSeconds && typeof ex.restSeconds === 'number' && ex.restSeconds > 0) return ex.restSeconds;
        if (ex?.rest_seconds && typeof ex.rest_seconds === 'number' && ex.rest_seconds > 0) return ex.rest_seconds;
        const name = (ex?.name_en || ex?.name || '').toLowerCase();
        const muscle = (ex?.target_muscle_en || ex?.target_muscle || ex?.muscle || '').toLowerCase();
        if (name.includes('deadlift') || name.includes('squat') || name.includes('leg press') || name.includes('barbell row')) return 150;
        if (name.includes('bench press') || name.includes('overhead press') || name.includes('military press') || name.includes('pull up') || name.includes('dips')) return 120;
        if (muscle.includes('quad') || muscle.includes('hamstring') || muscle.includes('glute') || name.includes('lunge')) return 90;
        if (muscle.includes('biceps') || muscle.includes('triceps') || muscle.includes('calves') || muscle.includes('abs') || name.includes('lateral raise') || name.includes('fly')) return 60;
        return 90;
      };

      const restSeconds = getSmartRestSeconds(currentEx);

      // Determine next set or next exercise
      let nextSetIdx = setIdx + 1;
      let nextExIdx = exIdx;
      let isCompleted = false;

      // Smart Auto-Fill: Inherit weight & reps to next uncompleted set
      if (nextSetIdx < updatedSetLogs.length && updatedSetLogs[nextSetIdx] && !updatedSetLogs[nextSetIdx].completed) {
        const completedWeight = customValues?.weight ?? targetSet.weight;
        const completedReps = customValues?.reps ?? targetSet.reps;
        if (completedWeight) {
          updatedSetLogs[nextSetIdx] = {
            ...updatedSetLogs[nextSetIdx],
            weight: completedWeight,
            reps: completedReps || updatedSetLogs[nextSetIdx].reps,
          };
        }
      }

      let pendingNext: number | null = null;
      if (nextSetIdx >= updatedSetLogs.length) {
        // Exercise completed!
        if (exIdx + 1 < exercises.length) {
          nextExIdx = exIdx; // Keep on current exercise during rest so user can see what they completed
          pendingNext = exIdx + 1;
          nextSetIdx = updatedSetLogs.length - 1; // Highlight final completed set
        } else {
          // All exercises in day completed!
          isCompleted = true;
        }
      }

      if (isCompleted) {
        triggerHaptic('success');
        playBeep(1080, 0.35);
        return {
          ...prev,
          setLogs: newAllLogs,
          status: 'active',
          isResting: false,
          pendingNextExerciseIndex: null,
        };
      }

      const restTarget = Date.now() + restSeconds * 1000;

      return {
        ...prev,
        setLogs: newAllLogs,
        activeExerciseIndex: nextExIdx,
        currentSetIndex: nextSetIdx,
        pendingNextExerciseIndex: pendingNext,
        isResting: true,
        restTargetTimestamp: restTarget,
        restTotalDuration: restSeconds,
        restRemainingSeconds: restSeconds,
        isRestPaused: false,
        status: 'resting',
      };
    });
  }, []);

  const updateSetLog = useCallback((exerciseIndex: number, setIndex: number, updates: Partial<SetLogItem>) => {
    setState(prev => {
      const exerciseLogs = [...(prev.setLogs[exerciseIndex] || [])];
      if (!exerciseLogs[setIndex]) return prev;
      exerciseLogs[setIndex] = {
        ...exerciseLogs[setIndex],
        ...updates,
        clientSideId: exerciseLogs[setIndex].clientSideId || generateUUID(),
        updatedAt: new Date().toISOString(),
      };
      return {
        ...prev,
        setLogs: {
          ...prev.setLogs,
          [exerciseIndex]: exerciseLogs,
        },
      };
    });
  }, []);

  const addNewSet = useCallback((exerciseIndex: number) => {
    setState(prev => {
      const exerciseLogs = [...(prev.setLogs[exerciseIndex] || [])];
      const prevSet = exerciseLogs[exerciseLogs.length - 1];
      exerciseLogs.push({
        clientSideId: generateUUID(),
        setNumber: exerciseLogs.length + 1,
        reps: prevSet?.reps || '10-12',
        weight: prevSet?.weight || '15 kg',
        completed: false,
        updatedAt: new Date().toISOString(),
      });
      return {
        ...prev,
        setLogs: {
          ...prev.setLogs,
          [exerciseIndex]: exerciseLogs,
        },
      };
    });
  }, []);

  const removeSet = useCallback((exerciseIndex: number, setIndex: number) => {
    setState(prev => {
      const exerciseLogs = [...(prev.setLogs[exerciseIndex] || [])];
      if (exerciseLogs.length <= 1) return prev; // Keep at least one set
      exerciseLogs.splice(setIndex, 1);
      // Re-number
      const renumbered = exerciseLogs.map((s, idx) => ({ ...s, setNumber: idx + 1 }));
      return {
        ...prev,
        setLogs: {
          ...prev.setLogs,
          [exerciseIndex]: renumbered,
        },
      };
    });
  }, []);

  const skipRest = useCallback(() => {
    setState(prev => {
      let newActiveExIdx = prev.activeExerciseIndex;
      let newCurSetIdx = prev.currentSetIndex;
      if (prev.pendingNextExerciseIndex !== null && prev.pendingNextExerciseIndex !== undefined) {
        newActiveExIdx = prev.pendingNextExerciseIndex;
        newCurSetIdx = 0;
      }
      return {
        ...prev,
        isResting: false,
        restTargetTimestamp: null,
        restRemainingSeconds: 0,
        isRestPaused: false,
        activeExerciseIndex: newActiveExIdx,
        currentSetIndex: newCurSetIdx,
        pendingNextExerciseIndex: null,
        status: prev.isPaused ? 'paused' : 'active',
      };
    });
  }, []);

  const addRestSeconds = useCallback((seconds: number) => {
    setState(prev => {
      if (!prev.isResting) return prev;
      const currentTarget = prev.restTargetTimestamp || (Date.now() + prev.restRemainingSeconds * 1000);
      const newTarget = currentTarget + seconds * 1000;
      const newRemaining = prev.restRemainingSeconds + seconds;
      return {
        ...prev,
        restTargetTimestamp: newTarget,
        restRemainingSeconds: newRemaining,
      };
    });
  }, []);

  const togglePauseRestTimer = useCallback(() => {
    setState(prev => {
      if (!prev.isResting) return prev;
      if (!prev.isRestPaused) {
        // Pausing rest
        return {
          ...prev,
          isRestPaused: true,
          restPausedRemainingSeconds: prev.restRemainingSeconds,
        };
      } else {
        // Resuming rest
        const newTarget = Date.now() + prev.restPausedRemainingSeconds * 1000;
        return {
          ...prev,
          isRestPaused: false,
          restTargetTimestamp: newTarget,
          restRemainingSeconds: prev.restPausedRemainingSeconds,
        };
      }
    });
  }, []);

  const togglePauseWorkout = useCallback(() => {
    setState(prev => {
      const now = Date.now();
      if (!prev.isPaused) {
        // Pause workout
        return {
          ...prev,
          isPaused: true,
          pausedAtTimestamp: now,
          status: 'paused',
        };
      } else {
        // Resume workout
        const pausedDuration = prev.pausedAtTimestamp ? (now - prev.pausedAtTimestamp) : 0;
        return {
          ...prev,
          isPaused: false,
          pausedAtTimestamp: null,
          totalPausedDurationMs: prev.totalPausedDurationMs + pausedDuration,
          status: prev.isResting ? 'resting' : 'active',
        };
      }
    });
  }, []);

  const nextExercise = useCallback(() => {
    setState(prev => {
      const total = prev.dayData?.exercises?.length || 0;
      if (prev.activeExerciseIndex + 1 < total) {
        return {
          ...prev,
          activeExerciseIndex: prev.activeExerciseIndex + 1,
          currentSetIndex: 0,
          isResting: false,
        };
      }
      return prev;
    });
  }, []);

  const prevExercise = useCallback(() => {
    setState(prev => {
      if (prev.activeExerciseIndex > 0) {
        return {
          ...prev,
          activeExerciseIndex: prev.activeExerciseIndex - 1,
          currentSetIndex: 0,
          isResting: false,
        };
      }
      return prev;
    });
  }, []);

  const selectExercise = useCallback((index: number) => {
    setState(prev => {
      const total = prev.dayData?.exercises?.length || 0;
      if (index >= 0 && index < total) {
        return {
          ...prev,
          activeExerciseIndex: index,
          currentSetIndex: 0,
          isResting: false,
          pendingNextExerciseIndex: null,
        };
      }
      return prev;
    });
  }, []);

  const swapExercise = useCallback((exerciseIndex: number, newExercise: any) => {
    setState(prev => {
      if (!prev.dayData?.exercises?.[exerciseIndex]) return prev;
      const updatedExercises = [...prev.dayData.exercises];
      const oldEx = updatedExercises[exerciseIndex];
      updatedExercises[exerciseIndex] = {
        ...oldEx,
        ...newExercise,
        name: newExercise.name || newExercise.name_en || oldEx.name,
        name_en: newExercise.name_en || newExercise.name || oldEx.name_en,
        name_ar: newExercise.name_ar || newExercise.name || oldEx.name_ar,
        muscle_en: newExercise.muscle_en || newExercise.targetMuscle || oldEx.muscle_en,
        muscle_ar: newExercise.muscle_ar || oldEx.muscle_ar,
        targetMuscle: newExercise.targetMuscle || newExercise.muscle_en || oldEx.targetMuscle,
        equipment_en: newExercise.equipment_en || oldEx.equipment_en,
        equipment_ar: newExercise.equipment_ar || oldEx.equipment_ar,
        gif_url: newExercise.gif_url || newExercise.image_url || oldEx.gif_url,
      };
      return {
        ...prev,
        dayData: {
          ...prev.dayData,
          exercises: updatedExercises,
        },
        lastUpdatedTimestamp: Date.now(),
      };
    });
  }, []);

  const minimizePlayer = useCallback(() => {
    setState(prev => ({ ...prev, isMinimized: true, isPlayerOpen: false }));
  }, []);

  const maximizePlayer = useCallback(() => {
    setState(prev => ({ ...prev, isMinimized: false, isPlayerOpen: true }));
  }, []);

  const discardSession = useCallback(() => {
    if (window.confirm('هل أنت متأكد من رغبتك في إلغاء هذا التمرين نهائياً؟ سيتم مسح مسودة التمرين الحالية.')) {
      wakeLockManager.releaseLock();
      setState(initialState);
      try {
        localStorage.removeItem(STORAGE_KEY);
        setHasSavedDraft(false);
      } catch (err) {
        console.warn('[WorkoutSessionContext] Discard storage removal warning:', err);
      }
    }
  }, []);

  const finishWorkoutSession = useCallback(async () => {
    wakeLockManager.releaseLock();
    const currentState = stateRef.current;
    if (!currentState.dayData) return;

    let totalSetsDone = 0;
    let totalVolumeKg = 0;

    // Safe volume calculation resolving ranges like '10-12', numbers, and bodyweight movements
    const parseSafeReps = (repsVal: any): number => {
      if (typeof repsVal === 'number') return Math.max(1, Math.round(repsVal));
      const str = String(repsVal || '').trim();
      if (str.includes('-')) {
        const parts = str.split('-').map(p => parseInt(p.replace(/[^0-9]/g, ''), 10)).filter(n => !isNaN(n));
        if (parts.length > 0) return Math.round(parts.reduce((a, b) => a + b, 0) / parts.length);
      }
      const cleaned = parseInt(str.replace(/[^0-9]/g, ''), 10);
      return isNaN(cleaned) || cleaned <= 0 ? 10 : cleaned;
    };

    let userWeightKg = 75;
    try {
      const cachedProfile = cacheStore.get<any>('user_profile');
      if (cachedProfile && cachedProfile.currentWeight) {
        userWeightKg = parseFloat(String(cachedProfile.currentWeight)) || 75;
      }
    } catch {}

    Object.values(currentState.setLogs).forEach((sets) => {
      sets.forEach((s) => {
        if (s.completed) {
          totalSetsDone += 1;
          const weightStr = String(s.weight || '').toLowerCase().trim();
          let weightNum = 0;
          if (weightStr.includes('body') || weightStr.includes('جسم') || weightStr === 'bw') {
            weightNum = userWeightKg;
          } else {
            weightNum = parseFloat(weightStr.replace(/[^0-9.]/g, '')) || 0;
          }
          const repsNum = parseSafeReps(s.reps);
          totalVolumeKg += weightNum * repsNum;
        }
      });
    });

    const durationMin = Math.max(1, Math.round(currentState.totalElapsedSeconds / 60));
    const summary = {
      dayTitle: currentState.dayData.title || 'Day Workout',
      dayNumber: currentState.dayData.dayNumber || 1,
      totalExercises: currentState.dayData.exercises?.length || 0,
      totalSetsCompleted: totalSetsDone,
      totalVolumeKg: Math.round(totalVolumeKg),
      durationMinutes: durationMin,
      completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    try {
      // Save stats to API / Supabase
      if (currentState.dayData.id) {
        await api.completeDay(currentState.dayData.id).catch(() => null);
      }
      await api.logWorkoutActivity({
        title: currentState.dayData.title || 'Workout Routine',
        durationMinutes: durationMin,
        volumeKg: totalVolumeKg,
        completedSets: totalSetsDone,
      }).catch(() => null);

      // Save today's completion date to local storage logs
      const todayStr = new Date().toISOString().split('T')[0];
      const existingLogsRaw = localStorage.getItem('beast_completed_workout_dates');
      const existingLogs: string[] = existingLogsRaw ? JSON.parse(existingLogsRaw) : [];
      if (!existingLogs.includes(todayStr)) {
        existingLogs.push(todayStr);
        localStorage.setItem('beast_completed_workout_dates', JSON.stringify(existingLogs));
      }

      // Dispatch global event for instant UI reflection on Dashboard & Weekly Streak
      window.dispatchEvent(new CustomEvent('beast_workout_completed', {
        detail: {
          ...summary,
          date: todayStr,
          dayId: currentState.dayData.id,
        }
      }));
    } catch (err) {
      console.warn('[Workout Finish Log Error]:', err);
    }

    setState({
      ...initialState,
      status: 'completed',
      showSummaryModal: true,
      summaryData: summary,
    });

    try {
      localStorage.removeItem(STORAGE_KEY);
      setHasSavedDraft(false);
    } catch {
      // Ignore
    }
  }, []);

  const closeSummaryModal = useCallback(() => {
    setState(prev => ({ ...prev, showSummaryModal: false, summaryData: null }));
  }, []);

  const restoreSavedDraftIfExists = useCallback(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && (parsed.status === 'active' || parsed.status === 'resting' || parsed.status === 'paused')) {
          setState({
            ...parsed,
            isMinimized: false,
            isPlayerOpen: true,
          });
          return true;
        }
      }
    } catch {
      // Ignore
    }
    return false;
  }, []);

  return (
    <WorkoutSessionContext.Provider
      value={{
        state,
        startSession,
        finishCurrentSet,
        updateSetLog,
        addNewSet,
        removeSet,
        skipRest,
        addRestSeconds,
        togglePauseRestTimer,
        togglePauseWorkout,
        nextExercise,
        prevExercise,
        selectExercise,
        swapExercise,
        minimizePlayer,
        maximizePlayer,
        finishWorkoutSession,
        discardSession,
        closeSummaryModal,
        restoreSavedDraftIfExists,
        hasSavedDraft,
      }}
    >
      {children}
    </WorkoutSessionContext.Provider>
  );
};

export const useWorkoutSession = () => {
  const context = useContext(WorkoutSessionContext);
  if (!context) {
    throw new Error('useWorkoutSession must be used within a WorkoutSessionProvider');
  }
  return context;
};
