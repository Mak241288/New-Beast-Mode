import { cacheStore } from '../utils/cacheStore';
import { supabase } from './supabase';
import { pushUserDataToCloud } from './api';

async function getCurrentUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) return user;
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user || null;
  } catch {
    return null;
  }
}

export interface BeastExercise {
  id: string | number;
  name: string;
  targetMuscle: string;
  category: 'MAIN' | 'WARMUP' | 'COOLDOWN' | 'CARDIO' | 'SUPERSET' | 'HIIT' | 'CALISTHENICS' | 'IRON';
  sets: number;
  reps: string;
  weight: string;
  restSeconds: number;
  exerciseTips?: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  isTimed?: boolean;
}

export interface BeastDay {
  dayIndex: number; // 1 (Sunday) to 7 (Saturday)
  title: string;
  focusArea: string;
  isRestDay: boolean;
  exercises: BeastExercise[];
}

export interface BeastPlan {
  id: string | number;
  title: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  durationWeeks?: number;
  days: BeastDay[];
  dayWorkouts: BeastDay[]; // Guaranteed identical reference
}

export function isSamePlanId(idA: any, idB: any): boolean {
  if (idA === undefined || idA === null || idB === undefined || idB === null) return false;
  if (String(idA) === String(idB)) return true;
  const sA = String(idA).replace(/^plan_/, '').trim();
  const sB = String(idB).replace(/^plan_/, '').trim();
  return sA.length > 0 && sA === sB;
}

