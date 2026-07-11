import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { syncService } from '../services/syncService';
import { exec } from 'child_process';
import path from 'path';

export const syncController = {
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

  async testPerformance(req: AuthRequest, res: Response) {
    try {
      const cwd = path.join(__dirname, '../../../workout_generator_python');
      
      console.log('[SyncController] Launching Python cache performance benchmark test...');
      exec('python test_performance.py', { cwd, env: process.env }, (error, stdout, stderr) => {
        if (error) {
          console.error('[SyncController] Performance test execution error:', error);
          return res.status(500).json({
            message: 'فشل تشغيل اختبار الأداء للـ Cache بسبب خطأ في الخادم أو عدم توفر بايثون.',
            error: error.message + '\n' + stderr
          });
        }
        
        return res.status(200).json({
          success: true,
          output: stdout
        });
      });
    } catch (err: any) {
      console.error('[SyncController] Performance test exception:', err);
      return res.status(500).json({
        message: 'فشل تشغيل اختبار الأداء للـ Cache بسبب خطأ داخلي.',
        error: err.message
      });
    }
  }
};
