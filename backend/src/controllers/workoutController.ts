import { Response } from 'express';
import prisma from '../services/db';
import { AuthRequest } from '../middleware/auth';
import { upgradeWorkoutPlanAI, callGroq } from '../services/aiService';

// Helper to get muscle-specific Unsplash image URLs
const getMuscleImage = (muscle: string): string => {
  const m = (muscle || '').toLowerCase();
  if (m.includes('chest') || m.includes('صدر')) {
    return 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&auto=format&fit=crop&q=60';
  }
  if (m.includes('back') || m.includes('lats') || m.includes('ظهر')) {
    return 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=500&auto=format&fit=crop&q=60';
  }
  if (m.includes('shoulder') || m.includes('كتف')) {
    return 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=500&auto=format&fit=crop&q=60';
  }
  if (m.includes('leg') || m.includes('quad') || m.includes('hamstring') || m.includes('calf') || m.includes('رجل') || m.includes('فخذ') || m.includes('سمانة')) {
    return 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=500&auto=format&fit=crop&q=60';
  }
  if (m.includes('bicep') || m.includes('tricep') || m.includes('arm') || m.includes('باي') || m.includes('تراي') || m.includes('ذراع')) {
    return 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&auto=format&fit=crop&q=60';
  }
  if (m.includes('ab') || m.includes('core') || m.includes('بطن')) {
    return 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&auto=format&fit=crop&q=60';
  }
  if (m.includes('yoga') || m.includes('يوجا')) {
    return 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&auto=format&fit=crop&q=60';
  }
  return 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=60';
};

// Helper to calculate suggested starting weights dynamically
const getSuggestedWeight = (exerciseName: string, equipment: string, gender: string, level: string, userWeight: number): string => {
  const name = exerciseName.toLowerCase();
  const eq = equipment.toLowerCase();
  const lvl = level.toLowerCase();
  const w = userWeight || 75;
  const isMale = gender === 'MALE';

  // Bodyweight / Time / Stretches
  if (eq.includes('bodyweight') || eq.includes('body only') || eq.includes('none') || name.includes('plank') || name.includes('pushup') || name.includes('pullup') || name.includes('yoga') || name.includes('dip')) {
    return 'وزن الجسم (Bodyweight)';
  }

  // Dumbbells
  if (eq.includes('dumbbell') || eq.includes('dumbbells')) {
    let ratio = 0.1;
    if (isMale) {
      if (lvl === 'beginner') ratio = 0.1;
      else if (lvl === 'intermediate') ratio = 0.16;
      else ratio = 0.22;
    } else {
      if (lvl === 'beginner') ratio = 0.05;
      else if (lvl === 'intermediate') ratio = 0.09;
      else ratio = 0.14;
    }
    const weightVal = Math.round((w * ratio) / 2) * 2;
    const finalWeight = Math.max(2, weightVal);
    return `دمبلز ${finalWeight} كجم (Dumbbell ${finalWeight}kg)`;
  }

  // Barbell
  if (eq.includes('barbell') || eq.includes('bar')) {
    let ratio = 0.3;
    if (isMale) {
      if (lvl === 'beginner') ratio = 0.35;
      else if (lvl === 'intermediate') ratio = 0.55;
      else ratio = 0.75;
    } else {
      if (lvl === 'beginner') ratio = 0.2;
      else if (lvl === 'intermediate') ratio = 0.35;
      else ratio = 0.5;
    }
    const weightVal = Math.round((w * ratio) / 5) * 5;
    const finalWeight = Math.max(10, weightVal);
    return `بار ${finalWeight} كجم (Barbell ${finalWeight}kg)`;
  }

  // Cables/Machines
  if (eq.includes('cable') || eq.includes('machine')) {
    let ratio = 0.25;
    if (isMale) {
      if (lvl === 'beginner') ratio = 0.25;
      else if (lvl === 'intermediate') ratio = 0.45;
      else ratio = 0.65;
    } else {
      if (lvl === 'beginner') ratio = 0.15;
      else if (lvl === 'intermediate') ratio = 0.28;
      else ratio = 0.4;
    }
    const weightVal = Math.round((w * ratio) / 5) * 5;
    const finalWeight = Math.max(5, weightVal);
    return `جهاز ${finalWeight} كجم (Machine ${finalWeight}kg)`;
  }

  return 'حسب القدرة (As comfortable)';
};

