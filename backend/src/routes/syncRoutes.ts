import { Router } from 'express';
import { syncController } from '../controllers/syncController';
import { protect } from '../middleware/auth';
import { requireAdmin } from '../middleware/adminAuth';

const router = Router();

// Protected admin routes
router.post('/exercises', protect, requireAdmin, syncController.syncExercises);
router.get('/performance-test', protect, requireAdmin, syncController.testPerformance);

export default router;
