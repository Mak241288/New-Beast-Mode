import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../services/db';
import { AuthRequest } from '../middleware/auth';
import { getProfileAdviceAI } from '../services/aiService';

const JWT_SECRET = process.env.JWT_SECRET || 'beastmode_super_secret_jwt_key_2026_fitness_nutrition';

// Generates JWT Token
const generateToken = (id: number, email: string) => {
  return jwt.sign({ id, email }, JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new user
// @route   POST /api/auth/register
export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      res.status(400).json({ error: 'الرجاء إدخال الاسم، البريد الإلكتروني وكلمة المرور' });
      return;
    }

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      res.status(400).json({ error: 'البريد الإلكتروني مسجل بالفعل' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user.id, user.email),
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
    if (!email || !password) {
      res.status(400).json({ error: 'الرجاء إدخال البريد الإلكتروني وكلمة المرور' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(400).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
      return;
    }

    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user.id, user.email),
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
