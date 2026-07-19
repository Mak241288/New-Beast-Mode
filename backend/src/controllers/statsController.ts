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

    // Fetch all progress logs historically for this user (across all active or inactive plans)
    const allLogs = await prisma.progressLog.findMany({
      where: {
        exercise: {
          dayWorkout: {
            plan: {
              userId
            }
          }
        }
      },
      include: {
        exercise: true
      },
      orderBy: { date: 'asc' }
    });

    // Calculate Personal Records (PR)
    // Keep only the heaviest weight (and corresponding reps/date) per exercise
    const prMap = new Map<string, { exercise: string; weight: number; reps: number; date: Date }>();

    allLogs.forEach(log => {
      const exerciseName = log.exercise.name;
      const weights = log.weightUsed ? log.weightUsed.split(',') : [];
      const reps = log.repsCompleted ? log.repsCompleted.split(',') : [];

      let maxWeight = -1;
      let maxWeightReps = 0;

      weights.forEach((wStr, idx) => {
        const weightVal = parseFloat(wStr.replace(/[^0-9.]/g, '')) || 0;
        const repVal = parseInt(reps[idx]) || 0;
        if (weightVal > maxWeight) {
          maxWeight = weightVal;
          maxWeightReps = repVal;
        } else if (weightVal === maxWeight && repVal > maxWeightReps) {
          maxWeightReps = repVal;
        }
      });

      if (maxWeight > 0) {
        const existing = prMap.get(exerciseName);
        if (!existing || maxWeight > existing.weight) {
          prMap.set(exerciseName, {
            exercise: exerciseName,
            weight: maxWeight,
            reps: maxWeightReps,
            date: log.date
          });
        }
      }
    });

    const personalRecords = Array.from(prMap.values());

    // Calculate global streak (consecutive days of completed workouts)
    let globalStreak = 0;
    if (allLogs.length > 0) {
      const uniqueDates = Array.from(new Set(allLogs.map(log => {
        const d = new Date(log.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      }))).sort((a, b) => a - b);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const todayTime = today.getTime();
      const yesterdayTime = yesterday.getTime();
      const lastLogTime = uniqueDates[uniqueDates.length - 1];

      if (lastLogTime === todayTime || lastLogTime === yesterdayTime) {
        globalStreak = 1;
        let checkTime = lastLogTime;
        for (let i = uniqueDates.length - 2; i >= 0; i--) {
          const prevTime = uniqueDates[i];
          const diffDays = Math.round((checkTime - prevTime) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            globalStreak++;
            checkTime = prevTime;
          } else if (diffDays > 1) {
            break;
          }
        }
      }
    }

    // Calculate global workouts (number of unique calendar days with logged exercises)
    const loggedDays = new Set(allLogs.map(log => new Date(log.date).toDateString()));
    const globalWorkouts = loggedDays.size;

    // Calculate estimated global minutes (each completed set takes ~2 minutes)
    const totalSets = allLogs.reduce((sum, log) => sum + log.completedSets, 0);
    const globalMinutes = totalSets * 2;

    // Calculate total completed exercises historically
    const globalExercises = allLogs.length;

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
        globalStreak,
        globalWorkouts,
        globalMinutes,
        globalExercises,
      },
      personalRecords,
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
