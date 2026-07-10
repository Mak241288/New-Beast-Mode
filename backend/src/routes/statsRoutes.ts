import { Router } from 'express';
import { getStats } from '../controllers/statsController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect as any);

router.get('/', getStats);

export default router;
