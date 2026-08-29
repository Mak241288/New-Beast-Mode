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

      const [user, activePlan, workoutPlans, weightLogs, checkIns] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            email: true,
            name: true,
            gender: true,
            birthDate: true,
            height: true,
            currentWeight: true,
            targetWeight: true,
            medicalConditions: true,
            workoutLocation: true,
            equipment: true,
            fitnessGoal: true,
            fitnessLevel: true,
            age: true,
            daysPerWeek: true,
            workoutReminder: true,
            reminderTime: true,
            onboardingCompleted: true,
            updatedAt: true,
            createdAt: true,
          },
        }),
        prisma.workoutPlan.findFirst({
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
              orderBy: { dayIndex: 'asc' },
            },
          },
          orderBy: { updatedAt: 'desc' },
        }),
        prisma.workoutPlan.findMany({
          where: { userId },
          include: {
            dayWorkouts: {
              include: {
                exercises: true,
              },
              orderBy: { dayIndex: 'asc' },
            },
          },
          orderBy: { updatedAt: 'desc' },
          take: 10,
        }),
        prisma.weightLog.findMany({
          where: { userId },
          orderBy: { date: 'desc' },
          take: 100,
        }),
        prisma.checkIn.findMany({
          where: { userId },
          orderBy: { date: 'desc' },
          take: 50,
        }),
      ]);

      res.status(200).json({
        success: true,
        timestamp: Date.now(),
        data: {
          user,
          activePlan,
          workoutPlans,
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
      res.status(500).json({ error: 'فشل جلب البيانات السحابية الكاملة', message: err.message });
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

      await prisma.$transaction(async (tx) => {
        // 1. Update user profile if provided
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
          if (userProfile.workoutLocation) updateData.workoutLocation = String(userProfile.workoutLocation);
          if (userProfile.workoutReminder !== undefined) updateData.workoutReminder = Boolean(userProfile.workoutReminder);
          if (userProfile.reminderTime) updateData.reminderTime = String(userProfile.reminderTime);
          if (userProfile.onboardingCompleted !== undefined) updateData.onboardingCompleted = Boolean(userProfile.onboardingCompleted);

          const safeBirthDate = parseSafeDate(userProfile.birthDate);
          if (safeBirthDate) updateData.birthDate = safeBirthDate;

          if (Object.keys(updateData).length > 0) {
            await tx.user.updateMany({
              where: { id: userId },
              data: updateData,
            });
          }
        }

        // 2. Sync Active Plan if provided
        if (activePlan && typeof activePlan === 'object' && (activePlan.title || Array.isArray(activePlan.dayWorkouts) || Array.isArray(activePlan.days))) {
          const rawDays = Array.isArray(activePlan.dayWorkouts) ? activePlan.dayWorkouts : (Array.isArray(activePlan.days) ? activePlan.days : []);
          
          // Deactivate existing active plans for this user
          await tx.workoutPlan.updateMany({
            where: { userId, active: true },
            data: { active: false },
          });

          // Create new active plan with properly mapped nested dayWorkouts and exercises
          await tx.workoutPlan.create({
            data: {
              userId,
              title: String(activePlan.title || 'My Workout Plan').substring(0, 200),
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

        // 3. Sync Weight Logs (Append any new logs safely)
        if (Array.isArray(weightLogs) && weightLogs.length > 0) {
          for (const wl of weightLogs) {
            const weightNum = parseSafeNumber(wl?.weight);
            if (weightNum !== null && weightNum > 0) {
              const logDate = parseSafeDate(wl?.date) || new Date();
              const dayStart = new Date(logDate);
              dayStart.setHours(0, 0, 0, 0);
              const dayEnd = new Date(logDate);
              dayEnd.setHours(23, 59, 59, 999);

              const existing = await tx.weightLog.findFirst({
                where: {
                  userId,
                  date: {
                    gte: dayStart,
                    lte: dayEnd,
                  },
                },
              });

              if (!existing) {
                await tx.weightLog.create({
                  data: {
                    userId,
                    weight: weightNum,
                    date: logDate,
                    notes: wl.notes ? String(wl.notes).substring(0, 500) : null,
                  },
                });
              }
            }
          }
        }

        // 4. Sync Check-in Logs safely
        if (Array.isArray(checkIns) && checkIns.length > 0) {
          for (const ci of checkIns) {
            if (ci && typeof ci === 'object') {
              const workoutFeel = String(ci.workoutFeel || 'NORMAL');
              const sessionsCompleted = String(ci.sessionsCompleted || 'YES');
              const checkInDate = parseSafeDate(ci.date) || new Date();
              const dayStart = new Date(checkInDate);
              dayStart.setHours(0, 0, 0, 0);
              const dayEnd = new Date(checkInDate);
              dayEnd.setHours(23, 59, 59, 999);

              const existing = await tx.checkIn.findFirst({
                where: {
                  userId,
                  date: {
                    gte: dayStart,
                    lte: dayEnd,
                  },
                },
              });

              if (!existing) {
                await tx.checkIn.create({
                  data: {
                    userId,
                    workoutFeel,
                    sessionsCompleted,
                    painNotes: ci.painNotes ? String(ci.painNotes).substring(0, 500) : null,
                    aiRecommendation: ci.aiRecommendation ? String(ci.aiRecommendation).substring(0, 1000) : null,
                    applied: Boolean(ci.applied),
                    date: checkInDate,
                  },
                });
              }
            }
          }
        }
      });

      res.status(200).json({
        success: true,
        timestamp: Date.now(),
        message: 'تمت المزامنة السحابية الكاملة بنجاح وحفظ كافة البيانات',
      });
    } catch (err: any) {
      logger.error('[SyncController] Full Push Prisma Error:', {
        message: err?.message,
        code: err?.code,
        meta: err?.meta,
        stack: err?.stack,
      });
      res.status(500).json({
        error: 'فشل حفظ ومزامنة البيانات السحابية',
        message: err?.message || 'Prisma Transaction Error',
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
