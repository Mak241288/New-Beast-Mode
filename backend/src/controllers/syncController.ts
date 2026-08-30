import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { syncService } from '../services/syncService';
import { execFile } from 'child_process';
import path from 'path';
import prisma from '../services/db';
import { logger } from '../services/logger';

const parseSafeDate = (val: any): Date | undefined => {
  if (!val) return undefined;
  const d = new Date(val);
  return isNaN(d.getTime()) ? undefined : d;
};

const parseSafeNumber = (val: any): number | null => {
  if (val === undefined || val === null || val === '') return null;
  const clean = typeof val === 'string' ? parseFloat(val.replace(/[^0-9.-]/g, '')) : Number(val);
  return isNaN(clean) ? null : clean;
};

export const syncController = {
  async fullPull(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = Number(req.user?.id);
      if (!userId || isNaN(userId)) {
        res.status(401).json({ error: 'غير مصرح - معرف المستخدم غير صالح' });
        return;
      }

      // Single unified query to prevent connection pool exhaustion (P2024)
      const userWithData = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          workoutPlans: {
            include: {
              dayWorkouts: {
                include: {
                  exercises: {
                    include: {
                      progressLogs: {
                        take: 10,
                        orderBy: { date: 'desc' },
                      },
                    },
                  },
                },
                orderBy: { dayIndex: 'asc' },
              },
            },
            orderBy: { updatedAt: 'desc' },
            take: 10,
          },
          weightLogs: {
            orderBy: { date: 'desc' },
            take: 60,
          },
        },
      });

      if (!userWithData) {
        res.status(404).json({ error: 'المستخدم غير موجود' });
        return;
      }

      // Sequential light query for checkins using the same connection
      const checkIns = await prisma.checkIn.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 30,
      });

      const { workoutPlans, weightLogs, ...userData } = userWithData;
      
      // Deduplicate workoutPlans by title and ID
      const distinctPlans: any[] = [];
      const seenTitles = new Set<string>();
      for (const p of workoutPlans) {
        const cleanTitle = (p.title || '').trim().toLowerCase();
        if (!seenTitles.has(cleanTitle)) {
          seenTitles.add(cleanTitle);
          distinctPlans.push(p);
        }
      }

      const activePlan = distinctPlans.find((p) => p.active) || distinctPlans[0] || null;

      res.status(200).json({
        success: true,
        timestamp: Date.now(),
        data: {
          user: userData,
          activePlan,
          workoutPlans: distinctPlans,
          weightLogs,
          checkIns,
        },
      });
    } catch (err: any) {
      logger.error('[SyncController] fullPull error:', {
        message: err?.message,
        code: err?.code,
        stack: err?.stack,
      });
      res.status(500).json({ error: 'فشل جلب البيانات السحابية الكاملة', message: err?.message });
    }
  },

  async fullPush(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = Number(req.user?.id);
      if (!userId || isNaN(userId)) {
        res.status(401).json({ error: 'غير مصرح - معرف المستخدم غير صالح' });
        return;
      }

      const {
        userProfile,
        activePlan,
        weightLogs,
        checkIns,
      } = req.body || {};

      // 1. Direct User Profile & Weight Update (No long-lived transaction lock)
      if (userProfile && typeof userProfile === 'object') {
        const updateData: any = {};
        if (userProfile.name) updateData.name = String(userProfile.name).trim().substring(0, 150);
        if (userProfile.gender) updateData.gender = String(userProfile.gender).toUpperCase();
        
        const heightNum = parseSafeNumber(userProfile.height);
        if (heightNum !== null) updateData.height = heightNum;

        const currentWeightNum = parseSafeNumber(userProfile.currentWeight);
        if (currentWeightNum !== null) updateData.currentWeight = currentWeightNum;

        const targetWeightNum = parseSafeNumber(userProfile.targetWeight);
        if (targetWeightNum !== null) updateData.targetWeight = targetWeightNum;

        const ageNum = parseSafeNumber(userProfile.age);
        if (ageNum !== null) updateData.age = Math.round(ageNum);

        const daysPerWeekNum = parseSafeNumber(userProfile.daysPerWeek);
        if (daysPerWeekNum !== null) updateData.daysPerWeek = Math.round(daysPerWeekNum);

        if (userProfile.fitnessGoal) updateData.fitnessGoal = String(userProfile.fitnessGoal);
        if (userProfile.fitnessLevel) updateData.fitnessLevel = String(userProfile.fitnessLevel);
        if (userProfile.equipment !== undefined) updateData.equipment = userProfile.equipment ? String(userProfile.equipment) : null;
        if (userProfile.medicalConditions !== undefined) updateData.medicalConditions = userProfile.medicalConditions ? String(userProfile.medicalConditions) : null;
        if (userProfile.name) updateData.name = String(userProfile.name).substring(0, 100);
        if (parseSafeNumber(userProfile.currentWeight) !== null) updateData.currentWeight = parseSafeNumber(userProfile.currentWeight);
        if (parseSafeNumber(userProfile.targetWeight) !== null) updateData.targetWeight = parseSafeNumber(userProfile.targetWeight);
        if (parseSafeNumber(userProfile.height) !== null) updateData.height = parseSafeNumber(userProfile.height);
        if (parseSafeNumber(userProfile.age) !== null) updateData.age = Math.round(Number(userProfile.age));
        if (userProfile.gender) updateData.gender = String(userProfile.gender).substring(0, 20);
        if (userProfile.fitnessLevel) updateData.fitnessLevel = String(userProfile.fitnessLevel).substring(0, 50);
        if (userProfile.fitnessGoal) updateData.fitnessGoal = String(userProfile.fitnessGoal).substring(0, 100);
        if (userProfile.equipment) updateData.equipment = String(userProfile.equipment).substring(0, 100);
        if (userProfile.splitPreference) updateData.splitPreference = String(userProfile.splitPreference).substring(0, 100);
        if (parseSafeNumber(userProfile.workoutDaysPerWeek) !== null) updateData.workoutDaysPerWeek = Math.round(Number(userProfile.workoutDaysPerWeek));
        if (typeof userProfile.onboardingCompleted === 'boolean') updateData.onboardingCompleted = userProfile.onboardingCompleted;

        if (Object.keys(updateData).length > 0) {
          await prisma.user.update({
            where: { id: userId },
            data: updateData,
          });
        }

        // Keep latest today's weight log in sync
        const validWeight = parseSafeNumber(userProfile.currentWeight);
        if (validWeight !== null && validWeight > 0) {
          const startOfToday = new Date();
          startOfToday.setHours(0, 0, 0, 0);
          const endOfToday = new Date();
          endOfToday.setHours(23, 59, 59, 999);

          const existingTodayLog = await prisma.weightLog.findFirst({
            where: {
              userId,
              date: { gte: startOfToday, lte: endOfToday },
            },
          });

          if (existingTodayLog) {
            await prisma.weightLog.update({
              where: { id: existingTodayLog.id },
              data: { weight: validWeight },
            });
          } else {
            await prisma.weightLog.create({
              data: {
                userId,
                weight: validWeight,
                date: new Date(),
                notes: 'تحديث الوزن من البروفايل',
              },
            });
          }
        }
      }

      // 2. Direct Nested Plan Upsert (Prevent infinite duplicates on push)
      if (activePlan && typeof activePlan === 'object' && (activePlan.title || Array.isArray(activePlan.dayWorkouts) || Array.isArray(activePlan.days))) {
        const rawDays = Array.isArray(activePlan.dayWorkouts) ? activePlan.dayWorkouts : (Array.isArray(activePlan.days) ? activePlan.days : []);
        const planTitle = String(activePlan.title || 'My Workout Plan').substring(0, 200);

        // Check if user already has an active plan or a plan with this title
        const existingPlan = await prisma.workoutPlan.findFirst({
          where: {
            userId,
            OR: [
              { active: true },
              { title: planTitle }
            ]
          }
        });

        if (existingPlan) {
          // Clean up any other duplicate inactive plans with the same title
          await prisma.workoutPlan.deleteMany({
            where: {
              userId,
              title: planTitle,
              id: { not: existingPlan.id }
            }
          });

          // Delete existing days to refresh with latest modification without creating duplicate plans
          await prisma.dayWorkout.deleteMany({
            where: { planId: existingPlan.id }
          });

          await prisma.workoutPlan.update({
            where: { id: existingPlan.id },
            data: {
              title: planTitle,
              durationWeeks: parseSafeNumber(activePlan.durationWeeks) ? Math.round(Number(activePlan.durationWeeks)) : 4,
              active: true,
              weeklyTips: activePlan.weeklyTips ? String(activePlan.weeklyTips) : null,
              isManual: Boolean(activePlan.isManual),
              dayWorkouts: {
                create: rawDays.map((day: any, idx: number) => {
                  const rawExercises = Array.isArray(day.exercises) ? day.exercises : [];
                  return {
                    dayIndex: parseSafeNumber(day.dayIndex) ? Math.round(Number(day.dayIndex)) : idx + 1,
                    title: String(day.title || `Day ${idx + 1}`).substring(0, 150),
                    focusArea: String(day.focusArea || day.targetMuscle || 'General').substring(0, 150),
                    dayTips: day.dayTips || day.tips ? String(day.dayTips || day.tips) : null,
                    isRestDay: Boolean(day.isRestDay),
                    exercises: {
                      create: rawExercises.map((ex: any, exIdx: number) => ({
                        name: String(ex.name_en || ex.name || 'Exercise').substring(0, 200),
                        name_en: ex.name_en ? String(ex.name_en).substring(0, 200) : null,
                        name_ar: ex.name_ar ? String(ex.name_ar).substring(0, 200) : null,
                        description_en: ex.description_en ? String(ex.description_en) : null,
                        description_ar: ex.description_ar ? String(ex.description_ar) : null,
                        muscle_en: ex.muscle_en || ex.muscle ? String(ex.muscle_en || ex.muscle).substring(0, 100) : 'General',
                        muscle_ar: ex.muscle_ar ? String(ex.muscle_ar).substring(0, 100) : null,
                        targetMuscle: ex.targetMuscle || ex.muscle_en ? String(ex.targetMuscle || ex.muscle_en).substring(0, 100) : null,
                        equipment_en: ex.equipment_en || ex.equipment ? String(ex.equipment_en || ex.equipment).substring(0, 100) : 'Bodyweight',
                        equipment_ar: ex.equipment_ar ? String(ex.equipment_ar).substring(0, 100) : null,
                        level: ex.level ? String(ex.level).substring(0, 50) : 'intermediate',
                        category: ex.category ? String(ex.category).substring(0, 50) : 'IRON',
                        rating: parseSafeNumber(ex.rating) ?? 0.0,
                        imageUrl: ex.imageUrl || ex.image_url ? String(ex.imageUrl || ex.image_url) : null,
                        image_url: ex.image_url || ex.imageUrl ? String(ex.image_url || ex.imageUrl) : null,
                        videoUrl: ex.videoUrl ? String(ex.videoUrl) : null,
                        gif_url: ex.gif_url ? String(ex.gif_url) : null,
                        sets: parseSafeNumber(ex.sets) ? Math.round(Number(ex.sets)) : 3,
                        reps: String(ex.reps || '10-12').substring(0, 50),
                        weight: ex.weight ? String(ex.weight).substring(0, 50) : null,
                        exerciseTips: ex.exerciseTips || ex.tips ? String(ex.exerciseTips || ex.tips) : null,
                        order: parseSafeNumber(ex.order) ? Math.round(Number(ex.order)) : exIdx,
                      })),
                    },
                  };
                }),
              },
            },
          });
        } else {
          // Deactivate existing active plans
          await prisma.workoutPlan.updateMany({
            where: { userId, active: true },
            data: { active: false },
          });

          // Create new active plan with nested days and exercises in one atomic round-trip
          await prisma.workoutPlan.create({
            data: {
              userId,
              title: planTitle,
              durationWeeks: parseSafeNumber(activePlan.durationWeeks) ? Math.round(Number(activePlan.durationWeeks)) : 4,
              startDate: parseSafeDate(activePlan.startDate) || new Date(),
              active: true,
              weeklyTips: activePlan.weeklyTips ? String(activePlan.weeklyTips) : null,
              isManual: Boolean(activePlan.isManual),
              dayWorkouts: {
                create: rawDays.map((day: any, idx: number) => {
                  const rawExercises = Array.isArray(day.exercises) ? day.exercises : [];
                  return {
                    dayIndex: parseSafeNumber(day.dayIndex) ? Math.round(Number(day.dayIndex)) : idx + 1,
                    title: String(day.title || `Day ${idx + 1}`).substring(0, 150),
                    focusArea: String(day.focusArea || day.targetMuscle || 'General').substring(0, 150),
                    dayTips: day.dayTips || day.tips ? String(day.dayTips || day.tips) : null,
                    isRestDay: Boolean(day.isRestDay),
                    exercises: {
                      create: rawExercises.map((ex: any, exIdx: number) => ({
                        name: String(ex.name_en || ex.name || 'Exercise').substring(0, 200),
                        name_en: ex.name_en ? String(ex.name_en).substring(0, 200) : null,
                        name_ar: ex.name_ar ? String(ex.name_ar).substring(0, 200) : null,
                        description_en: ex.description_en ? String(ex.description_en) : null,
                        description_ar: ex.description_ar ? String(ex.description_ar) : null,
                        muscle_en: ex.muscle_en || ex.muscle ? String(ex.muscle_en || ex.muscle).substring(0, 100) : 'General',
                        muscle_ar: ex.muscle_ar ? String(ex.muscle_ar).substring(0, 100) : null,
                        targetMuscle: ex.targetMuscle || ex.muscle_en ? String(ex.targetMuscle || ex.muscle_en).substring(0, 100) : null,
                        equipment_en: ex.equipment_en || ex.equipment ? String(ex.equipment_en || ex.equipment).substring(0, 100) : 'Bodyweight',
                        equipment_ar: ex.equipment_ar ? String(ex.equipment_ar).substring(0, 100) : null,
                        level: ex.level ? String(ex.level).substring(0, 50) : 'intermediate',
                        category: ex.category ? String(ex.category).substring(0, 50) : 'IRON',
                        rating: parseSafeNumber(ex.rating) ?? 0.0,
                        imageUrl: ex.imageUrl || ex.image_url ? String(ex.imageUrl || ex.image_url) : null,
                        image_url: ex.image_url || ex.imageUrl ? String(ex.image_url || ex.imageUrl) : null,
                        videoUrl: ex.videoUrl ? String(ex.videoUrl) : null,
                        gif_url: ex.gif_url ? String(ex.gif_url) : null,
                        sets: parseSafeNumber(ex.sets) ? Math.round(Number(ex.sets)) : 3,
                        reps: String(ex.reps || '10-12').substring(0, 50),
                        weight: ex.weight ? String(ex.weight).substring(0, 50) : null,
                        exerciseTips: ex.exerciseTips || ex.tips ? String(ex.exerciseTips || ex.tips) : null,
                        order: parseSafeNumber(ex.order) ? Math.round(Number(ex.order)) : exIdx,
                      })),
                    },
                  };
                }),
              },
            },
          });
        }
      }

      // 3. Direct Weight Logs Sync (createMany)
      if (Array.isArray(weightLogs) && weightLogs.length > 0) {
        const validLogs = weightLogs
          .map((wl: any) => ({
            weight: parseSafeNumber(wl?.weight),
            date: parseSafeDate(wl?.date) || new Date(),
            notes: wl?.notes ? String(wl.notes).substring(0, 500) : null,
          }))
          .filter((wl: any) => wl.weight !== null && wl.weight > 0);

        if (validLogs.length > 0) {
          const existingLogs = await prisma.weightLog.findMany({
            where: { userId },
            select: { date: true },
          });
          const existingDateStrings = new Set(
            existingLogs.map((l) => new Date(l.date).toISOString().split('T')[0])
          );

          const toCreate = validLogs.filter(
            (l) => !existingDateStrings.has(new Date(l.date).toISOString().split('T')[0])
          );

          if (toCreate.length > 0) {
            await prisma.weightLog.createMany({
              data: toCreate.map((l) => ({
                userId,
                weight: l.weight as number,
                date: l.date,
                notes: l.notes,
              })),
            });
          }
        }
      }

      // 4. Direct Check-in Logs Sync (createMany)
      if (Array.isArray(checkIns) && checkIns.length > 0) {
        const validCheckIns = checkIns
          .filter((ci: any) => ci && typeof ci === 'object')
          .map((ci: any) => ({
            workoutFeel: String(ci.workoutFeel || 'NORMAL'),
            sessionsCompleted: String(ci.sessionsCompleted || 'YES'),
            painNotes: ci.painNotes ? String(ci.painNotes).substring(0, 500) : null,
            aiRecommendation: ci.aiRecommendation ? String(ci.aiRecommendation).substring(0, 1000) : null,
            applied: Boolean(ci.applied),
            date: parseSafeDate(ci.date) || new Date(),
          }));

        if (validCheckIns.length > 0) {
          const existingCheckIns = await prisma.checkIn.findMany({
            where: { userId },
            select: { date: true },
          });
          const existingCheckInDates = new Set(
            existingCheckIns.map((c) => new Date(c.date).toISOString().split('T')[0])
          );

          const toCreate = validCheckIns.filter(
            (c) => !existingCheckInDates.has(new Date(c.date).toISOString().split('T')[0])
          );

          if (toCreate.length > 0) {
            await prisma.checkIn.createMany({
              data: toCreate.map((c) => ({
                userId,
                workoutFeel: c.workoutFeel,
                sessionsCompleted: c.sessionsCompleted,
                painNotes: c.painNotes,
                aiRecommendation: c.aiRecommendation,
                applied: c.applied,
                date: c.date,
              })),
            });
          }
        }
      }

      res.status(200).json({
        success: true,
        timestamp: Date.now(),
        message: 'تمت المزامنة السحابية الكاملة بنجاح وحفظ كافة البيانات',
      });
    } catch (err: any) {
      logger.error('[SyncController] Full Push Error:', {
        message: err?.message,
        code: err?.code,
        meta: err?.meta,
        stack: err?.stack,
      });
      res.status(500).json({
        error: 'فشل حفظ ومزامنة البيانات السحابية',
        message: err?.message || 'Database Sync Error',
      });
    }
  },

  async syncExercises(req: AuthRequest, res: Response) {
    try {
      const { rapidApiKey } = req.body;

      console.log('[SyncController] Initiating exercise library sync...');
      const result = await syncService.syncAllExercises(rapidApiKey);

      if (!result.success) {
        return res.status(207).json({
          message: 'اكتملت مزامنة التمارين مع وجود بعض الأخطاء في بعض الخدمات المصدرية.',
          count: result.count,
          errors: result.errors,
        });
      }

      return res.status(200).json({
        message: 'تمت مزامنة وتحديث مكتبة التمارين بنجاح كامل من كافة المصادر!',
        count: result.count,
        errors: [],
      });
    } catch (err: any) {
      logger.error('[SyncController] Critical Sync error:', {
        message: err?.message,
        stack: err?.stack,
      });
      return res.status(500).json({
        message: 'فشل مزامنة التمارين الرياضية بسبب خطأ داخلي في السيرفر.',
        error: err.message,
      });
    }
  },

  async testPerformance(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const cwd = path.join(__dirname, '../../../workout_generator_python');
      
      console.log('[SyncController] Launching Python cache performance benchmark test...');
      execFile('python', ['test_performance.py'], { cwd, env: process.env }, (error, stdout, stderr) => {
        if (error) {
          logger.error('[SyncController] Performance test execution error:', {
            error: error.message,
            stderr,
          });
          res.status(500).json({
            message: 'فشل تشغيل اختبار الأداء للـ Cache بسبب خطأ في الخادم أو عدم توفر بايثون.',
            error: error.message + '\n' + stderr
          });
          return;
        }
        
        res.status(200).json({
          success: true,
          output: stdout
        });
      });
    } catch (err: any) {
      logger.error('[SyncController] Performance test exception:', {
        message: err?.message,
        stack: err?.stack,
      });
      res.status(500).json({
        message: 'فشل تشغيل اختبار الأداء للـ Cache بسبب خطأ داخلي.',
        error: err.message
      });
    }
  }
};
