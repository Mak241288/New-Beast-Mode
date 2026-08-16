import { Router } from 'express';
import { 
  register, 
  login, 
  getProfile, 
  updateProfile,
  updateAccountSecurity,
  requestPasswordResetOtp,
  verifyOtpAndResetPassword,
  exportUserData,
  deleteAccount
} from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password-otp', requestPasswordResetOtp);
router.post('/verify-otp-reset-password', verifyOtpAndResetPassword);

// Protected routes (require JWT verification)
router.get('/profile', protect as any, getProfile);
router.put('/profile', protect as any, updateProfile);
router.put('/security', protect as any, updateAccountSecurity);
router.get('/export-data', protect as any, exportUserData);
router.delete('/account', protect as any, deleteAccount);

export default router;
