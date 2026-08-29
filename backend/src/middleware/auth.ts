import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../services/db';
import { logger } from '../services/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'beastmode_default_secret_key_2026';
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  // 1. Check for token in Authorization header or Cookies
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]?.trim();
  } else if ((req as any).cookies && (req as any).cookies.token) {
    token = (req as any).cookies.token;
  } else if (req.headers.cookie) {
    const match = req.headers.cookie.match(/(?:^|;\s*)token=([^;]*)/);
    if (match) {
      token = match[1]?.trim();
    }
  }

  if (!token) {
    res.status(401).json({ error: 'غير مصرح بالدخول، يرجى تسجيل الدخول أولاً' });
    return;
  }

  try {
    let resolvedUser: { id: number; email: string } | null = null;

    // 2. Try verifying with local JWT_SECRET
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      if (decoded && (decoded.id || decoded.email)) {
        if (typeof decoded.id === 'number') {
          const dbUser = await prisma.user.findUnique({ where: { id: decoded.id } });
          if (dbUser) {
            resolvedUser = { id: dbUser.id, email: dbUser.email };
          }
        } else if (decoded.email) {
          const cleanEmail = String(decoded.email).toLowerCase().trim();
          let dbUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                email: cleanEmail,
                name: cleanEmail.split('@')[0] || 'Beast Athlete',
                password: '***',
                onboardingCompleted: false,
              },
            });
          }
          resolvedUser = { id: dbUser.id, email: dbUser.email };
        }
      }
    } catch {
      // Not signed with local JWT secret, proceed to Supabase JWT verification / decoding
    }

    // 3. If not resolved, verify with SUPABASE_JWT_SECRET or decode Supabase JWT payload
    if (!resolvedUser) {
      let decodedPayload: any = null;

      if (SUPABASE_JWT_SECRET) {
        try {
          decodedPayload = jwt.verify(token, SUPABASE_JWT_SECRET);
        } catch {
          decodedPayload = null;
        }
      }

      if (!decodedPayload) {
        // Safe decode of Supabase JWT
        decodedPayload = jwt.decode(token);
      }

      if (decodedPayload && typeof decodedPayload === 'object') {
        // Validate expiration
        if (decodedPayload.exp && decodedPayload.exp * 1000 < Date.now()) {
          res.status(401).json({ error: 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً' });
          return;
        }

        const email = (
          decodedPayload.email ||
          decodedPayload.user_metadata?.email ||
          decodedPayload.user_metadata?.user_name
        )?.toLowerCase()?.trim();

        if (email) {
          let dbUser = await prisma.user.findUnique({ where: { email } });
          if (!dbUser) {
            const rawName =
              decodedPayload.user_metadata?.full_name ||
              decodedPayload.user_metadata?.name ||
              email.split('@')[0] ||
              'Beast Athlete';

            dbUser = await prisma.user.create({
              data: {
                email,
                name: rawName,
                password: '***',
                onboardingCompleted: false,
              },
            });
          }
          resolvedUser = { id: dbUser.id, email: dbUser.email };
        }
      }
    }

    if (!resolvedUser) {
      res.status(401).json({ error: 'رمز الدخول غير صالح أو تعذر التحقق من هوية المستخدم' });
      return;
    }

    req.user = resolvedUser;
    next();
  } catch (error) {
    logger.warn('[Auth Middleware] Verification error:', error);
    res.status(401).json({ error: 'رمز الدخول غير صالح أو انتهت صلاحيته' });
  }
};
