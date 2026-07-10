import { Router } from 'express';
import { syncController } from '../controllers/syncController';
import { protect } from '../middleware/auth';

const router = Router();

// Protected route to sync exercises
router.post('/exercises', protect, syncController.syncExercises);

export default router;
