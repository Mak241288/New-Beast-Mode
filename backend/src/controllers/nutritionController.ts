import { Response } from 'express';
import prisma from '../services/db';
import { AuthRequest } from '../middleware/auth';
import { generateNutritionPlanAI, parseMealTextAI } from '../services/aiService';

// Helper to format date without time for day-by-day lookup
const getStartOfDay = (dateInput?: string | Date) => {
  const d = dateInput ? new Date(dateInput) : new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

// @desc    Get or Generate Nutrition Plan for a specific date
// @route   GET /api/nutrition/day
export const getNutritionPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const { date } = req.query;

  try {
    if (!userId) {
      res.status(401).json({ error: 'غير مصرح بالدخول' });
      return;
    }

    const targetDate = getStartOfDay(date as string);

    // 1. Try to find existing plan in DB
    let nutritionPlan = await prisma.nutritionPlan.findUnique({
      where: {
        userId_date: {
          userId,
          date: targetDate,
        },
      },
      include: {
        mealsLogged: true,
      },
    });

    // 2. If it exists, return it
    if (nutritionPlan) {
      res.status(200).json(nutritionPlan);
      return;
    }

    // 3. If it doesn't exist, we must generate it using Gemini
    // First find if today is a workout day to sync nutrition goals
    const activeWorkoutPlan = await prisma.workoutPlan.findFirst({
      where: { userId, active: true },
      include: {
        dayWorkouts: {
          include: { exercises: true },
        },
      },
    });

    let isTrainingDay = false;
    let dayTitle = 'يوم راحة';
    let workoutPlanTitle = 'بدون خطة نشطة';

    if (activeWorkoutPlan) {
      workoutPlanTitle = activeWorkoutPlan.title;
      // Calculate which day of the week it is based on the start date
      const msDiff = targetDate.getTime() - getStartOfDay(activeWorkoutPlan.startDate).getTime();
      const daysDiff = Math.floor(msDiff / (1000 * 60 * 60 * 24));
      // Map it to a 1-7 index (1-indexed day of the week)
      // If user starts on a Wednesday, Day 1 is Wednesday.
      let dayIndex = (daysDiff % 7) + 1;
      if (dayIndex < 1) dayIndex += 7; // Handle dates before start date safely

      const matchingDay = activeWorkoutPlan.dayWorkouts.find(dw => dw.dayIndex === dayIndex);
      if (matchingDay) {
        isTrainingDay = !matchingDay.isRestDay;
        dayTitle = matchingDay.title;
      }
    }

    // Call AI to generate nutrition details
    const aiPlan = await generateNutritionPlanAI(userId, workoutPlanTitle, isTrainingDay, dayTitle);

    // Save to Database
    nutritionPlan = await prisma.nutritionPlan.create({
      data: {
        userId,
        date: targetDate,
        caloriesGoal: aiPlan.caloriesGoal || 2000,
        proteinGoal: aiPlan.proteinGoal || 150,
        carbsGoal: aiPlan.carbsGoal || 200,
        fatGoal: aiPlan.fatGoal || 65,
        breakfast: aiPlan.breakfast || 'فطور صحي متوازن',
        lunch: aiPlan.lunch || 'غداء صحي متوازن',
        dinner: aiPlan.dinner || 'عشاء صحي متوازن',
        snacks: aiPlan.snacks || 'سناك خفيف',
        syncWithWorkout: true,
        waterLoggedMl: 0,
      },
      include: {
        mealsLogged: true,
      },
    });

    res.status(201).json(nutritionPlan);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || 'حدث خطأ أثناء جلب أو توليد خطة التغذية' });
  }
};

