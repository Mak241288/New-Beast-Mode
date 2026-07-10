import { Router } from 'express';
import { register, login, getProfile, updateProfile } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes (require JWT verification)
router.get('/profile', protect as any, getProfile);
router.put('/profile', protect as any, updateProfile);

export default router;
