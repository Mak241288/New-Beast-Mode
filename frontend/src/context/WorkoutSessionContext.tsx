import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { cacheStore } from '../utils/cacheStore';
import { audioCues } from '../utils/audioCues';
import { wakeLockManager } from '../utils/wakeLock';
import { generateUUID } from '../utils/offlineSync';

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
        api.pushUserDataToCloud();
        api.broadcastWorkoutSetUpdate(payloadWithTime);
      } catch {
        // Ignore quota error
      }
    } else if (state.status === 'idle' || state.status === 'completed') {
      try {
        localStorage.removeItem(STORAGE_KEY);
        cacheStore.remove('active_gym_session');
        setHasSavedDraft(false);
        api.pushUserDataToCloud();
      } catch {
        // Ignore
      }
    }
  }, [state.status, state.activeExerciseIndex, state.currentSetIndex, state.setLogs, state.isPaused]);

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
    const unsubscribeRealtime = api.subscribeToRealtimeSync();

    window.addEventListener('beast_cloud_synced', handleCloudRestore);
    return () => {
      window.removeEventListener('beast_cloud_synced', handleCloudRestore);
      unsubscribeRealtime();
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
          } else {
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

    // Initialize set logs
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
      initialLogs[idx] = Array.from({ length: totalSets }, (_, sIdx) => ({
        clientSideId: generateUUID(),
        setNumber: sIdx + 1,
        reps: cleanReps,
        weight: cleanWeight,
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
    audioCues.triggerHaptic('setDone');

    setState(prev => {
      const exIdx = prev.activeExerciseIndex;
      const setIdx = prev.currentSetIndex;
      const currentLogs = prev.setLogs[exIdx] || [];
      
      const updatedSetLogs = [...currentLogs];
      const targetSet = updatedSetLogs[setIdx] || {
        clientSideId: generateUUID(),
        setNumber: setIdx + 1,
        reps: '10',
        weight: '10 kg',
        completed: false,
        updatedAt: new Date().toISOString(),
      };

      const nowIso = new Date().toISOString();
      updatedSetLogs[setIdx] = {
        ...targetSet,
        clientSideId: targetSet.clientSideId || generateUUID(),
        reps: customValues?.reps ?? targetSet.reps,
        weight: customValues?.weight ?? targetSet.weight,
        completed: true,
        completedAt: nowIso,
        updatedAt: nowIso,
      };

      const newAllLogs = {
        ...prev.setLogs,
        [exIdx]: updatedSetLogs,
      };

      const exercises = prev.dayData?.exercises || [];
      const currentEx = exercises[exIdx];

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

      if (nextSetIdx >= updatedSetLogs.length) {
        // Exercise completed! Move to next exercise
        if (exIdx + 1 < exercises.length) {
          nextExIdx = exIdx + 1;
          nextSetIdx = 0;
        } else {
          // All exercises in day completed!
          isCompleted = true;
        }
      }

      if (isCompleted) {
        return {
          ...prev,
          setLogs: newAllLogs,
          status: 'active',
          isResting: false,
        };
      }

      const restTarget = Date.now() + restSeconds * 1000;

      return {
        ...prev,
        setLogs: newAllLogs,
        activeExerciseIndex: nextExIdx,
        currentSetIndex: nextSetIdx,
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
    setState(prev => ({
      ...prev,
      isResting: false,
      restTargetTimestamp: null,
      restRemainingSeconds: 0,
      isRestPaused: false,
      status: prev.isPaused ? 'paused' : 'active',
    }));
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
        };
      }
      return prev;
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
      } catch {
        // Ignore
      }
    }
  }, []);

  const finishWorkoutSession = useCallback(async () => {
    wakeLockManager.releaseLock();
    const currentState = stateRef.current;
    if (!currentState.dayData) return;

    let totalSetsDone = 0;
    let totalVolumeKg = 0;

    Object.values(currentState.setLogs).forEach((sets) => {
      sets.forEach((s) => {
        if (s.completed) {
          totalSetsDone += 1;
          const weightNum = parseFloat(String(s.weight).replace(/[^0-9.]/g, '')) || 0;
          const repsNum = parseInt(String(s.reps).replace(/[^0-9]/g, ''), 10) || 10;
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