// -------------------------------------------------------------
// HELPER: Generate clean fallback 7-day skeleton (Sunday to Saturday)
// -------------------------------------------------------------
export const createDefault7Days = (lang: 'ar' | 'en' = 'ar'): BeastDay[] => {
  const isEn = lang === 'en';
  return [
    {
      dayIndex: 1,
      title: isEn ? 'Push Day A (Chest & Triceps)' : 'يوم دفع (صدر وترايسبس وأكتاف)',
      focusArea: isEn ? 'Chest, Triceps, Shoulders' : 'صدر، ترايسبس، أكتاف',
      isRestDay: false,
      exercises: [
        { id: 'ex_1_1', name: isEn ? 'Barbell Bench Press' : 'بنش برس بالبار مستوي', targetMuscle: 'Chest', category: 'MAIN', sets: 4, reps: '8-10', weight: 'Barbell', restSeconds: 90 },
        { id: 'ex_1_2', name: isEn ? 'Incline Dumbbell Press' : 'ضغط دمبلز مائل للأعلى', targetMuscle: 'Chest', category: 'MAIN', sets: 3, reps: '10-12', weight: 'Dumbbells', restSeconds: 60 },
        { id: 'ex_1_3', name: isEn ? 'Dumbbell Lateral Raise' : 'رفرفة جانبية للأكتاف بالدمبلز', targetMuscle: 'Shoulders', category: 'MAIN', sets: 4, reps: '12-15', weight: 'Dumbbells', restSeconds: 60 },
        { id: 'ex_1_4', name: isEn ? 'Cable Tricep Pushdown' : 'سحب ترايسبس بالكيبل', targetMuscle: 'Triceps', category: 'MAIN', sets: 3, reps: '12-15', weight: 'Cable', restSeconds: 60 },
      ],
    },
    {
      dayIndex: 2,
      title: isEn ? 'Pull Day A (Back & Biceps)' : 'يوم سحب (ظهر وبايسبس)',
      focusArea: isEn ? 'Back, Biceps' : 'ظهر، بايسبس',
      isRestDay: false,
      exercises: [
        { id: 'ex_2_1', name: isEn ? 'Lat Pulldown' : 'سحب ظهر أمامي واسع (Lat Pulldown)', targetMuscle: 'Back', category: 'MAIN', sets: 4, reps: '10-12', weight: 'Cable', restSeconds: 75 },
        { id: 'ex_2_2', name: isEn ? 'Seated Cable Row' : 'سحب كيبل أرضي ضيق (Seated Row)', targetMuscle: 'Back', category: 'MAIN', sets: 3, reps: '10-12', weight: 'Cable', restSeconds: 60 },
        { id: 'ex_2_3', name: isEn ? 'Barbell Bicep Curl' : 'تبادل بايسبس بالبار', targetMuscle: 'Biceps', category: 'MAIN', sets: 3, reps: '10-12', weight: 'Barbell', restSeconds: 60 },
        { id: 'ex_2_4', name: isEn ? 'Face Pulls' : 'فيس بول بالكيبل (Face Pulls)', targetMuscle: 'Shoulders', category: 'MAIN', sets: 3, reps: '15', weight: 'Cable', restSeconds: 45 },
      ],
    },
    {
      dayIndex: 3,
      title: isEn ? 'Legs & Abs A' : 'يوم أرجل وبطن',
      focusArea: isEn ? 'Quadriceps, Calves, Abs' : 'أرجل أمامية، سمانة، بطن',
      isRestDay: false,
      exercises: [
        { id: 'ex_3_1', name: isEn ? 'Barbell Squat' : 'سكوات بالبار الحر (Squat)', targetMuscle: 'Quadriceps', category: 'MAIN', sets: 4, reps: '8-10', weight: 'Barbell', restSeconds: 120 },
        { id: 'ex_3_2', name: isEn ? 'Leg Press' : 'دفع أرجل بالجهاز (Leg Press)', targetMuscle: 'Quadriceps', category: 'MAIN', sets: 3, reps: '10-12', weight: 'Machine', restSeconds: 90 },
        { id: 'ex_3_3', name: isEn ? 'Standing Calf Raise' : 'رفع السمانة واقفاً', targetMuscle: 'Calves', category: 'MAIN', sets: 4, reps: '15', weight: 'Machine', restSeconds: 45 },
        { id: 'ex_3_4', name: isEn ? 'Hanging Leg Raise' : 'رفع الأرجل عقلة للبطن', targetMuscle: 'Abs', category: 'MAIN', sets: 3, reps: '15', weight: 'Bodyweight', restSeconds: 45 },
      ],
    },
    {
      dayIndex: 4,
      title: isEn ? 'Rest & Active Recovery' : 'راحة واستشفاء عضلي',
      focusArea: isEn ? 'Recovery' : 'استشفاء كامل',
      isRestDay: true,
      exercises: [],
    },
    {
      dayIndex: 5,
      title: isEn ? 'Upper Body Blast' : 'تمرين الجزء العلوي الشامل',
      focusArea: isEn ? 'Upper Body' : 'صدر، ظهر، أكتاف، ذراعين',
      isRestDay: false,
      exercises: [
        { id: 'ex_5_1', name: isEn ? 'Incline Dumbbell Press' : 'ضغط دمبلز مائل للأعلى', targetMuscle: 'Chest', category: 'MAIN', sets: 3, reps: '10-12', weight: 'Dumbbells', restSeconds: 60 },
        { id: 'ex_5_2', name: isEn ? 'Bent Over Row' : 'سحب بار حر منحني (Barbell Row)', targetMuscle: 'Back', category: 'MAIN', sets: 3, reps: '10-12', weight: 'Barbell', restSeconds: 75 },
        { id: 'ex_5_3', name: isEn ? 'Overhead Dumbbell Press' : 'ضغط أكتاف بالدمبلز جالساً', targetMuscle: 'Shoulders', category: 'MAIN', sets: 3, reps: '10-12', weight: 'Dumbbells', restSeconds: 60 },
        { id: 'ex_5_4', name: isEn ? 'Dips' : 'متوازي للصدر والترايسبس (Dips)', targetMuscle: 'Triceps', category: 'MAIN', sets: 3, reps: '10-12', weight: 'Bodyweight', restSeconds: 60 },
      ],
    },
    {
      dayIndex: 6,
      title: isEn ? 'Lower Body & Core' : 'الجزء السفلي والبطن',
      focusArea: isEn ? 'Hamstrings, Glutes, Abs' : 'أرجل خلفية، مؤخرة، بطن',
      isRestDay: false,
      exercises: [
        { id: 'ex_6_1', name: isEn ? 'Romanian Deadlift' : 'ديدليفت روماني بالبار (RDL)', targetMuscle: 'Hamstrings', category: 'MAIN', sets: 4, reps: '8-10', weight: 'Barbell', restSeconds: 90 },
        { id: 'ex_6_2', name: isEn ? 'Leg Curl' : 'ثني أرجل خلفية بالجهاز', targetMuscle: 'Hamstrings', category: 'MAIN', sets: 3, reps: '12-15', weight: 'Machine', restSeconds: 60 },
        { id: 'ex_6_3', name: isEn ? 'Plank' : 'بلانك للبطن والكور', targetMuscle: 'Abs', category: 'MAIN', sets: 3, reps: '60s', weight: 'Bodyweight', restSeconds: 45, isTimed: true },
      ],
    },
    {
      dayIndex: 7,
      title: isEn ? 'Rest Day' : 'يوم راحة',
      focusArea: isEn ? 'Full Rest' : 'راحة تامة',
      isRestDay: true,
      exercises: [],
    },
  ];
};

