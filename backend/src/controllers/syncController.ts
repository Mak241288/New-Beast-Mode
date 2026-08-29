import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { syncService } from '../services/syncService';
import { execFile } from 'child_process';
import path from 'path';
import prisma from '../services/db';

export const syncController = {
  async fullPull(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'غير مصرح' });
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
      console.error('[SyncController] fullPull error:', err);
      res.status(500).json({ error: 'فشل جلب البيانات السحابية الكاملة', message: err.message });
    }
  },

  async fullPush(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'غير مصرح' });
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
          if (userProfile.name) updateData.name = String(userProfile.name).trim();
          if (userProfile.gender) updateData.gender = String(userProfile.gender);
          if (userProfile.height !== undefined && userProfile.height !== null && userProfile.height !== '') {
            updateData.height = Number(userProfile.height) || null;
          }
          if (userProfile.currentWeight !== undefined && userProfile.currentWeight !== null && userProfile.currentWeight !== '') {
            updateData.currentWeight = Number(userProfile.currentWeight) || null;
          }
          if (userProfile.targetWeight !== undefined && userProfile.targetWeight !== null && userProfile.targetWeight !== '') {
            updateData.targetWeight = Number(userProfile.targetWeight) || null;
          }
          if (userProfile.fitnessGoal) updateData.fitnessGoal = String(userProfile.fitnessGoal);
          if (userProfile.fitnessLevel) updateData.fitnessLevel = String(userProfile.fitnessLevel);
          if (userProfile.daysPerWeek) updateData.daysPerWeek = Number(userProfile.daysPerWeek) || null;
          if (userProfile.equipment !== undefined) updateData.equipment = String(userProfile.equipment);
          if (userProfile.medicalConditions !== undefined) updateData.medicalConditions = String(userProfile.medicalConditions);
          if (userProfile.workoutLocation) updateData.workoutLocation = String(userProfile.workoutLocation);
          if (userProfile.age) updateData.age = Number(userProfile.age) || null;
          if (userProfile.workoutReminder !== undefined) updateData.workoutReminder = Boolean(userProfile.workoutReminder);
          if (userProfile.reminderTime) updateData.reminderTime = String(userProfile.reminderTime);
          if (userProfile.onboardingCompleted !== undefined) updateData.onboardingCompleted = Boolean(userProfile.onboardingCompleted);
          if (userProfile.birthDate) {
            try {
              updateData.birthDate = new Date(userProfile.birthDate);
            } catch {}
          }

          if (Object.keys(updateData).length > 0) {
            await tx.user.update({
              where: { id: userId },
              data: updateData,
            });
          }
        }

        // 2. Sync Active Plan if provided
        if (activePlan && activePlan.title && Array.isArray(activePlan.dayWorkouts)) {
          // Deactivate existing plans
          await tx.workoutPlan.updateMany({
            where: { userId, active: true },
            data: { active: false },
          });

          // Create new active plan with nested dayWorkouts and exercises
          await tx.workoutPlan.create({
            data: {
              userId,
              title: activePlan.title,
              durationWeeks: Number(activePlan.durationWeeks) || 4,
              startDate: activePlan.startDate ? new Date(activePlan.startDate) : new Date(),
              active: true,
              weeklyTips: activePlan.weeklyTips || null,
              isManual: Boolean(activePlan.isManual),
              dayWorkouts: {
                create: activePlan.dayWorkouts.map((day: any, idx: number) => ({
                  dayIndex: Number(day.dayIndex) || idx + 1,
                  title: day.title || `Day ${idx + 1}`,
                  focusArea: day.focusArea || day.targetMuscle || 'General',
                  dayTips: day.dayTips || day.tips || null,
                  isRestDay: Boolean(day.isRestDay),
                  exercises: {
                    create: Array.isArray(day.exercises)
                      ? day.exercises.map((ex: any, exIdx: number) => ({
                          name: ex.name_en || ex.name || 'Exercise',
                          name_en: ex.name_en || ex.name || null,
                          name_ar: ex.name_ar || null,
                          description_en: ex.description_en || null,
                          description_ar: ex.description_ar || null,
                          muscle_en: ex.muscle_en || ex.muscle || 'General',
                          muscle_ar: ex.muscle_ar || null,
                          targetMuscle: ex.targetMuscle || ex.muscle_en || null,
                          equipment_en: ex.equipment_en || ex.equipment || 'Bodyweight',
                          equipment_ar: ex.equipment_ar || null,
                          level: ex.level || 'intermediate',
                          category: ex.category || 'IRON',
                          rating: Number(ex.rating) || 0.0,
                          imageUrl: ex.imageUrl || ex.image_url || null,
                          image_url: ex.image_url || ex.imageUrl || null,
                          videoUrl: ex.videoUrl || null,
                          gif_url: ex.gif_url || null,
                          sets: Number(ex.sets) || 3,
                          reps: String(ex.reps || '10-12'),
                          weight: ex.weight ? String(ex.weight) : null,
                          exerciseTips: ex.exerciseTips || ex.tips || null,
                          order: Number(ex.order) || exIdx,
                        }))
                      : [],
                  },
                })),
              },
            },
          });
        }

        // 3. Sync Weight Logs (Append any new logs)
        if (Array.isArray(weightLogs) && weightLogs.length > 0) {
          for (const wl of weightLogs) {
            if (wl.weight && Number(wl.weight) > 0) {
              const logDate = wl.date ? new Date(wl.date) : new Date();
              const existing = await tx.weightLog.findFirst({
                where: {
                  userId,
                  date: {
                    gte: new Date(new Date(logDate).setHours(0, 0, 0, 0)),
                    lte: new Date(new Date(logDate).setHours(23, 59, 59, 999)),
                  },
                },
              });

              if (!existing) {
                await tx.weightLog.create({
                  data: {
                    userId,
                    weight: Number(wl.weight),
                    date: logDate,
                    notes: wl.notes ? String(wl.notes) : null,
                  },
                });
              }
            }
          }
        }

        // 4. Sync Check-in Logs
        if (Array.isArray(checkIns) && checkIns.length > 0) {
          for (const ci of checkIns) {
            if (ci.workoutFeel && ci.sessionsCompleted) {
              const checkInDate = ci.date ? new Date(ci.date) : new Date();
              const existing = await tx.checkIn.findFirst({
                where: {
                  userId,
                  date: {
                    gte: new Date(new Date(checkInDate).setHours(0, 0, 0, 0)),
                    lte: new Date(new Date(checkInDate).setHours(23, 59, 59, 999)),
                  },
                },
              });

              if (!existing) {
                await tx.checkIn.create({
                  data: {
                    userId,
                    workoutFeel: String(ci.workoutFeel),
                    sessionsCompleted: String(ci.sessionsCompleted),
                    painNotes: ci.painNotes ? String(ci.painNotes) : null,
                    aiRecommendation: ci.aiRecommendation ? String(ci.aiRecommendation) : null,
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
      console.error('[SyncController] fullPush error:', err);
      res.status(500).json({ error: 'فشل حفظ ومزامنة البيانات السحابية', message: err.message });
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
      console.error('[SyncController] Critical Sync error:', err);
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
          console.error('[SyncController] Performance test execution error:', error);
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
      console.error('[SyncController] Performance test exception:', err);
      res.status(500).json({
        message: 'فشل تشغيل اختبار الأداء للـ Cache بسبب خطأ داخلي.',
        error: err.message
      });
    }
  }
};
