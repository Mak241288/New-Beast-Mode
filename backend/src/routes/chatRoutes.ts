import { Router } from 'express';
import { getChatHistory, sendChatMessage } from '../controllers/chatController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect as any);

router.get('/history', getChatHistory);
router.post('/message', sendChatMessage);

export default router;
