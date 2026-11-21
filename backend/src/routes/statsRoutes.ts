import { Router } from 'express';
import { getStats, logWeight } from '../controllers/statsController';
import { getCheckInStatus, submitCheckIn, applySuggestions } from '../controllers/checkinController';
import { protect } from '../middleware/auth';
import { validateBody, AUTH_SCHEMAS } from '../middleware/validate';

const router = Router();

router.use(protect);

router.get('/', getStats);
router.post('/weight-log', validateBody(AUTH_SCHEMAS.weightLog), logWeight);
router.get('/check-in-status', getCheckInStatus);
router.post('/check-in', submitCheckIn);
router.post('/check-in/apply', applySuggestions);

export default router;
