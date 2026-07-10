import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { syncService } from '../services/syncService';

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
};
