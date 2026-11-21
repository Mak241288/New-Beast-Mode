/**
 * Shared Domain TypeScript Interfaces for BeastMode Frontend.
 * Replaces loose `any` types across services, contexts, and pages.
 */

export type AppLang = 'ar' | 'en';

export interface UserProfile {
  id?: number | string;
  email: string;
  name: string;
  gender?: string | null;
  birthDate?: string | null;
  height?: number | null;
  currentWeight?: number | null;
  targetWeight?: number | null;
  medicalConditions?: string | null;
  labResults?: string | null;
  workoutLocation?: string | null;
  equipment?: string | null;
  fitnessGoal?: string | null;
  fitnessLevel?: string | null;
  age?: number | null;
  daysPerWeek?: number | null;
  workoutReminder?: boolean;
  reminderTime?: string | null;
  onboardingCompleted?: boolean;
  isGoogleLinked?: boolean;
  googleEmail?: string | null;
  googleId?: string | null;
  hasPassword?: boolean;
  isGuest?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProgressLogEntry {
  id?: number | string;
  exerciseId?: number | string;
  date: string;
  completedSets: number;
  repsCompleted?: string | null;
  weightUsed?: string | null;
  notes?: string | null;
}

export interface ExerciseItem {
  id?: number | string;
  dayWorkoutId?: number | string | null;
  name: string;
  name_en?: string | null;
  name_ar?: string | null;
  description_en?: string | null;
  description_ar?: string | null;
  instructions_en?: string | null;
  instructions_ar?: string | null;
  instructions?: string | null;
  common_mistakes_en?: string | null;
  common_mistakes_ar?: string | null;
  muscle_en?: string | null;
  muscle_ar?: string | null;
  targetMuscle?: string | null;
  equipment_en?: string | null;
  equipment_ar?: string | null;
  level?: string | null;
  category?: string | null;
  sets?: number | string;
  reps?: string | number;
  restSeconds?: number;
  suggestedWeight?: string | null;
  weight?: string | null;
  notes?: string | null;
  orderIndex?: number;
  imageUrl?: string | null;
  image_url?: string | null;
  gif_url?: string | null;
  videoUrl?: string | null;
  video_url?: string | null;
  youtube_url?: string | null;
  musclewiki_url?: string | null;
  progressLogs?: ProgressLogEntry[];
}

export interface DayWorkout {
  id?: number | string;
  planId?: number | string;
  dayIndex: number;
  title: string;
  focusArea?: string;
  dayTips?: string | null;
  isRestDay?: boolean;
  exercises: ExerciseItem[];
}

export interface WorkoutPlan {
  id: number | string;
  userId?: number | string;
  title: string;
  durationWeeks?: number;
  startDate?: string;
  active?: boolean;
  weeklyTips?: string | null;
  isManual?: boolean;
  createdAt?: string;
  updatedAt?: string;
  dayWorkouts: DayWorkout[];
}

export interface WeightLogEntry {
  id?: number | string;
  userId?: number | string;
  weight: number;
  date: string;
  notes?: string | null;
}

export interface PersonalRecord {
  exercise: string;
  weight: number;
  reps: string | number;
  date: string;
}

export interface StrengthTrendEntry {
  date: string;
  weight?: number;
  volume?: number;
  exercise?: string;
}

export interface WorkoutStatsBreakdown {
  totalSessions?: number;
  totalVolume?: number;
  globalStreak?: number;
  globalWorkouts?: number;
  globalMinutes?: number;
  globalExercises?: number;
  globalSets?: number;
  totalExercises?: number;
  completedExercises?: number;
  completionRate?: number;
  totalCalories?: number;
  streak?: number;
  weeklyConsistency?: number;
  completedDates?: string[];
  monthlySessions?: number;
  averageDuration?: number;
  strengthTrend?: StrengthTrendEntry[];
}

export interface BmiSummary {
  value: number;
  category: string;
  height: number;
  weight: number;
}

export interface StatsSummary {
  totalWorkouts?: number;
  totalVolume?: number;
  totalMinutes?: number;
  totalExercisesCompleted?: number;
  currentStreak?: number;
  longestStreak?: number;
  currentWeight?: number | null;
  targetWeight?: number | null;
  weightLogs?: WeightLogEntry[];
  weightHistory?: WeightLogEntry[];
  personalRecords?: PersonalRecord[];
  workoutDates?: string[];
  recentLogs?: ProgressLogEntry[];
  workoutStats?: WorkoutStatsBreakdown;
  bmi?: BmiSummary;
}
