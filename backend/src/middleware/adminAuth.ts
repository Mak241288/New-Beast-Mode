import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

/**
 * Role-Based Access Control (RBAC) Guard for Administrative/Diagnostic endpoints
 */
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const adminEmail = process.env.ADMIN_EMAIL;
  
  // In development, allow testing if no ADMIN_EMAIL is configured
  if (!adminEmail && process.env.NODE_ENV !== 'production') {
    return next();
  }

  // Check if authenticated user matches designated admin email
  if (req.user && adminEmail && req.user.email.toLowerCase() === adminEmail.toLowerCase()) {
    return next();
  }

  res.status(403).json({
    error: 'غير مصرح: هذا الإجراء مخصص لمدير النظام فقط (Admin Access Required).'
  });
};
