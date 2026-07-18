import { Response } from 'express';
import prisma from '../services/db';
import { AuthRequest } from '../middleware/auth';

// @desc    Get comprehensive stats for the user
// @route   GET /api/stats
export const getStats = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;

  try {
    if (!userId) {
      res.status(401).json({ error: 'غير مصرح' });
      return;
    }

    // 1. Weight History
    const weightHistory = await prisma.weightLog.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
    });

    // 2. Active Workout Plan completion stats
    const activeWorkoutPlan = await prisma.workoutPlan.findFirst({
      where: { userId, active: true },
      include: {
        dayWorkouts: {
          include: {
            exercises: {
              include: {
                progressLogs: {
                  orderBy: { date: 'desc' },
                },
              },
            },
          },
        },
      },
    });

    let workoutStats = {
      totalExercises: 0,
      completedExercises: 0,
      completionRate: 0,
      strengthTrend: [] as any[],
    };

    if (activeWorkoutPlan) {
      activeWorkoutPlan.dayWorkouts.forEach(day => {
        day.exercises.forEach(ex => {
          workoutStats.totalExercises++;
          if (ex.progressLogs.length > 0) {
            workoutStats.completedExercises++;

            // Map progress for strength trend
            ex.progressLogs.forEach(log => {
              // Extract first weight if comma-separated e.g. "15kg, 15kg" -> 15
              const cleanWeight = log.weightUsed ? parseFloat(log.weightUsed.replace(/[^0-9.]/g, '')) : 0;
              workoutStats.strengthTrend.push({
                exerciseName: ex.name,
                date: log.date,
                weight: cleanWeight,
                reps: log.repsCompleted,
              });
            });
          }
        });
      });

      workoutStats.completionRate = workoutStats.totalExercises > 0
        ? (workoutStats.completedExercises / workoutStats.totalExercises) * 100
        : 0;
    }

    // Sort strength trend by date
    workoutStats.strengthTrend.sort((a: any, b: any) => a.date.getTime() - b.date.getTime());

    // 3. Nutrition Calories History (removed)
    const nutritionStats: any[] = [];

    // 4. Combined Notes History (feelings, workouts, weights)
    const notesHistory: { type: string; date: Date; text: string }[] = [];

    // Add weight notes
    weightHistory.forEach(log => {
      if (log.notes) {
        notesHistory.push({
          type: 'وزن الجسم',
          date: log.date,
          text: `تحديث وزن الجسم إلى ${log.weight} كجم. الملاحظات: ${log.notes}`,
        });
      }
    });

    // Add exercise progress notes
    if (activeWorkoutPlan) {
      activeWorkoutPlan.dayWorkouts.forEach(day => {
        day.exercises.forEach(ex => {
          ex.progressLogs.forEach(log => {
            if (log.notes) {
              notesHistory.push({
                type: `تمرين: ${ex.name}`,
                date: log.date,
                text: `الجولات: ${log.completedSets}، التكرارات: ${log.repsCompleted}. الملاحظات: ${log.notes}`,
              });
            }
          });
        });
      });
    }

    // Sort notes by date descending
    notesHistory.sort((a, b) => b.date.getTime() - a.date.getTime());

    // Fetch user details for BMI calculation
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { height: true, currentWeight: true }
    });

    let bmiValue = 0;
    let bmiCategory = 'UNKNOWN';
    if (user && user.height && user.currentWeight) {
      const heightInMeters = user.height / 100;
      bmiValue = user.currentWeight / (heightInMeters * heightInMeters);
      
      if (bmiValue < 18.5) bmiCategory = 'UNDERWEIGHT';
      else if (bmiValue < 25) bmiCategory = 'NORMAL';
      else if (bmiValue < 30) bmiCategory = 'OVERWEIGHT';
      else bmiCategory = 'OBESE';
    }

    res.status(200).json({
      weightHistory,
      workoutStats: {
        totalExercises: workoutStats.totalExercises,
        completedExercises: workoutStats.completedExercises,
        completionRate: workoutStats.completionRate,
        strengthTrend: workoutStats.strengthTrend,
      },
      nutritionStats,
      notesHistory: notesHistory.slice(0, 20), // top 20 notes
      bmi: {
        value: parseFloat(bmiValue.toFixed(1)),
        category: bmiCategory,
        height: user?.height || 0,
        weight: user?.currentWeight || 0
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب الإحصاءات' });
  }
};