// @desc    Log meal using AI text parser
// @route   POST /api/nutrition/meal/text
export const logMealText = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const { mealText, date } = req.body;

  try {
    if (!userId || !mealText) {
      res.status(400).json({ error: 'الرجاء إدخال نص الوجبة' });
      return;
    }

    const targetDate = getStartOfDay(date);

    // 1. Ensure nutrition plan exists for this day
    let nutritionPlan = await prisma.nutritionPlan.findUnique({
      where: {
        userId_date: {
          userId,
          date: targetDate,
        },
      },
    });

    if (!nutritionPlan) {
      // Generate standard plan if not exist
      // We will do a fast creation
      nutritionPlan = await prisma.nutritionPlan.create({
        data: {
          userId,
          date: targetDate,
          caloriesGoal: 2000,
          proteinGoal: 150,
          carbsGoal: 200,
          fatGoal: 65,
          breakfast: 'فطور صحي',
          lunch: 'غداء صحي',
          dinner: 'عشاء صحي',
          waterLoggedMl: 0,
        },
      });
    }

    // 2. Call Gemini parser
    const parsedMeal = await parseMealTextAI(mealText);

    // 3. Create meal log
    const mealLog = await prisma.mealLog.create({
      data: {
        nutritionPlanId: nutritionPlan.id,
        description: parsedMeal.description || mealText,
        calories: parsedMeal.calories || 0,
        protein: parsedMeal.protein || 0,
        carbs: parsedMeal.carbs || 0,
        fat: parsedMeal.fat || 0,
      },
    });

    res.status(201).json({
      message: 'تم تحليل وتسجيل الوجبة بنجاح بالذكاء الاصطناعي',
      mealLog,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || 'فشل تحليل الوجبة بالذكاء الاصطناعي' });
  }
};

// @desc    Log meal manually
// @route   POST /api/nutrition/meal/manual
export const logMealManual = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const { description, calories, protein, carbs, fat, date } = req.body;

  try {
    if (!userId || !description) {
      res.status(400).json({ error: 'الرجاء إدخال وصف الوجبة' });
      return;
    }

    const targetDate = getStartOfDay(date);

    let nutritionPlan = await prisma.nutritionPlan.findUnique({
      where: {
        userId_date: {
          userId,
          date: targetDate,
        },
      },
    });

    if (!nutritionPlan) {
      nutritionPlan = await prisma.nutritionPlan.create({
        data: {
          userId,
          date: targetDate,
          caloriesGoal: 2000,
          proteinGoal: 150,
          carbsGoal: 200,
          fatGoal: 65,
          breakfast: 'فطور صحي',
          lunch: 'غداء صحي',
          dinner: 'عشاء صحي',
        },
      });
    }

    const mealLog = await prisma.mealLog.create({
      data: {
        nutritionPlanId: nutritionPlan.id,
        description,
        calories: parseInt(calories) || 0,
        protein: parseInt(protein) || 0,
        carbs: parseInt(carbs) || 0,
        fat: parseInt(fat) || 0,
      },
    });

    res.status(201).json(mealLog);
  } catch (error) {
    res.status(500).json({ error: 'فشل تسجيل الوجبة يدوياً' });
  }
};

// @desc    Delete meal log
// @route   DELETE /api/nutrition/meal/:id
export const deleteMealLog = async (req: AuthRequest, res: Response): Promise<void> => {
  const mealId = parseInt(req.params.id);

  try {
    await prisma.mealLog.delete({
      where: { id: mealId },
    });
    res.status(200).json({ message: 'تم حذف الوجبة بنجاح' });
  } catch (error) {
    res.status(500).json({ error: 'فشل حذف الوجبة' });
  }
};

// @desc    Log water intake
// @route   POST /api/nutrition/water
export const logWater = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const { amountMl, date } = req.body;

  try {
    if (!userId || amountMl === undefined) {
      res.status(400).json({ error: 'الرجاء إدخال كمية الماء بالمليلتر' });
      return;
    }

    const targetDate = getStartOfDay(date);

    let nutritionPlan = await prisma.nutritionPlan.findUnique({
      where: {
        userId_date: {
          userId,
          date: targetDate,
        },
      },
    });

    if (!nutritionPlan) {
      nutritionPlan = await prisma.nutritionPlan.create({
        data: {
          userId,
          date: targetDate,
          caloriesGoal: 2000,
          proteinGoal: 150,
          carbsGoal: 200,
          fatGoal: 65,
          breakfast: 'فطور صحي',
          lunch: 'غداء صحي',
          dinner: 'عشاء صحي',
          waterLoggedMl: 0,
        },
      });
    }

    const updated = await prisma.nutritionPlan.update({
      where: { id: nutritionPlan.id },
      data: {
        waterLoggedMl: {
          increment: parseInt(amountMl),
        },
      },
    });

    res.status(200).json({ waterLoggedMl: updated.waterLoggedMl });
  } catch (error) {
    res.status(500).json({ error: 'فشل تسجيل الماء' });
  }
};
