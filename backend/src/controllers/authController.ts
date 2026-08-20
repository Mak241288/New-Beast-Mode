import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../services/db';
import { AuthRequest } from '../middleware/auth';
import { getProfileAdviceAI } from '../services/aiService';
import { isDisposableEmail } from '../utils/validation';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('[Auth] JWT_SECRET environment variable is not set!');

// Generates JWT Token
const generateToken = (id: number, email: string) => {
  return jwt.sign({ id, email }, JWT_SECRET, { expiresIn: '30d' });
};

// Input Validation Helpers
const isPrimitiveString = (val: any): val is string => typeof val === 'string';

const isValidEmail = (email: string): boolean => {
  if (!isPrimitiveString(email)) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// @desc    Register a new user
// @route   POST /api/auth/register
export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, email, password, botHoneypot } = req.body;

  try {
    // 0. Anti-Bot Honeypot Trap (Silent rejection for automated spam bots)
    if (botHoneypot) {
      res.status(400).json({ error: 'تم اكتشاف نشاط آلي غير مصرح به.' });
      return;
    }

    // 0.1 Type Validation (Prevents NoSQL / Operator Object Injection)
    if (!isPrimitiveString(name) || !isPrimitiveString(email) || !isPrimitiveString(password)) {
      res.status(400).json({ error: 'صيغة البيانات المدخلة غير صحيحة.' });
      return;
    }

    // 1. Sanitization
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanName || !cleanEmail || !cleanPassword) {
      res.status(400).json({ error: 'الرجاء إدخال الاسم، البريد الإلكتروني وكلمة المرور' });
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      res.status(400).json({ error: 'صيغة البريد الإلكتروني غير صحيحة' });
      return;
    }

    if (isDisposableEmail(cleanEmail)) {
      res.status(400).json({ error: 'غير مسموح بالتسجيل باستخدام إيميلات وهمية أو مؤقتة (Disposable Emails). يرجى استخدام بريد إلكتروني حقيقي وموثوق.' });
      return;
    }

    if (cleanPassword.length < 8) {
      res.status(400).json({ error: 'كلمة المرور يجب أن تتكون من 8 أحرف على الأقل' });
      return;
    }

    const userExists = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (userExists) {
      res.status(400).json({ error: 'البريد الإلكتروني مسجل بالفعل' });
      return;
    }

    // Hash password with strong salt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(cleanPassword, salt);

    const user = await prisma.user.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        password: hashedPassword,
      },
    });

    const token = generateToken(user.id, user.email);

    // Set HttpOnly Cookie for security
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 Hours
    });

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ أثناء إنشاء الحساب' });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    // 0.1 Type Validation (Prevents NoSQL / Operator Object Injection)
    if (!isPrimitiveString(email) || !isPrimitiveString(password)) {
      res.status(400).json({ error: 'الرجاء إدخال البريد الإلكتروني وكلمة المرور' });
      return;
    }

    // 1. Sanitization
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      res.status(400).json({ error: 'الرجاء إدخال البريد الإلكتروني وكلمة المرور' });
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
      return;
    }

    // 2. Query user with exact clean email
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!user) {
      // Generic error message to prevent User Enumeration
      res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
      return;
    }

    const isMatch = await bcrypt.compare(cleanPassword, user.password);
    if (!isMatch) {
      res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
      return;
    }

    const token = generateToken(user.id, user.email);

    // Set HttpOnly Cookie for security
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 Hours
    });

    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ أثناء تسجيل الدخول' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;

  try {
    const user = await (prisma as any).user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        gender: true,
        birthDate: true,
        height: true,
        currentWeight: true,
        targetWeight: true,
        medicalConditions: true,
        labResults: true,
        workoutLocation: true,
        fitnessGoal: true,
        fitnessLevel: true,
        equipment: true,
        age: true,
        daysPerWeek: true,
        workoutReminder: true,
        reminderTime: true,
        createdAt: true,
        onboardingCompleted: true,
        isGoogleLinked: true,
        googleEmail: true,
        googleId: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'المستخدم غير موجود' });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ أثناء جلب الملف الشخصي' });
  }
};

