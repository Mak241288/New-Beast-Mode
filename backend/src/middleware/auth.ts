import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('[Auth] JWT_SECRET environment variable is not set!');

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401).json({ error: 'غير مصرح بالدخول، يرجى تسجيل الدخول أولاً' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string };
    req.user = {
      id: decoded.id,
      email: decoded.email,
    };
    next();
  } catch (error) {
    res.status(401).json({ error: 'رمز الدخول غير صالح أو انتهت صلاحيته' });
  }
};
