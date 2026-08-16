import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../services/db';
import { AuthRequest } from '../middleware/auth';
import { getProfileAdviceAI } from '../services/aiService';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('[Auth] JWT_SECRET environment variable is not set!');

// Generates JWT Token
const generateToken = (id: number, email: string) => {
  return jwt.sign({ id, email }, JWT_SECRET, { expiresIn: '30d' });
};

// Input Validation Helpers
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// @desc    Register a new user
// @route   POST /api/auth/register
export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, email, password } = req.body;

  try {
    // 1. Sanitization
    const cleanName = (name || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanName || !cleanEmail || !cleanPassword) {
      res.status(400).json({ error: 'الرجاء إدخال الاسم، البريد الإلكتروني وكلمة المرور' });
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      res.status(400).json({ error: 'صيغة البريد الإلكتروني غير صحيحة' });
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
    // 1. Sanitization
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

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