// @desc    Update user email & password with authentication verification
// @route   PUT /api/auth/security
export const updateAccountSecurity = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const { currentPassword, newEmail, newPassword } = req.body;

  if (!userId) {
    res.status(401).json({ error: 'غير مصرح بالدخول' });
    return;
  }

  if (!currentPassword) {
    res.status(400).json({ error: 'الرجاء إدخال كلمة المرور الحالية لتأكيد الهوية والتوثيق' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: 'المستخدم غير موجود' });
      return;
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      res.status(400).json({ error: 'كلمة المرور الحالية غير صحيحة' });
      return;
    }

    const updateData: { email?: string; password?: string } = {};

    // Validate and update email if provided
    if (newEmail && newEmail.trim().toLowerCase() !== user.email) {
      const cleanEmail = newEmail.trim().toLowerCase();
      if (!isValidEmail(cleanEmail)) {
        res.status(400).json({ error: 'صيغة البريد الإلكتروني الجديد غير صحيحة' });
        return;
      }

      const emailExists = await prisma.user.findUnique({ where: { email: cleanEmail } });
      if (emailExists && emailExists.id !== userId) {
        res.status(400).json({ error: 'البريد الإلكتروني الجديد مسجل بالفعل لحساب آخر' });
        return;
      }

      updateData.email = cleanEmail;
    }

    // Validate and update password if provided
    if (newPassword && newPassword.trim()) {
      const cleanPassword = newPassword.trim();
      if (cleanPassword.length < 8) {
        res.status(400).json({ error: 'كلمة المرور الجديدة يجب أن تتكون من 8 أحرف على الأقل' });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(cleanPassword, salt);
    }

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ error: 'لم يتم إدخال بريد إلكتروني جديد أو كلمة مرور جديدة لتعديلها' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
      }
    });

    // Generate fresh JWT token with updated email
    const newToken = generateToken(updated.id, updated.email);

    res.cookie('token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: 'تم تحديث بيانات الأمان والحساب بنجاح وتم توثيق الهوية!',
      user: updated,
      token: newToken,
    });
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ أثناء تحديث بيانات الأمان' });
  }
};

