import { Router } from 'express';
import { 
  register, 
  login, 
  googleAuth,
  linkGoogleAccount,
  unlinkGoogleAccount,
  getProfile, 
  updateProfile,
  updateAccountSecurity,
  requestPasswordResetOtp,
  verifyOtpAndResetPassword,
  exportUserData,
  deleteAccount
} from '../controllers/authController';
import { protect } from '../middleware/auth';
import { validateBody, AUTH_SCHEMAS } from '../middleware/validate';

const router = Router();

// Public routes with strict schema validation
router.post('/register', validateBody(AUTH_SCHEMAS.register), register);
router.post('/login', validateBody(AUTH_SCHEMAS.login), login);
router.post('/google', googleAuth);
router.post('/forgot-password-otp', requestPasswordResetOtp);
router.post('/verify-otp-reset-password', verifyOtpAndResetPassword);

// Protected routes (require JWT verification)
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.patch('/profile', protect, updateProfile);
router.put('/security', protect, updateAccountSecurity);
router.post('/link-google', protect, linkGoogleAccount);
router.post('/unlink-google', protect, unlinkGoogleAccount);
router.get('/export-data', protect, exportUserData);
router.delete('/account', protect, deleteAccount);

export default router;
