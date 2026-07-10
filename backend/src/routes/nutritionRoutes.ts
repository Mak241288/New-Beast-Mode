import { Router } from 'express';
import {
  getNutritionPlan,
  logMealText,
  logMealManual,
  deleteMealLog,
  logWater
} from '../controllers/nutritionController';
import { protect } from '../middleware/auth';

const router = Router();

// Apply protection to all nutrition routes
router.use(protect as any);

router.get('/day', getNutritionPlan);
router.post('/meal/text', logMealText);
router.post('/meal/manual', logMealManual);
router.delete('/meal/:id', deleteMealLog);
router.post('/water', logWater);

export default router;