// -------------------------------------------------------------
// HELPER: Normalize any plan structure to strict BeastPlan schema
// -------------------------------------------------------------
export const normalizePlan = (raw: any, fallbackTitle = 'جدول تدريبي مخصص'): BeastPlan => {
  if (!raw || typeof raw !== 'object') {
    const defaultDays = createDefault7Days('ar');
    return {
      id: `plan_${Date.now()}`,
      title: fallbackTitle,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      durationWeeks: 4,
      days: defaultDays,
      dayWorkouts: defaultDays,
    };
  }

  const id = raw.id ? String(raw.id) : `plan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const title = (raw.title && String(raw.title).trim()) ? String(raw.title).trim() : fallbackTitle;
  const active = !!raw.active;
  const createdAt = raw.createdAt || new Date().toISOString();
  const updatedAt = new Date().toISOString();
  const durationWeeks = parseInt(String(raw.durationWeeks)) || 4;

  const sourceDays = (raw.days && Array.isArray(raw.days) && raw.days.length > 0)
    ? raw.days
    : ((raw.dayWorkouts && Array.isArray(raw.dayWorkouts) && raw.dayWorkouts.length > 0) ? raw.dayWorkouts : createDefault7Days('ar'));

  const normalizedDays: BeastDay[] = sourceDays.map((d: any, idx: number) => {
    const dayIndex = parseInt(String(d.dayIndex)) || (idx + 1);
    const dayTitle = d.title ? String(d.title).trim() : `اليوم ${dayIndex}`;
    const focusArea = d.focusArea ? String(d.focusArea).trim() : '';
    const isRestDay = !!d.isRestDay || (Array.isArray(d.exercises) && d.exercises.length === 0 && dayTitle.includes('راحة'));

    const rawExercises = Array.isArray(d.exercises) ? d.exercises : [];
    const exercises: BeastExercise[] = isRestDay ? [] : rawExercises.map((ex: any, exIdx: number) => {
      const exId = ex.id ? String(ex.id) : `ex_${dayIndex}_${exIdx + 1}_${Date.now()}`;
      const name = ex.name ? String(ex.name).trim() : 'تمرين مخصص';
      const targetMuscle = ex.targetMuscle ? String(ex.targetMuscle).trim() : 'Chest';
      const sets = parseInt(String(ex.sets)) || 3;
      const reps = ex.reps ? String(ex.reps).trim() : '10-12';
      const weight = ex.weight ? String(ex.weight).trim() : 'Bodyweight';
      const restSeconds = parseInt(String(ex.restSeconds)) || 60;
      const category = (ex.category || 'MAIN') as BeastExercise['category'];
      const isTimed = ex.isTimed !== undefined ? !!ex.isTimed : (reps.includes('s') || reps.includes('ثانية') || reps.includes('دقيقة'));

      return {
        id: exId,
        name,
        targetMuscle,
        category,
        sets,
        reps,
        weight,
        restSeconds,
        exerciseTips: ex.exerciseTips || '',
        imageUrl: ex.imageUrl || null,
        videoUrl: ex.videoUrl || null,
        isTimed,
      };
    });

    return {
      dayIndex,
      title: dayTitle,
      focusArea,
      isRestDay,
      exercises,
    };
  });

  return {
    id,
    title,
    active,
    createdAt,
    updatedAt,
    durationWeeks,
    days: normalizedDays,
    dayWorkouts: normalizedDays, // Dual-alias guaranteed
  };
};

// -------------------------------------------------------------
// CENTRALIZED PLAN SERVICE
// -------------------------------------------------------------
export const planService = {
  // 1. Get all plans (Smart Local-First + Cloud Merge)
  getAll: async (): Promise<BeastPlan[]> => {
    let plans: BeastPlan[] = [];

    // 1. Get cached local plans first (contains latest modifications)
    const cachedHistory = cacheStore.get<any[]>('plan_history');
    if (Array.isArray(cachedHistory) && cachedHistory.length > 0) {
      plans = cachedHistory.map((p) => normalizePlan(p));
    }

    // 2. Check cloud user metadata and merge
    const user = await getCurrentUser();
    if (user?.user_metadata?.beast_plan_history) {
      try {
        const rawHistory = typeof user.user_metadata.beast_plan_history === 'string'
          ? JSON.parse(user.user_metadata.beast_plan_history)
          : user.user_metadata.beast_plan_history;
        if (Array.isArray(rawHistory) && rawHistory.length > 0) {
          const cloudPlans = rawHistory.map((p) => normalizePlan(p));
          if (plans.length === 0) {
            plans = cloudPlans;
          } else {
            cloudPlans.forEach((cp) => {
              if (!plans.some((lp) => String(lp.id) === String(cp.id) || lp.title === cp.title)) {
                plans.push(cp);
              }
            });
          }
        }
      } catch {}
    }

    // 3. Check active plan cache to ensure it is in history
    const cachedActive = cacheStore.get<any>('active_plan');
    if (cachedActive) {
      const normalizedActive = normalizePlan(cachedActive);
      normalizedActive.active = true;
      const idx = plans.findIndex((p) => isSamePlanId(p.id, normalizedActive.id) || p.title === normalizedActive.title);
      if (idx >= 0) {
        plans[idx] = { ...plans[idx], ...normalizedActive, active: true };
      } else {
        plans = [{ ...normalizedActive, active: true }, ...plans.map((p) => ({ ...p, active: false }))];
      }
    }

    // If still empty, create default starter plan
    if (plans.length === 0) {
      const defaultPlan = normalizePlan(null, 'جدولي التدريبي الأساسي ⚡');
      defaultPlan.active = true;
      plans = [defaultPlan];
    }

    // Guarantee at least 1 active plan
    const hasActive = plans.some((p) => p.active);
    if (!hasActive && plans.length > 0) {
      plans[0].active = true;
    }

    // Store normalized history
    cacheStore.set('plan_history', plans);
    const active = plans.find((p) => p.active) || plans[0];
    cacheStore.set('active_plan', active);

    return plans;
  },

  // 2. Get active plan
  getActive: async (): Promise<BeastPlan> => {
    const plans = await planService.getAll();
    const active = plans.find((p) => p.active) || plans[0];
    cacheStore.set('active_plan', active);
    return active;
  },

  // 3. Save or update a plan atomically
  save: async (rawPlan: any, makeActive = true): Promise<BeastPlan> => {
    const normalized = normalizePlan(rawPlan);
    if (makeActive) {
      normalized.active = true;
    }

    const currentPlans = await planService.getAll();
    let updatedHistory: BeastPlan[];

    const existingIdx = currentPlans.findIndex(
      (p) => isSamePlanId(p.id, normalized.id) || (p.title === normalized.title && String(p.id).startsWith('plan_'))
    );

    if (existingIdx >= 0) {
      updatedHistory = currentPlans.map((p, idx) => {
        if (idx === existingIdx) {
          return { ...normalized, active: makeActive ? true : p.active };
        }
        return makeActive ? { ...p, active: false } : p;
      });
    } else {
      updatedHistory = [
        normalized,
        ...currentPlans.map((p) => (makeActive ? { ...p, active: false } : p)),
      ];
    }

    // Persist to memory
    cacheStore.set('plan_history', updatedHistory);
    if (makeActive || normalized.active) {
      cacheStore.set('active_plan', normalized);
    }

    // Push to Cloud Authoritatively
    await pushUserDataToCloud(true);

    // Broadcast event to all open tabs and views
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('beast_plan_changed', {
          detail: { activePlan: makeActive ? normalized : cacheStore.get('active_plan'), plans: updatedHistory },
        })
      );
      window.dispatchEvent(new CustomEvent('beast_cloud_synced'));
    }

    // Direct Supabase table sync fallback
    const user = await getCurrentUser();
    if (user?.email) {
      try {
        await supabase.from('WorkoutPlan').upsert({
          id: typeof normalized.id === 'number' ? normalized.id : undefined,
          title: normalized.title,
          active: normalized.active,
          durationWeeks: normalized.durationWeeks,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('[Supabase plan upsert non-fatal]:', err);
      }
    }

    return normalized;
  },

  // 4. Activate an existing plan by ID
  activate: async (planId: string | number): Promise<BeastPlan> => {
    const plans = await planService.getAll();
    const target = plans.find((p) => isSamePlanId(p.id, planId));
    if (!target) {
      throw new Error('Plan not found');
    }

    target.active = true;
    target.updatedAt = new Date().toISOString();

    const updatedHistory = plans.map((p) => {
      if (isSamePlanId(p.id, planId)) {
        return { ...p, active: true, updatedAt: new Date().toISOString() };
      }
      return { ...p, active: false };
    });

    cacheStore.set('plan_history', updatedHistory);
    cacheStore.set('active_plan', target);

    await pushUserDataToCloud(true);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('beast_plan_changed', {
          detail: { activePlan: target, plans: updatedHistory },
        })
      );
      window.dispatchEvent(new CustomEvent('beast_cloud_synced'));
    }

    return target;
  },

  // 5. Rename a plan
  rename: async (planId: string | number, newTitle: string): Promise<BeastPlan> => {
    const trimmed = newTitle.trim();
    if (!trimmed) throw new Error('Title cannot be empty');

    const plans = await planService.getAll();
    let targetPlan: BeastPlan | null = null;

    const updatedHistory = plans.map((p) => {
      if (isSamePlanId(p.id, planId)) {
        targetPlan = { ...p, title: trimmed, updatedAt: new Date().toISOString() };
        return targetPlan;
      }
      return p;
    });

    if (!targetPlan) throw new Error('Plan not found');

    cacheStore.set('plan_history', updatedHistory);
    if ((targetPlan as any).active) {
      cacheStore.set('active_plan', targetPlan);
    }

    await pushUserDataToCloud(true);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('beast_plan_changed', {
          detail: { activePlan: cacheStore.get('active_plan'), plans: updatedHistory },
        })
      );
      window.dispatchEvent(new CustomEvent('beast_cloud_synced'));
    }

    return targetPlan;
  },

  // 6. Duplicate a plan
  duplicate: async (planId: string | number): Promise<BeastPlan> => {
    const plans = await planService.getAll();
    const source = plans.find((p) => isSamePlanId(p.id, planId));
    if (!source) throw new Error('Source plan not found');

    const newId = `plan_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    const duplicated: BeastPlan = {
      ...JSON.parse(JSON.stringify(source)),
      id: newId,
      title: `${source.title} (نسخة مكررة)`,
      active: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedHistory = [duplicated, ...plans];
    cacheStore.set('plan_history', updatedHistory);

    await pushUserDataToCloud(true);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('beast_plan_changed', {
          detail: { activePlan: cacheStore.get('active_plan'), plans: updatedHistory },
        })
      );
      window.dispatchEvent(new CustomEvent('beast_cloud_synced'));
    }

    return duplicated;
  },

  // 7. Delete a plan
  delete: async (planId: string | number): Promise<{ success: boolean; activePlan: BeastPlan }> => {
    const plans = await planService.getAll();
    if (plans.length <= 1) {
      throw new Error('لا يمكن حذف الجدول الوحيد. يجب الاحتفاظ بجدول واحد على الأقل.');
    }

    const wasActive = plans.some((p) => isSamePlanId(p.id, planId) && p.active);
    const updatedHistory = plans.filter((p) => !isSamePlanId(p.id, planId));

    let nextActive = cacheStore.get<BeastPlan>('active_plan');
    if (wasActive || !nextActive || isSamePlanId(nextActive.id, planId)) {
      updatedHistory[0].active = true;
      nextActive = updatedHistory[0];
      cacheStore.set('active_plan', nextActive);
    }

    cacheStore.set('plan_history', updatedHistory);
    await pushUserDataToCloud(true);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('beast_plan_changed', {
          detail: { activePlan: nextActive, plans: updatedHistory },
        })
      );
      window.dispatchEvent(new CustomEvent('beast_cloud_synced'));
    }

    return { success: true, activePlan: nextActive };
  },

  // 8. Create a brand new blank or template plan
  create: async (title = 'جدول تدريبي جديد', days?: BeastDay[]): Promise<BeastPlan> => {
    const newPlan: BeastPlan = {
      id: `plan_${Date.now()}`,
      title,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      durationWeeks: 4,
      days: days || createDefault7Days('ar'),
      dayWorkouts: days || createDefault7Days('ar'),
    };

    return planService.save(newPlan, true);
  },

  // 9. Update a single exercise in the active plan
  updateExercise: async (exerciseId: string | number, updatedData: any): Promise<BeastPlan> => {
    const activePlan = await planService.getActive();

    const updatedDays = activePlan.days.map((day) => {
      const exercises = day.exercises.map((ex) => {
        const idMatches = exerciseId !== undefined && ex.id !== undefined && String(ex.id) === String(exerciseId);
        const nameMatches = ex.name && updatedData.name && ex.name.trim().toLowerCase() === updatedData.name.trim().toLowerCase();
        if (idMatches || nameMatches) {
          return {
            ...ex,
            ...updatedData,
            sets: parseInt(String(updatedData.sets)) || ex.sets || 3,
            reps: updatedData.reps || ex.reps || '10-12',
            weight: updatedData.weight || ex.weight || 'Bodyweight',
            restSeconds: parseInt(String(updatedData.restSeconds)) || ex.restSeconds || 60,
            category: updatedData.category || ex.category || 'MAIN',
            targetMuscle: updatedData.targetMuscle || ex.targetMuscle || 'Chest',
          };
        }
        return ex;
      });
      return { ...day, exercises };
    });

    const updatedPlan = {
      ...activePlan,
      days: updatedDays,
      dayWorkouts: updatedDays,
      updatedAt: new Date().toISOString(),
    };

    return planService.save(updatedPlan, true);
  },

  // 10. Delete a single exercise from the active plan
  deleteExercise: async (exerciseId: string | number): Promise<BeastPlan> => {
    const activePlan = await planService.getActive();

    const updatedDays = activePlan.days.map((day) => {
      const exercises = day.exercises.filter((ex) => String(ex.id) !== String(exerciseId));
      return { ...day, exercises };
    });

    const updatedPlan = {
      ...activePlan,
      days: updatedDays,
      dayWorkouts: updatedDays,
      updatedAt: new Date().toISOString(),
    };

    return planService.save(updatedPlan, true);
  },

  // 11. Add a custom exercise to a specific day in the active plan
  addCustomExercise: async (dayIdOrIndex: string | number, exerciseData: any): Promise<BeastPlan> => {
    const activePlan = await planService.getActive();
    const dayIndexNum = parseInt(String(dayIdOrIndex)) || 1;

    const updatedDays = activePlan.days.map((day, idx) => {
      const match = day.dayIndex === dayIndexNum || String(day.dayIndex) === String(dayIdOrIndex) || idx + 1 === dayIndexNum;
      if (match) {
        const newExercise: BeastExercise = {
          id: exerciseData.id || `ex_${day.dayIndex}_${Date.now()}`,
          name: exerciseData.name || 'تمرين جديد',
          targetMuscle: exerciseData.targetMuscle || 'Chest',
          category: (exerciseData.category || 'MAIN') as BeastExercise['category'],
          sets: parseInt(String(exerciseData.sets)) || 3,
          reps: exerciseData.reps || '10-12',
          weight: exerciseData.weight || 'Bodyweight',
          restSeconds: parseInt(String(exerciseData.restSeconds)) || 60,
          exerciseTips: exerciseData.exerciseTips || '',
          imageUrl: exerciseData.imageUrl || null,
          videoUrl: exerciseData.videoUrl || null,
          isTimed: !!exerciseData.isTimed,
        };
        return {
          ...day,
          isRestDay: false,
          exercises: [...day.exercises, newExercise],
        };
      }
      return day;
    });

    const updatedPlan = {
      ...activePlan,
      days: updatedDays,
      dayWorkouts: updatedDays,
      updatedAt: new Date().toISOString(),
    };

    return planService.save(updatedPlan, true);
  },
};