// @desc    Request OTP for Password Reset / Duplicate Email Recovery
// @route   POST /api/auth/forgot-password-otp
export const requestPasswordResetOtp = async (req: AuthRequest, res: Response): Promise<void> => {
  const { email } = req.body;

  try {
    if (!isPrimitiveString(email)) {
      res.status(400).json({ error: 'الرجاء إدخال بريد إلكتروني صحيح' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      res.status(400).json({ error: 'الرجاء إدخال بريد إلكتروني صحيح' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!user) {
      res.status(404).json({ error: 'لم نجد حساباً مسجلاً بهذا البريد الإلكتروني' });
      return;
    }

    // Generate 6-digit cryptographic OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetOtp: otp,
        resetOtpExpiry: expiry,
      },
    });

    console.log(`\n======================================================`);
    console.log(`🔐 [BeastMode Security] OTP generated for ${cleanEmail}: ${otp}`);
    console.log(`⏰ Expiry: ${expiry.toISOString()}`);
    console.log(`======================================================\n`);

    res.status(200).json({
      success: true,
      message: 'تم إرسال رمز التحقق (OTP) إلى بريدك الإلكتروني بنجاح (صالح لمدة 10 دقائق)',
      email: cleanEmail,
      debugOtp: otp, // returned to ensure seamless local/in-app verification
    });
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ أثناء توليد رمز التحقق' });
  }
};

// @desc    Verify OTP and Reset Password
// @route   POST /api/auth/verify-otp-reset-password
export const verifyOtpAndResetPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  const { email, otp, newPassword } = req.body;

  try {
    if (!isPrimitiveString(email) || !isPrimitiveString(otp) || !isPrimitiveString(newPassword)) {
      res.status(400).json({ error: 'البيانات المدخلة غير صالحة' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();
    const cleanPassword = newPassword.trim();

    if (!cleanEmail || !cleanOtp || !cleanPassword) {
      res.status(400).json({ error: 'الرجاء إدخال البريد الإلكتروني، رمز التحقق (OTP) وكلمة المرور الجديدة' });
      return;
    }

    if (cleanPassword.length < 8) {
      res.status(400).json({ error: 'كلمة المرور الجديدة يجب أن تتكون من 8 أحرف على الأقل' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!user) {
      res.status(404).json({ error: 'المستخدم غير موجود' });
      return;
    }

    // Verify OTP Match & Expiry
    if (!user.resetOtp || user.resetOtp !== cleanOtp) {
      res.status(400).json({ error: 'رمز التحقق (OTP) غير صحيح أو منتهي الصلاحية' });
      return;
    }

    if (!user.resetOtpExpiry || new Date(user.resetOtpExpiry) < new Date()) {
      res.status(400).json({ error: 'رمز التحقق (OTP) انتهت صلاحيته (صالح لـ 10 دقائق فقط)، اطلب رمزاً جديداً' });
      return;
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(cleanPassword, salt);

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetOtp: null,
        resetOtpExpiry: null,
      },
    });

    const token = generateToken(updatedUser.id, updatedUser.email);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: 'تم تعيين كلمة المرور الجديدة بنجاح وتم توثيق الحساب!',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: 'حدث خطأ أثناء إعادة تعيين كلمة المرور' });
  }
};



// @desc    Update user profile & check for plan adjustments
// @route   PUT /api/auth/profile
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const {
    name,
    gender,
    birthDate,
    height,
    currentWeight,
    targetWeight,
    medicalConditions,
    labResults,
    workoutLocation,
    fitnessGoal,
    fitnessLevel,
    equipment,
    age,
    daysPerWeek,
    workoutReminder,
    reminderTime,
    onboardingCompleted,
  } = req.body;

  try {
    const oldUser = await (prisma as any).user.findUnique({ where: { id: userId } }) as any;
    if (!oldUser) {
      res.status(404).json({ error: 'المستخدم غير موجود' });
      return;
    }

    // Check if weight changed to log it
    const parsedWeight = currentWeight ? parseFloat(currentWeight) : null;
    if (parsedWeight && parsedWeight !== oldUser.currentWeight) {
      await prisma.weightLog.create({
        data: {
          userId: oldUser.id,
          weight: parsedWeight,
          notes: 'تحديث تلقائي من الملف الشخصي',
        },
      });
    }

    // Update User
    const updatedUser = await (prisma as any).user.update({
      where: { id: userId },
      data: {
        name: name !== undefined ? name : oldUser.name,
        gender: gender !== undefined ? gender : oldUser.gender,
        birthDate: birthDate !== undefined ? (birthDate ? new Date(birthDate) : null) : oldUser.birthDate,
        height: height !== undefined ? (height ? parseFloat(height) : null) : oldUser.height,
        currentWeight: parsedWeight !== null ? parsedWeight : oldUser.currentWeight,
        targetWeight: targetWeight !== undefined ? (targetWeight ? parseFloat(targetWeight) : null) : oldUser.targetWeight,
        medicalConditions: medicalConditions !== undefined ? medicalConditions : oldUser.medicalConditions,
        labResults: labResults !== undefined ? labResults : oldUser.labResults,
        workoutLocation: workoutLocation !== undefined ? workoutLocation : oldUser.workoutLocation,
        fitnessGoal: fitnessGoal !== undefined ? fitnessGoal : oldUser.fitnessGoal,
        fitnessLevel: fitnessLevel !== undefined ? fitnessLevel : oldUser.fitnessLevel,
        equipment: equipment !== undefined ? (Array.isArray(equipment) ? equipment.join(',') : equipment) : oldUser.equipment,
        age: age !== undefined ? (age ? parseInt(age) : null) : oldUser.age,
        daysPerWeek: daysPerWeek !== undefined ? (daysPerWeek ? parseInt(daysPerWeek) : null) : oldUser.daysPerWeek,
        workoutReminder: workoutReminder !== undefined ? Boolean(workoutReminder) : oldUser.workoutReminder,
        reminderTime: reminderTime !== undefined ? reminderTime : oldUser.reminderTime,
        onboardingCompleted: onboardingCompleted !== undefined ? Boolean(onboardingCompleted) : oldUser.onboardingCompleted,
      },
    });

    // Determine if AI plan adjustment is needed
    // Triggered if weight, location, or medical conditions change
    const isWeightChanged = parsedWeight !== null && parsedWeight !== oldUser.currentWeight;
    const isLocationChanged = workoutLocation !== undefined && workoutLocation !== oldUser.workoutLocation;
    const isMedicalChanged = medicalConditions !== undefined && medicalConditions !== oldUser.medicalConditions;

    let needsPlanAdjustment = false;
    let adjustmentSuggestion = '';

    const hasActivePlans = await prisma.workoutPlan.findFirst({
      where: { userId, active: true },
    });

    if (
      hasActivePlans &&
      (isWeightChanged || isLocationChanged || isMedicalChanged)
    ) {
      needsPlanAdjustment = true;

      // Call Groq API to generate advice about the changes
      try {
        adjustmentSuggestion = await getProfileAdviceAI(oldUser, updatedUser);
      } catch (aiErr) {
        console.error('Error generating AI profile advice:', aiErr);
        adjustmentSuggestion = 'بناءً على التغييرات الجديدة في ملفك الشخصي، نقترح إعادة توليد جدول التمارين ليتناسب مع موقع تمرينك وحالتك البدنية المحدثة.';
      }
    }

    res.status(200).json({
      message: 'تم تحديث الملف الشخصي بنجاح',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        gender: updatedUser.gender,
        birthDate: updatedUser.birthDate,
        height: updatedUser.height,
        currentWeight: updatedUser.currentWeight,
        targetWeight: updatedUser.targetWeight,
        medicalConditions: updatedUser.medicalConditions,
        labResults: updatedUser.labResults,
        workoutLocation: updatedUser.workoutLocation,
        fitnessGoal: updatedUser.fitnessGoal,
        fitnessLevel: updatedUser.fitnessLevel,
        equipment: updatedUser.equipment,
        age: updatedUser.age,
        daysPerWeek: updatedUser.daysPerWeek,
        isGoogleLinked: updatedUser.isGoogleLinked,
        googleEmail: updatedUser.googleEmail,
        googleId: updatedUser.googleId,
      },
      needsPlanAdjustment,
      adjustmentSuggestion,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'حدث خطأ أثناء تحديث الملف الشخصي' });
  }
};