// @desc    Generate Workout Plan using Local Python Engine
// @route   POST /api/workout/generate
export const generatePlan = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const { durationWeeks, startDate, workoutLocation, equipment, level, targetMuscles, goal, restDays, exercisesPerDay } = req.body;

  try {
    if (!userId) {
      res.status(401).json({ error: 'غير مصرح بالدخول' });
      return;
    }

    const userProfile = await prisma.user.findUnique({
      where: { id: userId }
    });

    const gender = userProfile?.gender || 'MALE';
    const userWeight = userProfile?.currentWeight || 75;

    // Resolve days count and other parameters
    // Default workout days per week to 3 or 4
    const daysPerWeek = req.body.daysPerWeek || 3;
    const finalGoal = goal || 'HYPERTROPHY';
    const finalLocation = workoutLocation || userProfile?.workoutLocation || 'GYM';

    // Map equipment array to comma-separated string
    const equipStr = Array.isArray(equipment) ? equipment.join(',') : '';
    const muscleStr = Array.isArray(targetMuscles) ? targetMuscles.join(',') : '';
    const restDaysStr = Array.isArray(restDays) ? restDays.join(',') : '';
    const exercisesLimit = exercisesPerDay ? parseInt(exercisesPerDay) : 0;

    const { exec } = require('child_process');
    const path = require('path');
    const fs = require('fs').promises;

    const pythonDir = path.join(__dirname, '../../../workout_generator_python');
    const command = `python src/generator.py --days ${daysPerWeek} --location ${finalLocation} --equipment "${equipStr}" --level ${level || 'intermediate'} --goal ${finalGoal} --muscles "${muscleStr}" --rest-days "${restDaysStr}" --limit ${exercisesLimit}`;

    console.log(`[WorkoutController] Executing: ${command}`);

    exec(command, { cwd: pythonDir, env: process.env }, async (error: any, stdout: string, stderr: string) => {
      console.log('[WorkoutController] Python Generator Output:', stdout);
      if (error) {
        console.error('[WorkoutController] Python Generator Error:', error, stderr);
        res.status(500).json({ error: 'فشل تشغيل خوارزمية التوزيع الذكي للتمارين محلياً.' });
        return;
      }

      try {
        const planFilePath = path.join(pythonDir, 'data/processed/generated_plan.json');
        const fileContent = await fs.readFile(planFilePath, 'utf-8');
        const pythonPlan = JSON.parse(fileContent);

        // Deactivate previous plans
        await prisma.workoutPlan.updateMany({
          where: { userId, active: true },
          data: { active: false },
        });

        // Save generated plan to PostgreSQL/Prisma
        const startDateTime = startDate ? new Date(startDate) : new Date();

        const createdPlan = await prisma.workoutPlan.create({
          data: {
            userId,
            title: `جدول تمارين مخصص (${finalLocation === 'GYM' ? 'النادي' : 'المنزل'})`,
            durationWeeks: durationWeeks || 4,
            startDate: startDateTime,
            active: true,
            weeklyTips: `ركز على الأداء السليم وتدرج في زيادة الأحمال. الأدوات المستخدمة تناسب تفضيلاتك: ${equipStr || 'جميع الأدوات'}`,
            isManual: false,
            dayWorkouts: {
              create: pythonPlan.map((day: any, dIdx: number) => ({
                dayIndex: dIdx,
                title: day.day_name_ar || day.day_name_en,
                focusArea: day.day_name_en,
                dayTips: day.is_rest_day ? 'يوم راحة مخصص للاستشفاء العضلي.' : 'ابدأ بالإحماء لمدة 5 دقائق قبل بدء جولتك.',
                isRestDay: !!day.is_rest_day,
                exercises: {
                  create: day.is_rest_day ? [] : day.exercises.map((ex: any, idx: number) => {
                    const suggestedWeight = getSuggestedWeight(ex.name_en, ex.equipment_en, gender, level || 'intermediate', userWeight);
                    const imageUrl = getMuscleImage(ex.muscle_en);

                    return {
                      name: ex.name_ar || ex.name_en,
                      targetMuscle: ex.muscle_ar || ex.muscle_en,
                      category: ex.category || 'IRON',
                      sets: ex.sets || 3,
                      reps: ex.reps_ar || ex.reps_en || '8-12',
                      weight: suggestedWeight,
                      exerciseTips: ex.instructions_ar || ex.description_ar || ex.instructions_en || 'أداء هادئ وتركيز كامل في الحركة.',
                      order: idx,
                      imageUrl: imageUrl,
                      videoUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent((ex.name_en || '') + ' exercise tutorial shorts')}`,
                    };
                  }),
                },
              })),
            },
          },
          include: {
            dayWorkouts: {
              include: {
                exercises: true,
              },
            },
          },
        });

        res.status(201).json(createdPlan);
      } catch (err: any) {
        console.error('[WorkoutController] Error parsing/saving Python plan:', err);
        res.status(500).json({ error: 'فشل معالجة وحفظ الجدول الرياضي الناتج.' });
      }
    });

  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || 'حدث خطأ أثناء توليد جدول التمارين' });
  }
};


// @desc    Get Active Workout Plan
// Helper to get muscle anatomy diagram URLs
const getAnatomyImage = (muscle: string): string => {
  const m = (muscle || '').toLowerCase();
  if (m.includes('chest') || m.includes('صدر')) {
    return 'https://www.fitliferegimen.com/wp-content/uploads/2021/04/Pectoralis-Major-Muscle.png';
  }
  if (m.includes('back') || m.includes('lats') || m.includes('ظهر')) {
    return 'https://www.fitliferegimen.com/wp-content/uploads/2021/05/Latissimus-Dorsi-Muscle.png';
  }
  if (m.includes('shoulder') || m.includes('deltoid') || m.includes('كتف')) {
    return 'https://www.fitliferegimen.com/wp-content/uploads/2021/04/Deltoid-Muscle.png';
  }
  if (m.includes('bicep') || m.includes('باي')) {
    return 'https://www.fitliferegimen.com/wp-content/uploads/2021/04/Biceps-Brachii-Muscle.png';
  }
  if (m.includes('tricep') || m.includes('تراي')) {
    return 'https://www.fitliferegimen.com/wp-content/uploads/2021/04/Triceps-Brachii-Muscle.png';
  }
  if (m.includes('leg') || m.includes('quad') || m.includes('hamstring') || m.includes('glute') || m.includes('رجل') || m.includes('فخذ')) {
    return 'https://www.fitliferegimen.com/wp-content/uploads/2021/05/Quadriceps-Femoris-Muscle.png';
  }
  if (m.includes('ab') || m.includes('core') || m.includes('بطن')) {
    return 'https://www.fitliferegimen.com/wp-content/uploads/2021/05/Rectus-Abdominis-Muscle.png';
  }
  return 'https://www.fitliferegimen.com/wp-content/uploads/2021/05/Rectus-Abdominis-Muscle.png';
};

// @route   GET /api/workout/active
export const getActivePlan = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;

  try {
    const activePlan = await prisma.workoutPlan.findFirst({
      where: { userId, active: true },
      include: {
        dayWorkouts: {
          orderBy: { dayIndex: 'asc' },
          include: {
            exercises: {
              orderBy: { order: 'asc' },
              include: {
                progressLogs: {
                  orderBy: { date: 'desc' },
                  take: 5,
                },
              },
            },
          },
        },
      },
    });

    if (!activePlan) {
      res.status(404).json({ error: 'لا يوجد جدول تمارين نشط حالياً. قم بإنشاء جدول جديد!' });
      return;
    }

    const mappedDayWorkouts = activePlan.dayWorkouts.map((day) => ({
      ...day,
      exercises: day.exercises.map((ex) => ({
        ...ex,
        anatomyImageUrl: getAnatomyImage(ex.targetMuscle || ''),
      })),
    }));

    res.status(200).json({
      ...activePlan,
      dayWorkouts: mappedDayWorkouts,
    });
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ أثناء جلب الجدول الرياضي' });
  }
};

// @desc    Update exercise details (Manual Customization)
// @route   PUT /api/workout/exercise/:id
export const updateExercise = async (req: AuthRequest, res: Response): Promise<void> => {
  const exerciseId = parseInt(req.params.id);
  const { sets, reps, weight, name, targetMuscle, exerciseTips } = req.body;

  try {
    const updated = await prisma.exercise.update({
      where: { id: exerciseId },
      data: {
        sets: sets ? parseInt(sets) : undefined,
        reps,
        weight,
        name,
        targetMuscle,
        exerciseTips,
      },
    });

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: 'فشل تعديل التمرين' });
  }
};

// @desc    Delete an exercise from plan
// @route   DELETE /api/workout/exercise/:id
export const deleteExercise = async (req: AuthRequest, res: Response): Promise<void> => {
  const exerciseId = parseInt(req.params.id);

  try {
    await prisma.exercise.delete({
      where: { id: exerciseId },
    });
    res.status(200).json({ message: 'تم حذف التمرين بنجاح' });
  } catch (error) {
    res.status(500).json({ error: 'فشل حذف التمرين' });
  }
};

// @desc    Add custom exercise to a Day
// @route   POST /api/workout/day/:dayId/exercise
export const addCustomExercise = async (req: AuthRequest, res: Response): Promise<void> => {
  const dayWorkoutId = parseInt(req.params.dayId);
  const { name, targetMuscle, category, sets, reps, weight, exerciseTips } = req.body;

  try {
    // Find highest order to place at the end
    const lastExercise = await prisma.exercise.findFirst({
      where: { dayWorkoutId },
      orderBy: { order: 'desc' },
    });

    const newOrder = lastExercise ? lastExercise.order + 1 : 0;

    const newEx = await prisma.exercise.create({
      data: {
        dayWorkoutId,
        name,
        targetMuscle: targetMuscle || 'عضلة عامة',
        category: category || 'IRON',
        sets: sets ? parseInt(sets) : 3,
        reps: reps || '10-12',
        weight: weight || 'Bodyweight',
        exerciseTips: exerciseTips || '',
        order: newOrder,
        imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=60',
        videoUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(name + ' exercise tutorial shorts')}`,
      },
    });

    res.status(201).json(newEx);
  } catch (error) {
    res.status(500).json({ error: 'فشل إضافة التمرين المخصص' });
  }
};

// @desc    Log progress for an exercise
// @route   POST /api/workout/exercise/:id/log
export const logProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  const exerciseId = parseInt(req.params.id);
  const { completedSets, repsCompleted, weightUsed, notes } = req.body;

  try {
    const log = await prisma.progressLog.create({
      data: {
        exerciseId,
        completedSets: parseInt(completedSets),
        repsCompleted,
        weightUsed,
        notes,
      },
    });

    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ error: 'فشل تسجيل تقدم التمرين' });
  }
};

// @desc    Create manual Workout Plan
// @route   POST /api/workout/manual
export const createManualPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const { title, durationWeeks, startDate } = req.body;

  try {
    if (!userId) {
      res.status(401).json({ error: 'غير مصرح' });
      return;
    }

    // Deactivate active plans
    await prisma.workoutPlan.updateMany({
      where: { userId, active: true },
      data: { active: false },
    });

    const startDateTime = startDate ? new Date(startDate) : new Date();

    const plan = await prisma.workoutPlan.create({
      data: {
        userId,
        title: title || 'جدولي الرياضي اليدوي',
        durationWeeks: durationWeeks || 4,
        startDate: startDateTime,
        active: true,
        weeklyTips: 'استمر وثابر في إتمام جدولك المصمم يدوياً!',
        isManual: true,
        dayWorkouts: {
          create: Array.from({ length: 7 }).map((_, i) => ({
            dayIndex: i + 1,
            title: `اليوم ${i + 1}`,
            focusArea: 'لم يحدد بعد',
            isRestDay: true, // Rest day by default, user can add exercises
          })),
        },
      },
      include: {
        dayWorkouts: true,
      },
    });

    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ error: 'فشل إنشاء الجدول اليدوي' });
  }
};

// @desc    Update day workout focus/status
// @route   PUT /api/workout/day/:dayId
export const updateDayWorkout = async (req: AuthRequest, res: Response): Promise<void> => {
  const dayId = parseInt(req.params.dayId);
  const { title, focusArea, isRestDay, dayTips } = req.body;

  try {
    const updated = await prisma.dayWorkout.update({
      where: { id: dayId },
      data: {
        title,
        focusArea,
        isRestDay: isRestDay !== undefined ? isRestDay : undefined,
        dayTips,
      },
    });

    // If rest day, delete exercises in it
    if (isRestDay === true) {
      await prisma.exercise.deleteMany({
        where: { dayWorkoutId: dayId },
      });
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: 'فشل تحديث تفاصيل اليوم الرياضي' });
  }
};

// @desc    Analyze plan completion & generate new upgraded plan
// @route   POST /api/workout/upgrade
export const upgradePlan = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;

  try {
    if (!userId) {
      res.status(401).json({ error: 'غير مصرح' });
      return;
    }

    const activePlan = await prisma.workoutPlan.findFirst({
      where: { userId, active: true },
      include: {
        dayWorkouts: {
          include: {
            exercises: {
              include: {
                progressLogs: true,
              },
            },
          },
        },
      },
    });

    if (!activePlan) {
      res.status(404).json({ error: 'لا يوجد جدول نشط لترقيته' });
      return;
    }

    // Calculate Completion Statistics
    let totalExercises = 0;
    let completedExercises = 0;

    activePlan.dayWorkouts.forEach(day => {
      day.exercises.forEach(ex => {
        totalExercises++;
        if (ex.progressLogs.length > 0) {
          completedExercises++;
        }
      });
    });

    const completionRate = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

    // Call Groq API to generate the UPGRADED plan
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: 'المستخدم غير موجود' });
      return;
    }

    let aiPlan;
    try {
      aiPlan = await upgradeWorkoutPlanAI(userId, activePlan.title, completionRate);
    } catch (aiErr) {
      console.error('Error upgrading workout plan:', aiErr);
      res.status(500).json({ error: 'فشل ترقية الجدول الرياضي بالذكاء الاصطناعي' });
      return;
    }

    // Deactivate previous active plans
    await prisma.workoutPlan.updateMany({
      where: { userId, active: true },
      data: { active: false },
    });

    const newStartDate = new Date(); // Starts today

    const upgradedPlan = await prisma.workoutPlan.create({
      data: {
        userId,
        title: aiPlan.title || 'جدولي الرياضي المطور',
        durationWeeks: activePlan.durationWeeks,
        startDate: newStartDate,
        active: true,
        weeklyTips: aiPlan.weeklyTips || '',
        isManual: false,
        dayWorkouts: {
          create: aiPlan.days.map((day: any) => ({
            dayIndex: day.dayIndex,
            title: day.title,
            focusArea: day.focusArea,
            dayTips: day.dayTips,
            isRestDay: day.isRestDay,
            exercises: {
              create: day.isRestDay ? [] : day.exercises.map((ex: any, idx: number) => ({
                name: ex.name,
                targetMuscle: ex.targetMuscle,
                category: ex.category || 'IRON',
                sets: ex.sets || 3,
                reps: ex.reps || '10-12',
                weight: ex.weight || 'Bodyweight',
                exerciseTips: ex.exerciseTips,
                order: idx,
                imageUrl: ex.imageUrl || `https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=60`,
                videoUrl: ex.videoUrl || `https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name + ' exercise tutorial shorts')}`,
              })),
            },
          })),
        },
      },
      include: {
        dayWorkouts: {
          include: {
            exercises: true,
          },
        },
      },
    });

    res.status(201).json({
      message: 'تم ترقية وتطوير جدول التمارين بنجاح بناءً على إنجازاتك السابقة!',
      completionRate,
      plan: upgradedPlan,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || 'فشل توليد ترقية الجدول الرياضي' });
  }
};

