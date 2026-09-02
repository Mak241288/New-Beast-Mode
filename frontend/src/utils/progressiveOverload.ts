export interface ExerciseHistoryRecord {
  lastWeight: string | number;
  lastReps: string | number;
  lastDate?: string;
  suggestedWeight: number | string;
  suggestedIncrement: string;
}

/**
 * Resolves previous exercise performance from user history and calculates progressive overload
 */
export function getExerciseHistoryAndSuggestion(exerciseName: string, defaultWeight?: string, defaultReps?: string): ExerciseHistoryRecord {
  const cleanName = (exerciseName || '').toLowerCase().trim();
  const historyStoreRaw = typeof localStorage !== 'undefined' ? localStorage.getItem('beast_exercise_history_map') : null;
  const historyMap: Record<string, { weight: number | string; reps: number | string; date: string }> = historyStoreRaw ? JSON.parse(historyStoreRaw) : {};

  // Check direct mapped history
  const found = historyMap[cleanName];

  if (found) {
    const lastWeightNum = parseFloat(String(found.weight).replace(/[^0-9.]/g, ''));
    let suggestedWeight: number | string = found.weight;
    let suggestedIncrement = '+2.5 kg (Overload 🦍)';

    if (!isNaN(lastWeightNum) && lastWeightNum > 0) {
      // Suggest +2.5kg for lower reps (strength/hypertrophy) or +1 rep
      const nextWeight = lastWeightNum + 2.5;
      suggestedWeight = `${nextWeight} kg`;
    }

    return {
      lastWeight: found.weight,
      lastReps: found.reps,
      lastDate: found.date,
      suggestedWeight,
      suggestedIncrement,
    };
  }

  // Fallback to default
  const baseWeight = defaultWeight || '20 kg';
  const baseReps = defaultReps || '10';
  return {
    lastWeight: baseWeight,
    lastReps: baseReps,
    suggestedWeight: baseWeight,
    suggestedIncrement: 'Starting Weight',
  };
}

/**
 * Saves completed exercise weight and reps to history map
 */
export function saveExerciseCompletionRecord(exerciseName: string, weight: string | number, reps: string | number) {
  if (typeof localStorage === 'undefined' || !exerciseName) return;
  try {
    const cleanName = exerciseName.toLowerCase().trim();
    const historyStoreRaw = localStorage.getItem('beast_exercise_history_map');
    const historyMap: Record<string, { weight: number | string; reps: number | string; date: string }> = historyStoreRaw ? JSON.parse(historyStoreRaw) : {};
    
    historyMap[cleanName] = {
      weight,
      reps,
      date: new Date().toISOString().split('T')[0],
    };

    localStorage.setItem('beast_exercise_history_map', JSON.stringify(historyMap));
  } catch {}
}