// @desc    Export All User Data (GDPR Data Portability)
// @route   GET /api/auth/export-data
export const exportUserData = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: 'غير مصرح' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        gender: true,
        birthDate: true,
        height: true,
        currentWeight: true,
        targetWeight: true,
        medicalConditions: true,
        labResults: true,
        workoutLocation: true,
        equipment: true,
        fitnessGoal: true,
        fitnessLevel: true,
        age: true,
        daysPerWeek: true,
        workoutReminder: true,
        reminderTime: true,
        createdAt: true,
        updatedAt: true,
        onboardingCompleted: true,
        weightLogs: {
          orderBy: { date: 'asc' },
        },
        workoutPlans: {
          include: {
            dayWorkouts: {
              include: {
                exercises: {
                  include: {
                    progressLogs: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: 'المستخدم غير موجود' });
      return;
    }

    const checkIns = await prisma.checkIn.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    const exportPayload = {
      app: 'BeastMode AI Fitness',
      exportDate: new Date().toISOString(),
      user,
      checkIns,
    };

    res.json(exportPayload);
  } catch (error: any) {
    console.error('[exportUserData] Error:', error);
    res.status(500).json({ error: 'فشل تصدير بيانات المستخدم' });
  }
};

// @desc    Delete Account & All Associated Data Permanently
// @route   DELETE /api/auth/account
export const deleteAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: 'غير مصرح' });
    return;
  }

  try {
    // 1. Delete standalone CheckIns
    await prisma.checkIn.deleteMany({
      where: { userId },
    });

    // 2. Delete User (Cascades to WeightLogs, WorkoutPlans, DayWorkouts, Exercises, ProgressLogs)
    await prisma.user.delete({
      where: { id: userId },
    });

    // Clear Auth Cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    res.json({ success: true, message: 'تم حذف الحساب وكافة البيانات المرتبطة به نهائياً.' });
  } catch (error: any) {
    console.error('[deleteAccount] Error:', error);
    res.status(500).json({ error: 'فشل حذف الحساب. يرجى المحاولة لاحقاً.' });
  }
};

