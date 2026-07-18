import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../services/db';
import { suggestCheckInRecommendation } from '../services/aiService';

export const getCheckInStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const force = req.query.force === 'true';

  try {
    // Find the earliest progress log to establish the "first workout" date
    const firstLog = await prisma.progressLog.findFirst({
      where: {
        exercise: {
          dayWorkout: {
            plan: { userId }
          }
        }
      },
      orderBy: { date: 'asc' }
    });

    const latestCheckIn = await prisma.checkIn.findFirst({
      where: { userId },
      orderBy: { date: 'desc' }
    });

    let due = false;
    let daysSinceFirst = 0;
    let daysRemaining = 0;

    if (firstLog) {
      const now = new Date();
      const firstDate = new Date(firstLog.date);
      daysSinceFirst = Math.floor((now.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceFirst >= 7) {
        if (!latestCheckIn) {
          due = true;
        } else {
          const lastDate = new Date(latestCheckIn.date);
          const daysSinceLast = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          if (daysSinceLast >= 7) {
            due = true;
          } else {
            daysRemaining = Math.max(0, 7 - daysSinceLast);
          }
        }
      } else {
        daysRemaining = Math.max(0, 7 - daysSinceFirst);
      }
    }

    if (force) {
      due = true;
      daysRemaining = 0;
    }

    res.json({
      due,
      hasStartedWorkouts: !!firstLog,
      daysSinceFirst,
      daysRemaining,
      latestCheckIn
    });
  } catch (error: any) {
    console.error('[getCheckInStatus] Error:', error);
    res.status(500).json({ error: 'فشل التحقق من حالة التقييم الأسبوعي.' });
  }
};

export const submitCheckIn = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { workoutFeel, sessionsCompleted, painNotes, lang } = req.body;

  try {
    const activePlan = await prisma.workoutPlan.findFirst({
      where: { userId, active: true },
      include: {
        dayWorkouts: {
          include: { exercises: true }
        }
      }
    }) as any;

    if (!activePlan) {
      res.status(404).json({ error: 'لا توجد خطة رياضية نشطة حالياً.' });
      return;
    }

    // Build simple text summary of the current plan to feed to the AI
    const daysSummary = activePlan.dayWorkouts
      .map((dw: any) => `Day ${dw.dayIndex} (${dw.title}): ${dw.isRestDay ? 'Rest' : dw.exercises.length + ' exercises'}`)
      .join(', ');

    const planSummary = `${activePlan.title} with workouts: ${daysSummary}`;

    // Get coaching recommendation from AI
    const recommendation = await suggestCheckInRecommendation(
      workoutFeel,
      sessionsCompleted,
      painNotes || '',
      planSummary,
      lang || 'en'
    );

    // Save check-in
    const newCheckIn = await prisma.checkIn.create({
      data: {
        userId,
        workoutFeel,
        sessionsCompleted,
        painNotes: painNotes || null,
        aiRecommendation: recommendation,
        applied: false
      }
    });

    res.status(201).json({
      success: true,
      checkIn: newCheckIn
    });
  } catch (error: any) {
    console.error('[submitCheckIn] Error:', error);
    res.status(500).json({ error: 'فشل إرسال التقييم الأسبوعي.' });
  }
};

export const applySuggestions = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.id;

  try {
    const latestCheckIn = await prisma.checkIn.findFirst({
      where: { userId, applied: false },
      orderBy: { date: 'desc' }
    });

    if (!latestCheckIn) {
      res.status(400).json({ error: 'لا يوجد تقييم أسبوعي معلق لتطبيق تعديلاته.' });
      return;
    }

    const activePlan = await prisma.workoutPlan.findFirst({
      where: { userId, active: true },
      include: {
        dayWorkouts: {
          include: { exercises: true }
        }
      }
    }) as any;

    if (!activePlan) {
      res.status(404).json({ error: 'لم يتم العثور على خطة تمارين نشطة لتعديلها.' });
      return;
    }

    // Rules-based plan adjustments:
    // 1. TOO EASY -> Make it harder: increase reps by 2
    if (latestCheckIn.workoutFeel === 'EASY') {
      for (const day of activePlan.dayWorkouts) {
        if (day.isRestDay) continue;
        for (const ex of day.exercises) {
          let newReps = ex.reps;
          const rangeMatch = ex.reps.match(/(\d+)-(\d+)/);
          if (rangeMatch) {
            const min = parseInt(rangeMatch[1]) + 2;
            const max = parseInt(rangeMatch[2]) + 2;
            newReps = `${min}-${max}`;
          } else {
            const singleMatch = ex.reps.match(/^(\d+)$/);
            if (singleMatch) {
              newReps = String(parseInt(singleMatch[1]) + 2);
            }
          }
          await prisma.exercise.update({
            where: { id: ex.id },
            data: { reps: newReps }
          });
        }
      }
    }

    // 2. TOO HARD -> Make it easier: decrease sets by 1 (minimum 2 sets)
    if (latestCheckIn.workoutFeel === 'HARD') {
      for (const day of activePlan.dayWorkouts) {
        if (day.isRestDay) continue;
        for (const ex of day.exercises) {
          const newSets = Math.max(2, ex.sets - 1);
          await prisma.exercise.update({
            where: { id: ex.id },
            data: { sets: newSets }
          });
        }
      }
    }

    // 3. Pain / Discomfort noted -> Append form warning to exercise tips and day tips
    if (latestCheckIn.painNotes) {
      const warningText = `⚠️ NOTE: Avoid overload due to recent pain: ${latestCheckIn.painNotes}`;
      for (const day of activePlan.dayWorkouts) {
        if (day.isRestDay) continue;
        const currentTips = day.dayTips || '';
        await prisma.dayWorkout.update({
          where: { id: day.id },
          data: {
            dayTips: currentTips ? `${currentTips}\n${warningText}` : warningText
          }
        });
      }
    }

    // Mark check-in as applied
    await prisma.checkIn.update({
      where: { id: latestCheckIn.id },
      data: { applied: true }
    });

    res.json({
      success: true,
      message: 'تم تطبيق اقتراحات الكوتش بنجاح وتحديث خطة تمارينك!'
    });
  } catch (error: any) {
    console.error('[applySuggestions] Error:', error);
    res.status(500).json({ error: 'فشل تطبيق تعديلات الخطة التدريبية.' });
  }
};
