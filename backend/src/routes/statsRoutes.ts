import { Router } from 'express';
import { getStats, logWeight } from '../controllers/statsController';
import { getCheckInStatus, submitCheckIn, applySuggestions } from '../controllers/checkinController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect as any);

router.get('/', getStats);
router.post('/weight-log', logWeight as any);
router.get('/check-in-status', getCheckInStatus as any);
router.post('/check-in', submitCheckIn as any);
router.post('/check-in/apply', applySuggestions as any);

export default router;
