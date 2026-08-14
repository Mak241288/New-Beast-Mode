import { Router } from 'express';
import { 
  register, 
  login, 
  getProfile, 
  updateProfile,
  exportUserData,
  deleteAccount
} from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes (require JWT verification)
router.get('/profile', protect as any, getProfile);
router.put('/profile', protect as any, updateProfile);
router.get('/export-data', protect as any, exportUserData);
router.delete('/account', protect as any, deleteAccount);

export default router;
