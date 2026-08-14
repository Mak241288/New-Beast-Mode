/**
 * Offline Gym Session Persistence & Auto-Sync Manager
 * Saves active workout progress (completed sets, timer, weights) to LocalStorage
 * and auto-syncs with backend API when connection restores.
 */

const STORAGE_KEY = 'beastmode_active_gym_session';

export interface ActiveGymSession {
  workoutId: number | string;
  dayTitle: string;
  completedExerciseIds: (number | string)[];
  timerSeconds: number;
  lastUpdated: string;
  weightsLogged: { [exerciseId: string]: string };
}

// Save active workout session state offline
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

// Retrieve saved offline session state
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

// Clear saved offline session upon successful workout completion
export const clearOfflineWorkoutState = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('[OfflineSync] Failed to clear offline workout state:', err);
  }
};

// Initialize network online listener for automatic background sync
export const initOfflineSync = (onReconnectedAndSync: (session: ActiveGymSession) => void): (() => void) => {
  const handleOnline = () => {
    console.log('[OfflineSync] Network reconnected! Syncing offline gym session...');
    const savedSession = getOfflineWorkoutState();
    if (savedSession) {
      onReconnectedAndSync(savedSession);
    }
  };

  window.addEventListener('online', handleOnline);

  // Return cleanup listener function
  return () => {
    window.removeEventListener('online', handleOnline);
  };
};
