import { Router } from 'express';
import { syncController } from '../controllers/syncController';
import { protect } from '../middleware/auth';

const router = Router();

// Protected route to sync exercises
router.post('/exercises', protect, syncController.syncExercises);

// Protected route to test cache performance
router.get('/performance-test', protect, syncController.testPerformance);

export default router;