// @desc    Import Custom Bulk Exercise List
// @route   POST /api/workout/import-bulk
export const importBulkPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const { list } = req.body;

  try {
    if (!userId) {
      res.status(401).json({ error: 'غير مصرح بالدخول' });
      return;
    }

    if (!list || typeof list !== 'string') {
      res.status(400).json({ error: 'الرجاء إدخال قائمة تمارين صالحة.' });
      return;
    }

    const userProfile = await prisma.user.findUnique({
      where: { id: userId }
    });

    const gender = userProfile?.gender || 'MALE';
    const userWeight = userProfile?.currentWeight || 75;
    const level = userProfile?.foodPreferences ? 'intermediate' : 'beginner'; // fallback level

    const { exec } = require('child_process');
    const path = require('path');

    const pythonDir = path.join(__dirname, '../../../workout_generator_python');
    // Escape double quotes for shell safety
    const escapedList = list.replace(/"/g, '\\"').replace(/\n/g, '\\n');
    const command = `python src/bulk_importer.py --list "${escapedList}"`;

    console.log(`[WorkoutController] Bulk Import Command: ${command}`);

    exec(command, { cwd: pythonDir, env: process.env }, async (error: any, stdout: string, stderr: string) => {
      if (error) {
        console.error('[WorkoutController] Bulk Importer Error:', error, stderr);
        res.status(500).json({ error: 'فشل تشغيل مصنف التمارين محلياً.' });
        return;
      }

      try {
        const pythonExercises = JSON.parse(stdout);

        if (!Array.isArray(pythonExercises) || pythonExercises.length === 0) {
          res.status(400).json({ error: 'لم نتمكن من التعرف على أي تمارين في القائمة المدخلة.' });
          return;
        }

        // Generate AI Critique via Groq Llama 3.3
        const exerciseNames = pythonExercises.map((ex: any) => `${ex.name_ar} (${ex.name_en})`).join(', ');
        const prompt = `مرحباً أيها الكوتش المحترف. قام المستخدم باستيراد الجدول الرياضي التالي. الرجاء كتابة نقد وتقييم فني رياضي مفصل باللغة العربية (بين 3 إلى 5 جمل مركزة ومحفزة) للتمارين التالية، موضحاً مدى توازن العضلات ونقاط القوة والضعف ونصائح هامة للأداء:
        التمارين: ${exerciseNames}`;
        
        let critique = 'تم استيراد قائمة التمارين بنجاح. تذكر الحفاظ على الأداء الصحيح وزيادة الأحمال تدريجياً.';
        try {
          critique = await callGroq(prompt);
        } catch (groqErr) {
          console.error('[WorkoutController] Groq Critique Error:', groqErr);
        }

        // Deactivate previous plans
        await prisma.workoutPlan.updateMany({
          where: { userId, active: true },
          data: { active: false },
        });

        // Save new plan to Prisma
        const createdPlan = await prisma.workoutPlan.create({
          data: {
            userId,
            title: `جدول تمارين مستورد مخصص (${new Date().toLocaleDateString('ar-EG')})`,
            durationWeeks: 4,
            startDate: new Date(),
            active: true,
            weeklyTips: critique,
            isManual: true,
            dayWorkouts: {
              create: [
                {
                  dayIndex: 0,
                  title: 'الحصة الرياضية المستوردة',
                  focusArea: 'Imported Routine',
                  dayTips: 'ابدأ بالإحماء لمدة 5-10 دقائق قبل البدء.',
                  isRestDay: false,
                  exercises: {
                    create: pythonExercises.map((ex: any, idx: number) => {
                      const suggestedWeight = getSuggestedWeight(ex.name_en, ex.equipment_en, gender, level, userWeight);
                      const imageUrl = ex.image_url || getMuscleImage(ex.muscle_en);

                      return {
                        name: ex.name_ar || ex.name_en,
                        targetMuscle: ex.muscle_ar || ex.muscle_en,
                        category: ex.category || 'IRON',
                        sets: ex.sets || 3,
                        reps: ex.reps_ar || ex.reps_en || '8-12',
                        weight: suggestedWeight,
                        exerciseTips: ex.instructions_ar || ex.instructions_en || 'أداء هادئ مع التركيز الكامل.',
                        order: idx,
                        imageUrl: imageUrl,
                        videoUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent((ex.name_en || '') + ' exercise tutorial shorts')}`,
                      };
                    }),
                  },
                },
              ],
            },
          },
          include: {
            dayWorkouts: {
              include: {
                exercises: true,
              },
            },
          },
        });

        // Add dynamic anatomy images to response
        const mappedDayWorkouts = createdPlan.dayWorkouts.map((day) => ({
          ...day,
          exercises: day.exercises.map((ex) => ({
            ...ex,
            anatomyImageUrl: getAnatomyImage(ex.targetMuscle || ''),
          })),
        }));

        res.status(201).json({
          ...createdPlan,
          dayWorkouts: mappedDayWorkouts,
        });

      } catch (err: any) {
        console.error('[WorkoutController] Error parsing/saving bulk plan:', err);
        res.status(500).json({ error: 'فشل معالجة وحفظ الجدول المستورد.' });
      }
    });

  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || 'حدث خطأ أثناء استيراد الجدول' });
  }
};

// @desc    Get Inactive Workout Plans History
// @route   GET /api/workout/history
export const getPlanHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;

  try {
    if (!userId) {
      res.status(401).json({ error: 'غير مصرح بالدخول' });
      return;
    }

    const history = await prisma.workoutPlan.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        dayWorkouts: {
          orderBy: { dayIndex: 'asc' },
          include: {
            exercises: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    // Map anatomy images dynamically
    const mappedHistory = history.map((plan) => ({
      ...plan,
      dayWorkouts: plan.dayWorkouts.map((day) => ({
        ...day,
        exercises: day.exercises.map((ex) => ({
          ...ex,
          anatomyImageUrl: getAnatomyImage(ex.targetMuscle || ''),
        })),
      })),
    }));

    res.status(200).json(mappedHistory);
  } catch (error: any) {
    res.status(500).json({ error: 'فشل جلب سجل البرامج الرياضية السابقة.' });
  }
};

// @desc    Activate a Specific Historical Workout Plan
// @route   POST /api/workout/:id/activate
export const activateHistoricalPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const planId = parseInt(req.params.id);

  try {
    if (!userId) {
      res.status(401).json({ error: 'غير مصرح بالدخول' });
      return;
    }

    // Check that this plan belongs to the user
    const plan = await prisma.workoutPlan.findFirst({
      where: { id: planId, userId },
    });

    if (!plan) {
      res.status(404).json({ error: 'البرنامج الرياضي غير موجود أو لا ينتمي لهذا المستخدم.' });
      return;
    }

    // Deactivate current active plans
    await prisma.workoutPlan.updateMany({
      where: { userId, active: true },
      data: { active: false },
    });

    // Activate the selected plan
    const updated = await prisma.workoutPlan.update({
      where: { id: planId },
      data: { active: true },
      include: {
        dayWorkouts: {
          orderBy: { dayIndex: 'asc' },
          include: {
            exercises: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    // Map anatomy images
    const mappedDayWorkouts = updated.dayWorkouts.map((day) => ({
      ...day,
      exercises: day.exercises.map((ex) => ({
        ...ex,
        anatomyImageUrl: getAnatomyImage(ex.targetMuscle || ''),
      })),
    }));

    res.status(200).json({
      ...updated,
      dayWorkouts: mappedDayWorkouts,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'فشل تفعيل البرنامج الرياضي المحدد.' });
  }
};

// @desc    Get Exercises Library in Tree Hierarchy (Shajara)
// @route   GET /api/workout/library-tree
export const getLibraryTree = async (_req: AuthRequest, res: Response): Promise<void> => {
  const sqlite3 = require('sqlite3').verbose();
  const path = require('path');
  const dbPath = path.join(__dirname, '../../../workout_generator_python/database/exercises.db');
  
  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err: any) => {
    if (err) {
      console.error('[LibraryTree] Database connection error:', err);
      res.status(500).json({ error: 'فشل الاتصال بقاعدة بيانات التمارين.' });
      return;
    }
  });

  const query = `
    SELECT id, name_en, name_ar, muscle_en, muscle_ar, equipment_en, equipment_ar, category, image_url, instructions_ar, instructions_en
    FROM exercises 
    ORDER BY muscle_en ASC, rating DESC
  `;

  db.all(query, [], (err: any, rows: any[]) => {
    db.close();
    if (err) {
      console.error('[LibraryTree] Query error:', err);
      res.status(500).json({ error: 'فشل قراءة التمارين من قاعدة البيانات.' });
      return;
    }

    // Define Division classifications
    const divisions: { [key: string]: { name_en: string; name_ar: string; muscles: { [key: string]: any } } } = {
      "upper": {
        name_en: "Upper Body",
        name_ar: "الجزء العلوي",
        muscles: {}
      },
      "lower": {
        name_en: "Lower Body",
        name_ar: "الجزء السفلي",
        muscles: {}
      },
      "core_cardio": {
        name_en: "Core & Fitness",
        name_ar: "البطن واللياقة",
        muscles: {}
      }
    };

    rows.forEach((row) => {
      const muscleEn = row.muscle_en || 'Other';
      const muscleAr = row.muscle_ar || 'أخرى';
      const mLower = muscleEn.toLowerCase();

      // Resolve division category
      let divKey = "core_cardio";
      if (['chest', 'lats', 'middle back', 'lower back', 'shoulders', 'traps', 'biceps', 'triceps', 'forearms'].includes(mLower)) {
        divKey = "upper";
      } else if (['quadriceps', 'hamstrings', 'glutes', 'calves'].includes(mLower)) {
        divKey = "lower";
      }

      const musclesGroup = divisions[divKey].muscles;
      if (!musclesGroup[muscleEn]) {
        musclesGroup[muscleEn] = {
          name_en: muscleEn,
          name_ar: muscleAr,
          exercises: []
        };
      }

      musclesGroup[muscleEn].exercises.push({
        id: row.id,
        name_en: row.name_en,
        name_ar: row.name_ar || row.name_en,
        equipment_en: row.equipment_en || 'None',
        equipment_ar: row.equipment_ar || 'بدون أدوات',
        category: row.category || 'IRON',
        image_url: row.image_url || getMuscleImage(muscleEn),
        instructions_en: row.instructions_en || '',
        instructions_ar: row.instructions_ar || '',
        video_url: `https://www.youtube.com/results?search_query=${encodeURIComponent((row.name_en || '') + ' exercise tutorial shorts')}`,
        anatomy_image_url: getAnatomyImage(muscleEn)
      });
    });

    // Format to a clean frontend tree structure
    const treeData = Object.keys(divisions).map((key) => {
      const div = divisions[key];
      return {
        key: key,
        label_en: div.name_en,
        label_ar: div.name_ar,
        children: Object.keys(div.muscles).map((mKey) => {
          const mus = div.muscles[mKey];
          return {
            key: `${key}-${mKey.replace(/\s+/g, '-')}`,
            label_en: mus.name_en,
            label_ar: mus.name_ar,
            exercises: mus.exercises
          };
        })
      };
    });

    res.status(200).json(treeData);
  });
};
