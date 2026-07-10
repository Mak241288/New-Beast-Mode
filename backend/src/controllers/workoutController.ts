import { Response } from 'express';
import prisma from '../services/db';
import { AuthRequest } from '../middleware/auth';
import { generateWorkoutPlanAI } from '../services/aiService';
import { GoogleGenAI } from '@google/genai';

// @desc    Generate Workout Plan using AI
// @route   POST /api/workout/generate
export const generatePlan = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const { durationWeeks, startDate, workoutLocation, equipment, level, additionalQuestions } = req.body;

  try {
    if (!userId) {
      res.status(401).json({ error: 'غير مصرح بالدخول' });
      return;
    }

    const startDateTime = startDate ? new Date(startDate) : new Date();

    // Call AI Service
    const aiPlan = await generateWorkoutPlanAI(userId, {
      durationWeeks: durationWeeks || 4,
      startDate: startDateTime,
      workoutLocation: workoutLocation || 'GYM',
      equipment: equipment || [],
      level: level || 'beginner',
      additionalQuestions: additionalQuestions || {},
    });

    // Deactivate previous active plans
    await prisma.workoutPlan.updateMany({
      where: { userId, active: true },
      data: { active: false },
    });

    // Save WorkoutPlan to Database
    const createdPlan = await prisma.workoutPlan.create({
      data: {
        userId,
        title: aiPlan.title || `جدول تمارين مخصص للمستوى ${level}`,
        durationWeeks: durationWeeks || 4,
        startDate: startDateTime,
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
                // Match with Library to get standard image/video URL if available, else query links
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

    res.status(201).json(createdPlan);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || 'حدث خطأ أثناء توليد جدول التمارين' });
  }
};

// @desc    Get Active Workout Plan
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

    res.status(200).json(activePlan);
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

    // Call Gemini API to generate the UPGRADED plan
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      res.status(400).json({ error: 'مفتاح Gemini API غير متاح لتوليد الترقية' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: 'المستخدم غير موجود' });
      return;
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
    أنت مدرب رياضي وطبيب علاج طبيعي بخبرة 66 عاماً.
    المستخدم ${user.name} أنهى بنجاح جدول التمارين السابق الذي عنوانه "${activePlan.title}".
    - نسبة الالتزام الإجمالية بإدخال التمارين وإكمالها: ${completionRate.toFixed(1)}%.
    - مستوى لياقته: ${user.currentWeight ? 'الوزن الحالي: ' + user.currentWeight + ' كجم' : ''}، موقع تمرينه: ${user.workoutLocation || 'GYM'}.

    بناءً على هذا الإنجاز، نريد توليد جدول تمارين جديد تماماً يمثل "المرحلة القادمة" المتطورة (Progressive Overload).
    - إذا كانت نسبة التزامه عالية (>75%)، زد مستوى الشدة والأوزان أو التمارين تدريجياً.
    - إذا كانت نسبة الالتزام منخفضة، ركز على بناء الأساسيات وتعديل التمارين الصعبة لجعلها أكثر إتاحة وحماساً.
    - التزم بمسميات أيام وأسابيع جذابة ومحفزة للغاية باللغة العربية.

    أعد النتيجة بصيغة JSON حصراً مطابقة تماماً للمواصفات التالية:
    {
      "title": "عنوان الجدول الرياضي الجديد المتطور لرفع الصعوبة تدريجياً",
      "weeklyTips": "نصائح الأسبوع الجديد للتعامل مع الصعوبة الإضافية أو الاستمرار",
      "days": [
        {
          "dayIndex": 1,
          "title": "مسمى اليوم الجديد الجذاب والمحفز",
          "focusArea": "العضلات المستهدفة",
          "dayTips": "نصائح إحماء واستشفاء خاصة بهذا اليوم",
          "isRestDay": false,
          "exercises": [
            {
              "name": "اسم التمرين باللغة العربية مع الاسم الإنجليزي",
              "targetMuscle": "العضلة المستهدفة بدقة",
              "category": "تصنيف التمرين: IRON، YOGA، PILATES، HIIT، CARDIO، CALISTHENICS",
              "sets": 3,
              "reps": "تكرارات أو زمن متطور (مثال: زيادة جولة أو تقليل تكرارات مع رفع أوزان)",
              "weight": "الوزن الجديد المقترح المتطور (مثال: زيادة 2.5 كجم عن السابق أو إبقاء وزن الجسم للمقاومة)",
              "exerciseTips": "نصائح دقيقة للأداء الصحيح للنسخة المطورة من التمرين"
            }
          ]
        }
      ]
    }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const aiPlan = JSON.parse(response.text || '{}');

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
