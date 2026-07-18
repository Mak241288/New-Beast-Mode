import { Router } from 'express';
import { getStats } from '../controllers/statsController';
import { getCheckInStatus, submitCheckIn, applySuggestions } from '../controllers/checkinController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect as any);

router.get('/', getStats);
router.get('/check-in-status', getCheckInStatus as any);
router.post('/check-in', submitCheckIn as any);
router.post('/check-in/apply', applySuggestions as any);

export default router;