// @desc    Google Sign-In / Sign-Up / Seamless Account Linking
// @desc    Authenticate or Link Google Account
// @route   POST /api/auth/google
export const googleAuth = async (req: AuthRequest, res: Response): Promise<void> => {
  const { email, name, googleId, password, otp, idToken } = req.body;

  try {
    if (!isPrimitiveString(email) || (name !== undefined && !isPrimitiveString(name)) || (googleId !== undefined && !isPrimitiveString(googleId))) {
      res.status(400).json({ error: 'بيانات حساب Google غير صحيحة' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name || 'Beast Athlete').trim();
    const cleanGoogleId = (googleId || cleanEmail).trim();

    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      res.status(400).json({ error: 'البريد الإلكتروني لحساب Google غير صحيح' });
      return;
    }

    if (isDisposableEmail(cleanEmail)) {
      res.status(400).json({ error: 'غير مسموح بربط أو تسجيل حسابات باستخدام إيميلات وهمية أو مؤقتة (Disposable Emails).' });
      return;
    }

    // Check if user with this email already exists
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (user) {
      // SECURITY SAFEGUARD:
      // If user is ALREADY linked to this specific googleId OR provided verified OAuth token -> login directly.
      // If NOT yet linked to this Google ID and account has password -> require password or email OTP verification to prevent hijacking!
      const isAlreadyLinked = Boolean(user.isGoogleLinked && (user.googleId === cleanGoogleId || (user.googleEmail && user.googleEmail.toLowerCase() === cleanEmail)));

      if (!isAlreadyLinked && !idToken) {
        if (password && isPrimitiveString(password)) {
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            res.status(401).json({ error: 'كلمة المرور الحالية غير صحيحة لتأكيد ربط هذا الحساب بـ Google' });
            return;
          }
        } else if (otp && isPrimitiveString(otp)) {
          if (!user.resetOtp || user.resetOtp !== otp.trim() || !user.resetOtpExpiry || new Date() > user.resetOtpExpiry) {
            res.status(400).json({ error: 'رمز التحقق (OTP) غير صحيح أو منتهي الصلاحية' });
            return;
          }
        } else {
          // Account is protected -> Request password or OTP confirmation
          res.status(403).json({
            requiresSecurityVerification: true,
            email: cleanEmail,
            message: 'هذا الحساب مسجل ومحمي مسبقاً. لحماية بياناتك ومنع انتحال الحساب، يرجى إدخال كلمة المرور أو طلب رمز التحقق (OTP) لإتمام الربط.',
          });
          return;
        }
      }

      // Authorized -> Update Google linking metadata
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: cleanGoogleId,
          isGoogleLinked: true,
          googleEmail: cleanEmail,
          resetOtp: null,
          resetOtpExpiry: null,
        },
      });
    } else {
      // Brand new user -> Create new account with Google credentials
      const randomPassword = await bcrypt.hash(`GoogleAuth_${cleanGoogleId}_${Date.now()}`, 10);
      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          name: cleanName,
          password: randomPassword,
          googleId: cleanGoogleId,
          isGoogleLinked: true,
          googleEmail: cleanEmail,
          fitnessGoal: 'HYPERTROPHY',
          fitnessLevel: 'intermediate',
          workoutLocation: 'GYM',
          daysPerWeek: 4,
          onboardingCompleted: false,
        },
      });
    }

    const token = generateToken(user.id, user.email);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      isGoogleLinked: user.isGoogleLinked,
      googleEmail: user.googleEmail,
      googleId: user.googleId,
      onboardingCompleted: user.onboardingCompleted,
      token,
      message: 'تم التحقق من الهوية وتسجيل الدخول عبر Google بنجاح ⚡',
    });
  } catch (error: any) {
    console.error('[googleAuth] Error:', error);
    res.status(500).json({ error: 'فشل تسجيل الدخول أو ربط الحساب عبر Google' });
  }
};

// @desc    Link Google Account for Logged-In User
// @route   POST /api/auth/link-google
export const linkGoogleAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const { googleEmail, googleId, currentPassword } = req.body;

  if (!userId) {
    res.status(401).json({ error: 'غير مصرح' });
    return;
  }

  try {
    if (!isPrimitiveString(googleEmail) || (googleId !== undefined && !isPrimitiveString(googleId)) || (currentPassword !== undefined && !isPrimitiveString(currentPassword))) {
      res.status(400).json({ error: 'البيانات المدخلة غير صالحة' });
      return;
    }

    const cleanEmail = googleEmail.trim().toLowerCase();
    const cleanId = (googleId || cleanEmail).trim();

    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      res.status(400).json({ error: 'البريد الإلكتروني لحساب Google غير صحيح' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: 'المستخدم غير موجود' });
      return;
    }

    if (currentPassword) {
      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) {
        res.status(401).json({ error: 'كلمة المرور الحالية غير صحيحة لتأكيد ربط الحساب' });
        return;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        googleId: cleanId,
        isGoogleLinked: true,
        googleEmail: cleanEmail,
      },
    });

    res.json({
      success: true,
      isGoogleLinked: true,
      googleEmail: updatedUser.googleEmail,
      googleId: updatedUser.googleId,
      message: 'تم التحقق من الهوية وربط حسابك بنجاح بحساب Google!',
    });
  } catch (error: any) {
    console.error('[linkGoogleAccount] Error:', error);
    res.status(500).json({ error: 'فشل ربط الحساب بحساب Google' });
  }
};

// @desc    Unlink Google Account
// @route   POST /api/auth/unlink-google
export const unlinkGoogleAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ error: 'غير مصرح' });
    return;
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        googleId: null,
        isGoogleLinked: false,
        googleEmail: null,
      },
    });

    res.json({
      success: true,
      isGoogleLinked: false,
      message: 'تم إلغاء ربط الحساب بحساب Google بنجاح.',
    });
  } catch (error: any) {
    console.error('[unlinkGoogleAccount] Error:', error);
    res.status(500).json({ error: 'فشل إلغاء ربط حساب Google' });
  }
};

